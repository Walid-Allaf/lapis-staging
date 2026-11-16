> Phase7 clean-start policy (2026-11-11) supersedes historical release requirements below. Use a NEW database, immutable migrations0001-0007, explicit neutral initialization and one operator-supplied SuperAdmin; empty content/uploads; NO historical import or credential transfer. Phase7A is local only. Read [PHASE7_RELEASE_READINESS](PHASE7_RELEASE_READINESS.md), [PHASE7_MIGRATION_BOOTSTRAP](PHASE7_MIGRATION_BOOTSTRAP.md) and [PHASE7_RELEASE_RUNBOOK](PHASE7_RELEASE_RUNBOOK.md) for current evidence, guarded production CLI design and remaining blockers. No hosting/deployment authorization is implied. Older phase statements below describe their historical scope.

# Internal runtime and deployment configuration

Phase6, 2026-11-11. No real .env values are committed or rewritten. Start with the updated .env.example; provide actual secrets through private process/host configuration. The app always uses its internal backend, irrespective of an old public API value. No BACKEND_MODE or automatic ASP.NET fallback is introduced.

## Origins, build and images

APP_ORIGIN is the validated absolute application origin, with no credentials/path/query/fragment. Production SQL environment requires an explicitly configured HTTPS origin. Development/test defaults to http://localhost:3000; HTTP is accepted only for loopback outside SQL production. The legacy lapis.runasp.net host is rejected as the application's origin. Set the same APP_ORIGIN for build/start. The final HTTPS domain is not known here and must be supplied by the operator.

next.config compiles **only public** NEXT_PUBLIC_API_BASE_URL and NEXT_PUBLIC_SITE_URL from APP_ORIGIN, so the frozen dashboard URL helper, public createAssetUrl/sanitizer and SEO functions all use the configured app. Existing stale .env public API values cannot silently select ASP.NET transport. NEXT_PUBLIC values are embedded into client bundles: changing final domain/port requires a fresh build/deployment, not just a process variable change. A build artifact belongs to its configured origin.

Uploaded-image correction (2026-11-16): public `createAssetUrl` returns `/uploads/<32-hex-key>.<supported-extension>` for canonical internal media paths, with or without an initial slash. This keeps Next Image requests same-origin, including during SSR, without depending on the compiled API origin. Absolute HTTP(S) URLs retain their existing behavior and remain subject to the existing Next Image remote allowlist. Other asset paths retain the configured-base behavior. Upload responses and `dbo.Files.PublicPath` remain `uploads/...`; no database normalization is required for canonical uploads. A new build/publish is required to ship this correction. Supply the correct APP_ORIGIN to the build process as well as the hosted worker: dashboard previews, SEO and other public origins still depend on it.

Next Image allows only that exact protocol/hostname/port and uploads path with empty query, no redirects/wildcard hosts, and optimization stays enabled. Loopback local-IP access is enabled only for loopback/nonproduction SQL configuration; production does not generally enable private-network image fetching. Current public image components and dashboard preview helpers remain unchanged. PDF is served as a PDF, not as a Next Image source. Verify final HTTPS browser image/PDF/cookie behavior in Phase7.

## Private settings

| Group | Configuration / behavior |
| --- | --- |
| SQL | SQL_ENV development/test/production; SQL_SERVER/PORT/DATABASE/USER/PASSWORD; encryption true and certificate verification by default; production insecure TLS refused |
| Pool | Existing shared manager max3/min0 by default, configured1..10; no per-request pool. Each Next worker/runtime context has its own bounded pool; measure total host connections |
| Guarded CLI | SQL_EXPECT_DATABASE and independent allow flags plus actual DB_NAME checks; integration suites require a brand-new lapis_test_16hex target. Never relabel production to bypass a guard |
| JWT | AUTH_JWT_KEYS private kid→base64 keys, ACTIVE_KID, issuer/audience and TTL; HS256 verification plus SQL session/security version; no decoded legacy identity trust |
| OTP | Independent AUTH_OTP_KEY; no runtime test-mail bypass; purpose/cooldown/rate rules remain Phase3 |
| SMTP | Existing private SMTP host/port/security/user/password/from and verified TLS; provider delivery/quotas unverified. Missing SMTP fails sending flows safely |
| Media | UPLOAD_DIR required for uploads/reads, absolute private marked root outside app/ancestor/checkout; no public/.next/temp fallback; verify host NTFS ACL/hard-link/storage quota/persistence |
| Recovery | Existing private nonproduction bounded audit/explicit repair only; no destructive GC or public recovery endpoint |
| Import | DATA_IMPORT_SOURCE/REPORT and DATA_INVENTORY_REPORT are explicit private CLI files outside checkout; dry-run never applies; inventory has no runtime import |

Never put SQL/JWT/OTP/SMTP/bootstrap/recovery secrets in NEXT_PUBLIC or next.config.env. Only application origins are public there. Private administrator provisioning remains the existing guarded nonproduction CLI; a production provisioning procedure and identity migration need separate reviewed Phase7 authorization, not a flag relabeling workaround.

## Build and test

Normal `npm run build` works without a self-hosted API or SQL connection; connection() defers public database data to requests. Actual serving requires the reviewed schema/settings/content and runtime SQL configuration. Missing settings/schema/SQL returns public503, not legacy fallback or synthetic content. No migration/seed/import runs at startup or from HTTP.

For the full integration suite, build with APP_ORIGIN=http://127.0.0.1:3197 and SQL_ENV=test, then run test:integration:sql with newly provisioned disposable SQL credentials/acknowledgements. The suite starts/stops its own actual Next process and creates private OS temporary media. It blocks legacy networking and never touches production. Restore/rebuild the default localhost origin afterward for a normal local build. Existing test suites still run independently; no new dependency installation is needed.

On MonsterASP.NET, use one existing Next SSR application and its assigned PORT/generated IIS setup, not a second backend/custom server. Configure private origin/secrets before build, preserve private media outside the deployed root, and verify SQL/TLS/connection quota/clock/SMTP/private jobs, paired backups, actual redeploy persistence and trusted-origin forwarding. The existing [storage checklist](MONSTERASP_STORAGE_CHECKLIST.md) remains unexecuted host guidance. No IIS/web.config, DNS, hosting account or production release was modified during Phase6.
