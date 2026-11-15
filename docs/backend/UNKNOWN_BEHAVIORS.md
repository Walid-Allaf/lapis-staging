> Phase6 current status,2026-11-11:56 implemented original operations are now reached internally by existing consumers; optional public toggle-2fa remains blocked501. No complete historical parity, actual import, real-browser coverage or hosted deployment is claimed. [Phase6 report](PHASE6_FULL_INTEGRATION.md) supersedes prior isolation statements.

## Phase6 current boundaries

| ID | Current status |
| --- | --- |
| U33 | VERIFIED_LOCAL: actual public SSR/dashboard services/TSX upload handler work through internal SQL transport, strict39-rule proxy, JWT+SQL sessions, logout and direct/proxy cache invalidation. Existing legacy response evidence is unchanged; new role/default/sort/status/null/write semantics remain INFERRED. |
| U34 | New public readiness gate catches missing SQL/schema/settings before frozen page fallback; a failure after this check can still reach a frozen catch. Such failures are logged, not cached as empty successes. No assertion of eliminating every mid-request race without UI changes. |
| U35 | Public inventory found15 content rows/9 media IDs; all9 public byte streams hashed, with shared bytes across distinct IDs. Complete inactive/protected/admin/account data and authorized export/merge target are absent. No data import/write apply mode exists; dry-run plan cannot authorize overwrite or prove completeness. |
| U36 | APP_ORIGIN compiles exact same-origin media/SEO bases and image patterns; final HTTPS hostname, browser DOM/PDF/cookie behavior and host connection/ACL/redeploy/restore remain pending. No broad image allowlist, forwarded-origin trust or runtime public-base retargeting. |
| U37 | Existing2FA-enabled accounts cannot use a fabricated password-only dashboard bypass. toggle endpoint unused by current frontend remains501; enabling/importing such accounts requires an approved challenge contract, SMTP and further instructions. |
| U38 | No essential runtime operation contacts ASP.NET; explicit readonly inventory CLI and historical/source-validation strings may name it. Old persisted absolute legacy media URLs require explicit import remapping before production. Rollback is reviewed prior-artifact/config restoration, not a browser-selected fallback. |

All previous unknowns about SMTP/hosting/imported identities/security advisories and original response branches remain unless separately evidenced. The live hosted site and original data were not changed.

> Phase5 current status, 2026-11-11: FileUpload is implemented with real SQL/filesystem/HTTP/restart verification. Total56 implemented of57; public toggle-2fa remains blocked. Existing phase snapshots below are historical. [Phase5 report](PHASE5_FILE_STORAGE.md) supersedes upload-unimplemented statements, without proving original upload behavior or hosting persistence.

## Phase 5 remaining boundaries

| ID | Current status |
| --- | --- |
| U28 | Original upload response/errors/allowlist/validation/deduplication/ownership/publication remain UNKNOWN. Success envelope and4MiB/PDF frontend use are VERIFIED_FROM_FRONTEND; all new limits/container/subset/state/public-scope/error policies are INFERRED. No legacy upload was sent. |
| U29 | Actual private persistent MonsterASP path, NTFS ACLs, hard-link permission, flush/power-loss behavior, quota and Git Deploy/redeploy persistence are UNKNOWN on this account. Official documentation describes deployment protection; no live control-panel action was performed. Manual Phase7 checklist exists. |
| U30 | Paired SQL/filesystem backups, actual host restore/rollback and production repair operating procedure remain unverified. Local explicit nonproduction recovery/retention tested; no destructive GC/automatic orphan deletion, no confidential-media revocation or quota system claimed. |
| U31 | Phase6 final absolute same-origin API base, Next Image final hostname allowlist, old file ID/URL import and proxy/session dispatch remain pending. Current frontend/config/legacy integration unchanged. Opaque generated keys do not implicitly import arbitrary legacy paths. |
| U32 | Structural/signature checking is not a complete codec decoder, general PDF sanitizer or antivirus. PNG/JPEG/GIF/static WebP and a conservative PDF1.x subset are supported; actual browser PDF sandbox/rendering and host load remain manual checks. Public upload is for nonconfidential media only. |

