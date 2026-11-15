> Phase7 clean-start policy (2026-11-11) supersedes historical release requirements below. Use a NEW database, immutable migrations0001-0007, explicit neutral initialization and one operator-supplied SuperAdmin; empty content/uploads; NO historical import or credential transfer. Phase7A is local only. Read [PHASE7_RELEASE_READINESS](PHASE7_RELEASE_READINESS.md), [PHASE7_MIGRATION_BOOTSTRAP](PHASE7_MIGRATION_BOOTSTRAP.md) and [PHASE7_RELEASE_RUNBOOK](PHASE7_RELEASE_RUNBOOK.md) for current evidence, guarded production CLI design and remaining blockers. No hosting/deployment authorization is implied. Older phase statements below describe their historical scope.

# Private administrator bootstrap

This is a private CLI, never a public endpoint or automatic seed. It is disabled for production in Phase 3. There is no default account or password.

## Required safeguards

- SQL_ENV must be development or test. SQL_ALLOW_SEED=true and SQL_EXPECT_DATABASE must match SQL_DATABASE and the actual DB_NAME(). System databases are rejected.
- All six migrations must be current. Bootstrap does not run migrations.
- NODE_ENV must not be production. AUTH_BOOTSTRAP_ALLOW=true and AUTH_BOOTSTRAP_CONFIRM=CREATE_FIRST_SUPERADMIN are required.
- The operator provides AUTH_BOOTSTRAP_EMAIL and AUTH_BOOTSTRAP_PASSWORD through a temporary process environment or an approved secret manager. Never put the password in command-line arguments, source control, a published env file, or build logs.

Run **npm run db:bootstrap-admin** from a private authorized execution facility. Extra CLI arguments are rejected. The command removes the password from its own environment after reading it and prints only operation/applied. Remove the temporary secret, allow flag and confirmation from operator configuration afterwards.

## Behavior

The password is scrypt-hashed. A SQL transaction and the common authentication lock serialize bootstrap with other security operations. The command creates a canonical superadmin role with the string contract value SuperAdmin, and a new UUID external identity with EmailConfirmed=true, IsDisabled=false, TwoFactorEnabled=false, SecurityVersion=0. These are new provisioning policies, not legacy defaults. The Operator/Administrator display label is not an account identifier; email and password have no defaults.

Re-running for the same eligible administrator returns applied=false without resetting credentials or flags. An existing ordinary user or unresolved identity produces a conflict; it is never promoted. An administrator under another email also prevents another bootstrap. Existing role definitions that disagree with the canonical policy are rejected rather than overwritten. SecurityEvents records no email, password or token.

Public registration always provisions User and requires email confirmation. Private bootstrap treats confirmation as an explicit operator decision and does not require SMTP.

## Hosting dependency

A fresh MonsterASP.NET database needs the same CLI, runtime dependencies, SQL files and TypeScript modules inside an authorized SQL network. Shell, SSH and private one-off jobs are not assumed to exist. Confirm an execution facility with the host; see [the deployment runbook](DEPLOYMENT_RUNBOOK.md). Do not add a public endpoint if it is unavailable.

Production bootstrap requires a separately authorized procedure. Do not relabel a production database as development to evade the current guard. Backup, audited operator access and secret provisioning must be established first. No production bootstrap occurred in this task.

Tests verified creation, idempotence, refusal to promote public registrations, production denial and absence of the operator secret in stdout/stderr. All accounts were synthetic in newly created disposable SQL databases.
