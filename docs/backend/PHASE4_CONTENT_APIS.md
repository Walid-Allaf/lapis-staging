# Phase 4: isolated SQL content backend

Date: 2026-11-11. All **43 content operations** are implemented inside the existing Next.js 16.4.6 application. No individual content endpoint is blocked. This is an isolated replacement with explicit new policies, **not a claim of complete historical parity**. The public website, dashboard, API clients, DTOs, cookies, session adapters, proxy and external ASP.NET base URL are unchanged. No deployment, production migration, legacy mutation, Phase 5 upload or Phase 6 integration was performed.

The authoritative per-operation inventory, response evidence, authorization, differences and blockers are in [CONTENT_API_CONTRACTS](CONTENT_API_CONTRACTS.md). See [authorization](CONTENT_AUTHORIZATION_MATRIX.md), [tests](CONTENT_COMPATIBILITY_TESTS.md), and [remaining unknowns](UNKNOWN_BEHAVIORS.md).

## Evidence boundary

- **DOCUMENTED_IN_OPENAPI:** all exact methods, PascalCase paths, parameters, JSON fields, optional/nullable distinctions and numeric enums in the unchanged `swagger.json`. It documents 200 without response schemas.
- **VERIFIED_FROM_FRONTEND:** existing public helpers and dashboard services, request construction, error handling and TypeScript interfaces recorded in [FRONTEND_API_DEPENDENCIES](FRONTEND_API_DEPENDENCIES.md). Their actual functions run unchanged against replacement handlers in integration tests.
- **VERIFIED_FROM_LEGACY_RESPONSE:** sanitized structural profiles for 17 successful public GET operations (seven lists, seven details, blog slug and two Client operations), plus observed 400/401/404 errors. Active ads, administrative success, mutation success and unobserved null/default branches are not verified. Phase 4 read-only metadata checks confirmed offset-free dates with six/seven fractional digits and public blog sample status 0; no legacy records or tokens were retained.
- **INFERRED:** the authorization, defaults, sort mappings, slug algorithm, deletion, active/status filtering, administrative singleton projections and statistics defined in the contract. These are tested replacement policies.
- **UNKNOWN:** historical behavior outside those observations, imported data/identity compatibility, actual MonsterASP.NET permissions/performance and persistent media workflows. Implementation does not resolve these by assertion.

## Implementation and database changes

New `server/backend/modules/content/` contains explicit per-module definitions and Zod validators, typed parameters/repositories, transactions/services, DTO mapping and errors. `server/backend/http/content-handler.ts` supplies bounded JSON parsing and the shared content envelope. Forty-three thin `app/api/.../route.ts` files preserve Swagger methods/casing, Node runtime and asynchronous Next route parameters. No frontend import of server-only SQL code was added.

`db/migrations/0007_content_invariants.sql` adds the filtered unique `UX_BlogPosts_SlugHash` index. Duplicate existing non-null slug hashes fail preflight for operator review; no automatic slug rewrite, table recreation or data deletion occurs. Migrations 0001–0006 are unchanged. All seven migrations ran on new disposable SQL databases; production was untouched. Nineteen existing tables remain. The actual file metadata table is `dbo.Files`, the Phase 2 equivalent of the request's conceptual UploadedFiles name.

`tests/backend/content.test.mjs`, `content.integration.test.mjs`, `content-fixtures.mjs` and sanitized `fixtures/legacy-content-shapes.json` are new. `package.json` adds two test commands without dependency or lockfile changes. Existing migration/auth integration assertions were updated only from six to seven migrations and the synthetic failed-migration fixture from version 7 to 8. Existing test coverage remains.

## Compatibility decisions

Create `starNumber` and update `starsNumber` remain canonical. Only testimonial update additionally accepts frontend `starNumber`, rejecting unequal simultaneous values; testimonial reads add that alias alongside legacy `starsNumber`. Seven resource creates accept frontend `isActive`; seven updates accept a numeric body `id` only when it matches the path. Other unknown JSON fields fail validation. Structured legacy error objects remain, with one top-level `message` alias for current Axios consumers. These are explicit extensions, not silent schema corrections.

Public reads return active rows; public blogs additionally require numeric status 0, the only observed public status. The enum meanings remain unknown. Manager/SuperAdmin receive the administrative view and may mutate content. Ordinary User never gains administrative access. Signed JWT verification and SQL-backed sessions reuse Phase 3; user-management permissions are unchanged.

## Performance and hosting

The existing shared pool defaults to max 3/min 0. Queries use typed parameters, fixed identifier whitelists, SQL OFFSET/FETCH, deterministic Id tie-breaking, set-based joins and safe COUNT_BIG conversion. Page size is bounded at 100 and JSON bodies at 4 MiB. SQL DATETIME2 precision is serialized directly rather than truncated through JavaScript Date. No per-request pool, full-table Node pagination, heavy new dependency, large memory cache or worker process was introduced.

Short serializable transactions hold a shared content application lock for reads and an exclusive lock for writes; signed requests acquire the existing auth lock first to prevent disabled-session races. This favors consistency with bounded connection use but serializes writes and authenticated checks. Shared-host application-lock permissions, real load, SQL LOB search/sort plans and timeouts still require host verification. The existing external caches/tags are unchanged; isolated new responses use `no-store`. Cache invalidation must be wired during an explicitly authorized Phase 6 cutover.

