# Dashboard integration report

> Historical snapshot of the merge. The subsequent `hardening-report.md` supersedes its browser-storage authentication model and optional hardening follow-ups.

## 1. Summary

Integrated the legacy content-management dashboard into the existing Next.js 16.2.7 website at `/dashboard`. The project now has independent public and Arabic RTL admin root documents, isolated CSS and translations, a combined sidebar, and all seven CRUD areas plus site settings and login.

The public page/layout/component source was moved without changing its content; the only public stylesheet edit limits Tailwind source scanning. No backend, environment value, public navigation link, or standalone source file was changed. Existing uncommitted README content was preserved and updated for the new structure. No commit or deployment was made.

## 2. Final structure

```text
app/
  (site)/
    layout.tsx, globals.css, page.tsx
    error.tsx, loading.tsx, not-found.tsx
    about/, blog/[slug]/, contact/, gallery/, services/, youtube-videos/
  (dashboard)/
    layout.tsx
    dashboard/
      login/page.tsx
      (protected)/
        layout.tsx, page.tsx, not-found.tsx
        services/, faqs/, our-specialists/, testimonials/, gallery/
        youtube-galleries/, blog-posts/, settings/, [...notFound]/
  global-not-found.tsx
  manifest.ts, robots.ts, sitemap.ts
  icon.png, apple-icon.png, opengraph-image.png, twitter-image.png
dashboard/
  api/, assets/, components/, features/, hooks/, layouts/
  i18n/ar.json, lib/, stores/, styles/dashboard.css, utils/
  providers.tsx
public/dashboard/             Used logos and PDF preview asset
tests/dashboard-auth.test.mjs
docs/dashboard-merge-inventory.md
docs/dashboard-merge-verification.json
```

The import inventory is recorded separately. Named barrel exports and unused utility declarations were trimmed so unused UI systems and their dependencies are not pulled into the project. No dashboard `pages/`, standalone router, or build entry point was retained.

