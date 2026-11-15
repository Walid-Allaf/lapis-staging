import "server-only";

export type DatabaseErrorCode =
  | "DB_CONFIG_INVALID" | "DB_CONNECTION_FAILED" | "DB_QUERY_FAILED"
  | "DB_TRANSACTION_FAILED" | "DB_ROLLBACK_FAILED" | "DB_SHUTDOWN_FAILED"
  | "DB_OPERATION_NOT_ALLOWED" | "DB_LOCK_UNAVAILABLE"
  | "DB_MIGRATION_INVALID" | "DB_MIGRATION_DRIFT" | "DB_MIGRATION_BLOCKED"
  | "DB_MIGRATION_FAILED" | "DB_SCHEMA_UNOWNED";

// Deliberately exclude driver messages, SQL text, parameters and connection config.
export class DatabaseError extends Error {
  constructor(public readonly code: DatabaseErrorCode) {
    super(code);
    this.name = "DatabaseError";
  }
}

export function databaseErrorCode(error: unknown): DatabaseErrorCode {
  return error instanceof DatabaseError ? error.code : "DB_QUERY_FAILED";
}