U26 local upload-to-content and public-serving blocker is resolved for newly uploaded approved media, including independent gallery images and unchanged profile ownership. Physical hosting persistence, original import and final frontend cutover remain separate gates. Phase4 request/DTO contracts were not changed.

> Phase 4 current status, 2026-11-11: 43 content operations are implemented and SQL/HTTP tested; total 55 implemented, one blocked Auth operation and one excluded upload. Earlier phase status paragraphs below are historical snapshots. [Content contracts](CONTENT_API_CONTRACTS.md) distinguish evidence from new policy; implementation does not prove legacy semantics.

## Phase 4 unresolved behavior and explicit decisions

| ID | Current status |
| --- | --- |
| U22 | INFERRED: omitted create isActive=false; optional numeric/bool 0/false; SQL NULL strings map to empty DTO strings; missing blog specialist stores NULL but returns numeric 0/null nested; PUT partial and singleton missing=404. Nullable SQL and frontend types are verified sources, but these original defaults/null branches are UNKNOWN. |
| U23 | INFERRED: immutable deterministic Unicode slug + id, unique hash constraint/collision check, hard-delete content only, referenced specialist 409. Public sample status 0 was observed; meanings of 0/1/2 and withholding 1/2 are not historically verified. |
| U24 | INFERRED: numeric sort-column meanings/defaults, page1/size10/cap100, ascending/Id tie-break, escaped substring search and database collation. Canonical query names/enums are documented; lower-case Services and ignored perPage/page were observed. Generalized case aliases and duplicate-key rejection are new policy. |
| U25 | UNKNOWN original administrative Setting/get, Ads/get and statistics success; Client active-ad/image branch. Separate tested replacement projections and seven content count metrics are explicit new policy, not recovered historical formulas. |
| U26 | Phase5 blocker: physical uploads/serving/durable storage, file ownership/lifecycle and old URL/ID import. Ready dbo.Files fixtures validate Phase4 relationships only, not actual media delivery. No individual content endpoint is blocked. |
| U27 | Offset-free date shape and six/seven fractional digits observed. SQL precision preservation implemented; trimming/all-zero branch, UTC storage and updatedAt fallback are INFERRED. Original instant/timezone interpretation and full browser date display remain UNKNOWN. |

U02/U03/U04/U17 now have narrow tested compatibility extensions: testimonial update starNumber alias (canonical starsNumber retained, conflicting values rejected), create isActive, matching update body id, testimonial response alias, and top-level error message. Other unexpected JSON fields remain rejected. These resolve unchanged frontend consumption for tested branches without reclassifying original behavior as verified. U06 admin scopes and U09 deletion remain new least-privilege policies. U12 nonimplementation statements below are superseded, not evidence of a remaining content blocker.

# السلوك غير المثبت والتعارضات

> تحديث Phase3: ست عملياتAuth وستUser أصبحتimplemented/tested داخل backend معزول، بسياساتINFERRED معلنة. لا عيناتlogin/User legacy جديدة ولاcutover؛ toggle-2fa محظور501 ولايعدمنفذًا. التفاصيل في [العقود](AUTH_API_CONTRACTS.md). جرى تجاوز خطرNext16.2.7 بترقية16.4.6، معبقاءadvisories فيتبعياتأخرى.

## إضافات Phase3 إلى سجل الفجوات

| ID | الحالة الحالية |
| --- | --- |
| U18 | password minimum12، purpose0/1/2 meanings، string roles، User sort/page/IsActive/date/DTO، error.message alias: سياسات جديدة مختبرة، لا verification للأصل؛ يلزم اعتمادها/fixtures قبلcutover |
| U19 | SMTP acceptance عبرprovider حقيقي، hosting TLS/SQL/Node/pool/private jobs/retention/backup غير مثبتة؛ test mail capture ليس delivery proof |
| U20 | toggle-2fa: BLOCKED_2FA_PUBLIC_WORKFLOW؛ schema فارغ وUI لا يرسلcode؛ authenticated501 بلاmutation. login2FA foundation فقط مختبر علىfixture |
| U21 | Next16.4.6 بلاadvisory في التدقيق الحالي، لكن39findings في dependencies أخرى بقيت؛ production readiness غير معلنة |

