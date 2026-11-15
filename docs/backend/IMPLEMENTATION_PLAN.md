> Phase6 local internal integration complete,2026-11-11. Public/server/dashboard adapters now call existing internal handlers/services with preserved frozen frontend contracts, public60s tagged caching, signed SQL session checks/logout revocation and exact same-origin media optimization.56 operations implemented, optional2FA toggle blocked; no new migration/dependency. [Phase6 report](PHASE6_FULL_INTEGRATION.md) is authoritative over historical planned-only/external transport statements below. Data inventory and dry-run are readonly, actual historic import and authorized protected exports remain release gates. Stop here: no deployment, production mutation or Phase7 execution.

> Phase5 complete locally in isolation, 2026-11-11: FileUpload, private persistent storage, ready-media GET/HEAD and guarded nonproduction recovery are implemented and tested. Total56 original operations implemented, public toggle-2fa still blocked. No new migration/dependency; seven immutable migrations/19 tables. [Phase5 report](PHASE5_FILE_STORAGE.md) supersedes historical upload-only planning below. Stop here: no frontend/proxy/auth/asset base change and no Phase6 integration. Final base/Next Image allowlist/import, actual hosting private path/redeploy/backup/restore and Phase7 checklist remain outstanding.

> Phase 4 complete in isolation, 2026-11-11: 43 content operations are implemented and SQL/HTTP tested, yielding 55 implemented of 57 original operations. Public toggle-2fa remains explicitly blocked (Phase3); FileUpload remains unimplemented (Phase5). Seven migrations/19 tables, no production changes. [Phase4 report](PHASE4_CONTENT_APIS.md) and [per-operation contracts](CONTENT_API_CONTRACTS.md) supersede historical planned-only and count statements below. The existing public/dashboard API consumers, sessions and ASP.NET transport are unchanged. Stop after Phase4: Phase5 storage/uploads and Phase6 frontend dispatch/cache/session cutover require further instructions. Host validation/import/unknown historical behavior remain release gates, not implied completed work.

# خطة التنفيذ التدريجية — لا تنفيذ بعد المرحلة الأولى

> تحديث Phase3: نُفذت12عمليةAuth/User معزولة بسياساتجديدة ومختبرة؛ toggle-2fa محظورة، والـ44عمليةالمتبقية لمتنفذ. Next الحالي16.4.6. [تقريرPhase3](PHASE3_AUTHENTICATION.md) هوالمرجعالأحدث؛ الخطةأدناه تحتفظبتسلسلPhase1 التاريخي. لاcutover أوPhase4 ضمنالتسليم.

> تحديث Phase2،2026-11-11: استجابةً لتعليمات لاحقة نُفذ أساس SQL فقط واختبر محليًا، كما في [تقرير المرحلة الثانية](PHASE2_FOUNDATION.md). هذه الخطة أدناه تحفظ ترتيب Phase1 التاريخي للـAPI. endpoint التشخيص الفعلي هو `/api/health` حسب الطلب الأحدث، وليس `/api/health/db`. ملفات CLI تستعمل runtime tsx لتحميل TypeScript نفسه، لا dependency dev-only. لا auth/content route من57 نُفذ ولا Phase3 بدأت.

2026-11-11. الوضع الحالي: **Phase 1 completed as an audit, replacement backend NOT_IMPLEMENTED**. هذه خطة **INFERRED**؛ لا موافقة نشر أو كتابة إلى legacy أو SQL production. التعليمات الحالية تطلب التوقف هنا وانتظار أمر المرحلة التالية.

## Architecture المستهدفة

تطبيق Next.js واحد قائم + SQL Server + persistent local file storage + deployment واحد على MonsterASP.NET. لا Express/Nest/ASP.NET جديد، ولا custom Node HTTP server، ولا Docker أو VPS. TypeScript strict مفعّل أصلًا. Route Handlers رفيعة، Node.js runtime؛ طبقة server-only validation/auth/services/repositories/response mapping/storage.

