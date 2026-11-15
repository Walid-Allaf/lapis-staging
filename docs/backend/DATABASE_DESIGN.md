> Phase5 current addition, 2026-11-11: no new migration/table; all applied 0001–0007 are unchanged, seven versions/19 tables. dbo.Files now backs actual uploads with exact random StorageKey, relative PublicPath, sanitized informational OriginalName, MIME/ByteLength/SHA256, actual uploader key and pending→ready/failed service states. Existing unique StorageKey/FKs/pool are reused. File bytes live outside the deployed root, not in SQL. A pending registration and a subsequent ready update are separate auth→media locked transactions around exclusive physical finalization; SQL/filesystem atomicity is not claimed. No delete cascade, destructive orphan cleanup or content contract change. See [STORAGE_ARCHITECTURE](STORAGE_ARCHITECTURE.md) and [STORAGE_RECOVERY](STORAGE_RECOVERY.md). Historical planned-upload paragraphs below are superseded only by this explicit isolated implementation; host deployment remains unverified.

> Phase 4 current schema, 2026-11-11: seven migrations / 19 tables. [0007_content_invariants.sql](../../db/migrations/0007_content_invariants.sql) adds unique filtered UX_BlogPosts_SlugHash for non-null slugs, with duplicate-hash preflight and no automatic data rewrite. Applied 0001–0006 are byte-for-byte unchanged. Existing duplicate data requires review; never edit an applied file, reset a database or auto-retry a failed attempt. No production migration ran.
>
> Content now uses the existing shared pool, parameterized SQL, explicit DTO projection and serializable application-locked transactions. Auth state lock precedes content state lock; public reads share the content lock, writes take exclusive. OFFSET/FETCH and COUNT_BIG execute consistently; sort identifiers are fixed whitelists. API defaults/null mappings and numeric sort meanings are INFERRED service policy, not new SQL constraints. Existing restrictive FKs remain: hard-delete unreferenced content only, referenced specialists yield409, files never cascade/delete. dbo.Files is the existing metadata table (not a newly created UploadedFiles table); supplied files must be ready with nonempty PublicPath. No upload/physical storage implementation was added. Internal UTC DATETIME2 values serialize as offset-free precision-preserving API strings; original timezone meaning remains UNKNOWN. New statistics projection is defined in [CONTENT_API_CONTRACTS](CONTENT_API_CONTRACTS.md), superseding the earlier planned-only statement below.

# تصميم SQL Server المقترح — غير منفذ

> تحديث Phase3: أضيف `0006_auth_security.sql` دون تعديل0001–0005: unique normalized-email hash index مع duplicate preflight، وOtpChallenges.SecurityVersion، وجدولاAccountTokens/AuthRateLimits. لا backfill للـroles/flags القديمة ولا فرض أدوار تاريخية. المخطط الحالي19جدولًا وستةإصدارات، واختبر محليًا فقط. السياسات الجديدة والاختلافات في [تقريرPhase3](PHASE3_AUTHENTICATION.md) و[عقودAuth](AUTH_API_CONTRACTS.md)؛ وصفPhase1 أدناه يظل مقترحًا تاريخيًا، لا وصفًا نهائيًا للاستجابات.

> تحديث Phase2،2026-11-11: الوصف أدناه هو مقترح Phase1 التاريخي. نُفذ الآن أساس SQL والجداول في `db/migrations/` واختبرت في قواعد محلية معزولة فقط. المرجع التنفيذي الأحدث هو [PHASE2_FOUNDATION.md](PHASE2_FOUNDATION.md) و[DEPLOYMENT_RUNBOOK.md](DEPLOYMENT_RUNBOOK.md). أُجّل AccountTokens وunique email/slug؛ flags وorder وStatus والعلاقة specialist nullable مؤقتًا دون API defaults. لا endpoints بديلة من57، ولا تغيير frontend أو production DB.

