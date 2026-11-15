# تسليم المرحلة الثالثة: Authentication وUser

2026-11-11. نُفّذ backend معزول داخل التطبيق القائم، دون تحويل تسجيل دخول اللوحة أو أي traffic من ASP.NET. لم تتغير صفحات الموقع أو مكونات اللوحة أو DTOs أو API clients أو cookie/session/proxy behavior. لا نشر أو production migration أو عمل Phase4.

## حالة العمليات

**6 Authentication operations منفذة بسياسات جديدة ومختبرة**: register، login، confirm-email، reset-password، send-otp، verify-otp. **toggle-2fa محظورة صراحةً**: JWT/SQL authorization ثم501 وسجل أمني، بلا تغيير العامل. وجود handler لها لا يجعلها implemented.

**User operations الست منفذة ومختبرة**: get-all، get-by-id/{id}، change-password، edit-profile، get-info، toggle-disable. تفويض SuperAdmin لإدارة المستخدمين؛ self-only للملف الشخصي وكلمة المرور. جميع methods والمسارات وحالة الأحرف مطابقةSwagger. responses/policies غير المرصودة موثقة كـINFERRED، لا legacy parity.

## الملفات الجديدة والمعدلة

| المجموعة | الملفات من جذر المشروع |
| --- | --- |
| JWT/password/OTP/SMTP/config/security | `server/backend/auth/config.ts`, `errors.ts`, `jwt.ts`, `password.ts`, `otp.ts`, `mail.ts`, `rate-limit.ts`, `authorize.ts`, `bootstrap.ts` داخل نفس المجلد |
| Auth validation/repository/service | `server/backend/modules/auth/validation.ts`, `repository.ts`, `service.ts` |
| User service/DTO mapping | `server/backend/modules/users/service.ts` |
| Shared HTTP boundary | `server/backend/http/auth-handler.ts` |
| Auth routes | `app/api/auth/register/route.ts`, `login/route.ts`, `confirm-email/route.ts`, `reset-password/route.ts`, `send-otp/route.ts`, `verify-otp/route.ts`, `toggle-2fa/route.ts` تحت نفس جذرauth |
| User routes | `app/api/User/get-all/route.ts`, `get-by-id/[id]/route.ts`, `change-password/route.ts`, `edit-profile/route.ts`, `get-info/route.ts`, `toggle-disable/route.ts` تحت نفس جذرUser |
| SQL | `db/migrations/0006_auth_security.sql` |
| Private operator CLI | `scripts/db/bootstrap-admin.mjs` |
| Tests | `tests/backend/auth.test.mjs`, `auth.integration.test.mjs` |
| Configuration | package.json/lock: Next/@next/env/eslint-config-next16.4.6، jose6.2.17، zod4.6.7، nodemailer10.5.0، @types/nodemailer8.0.2؛ scripts test:auth/test:auth:integration/db:bootstrap-admin |
| Integration infrastructure | `next.config.ts`: mssql/nodemailer serverExternalPackages؛ `server/backend/db/migration-catalog.ts`: controlled tracing annotations مع explicit SQL include |
| Existing tests | migrations.test.mjs وsql.integration.test.mjs: توقع6إصدارات بدل5، ونقل failure fixture المعزول إلى0007؛ لا إضعاف assertions أو تعديل migrations0001–0005 |
| Docs/env | `.env.example`, AGENTS.md، الوثائق الست الخاصة بـPhase3، وتحديث matrix/unknowns/database design/runbook |

## SQL والأمان

Migration0006 additive: unique filtered normalized-email hash index بعد preflight duplicate detection؛ عمود SecurityVersion فيOtpChallenges؛ AccountTokens وAuthRateLimits معFK/indexes. لا backfill للهوية القديمة أو flags/roles، ولا reset/drop/cascade. أصبحت19جدولًا في المخطط الجديد، و6إصدارات. لم تتغير bytes ملفات0001–0005.

Scrypt بمعاملات N32768/r8/p3 وsalt16byte وhash32byte، concurrency2 وqueue16 لكلprocess. JWT بواسطةJOSE/HS256 معkid/issuer/audience/timing والتحقق من aliases وحالةSQL session/version/account/role. الخادم لا يستعمل decodeAdminSession كدليل تشفيري؛ الكود القديم يبقى لأنه يخدم ASP.NET الحالي فقط.

