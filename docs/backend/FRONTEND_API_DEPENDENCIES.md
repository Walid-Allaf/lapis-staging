> Phase6 current source audit,2026-11-11: the dependency descriptions below are retained as the historical Phase1 snapshot. Current public apiFetch invokes a server-only dispatcher/cache for17 public reads plus the existing protected settings fallback (uncached401) directly; dashboard login and the unchanged39-rule proxy invoke the internal57-operation registry. Actual sessions verify JWT+SQL and logout revokes jti. Asset/SEO bases are build-time APP_ORIGIN, with exact same-origin Next Image configuration. All frontend components/forms/hooks/feature services/constants/DTOs/mappers/translations/layouts plus Axios/urls/auth/proxy-policy remain unchanged. Only the explicitly authorized server integration files changed. See [dependency inventory](LEGACY_DEPENDENCY_AUDIT.md) and [compatibility report](CUTOVER_COMPATIBILITY_REPORT.md).
>
> Source correction: app/(site)/about/page.tsx currently reads Services and settings, not Specialists as one old paragraph below stated. Public homepage still reads Specialists. The new HTTP tests assert actual source consumers and populated SQL markers, not the historical prose. Cache remains60s/eight tags; direct/proxy mutations invalidate after SQL success. Existing frozen fallback catches remain; a server readiness gate returns503 for missing SQL/schema/settings, with documented mid-request race limitations. No hidden ASP.NET fallback exists.

# اعتماد الواجهة على API — لقطة المرحلة الأولى

تاريخ التدقيق: 2026-11-11. هذا وصف للكود الموجود **VERIFIED_FROM_FRONTEND** وليس تنفيذًا جديدًا. جميع مسارات المصدر أدناه نسبةً إلى جذر المشروع. لم تتغير الواجهة أو DTOs أو الإعدادات أو dependencies أثناء هذا التدقيق.

## قنوات الاتصال الحالية

| Caller | المسار الحالي | العقد الواجب حفظه |
| --- | --- | --- |
| Public Server Components وmetadata وsitemap | `lib/api/*.ts` ← `lib/api/client.ts::apiFetch<T>` ← عنوان ASP.NET من `NEXT_PUBLIC_API_BASE_URL` | signature وenvelope وquery ونتيجة mapper كما هي؛ cache لمدة 60 ثانية وtags الحالية |
| Dashboard CRUD وsettings | feature services ← `dashboard/api/axios.ts` ← `/dashboard/api/proxy/<original path without api/>` ← ASP.NET `/api/...` | browser same-origin؛ لا JWT في JavaScript؛ proxy يعيد status/body الحاليين |
| Dashboard login | login service ← `POST /dashboard/api/session/login` ← `/api/auth/login` | browser يرسل email/password؛ الخادم وحده يرى token ويضع cookie؛ browser يتلقى session projection |
| استرجاع/إنهاء الجلسة | `GET /dashboard/api/session`، `POST /dashboard/api/session/logout` | session user/expiry، 401 عند الانتهاء، logout 204 ومسح cookie |
| الصور والملفات | `createAssetUrl` العام و`getAssetUrl` في dashboard + Next Image/preview | ربط URL النسبي بالـ base دون تغيير file IDs أو أسماء nested fields |

لا توجد الآن Route Handlers بديلة للعمليات الـ57 تحت `/api/...`. Route Handlers تحت `/dashboard/api/...` هي adapters للـ backend الخارجي، ولا تعني تنفيذ عمليات SQL Server. صفحة `/dashboard` لا تغني عن تفويض كل API على الخادم.

## الموقع العام: استدعاءات وعمليات تحويل

