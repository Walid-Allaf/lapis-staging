> Phase7 clean-start policy (2026-11-11) supersedes historical release requirements below. Use a NEW database, immutable migrations0001-0007, explicit neutral initialization and one operator-supplied SuperAdmin; empty content/uploads; NO historical import or credential transfer. Phase7A is local only. Read [PHASE7_RELEASE_READINESS](PHASE7_RELEASE_READINESS.md), [PHASE7_MIGRATION_BOOTSTRAP](PHASE7_MIGRATION_BOOTSTRAP.md) and [PHASE7_RELEASE_RUNBOOK](PHASE7_RELEASE_RUNBOOK.md) for current evidence, guarded production CLI design and remaining blockers. No hosting/deployment authorization is implied. Older phase statements below describe their historical scope.

# Phase 6: internal backend integration

2026-11-11. The repository now acquires public content and handles dashboard login, sessions, CRUD, settings and uploads through the internal SQL-backed backend. There is no runtime ASP.NET HTTP fallback. **No production deployment, hosted database mutation, DNS change or Phase7 action occurred.** Current live hosting remains outside this local cutover.

The initial [dependency audit](LEGACY_DEPENDENCY_AUDIT.md), [compatibility report](CUTOVER_COMPATIBILITY_REPORT.md), [test report](END_TO_END_TEST_REPORT.md), [data import plan](DATA_IMPORT_PLAN.md), [rollback procedure](CUTOVER_ROLLBACK_PLAN.md) and [environment guide](PRODUCTION_ENVIRONMENT.md) describe evidence and remaining gates. This is not complete historical API parity or a claim that legacy business data/accounts have been migrated.

## Public acquisition and cache

The authorized server integration file lib/api/client.ts preserves apiFetch/createAssetUrl signatures, ApiResponse, query omission, HTTP/envelope error handling and asset helper logic. apiFetch invokes a server-only public transport instead of external/self HTTP. A small public registry permits the17 known public reads plus the existing protected Setting/get fallback (anonymous401, always uncached) and invokes the existing content handlers/services, preserving DTOs, active/status visibility and optional verified-token behavior. It does not import uploads, SMTP or User administration into the RSC acquisition layer.

connection() precedes database work, outside the cache closure, so Next build/prerender does not require a running application origin or SQL/API server. Existing data cache TTL60 and all eight tags are recreated with unstable_cache; keys include route/query/language and a hash of database/application namespace. Auth/cookie reads, no-store, revalidate0 and signaled reads bypass shared caching. Failed reads throw and are not cached as empty success. Public pages/mappers/metadata/sitemap source remain frozen.

Shared content HTTP handlers invalidate the exact tags after SQL success, including specialist→blog and settings, for original direct API and internally dispatched proxy mutations. The proxy also retains its existing invalidation rule behavior. NextRequest's documented nextUrl interface handles separate runtime class realms; the check controls only cache notification, never authorization. Plain Request standalone service/CLI tests have no Next cache context. A future non-HTTP write/import must explicitly invalidate/rebuild public cache after a reviewed commit.

Because existing frozen pages catch data failures, root Proxy adds a narrow public readiness gate: required content tables must be readable and the real settings singleton must exist. Missing configuration/schema/settings or a database outage returns generic no-store503 before rendering, rather than an empty200. The gate uses the existing pool and no migration/seed. Blog slug requests additionally use the existing public service before streaming: absent/hidden slugs rewrite to the existing global404 UI with a real404, avoiding a streamed notFound soft200 without modifying the page. It does not create content or prove a complete import. There remains a normal race between readiness and later SQL reads; failures after that check are logged server-side and frozen page fallback behavior is not rewritten. This bounded operational limitation is recorded rather than claiming every mid-request fault can be changed without touching UI code.

## Dashboard and security

The unchanged browser Axios/feature services still call the same39-rule dashboard proxy. It preserves path casing, CSRF, query/body/header filtering, multipart stream/size limits, status/type/envelope/no-store,401 clearing and cache tags. Only transport changed to an explicit57-operation internal registry with no arbitrary module/path execution. Every operation independently reauthorizes through the existing services; a matching route is never a privilege grant. Stream-limit failures retain boundary413 even if a downstream parser catches the stream exception. The30s controller, SQL/lock timeouts and sanitized failure behavior remain.

Login still accepts email/password only and returns user/expiresOn without JWT. The internal auth operation issues the existing signed token, then the adapter verifies signature/issuer/audience/algorithm/expiry and actual SQL user/session/role before setting the same HttpOnly/SameSite Strict/Path=/dashboard cookie. readAdminSession no longer trusts decoded claims. decodeAdminSession remains a projection utility for compatibility tests, never proof of authentication. Ordinary User is denied dashboard access; canonical Manager/SuperAdmin retain content access, and only SuperAdmin retains user administration.

