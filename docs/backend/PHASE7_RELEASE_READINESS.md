# Phase7A release readiness — correction revalidation 2026-11-12

**Local functional gates PASS; final signoff remains BLOCKED on operator-only test cleanup.** The owner explicitly authorized a minimal confirmed mobile-overflow fix. The defect is now corrected and supported by repeated real-browser measurements. No applicable narrower approval mechanism is available for the previously rejected account/file cleanup, so no cleanup mutation was retried. All host checks remain NOT TESTED; Phase7B/7C remain documentation only. No deployment, DNS/IIS/hosted SQL/production administrator/legacy ASP.NET change occurred.

| Release check | Status / evidence |
| --- | --- |
| Authorized frontend exception/contracts |PASS only app/(site)/globals.css changed for the explicitly authorized mobile defect. All other frontend source, API/auth/SEO/translation contracts, Swagger, seven migration files, package-lock/dependency versions and actual .env are unchanged from the correction entry snapshot; see evidence/phase7-corrections/scope.json. Historical November11 freeze evidence remains intact |
| Clean SQL initialization |PASS fresh disposable targets,0001–0007/19tables; neutral roles/settings/inactive ad only, no users/content/files until explicit test bootstrap/UI |
| Migration constraints/checksums/locking/idempotency/failure |PASS existing SQL foundation suite plus production authorization simulation; no startup/request migration |
| Production authorization |PASS8new child SQL checks/9including parent; correct production policy, expiring target-bound SHA256 plans, matching backup attestations; actual hosted TLS NOT TESTED |
| First SuperAdmin |PASS private test CLI and browser login; operator supplied secret, salted hash/audit/duplicate/elevation guards; no production administrator |
| Browser end-to-end |PASS21/21child scenarios/22including parent,0fail/skip; unchanged forms/seven CRUD/settings/upload/login/logout/restart; current evidence in phase7-corrections |
| Mobile |PASS three repeated final rounds:30mobile cases320/375/390/414/430px/ar/en plus6desktop1440px cases; strict width/scroll, real text/image visibility, AOS and reduced-motion checks.390px before max485→after390. See PHASE7_MOBILE_CORRECTION |
| Authentication/session/OTP/roles/CSRF |PASS re-run unit/SQL/real HTTP suites; injected mail only; runtime SMTP NOT TESTED |
| Storage |PASS local signatures/4MiB/lifecycle/hash/reference/Range/ETag/preview/restart; host ACL/redeploy/restore NOT TESTED |
| Legacy independence |PASS actual HTTP109requests and real Chrome0legacy attempts with Node/browser blockers; missing SQL readiness503 instead of empty fallback |
| Dependency review |PASS focused runtime fixes; runtime audit0; full audit7moderate development-tool findings documented |
| Existing regressions |PASS re-run151leaf tests/156including5SQLparents,0fail/skip; production-policy SQL9counted tests also pass |
| TypeScript/lint/build |PASS typecheck, lint0errors/12existing img warnings, optimized build16.4.6; local Node26.3.1 |
| Performance |PASS controlled measurements only; see PHASE7_PERFORMANCE; no user-capacity claim |
| Host environment/private maintenance/persistence/backups |NOT TESTED; exact operator/provider inputs and staging evidence required |
| Historical import |PASS removed as release requirement; optional archival tools not executed |
| Local test cleanup |BLOCKED: previous automatic review returned only "blocked by policy". Current approval policy never/no applicable narrower tool;0new mutation attempts or approvals. Read-only inventory verifies exact current targets and7private files, including resources from this revalidation. No cleanup was applied. See evidence/phase7-cleanup.json and PHASE7_LOCAL_CLEANUP |
| 2FA operation |BLOCKED501 by design; current dashboard has no dependency;56implemented operations, no full57-operation parity claim |

Re-run passing checks: dashboard-auth4, sanitize6, dashboard-proxy7, foundation unit21, auth unit11, content unit10, files unit11, integration unit10; SQL foundation12, auth19, content14, files13, full HTTP18 (SQL counts include one parent each). Release SQL9pass. Corrected browser22counted:22pass/0fail/0skip. Historical browser failure is retained in the earlier evidence, not relabeled. Current logs/counts, matrix/scope and audit results are under evidence/phase7-corrections.

## Changed files and review scope

- Backend: new db/production-maintenance.ts and db/initialize.ts; extended db/migrate.ts and auth/bootstrap.ts. Seven SQL files are unchanged.
- Private CLI: production-plan.mjs/initialize.mjs plus shared.mjs/bootstrap-admin.mjs integration. No maintenance HTTP route.
- Dependencies: package.json/package-lock, focused Axios/Tiptap/transitive fixes and Playwright dev-only.
- Tests: release.integration.test.mjs, browser.integration.test.mjs, guarded local session observer and synthetic large-PNG fixture helper.
- Documentation: all nine Phase7 documents, redacted evidence, .env.example, AGENTS/README and superseding notes in existing deployment/security/bootstrap/import/storage reports. Actual .env remains untouched.

Correction-only changes: site globals.css; stricter browser width/React-hydration checks; mobile diagnostic helper and private local launcher plus test:mobile script; read-only cleanup inventory script; mobile-correction/manual-cleanup documentation and updated release/checklist/README/AGENTS records. No backend, DTO, dependency version or database migration edit was needed. Exact file manifest: evidence/phase7-corrections/scope.json.

## Exact next gates

1. Complete separately approved operator cleanup of the verified disposable local accounts and seven private credential files, then observe disabled/absent states before closing that gate. This environment cannot request the narrower approvals and must not evade the previous rejection. Until then Phase7A is functionally validated but not unconditionally signed off for staging.
2. Obtain explicit approval for Phase7B before any hosted action; supply the actual staging origin, supported Node/build environment, new SQL target/verified TLS/scoped maintenance access, private persistent upload path/ACL/hard-link support and separate secrets.
3. Execute and document hosted HTTPS/CSRF/SSR-assigned-port/build-origin/media optimization, SMTP, quotas/memory,4MiB edge handling, restart/redeploy persistence and paired backup/isolated restore. These cannot be proven by local tests or provider web pages.
4. Preserve the clean-start policy, exact production maintenance guards and corrected mobile regression; do not reuse test accounts for staging or run historical imports.

The [staging plan](PHASE7_STAGING_PLAN.md), [production checklist](PHASE7_PRODUCTION_CHECKLIST.md) and [release runbook](PHASE7_RELEASE_RUNBOOK.md) are prepared. Stop at Phase7A; no hosting approval is inferred.
