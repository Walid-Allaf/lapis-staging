-- New Phase 3 policies, not recovered legacy behavior. Existing records are not backfilled.
IF EXISTS (SELECT EmailHash FROM dbo.Users WHERE NormalizedEmail IS NOT NULL GROUP BY EmailHash HAVING COUNT(*)>1)
  THROW 51002, 'Review duplicate normalized identities before applying auth migration', 1;
CREATE UNIQUE INDEX UX_Users_NormalizedEmailHash ON dbo.Users(EmailHash) WHERE NormalizedEmail IS NOT NULL;
ALTER TABLE dbo.OtpChallenges ADD SecurityVersion INT NULL;
CREATE INDEX IX_OtpChallenges_Latest ON dbo.OtpChallenges(EmailHash,Purpose,CreatedAtUtc DESC);
CREATE TABLE dbo.AccountTokens (
  TokenId UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_AccountTokens PRIMARY KEY,
  UserKey BIGINT NOT NULL,
  Purpose INT NOT NULL,
  TokenHash BINARY(32) NOT NULL CONSTRAINT UQ_AccountTokens_Hash UNIQUE,
  SecurityVersion INT NOT NULL,
  CreatedAtUtc DATETIME2(7) NOT NULL,
  ExpiresAtUtc DATETIME2(7) NOT NULL,
  ConsumedAtUtc DATETIME2(7) NULL,
  CONSTRAINT CK_AccountTokens_Purpose CHECK (Purpose=1),
  CONSTRAINT FK_AccountTokens_Users FOREIGN KEY (UserKey) REFERENCES dbo.Users(UserKey)
);
CREATE INDEX IX_AccountTokens_User ON dbo.AccountTokens(UserKey,ExpiresAtUtc);
CREATE TABLE dbo.AuthRateLimits (
  BucketHash BINARY(32) NOT NULL CONSTRAINT PK_AuthRateLimits PRIMARY KEY,
  WindowStartUtc DATETIME2(7) NOT NULL,
  Attempts INT NOT NULL,
  ExpiresAtUtc DATETIME2(7) NOT NULL,
  CONSTRAINT CK_AuthRateLimits_Attempts CHECK (Attempts>=0)
);
CREATE INDEX IX_AuthRateLimits_Expiry ON dbo.AuthRateLimits(ExpiresAtUtc);
