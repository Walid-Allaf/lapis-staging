import "server-only";
import sql from "mssql";
import type { AuthConfig } from "./config";
import { verifyIdentity, hashTokenId } from "./jwt";
import { invalidCredentials, forbidden } from "./errors";
import { byId, binary, userKey, type UserRow } from "../modules/auth/repository";
import { query } from "../db/parameters";

export function roleValue(user: UserRow): string | number | null {
  if (user.ContractValueKind === "string" && user.ContractValue) return user.ContractValue;
  if (user.ContractValueKind === "number" && user.ContractValue && /^\d+$/.test(user.ContractValue)) return Number(user.ContractValue);
  return null;
}
export function usableAccount(user: UserRow | undefined): user is UserRow {
  return Boolean(user && user.Email && user.NormalizedEmail && user.IsDisabled === false && user.EmailConfirmed === true &&
    user.TwoFactorEnabled !== null && Number.isInteger(user.SecurityVersion) && Number(user.SecurityVersion) >= 0 &&
    ((user.RoleCode === "superadmin" && roleValue(user) === "SuperAdmin") ||
     (user.RoleCode === "user" && roleValue(user) === "User") ||
     (user.RoleCode === "manager" && roleValue(user) === "Manager")));
}
export function requireUserAdministrator(user: UserRow): void {
  if (user.RoleCode !== "superadmin" || roleValue(user) !== "SuperAdmin") throw forbidden();
}
export async function authorize(transaction: sql.Transaction, config: AuthConfig, token: string | undefined): Promise<UserRow> {
  if (!token) throw invalidCredentials();
  const identity = await verifyIdentity(config, token);
  const user = await byId(transaction, identity.id);
  if (!usableAccount(user) || user.Email !== identity.email || roleValue(user) !== identity.role || user.SecurityVersion !== identity.version) throw invalidCredentials();
  const session = await query<{ present: number }>(transaction, `SELECT 1 AS present FROM dbo.AuthSessions WHERE UserKey=@userKey
    AND JtiHash=@hash AND SecurityVersion=@version AND RevokedAtUtc IS NULL AND ExpiresAtUtc>SYSUTCDATETIME();`, [
    userKey(user.UserKey), binary("hash", hashTokenId(identity.jti)), { name: "version", type: sql.Int(), value: identity.version },
  ]);
  if (!session.recordset[0]) throw invalidCredentials();
  return user;
}
