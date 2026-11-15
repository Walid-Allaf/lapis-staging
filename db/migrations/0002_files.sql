CREATE TABLE dbo.Files (
  Id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Files PRIMARY KEY,
  StorageKey NVARCHAR(450) NOT NULL CONSTRAINT UQ_Files_StorageKey UNIQUE,
  PublicPath NVARCHAR(MAX) NOT NULL,
  OriginalName NVARCHAR(MAX) NULL,
  MimeType NVARCHAR(150) NOT NULL,
  ByteLength BIGINT NOT NULL,
  Sha256 BINARY(32) NOT NULL,
  CreatedByUserKey BIGINT NULL,
  StorageState NVARCHAR(20) NOT NULL,
  CreatedAtUtc DATETIME2(7) NOT NULL CONSTRAINT DF_Files_Created DEFAULT SYSUTCDATETIME(),
  CONSTRAINT CK_Files_ByteLength CHECK (ByteLength >= 0),
  CONSTRAINT FK_Files_Users FOREIGN KEY (CreatedByUserKey) REFERENCES dbo.Users(UserKey)
);
-- Resolve the nullable Users/Files reference cycle only after both tables exist.
ALTER TABLE dbo.Users ADD CONSTRAINT FK_Users_Files FOREIGN KEY (FileId) REFERENCES dbo.Files(Id);