كل original endpoint يحتفظ بالـ method/path/casing/query/body/header/multipart contract. public Server Components والـ dashboard adapters تستعمل dispatcher داخليًا إلى نفس الخدمات بدل HTTP إلى نفس origin. التفويض والتحقق لا يعيشان داخل HTTP handler وحده حتى لا يتجاوزهما internal dispatch. cookie موجودة على /dashboard لا /api؛ original `/api/...` يستقبل Bearer مستقلًا كما في Swagger مع public read exceptions المثبتة/المعتمدة.

تُفصل أربع حقائق: طلب موثق، طلب تستخدمه الواجهة، استجابة مرصودة، وتصميم مقترح. توسعات التوافق المحتملة U02/U03/U04/U17 تسجل صراحة ولا تمسح الفرق بين الأصل والبديل.

## الملفات القائمة التي ستحتاج تعديلًا لاحقًا

جميعها **planned only**؛ لم يتغير أي منها في Phase 1.

| الملف بالضبط من جذر المشروع | سبب التعديل المسموح لاحقًا | ما يحفظه |
| --- | --- | --- |
| `lib/api/client.ts` | تبديل server transport إلى dispatcher/cache wrapper مع إبقاء API helper signatures | apiFetch<T> وApiResponse وquery omission وcreateAssetUrl وexception behavior؛ لا تغييرات على صفحات الموقع أو lib/api module callers |
| `dashboard/server/session.ts` | تحقق JWT تشفيري قبل الوثوق بالهوية/إصدار session، مع الحفاظ على helpers exports/projection | cookie name/attributes/path و3500 byte cap وexpiry behavior |
| `app/(dashboard)/dashboard/api/session/login/route.ts` | استدعاء auth service داخليًا بدل external fetch؛ mapping آمن للأخطاء بعد U17 | email/password الحاليان، session response بلا token، حدود الجسم، CSRF وstatus semantics؛ دعم code للـ original API لا يعني تغيير الشاشة |
| `app/(dashboard)/dashboard/api/session/route.ts` | التحقق من signed token وحالة الحساب عبر server session service | GET projection و401 وno-store |
| `app/(dashboard)/dashboard/api/session/logout/route.ts` | revoke server session إن اعتمدت AuthSessions، ثم clear الحالي | POST idempotent 204 وCSRF وcookie clearing |
| `app/(dashboard)/dashboard/api/proxy/[...path]/route.ts` | internal dispatch بدل upstream HTTP، وهوية موثقة، الحفاظ على محدودية المسار والجسم والملفات | allowlist/CSRF/status/body/headers/no-store/401 cookie clearing/cache invalidation؛ لا توسيع إلى User أو admin auth |
| `package.json` | scripts db:migrate/status/seed وtests الخاصة بالبديل؛ deps اللازمة فقط | dev/build/start وبقية scripts الحالية |
| `package-lock.json` | lock متزامن مع التبعيات المعتمدة | reproducible install، بلا upgrade غير مرتبط |
| `next.config.ts` | **مشروط**: السماح بـ image hostname المحلي النهائي عند cutover إذا تطلبته remotePatterns | لا broad wildcard أو تعديل SEO/headers الموقع لكسر PDF preview |

`dashboard/api/proxy-policy.ts` يبقى كما هو ما دام allowlist/tags يمكن استعمالها مباشرة، وهو الاحتمال المقترح. لا حاجة لتعديل endpoint constants أو dashboard/api/axios.ts أو urls.ts أو session-contract.ts أو auth.ts أو feature services/DTOs/forms/hooks/validation. لا تعديل `proxy.ts` لمجرد الانتقال الداخلي. أي احتياج لاحق لتغيير ملف client frozen يعد blocker يحتاج إعادة تصميم backend، لا إذنًا ضمنيًا.

