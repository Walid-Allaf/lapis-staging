# Phase7 release runbook — Phase7A only executed

As of2026-11-12: local functional/backend/mobile correction revalidation passes; operator-only test cleanup is still BLOCKED. **Do not execute hosting steps without explicit approval.** This supersedes historical data-import and unsupported-production-bootstrap gates in older phase reports. Original ASP.NET remains untouched and is not required by runtime or rollback.

## Reproduce local verification

Use Windows, the lockfile, Node26.3.1 (tested), local SQL Server Express17.0.1000.7, installed Chrome and PowerShell7 for the optional local SQL-session observer. Before changing Next code read the relevant installed `node_modules/next/dist/docs` guide. Install with `npm ci`; keep real .env operator-owned. Unit tests/build do not need populated SQL. Every SQL integration suite must get its **own new empty** `lapis_test_<16hex>` database and scoped temporary login, not an existing development/ASP.NET database. SQL_ALLOW_TESTS=true, SQL_ENV=test, exact SQL_EXPECT_DATABASE and normal migration/seed guards are required. The controlled local instance uses explicit encryption/self-signed trust in test only; never copy that exception into production.

```powershell
npm run test:dashboard-auth
npm run test:sanitize
npm run test:dashboard-proxy
npm run test:db
npm run test:auth
npm run test:content
npm run test:files
npm run test:integration
npm run typecheck
npm run lint
```

With separately provisioned fresh targets/private process credentials and JWT/OTP test keys, run each of test:db:integration, test:auth:integration, test:content:integration, test:files:integration and test:release:sql. Injected test mail is test-only; do not set real SMTP credentials for tests. Each suite asserts it starts from zero user tables and refuses the wrong test naming/acknowledgement. Policy simulation retains SQL_ENV production for authorization but uses a preconnected disposable local test pool; it is not proof of hosted TLS.

Build the fixed-origin HTTP/browser artifact once:

```powershell
$env:APP_ORIGIN='http://127.0.0.1:3197'
$env:SQL_ENV='test'
npm run build
# Each on its own NEW database, one at a time because both own port3197:
npm run test:integration:sql
npm run test:browser
```

The browser suite runs the actual clean initializer and first-admin private CLIs, creates an operator-supplied synthetic test password in memory, launches installed headless Chrome in an isolated profile, blocks the legacy hostname in both Node and browser, and drives existing forms. It has no deployment access. It retains a redacted evidence JSON/screenshots under the OS temp directory; no HAR/traces/password/token dumps. Review any failed earlier mobile runs as well as the final pass. Revoke only the suite's temporary SQL logins/remove their private credential files afterward; retain/dispose isolated databases through normal operator policy. Do not drop/reset arbitrary databases.

**BLOCKED cleanup in this run:** automatic approval review rejected the combined local login-disable/credential-removal command, and rejected a narrower deletion naming the seven exact credential files. The returned reason was only "blocked by policy"; no cleanup succeeded.20Phase7 test logins/databases remain isolated, with7private credential files under the current user's TEMP directory and generated-target metadata `lapis-phase7-*-created.json`. Credentials were created with operator-only protected ACLs and never printed. An operator must review that metadata, verify each lapis_test suffix/login pair, disable only those generated local logins, and remove only the matching private test-env files. No production or existing development account is in that scope. Do not evade the approval restriction or claim the temporary accounts were revoked.

The20-account count above records November11, not the new total. The November12 correction deliberately did not retry any rejected cleanup mutation: approval policy never provides no applicable narrower request path. Additional explicitly requested fresh regression suites create further disposable targets. Consult the current verified [inventory](evidence/phase7-corrections/cleanup-inventory.json) and [manual handoff](PHASE7_LOCAL_CLEANUP.md) for exact current targets and separate positive approvals; no cleanup is implied by running an inventory.

For mobile revalidation use `npm run test:mobile` against the acknowledged local test SQL configuration and the3197-origin build. It performs public reads, runs three ar/en rounds at320/375/390/414/430 and1440px, captures raw transforms/geometry/screenshots and checks reduced motion, no clipped text and strict zero horizontal scrolling. Run it separately from the two suites that own the same port. The only owner-authorized frontend correction is site globals.css; see PHASE7_MOBILE_CORRECTION.

After tests restore the normal local artifact with APP_ORIGIN=http://localhost:3000 and SQL_ENV=test or an explicitly configured nonproduction environment, then `npm run build`. For production **rebuild again** with the final HTTPS APP_ORIGIN; changing runtime origin cannot rewrite compiled NEXT_PUBLIC values. The current .next is local-only and must not be copied as a production-origin artifact.

## Before approved staging

Review the Phase7 documents, corrected mobile evidence, residual build-tool advisories and outstanding manual local cleanup. Obtain real host Node version, private uploads path/ACL, assigned-port/start command, verified SQL TLS/permissions/remote maintenance access, HTTPS origin and private environment delivery to build/start. Follow PHASE7_STAGING_PLAN only after explicit approval; all host checks are NOT TESTED here.

## Before approved production

Follow PHASE7_PRODUCTION_CHECKLIST after hosted staging signoff. Provision a new database/empty private storage, reviewed seven migrations, neutral initialization and exactly one operator-supplied SuperAdmin via PHASE7_MIGRATION_BOOTSTRAP. No historical import/inventory step exists. Require exact target/status/hash/backup and revoke maintenance access afterward. Do not place bootstrap passwords/allow flags in the Node web-worker environment.

Health gates: /api/health and public pages reflect current schema/settings/database availability; content collections may be empty200. Login must return the existing cookie projection without browser-visible JWT, protected APIs must deny anonymous access, and same-origin media must render through Next Image. Test failure503 rather than a synthetic empty-data success. Inspect logs without recording credentials/tokens/OTP or private paths.

Stop and recover on failed/running migration history, checksum drift, target mismatch, SQL certificate failure, orphan media ambiguity, auth/CSRF failure, failed restore or resource exhaustion. Preserve backups, do not force retries or edit history. Use an isolated paired SQL/media restore and a reviewed compatible app artifact; get explicit approval for any hosted target switch. End Phase7A here; Phase7B/7C remain plans.