U06/U07/U10/U11/U13/U15 لم تتحول إلىlegacy-verified بسبباختباراتالبديل. mappings/security/date responses الجديدة صريحة، وimport الهوية/الهاشات/المفاتيح القديمة وsession/logout cutover ما زالت تحتاج تصميمًا معتمدًا. U12: الجداول والخدمات الجديدة موجودة الآن؛ بقية44 content operations لم تنفذ. 12عملياتAuth/User منفذة، واحدةمحظورة، ولا100%parity.

> تحديث Phase2،2026-11-11: U12/U14 أدناه تصفان لقطة Phase1؛ أصبح SQL foundation/migrations موجودًا واختُبر فعليًا على SQL محلي معزول. كل original57 API behavior ما زال غير منفذ، وhosting/production verification ما زال مجهولًا. التحديث لا يحسم أي response/auth/enum/delete/default gap. راجع [تقرير Phase2](PHASE2_FOUNDATION.md).

المرحلة الأولى، 2026-11-11. UNKNOWN لا يعني غير مطلوب؛ يعني أن التنفيذ/التوافق لم يثبت. جميع قرارات التصميم أدناه **INFERRED** وليست وصفًا لـ ASP.NET الأصلي. لا توجد موافقة ضمنية على تعديل frontend أو توسيع صلاحيات أو إسقاط حقل.

## سجل الفجوات