`.env` لا يتغير الآن ولا يُكتب في repository. في مرحلة الإعداد فقط يضيف المشغل أسرار SQL/JWT/SMTP/UPLOAD_DIR عبر hosting settings. يمكن إضافة `.env.example` بمتغيرات فارغة دون secrets، و`.gitignore` لمنع ملفات storage إن احتاج المشروع ذلك؛ الـ UPLOAD_DIR الفعلي خارج checkout. `NEXT_PUBLIC_API_BASE_URL` يتحول لاحقًا إلى public origin المحلي المعتمد لخدمة الأصول؛ هو build-time public value يحتاج build صحيحًا. لا تُغيّر helpers لبناء URLs.

## ملفات foundation الجديدة المقترحة بالضبط

| الملفات | الغرض |
| --- | --- |
| `server/backend/config.ts` | env validation خادمي، بلا تسريب SQL/JWT إلى NEXT_PUBLIC |
| `server/backend/db/pool.ts`، `server/backend/db/transaction.ts`، `server/backend/db/parameters.ts` | mssql pool lifecycle وtransactions وtyped parameters؛ لا SQL concatenation |
| `server/backend/http/handler.ts`، `server/backend/http/request.ts`، `server/backend/http/response.ts`، `server/backend/http/errors.ts` | boundary/limits/literal dotted query parsing/language، envelope mapping، redacted error handling |
| `server/backend/dispatch.ts` | routes-to-services registry للـ HTTP والـ server adapters دون bypass authorization |
| `server/backend/auth/password.ts`، `server/backend/auth/jwt.ts`، `server/backend/auth/authorize.ts`، `server/backend/auth/otp.ts`، `server/backend/auth/mail.ts`، `server/backend/auth/rate-limit.ts` | hashing/signature checks/claims/roles/random OTP/sandboxable delivery/persistent limits؛ policies تثبت قبل التشغيل |
| `server/backend/cache/public-data.ts`، `server/backend/cache/invalidate.ts` | equivalent 60s/tag caching للـ direct DB وinvalidation بعد commit مع existing PUBLIC_CACHE_TAGS |
| `server/backend/storage/local.ts`، `server/backend/storage/validate-file.ts` | streaming persistent files/type signatures/containment/cleanup؛ MIME validation لا يثق extension |
| `server/backend/openapi/document.ts` | OpenAPI original routes + response evidence ومخالفات موثقة، لا ادعاء verified غير حقيقي |
| `scripts/db/migrate.mjs`، `scripts/db/status.mjs`، `scripts/db/seed.mjs`، `scripts/db/shared.mjs` | CLIs Windows-compatible باستعمال runtime deps لا تعتمد dev TS loader مفقودًا عند production install |
| `db/migrations/0001_identity.sql`، `db/migrations/0002_files.sql`، `db/migrations/0003_content.sql`، `db/migrations/0004_settings_ads.sql`، `db/migrations/0005_indexes.sql` | versioned additive DDL، constraints/indexes؛ migration tracking bootstrap داخل runner مضبوط checksum/locking |
| `app/api/health/db/route.ts` | operational health محمي، يخرج status فقط دون credentials/SQL؛ ليس من57 |
| `app/api/openapi/route.ts` | وثيقة API المولدة، لا tokens أو records؛ ليس من57 |
| `app/uploads/[...path]/route.ts` | approved file serving مع URL mapping آمن؛ ليس من57 |
| `docs/backend/DEPLOYMENT_RUNBOOK.md` | لاحقًا: أوامر المضيف الفعلية وخطة migration/cutover/restore بعد التحقق |

لا تُنشأ هذه الملفات في Phase 1. حدود modules أدناه مقترحة؛ لا تستخدم generators لتضع placeholder 200 وتعتبر العملية مكتملة.

scripts المستقبلية حرفيًا: `db:migrate` يشغل `node scripts/db/migrate.mjs`، و`db:status` يشغل `node scripts/db/status.mjs`، و`db:seed` يشغل `node scripts/db/seed.mjs`. ترتيب migration يعالج علاقة Users.FileId/Files.CreatedByUserKey الدائرية بإضافة FK المستخدم إلى Files بعد إنشاء Files في 0002، لا FK إلى جدول غير موجود في 0001.