| ملف قائم | API original | استهلاك النتيجة والملاحظات |
| --- | --- | --- |
| `lib/api/services.ts` | Services/get-all | landing يستخدم pageSize=3 مع حد طلب لا يقل عن 10؛ all-services يقرأ صفحات 100 اعتمادًا على totalRecords/pageSize؛ mapping للأسماء والوصف وavatar/order، filter isActive والترتيب |
| `lib/api/faqs.ts` | FAQs/get-all | PageNumber=1، PageSize=10، اختيار Ar/En وإخفاء السجلات غير الفعالة/النصوص الفارغة |
| `lib/api/specialists.ts` | OurSpecialists/get-all | PageNumber=1، PageSize=10؛ nested image ثم URL، bilingual mapping/filter |
| `lib/api/testimonials.ts` | Testimonials/get-all | PageNumber=1، PageSize=10؛ **يتوقع starNumber** وavatar؛ تعارض U02 مع legacy starsNumber |
| `lib/api/galleries.ts` | Galleries/get-all | PageNumber=1، PageSize=100؛ beforeImage/afterImage، bilingual content |
| `lib/api/youtube-galleries.ts` | YouTubeGalleries/get-all | PageNumber=1، PageSize=100؛ videoUrl والفلاتر الحالية |
| `lib/api/blog-posts.ts` | BlogPosts/get-all وby-slug/{slug} | list افتراضي 12؛ sitemap يطلب 100؛ IsActive/IsFeatured/Status حسب caller؛ slug، nested specialist، image، metadata؛ HTML يمر عبر sanitizer الحالي |
| `lib/api/settings.ts` | Client/get-settings ثم Setting/get عند فشل الأول | نفس envelope؛ section toggles والاتصال وSEO/footer؛ fallback غير مصادق أعاد 401 في العينة ولا يثبت حق قراءة إدارة settings |

`apiFetch` يرسل `Accept: application/json`؛ يبني query بأسماء المصدر ويستبعد undefined/null/empty string؛ يفحص HTTP status ثم `isSuccess` ويعيد envelope. public queries تستعمل `PageNumber`, `PageSize`, `IsActive` حرفيًا. لا يجوز استبدالها تلقائيًا بـ page/limit. `createAssetUrl` يحفظ http/https المطلقين ويربط النسبي بالـ base. أي فشل قد يمر عبر catch/fallback في الصفحة؛ نجاح build وحده لا يكشف استبدال البيانات بفراغ.

المسارات تحت `app/(site)` تستعمل طبقة `lib/api` والمكونات المشتركة: الصفحة الرئيسية تعرض الخدمات والمتخصصين والتقييمات والأسئلة؛ الخدمات تقرأ الكل؛ الصور تقرأ Galleries؛ الفيديو يقرأ YouTubeGalleries؛ المدونة تقرأ list/by-slug؛ about يستعمل المتخصصين؛ settings تدخل layout/أقسام الاتصال والرؤية وmetadata. `app/sitemap.ts` يعتمد على المدونة. لذلك scope الاختبار يشمل صفحات الموقع والـ SEO، لا جدول dashboard فقط.

## لوحة التحكم: خريطة الملفات القائمة

| Module | جذر الميزة | العمليات المستهلكة |
| --- | --- | --- |
| Services | `dashboard/features/services/` | get-all، get-by-id/{id}، add، edit/{id}، delete/{id} |
| FAQs | `dashboard/features/faqs/` | CRUD الخمس |
| OurSpecialists | `dashboard/features/our-specialists/` | CRUD الخمس + مصدر autocomplete للمدونة |
| Testimonials | `dashboard/features/testimonials/` | CRUD الخمس؛ أسماء starNumber في form/validation/DTO |
| Galleries | `dashboard/features/gallery/` | CRUD الخمس؛ beforeFileId وafterFileId |
| YouTubeGalleries | `dashboard/features/youtube-galleries/` | CRUD الخمس |
| BlogPosts | `dashboard/features/blog-posts/` | CRUD الخمس؛ by-slug موجود في constants/allowlist لكنه غير مستدعى من UI dashboard |
| Setting | `dashboard/features/setting/` | GET Setting/get، PUT Setting/edit |
| Authentication | `dashboard/features/login/` و`dashboard/api/` | login فقط من original APIs؛ session محلي |
| FileUpload | `dashboard/components/form/image-upload.tsx` | POST FileUpload/upload، multipart field `file` |

