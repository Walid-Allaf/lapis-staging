import "server-only";
import sql from "mssql";
import { createHash, randomUUID } from "node:crypto";
import { query, type SqlParameter } from "../../db/parameters";
import { withTransaction } from "../../db/transaction";
import { acquireApplicationLock } from "../../db/lock";
import { DatabaseError } from "../../db/errors";
import { AuthError, unavailable } from "../../auth/errors";

export type Executor = sql.ConnectionPool | sql.Transaction;
export const text = (name: string, value: unknown): SqlParameter => ({ name, type: sql.NVarChar(sql.MAX), value });
export const binary = (name: string, value: Buffer): SqlParameter => ({ name, type: sql.VarBinary(32), value });
export const integer = (name: string, value: number): SqlParameter => ({ name, type: sql.Int(), value });
export const userKey = (value: string): SqlParameter => ({ name: "userKey", type: sql.BigInt(), value });
export const normalizeEmail = (value: string) => value.normalize("NFKC").trim().toLowerCase();
export const emailHash = (value: string) => createHash("sha256").update(normalizeEmail(value), "utf16le").digest();
export const authStateLock = "LAPiS:auth:state";
export interface UserRow {
  UserKey: string; ExternalId: string; Email: string | null; NormalizedEmail: string | null;
  PasswordHash: string | null; FirstName: string | null; LastName: string | null; PhoneNumber: string | null; Country: string | null;
  RoleCode: string | null; ContractValue: string | null; ContractValueKind: string | null;
  EmailConfirmed: boolean | null; IsDisabled: boolean | null; TwoFactorEnabled: boolean | null; SecurityVersion: number | null;
  FileId: number | null; FilePath: string | null; CreatedAtUtc: Date;
}
export const userProjection = `SELECT CONVERT(VARCHAR(20),u.UserKey) AS UserKey,u.ExternalId,u.Email,u.NormalizedEmail,u.PasswordHash,
  u.FirstName,u.LastName,u.PhoneNumber,u.Country,u.EmailConfirmed,u.IsDisabled,u.TwoFactorEnabled,u.SecurityVersion,u.FileId,u.CreatedAtUtc,
  r.Code AS RoleCode,r.ContractValue,r.ContractValueKind,f.PublicPath AS FilePath
  FROM dbo.Users u LEFT JOIN dbo.Roles r ON r.RoleId=u.RoleId LEFT JOIN dbo.Files f ON f.Id=u.FileId`;

export async function byEmail(executor: Executor, email: string): Promise<UserRow | undefined> {
  const normalized = normalizeEmail(email);
  const rows = (await query<UserRow>(executor, `${userProjection} WHERE u.EmailHash=@hash;`, [binary("hash", emailHash(normalized))])).recordset;
  if (rows.some(row => row.NormalizedEmail !== normalized)) throw unavailable();
  if (rows.length > 1) throw unavailable();
  return rows[0];
}
export async function byId(executor: Executor, id: string): Promise<UserRow | undefined> {
  const rows = (await query<UserRow>(executor, `${userProjection} WHERE u.ExternalIdHash=HASHBYTES('SHA2_256',CONVERT(VARBINARY(MAX),@id));`, [text("id", id)])).recordset;
  if (rows.some(row => row.ExternalId !== id) || rows.length > 1) throw unavailable();
  return rows[0];
}
export async function event(executor: Executor, type: string, outcome: string, actor?: UserRow): Promise<void> {
  await query(executor, `INSERT INTO dbo.SecurityEvents(EventType,Outcome,ActorUserKey,CorrelationId)
    VALUES(@type,@outcome,@actor,@correlation);`, [text("type", type), text("outcome", outcome),
    { name: "actor", type: sql.BigInt(), value: actor?.UserKey ?? null }, { name: "correlation", type: sql.UniqueIdentifier(), value: randomUUID() }]);
}
export async function authTransaction<T>(pool: sql.ConnectionPool, work: (transaction: sql.Transaction) => Promise<T>): Promise<T> {
  let domain: AuthError | undefined;
  try {
    return await withTransaction(pool, async transaction => {
      await acquireApplicationLock(transaction, authStateLock, 5000);
      try { return await work(transaction); }
      catch (error) {
        if (error instanceof AuthError) domain = error;
        throw error instanceof DatabaseError ? error : new DatabaseError("DB_TRANSACTION_FAILED");
      }
    });
  } catch (error) {
    if (domain) throw domain;
    throw error;
  }
}
export async function ensureRole(transaction: sql.Transaction, code: "user" | "superadmin", value: "User" | "SuperAdmin"): Promise<number> {
  const existing = (await query<{ RoleId: number; Code: string; ContractValue: string | null; ContractValueKind: string | null }>(transaction,
    "SELECT RoleId,Code,ContractValue,ContractValueKind FROM dbo.Roles WHERE Code=@code;", [text("code", code)])).recordset[0];
  if (existing) {
    if (existing.Code !== code || existing.ContractValue !== value || existing.ContractValueKind !== "string") throw unavailable();
    return existing.RoleId;
  }
  return (await query<{ RoleId: number }>(transaction, `INSERT INTO dbo.Roles(Code,ContractValue,ContractValueKind)
    OUTPUT INSERTED.RoleId VALUES(@code,@value,N'string');`, [text("code", code), text("value", value)])).recordset[0].RoleId;
}
export async function insertUser(transaction: sql.Transaction, input: { email: string; passwordHash: string; firstName: string; lastName: string; phoneNumber: string | null; country: string | null }, roleId: number, confirmed: boolean): Promise<UserRow> {
  const id = randomUUID();
  await query(transaction, `INSERT INTO dbo.Users(ExternalId,Email,NormalizedEmail,PasswordHash,FirstName,LastName,PhoneNumber,Country,
    RoleId,EmailConfirmed,IsDisabled,TwoFactorEnabled,SecurityVersion)
    VALUES(@id,@email,@normalized,@hash,@first,@last,@phone,@country,@role,@confirmed,0,0,0);`, [
    text("id", id), text("email", normalizeEmail(input.email)), text("normalized", normalizeEmail(input.email)), text("hash", input.passwordHash),
    text("first", input.firstName), text("last", input.lastName), text("phone", input.phoneNumber), text("country", input.country),
    integer("role", roleId), { name: "confirmed", type: sql.Bit(), value: confirmed },
  ]);
  const user = await byId(transaction, id);
  if (!user) throw unavailable();
  return user;
}
export async function invalidateSecurityState(transaction: sql.Transaction, user: UserRow): Promise<void> {
  await query(transaction, `UPDATE dbo.Users SET SecurityVersion=SecurityVersion+1,UpdatedAtUtc=SYSUTCDATETIME() WHERE UserKey=@userKey;
    UPDATE dbo.AuthSessions SET RevokedAtUtc=SYSUTCDATETIME() WHERE UserKey=@userKey AND RevokedAtUtc IS NULL;
    UPDATE dbo.OtpChallenges SET ConsumedAtUtc=SYSUTCDATETIME() WHERE UserKey=@userKey AND ConsumedAtUtc IS NULL;
    UPDATE dbo.AccountTokens SET ConsumedAtUtc=SYSUTCDATETIME() WHERE UserKey=@userKey AND ConsumedAtUtc IS NULL;`, [userKey(user.UserKey)]);
}
