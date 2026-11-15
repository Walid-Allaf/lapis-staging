# تسليم المرحلة الثانية — أساس SQL Server

تاريخ العمل: 2026-11-11. **Implemented and locally verified foundation؛ ليس Backend API بديلًا ولا تكافؤًا مع ASP.NET.** لا auth/content route من57 نُفذ، ولا frontend transport/session/proxy تغير. لم يُنفذ نشر أو تعديل production DB.

## الملفات

ملفات TypeScript الجديدة:

- `server/backend/config.ts`
- `server/backend/db/errors.ts`, `pool.ts`, `parameters.ts`, `transaction.ts`, `lock.ts`, `write-target.ts`
- `server/backend/db/migration-catalog.ts`, `migration-history.ts`, `migrate.ts`, `seed.ts`, `health.ts`
- `app/api/health/route.ts`

ملفات التشغيل والمخطط الجديدة:

- `scripts/db/shared.mjs`, `migrate.mjs`, `status.mjs`, `seed.mjs`
- `db/migrations/0001_identity.sql`, `0002_files.sql`, `0003_content.sql`, `0004_settings_ads.sql`, `0005_indexes.sql`
- `.env.example` و`.gitattributes` لحفظ LF وchecksums ملفات SQL عبر Git checkouts

الاختبارات الجديدة: `tests/backend/config.test.mjs`, `database.test.mjs`, `migrations.test.mjs`, `health.test.mjs`, `sql.integration.test.mjs`.

التعديلات: `package.json` و`package-lock.json` لإضافة runtime dependencies `mssql@12.7.14`, `server-only@0.0.1`, `tsx@4.23.15`, `@next/env@16.2.7`، وdev types `@types/mssql@12.3.0`، وأوامر db/tests/typecheck. لم تتغير نسخ frontend packages القائمة. `.gitignore` يستثني example فقط من تجاهل env. `next.config.ts` يضيف tracing لملفات SQL الخاصة بـhealth فقط. `AGENTS.md` يضيف قواعد DB مع الاحتفاظ بكل التعليمات السابقة. وثائق DATABASE_DESIGN وIMPLEMENTATION_PLAN وUNKNOWN_BEHAVIORS محدثة، مع هذا التقرير و[دليل التشغيل](DEPLOYMENT_RUNBOOK.md).

لم تعدل `.env` الفعلية أو public pages/components أو dashboard أو DTOs أو feature services أو routes/auth/proxy القائمة أو ترجماتها. مقارنة بصمات421 ملفًا قائمًا عند بدايةPhase2 أثبتت أن التعديلات داخل تلك المجموعة محصورة بـnext.config.ts وAGENTS.md، وهما تعديلان موضحان أعلاه. الملفات الجديدة ليست بديلًا لواجهات API القائمة.

## الجداول المنفذة في migrations والمطبقة محليًا

| Migration | الجداول/الإجراء |
| --- | --- |
| Bootstrap داخل runner | SchemaMigrations: ownership marker، SHA256، running/applied/failed، timestamps، duration، safe error code |
| 0001_identity | Roles، Users، AuthSessions، OtpChallenges، SecurityEvents |
| 0002_files | Files، ثم FK Users.FileId بعد معالجة دورة Users/Files |
| 0003_content | Services، OurSpecialists، FAQs، Galleries، YouTubeGalleries، Testimonials، BlogPosts |
| 0004_settings_ads | SiteSettings، Ads، DevelopmentSeedHistory |
| 0005_indexes | فهارس FK وpublic filtering/order وhash lookups |

المجموع **17 جدولًا**:15 لحالة التطبيق و2 لتتبع المهاجرات/seed. هذه جداول داخلية مقترحة مبنية على أدلة Phase1، وليست الجداول الأصلية. لا seeded users/roles/passwords/content/settings.

NVARCHAR(MAX) للنصوص غير محددة الطول، INT لمعرفات المحتوى، UserKey BIGINT داخلي وExternalId string غير محدود مع computed hash unique index، DATETIME2(7) UTC داخلي، ROWVERSION، FKs بلا cascade. Rating داخلي واحد لا يختار starNumber/starsNumber؛ BlogPosts.OurSpecialistId nullable مؤقتًا؛ flags/order/status بلا API defaults مفترضة. EmailHash وSlugHash فهارس غير unique إلى أن تحسم سياسات normalization/uniqueness.

## ما تم تنفيذه والتحقق منه

