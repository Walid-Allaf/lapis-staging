import "server-only";
import sql from "mssql";
import { AuthError, forbidden, invalidCredentials } from "../../auth/errors";
import { authorize, requireUserAdministrator, roleValue } from "../../auth/authorize";
import { hashPassword, verifyPassword } from "../../auth/password";
import { query, type SqlParameter } from "../../db/parameters";
import { AuthenticationService, updatePassword, type ActionResult } from "../auth/service";
import { authTransaction, byEmail, byId, event, integer, text, userKey, userProjection, invalidateSecurityState, type UserRow } from "../auth/repository";
import type { ProfileInput } from "../auth/validation";

export interface UserFilters { pageNumber: number; pageSize: number; search?: string; sort: number; descending: boolean; isActive?: boolean }
export function userDto(user: UserRow) {
  return { id: user.ExternalId, email: user.Email, firstName: user.FirstName, lastName: user.LastName, phoneNumber: user.PhoneNumber,
    country: user.Country, role: roleValue(user), isActive: user.IsDisabled === null ? null : !user.IsDisabled, isDisabled: user.IsDisabled,
    emailConfirmed: user.EmailConfirmed, twoFactorEnabled: user.TwoFactorEnabled,
    image: user.FileId !== null && user.FilePath !== null ? { id: user.FileId, filePath: user.FilePath } : null,
    createdAt: user.CreatedAtUtc.toISOString() };
}
export class UserService {
  constructor(private readonly auth: AuthenticationService) {}
  private async authenticated<T>(token: string | undefined, work: (transaction: sql.Transaction, user: UserRow) => Promise<T>): Promise<T> {
    return authTransaction(this.auth.pool, async transaction => work(transaction, await authorize(transaction, this.auth.config, token)));
  }
  async getInfo(token: string | undefined): Promise<ActionResult> {
    return this.authenticated(token, async (_transaction, user) => ({ data: userDto(user) }));
  }
  async getById(token: string | undefined, id: string): Promise<ActionResult> {
    return this.authenticated(token, async (transaction, actor) => {
      requireUserAdministrator(actor);
      const user = await byId(transaction, id);
      if (!user) throw new AuthError(404, "USER_NOT_FOUND", "User not found.");
      return { data: userDto(user) };
    });
  }
  async getAll(token: string | undefined, filters: UserFilters): Promise<ActionResult> {
    return this.authenticated(token, async (transaction, actor) => {
      requireUserAdministrator(actor);
      const fields = ["u.ExternalId", "u.FirstName", "u.LastName", "u.Email", "u.CreatedAtUtc"] as const;
      const field = fields[filters.sort];
      if (!field) throw new AuthError(400, "AUTH_INVALID_REQUEST", "Invalid request.");
      const where: string[] = [];
      const parameters: SqlParameter[] = [];
      if (filters.isActive !== undefined) {
        where.push("u.IsDisabled=@disabled"); parameters.push({ name: "disabled", type: sql.Bit(), value: !filters.isActive });
      }
      if (filters.search) {
        where.push("(u.FirstName LIKE @search ESCAPE N'~' OR u.LastName LIKE @search ESCAPE N'~' OR u.Email LIKE @search ESCAPE N'~')");
        parameters.push(text("search", `%${filters.search.replace(/[~%_\[]/g, value => `~${value}`)}%`));
      }
      const condition = where.length ? " WHERE " + where.join(" AND ") : "";
      const total = (await query<{ total: number }>(transaction, `SELECT COUNT(*) AS total FROM dbo.Users u${condition};`, parameters)).recordset[0].total;
      const users = (await query<UserRow>(transaction, `${userProjection}${condition} ORDER BY ${field} ${filters.descending ? "DESC" : "ASC"},u.UserKey ASC
        OFFSET @offset ROWS FETCH NEXT @size ROWS ONLY;`, [...parameters, { name: "offset", type: sql.BigInt(), value: (filters.pageNumber - 1) * filters.pageSize }, integer("size", filters.pageSize)])).recordset;
      return { data: users.map(userDto), paging: { pageNumber: filters.pageNumber, pageSize: filters.pageSize, totalRecords: total } };
    });
  }
  async editProfile(token: string | undefined, input: ProfileInput): Promise<ActionResult> {
    return this.authenticated(token, async (transaction, actor) => {
      if (input.fileId !== undefined && input.fileId !== null) {
        const file = await query<{ Id: number }>(transaction, `SELECT Id FROM dbo.Files WHERE Id=@id AND StorageState=N'ready' AND CreatedByUserKey=@userKey;`, [integer("id", input.fileId), userKey(actor.UserKey)]);
        if (!file.recordset[0]) throw new AuthError(400, "USER_INVALID_FILE", "File is not available for this profile.");
      }
      const fields: Array<[keyof ProfileInput, string]> = [["firstName", "FirstName"], ["lastName", "LastName"], ["phoneNumber", "PhoneNumber"], ["fileId", "FileId"]];
      const updates: string[] = [];
      const parameters: SqlParameter[] = [userKey(actor.UserKey)];
      for (const [key, column] of fields) if (input[key] !== undefined) {
        updates.push(`${column}=@${key}`);
        parameters.push({ name: key, type: key === "fileId" ? sql.Int() : sql.NVarChar(sql.MAX), value: input[key] });
      }
      if (updates.length) await query(transaction, `UPDATE dbo.Users SET ${updates.join(",")},UpdatedAtUtc=SYSUTCDATETIME() WHERE UserKey=@userKey;`, parameters);
      await event(transaction, "EditProfile", "allowed", actor);
      return { data: userDto((await byId(transaction, actor.ExternalId))!) };
    });
  }
  async changePassword(token: string | undefined, input: { currentPassword?: string | null; newPassword?: string | null }): Promise<ActionResult> {
    // Authenticate before password policy/hashing to avoid unauthenticated expensive work.
    const valid = await this.authenticated(token, async (transaction, actor) => {
      if (!await verifyPassword(input.currentPassword ?? "", actor.PasswordHash)) { await event(transaction, "ChangePassword", "denied", actor); return false; }
      const hash = await hashPassword(input.newPassword ?? "");
      await updatePassword(transaction, actor, hash);
      await event(transaction, "ChangePassword", "allowed", actor);
      return true;
    });
    if (!valid) throw invalidCredentials();
    return { data: null };
  }
  async toggleDisable(token: string | undefined, email: string): Promise<ActionResult> {
    return this.authenticated(token, async (transaction, actor) => {
      requireUserAdministrator(actor);
      const target = await byEmail(transaction, email);
      if (!target) throw new AuthError(404, "USER_NOT_FOUND", "User not found.");
      if (target.UserKey === actor.UserKey) throw forbidden();
      // Global security lock serializes last-admin checks and all identity mutations.
      if (target.RoleCode === "superadmin" && target.IsDisabled === false) {
        const count = (await query<{ count: number }>(transaction, `SELECT COUNT(*) AS count FROM dbo.Users u JOIN dbo.Roles r ON r.RoleId=u.RoleId
          WHERE r.Code=N'superadmin' AND u.IsDisabled=0 AND u.EmailConfirmed=1;`)).recordset[0].count;
        if (count <= 1) throw forbidden();
      }
      // NULL is unresolved/ineligible, never interpreted as enabled.
      if (target.IsDisabled === null || target.SecurityVersion === null) throw new AuthError(409, "USER_STATE_UNRESOLVED", "User security state requires operator review.");
      await query(transaction, "UPDATE dbo.Users SET IsDisabled=@disabled WHERE UserKey=@userKey;", [userKey(target.UserKey), { name: "disabled", type: sql.Bit(), value: !target.IsDisabled }]);
      await invalidateSecurityState(transaction, target);
      await event(transaction, "ToggleDisable", "allowed", actor);
      return { data: userDto((await byId(transaction, target.ExternalId))!) };
    });
  }
}
