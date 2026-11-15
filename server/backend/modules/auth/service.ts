import "server-only";
import sql from "mssql";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import type { AuthConfig } from "../../auth/config";
import type { MailAdapter } from "../../auth/mail";
import { AuthError, invalidCredentials, invalidProof } from "../../auth/errors";
import { checkPasswordPolicy, hashPassword, verifyPassword } from "../../auth/password";
import { roleValue, usableAccount, authorize } from "../../auth/authorize";
import { signIdentity, hashTokenId } from "../../auth/jwt";
import { issueOtp, consumeOtp } from "../../auth/otp";
import { rateLimit } from "../../auth/rate-limit";
import { query } from "../../db/parameters";
import { authTransaction, byEmail, ensureRole, insertUser, event, normalizeEmail, binary, integer, text, userKey, invalidateSecurityState, type UserRow } from "./repository";
import type { RegisterInput, LoginInput } from "./validation";

export interface ActionResult { data: unknown; paging?: { pageNumber: number; pageSize: number; totalRecords: number } }
const done = (): ActionResult => ({ data: null });
export class AuthenticationService {
  constructor(public readonly pool: sql.ConnectionPool, public readonly config: AuthConfig, private readonly mailFactory: () => MailAdapter) {}

  async limit(action: string, identity: string, max = 10, seconds = 900): Promise<void> {
    await rateLimit(this.pool, this.config, "global", "all", 120, 60);
    await rateLimit(this.pool, this.config, action, normalizeEmail(identity), max, seconds);
  }
  async register(input: RegisterInput): Promise<ActionResult> {
    await this.limit("register", input.email, 5, 3600);
    const mail = this.mailFactory();
    const passwordHash = await hashPassword(input.password);
    await authTransaction(this.pool, async transaction => {
      let user = await byEmail(transaction, input.email);
      if (!user) user = await insertUser(transaction, { ...input, passwordHash, country: input.country ?? null }, await ensureRole(transaction, "user", "User"), false);
      // Duplicate registration does not change the password, profile, role or enabled state.
      await issueOtp(transaction, this.config, mail, normalizeEmail(input.email), 0, user);
      await event(transaction, "RegisterRequested", "processed");
    });
    return done();
  }
  async login(input: LoginInput): Promise<ActionResult> {
    await this.limit("login", input.email ?? "");
    const result = await authTransaction(this.pool, async transaction => {
      const user = typeof input.email === "string" ? await byEmail(transaction, input.email) : undefined;
      const matches = await verifyPassword(input.password ?? "", user?.PasswordHash ?? null);
      if (!matches || !usableAccount(user)) {
        await event(transaction, "Login", "denied");
        return null;
      }
      if (user.TwoFactorEnabled) {
        if (!input.code) {
          await issueOtp(transaction, this.config, this.mailFactory(), user.Email!, 2, user);
          await event(transaction, "LoginChallenge", "required", user);
          return { challenge: true as const };
        }
        if (!await consumeOtp(transaction, this.config, user.Email!, 2, input.code, user)) {
          await event(transaction, "Login", "denied", user);
          return null;
        }
      }
      const signed = await signIdentity(this.config, { id: user.ExternalId, email: user.Email!, role: roleValue(user)!, version: user.SecurityVersion! });
      await query(transaction, `INSERT INTO dbo.AuthSessions(SessionId,UserKey,JtiHash,IssuedAtUtc,ExpiresAtUtc,SecurityVersion)
        VALUES(@id,@userKey,@hash,SYSUTCDATETIME(),@expires,@version);`, [
        { name: "id", type: sql.UniqueIdentifier(), value: randomUUID() }, userKey(user.UserKey), binary("hash", hashTokenId(signed.jti)),
        { name: "expires", type: sql.DateTime2(7), value: new Date(signed.exp * 1000) }, integer("version", user.SecurityVersion!),
      ]);
      await event(transaction, "Login", "allowed", user);
      return { id: user.ExternalId, email: user.Email, role: roleValue(user), token: signed.token, expiresOn: signed.expiresOn };
    });
    if (!result) throw invalidCredentials();
    if ("challenge" in result) throw new AuthError(401, "AUTH_CHALLENGE_REQUIRED", "Additional verification is required.");
    return { data: result };
  }
  async sendOtp(input: { email: string; purpose?: number }): Promise<ActionResult> {
    await this.limit(`send:${input.purpose ?? 0}`, input.email, 5, 3600);
    const mail = this.mailFactory();
    await authTransaction(this.pool, async transaction => {
      const user = await byEmail(transaction, input.email);
      // Identical delivery for unknown addresses prevents successful-send enumeration.
      // Unknown identities cannot consume these challenges or obtain reset/session proofs.
      await issueOtp(transaction, this.config, mail, normalizeEmail(input.email), input.purpose ?? 0, user);
      await event(transaction, "OtpRequested", "processed");
    });
    return done();
  }
  async confirmEmail(input: { email?: string | null; code?: string | null }): Promise<ActionResult> {
    await this.limit("confirm", input.email ?? "");
    const valid = await authTransaction(this.pool, async transaction => {
      const user = input.email ? await byEmail(transaction, input.email) : undefined;
      const consumed = await consumeOtp(transaction, this.config, input.email ?? "", 0, input.code ?? "", user);
      if (!consumed || !user || user.IsDisabled !== false) { await event(transaction, "ConfirmEmail", "denied"); return false; }
      await query(transaction, "UPDATE dbo.Users SET EmailConfirmed=1,UpdatedAtUtc=SYSUTCDATETIME() WHERE UserKey=@userKey;", [userKey(user.UserKey)]);
      await event(transaction, "ConfirmEmail", "allowed", user);
      return true;
    });
    if (!valid) throw invalidProof();
    return done();
  }
  async verifyOtp(input: { email?: string | null; code?: string | null }): Promise<ActionResult> {
    await this.limit("verify", input.email ?? "");
    const result = await authTransaction(this.pool, async transaction => {
      const user = input.email ? await byEmail(transaction, input.email) : undefined;
      const valid = await consumeOtp(transaction, this.config, input.email ?? "", 1, input.code ?? "", user);
      if (!valid || !usableAccount(user)) { await event(transaction, "VerifyOtp", "denied"); return null; }
      const token = randomBytes(32).toString("base64url");
      const expiresOn = new Date(Date.now() + 300000);
      await query(transaction, "UPDATE dbo.AccountTokens SET ConsumedAtUtc=SYSUTCDATETIME() WHERE UserKey=@userKey AND ConsumedAtUtc IS NULL;", [userKey(user.UserKey)]);
      await query(transaction, `INSERT INTO dbo.AccountTokens(TokenId,UserKey,Purpose,TokenHash,SecurityVersion,CreatedAtUtc,ExpiresAtUtc)
        VALUES(@id,@userKey,1,@hash,@version,SYSUTCDATETIME(),@expires);`, [
        { name: "id", type: sql.UniqueIdentifier(), value: randomUUID() }, userKey(user.UserKey), binary("hash", createHash("sha256").update(token).digest()),
        integer("version", user.SecurityVersion!), { name: "expires", type: sql.DateTime2(7), value: expiresOn },
      ]);
      await event(transaction, "VerifyOtp", "allowed", user);
      return { resetToken: token, expiresOn: expiresOn.toISOString() };
    });
    if (!result) throw invalidProof();
    return { data: result };
  }
  async resetPassword(input: { email: string; code: string; newPassword: string }): Promise<ActionResult> {
    await this.limit("reset", input.email);
    checkPasswordPolicy(input.newPassword);
    const passwordHash = await hashPassword(input.newPassword);
    const valid = await authTransaction(this.pool, async transaction => {
      const user = await byEmail(transaction, input.email);
      let consumed = false;
      if (/^\d{6}$/.test(input.code)) consumed = await consumeOtp(transaction, this.config, input.email, 1, input.code, user);
      else if (user && /^[A-Za-z0-9_-]{43}$/.test(input.code)) {
        const proof = await query<{ TokenId: string }>(transaction, `SELECT TokenId FROM dbo.AccountTokens WHERE UserKey=@userKey
          AND Purpose=1 AND TokenHash=@hash AND SecurityVersion=@version AND ConsumedAtUtc IS NULL AND ExpiresAtUtc>SYSUTCDATETIME();`, [
          userKey(user.UserKey), binary("hash", createHash("sha256").update(input.code).digest()), integer("version", user.SecurityVersion ?? -1),
        ]);
        consumed = Boolean(proof.recordset[0]);
      }
      if (!consumed || !usableAccount(user)) { await event(transaction, "ResetPassword", "denied"); return false; }
      await updatePassword(transaction, user, passwordHash);
      await event(transaction, "ResetPassword", "allowed", user);
      return true;
    });
    if (!valid) throw invalidProof();
    return done();
  }
  async toggleTwoFactor(token: string | undefined): Promise<ActionResult> {
    await authTransaction(this.pool, async transaction => {
      const user = await authorize(transaction, this.config, token);
      await event(transaction, "ToggleTwoFactor", "blocked_workflow", user);
    });
    throw new AuthError(501, "AUTH_2FA_WORKFLOW_UNVERIFIED", "Two-factor changes require a verified workflow that is not available yet.");
  }
}
export async function updatePassword(transaction: sql.Transaction, user: UserRow, hash: string): Promise<void> {
  await query(transaction, "UPDATE dbo.Users SET PasswordHash=@hash WHERE UserKey=@userKey;", [text("hash", hash), userKey(user.UserKey)]);
  await invalidateSecurityState(transaction, user);
}
