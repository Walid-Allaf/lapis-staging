> Phase7 clean-start policy (2026-11-11) supersedes historical release requirements below. Use a NEW database, immutable migrations0001-0007, explicit neutral initialization and one operator-supplied SuperAdmin; empty content/uploads; NO historical import or credential transfer. Phase7A is local only. Read [PHASE7_RELEASE_READINESS](PHASE7_RELEASE_READINESS.md), [PHASE7_MIGRATION_BOOTSTRAP](PHASE7_MIGRATION_BOOTSTRAP.md) and [PHASE7_RELEASE_RUNBOOK](PHASE7_RELEASE_RUNBOOK.md) for current evidence, guarded production CLI design and remaining blockers. No hosting/deployment authorization is implied. Older phase statements below describe their historical scope.

> Phase6 current repository state,2026-11-11: website/dashboard acquisition is now internal by default; no hosted release occurred. The older phase-specific external/isolation instructions below are historical and superseded only for the authorized server-adapter cutover. Read [PHASE6_FULL_INTEGRATION](PHASE6_FULL_INTEGRATION.md), [PRODUCTION_ENVIRONMENT](PRODUCTION_ENVIRONMENT.md), [DATA_IMPORT_PLAN](DATA_IMPORT_PLAN.md) and [CUTOVER_ROLLBACK_PLAN](CUTOVER_ROLLBACK_PLAN.md) before release.
>
> Set validated APP_ORIGIN for build and start (HTTPS required with SQL_ENV production). next.config compiles both public API/SEO bases from it and configures the exact image host; rebuilding is required after origin changes. Only public origins enter next.config.env. Actual .env was not modified. Existing SQL/JWT/SMTP/private UPLOAD_DIR guards remain; seven migrations are unchanged and never auto-run. A missing settings singleton/schema/SQL produces public503 rather than legacy fallback. Populate only reviewed authorized data, never synthetic production rows.
>
> New test:integration and test:integration:sql validate registry/cache/CSRF/import and actual production HTTP with legacy networking blocked. The latter requires a matching3197-origin build and a brand-new disposable SQL target. Existing full regression suites pass. import:inventory is explicit read-only public legacy GET, import:dry-run validates operator exports only and has no apply mode. No public import/debug endpoint exists. Logout now revokes SQL state and cookie session reads are cryptographic/SQL-backed. Host/browser/SMTP/data-import/redeploy/backup/restore and private production-provision procedures remain Phase7 gates; no DNS/IIS/web.config/production change was made.

> Phase5 current addition, 2026-11-11: FileUpload/public media implemented in isolation, no deployment or production mutation. Seven migrations remain unchanged; no migration is needed for storage. Configure server-only UPLOAD_DIR as an absolute dedicated private persistent folder outside the running app root and its ancestors; no fallback inside public/.next/checkout. Existing nonempty unmarked roots are rejected. Keep current NEXT_PUBLIC_API_BASE_URL/Next image configuration/dashboard session/proxy unchanged. Read [PHASE5_FILE_STORAGE](PHASE5_FILE_STORAGE.md), [STORAGE_ARCHITECTURE](STORAGE_ARCHITECTURE.md), [STORAGE_RECOVERY](STORAGE_RECOVERY.md) and the [manual MonsterASP checklist](MONSTERASP_STORAGE_CHECKLIST.md).
>
> Verify actual NTFS app identity ACLs, same-volume hard links, storage quota, provider Git Deploy exclusion/protection, request caps and private-directory availability before host use. No web.config edit was made. Upload counts actual file4MiB/total4,202,576bytes; the existing proxy has4MiB plus framing and30s timeout. IIS/edge settings must permit framing for the exact-limit case and may return non-JSON errors. New test commands: test:files and test:files:integration (new acknowledged disposable SQL + temporary storage). storage:recover is private nonproduction audit by default, repair only with explicit confirmation, never deletion. Paired SQL+byte backups and restore rehearsal are mandatory host gates; local restart success is not redeploy persistence. Production repair procedure remains unapproved/not implemented by this CLI.

> Phase 4 current runbook addition, 2026-11-11: runtime Next16.4.6; schema seven migrations/19 tables. All 43 content APIs are isolated, with no deploy, live transport switch or production migration. Earlier phase-specific counts below are historical. Read [PHASE4_CONTENT_APIS](PHASE4_CONTENT_APIS.md) and [content contracts](CONTENT_API_CONTRACTS.md) before any operator rollout.

