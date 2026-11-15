import "server-only";
import sql from "mssql";
import { DatabaseError } from "./errors";

export async function withTransaction<T>(
  pool: sql.ConnectionPool,
  work: (transaction: sql.Transaction) => Promise<T>,
  isolation: sql.IIsolationLevel = sql.ISOLATION_LEVEL.READ_COMMITTED,
): Promise<T> {
  const transaction = pool.transaction();
  let started = false;
  let rolledBack = false;
  transaction.on("rollback", () => { rolledBack = true; });
  try {
    await transaction.begin(isolation);
    started = true;
    const result = await work(transaction);
    await transaction.commit();
    return result;
  } catch (error) {
    if (started && !rolledBack) {
      try { await transaction.rollback(); }
      catch { throw new DatabaseError("DB_ROLLBACK_FAILED"); }
    }
    if (error instanceof DatabaseError) throw error;
    throw new DatabaseError("DB_TRANSACTION_FAILED");
  }
}