كل هذا الملف **INFERRED**: مخطط جديد مشتق من [طلبات Swagger](API_COMPATIBILITY_MATRIX.md) و[العقود المرصودة](RESPONSE_CONTRACTS.md)، وليس استعادةً للمخطط الأصلي المفقود. لم يُفتح اتصال SQL أو تنفذ migration في Phase 1. أسماء الجداول الداخلية قابلة للاختيار؛ أسماء JSON وroutes ليست كذلك.

## قواعد التخزين والـ mapping

- SQL Server وحده قاعدة التطبيق؛ `mssql` مع connection pool مشترك لكل Node process، server-only وNode.js runtime؛ لا استيراد إلى client bundle ولا تنفيذ SQL من browser.
- Unicode `NVARCHAR` لكل النصوص متعددة اللغات؛ `NVARCHAR(MAX)` للنصوص التي لا توثق Swagger حدًا لها، لا truncation صامت ولا قيود طول UI مفروضة على API. الأعمدة المفهرسة تحتاج تصميمًا منفصلًا عن طول JSON.
- IDs المحتوى والملفات `INT IDENTITY` لأن requests توثق int32؛ User API يوثق id كسلسلة **وليس GUID**. لا تعرض internal surrogate keys أو rowversion.
- `BIT` للأعلام، `INT` للأرقام/enums؛ `FLOAT(53)` لـ latitude/longitude لأن Swagger يصف double، مع JSON numbers لا strings. لا DECIMAL scale جديد يغير الإحداثيات. الحدود الجغرافية أو stars 1..5 غير موثقة؛ لا CHECK جديد يزعم أنه legacy.
- `DATETIME2(7)` للتوقيت UTC مع `SYSUTCDATETIME()` عند الإنشاء. التخزين UTC قرار أمان/تشغيل؛ mapper يحفظ serialization المتوافق بعد حسم U10، ولا يضيف Z أو يقتطع الكسور تلقائيًا.
- `ROWVERSION` داخلي للمنافسة، لا ETag/If-Match إلزامي جديد بلا دليل. transaction لكل mutation وعلاقاتها؛ partial updates مقابل full replace لا يُفترض من كلمة PUT، بل يحسم omitted/null من U05.
- كل FK افتراضيًا `NO ACTION`؛ لا cascade للملفات أو المستخدمين أو المحتوى. `isActive` علم عرض مستقل وليس soft-delete. لا `IsDeleted` شاملًا دون دليل أو قرار تصميم صريح. دلالة delete نفسها gate U09 قبل DML.
- default `IsActive`/Status/Order والأعلام عند omission **UNKNOWN**. تستخدم NOT NULL فقط بعد تحديد domain defaults/tests؛ nullability للطلب لا تصف وحدها عمودًا أو response. الجداول أدناه تميز التخزين المقترح عن ما يضمنه API.

## الهوية والأمن

