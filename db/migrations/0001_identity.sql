-- Internal foundation only. No role values, users, credentials or API defaults are seeded.
CREATE TABLE dbo.Roles (
  RoleId INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Roles PRIMARY KEY,
  Code NVARCHAR(100) NOT NULL CONSTRAINT UQ_Roles_Code UNIQUE,
  ContractValue NVARCHAR(MAX) NULL,
  ContractValueKind NVARCHAR(10) NULL,
  CreatedAtUtc DATETIME2(7) NOT NULL CONSTRAINT DF_Roles_Created DEFAULT SYSUTCDATETIME()
);
CREATE TABLE dbo.Users (
  UserKey BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Users PRIMARY KEY,
  ExternalId NVARCHAR(MAX) NOT NULL,
  ExternalIdHash AS CONVERT(BINARY(32),HASHBYTES('SHA2_256',CONVERT(VARBINARY(MAX),ExternalId))) PERSISTED,
  Email NVARCHAR(MAX) NULL,
  NormalizedEmail NVARCHAR(MAX) NULL,
  EmailHash AS CONVERT(BINARY(32),HASHBYTES('SHA2_256',CONVERT(VARBINARY(MAX),NormalizedEmail))) PERSISTED,
  FirstName NVARCHAR(MAX) NULL,
  LastName NVARCHAR(MAX) NULL,
  PhoneNumber NVARCHAR(MAX) NULL,
  Country NVARCHAR(MAX) NULL,
  PasswordHash NVARCHAR(MAX) NULL,
  FileId INT NULL,
  RoleId INT NULL,
  EmailConfirmed BIT NULL,
  TwoFactorEnabled BIT NULL,
  IsDisabled BIT NULL,
  SecurityVersion INT NULL,
  CreatedAtUtc DATETIME2(7) NOT NULL CONSTRAINT DF_Users_Created DEFAULT SYSUTCDATETIME(),
  UpdatedAtUtc DATETIME2(7) NULL,
  RowVersion ROWVERSION NOT NULL,
  CONSTRAINT FK_Users_Roles FOREIGN KEY (RoleId) REFERENCES dbo.Roles(RoleId)
);
CREATE UNIQUE INDEX UX_Users_ExternalIdHash ON dbo.Users(ExternalIdHash);
-- Email normalization/uniqueness policy is unresolved. Deliberately non-unique for now.
CREATE INDEX IX_Users_EmailHash ON dbo.Users(EmailHash);
CREATE TABLE dbo.AuthSessions (
  SessionId UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_AuthSessions PRIMARY KEY,
  UserKey BIGINT NOT NULL,
  JtiHash BINARY(32) NOT NULL CONSTRAINT UQ_AuthSessions_JtiHash UNIQUE,
  IssuedAtUtc DATETIME2(7) NOT NULL,
  ExpiresAtUtc DATETIME2(7) NOT NULL,
  RevokedAtUtc DATETIME2(7) NULL,
  SecurityVersion INT NOT NULL,
  CONSTRAINT FK_AuthSessions_Users FOREIGN KEY (UserKey) REFERENCES dbo.Users(UserKey)
);
CREATE TABLE dbo.OtpChallenges (
  ChallengeId UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_OtpChallenges PRIMARY KEY,
  UserKey BIGINT NULL,
  EmailHash BINARY(32) NOT NULL,
  Purpose INT NOT NULL,
  SecretHash VARBINARY(MAX) NOT NULL,
  Salt VARBINARY(MAX) NULL,
  ExpiresAtUtc DATETIME2(7) NOT NULL,
  ConsumedAtUtc DATETIME2(7) NULL,
  Attempts INT NOT NULL CONSTRAINT DF_OtpChallenges_Attempts DEFAULT 0,
  CreatedAtUtc DATETIME2(7) NOT NULL CONSTRAINT DF_OtpChallenges_Created DEFAULT SYSUTCDATETIME(),
  CONSTRAINT CK_OtpChallenges_Purpose CHECK (Purpose IN (0,1,2)),
  CONSTRAINT CK_OtpChallenges_Attempts CHECK (Attempts >= 0),
  CONSTRAINT FK_OtpChallenges_Users FOREIGN KEY (UserKey) REFERENCES dbo.Users(UserKey)
);
CREATE TABLE dbo.SecurityEvents (
  EventId BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_SecurityEvents PRIMARY KEY,
  EventType NVARCHAR(100) NOT NULL,
  ActorUserKey BIGINT NULL,
  Outcome NVARCHAR(50) NOT NULL,
  CorrelationId UNIQUEIDENTIFIER NULL,
  OccurredAtUtc DATETIME2(7) NOT NULL CONSTRAINT DF_SecurityEvents_Occurred DEFAULT SYSUTCDATETIME(),
  CONSTRAINT FK_SecurityEvents_Users FOREIGN KEY (ActorUserKey) REFERENCES dbo.Users(UserKey)
);
