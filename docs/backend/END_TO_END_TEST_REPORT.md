> Phase7 clean-start policy (2026-11-11) supersedes historical release requirements below. Use a NEW database, immutable migrations0001-0007, explicit neutral initialization and one operator-supplied SuperAdmin; empty content/uploads; NO historical import or credential transfer. Phase7A is local only. Read [PHASE7_RELEASE_READINESS](PHASE7_RELEASE_READINESS.md), [PHASE7_MIGRATION_BOOTSTRAP](PHASE7_MIGRATION_BOOTSTRAP.md) and [PHASE7_RELEASE_RUNBOOK](PHASE7_RELEASE_RUNBOOK.md) for current evidence, guarded production CLI design and remaining blockers. No hosting/deployment authorization is implied. Older phase statements below describe their historical scope.

# Phase 6 end-to-end and regression evidence

2026-11-11, local Windows, Node26.3.1, Next16.4.6 and SQL Server Express17.0.1000.7. Every SQL suite used a new empty acknowledged disposable lapis_test database and scoped temporary login. Every media test used a newly created OS temporary directory outside the checkout. No legacy writes, production SQL, real SMTP delivery, host deployment or browser session was used.

## Automated results

| Command/check | Passing leaf cases |
| --- | --- |
| test:integration |10 new registry/origin/transport/cache/CSRF/import cases |
| test:integration:sql |17 new real Next production HTTP workflow cases (+parent18 reported) |
| test:db / test:auth / test:content / test:files |21 /11 /10 /11 |
| test:dashboard-auth / test:sanitize / test:dashboard-proxy |4 /6 /7 |
| Existing real SQL foundation / auth / content / files |11 /18 /13 /12 (+four parent cases) |
| TypeScript / ESLint / production build |Passed; lint0 errors,12 pre-existing frontend warnings |

Total **151 passing leaf tests** (156 reported including five integration parents). No integration skip substitutes for a SQL run. Existing test sources/assertions remain unchanged in Phase6. The import CLI also ran on a synthetic private export with zero writes and generated a separate dry-run report; this is not production seed/import evidence.

## Real HTTP workflows and external-dependency proof

full.integration.test.mjs starts the actual production Next build on loopback with the real SQL pool/auth/services and private media store. Its test-only preload block-legacy.mjs intercepts fetch, Node http/https and DNS attempts for lapis.runasp.net, logs a count and throws before networking. A deliberately blocked probe verifies that control, then the log is reset. Application tests also set the old public-base process value to an invalid loopback port; build-time configured APP_ORIGIN still resolves current media. No deployed runtime imports the blocker.

**109 HTTP requests** passed the latest full workflow run with **zero legacy attempts**, including:

- CSRF rejection, SuperAdmin and Manager login, ordinary User dashboard denial; same HttpOnly/Strict/path cookie, exact user/expiresOn and no JWT JSON; restore/current-user and unchanged User restrictions.
- Actual frozen seven-module dashboard service functions performing add/list/detail/edit/delete; query casing/paging/search and narrow body tolerances remain. A second record is deleted while visible synthetic records remain for SSR assertions.
- Actual unchanged ImageUpload TSX input handler using FormData through the real proxy; PNG/PDF result consumption, actual bytes/type retrieval; exact4MiB accepted and one-byte oversize/oversize JSON rejected413 through the boundary.
- Populated homepage/services/about/gallery/videos/blog/detail and contact/settings, with unique SQL markers asserted rather than accepting empty/fallback200. Canonical/JSON-LD/sitemap/robots and missing slug404 are checked. About's actual consumer is Services, not the prior audit's Specialist assumption.
- Immediate SSR changes after proxy and direct original API mutations; specialist→blog and settings dependencies. These tests caught and fixed separate NextRequest runtime-realm invalidation behavior.
- Real Next Image optimization for exact same-origin uploaded PNG, rejection of another host, and same ID/path/bytes/session after full Next stop/start.
- Tampered cookie, signed expired JWT, SQL-expired session, SQL disabled-user state and password-change revocation; blocked2FA501, logout204/clear/replay401/idempotence.
- Missing settings or SQL outage returns public503 before frozen page fallback. Restored SQL returns populated200. No debug or repair endpoint was added.

Initial integration runs caught two adapter issues: Next's loopback URL normalization required the configured trusted origin for CSRF; downstream parsing of a proxy body-limit error required preserving the boundary413. Both were fixed on the server without relaxing CSRF or changing frontend source. A further SEO check caught streamed notFound returning200; the server now resolves public slug absence before streaming and rewrites to the existing404 renderer with status404. No failure is hidden as a skip or changed expected contract.

## Browser and operational limits

**No real browser E2E was executed.** Actual frontend service functions and the ImageUpload TSX handler run with test-only transport/hook adapters; the application itself is tested over actual HTTP/SSR and the actual optimizer. This does not prove DOM interactions, React Query table/dialog rendering, browser cookie policies, PDF viewer/CSP rendering or final HTTPS hostname behavior. Those checks are explicitly pending Phase7. Do not label this suite full browser coverage.

Build uses connection() to defer SQL acquisition, so it does not require running a self-hosted API or legacy. The final default localhost build and the configured loopback test build both pass. Private dynamic media paths are excluded from source tracing with comments; no storage security check was removed. Host performance/TLS/ACL/hard links/redeploy persistence, SMTP, historic import and disaster restore remain unverified.

The final source audit verifies585 pre-existing files against the start-of-phase snapshot with only documented server/config/docs changes. Generated test logins are disabled and temporary credential JSON removed after validation; disposable databases are retained without reset/drop. Temporary media/log directories are removed only within their explicitly generated test roots.