## Phase 4 nonproduction verification

1. Use the existing guarded SQL configuration/acknowledgement and explicit CLI only. No additional Phase4 environment variables are required. Anonymous public GETs do not load JWT keys; authenticated routes need the existing Phase3 JWT/session configuration. Runtime needs existing DML and application-lock permissions; do not grant runtime server-wide privileges.
2. On a separately authorized nonproduction target, review status/backups, then run db:migrate through 0007 and db:status. Unique non-null slug-hash duplicates stop 0007; review them without automatic rewrite/reset/forced retry. Never alter applied 0001–0007. Test against a new disposable database for each integration suite; never reuse existing data as an empty test fixture. The foundation synthetic failure fixture is now version8.
3. Run test:content and test:content:integration as well as all existing checks. Integration tests require SQL_ALLOW_TESTS and matching newly created lapis_test acknowledgement, not a development/production target. No upload is required; ready file metadata fixtures remain test-only.
4. Verify short transaction/app-lock latency and the shared pool (default3/min0) against actual host limits. Search/LOB sort plans, TLS trust, backup/restore and private one-off migration access remain host gates. Local Express tests do not verify MonsterASP.NET.
5. Preserve the external API base URL, dashboard cookies/proxy/session and existing public fetch/cache tags. New isolated responses are no-store. Do not wire revalidation, internal dispatch or public traffic here; Phase6 must coordinate cache invalidation and auth cutover explicitly.
6. dbo.Files metadata is available, but multipart upload, physical file serving and durable storage/backup/redeploy checks await Phase5. Existing future upload sections below are design guidance, not implemented functionality. No production media URLs were fabricated.

Generated local test SQL logins are disabled and temporary credential JSON removed after validation; disposable databases are retained without drop/reset. No runtime cleanup job or database-destructive command is introduced.

# تشغيل أساس SQL Server — Phase 2

> تحديث Phase3: runtime الحاليNext16.4.6، والمخططستةإصدارات/19جدولًا؛ الدليلأدناه يحفظأساسPhase2 معإضافاتAuth هنا. dashboard/session/proxy مازالتعلىASP.NET؛ APIs الجديدة معزولة، دونproduction migration أوdeployment. اتبع [تقريرPhase3](PHASE3_AUTHENTICATION.md) و[مراجعةالأمن](SECURITY_REVIEW.md) للتفاصيلالأحدث.

## إعداد Auth المعزول

AUTH_JWT_KEYS مطلوب كـJSON object منkid إلىbase64 key عشوائي32byte علىالأقل؛ AUTH_JWT_ACTIVE_KID يختارالمفتاحالموقع؛ AUTH_JWT_ISSUER/AUDIENCE مطلوبان؛ AUTH_TOKEN_TTL_SECONDS default900 ومجال60..3600. AUTH_OTP_KEY سرمستقل عشوائي32byte، لايعادمفتاحJWT. توثيقrotation فيSECURITY_REVIEW؛ لا أسرارNEXT_PUBLIC أوargs/logs.

SMTP_HOST/PORT(default587)/SECURE(defaultfalse)/USER/PASSWORD/FROM تضبطtransport فقط؛ TLS أوSTARTTLS معcertificate verification. لاruntime testmail flag؛ mailcapture محقونفيtestcode. missing SMTP ⇒503 لعملياتالإرسال، لاsuccess وهمي. actual outbound connectivity/delivery مازالتhosting-dependent.

بعد `db:migrate` إلى0006 علىقاعدةغيرإنتاجيةمصرحبها، نفّذ `db:status` وتحققمنcurrent. duplicate normalized-email hashesتوقف0006 قبلإضافةuniqueindex؛ راجعالبيانات، لاforce/merge/reset. user flags/rolesNULL لا تُملأ تلقائيًا وتفشلauthمغلقًا.

الـCLI الخاص `npm run db:bootstrap-admin` يحتاجflags/secret provisioning الموضحةفي[دليلbootstrap](ADMIN_BOOTSTRAP.md)، ويرفضproduction. تشغيلSQL داخلشبكةالمضيف وprivate one-off jobs غيرمفترض؛ لاpublic migration/bootstrap endpoint. deploy artifact يحتاجruntime TS/CLI deps وملفاتSQL؛ mssql/nodemailer external Node packages وSQL glob يضمنانالـtracing الصحيح.

