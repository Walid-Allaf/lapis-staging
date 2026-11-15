import "server-only";
import sql from "mssql";
import { createHmac, randomBytes, randomInt, randomUUID, timingSafeEqual } from "node:crypto";
import type { AuthConfig } from "./config";
import type { MailAdapter } from "./mail";
import { AuthError } from "./errors";
import { query } from "../db/parameters";
import { binary, emailHash, integer, userKey, type UserRow } from "../modules/auth/repository";

interface OtpRow { ChallengeId: string; SecretHash: Buffer; Salt: Buffer; UserKey: string | null; SecurityVersion: number | null; Attempts: number; available: boolean }
function digest(config: AuthConfig, email: string, purpose: number, id: string, salt: Buffer, code: string): Buffer {
  return createHmac("sha256", config.otpKey).update(JSON.stringify([emailHash(email).toString("hex"), purpose, id.toLowerCase(), salt.toString("hex"), code])).digest();
}
export async function issueOtp(transaction: sql.Transaction, config: AuthConfig, mail: MailAdapter, email: string, purpose: number, user?: UserRow): Promise<void> {
  const parameters = [binary("emailHash", emailHash(email)), integer("purpose", purpose)];
  const latest = await query<{ cooling: number }>(transaction, `SELECT TOP(1) CASE WHEN CreatedAtUtc>DATEADD(SECOND,-60,SYSUTCDATETIME()) THEN 1 ELSE 0 END AS cooling
    FROM dbo.OtpChallenges WHERE EmailHash=@emailHash AND Purpose=@purpose ORDER BY CreatedAtUtc DESC;`, parameters);
  if (latest.recordset[0]?.cooling) throw new AuthError(429, "AUTH_OTP_COOLDOWN", "Please wait before requesting another code.");
  await query(transaction, `UPDATE dbo.OtpChallenges SET ConsumedAtUtc=SYSUTCDATETIME() WHERE EmailHash=@emailHash AND Purpose=@purpose AND ConsumedAtUtc IS NULL;`, parameters);
  if (purpose === 1 && user) await query(transaction, "UPDATE dbo.AccountTokens SET ConsumedAtUtc=SYSUTCDATETIME() WHERE UserKey=@userKey AND ConsumedAtUtc IS NULL;", [userKey(user.UserKey)]);
  const code = randomInt(0, 1000000).toString().padStart(6, "0");
  const id = randomUUID(), salt = randomBytes(16);
  await query(transaction, `INSERT INTO dbo.OtpChallenges(ChallengeId,UserKey,EmailHash,Purpose,SecretHash,Salt,SecurityVersion,ExpiresAtUtc)
    VALUES(@id,@userKey,@emailHash,@purpose,@hash,@salt,@version,DATEADD(MINUTE,5,SYSUTCDATETIME()));`, [
    ...parameters, { name: "id", type: sql.UniqueIdentifier(), value: id },
    { name: "userKey", type: sql.BigInt(), value: user?.UserKey ?? null }, binary("hash", digest(config, email, purpose, id, salt, code)),
    { name: "salt", type: sql.VarBinary(16), value: salt }, { name: "version", type: sql.Int(), value: user?.SecurityVersion ?? null },
  ]);
  // SMTP acceptance is required before commit; failure rolls back both state and user creation.
  await mail.sendOtp(email, purpose, code);
}
export async function consumeOtp(transaction: sql.Transaction, config: AuthConfig, email: string, purpose: number, code: string, user?: UserRow): Promise<boolean> {
  const row = (await query<OtpRow>(transaction, `SELECT TOP(1) ChallengeId,SecretHash,Salt,CONVERT(VARCHAR(20),UserKey) AS UserKey,SecurityVersion,Attempts,
    CAST(CASE WHEN ConsumedAtUtc IS NULL AND ExpiresAtUtc>SYSUTCDATETIME() AND Attempts<5 THEN 1 ELSE 0 END AS BIT) AS available
    FROM dbo.OtpChallenges WHERE EmailHash=@hash AND Purpose=@purpose ORDER BY CreatedAtUtc DESC;`, [binary("hash", emailHash(email)), integer("purpose", purpose)])).recordset[0];
  if (!row?.available) return false;
  await query(transaction, "UPDATE dbo.OtpChallenges SET Attempts=Attempts+1 WHERE ChallengeId=@id;", [{ name: "id", type: sql.UniqueIdentifier(), value: row.ChallengeId }]);
  const expected = digest(config, email, purpose, row.ChallengeId, row.Salt, code);
  const valid = /^\d{6}$/.test(code) && row.SecretHash.length === expected.length && timingSafeEqual(row.SecretHash, expected) &&
    user && row.UserKey === user.UserKey && row.SecurityVersion === user.SecurityVersion;
  if (!valid) return false;
  await query(transaction, "UPDATE dbo.OtpChallenges SET ConsumedAtUtc=SYSUTCDATETIME() WHERE ChallengeId=@id;", [{ name: "id", type: sql.UniqueIdentifier(), value: row.ChallengeId }]);
  return true;
}
