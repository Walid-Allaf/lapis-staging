import "server-only";
import sql from "mssql";
import { createHmac } from "node:crypto";
import type { AuthConfig } from "./config";
import { AuthError } from "./errors";
import { query } from "../db/parameters";
import { withTransaction } from "../db/transaction";
import { acquireApplicationLock } from "../db/lock";
import { binary, integer } from "../modules/auth/repository";

export async function rateLimit(pool: sql.ConnectionPool, config: AuthConfig, scope: string, identity: string, maximum: number, seconds: number): Promise<void> {
  const hash = createHmac("sha256", config.otpKey).update(JSON.stringify([scope, identity])).digest();
  const allowed = await withTransaction(pool, async transaction => {
    await acquireApplicationLock(transaction, `LAPiS:auth:rate:${hash.toString("hex")}`, 5000);
    const result = await query<{ Attempts: number }>(transaction, `
      DECLARE @now DATETIME2(7)=SYSUTCDATETIME();
      IF NOT EXISTS(SELECT 1 FROM dbo.AuthRateLimits WHERE BucketHash=@hash)
        INSERT INTO dbo.AuthRateLimits(BucketHash,WindowStartUtc,Attempts,ExpiresAtUtc) VALUES(@hash,@now,1,DATEADD(SECOND,@seconds,@now));
      ELSE UPDATE dbo.AuthRateLimits SET Attempts=CASE WHEN ExpiresAtUtc<=@now THEN 1 WHEN Attempts<2147483647 THEN Attempts+1 ELSE Attempts END,
        WindowStartUtc=CASE WHEN ExpiresAtUtc<=@now THEN @now ELSE WindowStartUtc END,
        ExpiresAtUtc=CASE WHEN ExpiresAtUtc<=@now THEN DATEADD(SECOND,@seconds,@now) ELSE ExpiresAtUtc END WHERE BucketHash=@hash;
      IF (SELECT Attempts FROM dbo.AuthRateLimits WHERE BucketHash=@hash)=@maximum+1
        INSERT INTO dbo.SecurityEvents(EventType,Outcome,CorrelationId) VALUES(N'AuthRateLimit',N'denied',NEWID());
      SELECT Attempts FROM dbo.AuthRateLimits WHERE BucketHash=@hash;
      DELETE TOP(100) FROM dbo.AuthRateLimits WHERE ExpiresAtUtc<DATEADD(DAY,-1,@now);`, [binary("hash", hash), integer("seconds", seconds), integer("maximum", maximum)]);
    return result.recordset[0].Attempts <= maximum;
  });
  if (!allowed) throw new AuthError(429, "AUTH_RATE_LIMIT", "Please try again later.");
}