الفحوص الجديدة: `npm run test:auth` و`npm run test:auth:integration`. الاختبارالأخير يحتاجقاعدةtest جديدةفارغةوflags/ack، ويستعملmail capture داخليًا. foundation integration أيضًايحتاجقاعدةمنفصلةجديدة؛ failure fixture أصبح0007 مؤقتًا، وليسملفمنتج. لايعادتهيئةقاعدةاختبارقائمة.

retention/purge لإثباتاتOTP/reset وسجلاتالأمن وquota للبريد وclock alignment وpool/SMTP latency تحتاجإجراءتشغيليًا معتمدًا قبلproduction. لايحذفهذاالتسليمبياناتهويةقديمة أوينشرjob تلقائيًا. حافظعلىAPI base الخارجي وcookie/session flow الحاليينحتىcutover مصرحومختبر.

هذا الدليل خاص بقاعدة **معزولة غير إنتاجية**. الموقع واللوحة لا يزالان يتصلان بـASP.NET كما كانا؛ لا cutover أو auth جديد أو content endpoints في هذه المرحلة. لا توجد آلية HTTP لتنفيذ migrations. لم يُجر نشر أو اتصال SQL على MonsterASP.NET.

## الإعداد المحلي

1. استخدم SQL Server منفصلًا للاختبار أو قاعدة جديدة فارغة على instance محلي. لا تستخدم قاعدة development قائمة لاختبارات DDL. لا ينشئ runner قاعدة أو login ولا يسقطهما.
2. اضبط TCP/IP وSQL Authentication حسب تثبيت SQL المحلي. driver الافتراضي لـ `mssql` هو Tedious؛ التطبيق لا يتطلب native Windows authentication addon. حدد host وTCP port صريحين؛ `SQL_SERVER` ليس connection string ولا يتضمن `\\SQLEXPRESS`. SQL Browser/named-instance discovery ليسا مطلوبين عند معرفة المنفذ.
3. احتفظ بالأسرار في process environment أو `.env.local` المستبعد من Git؛ ابدأ من [.env.example](../../.env.example) دون الكتابة فوق `.env` الموجودة. المشروع السابق لا يملك SQL conventions؛ كان يحتوي `NEXT_PUBLIC_API_BASE_URL` فقط، وبقي كما هو.
4. account المهاجرات يملك DDL داخل **القاعدة المعزولة فقط** وحق تنفيذ `sp_getapplock`/extended properties. account runtime لاحقًا يجب أن يكون محدود الصلاحيات؛ لا تعطه sysadmin أو create database. اختبارات هذا التسليم استخدمت login مؤقتًا يملك db_owner في قواعد الاختبار التي أنشأها التدقيق فقط.

| Variable | المعنى والقيمة الافتراضية |
| --- | --- |
| SQL_ENV | مطلوب: development/test/production؛ جميع CLI writes في Phase 2 ترفض production |
| SQL_SERVER / SQL_PORT | server-only host؛ port افتراضي1433؛ لا عناوين أو credentials في health response |
| SQL_DATABASE / SQL_USER / SQL_PASSWORD | اسم القاعدة وSQL credentials؛ جميعها مطلوبة عند محاولة الاتصال فقط |
| SQL_ENCRYPT | true افتراضيًا؛ لا downgrade تلقائي بعد فشل TLS |
| SQL_TRUST_SERVER_CERTIFICATE | false افتراضيًا؛ true محليًا فقط عند شهادة self-signed معتمدة لهذا الاختبار؛ production يرفض true |
| SQL_POOL_MAX | 3 افتراضيًا، مجال1..10، min=0؛ migrations تحتاج2 على الأقل؛ health لا يحتاج migration connection إضافية |
| SQL_CONNECT_TIMEOUT_MS | 5000 افتراضيًا، مجال500..30000 |
| SQL_REQUEST_TIMEOUT_MS | 15000 افتراضيًا، مجال1000..120000؛ lock acquisition لا ينتظر runner آخر |
| SQL_EXPECT_DATABASE | إقرار صريح يطابق SQL_DATABASE ونتيجة DB_NAME() حرفيًا قبل writes |
| SQL_ALLOW_MIGRATIONS | true صريح لتطبيق DDL؛ false/غياب القيمة يمنع التنفيذ |
| SQL_ALLOW_SEED | true صريح للـ development seed؛ مستقل عن migration flag |
| SQL_ALLOW_TESTS | true صريح + SQL_ENV=test + اسم lapis_test_ متبوع بـ16 hex characters لاختبارات التكامل |
| NEXT_PUBLIC_API_BASE_URL | يبقى عنوان ASP.NET السابق؛ ليس مكانًا لأي SQL credential |
| UPLOAD_DIR | placeholder موثق للمرحلة5؛ غير مستخدم في Phase 2 |