## ملفات modules الجديدة

كل خلية تسمي الملفات المحددة المطلوب تنفيذها لاحقًا تحت جذر المشروع؛ Client يشارك repositories الأصلية ولا يكرر SQL بلا داعٍ. dependencies مثل `mssql`, `zod` وJWT/mail library مختارة عند التنفيذ فقط، لا تثبيت الآن؛ password crypto يمكن أن يستعمل Node crypto إن حقق السياسة بدل native dependency إضافية.

| Module | ملفات جديدة |
| --- | --- |
| Authentication | `server/backend/modules/auth/validation.ts`، `service.ts`، `repository.ts`، `mapper.ts` داخل نفس المجلد |
| User | `server/backend/modules/users/validation.ts`، `service.ts`، `repository.ts`، `mapper.ts` داخل نفس المجلد |
| Ads | `server/backend/modules/ads/validation.ts`، `service.ts`، `repository.ts`، `mapper.ts` داخل نفس المجلد |
| Client | `server/backend/modules/client/service.ts`، `server/backend/modules/client/mapper.ts` |
| BlogPosts | `server/backend/modules/blog-posts/validation.ts`، `service.ts`، `repository.ts`، `mapper.ts` داخل نفس المجلد |
| FAQs | `server/backend/modules/faqs/validation.ts`، `service.ts`، `repository.ts`، `mapper.ts` داخل نفس المجلد |
| FileUpload | `server/backend/modules/files/validation.ts`، `service.ts`، `repository.ts`، `mapper.ts` داخل نفس المجلد |
| Galleries | `server/backend/modules/galleries/validation.ts`، `service.ts`، `repository.ts`، `mapper.ts` داخل نفس المجلد |
| OurSpecialists | `server/backend/modules/specialists/validation.ts`، `service.ts`، `repository.ts`، `mapper.ts` داخل نفس المجلد |
| Services | `server/backend/modules/services/validation.ts`، `service.ts`، `repository.ts`، `mapper.ts` داخل نفس المجلد |
| Setting | `server/backend/modules/settings/validation.ts`، `service.ts`، `repository.ts`، `mapper.ts` داخل نفس المجلد |
| Testimonials | `server/backend/modules/testimonials/validation.ts`، `service.ts`، `repository.ts`، `mapper.ts` داخل نفس المجلد |
| YouTubeGalleries | `server/backend/modules/youtube-galleries/validation.ts`، `service.ts`، `repository.ts`، `mapper.ts` داخل نفس المجلد |

## ترتيب التنفيذ وشروط الخروج

