# Phase7 private migration and first-administrator procedure

**PASS local staging-policy simulation; NOT TESTED on hosted production.** SQL_ENV remains production throughout the new authorization path. Default production writes, development seed and storage repair remain rejected. No migration, initializer or bootstrap endpoint exists.

## Operator prerequisites

Use a trusted workstation/private job with the reviewed release checkout, `npm ci`, compatible Node and the immutable seven SQL files. Configure a separate database-scoped maintenance SQL principal where the provider allows it. Runtime needs data/application-lock permissions, not DDL/db_owner. Keep maintenance allow flags and bootstrap/password values out of the web worker. Stop the target site and prevent registrations/content writes during maintenance; the schema lock serializes maintenance, not arbitrary application reads. Never switch SQL_ENV to development/test to evade authorization.

Set NODE_ENV=production, SQL_ENV=production, SQL_SERVER/PORT/DATABASE/USER/PASSWORD and SQL_EXPECT_DATABASE to the exact target. Production enforces SQL_ENCRYPT=true and SQL_TRUST_SERVER_CERTIFICATE=false. Verify the certificate/hostname with the host. Supply secrets through a protected process environment or secret manager, never command arguments, terminal transcripts, public variables or source control.

Create a private directory outside the checkout, wwwroot/build/staging, with operator-only NTFS ACLs (Unix0700 directory/0600 files). Plan and receipt filenames must be absolute and outside the checkout. The CLI writes a plan with exclusive creation, never overwrite. Windows file modes alone do not establish NTFS privacy: the operator must set and review ACLs. Delete private artifacts after the maintenance record is retained securely.

## Preview then apply

For each operation, set SQL_MAINTENANCE_OPERATION to **migrate**, **initialize** or **bootstrap**, and SQL_MAINTENANCE_PLAN_FILE to a fresh private filename. Run:

```powershell
npm run db:production-plan
```

This is read-only, including on an empty database. Review the file and console preview: actual server/database/id/create-time fingerprint, applied/pending status, all seven filenames/SHA256 checksums, migration history and table row-count summary. Plans expire after30minutes. No password, key, OTP, user identity or connection secret is included. Schema drift/running/failed migrations and unowned databases are refused.

Set SQL_MAINTENANCE_PLAN_SHA256 to the independently reviewed console/file digest, SQL_MAINTENANCE_ALLOW=true, and SQL_MAINTENANCE_CONFIRM to exactly `APPLY:<operation>:<exact database name>`. Set SQL_ALLOW_MIGRATIONS=true for migrate; SQL_ALLOW_SEED=true for initialize/bootstrap. Existing flags alone still do not authorize production.

If the database already contains tables and the operation will write, take a real target database backup **after preview and before apply**. Review its target, completion and recoverability; use the provider backup facility when SQL BACKUP permission is unavailable. Record a private JSON receipt:

```json
{
  "targetFingerprint": "<from reviewed plan state>",
  "planSha256": "<reviewed plan SHA256>",
  "verified": true,
  "reference": "<private backup identifier/location>",
  "completedAt": "<actual UTC completion after plan creation>"
}
```

Set SQL_MAINTENANCE_BACKUP_FILE to that receipt. The receipt is an **operator attestation**; the program does not physically inspect a remote backup or prove a restore. The simulation uses explicitly labeled test receipts, never claims a physical production backup. A totally empty database needs no prior backup for its first migration; current-schema migrate no-op needs none. Initialization and bootstrap after schema creation each require a current reviewed backup receipt. Preview does not authorize future unseen migrations or a different operation.

Execute only the matching command:

```powershell
npm run db:migrate
# For initialize also set SQL_CLEAN_START_CONFIRM=INITIALIZE_EMPTY_LAPIS
npm run db:initialize
# For bootstrap also set AUTH_BOOTSTRAP_ALLOW=true,
# AUTH_BOOTSTRAP_CONFIRM=CREATE_FIRST_SUPERADMIN,
# AUTH_BOOTSTRAP_EMAIL and AUTH_BOOTSTRAP_PASSWORD as private process values.
npm run db:bootstrap-admin
```

These are alternatives for the current plan, not a batch to run on one approval. Obtain a new preview/hash/receipt for each operation. Apply verifies the target/state/catalog, digest, expiry and backup under the foundation lock **before history creation or domain writes**. Migrations retain their durable running intent and per-file transactions; concurrent migration attempts fail closed. Bootstrap/initializer acquire auth then foundation locks. No forced retry, automatic down migration, history rewrite or database reset exists.

Bootstrap accepts an operator-supplied email and password (minimum12Unicode characters, maximum1024UTF8bytes). Passwords are scrypt N32768/r8/p3 with random salts; the CLI removes its password variable before work and prints only applied/status. It records AdminBootstrap, creates a confirmed/enabled SuperAdmin and never promotes a registered identity. A different second admin is refused; same eligible existing admin is a no-op and cannot reset its password. A retained bootstrap audit event prevents reuse even if an administrator was subsequently removed. Use authenticated account management afterward.

## Host execution alternative

[MonsterASP Node guide](https://help.monsterasp.net/websites/frameworks/nodejs) describes IIS starting Node and does not provide an interactive server command line. Do not assume SSH/private Node jobs exist. If the provider explicitly supports a private maintenance runner, execute this same CLI there with restricted secrets. Otherwise use the trusted workstation checkout and explicitly authorized encrypted remote SQL connection; request a temporary operator IP allowlist and database-scoped maintenance login through supported database facilities, then revoke both. No public bootstrap page or HTTP workaround is permitted. Host remote access/permissions/TLS remain unverified.

## Failure and recovery

Stop on drift, blocked history, lock loss, expired/stale plan or backup mismatch. Retain redacted status and the reviewed manifest. Inspect schema/backup out of band. Restore a verified SQL+media pair to a **new isolated database/directory**, validate migrations and bytes, and only then consider an explicitly approved target switch. Restoring an older app alone is insufficient if schema changed. Do not edit applied migration checksums or delete running/failed rows to make a retry pass.

**PASS evidence:** `test:release:sql`8 child checks covers read-only preview, missing flags/wrong hash/wrong target/custom directory, expired valid-digest and tampered plans, competing SQL lock, all seven checksums/19 tables, stale plan, no-op, a simulated six-version existing schema requiring matching backup before0007, neutral initialization, weak password refusal, first login, duplicate/password-reset refusal and occupied clean-start refusal. Existing SQL suite covers injected DDL failure/drift/constraint behavior.

**Limit:** policy testing injects an already connected disposable local TEST pool whose certificate is self-signed; production-policy configuration remains encrypt=true/trust=false. Actual production CLI uses the normal strictly verified connection. This tests policy/transactions, **not production TLS or host CLI execution**.
