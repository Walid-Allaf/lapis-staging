import "server-only";
import sql from "mssql";
import { assertDatabaseWriteAllowed, type Environment } from "../config";
import { DatabaseError } from "./errors";
import { acquireApplicationLock } from "./lock";
import { loadMigrations } from "./migration-catalog";
import { migrationStatus } from "./migration-history";
import { query } from "./parameters";
import { withTransaction } from "./transaction";
import { verifyWriteTarget } from "./write-target";

export async function seedDevelopment(pool: sql.ConnectionPool, env: Environment = process.env): Promise<{ applied: boolean; domainData: "deferred" }> {
  assertDatabaseWriteAllowed("seed", env);
  await verifyWriteTarget(pool, "seed", env);
  const migrations = await loadMigrations();
  return withTransaction(pool, async transaction => {
    await acquireApplicationLock(transaction, "LAPiS:foundation:migrations");
    if ((await migrationStatus(transaction, migrations)).state !== "current") throw new DatabaseError("DB_MIGRATION_BLOCKED");
    // Infrastructure-only marker. No invented roles, users, passwords or content.
    const result = await query<{ applied: boolean }>(transaction, `
      IF NOT EXISTS (SELECT 1 FROM dbo.DevelopmentSeedHistory WITH (UPDLOCK,HOLDLOCK) WHERE SeedKey=@key)
      BEGIN
        INSERT INTO dbo.DevelopmentSeedHistory (SeedKey,AppliedAtUtc) VALUES (@key,SYSUTCDATETIME());
        SELECT CAST(1 AS BIT) AS applied;
      END
      ELSE SELECT CAST(0 AS BIT) AS applied;`, [
      { name: "key", type: sql.NVarChar(100), value: "foundation-v1" },
    ]);
    return { applied: result.recordset[0].applied, domainData: "deferred" };
  });
}