كل ميزة CRUD تحتوي `services/*-endpoints.ts` و`*-get-all-service.ts`, `*-get-by-id-service.ts`, `*-create-service.ts`, `*-update-service.ts`, `*-remove-service.ts` و`interfaces/`, `hooks/`, `constants/`, `validation/`, `components/`. [المصفوفة](API_COMPATIBILITY_MATRIX.md) تسرد ملفات المستهلك المحددة لكل عملية؛ ليست مجرد قائمة handlers.

تفاصيل ثابتة:

- get-all يعيد envelope للجدول؛ get-by-id يفك `response.data.data`؛ mutations تعيد `response.data`. يجب الحفاظ على الاثنين دون تغيير signatures.
- `dashboard/api/types/` يعرّف MainType/paging. `isSuccess` اختياري في النوع، وpaging مطلوب؛ legacy singleton/detail أرسل paging:null. الواجهة لا تثبت شكل نجاح write؛ لا يُخترع رد delete مثل `{deleted:true}`.
- create forms ترسل `isActive` رغم غيابه عن create schemas المغلقة؛ update forms ترسل body `id` رغم غيابه عن update schemas. هذه خلافات U03/U04، لا يجوز إسقاط الحقول في الواجهة أو الادعاء بتوافق كامل.
- `dashboard/hooks/use-autocomplete.ts` يرسل `perPage`, `page` واسم search الممرر، ومدونة المتخصصين تستخدم `search`. عينة legacy تجاهلت perPage/page وأرجعت pageNumber=1/pageSize=10. تفعيل aliases جديدة يغيّر عدد الاختيارات، لذلك يحتاج قرارًا موثقًا.
- `Sort.Field` و`Sort.Descending` يجب أن يبقيا literal dotted names؛ enum values محفوظة، معانيها UNKNOWN. لا يُستنتج mapping من ترتيب أعمدة UI أو أسماء properties.
- pagination في dashboard يحتوي مسارات zero-based وone-based؛ لا refactor في Phase 1 ولا فرض clamp غير مثبت لاحقًا.
- الرفع يتوقع `data.fileId` و`data.filePath`؛ القراءة ضمن الصور تتوقع `{id,filePath}`. الحقلان id/fileId غير قابلين للتبادل.
- accept في uploader واسع ويتضمن previews للصور وPDF؛ الحد الحالي 4 MiB. `dashboard/api/urls.ts::getAssetUrl` يبقي http/data/blob ويطبع separators الحالية. لا يُغيّر لبناء مسار رفع جديد.
- أخطاء Axios تقرأ top-level `message`؛ DTOs تصف error كسلسلة. legacy GET failures أعادت error object؛ U17. لا إصلاح toast/form side effects ضمن هذا التدقيق.

## عدد المستهلكين وحدود proxy

**41 عملية أصلية من أصل 57 لها مستهلك قائم** في الموقع/اللوحة معًا؛ 16 لا مستهلك مباشر لها. الـ41 = 35 CRUD + login + Setting/get/edit + upload + public blog by-slug + Client/get-settings.

الـ16 المتبقية: Ads get/edit؛ Client/get-ads؛ Setting/get-statistic؛ auth register/confirm-email/reset-password/send-otp/verify-otp/toggle-2fa؛ عمليات User الست. غياب UI لا يلغي وجوب تنفيذها لاحقًا، ولا يجعل responses لها مثبتة.

`dashboard/api/proxy-policy.ts` يحدد **39 rule**: 35 CRUD + BlogPosts/by-slug + Setting get/edit + upload. السماح في policy ليس إثبات أن UI يستدعي كل rule؛ login منفصل وClient/get-settings من public server. لا تُوسّع allowlist إلى User/auth admin APIs لمجرد أنها في Swagger.

## الجلسة والضوابط الحالية المحفوظة

`dashboard/api/session-contract.ts`:

```ts
type DashboardSession = {
  user: { id: string; email: string; role: string | number };
  expiresOn: string;
};
// Cookie: lapis_admin_session
```