- pool lazy مشترك لكل Node process مع حدود صغيرة وإغلاق CLI، وحدات server-only، typed parameter binding، transaction commit/rollback، errors محررة بلا SQL/credentials.
- env موحد، strict parsing وTLS verification افتراضي، production TLS downgrade مرفوض. guards مستقلة للـmigrate/seed/test واسم DB الفعلي، ورفض master/model/msdb/tempdb ورفض writes production في Phase2.
- catalog مرتب وSHA256 bytes، ownership/history، قفل SQL حقيقي يغطي commits، failed/running لا يُعادان تلقائيًا، drift/rename/missing files تفشل، transactional DDL وdurable failure intent.
- controlled seed marker فقط وقابل للتكرار؛ domain seed مؤجل بصراحة.
- GET /api/health يميز application/connectivity/migration readiness بلا تسريب أو DDL.

التحقق المحلي الفعلي استعمل Windows وNode **26.3.1** وSQL Server Express build **17.0.1000.7** عبر TCP ومصادقة SQL في قواعد جديدة معزولة وأسماء عشوائية، لا قاعدة مستخدم قائمة. credential material مؤقت خارج repository ولم يُطبع؛ أُزيل عند انتهاء التحقق مع تعطيل logins المؤقتة. لا real user data، ولا أي request كتابة إلى ASP.NET.

## نتائج الفحوص

| الفحص | النتيجة |
| --- | --- |
| test:dashboard-auth | 4/4، محفوظة |
| test:sanitize | 6/6، محفوظة |
| test:dashboard-proxy | 7/7، محفوظة |
| test:db | 21/21 اختبارات مستقلة؛ تشمل fakes للـpool/transaction/locks بتمييزها عن SQL integration |
| test:db:integration |11 حالة SQL فعلية ناجحة؛ node:test يسجل12 نتيجة عند احتساب parent test؛ لا skips |
| typecheck | مرّ |
| lint | مرّ،0 errors و11 warnings في source الواجهة القائمة غير المعدلة |
| build | Next production build مرّ، ويظهر `/api/health` كـdynamic route |
| Local production HTTP smoke | `/api/health` أعاد503 آمنًا دون SQL configured وبـno-store؛ `/dashboard/login` أعاد200 وproxy غير المصادق401 كما هو |

SQL integration اختبر connection/initial status، تطبيق5 ثم0 migrations، health، Unicode وSQL injection كسلسلة بيانات، rollback فعلي، FKs/no cascades وnullable fields وexternal ID طويل، real concurrent application lock، seed idempotency دون users/roles/content، CLI commands، rejected login/redaction، checksum drift، وDDL failure rollback + durable failed history + blocked rerun. اختبار الفشل المتعمد الأخير يترك fixture record في قاعدة disposable للإثبات، وليس migration جديدة في المنتج. لا تُقرأ نتيجته كـproduction schema drift.

`npm audit` رصد advisory حرجًا لإصدار Next16.2.7 القائم، مع تنبيهات في dependencies أخرى قائمة. لم تُدرج الحزم المباشرة الجديدة SQL/CLI ضمن advisory entries عند الفحص. لم ينفذ `audit fix` أو upgrade للواجهة خارج scope؛ يلزم معالجة الثغرات القائمة قبل أي نشر إنتاجي لاحق. نجاح build/tests لا يعني سلامة إصدار framework للإنتاج.

## ما بقي مجهولًا أو مؤجلًا

- U02/U03/U04/U17: starNumber/starsNumber وcreate isActive/update body id/error envelope. schema لا تحسمها ولا توجد endpoints جديدة تطبق سياسة مفترضة.
- U05/U06/U11/U15: required/omitted/default semantics، role mapping، OTP purposes/2FA، JWT/old identity/password migration؛ nullable storage لا يمنح وصولًا أو يحول NULL إلى false. Phase3 يجب أن يفشل مغلقًا حتى تثبيت policy.
- U07/U08/U09/U10: sorting enum meanings/page defaults، slug rules/uniqueness، delete/reference behavior، response date serialization. لا soft-delete/cascading ولا Z serialization مفروضة في SQL.
- AccountTokens منفصل مؤجل حتى يتضح هل OTP state القائمة تكفي؛ لا تعقيد إضافي من flow غير موثق. final email uniqueness/normalization وslug constraints مؤجلة، بينما stable ExternalId uniqueness داخلي موجود.
- hosting SQL/TLS/permissions/quota/one-off command access/backup restore غير مختبر. اختبارات local SQL لا تعد إثبات MonsterASP.NET deployment. جميع قيود التشغيل والتعافي موثقة في الدليل.

## المرحلة التالية

بعد تعليمات Phase3 فقط: حسم mapping الأدوار وسياسات auth/OTP/2FA مع الحفاظ على existing login/session contracts، ثم تطبيق server-side cryptographic JWT verification وخدمات auth/User واختبارها. لا switching للموقع أو proxy في Phase2، ولا تفعيل admin seed أو production migrations ضمنيًا. تبقى جميع57 original API implementations غير منجزة.
