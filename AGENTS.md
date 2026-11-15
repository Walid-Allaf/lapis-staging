<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Phase7 clean-start release policy (supersedes historical import/provision gates below)

- Owner-authorized 2026-11-12 correction exception: minimal CSS for confirmed mobile AOS overflow is permitted. Only app/(site)/globals.css changed in the frontend; preserve all other frontend/API/auth/SEO/translation contracts. Read PHASE7_MOBILE_CORRECTION.md and the updated readiness report. Cleanup remains blocked: do not retry rejected commands or evade approval policy; use the read-only inventory and operator handoff.

- Phase7A authorizes LOCAL validation only. No hosting, DNS, IIS, hosted SQL, production administrator or deployment changes. Phase7B/7C are documentation until explicit owner approval.
- Launch is a NEW empty database, immutable migrations0001–0007, neutral system records via db:initialize, exactly one operator-supplied first SuperAdmin, empty private uploads. No historical import, inventory, credential recovery, old media or synthetic production content. Original ASP.NET stays untouched.
- Preserve every frontend source file and original API contract. Backend/infra changes only; report a frontend compatibility blocker instead of silently editing UI.
- Production maintenance uses SQL_ENV=production, verified TLS, exact target, private expiring SHA256 plan, explicit operation/confirmation and backup receipt for existing databases. Never relabel SQL_ENV, weaken TLS or expose maintenance HTTP endpoints. CLI flags/secrets must never reach the web worker.
- db:production-plan is read-only; db:migrate/db:initialize/db:bootstrap-admin revalidate under SQL application locks. Backup receipts are operator attestations, not proof of physical restore. Keep startup/request migrations disabled.
- Use test:release:sql and test:browser only with newly provisioned lapis_test_<16hex> SQL targets. Playwright uses installed Chrome. Test-mail injection stays isolated in tests; blocked toggle-2fa501 remains. Never claim full57-operation parity.
- Read docs/backend/PHASE7_RELEASE_READINESS.md and PHASE7_RELEASE_RUNBOOK.md for measured evidence and outstanding gates. Preserve existing user changes; do not reset or commit automatically.

## SQL Server foundation

- Read `docs/backend/PHASE2_FOUNDATION.md` and `docs/backend/DEPLOYMENT_RUNBOOK.md` before changing database infrastructure.
- Keep database modules server-only and in the Node.js runtime. Existing frontend, sessions and ASP.NET transport remain unchanged until a separately instructed integration phase.
- Never migrate or seed from HTTP handlers, page rendering, startup requests or a public endpoint. Use the explicit `db:*` commands and their environment/database safeguards.
- Never edit an applied migration or automatically retry a failed/interrupted attempt. Follow the documented review/recovery procedure; do not reset existing databases.
- Tests that write SQL require a new disposable `lapis_test_<16 hex characters>` database and explicit matching acknowledgement. Never repurpose development/production data for tests.
- NULL storage fields and deferred email/slug uniqueness are intentional Phase 2 decisions. They are not API defaults or permission decisions; resolve the recorded contract gaps before implementing those services.

## Isolated Phase 3 authentication

- Read `docs/backend/PHASE3_AUTHENTICATION.md`, `AUTH_API_CONTRACTS.md`, `AUTHORIZATION_MATRIX.md`, and `OTP_AND_2FA_POLICY.md` before auth changes. Policies labeled INFERRED are new, not verified legacy behavior.
- Keep the dashboard login adapter, cookies, proxy, frontend services and ASP.NET integration unchanged until an explicit cutover instruction. Never use the legacy UI decoder as cryptographic authorization for the new API.
- Public `toggle-2fa` is explicitly blocked (501 after authentication); do not enable it or invent a UI challenge flow to hide that blocker.
- Administrator bootstrap is a private guarded CLI only. Test mail capture is an injected test dependency, never a public route or runtime mail bypass.
- Do not edit migrations 0001–0006 after application. New identity constraints require incremental migrations with preflight checks and review of existing data.

## Isolated Phase 4 content

- Read docs/backend/PHASE4_CONTENT_APIS.md, CONTENT_API_CONTRACTS.md, CONTENT_AUTHORIZATION_MATRIX.md and CONTENT_COMPATIBILITY_TESTS.md before content changes. Keep DOCUMENTED_IN_OPENAPI, VERIFIED_FROM_FRONTEND, VERIFIED_FROM_LEGACY_RESPONSE, INFERRED and UNKNOWN distinct.
- Preserve exact Swagger method/path/casing/dotted query names. Narrow tolerances are create isActive, matching update body id, testimonial update starNumber alias while retaining canonical starsNumber, and explicit response/error aliases; do not make arbitrary JSON permissive.
- Reuse signed Phase3 verification and SQL-backed sessions. Manager/SuperAdmin administer content; ordinary User does not. Public content is active-only; public blog additionally status0 (new conservative policy, not a recovered enum name). Preserve stricter SuperAdmin user administration.
- Existing slugs are immutable during edits. New slug/sort/default/delete policies are INFERRED; do not present them as historical parity. Never auto-normalize imported slugs.
- Applied migrations 0001–0007 are immutable. Unique slug preflight failures require review, never reset/force. Content transaction lock ordering is auth state then content state; keep authorization and persistence in the same transaction.
- The actual ready file metadata table is dbo.Files. No fabricated media paths, physical uploads or file deletion/cascade in Phase4. Upload/serving belongs to Phase5; live transport/cache/session integration belongs to Phase6, each requiring further user instructions.
- Preserve all frontend/public/dashboard services, DTOs, pages and existing ASP.NET sessions/proxy. Test bridges belong only in tests; no live cutover.