Boolean values هي `true`/`false` حرفيًا؛ لا تحويل صامت لقيمة خاطئة. scripts تستعمل `@next/env` بنفس precedence الخاص بـNext، وتبقي process env أعلى أولوية، دون تعديل الملفات. إعداد pool يقرأ lazily؛ غياب SQL لا يعطل build أو صفحات الموقع الحالية.

SQL Express المحلي قد يستعمل شهادة self-signed: تم الاختبار محليًا مع encrypt=true وtrust=true **صريحًا**، وليس كـ fallback برمجي. اتصال production يجب أن يستخدم اسمًا مطابقًا للشهادة وسلسلة ثقة سليمة مع encrypt=true/trust=false؛ إن فشل، أصلح trust/name/CA مع المضيف. لا تجعل رفض الشهادة مبررًا لتغيير الإعداد افتراضيًا أو خفض الحماية.

## الأوامر

بعد `npm ci` مع dependencies اللازمة، استعمل:

```text
npm run db:status
npm run db:migrate
npm run db:status
npm run db:seed
```

الأوامر cross-platform وتستعمل Node + `tsx` الموجود كـ **runtime dependency** لتحميل نفس TypeScript modules التي يستعملها Next؛ لا نسخة JavaScript مكررة من validation/migrations، ولا اعتماد على dev-only TS loader وقت التشغيل. `--conditions=react-server` يحتفظ بعلامة server-only في كود الإنتاج ويتيح تشغيله في CLI. استعمل npm scripts كما هي؛ لا تشغل `.mjs` مباشرة دون شروط التحميل.

`db:status` read-only، لا ي bootstrap history، ويخرج JSON آمنًا بـ state/applied/pending/latestApplied. exit0 عند current؛ exit1 عند uninitialized/pending/blocked/drift أو فشل الاتصال. migrations وseed تخرجان counters فقط، ولا config/SQL/driver stack. جميع command errors تستعمل codes محررة.

pool واحد لكل process، مشترك بين الطلبات، max3/min0/idle30s افتراضيًا. كل Next worker أو CLI مستقل له pool خاص؛ احسب مجموع workers × pool max ضمن quota للمضيف. CLI يغلق pool في finally؛ لا close بعد كل HTTP request. serverless/عدةworkers ليست pool واحدة عابرة للعمليات.

## بروتوكول المهاجرات

1. يراجع runner guards واسم DB الفعلي ثم catalog filenames/checksums. ملفات `NNNN_name.sql` متسلسلة من0001، single-batch بلا GO؛ hash SHA256 على bytes الأصلية، بما فيها line endings. `.gitattributes` يفرض LF لهذه الملفات عند Git checkout على Windows والمضيف. لا تعدل ملفًا بعد تطبيقه أو تبدل line endings فيه؛ تحقق checksums بعد Git Deploy قبل التطبيق. لا `GO` split أو sqlcmd directives.
2. يحجز transaction-scoped `sp_getapplock` على `LAPiS:foundation:migrations` في اتصال مثبت، بينما يستعمل اتصالًا ثانيًا للـ DDL. القفل نفسه يغطي bootstrap وكل commit وتسجيل الفشل، وseed يستعمل المورد نفسه. يُرفض runner متزامن بـ DB_LOCK_UNAVAILABLE دون انتظار غير محدود. يتحقق runner من بقاء القفل قبل كل ملف تالٍ.
3. ينشئ SchemaMigrations فقط لقاعدة بلا user tables؛ يضع extended property `LAPiS.Foundation=2`. جدول history غير مملوك أو قاعدة فيها جداول قائمة لا تُتبنى بصمت. لا schema reset، ولا auto migration عند startup/health/render.
4. يسجل running intent **خارج DDL transaction** أولًا. ينفذ SQL للملف وتحديث applied/checksum/timestamp/duration في transaction واحدة، مع XACT_ABORT. عند الفشل يتراجع DDL ويسجل failed مع code عام. انقطاع العملية قد يترك running؛ كلاهما يمنع auto-rerun.
5. ملفات مطبقة يجب أن تطابق الاسم والإصدار والـchecksum؛ missing/modified/out-of-order history توقف بـ DB_MIGRATION_DRIFT. rerun كامل ناجح يطبق صفر ملفات.

