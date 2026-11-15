# عقود Authentication وUser — Phase 3

2026-11-11. جميع العمليات معزولة عن dashboard adapter القائم الذي ما زال يطلب ASP.NET. **التنفيذ والاختبارات لا يثبتان التكافؤ مع legacy**: Swagger لا يحتوي أي response schema. التصنيفات الأصلية محفوظة:

- DOCUMENTED_IN_OPENAPI: method/path/casing/request schemas/constraints/enums/header.
- VERIFIED_FROM_FRONTEND: login data.id/email/role/token/expiresOn وJWT projection الحالي؛ ليست عينة دخول legacy.
- VERIFIED_FROM_LEGACY_RESPONSE: GET error object من تدقيقPhase1 فقط؛ لا login/auth/User success response أصلي مفحوص.
- INFERRED: كل سياسة/response جديدة أدناه. UNKNOWN: ما زال سلوك الأصل غير مثبت.

## Boundary مشترك

المسارات وحالتها الحرفية كما هي. JSON media types: application/json وtext/json وapplication/*+json. `Accept-Language` اختياري؛ ar/en/ku مقبولة. رسائل عربية لبعض codes عند ar؛ en/ku تستخدم English fallback. exact legacy translations/fallback UNKNOWN. لا Content-Language مختلق. `timezone` ليس عقدًا موثقًا ولا يغير User date serialization.

كل object schema مغلق additionalProperties=false؛ لا email/role/id إضافية في profile أو enabled في toggle-2fa. requestBody غير required في Swagger: body فارغ يعامل كـ{} ثم تطبق required properties الخاصة بالـschema؛ null root ليس object. optional/null في property يقبلها shape validator، وقد لا تكفي وحدها لإتمام عملية أمنية. لا تُحوّل null إلى default أو تُغير DTOs.

حد الجسم16KiB وحد UTF-8 صحيح: **سياسة حماية بنية جديدة**، لا maxLength أصلي. حدود API passwords الجديدة موضحة أدناه، منفصلة عن Swagger validation.

Success implementation:

```json
{"isSuccess":true,"data":null,"error":null,"paging":null}
```

data تختلف لكل عملية في الجدول. failures:

```json
{"isSuccess":false,"data":null,"error":{"code":"AUTH_INVALID_CREDENTIALS","message":"Invalid credentials or verification.","details":null},"paging":null,"message":"Invalid credentials or verification."}
```

error object يحافظ على البنية المرصودة سابقًا؛ top-level message **extension جديد** متعمد ليستطيع adapter/Axios الحالي قراءة الرسالة مستقبلًا دون تعديلهما. لا claim أنه حقل legacy. لا raw Zod issues أو request data أو driver messages أو tokens في الأخطاء.

## Authentication

| Operation | request DOCUMENTED_IN_OPENAPI | تنفيذ جديد/response INFERRED | الحالة |
| --- | --- | --- | --- |
| POST /api/auth/register | firstName,lastName,email,password,phoneNumber required minLength1؛ email format email؛ country optional nullable | normalizes email NFKC/trim/lowercase؛ role User فقط؛ unconfirmed وenabled و2FA=false وsecurityVersion0؛ SMTP acceptance لرمز0 قبل commit؛200 data:null. duplicate لا يغير password/profile/role ويعيد نفس success بعد cooldown | IMPLEMENTED_ISOLATED_NEW_POLICY |
| POST /api/auth/login | email/password/code كل منها optional nullable string | صحيح + confirmed + enabled + canonical known role ⇒200 data:{id:string,email:string,role:string,token:string,expiresOn:UTC ISO string}؛ JWT signed + SQL session. unknown/wrong/disabled/unconfirmed ⇒401 واحد. 2FA flag موجود ⇒password ثم purpose2 proof؛ missing code يولد challenge و401 AUTH_CHALLENGE_REQUIRED | IMPLEMENTED_ISOLATED_NEW_POLICY |
| POST /api/auth/confirm-email | email/code optional nullable string بلا format/length إضافي في shape | يستهلك purpose0 صالحًا لمستخدم enabled، يثبت EmailConfirmed؛200 data:null. missing/null/expired/used/wrong ⇒400 generic؛ failed attempts تبقى محفوظة | IMPLEMENTED_ISOLATED_NEW_POLICY |
| POST /api/auth/reset-password | email/code/newPassword required؛ email format/min1؛ code min1؛ password min6/max20 | code يقبل OTP purpose1 من6أرقام أو opaque resetToken الناتج منverify-otp؛ كل proof single-use/version-bound؛ يغير الهاش ويبطل الجلسات وOTP/proofs؛200 data:null | IMPLEMENTED_ISOLATED_NEW_POLICY |
| POST /api/auth/send-otp | email required format/min1؛ purpose optional numeric0/1/2 | default0 سياسة جديدة؛ code عشوائي محمي، SMTP required، cooldown60s؛200 data:null بعد SMTP acceptance حتى لعناوين غير مسجلة، دون منح proof لهوية مجهولة | IMPLEMENTED_ISOLATED_NEW_POLICY |
| POST /api/auth/verify-otp | email optional nullable format email؛ code optional nullable string exactly6 | السياسة الجديدة تفحص purpose1 فقط؛ يستهلك code ويصدر data:{resetToken,expiresOn} بمدة5دقائق، لا login token.0 عبرconfirm-email و2 عبرlogin(code) | IMPLEMENTED_ISOLATED_NEW_POLICY |
| POST /api/auth/toggle-2fa | object فارغ، body optional | requires cryptographically authenticated active account؛ يسجل رفض التغيير ثم501 AUTH_2FA_WORKFLOW_UNVERIFIED، لا يغير flag. anonymous401، unknown fields400 | **BLOCKED_2FA_PUBLIC_WORKFLOW** |

كل نجاح يرد200 كما وثق Swagger. HTTP400/401/403/404/409/413/415/429/501/503 وحمولاتها سياسات تنفيذ معلنة، وليست verified auth legacy statuses. global Swagger Bearer يورث حتى login/register؛ اعتمدت public entry flows الستة وفق حاجة العمل، مع rate limits، وJWT لجميعUser/toggle. هذا فرق موثق لا تعديل خفي للوثيقة الأصلية.

### كلمة المرور: فرق مقصود يجب مراجعته قبل cutover

Shape validation يحفظ min1 للتسجيل وmin6/max20 لإعادة التعيين، وoptional nullable في change-password. **سياسة الأمان الجديدة تتطلب12 Unicode characters على الأقل و1024 UTF-8 bytes على الأكثر عند إنشاء/تغيير password**، ولا تفرض composition rules؛ reset يحتفظ أيضًا بحدSwagger20. لذلك ليست كل قيمة تسمح بها shape القديمة مقبولة سلوكيًا. هذا توافق غير مثبت/امتداد أمني صريح، وليس claim legacy. login لا يفرض حد12 على محاولة التحقق؛ يقبل credentials الحالية إن كان hash معروفًا، مع حد bytes للحماية.

## User

جميع عمليات User تتطلب Bearer JWT موقعًا ومتحققًا + SQL session فعالة + enabled/confirmed identity مع securityVersion وrole مطابقين. cookie dashboard لا تكفي ولا تُقرأ هنا.

| Operation | request أصلي | تنفيذ/response جديد | authorization |
| --- | --- | --- | --- |
| GET /api/User/get-all | Search,PageNumber,PageSize,Sort.Field,Sort.Descending,IsActive optional | data:User[] وpaging:{pageNumber,pageSize,totalRecords}؛ search في firstName/lastName/email مع Unicode/escaped LIKE؛ سياسات paging/sort أدناه | SuperAdmin فقط |
| GET /api/User/get-by-id/{id} | id required string، ليس GUID | data:User أو404؛ hashed external-id lookup مع مقارنة النص الكامل | SuperAdmin فقط |
| POST /api/User/change-password | currentPassword/newPassword optional nullable string | currentPassword مطلوب لإثبات العملية؛ success200 data:null، revoke جميعsessions/proofs وincrement version؛ لا token جديد تلقائي | self authenticated |
| PUT /api/User/edit-profile | firstName,lastName,phoneNumber optional nullable؛ fileId optional nullable int32 | omission يبقي القيمة، null يمسحها؛ FileId إن قدم يجب أن يكون ready ومملوكًا للمستخدم؛200 data:User | self فقط، لا target id أو role/email mutation |
| GET /api/User/get-info | لا path/query/body fields |200 data:User | self authenticated |
| POST /api/User/toggle-disable | email required minLength1؛ ليس format email في Swagger | toggle IsDisabled للمستهدف + revoke/version increment؛200 data:User؛ self-disable ممنوع، NULL state يحتاج409 operator review | SuperAdmin فقط؛ لا تعطيل آخر مدير فعّال |

كل الست عمليات **IMPLEMENTED_ISOLATED_NEW_POLICY** ومختبرة عبرSQL؛ لا يوجد frontend User module يثبت response DTO الأصلي.

User DTO الجديد: id,email,firstName,lastName,phoneNumber,country,role,isActive,isDisabled,emailConfirmed,twoFactorEnabled,image:{id,filePath}|null,createdAt. لا PasswordHash/NormalizedEmail/UserKey/EmailHash/SecurityVersion/session proof fields. createdAt هنا UTC ISO **قرار جديد للـUser غير المرصود**؛ public content date mappers القديمة لم تتغير، ولا يفترض أن legacy فعل ذلك.

سياسات قائمة User الجديدة، وليست enum meanings مثبتة:

| Sort.Field numeric | SQL whitelist field |
| --- | --- |
|0|ExternalId|
|1|FirstName|
|2|LastName|
|3|Email|
|4|CreatedAtUtc|

default field4 وdescending=true؛ UserKey tie-breaker داخلي ثابت. default PageNumber1/PageSize10، page>=1 وحجم1..100؛ supplied ints تبقىint32، ولا page=0 clamp. query casing canonical ود dotted names حرفية؛ unknown query keys تُتجاهل، duplicate known keys تُرفض400. IsActive سياسة معلنة = عكس IsDisabled فقط، مستقلة عن EmailConfirmed؛ NULL لا يطابق أي boolean filter. لا ادعاء mapping أصلي أو توافقsort حتى يحسمU07/U13.

## حالات الفشل والتوافق الباقي

401 عام للدخول/التوكن/الحساب غير المؤهل؛403 permission؛400 shape/proof/policy؛404 lookup admin؛409 unresolved/bootstrap conflicts؛429 limits مع Retry-After60؛501 toggle blocker؛503 SQL/config/SMTP failure بلا تفاصيل داخلية. strings error السابقة في types لا تتغير؛ U17 مسجل كـextension message. لا authenticated legacy samples أو SMTP provider verification أو UI cutover، ولا استيراد hashes قديمة أو قبول decoded JWT كإثبات.
