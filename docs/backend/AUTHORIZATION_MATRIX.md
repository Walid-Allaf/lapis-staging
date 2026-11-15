# مصفوفة تفويض Phase 3

كل القيم والسياسات التالية **INFERRED: تعريف جديد محافظ**، وليس تعيينًا للأدوار القديمة. frontend VERIFIED_FROM_FRONTEND يقبل 1/2 أوsuperadmin/manager/admin بعد normalization؛ لا يثبت معنى الأرقام. لا نغير ذلك الكود ولا session-cookie transport.

## الأدوار الداخلية

| Roles.Code | ContractValue / kind | الصلاحيات هنا |
| --- | --- | --- |
|user|User / string|self profile/password/info|
|manager|Manager / string|self فقط؛ قبول UI لدخول dashboard لا يمنح إدارة المستخدمين|
|superadmin|SuperAdmin / string|self + listing/detail/disable other users|

register يضمن User فقط؛ لا role من body. role user المرجعي ينشأ تحت transaction عند الحاجة؛ SuperAdmin لا ينشأ إلا بالـCLI الخاص. Manager لا يمنح من أي public API في Phase3؛ fixture الاختبار فقط يهيئه. كود أوContractValue غير canonical/NULL أو رقم غير معتمد يفشل مغلقًا، حتى لو تقبله UI من ASP.NET. imported identities تحتاج mapping واعتمادًا قبل cutover.

## مصفوفة العمليات

| API | Anonymous | User | Manager | SuperAdmin |
| --- | --- | --- | --- | --- |
| register/login/confirm/reset/send/verify | public مع proof/password/rate policies | نفس proof policies، لا صلاحية إضافية من JWT | نفس السياسة | نفس السياسة |
| toggle-2fa |401|501 بعد verify، بلا mutation|501|501|
| User/get-info |401|self|self|self|
| User/edit-profile |401|self، own ready file فقط|self فقط|self فقط، لا تجاوز ملكية file|
| User/change-password |401|self + current password|نفسه|نفسه|
| User/get-all |401|403|403|مسموح|
| User/get-by-id/{id} |401|403 حتى لو id له|403|مسموح،id string|
| User/toggle-disable |401|403|403|حساب آخر فقط؛ لا آخر مدير فعال|

التفويض في services داخل transaction، لا في navigation أو handler وحده. الـhandlers تضيف validation/header parsing، لكن استدعاء service داخليًا لا يتخطى signature/session/account checks. edits لا تقبل target identity أو email أو role. آخرSuperAdmin وحالة disable وكلsecurity mutations متسلسلة بقفلSQL `LAPiS:auth:state`، لمنع race على صلاحية الفاعل/المستهدف.

## JWT والجلسات

JOSE يتحقق من HS256 فقط، typ=JWT، kid معروف، issuer/audience مطابقين، exp/nbf/iat/jti مطلوبة، بلا clock skew allowance. identity من sub/id/.NET nameidentifier؛ البريد email/.NET emailaddress/unique_name؛ الدور role/.NET role URI. aliases المتعارضة مرفوضة. outgoing tokens تتضمن sub/id/email/role والـ.NET aliases وsv/jti/timing؛ known dashboard decoder يقرأ projection الصحيح في اختبار دون تغيير كوده.

بعد التحقق التشفيري، SQL يثبت ExternalId وإيميل ودور/version مطابقين وAuthSessions jti hash صالحًا وغير revoked وغير منتهٍ. لا تكفي signature وحدها لتجاوز disabled/role changes. User EmailConfirmed=true وIsDisabled=false وTwoFactorEnabled non-NULL وSecurityVersion valid وcanonical role واجبة؛ NULL قديم لا يساويfalse. Hashes غير معروفة لا تُقبل ولا تُستورد افتراضيًا.

password change/reset وdisable **وenable** تزيد securityVersion وتلغي جميعsessions وOTP/proofs القائمة؛ إعادة enable لا تعيد توكنات قديمة. لا refresh token أو logout original API مختلق؛ Swagger لا يوثقهما. dashboard logout/session APIs الحالية تبقى على ASP.NET flow الحالي، ولا تصبح session revoke للبديل ضمنيًا. تنسيق ذلك شرط cutover لاحق.
