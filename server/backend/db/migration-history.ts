import "server-only";
import sql from "mssql";
import type { Migration } from "./migration-catalog";
import { query } from "./parameters";
import { DatabaseError } from "./errors";

export interface MigrationHistoryRow {
  Version: number;
  Name: string;
  Checksum: Buffer;
  Status: "running" | "applied" | "failed";
}
export type MigrationState = "uninitialized" | "current" | "pending" | "blocked" | "drift";
export interface MigrationStatus {
  state: MigrationState;
  applied: number;
  pending: number;
  latestApplied: number;
}

export function inspectHistory(migrations: readonly Migration[], rows: readonly MigrationHistoryRow[] | null): MigrationStatus {
  if (rows === null) return { state: "uninitialized", applied: 0, pending: migrations.length, latestApplied: 0 };
  let state: MigrationState = "current";
  const applied = rows.filter(row => row.Status === "applied");
  const versions = new Set<number>();
  for (const row of rows) {
    const original = migrations.find(migration => migration.version === row.Version);
    if (versions.has(row.Version) || !original || original.name !== row.Name || original.checksum !== Buffer.from(row.Checksum).toString("hex")) {
      state = "drift"; break;
    }
    versions.add(row.Version);
    if (row.Status !== "applied") state = "blocked";
  }
  const ordered = [...applied].sort((a, b) => a.Version - b.Version);
  if (ordered.some((row, index) => row.Version !== index + 1)) state = "drift";
  const pending = migrations.length - applied.length;
  if (state === "current" && pending) state = "pending";
  return { state, applied: applied.length, pending, latestApplied: ordered.at(-1)?.Version ?? 0 };
}

export async function readHistory(executor: sql.ConnectionPool | sql.Transaction): Promise<MigrationHistoryRow[] | null> {
  const exists = await query<{ present: number; owned: number }>(executor, `
    SELECT CASE WHEN OBJECT_ID(N'dbo.SchemaMigrations', N'U') IS NULL THEN 0 ELSE 1 END AS present,
      CASE WHEN EXISTS (SELECT 1 FROM sys.extended_properties
        WHERE major_id=OBJECT_ID(N'dbo.SchemaMigrations') AND minor_id=0
        AND name=N'LAPiS.Foundation' AND CONVERT(NVARCHAR(20),value)=N'2') THEN 1 ELSE 0 END AS owned;`);
  if (!exists.recordset[0]?.present) return null;
  if (!exists.recordset[0].owned) throw new DatabaseError("DB_SCHEMA_UNOWNED");
  return (await query<MigrationHistoryRow>(executor,
    "SELECT Version, Name, Checksum, Status FROM dbo.SchemaMigrations ORDER BY Version;")).recordset;
}

export async function migrationStatus(executor: sql.ConnectionPool | sql.Transaction, migrations: readonly Migration[]): Promise<MigrationStatus> {
  return inspectHistory(migrations, await readHistory(executor));
}