| ID | الدليل/المشكلة | أثرها وطريقة الحسم قبل ادعاء التوافق |
| --- | --- | --- |
| U01 | DOCUMENTED_IN_OPENAPI: كل 57 responses تذكر 200 Success فقط دون schema؛ writes وauth وUser لم تُجرب | يلزم sanitized fixtures أو توثيق موثوق/بيئة legacy اختبار مصرح بها. لا تحدد body/status للـ create/update/delete من envelope GET. response schema لأي API غير مثبت يبقى UNKNOWN |
| U02 | VERIFIED_FROM_FRONTEND: create/update/read تستعمل starNumber. DOCUMENTED_IN_OPENAPI: create starNumber، update starsNumber. VERIFIED_FROM_LEGACY_RESPONSE: GET يستعمل starsNumber | **تعارض فعلي**. لا يمكن ادعاء التطابق الحرفي مع الاسمين معًا تحت additionalProperties:false. اقتراح خادم يقبل الاسمين ويرفض اختلاف القيم، ويعيد alias إضافيًا أو يكيّف boundary للواجهة؛ كلاهما extension يحتاج قرارًا موثقًا واختبارات، ولا ينفذ في Phase 1 |
| U03 | frontend يرسل isActive في creates، لكن schemas لا تحتويه ومغلقة additionalProperties:false | strict Zod مطابق للوثيقة سيرفض الواجهة. اقتراح قبول الحقل extension مع تثبيت default omission مستقلًا. يلزم تأكيد السلوك/قرار قبل التطبيق؛ لا يغيّر form |
| U04 | frontend update يرسل body id؛ Swagger يضعه في path فقط مع body مغلق | اقتراح backend extension يقبل body id المطابق ويرفض mismatch دون تغيير route/body الحاليين. قبول إضافات محددة لا يعني permissive لجميع الحقول |
| U05 | nullable وoptional موثقان بشكل مختلف، UI validation أشد، ولا توجد CLR defaults/قواعد legacy | لا يحول غياب int/bool إلى 0/false أو null إلى empty string تلقائيًا. يلزم اختبار omitted/null/empty لكل حقل. قيود SQL/DTO الداخلية لا تُفرض كـ API limits دون دليل |
| U06 | global Bearer في Swagger يشمل login/public reads؛ GET عام ناجح فعليًا؛ scope inactive/draft غير مختبر. role mappings غير موثقة | إعداد access matrix مقترح محافظ مع فصل anonymous read عن authenticated admin read. عرض inactive والدرافات للعامة ممنوع افتراضيًا ويُسجل اختلافًا حتى التحقق. إدارة المستخدمين لا ترث كل أدوار المحتوى. لا خلط enum sorting بأدوار |
| U07 | enum sort أرقام فقط؛ casing/query في Swagger؛ lowercase PageNumber مقبول في Services؛ perPage/page تجاهلتهما OurSpecialists | معاني كل رقم واتجاه/null order/default sort/page limits/page=0 أو negative، البحث/collation والعدد تحت concurrency غير معروفة. لا يُستنتج mapping من ترتيب DTO. تحقق محدود آمن أو fixture؛ لا تعميم عينة Services على كل module |
| U08 | frontend يحتاج slug وstatus وnested specialist؛ Swagger لا يوضح slug generation/status meanings | تثبيت numeric status 0/1/2 دون افتراض draft/published/archived. توليد slug الفريد بالعربية/on-title-edit/normalization/redirects والترتيب الافتراضي يحتاج موافقة/دليل، لحماية URLs وSEO |
| U09 | لا دليل عن delete/referenced files/specialists أو isActive cascades/concurrency | لا cascade أو soft delete افتراضي. سياسة محافظـة مقترحة FK NO ACTION ورفض تعارض 409 يحتاج تمييزه كتصميم جديد؛ code/status الأصلي UNKNOWN. isActive ليس دليل soft-delete. حسم hard-delete/archive قبل DML |
| U10 | GET dates strings بلا timezone suffix؛ frontend يستخدم Date parser؛ دقة الكسور مختلفة محتملة | SQL DATETIME2 UTC مقترح؛ منطقة الأصل وrounding/fraction formatting مجهولة. لا إضافة Z أو toISOString تلقائيًا للاستجابة قبل snapshot ومراجعة sorting/display/SEO |
| U11 | auth غير login غير مستهلك؛ OtpPurposeEnum 0/1/2 بلا أسماء؛ ToggleTwoFactorRequest فارغ؛ لا response fixtures | غرض OTP، challenge/2FA flow، شروط تأكيد البريد، reset invalidation/status/messages ومعدلات المحاولة UNKNOWN. توثيق سياسة آمنة ثم fixtures في بيئة اختبار؛ لا اعتبار تصميم جديد verified legacy |
| U12 | لا replacement DB/backend في المشروع؛ اختبارات موجودة تختبر session/proxy/sanitizer | كل 57 NOT_IMPLEMENTED_PHASE1 وNOT_RUN للتوافق البديل. mocks ووجود handler لاحقًا لا تكفي. كل عملية تحتاج سلوك SQL فعلي واختبار observable contract |
| U13 | لا frontend لـ Ads/Admin statistics/User؛ Client/get-ads عينة inactive فقط؛ protected GETs أعادت 401 | نجاح Ads/get/Setting/get/statistics وأشكال User جميعًا غير معروفة؛ لا تعداد بيانات شخصية. يلزم وصف/fixtures من مالك النظام أو sandbox، بلا fabricated fields |
| U14 | SQL Server الأصلي ومصدر C# غير متاحين؛ اتصال DB/host/SMTP/data import غير متاح في هذا التدقيق | صلاحيات CREATE/ALTER/applock/TLS، filesystem دائم، backup، Node version/port/start command، وصول الشبكة للمهاجرات، SMTP كلها gates. حسابات المستخدمين/هاشات كلمات المرور القديمة قد تحتاج reset مخطط؛ ممنوع الادعاء بنقلها أو اختبار MonsterASP.NET |
| U15 | session decoder ليس signature verifier؛ login adapter يحتاج token/id/email/role/expiresOn؛ JWT قديم حقيقي لم يُحفظ أو يُفحص؛ code لا يمر من الشاشة | تحقق تشفيري واجب للبديل وكل internal dispatch؛ signing keys/issuer/audience/legacy import/roles غير معروفة. لا قبول token قديم بالـ decode فقط. 2FA للإدارة يحتاج flow متوافقًا لا يمكن اختراعه في frontend؛ يسجل blocker |
| U16 | upload response مثبت من consumer فقط؛ لم ينفذ upload؛ file DTOs موجودة؛ ملفات قديمة/حذفها غير متاحة | أنواع/حجم legacy الفعلي/duplicates/ownership/URLs والـ PDF behavior تحتاج fixture. 4 MiB حد proxy الحالي، وليس دليل legacy. التخزين الدائم وfile ID mapping وbackup/restore/redeploy يجب اختبارها لاحقًا |
| U17 | GET errors الفعلية error:{code,message,details:null}؛ frontend types error:string/null، Axios يقرأ message أعلى الرد؛ login adapter قد يعامل object كرسالة | لا يمكن إعلان تطابق envelope. إبقاء API الأصلي object وتكييف استخراج message في server adapter فقط خيار محتمل؛ إضافة message أعلى original response extension منفصل. لا تعدل DTO/axios في الواجهة، ولا تدعي نجاح ظهور كل error toast |

