import "server-only";
import type sql from "mssql";
import { createHash } from "node:crypto";
import { lstat, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { readDatabaseConfig, type Environment } from "../config";
import { DatabaseError } from "./errors";
import { query } from "./parameters";
import { loadMigrations } from "./migration-catalog";
import { migrationStatus, readHistory } from "./migration-history";
import { assertApplicationLock } from "./lock";

export type MaintenanceOperation = "migrate" | "initialize" | "bootstrap";
type Executor = sql.ConnectionPool | sql.Transaction;
const deny = (): never => { throw new DatabaseError("DB_OPERATION_NOT_ALLOWED"); };
const digest = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const operations = ["migrate", "initialize", "bootstrap"];

export function assertProductionMaintenance(operation: MaintenanceOperation, env: Environment): void {
  const config = readDatabaseConfig(env);
  if (config.environment !== "production" || !operations.includes(operation) || env.SQL_MAINTENANCE_ALLOW !== "true" ||
    env.SQL_MAINTENANCE_OPERATION !== operation || env.SQL_EXPECT_DATABASE !== config.sql.database ||
    env.SQL_MAINTENANCE_CONFIRM !== `APPLY:${operation}:${config.sql.database}` ||
    env[operation === "migrate" ? "SQL_ALLOW_MIGRATIONS" : "SQL_ALLOW_SEED"] !== "true" ||
    ["master", "model", "msdb", "tempdb"].includes(String(config.sql.database).toLowerCase()) ||
    !/^[a-f0-9]{64}$/.test(env.SQL_MAINTENANCE_PLAN_SHA256 ?? "")) deny();
}

function privatePath(filename: string | undefined): string {
  if (!filename || !path.isAbsolute(filename)) return deny();
  const relative = path.relative(process.cwd(), filename);
  if (!relative || (!relative.startsWith(".." + path.sep) && !path.isAbsolute(relative))) return deny();
  return filename;
}
async function readPrivate(filename: string | undefined) {
  const file = privatePath(filename), info = await lstat(file);
  if (!info.isFile() || info.isSymbolicLink() || info.size > 131072 || (process.platform !== "win32" && (info.mode & 0o077))) deny();
  return JSON.parse(await readFile(file, "utf8"));
}

async function snapshot(executor: Executor, env: Environment) {
  readDatabaseConfig(env);
  const target = (await query<{ server: string; database: string; id: number; created: string }>(executor, `SELECT
    CONVERT(NVARCHAR(128),SERVERPROPERTY('ServerName')) AS server, DB_NAME() AS [database], DB_ID() AS id,
    CONVERT(VARCHAR(33),create_date,126) AS created FROM sys.databases WHERE database_id=DB_ID();`)).recordset[0];
  if (!target || target.database !== env.SQL_DATABASE || target.database !== env.SQL_EXPECT_DATABASE ||
    ["master", "model", "msdb", "tempdb"].includes(target.database.toLowerCase())) deny();
  const migrations = await loadMigrations();
  const history = await readHistory(executor);
  const status = await migrationStatus(executor, migrations);
  if (status.state === "drift" || status.state === "blocked") deny();
  const tables = (await query<{ name: string; rows: string }>(executor, `SELECT SCHEMA_NAME(t.schema_id)+N'.'+t.name AS name,
    CONVERT(VARCHAR(20),COALESCE(SUM(p.rows),0)) AS rows FROM sys.tables t
    LEFT JOIN sys.partitions p ON p.object_id=t.object_id AND p.index_id IN (0,1)
    WHERE t.is_ms_shipped=0 GROUP BY t.schema_id,t.name ORDER BY name;`)).recordset;
  if (history === null && tables.length) deny();
  if (env.SQL_MAINTENANCE_OPERATION !== "migrate" && status.state !== "current") deny();
  return { target, targetFingerprint: digest(target), status, tables,
    catalog: migrations.map(({ version, name, checksum }) => ({ version, name, checksum })),
    history: history?.map(row => ({ version: row.Version, name: row.Name, checksum: Buffer.from(row.Checksum).toString("hex"), status: row.Status })) ?? null };
}

export async function previewProductionMaintenance(pool: sql.ConnectionPool, env: Environment = process.env) {
  if (readDatabaseConfig(env).environment !== "production" || !operations.includes(env.SQL_MAINTENANCE_OPERATION ?? "")) deny();
  const state = await snapshot(pool, env);
  const payload = { format: 1, operation: env.SQL_MAINTENANCE_OPERATION, createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 60000).toISOString(), state };
  const plan = { ...payload, sha256: digest(payload) };
  await writeFile(privatePath(env.SQL_MAINTENANCE_PLAN_FILE), JSON.stringify(plan, null, 2) + "\n", { flag: "wx", mode: 0o600 });
  return plan;
}

// Must run while holding the foundation lock, before ANY write (including history creation).
export async function verifyProductionMaintenance(transaction: sql.Transaction, operation: MaintenanceOperation, env: Environment) {
  assertProductionMaintenance(operation, env);
  await assertApplicationLock(transaction, "LAPiS:foundation:migrations");
  const plan = await readPrivate(env.SQL_MAINTENANCE_PLAN_FILE);
  const { sha256, ...payload } = plan;
  if (sha256 !== env.SQL_MAINTENANCE_PLAN_SHA256 || digest(payload) !== sha256 || payload.format !== 1 || payload.operation !== operation ||
    !Number.isFinite(Date.parse(payload.createdAt)) || !Number.isFinite(Date.parse(payload.expiresAt)) ||
    Date.parse(payload.createdAt) > Date.now() || Date.parse(payload.expiresAt) <= Date.now() ||
    Date.parse(payload.expiresAt) - Date.parse(payload.createdAt) !== 30 * 60000) deny();
  const current = await snapshot(transaction, env);
  if (digest(current) !== digest(payload.state)) deny();
  // Backup receipt is an explicit operator attestation, not a claim of physical backup verification.
  const changes = operation !== "migrate" || current.status.pending > 0;
  if (changes && current.tables.length > 0) {
    const backup = await readPrivate(env.SQL_MAINTENANCE_BACKUP_FILE);
    if (backup.targetFingerprint !== current.targetFingerprint || backup.planSha256 !== sha256 || backup.verified !== true ||
      typeof backup.reference !== "string" || !backup.reference.trim() || backup.reference.length > 500 ||
      !Number.isFinite(Date.parse(backup.completedAt)) || Date.parse(backup.completedAt) < Date.parse(payload.createdAt) || Date.parse(backup.completedAt) > Date.now()) deny();
  }
}
