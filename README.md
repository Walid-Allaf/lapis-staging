> Phase7A، تصحيح2026-11-12: عولج تجاوز عرض الهاتف بإصلاح CSS محدود ومصرح به، واجتاز القياسات المتكررة بالعربية والإنجليزية. بقي تنظيف حسابات وملفات الاختبار معلقًا لعدم توفر مسار موافقة تنفيذ؛ اختبارات الاستضافة لم تُنفذ. لا استيراد تاريخي ولا نشر. راجع [الجاهزية](docs/backend/PHASE7_RELEASE_READINESS.md)، [تصحيح الهاتف](docs/backend/PHASE7_MOBILE_CORRECTION.md) و[التنظيف اليدوي](docs/backend/PHASE7_LOCAL_CLEANUP.md). بقية مصادر الواجهة وعقود API وملف .env دون تغيير.
# LAPiS Dental Lab

هذا المشروع هو الموقع الرسمي لمخبر `LAPiS Dental Lab`، وهو موقع تعريفي وخدمي لمخبر أسنان في حلب. يهدف الموقع إلى عرض خدمات المخبر، أعمال المعرض، الفيديوهات، المقالات، فريق المختصين، آراء العملاء، والأسئلة الشائعة، مع دعم كامل للغتين العربية والإنجليزية واهتمام واضح بمحركات البحث ومشاركة الروابط.

المشروع مبني باستخدام `Next.js 16.4.6` مع `App Router` و`React 19.2.4` و`TypeScript`. ملاحظة مهمة من تعليمات المشروع: نسخة Next.js المستخدمة هنا تحتوي تغييرات قد تختلف عن المعرفة الشائعة، لذلك يجب الرجوع إلى الأدلة المحلية داخل `node_modules/next/dist/docs/` قبل تعديل كود Next.js أو الاعتماد على افتراضات قديمة.

## فكرة المشروع

الموقع يعمل كواجهة أمامية ديناميكية لمخبر الأسنان. المحتوى الأساسي لا يعيش كله داخل الملفات، بل يتم جلبه من API خارجي عبر المتغير `NEXT_PUBLIC_API_BASE_URL`. عند تعطل بعض الطلبات، تستخدم الصفحات قيمًا احتياطية أو تعرض أقسامًا فارغة بدل إيقاف الصفحة بالكامل.

أهم ما يقدمه الموقع:

- صفحة رئيسية تسويقية تعرض تعريف المخبر وأبرز الخدمات والمختصين وآراء العملاء والأسئلة الشائعة.
- صفحة خدمات تعرض كل خدمات المخبر القادمة من API.
- معرض حالات قبل وبعد لنتائج أعمال المخبر.
- صفحة فيديوهات YouTube تعليمية أو تعريفية.
- مدونة مع بحث، فلترة حسب المقالات المميزة، وترقيم صفحات.
- صفحة تفاصيل مقال عبر المسار الديناميكي `/blog/[slug]`.
- صفحة تعريف بالمخبر.
- صفحة تواصل تعتمد على إعدادات الموقع من API مثل الهاتف والبريد والموقع الجغرافي وروابط التواصل.
- دعم عربي/إنجليزي مع اتجاه `rtl` للعربية و`ltr` للإنجليزية.
- SEO متقدم يشمل metadata، Open Graph، Twitter cards، sitemap، robots، manifest، وJSON-LD.

## التقنيات المستخدمة

- `Next.js 16.4.6`: إطار العمل الرئيسي مع App Router.
- `React 19.2.4` و`react-dom`: بناء واجهة المستخدم.
- `TypeScript`: typing صارم عبر `strict: true`.
- `Tailwind CSS 4`: نظام التصميم والـ utility classes عبر `@tailwindcss/postcss`.
- `i18next`: إدارة الترجمة بين العربية والإنجليزية.
- `next/font/google`: تحميل خط Cairo وتحسينه.
- `nextjs-toploader`: شريط تحميل علوي أثناء الانتقال بين الصفحات.
- `AOS`: تأثيرات الظهور أثناء التمرير.
- `ESLint 9` مع `eslint-config-next`: فحص جودة الكود.

## تشغيل المشروع

ثبت الحزم أولًا:

```bash
npm install
```

شغل بيئة التطوير:

```bash
npm run dev
```

ثم افتح:

```text
http://localhost:3000
```