## Remaining work outside Phase 4

Phase 5 must implement authenticated uploads, byte/signature validation, durable storage, safe file serving, metadata ownership/lifecycle, URL migration and backup/redeploy verification. Phase 4 only validates ready metadata and preserves the exact stored file path; fixture metadata is not proof of physical media delivery. Full upload-to-content-image workflows remain blocked by that phase, although all 43 content endpoints work with valid metadata. Phase 3's public `toggle-2fa` workflow remains explicitly blocked; FileUpload remains unimplemented. No Phase 5/6 work was started.

The final source inventory and validation results are recorded in [CONTENT_COMPATIBILITY_TESTS](CONTENT_COMPATIBILITY_TESTS.md).

## Exact Phase 4 file inventory

New files (61):

- `app/api/Ads/edit/route.ts`
- `app/api/Ads/get/route.ts`
- `app/api/BlogPosts/add/route.ts`
- `app/api/BlogPosts/by-slug/[slug]/route.ts`
- `app/api/BlogPosts/delete/[id]/route.ts`
- `app/api/BlogPosts/edit/[id]/route.ts`
- `app/api/BlogPosts/get-all/route.ts`
- `app/api/BlogPosts/get-by-id/[id]/route.ts`
- `app/api/Client/get-ads/route.ts`
- `app/api/Client/get-settings/route.ts`
- `app/api/FAQs/add/route.ts`
- `app/api/FAQs/delete/[id]/route.ts`
- `app/api/FAQs/edit/[id]/route.ts`
- `app/api/FAQs/get-all/route.ts`
- `app/api/FAQs/get-by-id/[id]/route.ts`
- `app/api/Galleries/add/route.ts`
- `app/api/Galleries/delete/[id]/route.ts`
- `app/api/Galleries/edit/[id]/route.ts`
- `app/api/Galleries/get-all/route.ts`
- `app/api/Galleries/get-by-id/[id]/route.ts`
- `app/api/OurSpecialists/add/route.ts`
- `app/api/OurSpecialists/delete/[id]/route.ts`
- `app/api/OurSpecialists/edit/[id]/route.ts`
- `app/api/OurSpecialists/get-all/route.ts`
- `app/api/OurSpecialists/get-by-id/[id]/route.ts`
- `app/api/Services/add/route.ts`
- `app/api/Services/delete/[id]/route.ts`
- `app/api/Services/edit/[id]/route.ts`
- `app/api/Services/get-all/route.ts`
- `app/api/Services/get-by-id/[id]/route.ts`
- `app/api/Setting/edit/route.ts`
- `app/api/Setting/get/route.ts`
- `app/api/Setting/get-statistic/route.ts`
- `app/api/Testimonials/add/route.ts`
- `app/api/Testimonials/delete/[id]/route.ts`
- `app/api/Testimonials/edit/[id]/route.ts`
- `app/api/Testimonials/get-all/route.ts`
- `app/api/Testimonials/get-by-id/[id]/route.ts`
- `app/api/YouTubeGalleries/add/route.ts`
- `app/api/YouTubeGalleries/delete/[id]/route.ts`
- `app/api/YouTubeGalleries/edit/[id]/route.ts`
- `app/api/YouTubeGalleries/get-all/route.ts`
- `app/api/YouTubeGalleries/get-by-id/[id]/route.ts`
- `server/backend/modules/content/definitions.ts`
- `server/backend/modules/content/errors.ts`
- `server/backend/modules/content/mapper.ts`
- `server/backend/modules/content/query.ts`
- `server/backend/modules/content/repository.ts`
- `server/backend/modules/content/service.ts`
- `server/backend/modules/content/types.ts`
- `server/backend/modules/content/validation.ts`
- `server/backend/http/content-handler.ts`
- `db/migrations/0007_content_invariants.sql`
- `tests/backend/content-fixtures.mjs`
- `tests/backend/content.integration.test.mjs`
- `tests/backend/content.test.mjs`
- `tests/backend/fixtures/legacy-content-shapes.json`
- `docs/backend/CONTENT_API_CONTRACTS.md`
- `docs/backend/CONTENT_AUTHORIZATION_MATRIX.md`
- `docs/backend/CONTENT_COMPATIBILITY_TESTS.md`
- `docs/backend/PHASE4_CONTENT_APIS.md`

Existing files modified in this phase:

- `tests/backend/auth.integration.test.mjs`
- `tests/backend/migrations.test.mjs`
- `tests/backend/sql.integration.test.mjs`
- `package.json`
- `AGENTS.md`
- `docs/backend/API_COMPATIBILITY_MATRIX.md`
- `docs/backend/RESPONSE_CONTRACTS.md`
- `docs/backend/UNKNOWN_BEHAVIORS.md`
- `docs/backend/DATABASE_DESIGN.md`
- `docs/backend/IMPLEMENTATION_PLAN.md`
- `docs/backend/DEPLOYMENT_RUNBOOK.md`
