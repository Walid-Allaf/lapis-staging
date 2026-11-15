# Phase7C production launch checklist — documentation only

**BLOCKED pending explicit owner approval and successful hosted staging. No production execution occurred.**

| Gate | Current status / required evidence |
| --- | --- |
| Local code/contracts/regressions |PASS correction evidence in PHASE7_RELEASE_READINESS; preserve all frontend except the owner-authorized minimal site CSS fix, and immutable migrations |
| Mobile first-navigation AOS behavior |PASS local repeated320–430px/ar/en matrix plus1440px desktop; confirmed section AOS containment/320px text wrapping/reduced-motion fix; host engines/devices still NOT TESTED |
| Local test cleanup |BLOCKED: no authorized narrower approval route; do not retry rejected mutations; operator handoff in PHASE7_LOCAL_CLEANUP |
| Staging hosted qualification |NOT TESTED: follow PHASE7_STAGING_PLAN and retain signed-off results |
| Exact Node/SSR Git build/start/assigned PORT |NOT TESTED on account; verify before approving production artifact |
| Production database |NOT TESTED: provision NEW empty target, no historical import or users/files/settings copied |
| Reviewed migrations |NOT TESTED on production: separate scoped maintenance principal, exact target/checksums, preview/hash/expiry/authorization; never change SQL_ENV to bypass |
| Neutral system records |NOT TESTED on production: explicit initializer after migrations, empty content/files; only required roles/settings/inactive ad |
| First administrator |NOT TESTED on production: one operator-supplied secure SuperAdmin via private authorized CLI, event recorded, temporary secrets/access revoked |
| Empty persistent uploads |NOT TESTED: real private path outside publish/build root, verified NTFS ACL/hard links and quotas, no copied media |
| Secrets and build origin |NOT TESTED: independent production JWT/OTP/SMTP/runtime SQL, HTTPS APP_ORIGIN compiled before Build & Publish, no private NEXT_PUBLIC values |
| Domain/DNS/HTTPS |NOT TESTED; explicit separate approval and actual ownership/domain values required |
| Public health and API |NOT TESTED on host: schema/current/settings readiness, empty collections200; failure503, no ASP.NET fallback |
| Browser |NOT TESTED on host: ar/en/login/CRUD/settings/upload/images/mobile/metadata/sitemap/logout/replay/CSRF |
| SMTP |NOT TESTED delivery: authenticated verified TLS/sender, rejection/timeout/OTP limits, no fake2FA; toggle endpoint501 known limitation |
| Backup/restore |NOT TESTED: paired SQL+private files, independent copies, completed isolated restore rehearsal and agreed recovery owner |
| Host resources |NOT TESTED: actual RAM/connection/storage/request limits/recycles/build-memory measurement; do not infer user capacity |
| Deployment/rollback |NOT TESTED: protected artifacts and origin-compatible release, no overwrite of media/secrets, verified restart/redeploy/app rollback |
| Final approval |BLOCKED until owner explicitly authorizes production launch after reviewing staging evidence |

Before exposing the domain, record the release commit/artifact checksum, seven migration checksums, exact target, private backup references, sanitized status/health results and operator signoff. Remove maintenance/bootstrap variables from the web worker; runtime DML principal should not own schema. Keep the old ASP.NET application untouched and outside rollback dependency.

After launch, the owner creates real content through the dashboard. Do not generate fake production records to make the site appear populated. Do not advertise full57-operation parity while toggle-2fa remains501.

Rollback order: stop new writes, preserve evidence/backups, select the previously verified compatible app artifact. If database/schema/files require recovery, restore the SQL+media pair to new isolated targets, verify before an explicitly approved configuration switch. Never drop/reset the production database, rewrite migration history, overwrite owned media or automatically import legacy content.