أوامر المشروع المتاحة:

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## متغيرات البيئة

يعتمد الاتصال بالباكند على:

```env
NEXT_PUBLIC_API_BASE_URL=https://lapis.runasp.net
```

هذا المتغير مطلوب داخل `lib/api/client.ts`. إذا لم يكن مضبوطًا، سترمي دوال API خطأ عند محاولة بناء روابط الطلبات أو روابط الصور.

## بنية المجلدات

```text
app/
  (site)/
    layout.tsx            اللغة، الاتجاه، الهيدر، الفوتر، SEO العام
    page.tsx              الصفحة الرئيسية
    about/page.tsx        صفحة من نحن
    services/page.tsx     صفحة الخدمات
    gallery/page.tsx      صفحة المعرض
    youtube-videos/page.tsx صفحة الفيديوهات
    blog/page.tsx         صفحة المدونة
    blog/[slug]/page.tsx  صفحة تفاصيل المقال
    contact/page.tsx      صفحة التواصل
  (dashboard)/
    layout.tsx            Arabic RTL admin document and providers
    dashboard/login/      Admin sign-in
    dashboard/(protected)/ Content management and settings
  global-not-found.tsx    Public document for unmatched URLs
  robots.ts               توليد robots.txt
  sitemap.ts              توليد sitemap.xml
  manifest.ts             إعدادات PWA
  loading.tsx             واجهة التحميل
  error.tsx               واجهة الخطأ
  not-found.tsx           صفحة 404

components/
  مكونات الواجهة: الهيدر، الفوتر، أقسام الصفحة الرئيسية، بطاقات الخدمات، المعرض،
  المدونة، الأسئلة الشائعة، المختصين، الشهادات، الفيديو التعريفي، وغيرها.

lib/
  api/                    طبقة الاتصال بالباكند وتطبيع البيانات
  i18n/                   إعدادات وموارد الترجمة
  seo.ts                  إنشاء metadata حسب اللغة والصفحة
  seo-shared.ts           ثوابت وروابط SEO المشتركة
  seo-keywords.ts         كلمات مفتاحية لكل صفحة
  navigation.ts           عناصر التنقل وارتباطها بإعدادات الظهور
  section-visibility.ts   التحكم بظهور الأقسام حسب إعدادات API

public/
  الصور، الفيديو التعريفي، الأيقونات، الشعارات، وملفات المشاركة الاجتماعية.
```

## نظام الصفحات والمسارات

المشروع يستخدم `App Router`. حسب دليل Next المحلي، وجود ملف `page.tsx` داخل مجلد في `app/` يجعل هذا المجلد مسارًا عامًا.

المسارات الحالية:

| المسار | الملف | الوظيفة |
| --- | --- | --- |
| `/` | `app/(site)/page.tsx` | الصفحة الرئيسية مع أبرز أقسام الموقع |
| `/services` | `app/(site)/services/page.tsx` | كل خدمات المخبر |
| `/gallery` | `app/(site)/gallery/page.tsx` | معرض قبل وبعد |
| `/youtube-videos` | `app/(site)/youtube-videos/page.tsx` | فيديوهات YouTube |
| `/blog` | `app/(site)/blog/page.tsx` | قائمة المقالات مع بحث وفلترة وترقيم |
| `/blog/[slug]` | `app/(site)/blog/[slug]/page.tsx` | تفاصيل مقال واحد حسب slug |
| `/about` | `app/(site)/about/page.tsx` | تعريف بالمخبر وطريقة العمل |
| `/contact` | `app/(site)/contact/page.tsx` | بيانات التواصل والخريطة |

## الاتصال بالـ API

كل طلبات البيانات تمر عبر `apiFetch` في `lib/api/client.ts`. هذه الدالة:

- تبني رابط الطلب اعتمادًا على `NEXT_PUBLIC_API_BASE_URL`.
- تضيف query params عند الحاجة.
- تطلب JSON مع header `Accept: application/json`.
- تتحقق من `response.ok`.
- تتحقق من حقل `isSuccess` في جسم الاستجابة.
- تعيد النوع العام `ApiResponse<T>`.

صيغة الاستجابة المتوقعة:

```ts
type ApiResponse<T> = {
  isSuccess: boolean;
  data: T;
  error: string | null;
  paging?: {
    pageNumber: number;
    pageSize: number;
    totalRecords: number;
  };
};
```