| Table | أعمدة مقترحة | العلاقات والقيود |
| --- | --- | --- |
| Users | UserKey BIGINT identity PK داخلي؛ ExternalId NVARCHAR(MAX)؛ ExternalIdHash BINARY(32)؛ Email/NormalizedEmail NVARCHAR(MAX)؛ EmailHash BINARY(32)؛ FirstName/LastName/PhoneNumber/Country NVARCHAR(MAX)؛ PasswordHash NVARCHAR(MAX)؛ FileId INT NULL؛ RoleId INT؛ EmailConfirmed BIT؛ TwoFactorEnabled BIT؛ IsDisabled BIT؛ SecurityVersion INT؛ CreatedAt/UpdatedAt DATETIME2؛ RowVersion | FKs إلى Roles وFiles؛ unique ExternalIdHash وEmailHash، مع مقارنة النص الكامل وعدم دمج collision؛ hashes للتفهرس لا بديل للتشفير أو تحقق المساواة. normalization/case policy U07/U11؛ لا password plaintext |
| Roles | RoleId INT PK؛ Code NVARCHAR(100)؛ ContractValue NVARCHAR(100)؛ ContractValueKind VARCHAR(10)؛ permission policy منفصل في الخادم | seed القيم العامة بعد حسم U06/U15؛ يحتفظ mapper بنوع role string/number المطلوب. السماح 1/2 في UI لا يثبت دلالتهما؛ لا role من RegisterRequest |
| AuthSessions | SessionId UNIQUEIDENTIFIER PK؛ UserKey FK؛ JtiHash BINARY(32) UNIQUE؛ IssuedAt/ExpiresAt/RevokedAt DATETIME2؛ SecurityVersion INT | لا JWT خام في DB/logs؛ فهرس UserKey/ExpiresAt؛ revoke عند disabled/password reset وفق السياسة المعتمدة |
| OtpChallenges | ChallengeId UNIQUEIDENTIFIER PK؛ UserKey NULL FK؛ EmailHash BINARY(32)؛ Purpose INT؛ SecretHash VARBINARY؛ Salt VARBINARY عند الحاجة؛ ExpiresAt/ConsumedAt DATETIME2؛ Attempts INT؛ CreatedAt | Purpose يقبل 0/1/2 كما في OpenAPI، لكن mapping للغرض UNKNOWN. atomic attempt/consume تحت transaction وlock؛ لا OTP مكشوف أو إعادة استخدام |
| AccountTokens | TokenId UNIQUEIDENTIFIER؛ UserKey FK؛ Purpose؛ TokenHash BINARY(32) UNIQUE؛ ExpiresAt/ConsumedAt؛ Attempts | للتأكيد/reset إن كان flow المثبت يحتاج token منفصلًا؛ لا إنشاء كيان زائد إن كانت OTP واحدة تكفي. هذا table مشروط بـ U11، لا response fields مستنتجة |
| SecurityEvents | EventId BIGINT PK؛ EventType؛ ActorUserKey NULL؛ Outcome؛ OccurredAt؛ CorrelationId؛ metadata محدودة ومحررة | لا password/token/OTP أو request body أو email كامل أو IP كامل افتراضيًا؛ retention وتفاصيل policy لاحقًا |

الخيار المقترح ExternalId string غير محدود مع hash index يتفادى فرض maxLength=450 غير الموجود في API؛ الـ FKs الداخلية تستعمل UserKey. IDs الجديدة قد تكون UUID string لكن binder يقبل كل string صالح موثق، ويقارن كامل القيمة ولا يعمل GUID parse. طول request/path على HTTP ليس قاعدة جديدة من SQL.

تجزئة كلمات المرور بمكتبة آمنة مناسبة لبيئة Windows أو Node crypto scrypt مع salt عشوائي ومعاملات معايرة وحد أعلى للتكلفة والتزامن؛ اختيار التنفيذ النهائي بعد قياس المضيف. لا native dependency بلا حاجة. JWT موقّع بمفتاح خادمي، verify للـ algorithm/issuer/audience/exp/nbf وSecurityVersion/account status قبل أي عملية محمية. لا إعادة استخدام هاشات ASP.NET دون معرفة format/verifier؛ الحسابات القديمة واستعادة كلمات المرور تحتاج خطة انتقال، ولا seed لحساب production بكلمة مرور ثابتة.

## الملفات والمحتوى

أعمدة مشتركة مقترحة للجداول السبعة: `Id INT IDENTITY PK`, `IsActive BIT`, `CreatedAt DATETIME2(7)`, `UpdatedAt DATETIME2(7)`, `RowVersion ROWVERSION`. ليست كل response تكشف UpdatedAt؛ mapper يكشف الحقول المرصودة فقط. nullable text في الطلب يحفظ NULL حيث يلزم، ومخرجات null/empty لا تُخمن؛ response mapper خاص بكل module.