الـ validator يمنع resets وUSE/GO/transaction control/EXEC وCREATE/ALTER DATABASE أو LOGIN في ملفات migrations. هذه حماية من الخطأ وليست sandbox لـ SQL غير موثوق؛ الملفات reviewed trusted code، ولا تقبل SQL من request.

### مراجعة فشل/انقطاع

- أوقف عمليات DDL/seed المتزامنة وحدد القاعدة الصحيحة؛ لا تضف force flag أو تمسح history تلقائيًا.
- احفظ backup وتصدير صفوف history ذات الصلة كأثر مراجعة. افحص schema وSQL transaction outcome؛ timeout أثناء commit قد يعني أن العملية طبقت فعلًا رغم فشل وصول acknowledgement.
- applied + checksum مطابق: لا تعِد التنفيذ؛ إصلاح schema لاحق بملف إصدار جديد additive فقط. applied + drift: استعد artifact الأصلي المطابق من source control، ولا تعدل checksum في القاعدة لمجرد إسكات التحذير.
- failed/running: يجب أن يؤكد المشغل أن DDL transaction تراجعت بالكامل وأنه لا توجد جلسة حية تنفذها. قارن schema بنسخة ما قبل المحاولة. إن كانت النتيجة غير محسومة، استعد القاعدة المعزولة من backup موثوق إلى هدف جديد وراجعها، ولا تخمّن حالة البيانات.
- لا يوجد `db:retry` تلقائي في Phase 2. بعد المراجعة والاحتفاظ بسجل المحاولة، يمكن للمشغل إعداد إجراء إصلاح منفصل ومراجع لصف محاولة غير مطبقة، مقيد بالقاعدة/version/checksum/status، أو إعادة التجربة على قاعدة اختبار جديدة. لا حذف لصف applied ولا تعديل tables production ضمن هذا الدليل. أي إعادة محاولة يجب أن تكون فعلًا صريحًا موثقًا، لا rerun صامتًا.
- failure logging نفسه قد يفشل؛ بقاء running مقصود ويغلق الباب أمام replay. نجاح rollback لا يعوض مراجعة الأخطاء في backup/network/permissions.

## Seed

`db:seed` يتطلب environment غير إنتاجية وflag/ack matching وschema current وقفل المهاجرات. يضيف marker ثابت `foundation-v1` إلى DevelopmentSeedHistory مرة واحدة ويعيد applied=false عند التكرار. لا ينشئ settings/roles/users أو fake content أو كلمات مرور؛ بيانات domain مؤجلة بسبب U05/U06/U08/U11/U15. هذا scaffolding آمن قابل للتكرار، وليس seed لحساب مدير.

## Health

`GET /api/health` جديد، Node.js runtime وforce-dynamic/no-store. لا يستعمل migration runner أو seed، ولا يقفل schema أو يغيرها. مثال response:

```json
{"status":"ok","application":"available","database":"up","migrations":"current"}
```

200 فقط عند connectivity وcatalog/history current. 503 عند not_configured/unavailable أو migrations uninitialized/pending/blocked/drift/unavailable. application=available يوضح أن العملية تعمل ولو لم يجهز SQL. لا عناوين/DB names/versions/credentials/SQL/exception stacks في الرد. include في next.config يضمن أن ملفات SQL الخمسة تدخل traced output للـhealth؛ لم تتغير image settings أو headers القائمة. لا `/api/health/db` من الخطة القديمة: تعليمات Phase 2 حددت `/api/health` وتقدمت عليها.

## تحقق محلي قابل للتكرار

```text
npm run test:db
npm run test:db:integration
npm run test:dashboard-auth
npm run test:sanitize
npm run test:dashboard-proxy
npm run lint
npm run typecheck
npm run build
```

integration يحتاج **قاعدة جديدة فارغة** `lapis_test_<16 hex>` وflags الثلاثة true وmatching ack. يرفض قاعدة سبق استعمالها ولا ينفذ reset. دون credentials/SQL_ALLOW_TESTS يُظهر skip صريحًا؛ لا يعد ذلك نجاح اتصال SQL. لا يشغل tests على قاعدة development/production قائمة، حتى لو غُيّر env label.