مصادر البيانات الحالية:

| الملف | endpoint | الاستخدام |
| --- | --- | --- |
| `lib/api/settings.ts` | `/api/Client/get-settings` ثم fallback إلى `/api/Setting/get` | إعدادات الموقع، التواصل، روابط السوشال، وإظهار/إخفاء الأقسام |
| `lib/api/services.ts` | `/api/Services/get-all` | الخدمات |
| `lib/api/specialists.ts` | `/api/OurSpecialists/get-all` | المختصون |
| `lib/api/testimonials.ts` | `/api/Testimonials/get-all` | آراء العملاء |
| `lib/api/faqs.ts` | `/api/FAQs/get-all` | الأسئلة الشائعة |
| `lib/api/galleries.ts` | `/api/Galleries/get-all` | معرض قبل وبعد |
| `lib/api/youtube-galleries.ts` | `/api/YouTubeGalleries/get-all` | الفيديوهات |
| `lib/api/blog-posts.ts` | `/api/BlogPosts/get-all` و`/api/BlogPosts/by-slug/{slug}` | المدونة وتفاصيل المقال |

معظم الطلبات تستخدم إعداد:

```ts
next: {
  revalidate: 60,
}
```

أي أن البيانات قابلة لإعادة التحقق كل 60 ثانية.

## الصور والملفات

توجد الأصول الثابتة في `public/`، مثل:

- شعارات `LAPiS` داخل `public/brand`.
- صور الأقسام مثل `hero-dental-team.png` و`about.png` و`dental.png`.
- الفيديو التعريفي `intro.mp4`.
- أيقونات PWA داخل `public/icons`.
- صور Open Graph وTwitter داخل `app/`.

أما صور الباكند القادمة من API فيتم تحويل مسارها عبر `createAssetUrl`. كذلك يسمح `next.config.ts` بتحميل الصور البعيدة من:

```text
https://lapis.runasp.net/uploads/**
```

## الترجمة واللغة

يدعم الموقع لغتين:

- العربية `ar`
- الإنجليزية `en`

اللغة الافتراضية هي العربية عبر `fallbackLng = "ar"`. يتم تحديد اتجاه الصفحة من `getDirection`:

- العربية: `rtl`
- الإنجليزية: `ltr`

ملفات الترجمة الأساسية:

- `lib/i18n/settings.ts`: اللغات المدعومة والاتجاه.
- `lib/i18n/resources.ts`: النصوص المترجمة لكل صفحة وقسم.
- `lib/i18n/client.tsx`: مزود الترجمة في الواجهة.

في `app/(site)/layout.tsx` يتم ضبط:

- وسم `html lang`.
- اتجاه `dir`.
- خط Cairo.
- مزود i18n.
- مزامنة لغة SEO.

## التحكم بظهور الأقسام

بعض الأقسام تظهر أو تختفي حسب إعدادات الباكند القادمة من `SiteSettings`. المفاتيح المستخدمة موجودة في `lib/section-visibility.ts`:

- `servicesTabToggle`
- `galleriesTabToggle`
- `youTubeGalleriesTabToggle`
- `testimonialsTabToggle`
- `ourSpecialistsTabToggle`
- `faQsTabToggle`

إذا كانت قيمة المفتاح `false` يتم إخفاء القسم. أي قيمة أخرى، أو غياب الإعدادات، يجعل القسم ظاهرًا افتراضيًا.

## SEO وملفات metadata

المشروع يهتم بالسيو على عدة مستويات:

- `lib/seo.ts`: إنشاء metadata عامة أو خاصة بكل صفحة حسب اللغة.
- `lib/seo-shared.ts`: روابط الموقع، أسماء العلامة التجارية، والوصف العام.
- `lib/seo-keywords.ts`: كلمات مفتاحية مخصصة للصفحات.
- `app/sitemap.ts`: توليد sitemap يشمل الصفحات الثابتة ومقالات المدونة القادمة من API.
- `app/robots.ts`: السماح بفهرسة الموقع ومنع `/api/`.
- `app/manifest.ts`: إعدادات PWA الأساسية.
- `app/opengraph-image.png` و`app/twitter-image.png`: صور المشاركة الاجتماعية.
- JSON-LD للمؤسسة في `app/(site)/layout.tsx`.
- JSON-LD من نوع `BlogPosting` في صفحة تفاصيل المقال.

