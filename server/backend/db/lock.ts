import "server-only";
import sql from "mssql";
import { query } from "./parameters";
import { DatabaseError } from "./errors";

export async function acquireApplicationLock(transaction: sql.Transaction, resource: string, timeout = 0): Promise<void> {
  const result = await query<{ result: number }>(transaction, `
    DECLARE @result INT;
    EXEC @result = sys.sp_getapplock @Resource=@resource, @LockMode='Exclusive',
      @LockOwner='Transaction', @LockTimeout=@timeout, @DbPrincipal='public';
    SELECT @result AS result;`, [
    { name: "resource", type: sql.NVarChar(255), value: resource },
    { name: "timeout", type: sql.Int(), value: timeout },
  ]);
  if (!result.recordset[0] || result.recordset[0].result < 0) throw new DatabaseError("DB_LOCK_UNAVAILABLE");
}

export async function assertApplicationLock(transaction: sql.Transaction, resource: string): Promise<void> {
  try {
    const result = await query<{ mode: string }>(transaction,
      "SELECT APPLOCK_MODE(N'public',@resource,N'Transaction') AS mode;",
      [{ name: "resource", type: sql.NVarChar(255), value: resource }]);
    if (result.recordset[0]?.mode !== "Exclusive") throw new DatabaseError("DB_LOCK_UNAVAILABLE");
  } catch { throw new DatabaseError("DB_LOCK_UNAVAILABLE"); }
}
