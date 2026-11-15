import "server-only";
import sql from "mssql";
import { readDatabaseConfig } from "../config";
import { DatabaseError } from "./errors";

export class PoolManager {
  private pool: sql.ConnectionPool | undefined;
  private connecting: Promise<sql.ConnectionPool> | undefined;
  private closing: Promise<void> | undefined;

  constructor(
    private readonly configuration = readDatabaseConfig,
    private readonly factory = (config: sql.config) => new sql.ConnectionPool(config),
  ) {}

  async get(): Promise<sql.ConnectionPool> {
    if (this.closing) await this.closing;
    if (this.pool?.connected) return this.pool;
    if (this.connecting) return this.connecting;
    const pool = this.factory(this.configuration().sql);
    this.pool = pool;
    pool.on("error", () => {
      console.error(JSON.stringify({ event: "database_pool_error", code: "DB_CONNECTION_FAILED" }));
    });
    this.connecting = (async () => {
      try { return await pool.connect(); }
      catch {
        if (this.pool === pool) this.pool = undefined;
        await pool.close().catch(() => undefined);
        throw new DatabaseError("DB_CONNECTION_FAILED");
      } finally { this.connecting = undefined; }
    })();
    return this.connecting;
  }

  async close(): Promise<void> {
    if (this.closing) return this.closing;
    this.closing = (async () => {
      try {
        if (this.connecting) await this.connecting.catch(() => undefined);
        await this.pool?.close();
      } catch { throw new DatabaseError("DB_SHUTDOWN_FAILED"); }
      finally { this.pool = undefined; }
    })();
    try { await this.closing; } finally { this.closing = undefined; }
  }
}

// Survives development reloads; each deployed Node worker has its own bounded pool.
const state = globalThis as typeof globalThis & { __lapisSqlPool?: PoolManager };
const manager = state.__lapisSqlPool ??= new PoolManager();
export const getPool = () => manager.get();
// Use on CLI shutdown/tests, never at the end of an HTTP request.
export const closePool = () => manager.close();
