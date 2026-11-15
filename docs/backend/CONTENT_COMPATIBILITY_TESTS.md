# Phase 4 compatibility and regression evidence

Executed locally 2026-11-11, Node 26.3.1, Next 16.4.6, SQL Server Express 17.0.1000.7 over TCP. Every mutation targeted a newly provisioned disposable `lapis_test_<16 hex>` database with explicit matching acknowledgement and scoped test-only SQL login. No legacy mutation, production SQL, real SMTP delivery, upload or deployment was used. Self-signed certificate trust was explicit for local tests only, not a production recommendation.

## Test design

`tests/backend/content.test.mjs` verifies the exact 43 Swagger method/path exports, Node runtime, schema field spelling/null/int32/enums, narrow tolerances, query/slug rules, precise dates, authorization, sanitized errors and bounded body parsing. A regression test covers Next's empty DELETE transport stream versus actual forbidden bytes.

`content.integration.test.mjs` imports **all 43 actual exported Route Handlers**, uses real Requests and async params, signed JWTs from Phase 3 login, the shared real SQL pool and all seven real migrations. It exercises each module in the requested order. Coverage includes:

- Singleton absence/upsert, concurrent partial edits and no duplicate rows; all settings toggles and separate Client projections.
- CRUD persistence; anonymous/User/Manager/SuperAdmin access; public hidden rows and admin view; invalid token, absent/malformed IDs, body-id mismatch and rejected unknown keys.
- Arabic/English/Kurdish Unicode preservation, ar/en/ku unchanged bilingual DTOs, null versus omission, every module's numeric sort values, deterministic pagination, filters and escaped wildcard search.
- Valid/invalid ready-file metadata and specialist FKs, failed-write rollback, image null/restore, referenced specialist 409, hard-delete/404 and no file deletion.
- Canonical testimonial create/update spelling, frontend aliases and conflicting alias rejection; structured error/message alias.
- Concurrent unique Unicode blog slugs, stability after title edits, numeric status/featured filters, inactive nested specialist visibility and optional specialist sentinel.
- Actual statistics against SQL counts, Ads admin/public separation and unchanged Manager denial for Phase 3 user administration.
- **Unmodified dashboard create/get-all/get-by-id/update/remove functions** with a test-only Axios transport bridge to actual replacement handlers. Existing public helper functions run with a test-only fetch bridge; a two-page Services case verifies public pagination aggregation. These bridges exist only in tests and do not switch live transports.

Sanitized `fixtures/legacy-content-shapes.json` retains only structural/type profiles: 17 public success operations and three GET error profiles. `content-fixtures.mjs` recursively checks keys/types, nested images, nullable observed branches and offset-free date formatting; only the documented testimonial/error aliases are permitted additions. No raw legacy content, identity records or tokens are committed. Active ads, admin success, mutation responses, unknown defaults and historical sort/role semantics are tested against the explicit new contract, not mislabeled legacy fixtures.

## Validation results

| Check | Result |
| --- | --- |
| `npm run test:content` | 10 passing |
| `npm run test:content:integration` | 13 passing leaf cases + parent (14 reported), all 43 operations, no skips |
| `npm run test:db` | 21 passing |
| `npm run test:db:integration` | 11 passing leaf cases + parent (12 reported), no skips |
| `npm run test:auth` | 11 passing |
| `npm run test:auth:integration` | 18 passing leaf cases + parent (19 reported), no skips |
| Dashboard auth / sanitizer / dashboard proxy suites | 4 + 6 + 7 passing |
| Production Next HTTP smoke | All 43 content methods/paths successful over loopback with SQL persistence and real signed login token; dashboard login 200, existing unauthenticated session/proxy 401, wrong method 405, health 200 |
| `npm run typecheck` | Passed |
| `npm run lint` | Passed, 0 errors; 12 pre-existing frontend warnings |
| `npm run build` | Passed; all 43 routes included |

Total: **101 passing leaf tests** (104 reported including the three integration parents), plus the actual production HTTP smoke. Existing test assertions were preserved; migration count expectations advance to seven and the intentional failure fixture advances to version eight. The first dashboard bridge run needed test-only directory module resolution correction; a real HTTP smoke then exposed and fixed the empty DELETE stream check. Final SQL and HTTP runs passed after that fix. No failures are hidden as skips.

## Preservation and operational limits

A before/after SHA-256 inventory covers 481 pre-existing workspace files, including frontend pages/components/services/types, dashboard session/proxy, external API helpers, environment/configuration, package lock, applied migrations and Phase 3 runtime code. Only the explicitly listed Phase 4 documentation, test scripts and migration-count test assertions may differ among that inventory; newly added backend/routes/tests are separately inventoried. The final preservation audit passed: all 481 pre-existing files checked; only AGENTS.md, package.json and the three migration-count test files differed. All frontend, Phase 3 runtime, applied 0001–0006, environment/configuration, Swagger and package-lock hashes matched.

Temporary SQL secrets/tokens are outside the repository. Generated test SQL logins are disabled after verification and temporary credential JSON is removed; disposable databases are retained without drop/reset. This does not constitute a production cleanup/retention mechanism.

Host networking, shared-host SQL permissions/capacity, actual SMTP, import of old identities/content, physical file availability, full browser interaction/error-toast display and deployment were not verified. Existing frontend source was exercised through its real service functions, not an interactive browser cutover. See unknowns U22–U27 and the Phase 4 report for remaining gates.
