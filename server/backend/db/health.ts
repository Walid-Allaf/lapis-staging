import "server-only";
import { databaseErrorCode } from "./errors";
import { getPool } from "./pool";
import { query } from "./parameters";
import { loadMigrations } from "./migration-catalog";
import { migrationStatus } from "./migration-history";

export async function databaseHealth(dependencies = { getPool, query, loadMigrations, migrationStatus }) {
  let connected = false;
  try {
    const pool = await dependencies.getPool();
    await dependencies.query(pool, "SELECT 1 AS available;");
    connected = true;
    const status = await dependencies.migrationStatus(pool, await dependencies.loadMigrations());
    return { status: status.state === "current" ? "ok" : "degraded", application: "available",
      database: "up", migrations: status.state } as const;
  } catch (error) {
    return { status: "degraded", application: "available",
      database: connected ? "up" : databaseErrorCode(error) === "DB_CONFIG_INVALID" ? "not_configured" : "unavailable",
      migrations: "unavailable" } as const;
  }
}
