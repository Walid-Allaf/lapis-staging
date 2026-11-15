import "server-only";
import sql from "mssql";
import { assertDatabaseWriteAllowed, readDatabaseConfig, type Environment } from "../config";
import { DatabaseError } from "./errors";
import { acquireApplicationLock, assertApplicationLock } from "./lock";
import { loadMigrations, type Migration } from "./migration-catalog";
import { migrationStatus, readHistory } from "./migration-history";
import { query } from "./parameters";
import { withTransaction } from "./transaction";
import { verifyWriteTarget } from "./write-target";
import { assertProductionMaintenance, verifyProductionMaintenance } from "./production-maintenance";

async function initializeHistory(pool: sql.ConnectionPool): Promise<void> {
  if (await readHistory(pool) !== null) return;
  await withTransaction(pool, async transaction => {
    const objects = await query<{ count: number }>(transaction, "SELECT COUNT(*) AS count FROM sys.tables WHERE is_ms_shipped=0;");
    if (objects.recordset[0].count) throw new DatabaseError("DB_SCHEMA_UNOWNED");
    // Never adopt an existing application's tables into a new migration history.
    await new sql.Request(transaction).batch(`
      IF EXISTS (SELECT 1 FROM sys.tables WHERE is_ms_shipped=0)
        THROW 51000, 'Database is not empty or managed by LAPiS', 1;
      CREATE TABLE dbo.SchemaMigrations (
        Version INT NOT NULL CONSTRAINT PK_SchemaMigrations PRIMARY KEY,
        Name NVARCHAR(200) NOT NULL,
        Checksum BINARY(32) NOT NULL,
        Status NVARCHAR(16) NOT NULL CONSTRAINT CK_SchemaMigrations_Status CHECK (Status IN (N'running',N'applied',N'failed')),
        StartedAtUtc DATETIME2(7) NOT NULL,
        AppliedAtUtc DATETIME2(7) NULL,
        DurationMs INT NULL,
        ErrorCode NVARCHAR(60) NULL
      );
      EXEC sys.sp_addextendedproperty @name=N'LAPiS.Foundation', @value=N'2',
        @level0type=N'SCHEMA', @level0name=N'dbo', @level1type=N'TABLE', @level1name=N'SchemaMigrations';`);
  });
}

export async function migrateDatabase(
  pool: sql.ConnectionPool,
  options: { env?: Environment; directory?: string } = {},
): Promise<{ applied: number; total: number }> {
  const env = options.env ?? process.env;
  const production = env.SQL_ENV === "production";
  if (production) {
    assertProductionMaintenance("migrate", env);
    if (options.directory) throw new DatabaseError("DB_OPERATION_NOT_ALLOWED");
  } else {
    assertDatabaseWriteAllowed("migrate", env);
    await verifyWriteTarget(pool, "migrate", env);
  }
  if ((readDatabaseConfig(env).sql.pool?.max ?? 3) < 2) throw new DatabaseError("DB_CONFIG_INVALID");
  const migrations = await loadMigrations(options.directory);
  // One connection owns a transaction-scoped lock, a second runs each DDL transaction.
  // This holds the same database-wide lock across bootstrap, commits and failure logging.
  return withTransaction(pool, async lockTransaction => {
    await acquireApplicationLock(lockTransaction, "LAPiS:foundation:migrations");
    if (production) await verifyProductionMaintenance(lockTransaction, "migrate", env);
    await initializeHistory(pool);
    const status = await migrationStatus(pool, migrations);
    if (status.state === "drift") throw new DatabaseError("DB_MIGRATION_DRIFT");
    if (status.state === "blocked") throw new DatabaseError("DB_MIGRATION_BLOCKED");
    const rows = await readHistory(pool);
    const applied = new Set(rows?.map(row => row.Version));
    let count = 0;
    for (const migration of migrations) {
      if (applied.has(migration.version)) continue;
      // Do not continue to another file if the lock-owning SQL session was lost.
      await assertApplicationLock(lockTransaction, "LAPiS:foundation:migrations");
      await applyMigration(pool, migration);
      count++;
    }
    return { applied: count, total: migrations.length };
  });
}

async function applyMigration(pool: sql.ConnectionPool, migration: Migration): Promise<void> {
  const parameters = [
    { name: "version", type: sql.Int(), value: migration.version },
    { name: "name", type: sql.NVarChar(200), value: migration.name },
    { name: "checksum", type: sql.VarBinary(32), value: Buffer.from(migration.checksum, "hex") },
  ];
  // Committed intent survives termination. 'running'/'failed' are NEVER auto-retried.
  await query(pool, `INSERT INTO dbo.SchemaMigrations (Version,Name,Checksum,Status,StartedAtUtc)
    VALUES (@version,@name,@checksum,N'running',SYSUTCDATETIME());`, parameters);
  const started = Date.now();
  try {
    await withTransaction(pool, async transaction => {
      await new sql.Request(transaction).batch(migration.text);
      await query(transaction, `UPDATE dbo.SchemaMigrations SET Status=N'applied',
        AppliedAtUtc=SYSUTCDATETIME(),DurationMs=@duration WHERE Version=@version AND Status=N'running';`, [
        parameters[0], { name: "duration", type: sql.Int(), value: Math.min(Date.now() - started, 2147483647) },
      ]);
    });
  } catch {
    // A failed attempt to record failure leaves 'running', which also blocks reruns.
    await query(pool, `UPDATE dbo.SchemaMigrations SET Status=N'failed',ErrorCode=N'DB_MIGRATION_FAILED'
      WHERE Version=@version AND Status=N'running';`, [parameters[0]]).catch(() => undefined);
    throw new DatabaseError("DB_MIGRATION_FAILED");
  }
}