الاختبار يشمل11 حالة SQL حقيقية؛ parent test يظهر نتيجة إضافية في node:test. اختبار الفشل الأخير يترك failed record للإصدار0006 fixture في القاعدة disposable عن قصد، ولا يضيفه إلى repository. schema tables للملف الفاشل تُراجع كمتراجعة بالكامل؛ تشغيل catalog المنتج على هذه القاعدة لاحقًا سيبلغ drift لأن fixture ليس من الملفات الخمسة. لا تستعمل قاعدة اختبار انتهت بهذا السيناريو لتشغيل الموقع؛ ابدأ قاعدة فارغة جديدة للاختبار التالي. يُحذف temp catalog فقط، لا بيانات قاعدة قائمة.

## MonsterASP.NET: ترتيب والتحقق التشغيلي

العمارة تبقى Next.js واحدًا مع Git Deploy/Build & Publish وWindows/IIS وSQL؛ لا Docker/custom server أو عملية Express. الحد الأدنى من engines المثبتة هو Node>=20.9.0 بسبب Next16.2.7؛ يجب أن يؤكد المضيف runtime الفعلي وbuild/start/PORT وعدم إزالة ملفات SQL أو runtime CLI dependencies من publish artifact. لا تغيير IIS في هذه المرحلة.

1. احصل على قاعدة غير إنتاجية مخصصة، TCP endpoint/certificate behavior وDDL/runtime accounts وquota للاتصالات. لا تستعمل قاعدة الإنتاج الوحيدة المتاحة لتجاوز هذا الشرط.
2. خذ backup SQL موثقًا قبل DDL على بيانات مقبولة مستقبلًا؛ migrations لا تعمل backup تلقائيًا. استعمل restore drill معزولًا، ولا تعتمد على code rollback لإرجاع data/schema. سياسة uploads/SQL+files backup التفصيلية محفوظة في تصميم Phase1 وتنفذ في Phase5.
3. ضع env عبر لوحة المضيف؛ لا commits للأسرار، ولا SQL في NEXT_PUBLIC، ولا وضع كلمات مرور في command-line arguments أو logs. أبق API base الخارجي كما هو خلال Phase2.
4. جهز نفس commit/lockfile وملفات migrations/CLI/runtime deps داخل الشبكة المخولة. `db:status` ثم، فقط للهدف غير الإنتاجي المعتمد، `db:migrate` ثم `db:status`. لا migration مع كل application restart أو regular request.
5. **لا نفترض shell أو SSH أو build hooks:** اسأل المضيف عن آلية one-off private command/build job تدعم Node وتشغيل artifact المعتمد مع الأسرار داخل hosting network. استعملها فقط إذا كانت موثقة ومصرحًا بها. لا تحول build عام إلى migration تلقائية لكل deploy.
6. إن لم تتوافر command facility، يمكن للمشغل استعمال جهاز/agent مخول داخل الشبكة لتشغيل نفس CLI. إن لم تتوافر أي آلية كهذه، فهذه نقطة منع يجب حلها مع دعم المضيف؛ لا public migration endpoint، ولا فتح SQL للعالم، ولا تشغيل ملفات SQL يدويًا مع تجاهل history/checksums.
7. راقب health الآمن ثم تحقق من pool limits وTLS والصلاحيات. Phase2 CLI يرفض SQL_ENV=production حتى مع flags؛ دعم production migrations يحتاج تعليمات نشر مستقلة ومراجعة صريحة، وليس إعادة تسمية production إلى development.

ما لم يتحقق هنا: وصول hosting SQL، شهادته، shell/job availability، build/publish filesystem، assigned PORT، DDL/applock permissions، connection quota، backup restore على المضيف. لا نشر إنتاجي في هذا التسليم.

## مصادر وآثار التحقق

التفاصيل API للـpool وtransactions والـdefault driver راجعت مقابل [المصدر الرسمي لـnode-mssql](https://github.com/tediousjs/node-mssql). قواعد Route Handlers قرئت من docs المحلية لـNext16.2.7؛ النتائج العملية وحدودها في [PHASE2_FOUNDATION.md](PHASE2_FOUNDATION.md).