The existing server CSRF helper now compares the supplied Origin/Referer against validated APP_ORIGIN when configured, preserving the old URL-based fallback otherwise. This is necessary because Next normalizes loopback addresses and IIS may use an internal listener URL. No forwarded/Host header can expand the trusted origin. Hostile/missing/null origins still fail; frontend code is unchanged.

Logout revokes the exact signed SQL session before204 and clears the same cookie. Expired/revoked/invalid sessions are idempotent204; SQL failure yields503 with cookie cleared and no false revocation claim. Session reads/proxy preserve valid cookies on backend503 rather than misclassifying an outage as a forged token. Tampering, JWT expiry, SQL expiry, disablement, password revocation and replay were tested independently.

## Media, data and release limitations

APP_ORIGIN configures exact public asset/SEO origins in next.config at build time. Frozen dashboard URL helpers and createAssetUrl continue their original transformations. Next Image permits only that exact host/port and /uploads/** without query or redirects. Local-IP optimization is enabled only for a loopback origin outside SQL production, not as a wildcard production exception. Optimized images, dashboard image/PDF contract handling, upload association and restart persistence passed locally. Phase5 private UPLOAD_DIR/key/state/serving security is unchanged; storage.ts only gained tracing-ignore comments to exclude private dynamic storage from deploy tracing.

A public read-only inventory observed15 content records,9 distinct file IDs and two Client reads. Nine public media streams were hashed without retaining image files; one hash is shared by distinct file IDs. No protected records, credentials, raw legacy payloads, SQL import or production placeholders were created. A dry-run tool checks supplied exports/relationships/duplicates and proposes identity ID mappings but **has no apply mode**. Complete historic import and identity/password migration remain release gates, detailed separately.

toggle-2fa remains501 and has no current frontend consumer. Existing2FA-enabled accounts cannot bypass proof through the frozen email/password dashboard form; they require an approved challenge contract before such accounts can cut over. Actual SMTP, host path/ACL/hard-link/redeploy/backup/restore and dependency security remediation remain Phase7 gates. No real browser was run; actual frontend functions/TSX handlers were exercised over production HTTP. The final test and source-inventory evidence is below and in the dedicated reports.

## Final validation and exact file inventory

SHA256 preservation audit passed for all585 pre-existing files; only the20 explicitly authorized server/config/docs files below changed. Existing frontend pages/components/forms/hooks/feature services/constants/DTOs/public mappers/SEO/translations/layouts, frozen dashboard API clients/policy, all existing test sources, actual .env, package-lock and migrations0001–0007 matched their initial hashes.

151 leaf tests passed (156 including five integration parents), with109 real production HTTP requests and zero legacy attempts. Both configured loopback and default localhost production builds passed, TypeScript passed and ESLint had0 errors/12 existing warnings. No real browser, historical import, production deployment or Phase7 execution occurred.

New files (20):

- `docs/backend/CUTOVER_COMPATIBILITY_REPORT.md`
- `docs/backend/CUTOVER_ROLLBACK_PLAN.md`
- `docs/backend/DATA_IMPORT_PLAN.md`
- `docs/backend/END_TO_END_TEST_REPORT.md`
- `docs/backend/LEGACY_DEPENDENCY_AUDIT.md`
- `docs/backend/PHASE6_FULL_INTEGRATION.md`
- `docs/backend/PRODUCTION_ENVIRONMENT.md`
- `scripts/import/dry-run.mjs`
- `scripts/import/inventory.mjs`
- `server/backend/import/dry-run.ts`
- `server/integration/dashboard-session.ts`
- `server/integration/dispatch.ts`
- `server/integration/invalidation.ts`
- `server/integration/origin.ts`
- `server/integration/public-dispatch.ts`
- `server/integration/public-transport.ts`
- `server/integration/site-readiness.ts`
- `tests/backend/block-legacy.mjs`
- `tests/backend/full.integration.test.mjs`
- `tests/backend/integration.test.mjs`

Existing files changed (20):

- `.env.example`
- `AGENTS.md`
- `app/(dashboard)/dashboard/api/proxy/[...path]/route.ts`
- `app/(dashboard)/dashboard/api/session/login/route.ts`
- `app/(dashboard)/dashboard/api/session/logout/route.ts`
- `app/(dashboard)/dashboard/api/session/route.ts`
- `dashboard/server/http.ts`
- `dashboard/server/session.ts`
- `docs/backend/API_COMPATIBILITY_MATRIX.md`
- `docs/backend/DEPLOYMENT_RUNBOOK.md`
- `docs/backend/FRONTEND_API_DEPENDENCIES.md`
- `docs/backend/IMPLEMENTATION_PLAN.md`
- `docs/backend/RESPONSE_CONTRACTS.md`
- `docs/backend/UNKNOWN_BEHAVIORS.md`
- `lib/api/client.ts`
- `next.config.ts`
- `package.json`
- `proxy.ts`
- `server/backend/http/content-handler.ts`
- `server/backend/modules/files/storage.ts`
