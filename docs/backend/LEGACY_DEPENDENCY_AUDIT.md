# Phase 6 cutover dependency inventory

Initial source audit 2026-11-11, before implementation. Frontend freeze and the Phase1–5 evidence/unknown distinctions apply. Current live hosting is not modified.

| Dependency | Actual source / behavior | Cutover boundary |
| --- | --- | --- |
| Public SQL-backed content acquisition | lib/api/client.ts apiFetch fetches NEXT_PUBLIC_API_BASE_URL; all lib/api module callers, metadata and sitemap use it | Keep signatures/query/error envelope; replace only server transport with explicit internal public dispatch and tagged60s cache |
| Dashboard login | dashboard/api/session/login sends email/password to external /api/auth/login | Internal auth handler/service, signed SQL-backed validation, same HttpOnly cookie and projection |
| Dashboard CRUD/settings/upload | dashboard/api/proxy/[...path] fetches external URL, PROXY_RULES39 paths | Same39-rule guard/CSRF/header/body/status/error behavior; internal registry transport, no arbitrary dispatch |
| Dashboard session trust | dashboard/server/session decodes claims only | Preserve decoder as projection utility; actual session reads must cryptographically verify SQL identity/session/role |
| Logout | Clears cookie only | Also revoke the exact verified internal SQL session; idempotent invalid/expired sessions |
| Dashboard media helper | Frozen dashboard/api/urls.ts combines public build-time base and relative path | Configure validated application origin at build, preserve helper source |
| Public media helpers/mappers | createAssetUrl and sanitizer base; Services/Specialists/Testimonials/Gallery/Blog use Next Image | Keep public mapping/helper behavior, configure exact trusted same-origin image host; no wildcard optimizer/no external default |
| SEO origin | seo-shared uses NEXT_PUBLIC_SITE_URL/fallback; sitemap reads blog helper | Preserve components and functions; environment-configured canonical origin and dynamic SQL-backed sitemap |
| Existing page catch/fallbacks | Frozen public pages catch errors and can display empty sections | Add server readiness gate; never claim an empty unconfigured SQL database contains migrated legacy content |
| Existing public data | Original public content/media/settings are absent from a new SQL database | Read-only inventory/dry-run/import plan, no fabricated production rows, overwrite or startup import |
| Historical files/accounts | Old URLs, file IDs, users/passwords/roles require authorized exports and files | Explicit migration gap; do not fetch protected data or accept old decoded JWTs |
| Current .env | Existing legacy public base must not select internal transport | Do not edit or commit real .env; validated APP_ORIGIN supplies public build-time URL, transport is internal |
| Previous integration rollback | Seven adapter/config files copied privately before edits; SHA256 snapshot585 existing files | Restore a reviewed prior application artifact/config, preserve SQL/files and other user changes; no request-controlled fallback |

No essential internal workflow may contact lapis.runasp.net. Static historical docs/fixtures and an explicitly invoked read-only inventory tool may name it; those are not runtime fallback. No deployment/DNS/production migration is authorized. Final residual dependency and verification results will be recorded in the Phase6 reports.
