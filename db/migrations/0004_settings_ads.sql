-- NULL flags are intentional: Phase 1 could not establish omission/default behavior.
CREATE TABLE dbo.SiteSettings (
  Id TINYINT NOT NULL CONSTRAINT PK_SiteSettings PRIMARY KEY,
  PhoneNumber NVARCHAR(MAX) NULL,
  Email NVARCHAR(MAX) NULL,
  Address NVARCHAR(MAX) NULL,
  AboutUsAr NVARCHAR(MAX) NULL,
  AboutUsEn NVARCHAR(MAX) NULL,
  ContactUsAr NVARCHAR(MAX) NULL,
  ContactUsEn NVARCHAR(MAX) NULL,
  FacebookUrl NVARCHAR(MAX) NULL,
  InstagramUrl NVARCHAR(MAX) NULL,
  TwitterUrl NVARCHAR(MAX) NULL,
  YoutubeUrl NVARCHAR(MAX) NULL,
  TiktokUrl NVARCHAR(MAX) NULL,
  Latitude FLOAT(53) NULL,
  Longitude FLOAT(53) NULL,
  FAQsTabToggle BIT NULL,
  ServicesTabToggle BIT NULL,
  GalleriesTabToggle BIT NULL,
  YouTubeGalleriesTabToggle BIT NULL,
  TestimonialsTabToggle BIT NULL,
  OurSpecialistsTabToggle BIT NULL,
  UpdatedAtUtc DATETIME2(7) NULL,
  RowVersion ROWVERSION NOT NULL,
  CONSTRAINT CK_SiteSettings_Singleton CHECK (Id=1)
);
CREATE TABLE dbo.Ads (
  Id TINYINT NOT NULL CONSTRAINT PK_Ads PRIMARY KEY,
  Text NVARCHAR(MAX) NULL,
  Url NVARCHAR(MAX) NULL,
  IsExternal BIT NULL,
  FileId INT NULL,
  IsActive BIT NULL,
  UpdatedAtUtc DATETIME2(7) NULL,
  RowVersion ROWVERSION NOT NULL,
  CONSTRAINT CK_Ads_Singleton CHECK (Id=1),
  CONSTRAINT FK_Ads_Files FOREIGN KEY (FileId) REFERENCES dbo.Files(Id)
);
CREATE TABLE dbo.DevelopmentSeedHistory (
  SeedKey NVARCHAR(100) NOT NULL CONSTRAINT PK_DevelopmentSeedHistory PRIMARY KEY,
  AppliedAtUtc DATETIME2(7) NOT NULL
);