## ما أثبتته GET probes وحدودها

توثق دفعة probes عدد 28 طلب GET دون credentials أو تعديل بيانات، بتاريخ التدقيق. حُفظ schema/type profiles آمنة في [RESPONSE_CONTRACTS.md](RESPONSE_CONTRACTS.md)، لا records أو tokens أو PII. اقتصرت مراجعة legacy على القراءة.

- قوائم وتفاصيل المحتوى السبعة وblog by-slug نجحت 200 بهياكل موضحة. لا يثبت ذلك inactive/status branches أو authorization عند الكتابة.
- Client/get-settings وClient/get-ads نجحا دون Bearer؛ Ads/get وSetting/get وSetting/get-statistic أعادت 401. لا يُفهم منه role policy لمستخدم مصادق.
- Services بقيم PascalCase/lowercase أعاد paging المتوقع للعينة؛ Search غير مطابق أعاد array فارغة؛ id غير موجود أعاد 404؛ PageSize غير قابل للـ parsing أعاد 400.
- en وku نجحا بنفس bilingual field shape؛ لا Content-Language مثبت. لا يثبت ترجمة أخطاء أو fallback للغة غير مدعومة، ولا وجود محتوى كردي حقليًا.
- لم تنفذ POST/PUT/DELETE أو User reads أو تسجيل دخول؛ لا قاعدة بيانات أُنشئت، لا dependencies ثُبتت، لا deployment جُرب.

`User/get-all?IsActive=...` موثق، لكن العلاقة بين IsActive وIsDisabled/EmailConfirmed غير مثبتة. لا يُفسر الحقل تلقائيًا كعكس IsDisabled؛ هذا جزء من U06/U13 ويحتاج fixture قبل تنفيذ فلتر المستخدمين.

## ترتيب حسم المخاطر

1. U02/U03/U04/U17: تثبيت قرار توافق مكتوب للطلبات والاستجابات المتناقضة؛ أي extension موثق في OpenAPI لاحقًا مع مصدره INFERRED، دون frontend edits.
2. U06/U11/U15: role mapping، OTP purposes، 2FA/challenge، صلاحيات User، سياسة JWT والجلسة. ممنوع فتح admin endpoints لتجاوز غياب fixtures.
3. U07/U08/U09/U10: sorting/page defaults، slug/status، deletion وتواريخ؛ لا بيانات production قبل اعتمادها.
4. U14/U16: الوصول إلى SQL/SMTP والتخزين الدائم وخطة ترحيل البيانات/الملفات؛ نجاح كود محلي لا يعوض اختبار المضيف.

يمكن بناء foundation معزول في Phase 2 بعد تعليمات التنفيذ التالية مع بقاء الخدمات القديمة فعالة. لا يمكن إتمام claim التوافق الكامل أو cutover/production قبل حسم هذه gates. تنتهي هذه المرحلة بالوثائق فقط؛ لا طلب لتنفيذ المرحلة التالية ضمنًا.
