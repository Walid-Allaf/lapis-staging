> Phase7 clean-start policy (2026-11-11) supersedes historical release requirements below. Use a NEW database, immutable migrations0001-0007, explicit neutral initialization and one operator-supplied SuperAdmin; empty content/uploads; NO historical import or credential transfer. Phase7A is local only. Read [PHASE7_RELEASE_READINESS](PHASE7_RELEASE_READINESS.md), [PHASE7_MIGRATION_BOOTSTRAP](PHASE7_MIGRATION_BOOTSTRAP.md) and [PHASE7_RELEASE_RUNBOOK](PHASE7_RELEASE_RUNBOOK.md) for current evidence, guarded production CLI design and remaining blockers. No hosting/deployment authorization is implied. Older phase statements below describe their historical scope.

# Cutover compatibility report

2026-11-11. DOCUMENTED_IN_OPENAPI, VERIFIED_FROM_FRONTEND, VERIFIED_FROM_LEGACY_RESPONSE, INFERRED and UNKNOWN remain distinct. Integration tests validate this replacement, not undocumented ASP.NET historical behavior.

| Workflow | Local result | Historical evidence / limits |
| --- | --- | --- |
| Public homepage/services/about | Populated SQL-backed SSR, tags60s; actual about page uses Services (correcting the earlier Phase1 prose) | Public GET sampled shapes verified; visibility/default/sort/null policies remain Phase4 INFERRED |
| Specialists/testimonials/FAQs/gallery/videos | Actual SQL markers render; gallery before/after references preserved | Sampled GET structures verified; testimonial starNumber response alias remains explicit extension |
| Blog list/slug/detail/SEO | SQL content, author, canonical, JSON-LD, sitemap and missing slug404 | Sampled blog GET shape verified; slug/status policies remain new; saved imported slugs must not regenerate |
| Public settings/footer/contact/toggles | Internal public projection, real fields render; mutation invalidates cache | Client GET structure verified; protected settings success originally UNKNOWN |
| Dashboard login/restore | Same email/password, cookie attributes, user/expiresOn; no browser JWT | Frontend-verified projection; new signed SQL-session policy, no legacy login success fixture |
| Dashboard seven CRUD groups | Frozen real create/list/detail/update/remove functions pass through actual39-rule proxy with SQL persistence | Canonical Swagger and narrow Phase4 body tolerances preserved; writes historically unverified |
| Dashboard settings | Frozen read/update functions work; same field casing/toggles | Admin success remains INFERRED |
| Upload/image/PDF association | Actual ImageUpload TSX input handler uses real multipart proxy, stores numeric ID/path; retrieval and optimizer pass | Frontend-verified upload envelope, original upload success UNKNOWN; PDF remains conservative Phase5 subset |
| Session/current user | Signed claims + current SQL account/session/role; GET session hides token; direct User/get-info still requires Bearer | Stricter verified identity replaces decoded-only routing; no User allowlist expansion |
| Logout/revocation |204 and clear; exact SQL session invalidated; replay401; outage503 avoids false claim | Existing frontend204 preserved in normal/idempotent cases; revocation is new behavior |
| Cache after direct/proxy mutation | Blocking expire0 invalidation, including specialist→blog and settings, verified via SSR change | Existing tags/durations preserved using supported installed Next APIs |
| Legacy unavailable |109 production HTTP requests passed with legacy fetch/http/https/DNS blocked; no attempted legacy call | Tests use synthetic disposable data, not migrated production data |
| Readiness failure | Missing settings/schema/SQL outage503 before public page fallback | New conservative server readiness behavior; mid-request fault race remains documented |
| toggle-2fa | Explicit501; unchanged, no dashboard consumer | BLOCKED unverified public workflow; no fabricated proof UI |
| Host/browser/import | Not completed on host; browser not executed; import plan/dry-run only | Pending authorized data/export and Phase7 verification |

## Frozen source and authorized exceptions

No public/dashboard page/component/form/validation/hook/feature service/endpoint constant/DTO/interface/translation/navigation/layout/public mapper/SEO component or ImageUpload changed. dashboard/api/axios.ts, urls.ts, auth.ts, proxy-policy.ts and public-cache-tags.ts are frozen. apiFetch transport changed only in its explicitly authorized server integration file; createAssetUrl body/signature remains intact.

Necessary server changes: dashboard session verification, login/session/logout/proxy adapters; server-only CSRF helper for configured origin/Next loopback/IIS; root Proxy public readiness gate; next.config public origin/exact media host; content-handler cache notification; storage tracing comments only. Environment example/package scripts/AGENTS/docs are updated. Existing actual .env, package-lock, SQL schema/migrations and Auth/User/content/media domain contracts remain unchanged. Full SHA256 inventory is in the Phase6 report.

No arbitrary dispatcher path, public migration/bootstrap/import/recovery endpoint, unverified token bypass, broad image wildcard, image-optimization disabling or client-selectable legacy fallback was introduced. Original57 API routes/methods/bodies are retained,56 implemented and one explicitly blocked. The current repository is internal by default; actual hosted traffic was never changed.