| Phase | العمل بعد تعليمات التنفيذ التالية | شرط الخروج، لا يكفي وجود الكود |
| --- | --- | --- |
| 1 — الحالية | تدقيق57 عملية/الواجهة، GET آمن،6 وثائق | اكتمال matrix/schema/unknowns/plan؛ لا behavior change. هذه نقطة التوقف |
| 2 — SQL foundation | env/pool/parameterization/migration tracking/DDL/indexes/health/seed controlled | اختبار على SQL Server معزول: migrate من empty DB ثم rerun بلا تغيير، status، checksum drift/concurrent migration/rollback failure، seed idempotent، parameter injection لا ينفذ SQL؛ اتصال محلي حقيقي، لا mock-only |
| 3 — Auth/User | حسم role/OTP/2FA policies؛ register/login/confirm/reset/send/verify/toggle + User6؛ cryptographic verify؛ current session adapters | direct APIs وproxy كلاهما يرفضان invalid/forged/expired/disabled tokens؛ login cookie/session/expiry/logout/UI protected flows؛ OTP single-use/TTL/attempts تحت concurrency؛ لا real-user mail؛ contracts غير المرصودة تبقى موسومة |
| 4a — public/settings | Setting/Client/Ads ثم FAQs وServices وOurSpecialists | reads/writes حقيقية مع fixtures، pagination/count/query/language/null/error، nested file IDs، current UI بلا تعديل. Ads/statistics بلا frontend تحتاج contract data مستقلة |
| 4b — remaining content | Galleries وYouTubeGalleries ثم Testimonials بعد U02 ثم BlogPosts بعد U08 | seven CRUD + slug وfilters/status/sort enums وفق mapping المعتمد؛ FK/delete policy؛ لا hardcoded arrays/placeholder statistics |
| 5 — files | approved streaming upload وmetadata وserving وimport mapping | upload response/image URLs/PDF preview/4MiB/direct-route auth/path traversal Windows، compensation، ready state، backup/restore وتوافر storage دائم |
| 6 — full integration | dispatcher cutover لكل57 والـ public caching/session adapters؛ نقل البيانات/الأصول؛ OpenAPI updated | كل operation له behavior + contract tests؛ website/dashboard/SEO/translations unchanged؛ cache invalidation لكل mutation، صفر اعتماد أساسي على ASP.NET، existing tests + lint/typecheck/build pass |
| 7 — deployment validation | controlled MonsterASP.NET Git Deploy؛ migrations من hosting network؛ env/start/port/storage checks | production health/auth/CRUD/read/upload smoke ببيانات اختبار مصرح بها؛ إعادة deploy تثبت دوام الملفات، backup restore مثبت؛ لا إعلان 100% مع gap مفتوحة |

رفع ملفات جديدة من UI في نهاية4 يبقى gate إلى5؛ يمكن استعمال files test fixtures في SQL المعزول لا صور production وهمية. لا cutover جزئي صامت ينقل auth إلى هوية لا يستطيع backend القديم التحقق منها؛ transport switch منسق لكل مجموعة dependencies، مع إبقاء external production فعالًا حتى الجاهزية.

## سياسة authorization المقترحة — INFERRED

| Scope | السياسة المحافظة المقترحة، لا وصف legacy |
| --- | --- |
| Public content/Client reads | anonymous فقط للبيانات المعتمدة الفعالة؛ blog status publish meaning ينتظر U08؛ admin يستطيع inactive وفق policy معتمدة. Query IsActive=false لا يمنح صلاحية |
| Content/Setting/Ads write + FileUpload | signed active account ودور محتوى معتمد وفق mapping؛ allowlist proxy الحالية تبقى |
| User get-all/get-by-id/toggle-disable | دور إدارة مستخدمين صريح SuperAdmin بعد تثبيت representation؛ manager ليس مفوضًا افتراضيًا؛ مسار id string |
| User get-info/edit-profile/change-password | المستخدم نفسه من JWT، لا arbitrary target؛ currentPassword لازم سلوكيًا بعد توثيق الفرق بين schema optional والسياسة |
| register/login/confirm/send/verify/reset | flows عامة حيث يقتضي العمل مع throttling وanti-enumeration؛ response/status والسياسة الجديدة موثقة، لا نقل global Bearer حرفيًا إلى login فيمنع الدخول |
| toggle-2fa | self authenticated + تحقق مناسب؛ body Swagger فارغ، flow تحدي/إثبات UNKNOWN؛ لا قبول email/role إضافيين من body ولا تعطيل للحماية لحل UI غير موجود |

معايرة password hashing، توليد OTP/token cryptographic، hash secrets، expiration/attempt counters، consume-once transaction، account/session invalidation، log redaction، وكل سياسة INFERRED تفصل عن verified response. لا claim أن النصوص/أكواد أخطاء السياسات الجديدة تطابق الأصل بلا fixture.

## ملفات واختبارات التوافق المخططة