اللغة الحالية للسيو تُقرأ من cookie باسم محدد داخل `seo-shared.ts`، ثم يتم توليد العنوان والوصف وحقول Open Graph وTwitter بناءً عليها.

## التصميم والواجهة

يعتمد التصميم على CSS variables كثيرة داخل `app/(site)/globals.css`، ثم يتم ربطها مع Tailwind عبر `@theme inline` و`tailwind.config.ts`.

النظام البصري يعتمد على:

- اللون الأساسي الأزرق الداكن.
- اللون الذهبي للتمييز.
- خط Cairo للعربية والإنجليزية.
- أقسام واسعة ومكونات قابلة لإعادة الاستخدام.
- دعم RTL في الأقسام الأساسية عبر قواعد CSS خاصة.
- سلايدر أفقي للمختصين وآراء العملاء.
- معرض قبل وبعد يعتمد على صور منفصلة قبل/بعد.
- فيديو تعريفي محلي من `public/intro.mp4`.

## سلوك الصفحات عند فشل API

معظم الصفحات تستخدم `Promise.all` مع `catch` لكل طلب. عند فشل API:

- الإعدادات تعود غالبًا إلى `null`.
- القوائم تعود إلى مصفوفة فارغة.
- المقال غير الموجود أو غير الفعال في `/blog/[slug]` يؤدي إلى `notFound()`.
- صفحة تفاصيل المقال تستخدم metadata احتياطية إذا فشل جلب المقال أثناء توليد metadata.

هذا يجعل الموقع أكثر تحملًا للأخطاء، لكنه يعني أن غياب `NEXT_PUBLIC_API_BASE_URL` أو تعطل الباكند قد يؤدي إلى صفحات بدون محتوى ديناميكي.

## ملاحظات للمطورين

- قبل تعديل كود Next.js، اقرأ الدليل المحلي المناسب في `node_modules/next/dist/docs/` لأن المشروع يستخدم Next.js 16.
- لا تعتمد على مسارات Pages Router؛ المشروع مبني على `app/`.
- عند قراءة ملف ديناميكي مثل `app/(site)/blog/[slug]/page.tsx` في PowerShell استخدم `-LiteralPath`.
- عند إضافة صفحة جديدة، أضف metadata مناسبة عبر `createPageMetadata`.
- عند إضافة مصدر API جديد، اتبع نمط `lib/api/*`: type واضح، fetch عبر `apiFetch`، تطبيع البيانات، ومعالجة روابط الصور عبر `createAssetUrl`.
- عند إضافة قسم قابل للإخفاء، أضف مفتاحًا جديدًا في `SectionVisibilityKey` واربطه بإعدادات الباكند.

## النشر

يمكن بناء المشروع للإنتاج عبر:

```bash
npm run build
```

ثم تشغيل النسخة المبنية:

```bash
npm run start
```

قبل النشر تأكد من:

- ضبط `NEXT_PUBLIC_API_BASE_URL`.
- سماح `next.config.ts` بدومين الصور المستخدم في الباكند.
- نجاح `npm run lint`.
- نجاح `npm run build`.


## Integrated dashboard

Run `npm install`, then `npm run dev`. Production: `npm run build` and `npm run start`. The public website keeps its original URLs. Admins sign in at `/dashboard/login`; `/dashboard` is the overview. There is deliberately no public navigation link to the admin area.

Both areas use the existing `NEXT_PUBLIC_API_BASE_URL` environment variable (`https://lapis.runasp.net`). Do not add a second API environment variable or change existing environment values. Server-side API forwarding does not depend on browser CORS; public upload images still use the API host. The backend must remain reachable from the Next server.

### Folders and isolation

- `app/(site)/`: public root layout, pages, error/loading/404 UI, and public CSS.
- `app/(dashboard)/`: independent Arabic RTL root document, login, and protected dashboard routes.
- `dashboard/features/`: services, FAQs, specialists, testimonials, gallery, videos, blog posts, settings, and login; existing component/constants/hooks/interfaces/services/validation conventions are preserved.
- `dashboard/components/`, `dashboard/layouts/`, `dashboard/hooks/`: shared admin UI and combined content/settings sidebar.
- `dashboard/api/`, `dashboard/stores/`, `dashboard/server/`: same-origin axios client, in-memory session state, role/expiry policy, and server-only cookie/proxy helpers.
- `dashboard/providers.tsx`, `dashboard/i18n/`: per-session query client and isolated, statically bundled Arabic translations.
- `dashboard/styles/dashboard.css`, `public/dashboard/`: isolated Tailwind entry point, Readex Pro, and used assets.
- Root `app/` metadata routes and image files retain their original URLs. `app/global-not-found.tsx` supplies the multi-root fallback.