| Table | أعمدة domain المقترحة بالإضافة للمشتركة | العلاقات/الـ response |
| --- | --- | --- |
| Files | Id INT PK؛ StorageKey NVARCHAR(450) UNIQUE؛ PublicPath NVARCHAR(MAX)؛ OriginalName NVARCHAR(MAX)؛ MimeType NVARCHAR(150)؛ ByteLength BIGINT؛ Sha256 BINARY(32)؛ CreatedByUserKey BIGINT NULL؛ CreatedAt؛ StorageState | File metadata فقط؛ storage path داخلي منفصل عن URL. upload يعيد fileId/filePath؛ nested image يعيد id/filePath. StorageKey مولد آمن ومحدود داخليًا، وليس حدًا على اسم المستخدم |
| Services | NameAr/NameEn؛ SimpleDescriptionAr/SimpleDescriptionEn؛ DescriptionAr/DescriptionEn NVARCHAR(MAX) NULL؛ SortOrder INT؛ FileId INT NULL FK | mapper يحول SortOrder إلى order وFileId إلى avatar object أو null |
| FAQs | QuestionAr/QuestionEn/AnswerAr/AnswerEn NVARCHAR(MAX) NULL | لا FileId في Swagger، ولا ترتيب مخترع في JSON |
| OurSpecialists | NameAr/NameEn/DescriptionAr/DescriptionEn/SpecialistAr/SpecialistEn NVARCHAR(MAX) NULL؛ FileId INT NULL FK | image object أو null؛ specialistAr/specialistEn لا rename إلى specialty |
| Testimonials | TitleAr/TitleEn/DescriptionAr/DescriptionEn NVARCHAR(MAX) NULL؛ Rating INT؛ FileId INT NULL FK | Rating داخلي واحد؛ إخراجه باسم starNumber أو starsNumber يحتاج حسم U02؛ avatar nested |
| Galleries | TitleAr/TitleEn/DescriptionAr/DescriptionEn NVARCHAR(MAX) NULL؛ BeforeFileId/AfterFileId INT NULL FK | beforeImage وafterImage كائنات مستقلة أو null |
| YouTubeGalleries | TitleAr/TitleEn/DescriptionAr/DescriptionEn/VideoUrl NVARCHAR(MAX) NULL | الحفاظ على videoUrl؛ لا إدخال iframe HTML من DB |
| BlogPosts | TitleAr/TitleEn/SummaryAr/SummaryEn/ContentAr/ContentEn؛ MetaTitleAr/MetaTitleEn/MetaDescriptionAr/MetaDescriptionEn NVARCHAR(MAX) NULL؛ Slug NVARCHAR(MAX)؛ SlugHash BINARY(32)؛ OurSpecialistId INT؛ FileId INT NULL؛ Status INT؛ IsFeatured BIT؛ SortOrder INT | FK specialist وFiles؛ unique SlugHash مع مقارنة slug كامل؛ index للعلاقة؛ mapper يعيد nested ourSpecialist وimage وorder والحقول المرصودة. status يسمح فقط 0/1/2 دون أسماء مختلقة |

`OurSpecialistId` غير nullable في نوع request لكنه غير required، وواجهة العلاقة تقبل أحيانًا null؛ حسم سياسة omission ووجود specialist المحذوف/غير الفعال شرط لتحديد nullable وFK النهائي. لا يحول backend غياب FK إلى 0 دون دليل. FK Files تبقى nullable كما في requests.

محتوى HTML يبقى كنص Unicode لا ينفذ SQL/HTML مباشرة؛ sanitizer الحالي في الموقع محفوظ. سياسة sanitize إضافية عند الكتابة قد تغير stored HTML؛ إن اعتمدت لاحقًا تُوثق وتختبر ولا تُنسب للأصل.

## Singleton settings والإعلانات والإحصائيات

| Table / projection | أعمدة مقترحة | ملاحظات |
| --- | --- | --- |
| SiteSettings | Id TINYINT PK مع CHECK Id=1؛ PhoneNumber/Email/Address/AboutUsAr/AboutUsEn/ContactUsAr/ContactUsEn/FacebookUrl/InstagramUrl/TwitterUrl/YoutubeUrl/TiktokUrl NVARCHAR(MAX) NULL؛ Latitude/Longitude FLOAT NULL؛ FAQsTabToggle/ServicesTabToggle/GalleriesTabToggle/YouTubeGalleriesTabToggle/TestimonialsTabToggle/OurSpecialistsTabToggle BIT؛ UpdatedAt؛ RowVersion | mapper يحفظ aboutUs_Ar وfaQsTabToggle وyouTubeGalleriesTabToggle وغيرها حرفيًا. Client/get-settings وSetting/get قد يستعملان نفس entity لكن نجاح protected response غير مثبت |
| Ads | Id TINYINT PK مع CHECK Id=1؛ Text NVARCHAR(MAX) NULL؛ Url NVARCHAR(MAX) NULL؛ IsExternal BIT؛ FileId INT NULL FK؛ IsActive BIT؛ UpdatedAt؛ RowVersion | admin request كامل؛ Client/get-ads projection المرصودة text/url/isActive فقط في inactive sample، لا نستنتج active/file branches |
| Setting/get-statistic | query projection من الجداول، لا جدول أرقام hardcoded | أسماء metrics/نطاقها/إدخال inactive/users UNKNOWN؛ لا نخترع استجابة statistics |

