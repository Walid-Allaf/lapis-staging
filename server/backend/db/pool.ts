import "server-only";
import sql from "mssql";
import { readDatabaseConfig } from "../config";
import { DatabaseError } from "./errors";

// Temporary, server-only diagnostics. Never serialize driver objects or messages.
const diagnosticCodes = new Set([
  "ELOGIN", "ETIMEOUT", "ESOCKET", "ENOTFOUND", "EAI_AGAIN", "ECONNREFUSED", "ECONNRESET",
  "EHOSTUNREACH", "ENETUNREACH", "ECONNCLOSED", "ENOCONN", "ENOTOPEN",
  "ERR_TLS_CERT_ALTNAME_INVALID", "CERT_HAS_EXPIRED", "CERT_NOT_YET_VALID",
  "DEPTH_ZERO_SELF_SIGNED_CERT", "SELF_SIGNED_CERT_IN_CHAIN", "UNABLE_TO_VERIFY_LEAF_SIGNATURE",
  "UNABLE_TO_GET_ISSUER_CERT_LOCALLY", "CERT_SIGNATURE_FAILURE",
  "ERR_SSL_UNSUPPORTED_PROTOCOL", "ERR_SSL_WRONG_VERSION_NUMBER",
]);

export function createSqlDiagnosticLogger(
  env: Readonly<Record<string, string | undefined>> = process.env,
  write: (entry: string) => void = entry => console.error(entry),
  now: () => number = () => performance.now(),
) {
  let lastLogged = -Infinity;
  return (phase: "connect" | "pool", error: unknown, config: sql.config): void => {
    if (env.SQL_DIAGNOSTICS !== "true") return;
    try {
      const time = now();
      if (time - lastLogged < 60_000) return;
      lastLogged = time; // One diagnostic per minute across connection/pool errors for this manager.
      const codes = new Set<string>();
      const pending: Array<{ value: unknown; depth: number }> = [{ value: error, depth: 0 }];
      const seen = new Set<object>();
      // Only data properties on known error links; no getters, messages, stacks or arbitrary traversal.
      const own = (value: object, key: string): unknown => Object.getOwnPropertyDescriptor(value, key)?.value;
      for (let visited = 0; pending.length && visited < 16; visited++) {
        const { value, depth } = pending.shift()!;
        if (!value || typeof value !== "object" || seen.has(value)) continue;
        seen.add(value);
        const code = own(value, "code");
        if (typeof code === "string" && diagnosticCodes.has(code)) codes.add(code);
        if (depth >= 3) continue;
        for (const key of ["cause", "originalError"]) pending.push({ value: own(value, key), depth: depth + 1 });
        const errors = own(value, "errors");
        if (Array.isArray(errors)) {
          for (let i = 0; i < Math.min(errors.length, 4); i++) pending.push({ value: own(errors, String(i)), depth: depth + 1 });
        }
      }
      write(JSON.stringify({
        event: "database_connection_diagnostic", phase, codes: codes.size ? [...codes] : ["UNKNOWN"],
        matches: {
          production: env.SQL_ENV === "production", server: config.server === "db80150.databaseasp.net",
          port: config.port === 1433, database: config.database === "db80150", user: config.user === "db80150",
          encrypt: config.options?.encrypt === true, certificateValidation: config.options?.trustServerCertificate === false,
          passwordPresent: typeof config.password === "string" && Boolean(config.password.trim()),
        },
      }));
    } catch { /* Diagnostics must never change connection/error handling or expose a fallback exception. */ }
  };
}

export class PoolManager {
  private pool: sql.ConnectionPool | undefined;
  private connecting: Promise<sql.ConnectionPool> | undefined;
  private closing: Promise<void> | undefined;

  constructor(
    private readonly configuration = readDatabaseConfig,
    private readonly factory = (config: sql.config) => new sql.ConnectionPool(config),
    private readonly diagnose = createSqlDiagnosticLogger(),
  ) {}

  async get(): Promise<sql.ConnectionPool> {
    if (this.closing) await this.closing;
    if (this.pool?.connected) return this.pool;
    if (this.connecting) return this.connecting;
    const config = this.configuration().sql;
    const pool = this.factory(config);
    this.pool = pool;
    pool.on("error", error => {
      this.diagnose("pool", error, config);
      console.error(JSON.stringify({ event: "database_pool_error", code: "DB_CONNECTION_FAILED" }));
    });
    this.connecting = (async () => {
      try { return await pool.connect(); }
      catch (error) {
        this.diagnose("connect", error, config);
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
