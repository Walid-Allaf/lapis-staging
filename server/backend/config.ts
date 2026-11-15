import "server-only";
import type { config as SqlConfig } from "mssql";
import { DatabaseError } from "./db/errors";

export type DatabaseEnvironment = "development" | "test" | "production";
export interface DatabaseConfig {
  environment: DatabaseEnvironment;
  sql: SqlConfig;
}
export type Environment = Readonly<Record<string, string | undefined>>;

function invalid(): never { throw new DatabaseError("DB_CONFIG_INVALID"); }
function required(env: Environment, key: string): string {
  const value = env[key];
  if (!value || !value.trim()) return invalid();
  return value;
}
function integer(env: Environment, key: string, fallback: number, min: number, max: number): number {
  const raw = env[key];
  if (raw === undefined) return fallback;
  if (!/^\d+$/.test(raw)) return invalid();
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < min || value > max) return invalid();
  return value;
}
function boolean(env: Environment, key: string, fallback: boolean): boolean {
  const raw = env[key];
  if (raw === undefined) return fallback;
  if (raw !== "true" && raw !== "false") return invalid();
  return raw === "true";
}

export function readDatabaseConfig(env: Environment = process.env): DatabaseConfig {
  const environment = required(env, "SQL_ENV");
  if (!["development", "test", "production"].includes(environment)) return invalid();
  const encrypt = boolean(env, "SQL_ENCRYPT", true);
  const trust = boolean(env, "SQL_TRUST_SERVER_CERTIFICATE", false);
  // No automatic fallback to insecure TLS after a failed connection.
  if (environment === "production" && (!encrypt || trust)) return invalid();
  return {
    environment: environment as DatabaseEnvironment,
    sql: {
      server: required(env, "SQL_SERVER"),
      port: integer(env, "SQL_PORT", 1433, 1, 65535),
      database: required(env, "SQL_DATABASE"),
      user: required(env, "SQL_USER"),
      password: required(env, "SQL_PASSWORD"),
      connectionTimeout: integer(env, "SQL_CONNECT_TIMEOUT_MS", 5000, 500, 30000),
      requestTimeout: integer(env, "SQL_REQUEST_TIMEOUT_MS", 15000, 1000, 120000),
      pool: {
        min: 0,
        max: integer(env, "SQL_POOL_MAX", 3, 1, 10),
        idleTimeoutMillis: 30000,
        acquireTimeoutMillis: 10000,
      },
      options: {
        encrypt,
        trustServerCertificate: trust,
        abortTransactionOnError: true,
        useUTC: true,
        enableArithAbort: true,
        appName: "LAPiS-Foundation",
      },
    },
  };
}

export function assertDatabaseWriteAllowed(operation: "migrate" | "seed" | "test", env: Environment = process.env): void {
  const config = readDatabaseConfig(env);
  const allowedKey = { migrate: "SQL_ALLOW_MIGRATIONS", seed: "SQL_ALLOW_SEED", test: "SQL_ALLOW_TESTS" }[operation];
  if (config.environment === "production" || env[allowedKey] !== "true" ||
      env.SQL_EXPECT_DATABASE !== config.sql.database ||
      ["master", "model", "msdb", "tempdb"].includes(String(config.sql.database).toLowerCase())) {
    throw new DatabaseError("DB_OPERATION_NOT_ALLOWED");
  }
  if (operation === "test" && (config.environment !== "test" || !/^lapis_test_[a-f0-9]{16}$/.test(String(config.sql.database)))) {
    throw new DatabaseError("DB_OPERATION_NOT_ALLOWED");
  }
}