`dashboard/server/session.ts` يفك claims لأغراض projection ويتحقق من exp/nbf/شكل role، **لا يتحقق من التوقيع**. التحقق الفعلي حاليًا مسؤولية ASP.NET عند كل عملية. تقبل القراءة sub/id/nameidentifier والبريد email/emailaddress/unique_name، وrole أو .NET role claim. `dashboard/api/auth.ts` يسمح حاليًا 1 و2 أو superadmin/manager/admin بعد normalization؛ هذا عقد قبول UI، وليس إثباتًا لدور كل رقم في الأصل. constants أخرى غير مستخدمة لا تصلح دليلًا لتعيين Roles في SQL.

login adapter يرسل للخارج email/password فقط؛ `code` موجود في Swagger ولا يمر من هذه الشاشة. يتوقع من upstream `data.id/email/role/token/expiresOn`، يطابق الهوية مع claims، ويختار أقرب expiry. JWT يبقى HttpOnly cookie، SameSite=Strict، Path=/dashboard، Secure في production، بحجم token أقصاه 3500 bytes. cookie Path لا يرسل token إلى `/api`؛ proxy يجب أن يستخرج الهوية داخليًا، والـ original APIs تعتمد Bearer موثقًا.

proxy يطبق same-origin mutation/CSRF، method/path allowlist ومنع traversal، session presence، server-side Bearer، header filtering، no-store، مهلة upstream 30 ثانية، streamed body/upload limits، عدم تمرير Set-Cookie، clear cookie عند 401. login body limit هو 16 KiB. logout محلي idempotent 204؛ client يمسح auth/query state ويعمل navigation/cache flush الحالي. `proxy.ts` يحرس وجود cookie للصفحات؛ layout/session check يثبت projection وانتهاء الجلسة. هذه الدفاعات كلها محفوظة عند تبديل transport.

## الكاش والنقل الداخلي المقترح — INFERRED

لا يوصى بطلب HTTP من Server Component إلى نفس التطبيق. التغيير المستقبلي المسموح هو داخل `lib/api/client.ts` وserver adapters: dispatcher إلى services/server-only مع الإبقاء على `apiFetch` والـ DTOs والـ mappers الحالية. لا يُحذف `next.revalidate=60` أو tags عند الوصول المباشر إلى DB؛ يبنى wrapper مكافئ ويختبر بوضوح.

الـ tags الحالية: `landing-services`, `landing-faqs`, `landing-specialists`, `landing-testimonials`, `landing-gallery`, `landing-youtube`, `landing-blog`, `landing-settings`. تعديل specialist يمس tag المدونة أيضًا. revalidate يحصل بعد commit ناجح في domain mutation سواء استُدعي original `/api` أو proxy. لا تكفي invalidation الموجودة في proxy وحدها. البيانات الإدارية/auth لا تدخل public cache، ومفاتيح cache تشمل query واللغة؛ لا cookies أو Authorization ضمن shared cache.

قرئت guides المحلية لـ Next.js 16.2.7: Route Handlers، revalidateTag، unstable_cache تحت `node_modules/next/dist/docs/`. `unstable_cache` متاح للكاش القائم لكنه مستبدل توجيهيًا بـ `use cache`. تمكين Cache Components ليس تغييرًا ضمنيًا مسموحًا؛ سيُختبر اختيار adapter المتوافق مع إعداد المشروع في المرحلة التالية، دون تغيير نمط rendering أو SEO.

## حدود التجميد

يبقى كل ما تحت صفحات/مكونات الموقع واللوحة وfeature services وDTOs وvalidation والترجمات والتنقل على حاله. التعديل المستقبلي محصور في server integration/infra الموصوفة في [الخطة](IMPLEMENTATION_PLAN.md). endpoint أو حقل متناقض لا يُحل بتعديل المستهلك؛ يسجل في [الغموض](UNKNOWN_BEHAVIORS.md) حتى يتوفر قرار قابل للاختبار.