| ملف جديد | نطاق حقيقي |
| --- | --- |
| `tests/backend/contract-manifest.test.mjs` | كل method/path/casing/header/query/body/schema/enum من Swagger مقابل registry الفعلي؛ اكتشاف أي endpoint ناقص، لا يحسب coverage behavior بذاته |
| `tests/backend/content-contract.test.mjs` | SQL-backed CRUD لكل7 modules، search/filter/literal dotted sort/paging/empty/notfound/null/nested DTOs/status/slug/date snapshots |
| `tests/backend/auth-user-contract.test.mjs` | original auth/User operations + server roles/forged signatures/disabled accounts/password/OTP race/expiry/security version، redacted synthetic identity |
| `tests/backend/settings-ads-contract.test.mjs` | Client/admin settings/ads/statistics، فصل public/auth والـ projections المثبتة |
| `tests/backend/upload-contract.test.mjs` | multipart file/response/IDs/URLs/limits/signatures/Windows containment/PDF bytes/ranges/failure cleanup |
| `tests/backend/migrations.test.mjs` | real SQL database disposable، DDL versions/checksum/locking/rerun/seed/recovery؛ لا production database |
| `tests/backend/frontend-integration.test.mjs` | existing public helpers وdashboard services/adapters دون تعديل signatures، tag refresh بعد mutation من direct API ومن proxy |
| `tests/backend/browser-regression.spec.ts` | unchanged UI: login/expiry/logout/protected pages،7 CRUD/settings/upload وpublic routes/metadata/sitemap/translations؛ browser runner يختار بعد فحص dependencies، لا تثبيت الآن |
| `tests/backend/fixtures/legacy-shapes.json` | نقل structural profiles الآمنة من هذه الوثائق فقط؛ لا تسميها raw payload fixtures، فهي types وليست business values |
| `tests/backend/fixtures/verified-contracts.json` | synthetic/redacted values مشتقة من عينات مصرح بها عند توافرها مع evidence/date؛ unknown success لا يتحول verified بالتصنيع |

كل عملية تحتاج tests لطلب صحيح وقيودها وauthorization والأخطاء وbody/status المناسبين، SQL state قبل/بعد، caller الحقيقي إن وجد. mutation response الذي يمر عبر toast دون فحص ليس proof. snapshots وحدها بلا assertions للمعنى/SQL لا تكفي. يصدر report لـ57 operation يميز IMPLEMENTED عن CONTRACT_TESTED وعن LEGACY_VERIFIED، ولا يختزلها في handler coverage.

## التشغيل على MonsterASP.NET — نقاط تحقق لا افتراضات

طلب المستخدم يذكر أن mssql جُرب سابقًا على المضيف؛ لم يختبر هذا التدقيق الاتصال أو الاستضافة. يلزم التحقق من Node runtime الموافق لـ Next المثبت وWindows، build/start/Git Deploy commands وhosting-assigned PORT من إعدادات المشغل. إبقاء `next start`/إدارة المضيف القائمة ما دامت تعمل؛ لا hardcoded port ولا rewrite IIS بلا حاجة مثبتة.

env المقترحة: SQL_SERVER/SQL_PORT/SQL_DATABASE/SQL_USER/SQL_PASSWORD وSQL_ENCRYPT وSQL_TRUST_SERVER_CERTIFICATE (ثقة صريحة حسب شهادة SQL الفعلية لا تعطيل TLS صامت)، signing/verification keys وissuer/audience، SMTP transport، UPLOAD_DIR، public origin. لا أسرار في NEXT_PUBLIC أو build logs. يفصل runtime DML عن حساب migrations DDL.

migrations تعمل controlled CLI داخل شبكة الاستضافة أو إجراء operator معتمد كما في [DATABASE_DESIGN.md](DATABASE_DESIGN.md)، قبل traffic cutover وبنسخة احتياطية. لا تنفذ على regular API requests ولا يُنشأ endpoint بلا auth لتجاوز الشبكة. التحقق من دائمية UPLOAD_DIR ومنح أذوناته لا يتم بفرض أن checkout/public آمن للتخزين.

