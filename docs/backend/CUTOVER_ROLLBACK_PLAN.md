> Phase7 clean-start policy (2026-11-11) supersedes historical release requirements below. Use a NEW database, immutable migrations0001-0007, explicit neutral initialization and one operator-supplied SuperAdmin; empty content/uploads; NO historical import or credential transfer. Phase7A is local only. Read [PHASE7_RELEASE_READINESS](PHASE7_RELEASE_READINESS.md), [PHASE7_MIGRATION_BOOTSTRAP](PHASE7_MIGRATION_BOOTSTRAP.md) and [PHASE7_RELEASE_RUNBOOK](PHASE7_RELEASE_RUNBOOK.md) for current evidence, guarded production CLI design and remaining blockers. No hosting/deployment authorization is implied. Older phase statements below describe their historical scope.

# Cutover rollback plan

Phase6 is a local repository cutover only. The hosted site, original ASP.NET system and production databases/DNS were not changed. Keep the previous deployable application artifact and its reviewed environment before any Phase7 release. There is no client-controlled or automatic failure fallback to ASP.NET in the new runtime.

## Before release

- Preserve an immutable previous artifact/source version and its public origin/legacy endpoint configuration, along with matching dependency lock and build instructions. Do not commit real .env, passwords, JWT keys or exports.
- Pair SQL and private media backups/checksums; preserve numeric IDs/slugs/references and seven immutable migrations. Backups and rollback triggers must be reviewed on the actual host.
- In this workspace, seven original server adapter/config files were additionally copied outside the repo to `%TEMP%/lapis-phase6-rollback` before changes, and SHA256 recorded for585 existing files. This temporary local copy is a convenience, not a durable production release artifact. Do not use broad git reset/clean against the user's existing mixed changes.

## Application rollback

1. Stop new administrative mutations through an operator-controlled maintenance window, drain requests and record the last SQL/media checkpoint. Do not add a public maintenance/debug switch.
2. Restore the previously reviewed application artifact and matching environment/configuration using the host's established mechanism. Restore only the necessary server integration/config files if working locally; do not revert unrelated frontend/user work.
3. Rebuild if changing APP_ORIGIN/NEXT_PUBLIC values. Browser bundles cannot be retargeted by only changing a runtime public variable. Keep private media outside the deployed app root.
4. Recheck original external backend availability and security before restoring the previous external transport. Old and new JWTs are not interchangeable. Log users out/revoke internal sessions as planned; never accept a decoded old cookie as an internal signed identity or reintroduce a hidden auth bypass.
5. Verify public data, login/session/proxy, CSRF, original slug/media URLs and SEO against the chosen artifact. New uploads/SQL writes are not automatically synchronized back into ASP.NET; coordinate access and ownership before reopening mutations.

## Data and media boundaries

Application rollback does not authorize dropping/resetting a database, editing migration history, deleting pending/orphan files or overwriting new content. Preserve new SQL/media for reconciliation. Restoring SQL or filesystem independently can break references; use a paired reviewed recovery point and the Phase5 recovery procedure. If a previous artifact lacks the new /uploads route, newly generated local URLs will be unavailable; plan compatible serving or pause rollback rather than pretending those files exist in legacy storage.

Automatic external fallback is intentionally absent: it could mix independent IDs, leak new credentials, conceal SQL failures as empty data or bypass the new session contract. Any return to the old integration is an explicit operator artifact/config action, not a browser parameter or env runtime guess. Phase7 deployment/rollback execution still requires further instructions.
