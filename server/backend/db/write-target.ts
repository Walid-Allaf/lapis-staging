import "server-only";
import type sql from "mssql";
import { assertDatabaseWriteAllowed, type Environment } from "../config";
import { DatabaseError } from "./errors";
import { query } from "./parameters";

export async function verifyWriteTarget(pool: sql.ConnectionPool, operation: "migrate" | "seed" | "test", env: Environment): Promise<void> {
  assertDatabaseWriteAllowed(operation, env);
  const result = await query<{ name: string }>(pool, "SELECT DB_NAME() AS name;");
  if (result.recordset[0]?.name !== env.SQL_EXPECT_DATABASE) {
    throw new DatabaseError("DB_OPERATION_NOT_ALLOWED");
  }
}