rollback يميز code rollback وschema/data rollback: migrations additive تسمح code rollback حيث اختبر؛ لا down migration تلقائية تتلف بيانات. freeze للكتابة وخطة استرجاع من backup/manifest إذا احتاج schema قديمًا. إذا لم تتوافر نسخة/ملكية original data/assets فلا تدعي أن backend جديد فارغ بديل كامل للموقع.

## تحقق Phase 1 وحدود التسليم

شغّلت اختبارات المشروع القائمة: dashboard-auth **4/4**، sanitize **6/6**، dashboard-proxy **7/7**؛ المجموع **17/17**. هذه نتائج الحماية القائمة، وليست اختبارات SQL أو توافق العمليات الـ57. لا build/deploy أو DB test جديد، لأن التغيير الحالي وثائق فقط.

المراجعة النهائية قارنت العمليات الـ57 وschemas الـ36 والـ enum/nullability/constraints بالـ Swagger: لا عملية أو schema مفقودة؛ لكل عملية الحقول الـ13 المطلوبة، وجميع ملفات المستهلكين المذكورة موجودة. لم تتغير بصمات ملفات التطبيق/config/env الـ422 المحفوظة قبل التدقيق، وبقيت بصمة Swagger ثابتة. المخرجات الحالية الستة لا تتضمن أي replacement handler أو SQL migration أو dependency جديدة.

## Manifest ملفات Route Handlers الأصلية المخططة

القائمة التالية تطابق كل method/path من Swagger حرفيًا، وتسمّي ملف التنفيذ المستقبلي. كلها **NOT_IMPLEMENTED_PHASE1 / NOT_RUN**. dynamic params في Next تُقرأ async وفق guide النسخة المحلية؛ لا code للـ handlers الآن. لا مسارات REST بديلة ولا catch-all يغير casing.