## فهارس واستعلامات

- index PK لكل جدول؛ index لكل FK متكرر، وبخاصة BlogPosts.OurSpecialistId وFileId وBeforeFileId وAfterFileId. unique hashes المذكورة لضبط equality دون حدود طول API إضافية؛ تحقق collision الكامل وعزل transaction واجبان.
- مقترح فهارس `(IsActive, CreatedAt, Id)` للقوائم العامة، و`(IsActive, SortOrder, Id)` للخدمات؛ BlogPosts `(IsActive, Status, IsFeatured, SortOrder, Id)` وفق execution plans لاحقة. لا وعد بأن فهرسًا واحدًا يغطي كل filter/sort.
- `OFFSET/FETCH` مع PageNumber/PageSize وCOUNT_BIG/COUNT مستقلين تحت transaction متسق. JSON totalRecords يبقى number ضمن المجال الآمن؛ المدخلات int32 توثق، defaults/caps UNKNOWN. لا integer overflow في حساب offset، ولا page=0 normalization دون gate U07.
- whitelist mapping مستقل لكل enum Sort.Field. لا interpolation لاسم حقل/اتجاه من request، ولا reflection على user string. قيم كل enum حرفيًا في المصفوفة. tie-breaker Id deterministic تصميم جديد يحتاج fixture sorting قبل اعتماده كمتوافق.
- filters/search parameters كلها typed parameters بـ `mssql`؛ LIKE wildcard escaping وسياسة البحث الجزئي/collation يجب حسمها. لا concat لـ Search في SQL. لا SQL ديناميكي إلا fragments ثابتة من whitelist.
- count + page داخل snapshot transaction إذا كان SQL يسمح وميزة database مفعلة بإجراء تشغيلي؛ لا تفعيل DB option خفيًا. بديل repeatable/serializable وفق القياس والاتساق المطلوب مع معرفة lock costs؛ isolation الافتراضي لا يضمن snapshot ثابتًا للقائمة والعدد.
- DTOs من joins/second query أو SQL projection محددة، لا `SELECT *`؛ DB column casing لا يتسرب. قيم boolean تخرج JSON boolean لا 0/1، وnullable images تخرج null لا `{id:0}`.

## المهاجرات والـ seed

`SchemaMigrations(Version INT PK, Name NVARCHAR(200), Checksum BINARY(32), AppliedAtUtc DATETIME2, DurationMs INT)`؛ SQL files versioned لا يعاد تعديل الملف المطبق. runners وSQL files المقترحة بأسمائها في [الخطة](IMPLEMENTATION_PLAN.md).