The root documents import separate CSS entry points with explicit Tailwind source directories. Navigation between the public site and dashboard performs a full document load. Dashboard translation state never changes the public language preference.

### Authentication

Admin authentication uses the backend JWT in `lapis_admin_session`, an httpOnly cookie with `SameSite=Strict`, `Path=/dashboard`, and `Secure` in production. No token is exposed to browser JavaScript or persisted browser storage. Dashboard startup removes the legacy browser-storage credential and checks `GET /dashboard/api/session` before showing protected content. The store contains only in-memory user/expiry/status data. The existing configured roles (SuperAdmin, Manager, numeric 1/2, and Admin) are checked on the server at login, session inspection, and every proxy request. Expired sessions are rejected. Redirects stay inside `/dashboard`. Confirmed logout clears the server cookie and React Query cache.

The server decodes standard JWT identity/role/expiry claims; it does not verify their signature without the backend signing configuration. The backend remains the cryptographic and authorization authority and must reject invalid or non-admin tokens on every operation. Server forwarding adds the Authorization header; browser API calls use only `/dashboard/api/proxy/`. A fixed endpoint/method allowlist, same-origin mutation checks, filtered headers, streaming size limits, and a 30-second upstream timeout protect the proxy. The page-level `proxy.ts` gate redirects missing-cookie navigations before serving protected shells. Dashboard routes carry noindex metadata, anti-framing/nosniff/referrer headers, a robots exclusion, and never enter the sitemap.

### Adding an admin feature

1. Add `dashboard/features/<name>/` using the existing feature folder conventions and external API contract.
2. Use `@/dashboard/...` imports, the dashboard axios client, React Query hooks, and `useQueryClient()` for dashboard cache invalidation. Add the allowed method/path and public cache tags to `dashboard/api/proxy-policy.ts`, then run `npm run docs:dashboard-proxy`.
3. Add a thin client page under `app/(dashboard)/dashboard/(protected)/<name>/page.tsx`. The parent guard must pass before mounting the feature or making requests.
4. Add the Arabic navigation entry in `dashboard/layouts/shell.tsx` and any search shortcut in `dashboard/layouts/main-layout-components/search-dialog.tsx`.
5. Run `npm run lint`, `npx tsc --noEmit`, `npm run test:dashboard-auth`, `npm run test:sanitize`, `npm run test:dashboard-proxy`, and `npm run build`. Check RTL, mobile navigation, forms, uploads, and CSS isolation.

The standalone source at `D:/lapis-dashboard - Copy` was used as read-only migration reference because `_legacy-dashboard/` was absent. If a reference copy is placed in `_legacy-dashboard/`, it is excluded from Git, TypeScript, and ESLint. Keep the source until authenticated live-backend acceptance testing is complete. See `docs/dashboard-merge-report.md` and `docs/dashboard-merge-inventory.md` for verification and migration details.


### HTML and upload hardening

Public blog content and specialist rich text are sanitized once in the server data mapper through `lib/sanitize-html.ts`; the sanitizer is never shipped to the browser. The policy preserves StarterKit formatting while removing executable elements, unsafe URLs, arbitrary attributes, and link opener access. JSON-LD escaping is unchanged.

The upload limit is now **4 MiB per file (4,194,304 bytes)**, reduced from 5 MiB for hosting compatibility. `dashboard/api/upload-limits.ts` is the shared limit; the proxy streams and counts file content while allowing bounded multipart framing overhead. Oversize uploads return 413. Verify the total request limit on the chosen host.

Successful content/settings mutations expire the corresponding public fetch tags using the Next 16 Route Handler API; `revalidate: 60` remains the fallback. Settings affect navigation on the next public request. See `docs/dashboard-proxy-allowlist.md` and `docs/hardening-report.md` for the current policy, assumptions, and verification. The older merge report is historical.