The implementation followed the installed Next 16.2.7 guides for route groups, layouts, global-not-found, async route inputs, fonts, CSS, proxy, headers, and static parameters. The separate Tailwind entry points follow the documented [`source(none)` and explicit `@source` syntax](https://tailwindcss.com/docs/detecting-classes-in-source-files#disabling-automatic-detection).

## 3. Implemented route map

| Legacy dashboard | Integrated URL |
| --- | --- |
| `/login` | `/dashboard/login` |
| `/`, `/home` | `/dashboard` |
| `/home/services` | `/dashboard/services` |
| `/home/faqs` | `/dashboard/faqs` |
| `/home/our-specialists` | `/dashboard/our-specialists` |
| `/home/testimonials` | `/dashboard/testimonials` |
| `/home/gallery` | `/dashboard/gallery` |
| `/home/youtube-galleries` | `/dashboard/youtube-galleries` |
| `/home/blog-posts` | `/dashboard/blog-posts` |
| `/settings/app-settings` | `/dashboard/settings` |
| `/settings` intro | Dropped; settings navigation points directly to the form |
| Unknown admin URL | Dashboard 404 UI inside the protected shell |

The old unprefixed dashboard URLs are not redirect aliases: public `/`, `/services`, `/gallery`, etc. retain their existing meanings.

Final production route table (`ƒ` dynamic, `○` static):

```text
ƒ /
ƒ /_not-found
ƒ /about
○ /apple-icon.png
ƒ /blog
ƒ /blog/[slug]
ƒ /contact
○ /dashboard
ƒ /dashboard/[...notFound]
○ /dashboard/blog-posts
○ /dashboard/faqs
○ /dashboard/gallery
○ /dashboard/login
○ /dashboard/our-specialists
○ /dashboard/services
○ /dashboard/settings
○ /dashboard/testimonials
○ /dashboard/youtube-galleries
ƒ /gallery
○ /icon.png
○ /manifest.webmanifest
○ /opengraph-image.png
○ /robots.txt
ƒ /services
○ /sitemap.xml                  revalidate: 1 minute
○ /twitter-image.png
ƒ /youtube-videos
```

Every original public route keeps its baseline rendering type. Static dashboard output contains the loading guard; feature content and authenticated requests are mounted only after browser hydration and session validation.

## 4. Dependencies

Added 29 dashboard-only dependencies, pinned to the versions declared by the legacy project:

- Radix: avatar 1.1.10, checkbox 1.3.3, collapsible 1.1.12, dialog 1.1.15, dropdown-menu 2.1.16, label 2.1.7, popover 1.1.15, select 2.2.6, separator 1.1.7, slot 1.2.3, switch 1.2.6, tooltip 1.2.8.
- TanStack Query 5.90.20 and Table 8.21.3.
- Tiptap React, Starter Kit, and PM 3.20.0.
- axios 1.11.0, class-variance-authority 0.7.1, clsx 2.1.1, cmdk 1.1.1, formik 2.4.6, lucide-react 0.544.0, react-i18next 14.1.2, sonner 2.0.7, tailwind-merge 3.3.1, tw-animate-css 1.4.0, yup 1.4.0, zustand 5.0.8.

Kept the website's React/React DOM 19.2.4, i18next 26.3.1, Next 16.2.7, Tailwind/PostCSS, TypeScript, and React 19 types. `react-i18next@14.1.2` accepts i18next >=23.2.3; no conflict occurred there.

The first installation exposed Tiptap's open transitive version ranges: npm selected core 3.33.0, whose exact PM peer conflicted with 3.20.0. Package overrides align core, extensions, and extension packages to the source lockfile's 3.20.0 family. Installation then succeeded without `--force` or `--legacy-peer-deps`; `npm ls --depth=0` passed.

No existing website dependency was removed. The unused standalone routing, translation backends/detector, theme switcher, calendar, chart, carousel, number-to-words, phone/date fields, and standalone tooling were not installed. Browser verification used Playwright installed in a temporary tools directory, not as an application dependency.

## 5. Verification results

### Baseline and build gates

| Check | Result |
| --- | --- |
| Untouched website lint | PASS: zero errors, two unused-symbol warnings in `components/service-card.tsx` |
| Untouched website TypeScript | PASS: zero errors |
| Untouched website production build | PASS: all original routes recorded |
| Public route-group restructure | PASS: build; original public route types and regular-page metadata retained |
| Dependency/config build | PASS |
| Foundation build and CSS separation | PASS |
| Login and each of eight content/settings feature type/lint gates | PASS |
| Final lint | PASS: zero errors, 11 warnings |
| Final `npx tsc --noEmit` | PASS: zero errors |
| `npm run test:dashboard-auth` | PASS: five policy/redirect/expiry tests |
| Final `npm run build` | PASS: route table above |
| `git diff --check` | PASS |

The 11 final lint warnings consist of the two baseline warnings, eight permitted plain-image warnings for legacy logos/previews/thumbnails, and TanStack Table's React Compiler compatibility advisory. There are no blanket lint or TypeScript suppressions.

Build output also includes nonfatal metadataBase fallback notices, a Node module-register deprecation, and an upstream browser-storage probing warning during prerender. Public source metadata was checked independently; dashboard pages are noindex.

### Public website

- PASS: `/`, `/services`, `/gallery`, `/youtube-videos`, `/blog`, `/blog/string` (an actual API-listed slug), `/about`, and `/contact` returned 200. Their title, description, canonical, and OG tags matched the baseline, both in HTML source and after hydration.
- PASS: unknown public URL returns HTTP 404 with the existing public layout and localized 404 component. See the global-404 metadata qualification below.
- PASS: sitemap, robots, and manifest resolve. Robots retains `/api/` and adds `/dashboard`; sitemap has no dashboard URLs.
- PASS: Arabic and English switches persist after reload; the dashboard remains Arabic and does not change the public language cookie or preference.
- PASS: public header, footer, LocalBusiness JSON-LD, and initialized AOS elements are present. The public layout's top-loader implementation is unchanged.
- QUALIFIED: screenshots were taken and inspected, but a bit-identical screenshot claim is not made: AOS timing, carousel positions, image loading, and live data affect full-page captures. Public page/layout/component source is unchanged apart from file location; public CSS variables and rules are unchanged apart from explicit source scanning.

### Isolation

- PASS: production HTML stylesheet links were fetched and their complete CSS checked. Public CSS has public tokens and no dashboard navy tokens, ProseMirror rules, loading-bar utility, or sidebar styles. Dashboard CSS has dashboard tokens/ProseMirror and no public hero token or gold utility. The CSS link sets are separate.
- PASS: dashboard HTML is `lang="ar" dir="rtl"`; computed body font is self-hosted Readex Pro. No public footer or JSON-LD is present.
- PASS: `/dashboard/login` and protected routes carry `X-Robots-Tag: noindex, nofollow` and robots metadata. No public component imports dashboard/auth code.
- PASS: public and feature browser checks had no JavaScript errors or hydration/invalid-markup console errors. Auth failure cases generate the expected browser resource-error messages for mocked HTTP 401 responses.

### Authentication — browser API mocks

All 18 browser scenarios passed: unauthenticated deep link with encoded return path and zero protected requests; wrong credentials; non-admin login rejection without token persistence; valid Manager login to the return path; hard-refresh hydration without a login bounce; confirmed logout; expired, non-admin, missing-expiry, and malformed-role persisted sessions; API 401 clearing an invalid token; recovery of expiry from an old persisted JWT; five unsafe/login-loop redirect cases; and isolated dashboard 404 UI.

Logout and 401 clear the auth store; the query provider cancels and clears cached queries when the token is removed or replaced. Explicit logout additionally clears the query client and navigates to exactly `/dashboard/login`.

### Features — browser API mocks

All 23 feature checks passed. For each of services, FAQs, specialists, testimonials, gallery, YouTube galleries, and blog posts, the checks covered listing, filter request parameters, pagination parameters, image base URLs where applicable, empty-form validation, creating, editing, and confirmation before deletion. Requests used the copied endpoint paths and original HTTP methods. Applicable forms uploaded multipart files and showed previews; both blog editors were unlocked and edited and the specialist popover selected an option.

Settings loaded, entered edit mode, changed a section toggle and email, and issued the existing PUT request. The mobile sidebar opened and closed, the viewport did not overflow, and the table scrolled horizontally. Feature checks produced no JavaScript or console errors.

NOT VERIFIED LIVE: successful administrator login, authenticated backend reads/writes, upload persistence, backend authorization, browser CORS, and public navigation after saving a visibility flag and waiting for server revalidation. No real credentials were supplied. Mutation requests in the tests were intercepted in the browser; no live content was created, edited, or deleted.

### Source checks

PASS: no active application references to the old router packages, standalone environment syntax, global JSX namespace, missing dashboard aliases, public imports of dashboard auth, or token/login-payload logging. TypeScript resolves all aliases. The standalone source repository remains clean and untouched.

## 6. Assumptions

- The actual legacy response interface types `role` as a string; its enum defines SUPER_ADMIN=1 and MANAGER=2. No authenticated response was available to verify the deployed representation. One helper accepts these two numeric values, numeric strings, and case-insensitive SuperAdmin/Manager names (including separator variants). Generic Admin, Owner, User, and other values are rejected.
- API expiry timestamps lacking a timezone suffix represent UTC. Missing/invalid expiry fails closed. Old persisted JWTs may recover expiry from their `exp` claim; this does not verify a JWT signature or replace backend authorization. Old opaque tokens without expiry require login again.
- Hydration uses Zustand `skipHydration` plus explicit provider rehydration and a nonpersisted hydration flag. The guard renders only loading until validation passes.
- Translations use a provider-owned Arabic instance and static JSON. Dashboard `t()` stays loosely typed; no global i18next type augmentation was ported.
- The sibling source folder is the intended legacy reference. Its environment file was neither read for migration values nor edited.

## 7. Deviations

- `_legacy-dashboard/` was absent. Used `D:/lapis-dashboard - Copy` read-only rather than duplicating the source. The requested future-reference Git/TypeScript/ESLint exclusions are in place.
- Enabled the documented `experimental.globalNotFound` option because there is no shared root document. The global fallback explicitly reuses the public layout, 404 UI, metadata helper, and actual image dimensions.
- Strict HTML metadata parity has one small exception on the global public 404: global-not-found bypasses automatic metadata-file inheritance. The same OG/Twitter images are explicitly restored with their actual dimensions and MIME type; their URLs omit the framework-generated cache-busting query string. Regular public pages retain exact baseline metadata.
- Dashboard unmatched routes use a scoped catch-all and not-found boundary. Next streams this client-shell response with HTTP 200 and noindex, as described in its not-found documentation; public unmatched routes return HTTP 404.
- Adapting shared imports revealed `.ts/.tsx` import suffixes, type-only barrel requirements, React 19 form/table typings, invalid nested headings/buttons, and a mobile viewport hook incompatible with current lint rules. These were corrected without changing the form/API contracts or dashboard design.
- Cache invalidation hooks now use `useQueryClient()` rather than a module singleton, so they target the provider-owned client and logout can clear it reliably.

## 8. Known issues retained

- The legacy pagination code mixes zero- and one-based page state; this was not redesigned during the port.
- Legacy query keys do not include every filter; existing explicit-refetch behavior was preserved.
- The shared legacy form-dialog promise chain catches mutation errors before its toast promise resolves; some failures may produce misleading success feedback. This unrelated business behavior was preserved.
- Live acceptance and exact full-page pixel equality remain unverified as qualified above. The 404 query-string/streaming differences and nonfatal build/lint warnings are documented rather than hidden.

## 9. User follow-ups

1. Run authenticated acceptance against the real API, including each CRUD flow, uploads, expiry/401, and settings visibility after the public site's existing revalidation interval.
2. Confirm backend authorization rejects non-admin tokens and CORS permits every deployed website origin.
3. Retire the old dashboard deployment and its old rewrite configuration only after that acceptance succeeds.
4. Keep the standalone source reference until acceptance is complete. No `_legacy-dashboard/` folder existed to delete; the sibling source may then be removed by the user if no longer needed.
5. Optional future hardening, not implemented: move tokens to httpOnly cookies behind a Next route-handler proxy, and trigger public cache revalidation after dashboard mutations.