OTP بستة أرقام، HMAC وسر مستقل،5دقائق/5محاولات/cooldown60ثانية وsingle-use؛ فشل المحاولات يبقى محفوظًا. reset proof عشوائي256bit مخزن كـhash ومربوط بالهوية/version. تغييرpassword أو disable/enable يلغيsessions/proofs كلها. DB locks تحمي consume/last-admin/rate counters عبرworkers. SMTP acceptance مطلوب؛ فشل البريد يرجع identity/challenge writes ولا يعيد نجاحًا وهميًا.

## الاختبارات والنتائج

| الفحص | النتيجة |
| --- | --- |
| test:dashboard-auth |4/4 محفوظة|
| test:sanitize |6/6 محفوظة|
| test:dashboard-proxy |7/7 محفوظة|
| test:db |21/21، مع catalog version6|
| test:auth |11/11 مستقلة، بعضها يستعمل dependencies اختبارية|
| test:db:integration |11حالة SQL حقيقية؛12نتيجة عند احتسابparent؛0 skips|
| test:auth:integration |18حالة SQL حقيقية؛19نتيجة عند احتسابparent؛0 skips|
| typecheck / build |يمران على Next16.4.6|
| lint |0 errors؛12 warnings في frontend قائم لم يتغير، منها تحذير إضافي من قواعدNext الجديدة|
| Local production HTTP smoke |كل13route مُورست عبرnext start محلي؛ SQL login/revocation/authorization/errors صحيحة؛501 blocker و503 SMTP missing صريحان؛ dashboard login200 وproxy/session غير المصادق401 |

إجمالي node:test عند احتساب parent entries:80 نتيجة ناجحة؛ مجموع الحالات النهائية دونparent:78. SQL المحلي: Express17.0.1000.7، Windows، Node26.3.1. جميع قواعد الاختبار جديدة وdisposable، ولا mutation علىASP.NET. MailAdapter الاختباري يلتقط في الذاكرة فقط؛ **لم يثبت وصول SMTP حقيقي أو تشغيل علىMonsterASP.NET**. نتائج فشلDDL المتعمد تبقى في قاعدةfoundation fixture، لا migration0007 في repository.

احتُفظ بقواعد الاختبار المعزولة للمراجعة دون حذف أو reset؛ عُطلت logins المؤقتة وأزيلت ملفات credentials/JWT keys المؤقتة خارج repository بعد انتهاء التحقق. لا حساب مدير إنتاجي أو سر ثابت منشور.

التغطية تشمل duplicate registration دون تغييرcredentials، disabled/unconfirmed/unknown role، tampered/expired/future JWT وkey rotation، own profile/file metadata، Manager least privilege، OTP expiry/reuse/attempts/cooldown/purpose، proof expiry/reset invalidation، concurrent duplicate/reset/admin disable، SMTP rollback، bootstrap idempotence/production denial، وعدم تسريب الأسرار.

## التوافق والجاهزية

الحقول المعروفة من frontend للدخول متوفرة، واختُبر projection عبر decoder الأصلي بلا تعديل. بقية User/auth success payloads وrole/purpose/sort mappings وسياسةpassword12/default pagination/IsActive/date output وmessage alias **قرارات جديدة معلنة**؛ الأصل UNKNOWN. الوثائق المرجعية: [العقود](AUTH_API_CONTRACTS.md)، [التفويض](AUTHORIZATION_MATRIX.md)، [OTP و2FA](OTP_AND_2FA_POLICY.md)، [bootstrap](ADMIN_BOOTSTRAP.md)، [المراجعة الأمنية](SECURITY_REVIEW.md).

قبل ربط اللوحة: حسم2FA وlegacy mappings/fixtures، اعتماد الفروق المذكورة، توفير SMTP/SQL/TLS/secret management/host command facility، نقل الهوية أو reset مخطط، وتنسيق session/logout/revocation. لا تقبل tokens القديمة بمجردdecode ولا تعطل2FA لتجاوز العائق. Next ترقي إلى16.4.6 ولا يظهر لهadvisory في التدقيق الحالي، لكن39findings أخرى بقيت ويجب معالجتها قبلproduction.

**نقطة التوقف: Phase3 فقط.** لا endpoints محتوى أو live cutover أو production bootstrap أو نشر ضمن هذا التسليم.