| Method | Original path | Future file |
| --- | --- | --- |
| GET | `/api/Ads/get` | `app/api/Ads/get/route.ts` |
| PUT | `/api/Ads/edit` | `app/api/Ads/edit/route.ts` |
| POST | `/api/auth/register` | `app/api/auth/register/route.ts` |
| POST | `/api/auth/login` | `app/api/auth/login/route.ts` |
| POST | `/api/auth/confirm-email` | `app/api/auth/confirm-email/route.ts` |
| POST | `/api/auth/reset-password` | `app/api/auth/reset-password/route.ts` |
| POST | `/api/auth/send-otp` | `app/api/auth/send-otp/route.ts` |
| POST | `/api/auth/verify-otp` | `app/api/auth/verify-otp/route.ts` |
| POST | `/api/auth/toggle-2fa` | `app/api/auth/toggle-2fa/route.ts` |
| POST | `/api/BlogPosts/add` | `app/api/BlogPosts/add/route.ts` |
| GET | `/api/BlogPosts/get-all` | `app/api/BlogPosts/get-all/route.ts` |
| GET | `/api/BlogPosts/get-by-id/{id}` | `app/api/BlogPosts/get-by-id/[id]/route.ts` |
| GET | `/api/BlogPosts/by-slug/{slug}` | `app/api/BlogPosts/by-slug/[slug]/route.ts` |
| PUT | `/api/BlogPosts/edit/{id}` | `app/api/BlogPosts/edit/[id]/route.ts` |
| DELETE | `/api/BlogPosts/delete/{id}` | `app/api/BlogPosts/delete/[id]/route.ts` |
| GET | `/api/Client/get-ads` | `app/api/Client/get-ads/route.ts` |
| GET | `/api/Client/get-settings` | `app/api/Client/get-settings/route.ts` |
| POST | `/api/FAQs/add` | `app/api/FAQs/add/route.ts` |
| GET | `/api/FAQs/get-all` | `app/api/FAQs/get-all/route.ts` |
| GET | `/api/FAQs/get-by-id/{id}` | `app/api/FAQs/get-by-id/[id]/route.ts` |
| PUT | `/api/FAQs/edit/{id}` | `app/api/FAQs/edit/[id]/route.ts` |
| DELETE | `/api/FAQs/delete/{id}` | `app/api/FAQs/delete/[id]/route.ts` |
| POST | `/api/FileUpload/upload` | `app/api/FileUpload/upload/route.ts` |
| POST | `/api/Galleries/add` | `app/api/Galleries/add/route.ts` |
| GET | `/api/Galleries/get-all` | `app/api/Galleries/get-all/route.ts` |
| GET | `/api/Galleries/get-by-id/{id}` | `app/api/Galleries/get-by-id/[id]/route.ts` |
| PUT | `/api/Galleries/edit/{id}` | `app/api/Galleries/edit/[id]/route.ts` |
| DELETE | `/api/Galleries/delete/{id}` | `app/api/Galleries/delete/[id]/route.ts` |
| POST | `/api/OurSpecialists/add` | `app/api/OurSpecialists/add/route.ts` |
| GET | `/api/OurSpecialists/get-all` | `app/api/OurSpecialists/get-all/route.ts` |
| GET | `/api/OurSpecialists/get-by-id/{id}` | `app/api/OurSpecialists/get-by-id/[id]/route.ts` |
| PUT | `/api/OurSpecialists/edit/{id}` | `app/api/OurSpecialists/edit/[id]/route.ts` |
| DELETE | `/api/OurSpecialists/delete/{id}` | `app/api/OurSpecialists/delete/[id]/route.ts` |
| POST | `/api/Services/add` | `app/api/Services/add/route.ts` |
| GET | `/api/Services/get-all` | `app/api/Services/get-all/route.ts` |
| GET | `/api/Services/get-by-id/{id}` | `app/api/Services/get-by-id/[id]/route.ts` |
| PUT | `/api/Services/edit/{id}` | `app/api/Services/edit/[id]/route.ts` |
| DELETE | `/api/Services/delete/{id}` | `app/api/Services/delete/[id]/route.ts` |
| GET | `/api/Setting/get` | `app/api/Setting/get/route.ts` |
| GET | `/api/Setting/get-statistic` | `app/api/Setting/get-statistic/route.ts` |
| PUT | `/api/Setting/edit` | `app/api/Setting/edit/route.ts` |
| POST | `/api/Testimonials/add` | `app/api/Testimonials/add/route.ts` |
| GET | `/api/Testimonials/get-all` | `app/api/Testimonials/get-all/route.ts` |
| GET | `/api/Testimonials/get-by-id/{id}` | `app/api/Testimonials/get-by-id/[id]/route.ts` |
| PUT | `/api/Testimonials/edit/{id}` | `app/api/Testimonials/edit/[id]/route.ts` |
| DELETE | `/api/Testimonials/delete/{id}` | `app/api/Testimonials/delete/[id]/route.ts` |
| GET | `/api/User/get-all` | `app/api/User/get-all/route.ts` |
| GET | `/api/User/get-by-id/{id}` | `app/api/User/get-by-id/[id]/route.ts` |
| POST | `/api/User/change-password` | `app/api/User/change-password/route.ts` |
| PUT | `/api/User/edit-profile` | `app/api/User/edit-profile/route.ts` |
| GET | `/api/User/get-info` | `app/api/User/get-info/route.ts` |
| POST | `/api/User/toggle-disable` | `app/api/User/toggle-disable/route.ts` |
| POST | `/api/YouTubeGalleries/add` | `app/api/YouTubeGalleries/add/route.ts` |
| GET | `/api/YouTubeGalleries/get-all` | `app/api/YouTubeGalleries/get-all/route.ts` |
| GET | `/api/YouTubeGalleries/get-by-id/{id}` | `app/api/YouTubeGalleries/get-by-id/[id]/route.ts` |
| PUT | `/api/YouTubeGalleries/edit/{id}` | `app/api/YouTubeGalleries/edit/[id]/route.ts` |
| DELETE | `/api/YouTubeGalleries/delete/{id}` | `app/api/YouTubeGalleries/delete/[id]/route.ts` |