## Isolated Phase 5 media

- Read docs/backend/PHASE5_FILE_STORAGE.md, FILE_API_CONTRACT.md, STORAGE_ARCHITECTURE.md, FILE_SECURITY.md, STORAGE_RECOVERY.md and MONSTERASP_STORAGE_CHECKLIST.md before media changes. Upload response is frontend-verified; historical legacy upload success/errors remain UNKNOWN.
- Preserve POST /api/FileUpload/upload, one multipart file field, exact success fileId/filePath envelope, strict4MiB file/4,202,576-byte transport caps, bounded streaming and explicit MIME/container policies. Upload string errors/message alias are endpoint-specific; do not rewrite content/Auth error contracts.
- Only canonical signed/current SQL-backed Manager/SuperAdmin may upload. Check before body/storage and both commits. Media is approved public, not confidential attachment storage. Keep profile ownership and User admin policies unchanged.
- UPLOAD_DIR is a private absolute marked dedicated root outside the app/checkout and ancestors. Never use public/.next/deploy staging or fallback paths. Preserve static symlink/junction/regular-file checks, cryptographic exclusive keys and same-volume non-overwriting hard-link finalization. No arbitrary imported path serving.
- Keep pending registration → physically verified final → ready commit; preserve ambiguous bytes for explicit recovery. Auth lock precedes per-key media lock. No file/content cascade deletion or automated orphan GC.
- Recovery is a bounded private CLI, nonproduction-only, read-only unless explicitly confirmed. Never add public repair/bootstrap/migration endpoints or auto-promote failed/imported rows. Never edit applied migrations0001–0007.
- All frontend/config/ASP.NET session/proxy/image helpers remain unchanged; test adapters stay in tests. Phase6 final URL/Next Image/transport integration and Phase7 host persistence verification require further instructions. Local restart tests are not MonsterASP redeploy proof.

## Phase6 internal integration (authorized local cutover)

- Earlier phase isolation rules are historical for this authorized server-adapter cutover. Read docs/backend/PHASE6_FULL_INTEGRATION.md, CUTOVER_COMPATIBILITY_REPORT.md, END_TO_END_TEST_REPORT.md, LEGACY_DEPENDENCY_AUDIT.md, DATA_IMPORT_PLAN.md, CUTOVER_ROLLBACK_PLAN.md and PRODUCTION_ENVIRONMENT.md first.
- Freeze all frontend pages/components/forms/hooks/feature services/constants/DTOs/mappers/translations/navigation/layouts and dashboard/api/axios.ts, urls.ts, auth.ts, proxy-policy.ts. Only necessary server integration/infra may change; preserve exported signatures and consumed responses.
- apiFetch is server-only internal public dispatch, not self HTTP. Keep connection outside unstable_cache, public60s/eight tags and query/language/database cache isolation; never globally cache authenticated data/secrets or empty failure fallbacks.
- Preserve the39-rule dashboard proxy/CSRF/body limits/headers/status/no-store/cookie rules. Explicit registry is not authorization; all internal operations reverify signed JWT+SQL identity/session/role. Preserve boundary413 after downstream parser failures.
- decodeAdminSession is projection only. Actual cookie reads require verifyDashboardToken; logout revokes exact SQL jti and clears the same HttpOnly Path=/dashboard cookie. No old decoded-JWT or elevated identity bypass. Ordinary User remains nonadmin; SuperAdmin user management is unchanged.
- Trusted CSRF origin is validated APP_ORIGIN when configured, never forwarded/Host expansion. APP_ORIGIN also supplies compiled public API/SEO origins/exact uploads image pattern; no broad wildcard or disabling optimization. Rebuild after origin changes; keep secrets out of NEXT_PUBLIC and next.config.env.
- Preserve ready private media lifecycle/IDs/paths and immutable migrations0001–0007. Storage tracing comments must not be mistaken for weakened filesystem checks. No schema/import/seed at request/startup time.
- Public readiness guard prevents unconfigured/schema/settings failures becoming empty pages; preserve frozen fallback behavior and document its mid-request race. Do not fabricate production content to pass readiness.
- Internal shared content HTTP boundary invalidates tags after successful SQL for both proxy/direct original APIs. Standalone domain/CLI mutations outside a Next context require explicit reviewed cache invalidation/rebuild after import; do not rely on an HTTP Request prototype as authorization.
- Import inventory/dry-run are explicit readonly tools. No write/apply mode, protected scraping, production overwrite or automatic orphan cleanup. Historical import, identity/password/2FA challenge, host/browser/redeploy/backup verification remain gates.
- No runtime legacy fallback and no Phase7 deployment/DNS/production SQL/IIS changes without further instructions. Keep blocked2FA501; no approval is implied for a public challenge flow or production bootstrap.