1. CLI منفصل لـ `db:migrate`, `db:status`, `db:seed`؛ لا migration في regular API أو startup request ولا endpoint عام لتشغيل SQL. يستخدم env خاصة بالخادم وصلاحية DDL منفصلة عن runtime DML محدودة.
2. يتحقق runner من database المقصودة وschema/checksum ثم `sp_getapplock` لمنع concurrent deploy migrations، transaction لكل migration قابلة لذلك، rollback على الفشل وfail-fast عند drift. إن لم يسمح المضيف applock يحتاج بديل lock مثبت؛ لا تجاهل صامت.
3. ملفات SQL لا تعتمد على `GO` كجملة T-SQL؛ runner يستخدم batches مصممة صراحة لا split ساذجًا داخل strings/comments. أسماء constraints ثابتة. لا DROP/RECREATE أو truncate أو wipe/force flag تلقائي.
4. repeatable تعني pending versions مرة واحدة وتتبع checksum؛ ليست إعادة تنفيذ DDL كل مرة. إذا وجد جدول غير مملوك/غير مطابق لا يتم تبنيه بصمت. migrations additive قدر الإمكان، backfill متدرج، backup قبل destructive operator action منفصل.
5. seed للـ singleton/roles بعد اعتماد القيم، idempotent بمفاتيح ثابتة، لا يكتب فوق بيانات حالية. admin provisioning opt-in عبر secret يقدمه المشغل أو prompt محلي؛ لا log للـ secret ولا default password، ولا reset لكلمة مرور موجودة.
6. التشغيل داخل hosting network إذا SQL محصور به: controlled console/SSH/job خاص يوفره المضيف، أو خطوة Git Deploy one-off محمية وموثقة خارج مسار requests. توافر الآلية والصلاحيات UNKNOWN؛ إن لم يوفرها المضيف يلزم مشغل يدير SQL migration من جهاز مخول. لا فتح SQL للعالم أو استخدام API عام كبديل.

## التخزين الدائم وخطة التعافي

`UPLOAD_DIR` absolute خارج `.next` وbuild checkout وأي مجلد يمحوه Git Deploy، ويفضل خارج public. القابلية للكتابة والاستمرار بعد redeploy تتطلب اختبارًا فعليًا على MonsterASP.NET؛ لا نفترض أن مسارًا على Windows دائم لمجرد أنه absolute.

رفع مصادق عبر `file` فقط، streaming مع حد 4 MiB الحالي، عداد bytes فعلي لا Content-Length فقط، توقيع الملف + MIME allowlist مقترحة PNG/JPEG/WebP/GIF وPDF وفق حاجة UI؛ لا SVG/HTML أو extension-only validation. السياسة وقائمة الأنواع INFERRED حتى U16؛ لا claims أنها legacy. filename عشوائي opaque، مسار storage من server فقط، لا basename المستخدم. realpath/containment checks تمنع `..` وencoded separators وWindows drive/UNC/junction escapes. لا قبول symlink خارج root.

نظام الملفات وSQL ليسا transaction مشتركة: يكتب temp محدودًا، يحسب hash ويفحص المحتوى، يثبت metadata بحالة pending، ينقل atomic rename داخل نفس volume ثم ready؛ compensation عند الفشل وreconciliation job للـ pending/orphans مع مهلة، لا حذف ملف referenced. لا response نجاح قبل ready. عمل upload له وحده Route Handler بعد auth مع نفس الحد عند الوصول المباشر بعيدًا عن proxy.

مقترح خدمة الملفات عبر `app/uploads/[...path]/route.ts` (مسار تشغيلي إضافي، ليس من57) تربط PublicPath بملف ready وتتحقق من containment وMIME وnosniff/cache. PDF preview الحالي يحتاج inline/Range موثوقًا إن اعتمد؛ فرض attachment أو frame-ancestors none على uploads سيكسر iframe. سياسة SAMEORIGIN للملف يمكن تقييمها دون تغيير headers الموقع العام. لا raw storage path في JSON.

backup من SQL + manifest للملفات ready + الملفات نفسها بتوقيت متناسق، احتفاظ وإذن محدود، test restore إلى بيئة معزولة مع فحص referenced IDs/hashes/URLs. ترحيل الملفات القديمة يتطلب ملكية/نسخة من الأصول مع الحفاظ على IDs/PublicPaths أو mapping داخلي لا يغير helpers. لا يكفي إبقاء روابط ASP.NET إلى الأبد: Phase 6 gate أن جميع الأصول الأساسية تستضاف محليًا وتعمل بعد redeploy واسترجاع backup.

## شروط اعتماد التصميم

حسم U02/U03/U04/U05/U06/U07/U08/U09/U10/U11/U14/U15/U16/U17 قبل إعلان توافق متعلق بها. foundation يمكن أن يبنى معزولًا بعد تعليمات المرحلة التالية، لكن لا cutover ولا seed production ولا migrations على بيانات قائمة ضمن هذا التدقيق.
