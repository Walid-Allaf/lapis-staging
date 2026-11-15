> Phase7 clean-start policy (2026-11-11) supersedes historical release requirements below. Use a NEW database, immutable migrations0001-0007, explicit neutral initialization and one operator-supplied SuperAdmin; empty content/uploads; NO historical import or credential transfer. Phase7A is local only. Read [PHASE7_RELEASE_READINESS](PHASE7_RELEASE_READINESS.md), [PHASE7_MIGRATION_BOOTSTRAP](PHASE7_MIGRATION_BOOTSTRAP.md) and [PHASE7_RELEASE_RUNBOOK](PHASE7_RELEASE_RUNBOOK.md) for current evidence, guarded production CLI design and remaining blockers. No hosting/deployment authorization is implied. Older phase statements below describe their historical scope.

# MonsterASP.NET storage verification — manual Phase 7 gates

No control-panel change, deployment, IIS edit, production upload/migration or host access was performed in Phase5. Local tests prove restart persistence only. **Do not claim MonsterASP.NET redeploy persistence until this checklist is executed on the actual account.**

## Official sources researched 2026-11-11

[MonsterASP.NET Git deploy guide](https://help.monsterasp.net/websites/git-deploy/github-repository) documents staging before publish, preserving untracked live files, and Protected files entries relative to wwwroot; a trailing slash protects a folder, after its initial deployment. This is deployment protection, not proof of filesystem ACLs or denied public access. [Node hosting guide](https://help.monsterasp.net/websites/frameworks/nodejs) describes IIS HttpPlatform starting one Node process with the assigned PORT; SSR Git Deploy generates its web.config. [Microsoft IIS request limits](https://learn.microsoft.com/en-us/iis/configuration/system.webserver/security/requestfiltering/requestlimits/) documents maxAllowedContentLength and server-level rejection before application handling. These are provider/documentation statements, not observed behavior on this account.

## Private directory and deploy checks

- [ ] Ask the provider/control panel for the real absolute private persistent folder **outside wwwroot/the running app root and Git staging/build directories**, available to the Node application identity. No universal Windows path is verified; a sample path must never be substituted blindly. The current code refuses storage inside the running project or its ancestor/root.
- [ ] Confirm the account permits that path and dedicated NTFS read/write/create/link/delete-owned-stage access. Deny other tenants/untrusted processes. Unix0700/0600 modes do not establish these Windows rights. Verify the directory is not a junction/symlink and is not directly reachable through IIS static handling or directory browsing.
- [ ] Confirm same-volume NTFS hard links work for staging→objects and survive process/app-pool recycling. Unsupported hard links must fail503; do not replace with overwrite-capable rename or direct public storage.
- [ ] Set server-only UPLOAD_DIR to the confirmed absolute path, using the provider's environment-variable mechanism. Do not expose it as NEXT_PUBLIC or commit real paths/credentials. Verify ownership marker and dedicated root, quota/free space and file flush behavior.
- [ ] Review provider Git Deploy Protected files/folder rules with the actual folder layout. Add applicable relative trailing-slash protection entries for persistent live folders if used by the account; private storage outside wwwroot should be outside the publish target. Protected entries do not satisfy the code's private-directory requirement. If only a wwwroot uploads folder is offered, that conflicts with this implementation's boundary: obtain a private location/provider confirmation rather than silently weakening it or editing web.config.
- [ ] Upload a synthetic image/PDF to a staging deployment, record fileId/path/SHA256 privately, restart the app pool, then publish a different application build using the real Git Deploy mode. Confirm the same SQL row and exact bytes remain accessible. Repeat rollback verification. Only then record redeploy persistence as verified.

## Request layers and headers

| Layer | Current application behavior / manual requirement |
| --- | --- |
| ImageUpload | File cap4,194,304bytes; accept `*` is not a server allowlist |
| Existing dashboard proxy | Bounded streaming file cap4MiB, header cap8192 plus actual closing-boundary allowance; upstream timeout30s; unchanged and still external |
| New direct upload route | File cap4,194,304; total multipart cap4,202,576; actual bytes counted with or without Content-Length; strict one file |
| Next | Node Route Handler, streamed input; no Server Action body-size setting is relevant; verify provider wrapping/buffering/timeouts |
| IIS/HttpPlatform/optional edge proxy | Actual account limits UNKNOWN; permit at least4,202,576 transport bytes for an exact4MiB file. Coordinate a modest matching cap with provider; do not change unsupported/global web.config settings blindly |

- [ ] Test exact4MiB and one byte over via both direct route and the eventual authorized proxy path. Record which layer rejects and its observable status/body. Server-level IIS errors need not use the JSON upload envelope.
- [ ] Test PNG/JPEG/static WebP/GIF/PDF Content-Type, generated filename, nosniff, CSP sandbox, ETag/304, HEAD, byte/suffix ranges206/416 and missing/inaccessible404 with no filesystem leakage. Verify browser PDF preview under sandbox in supported browsers.
- [ ] Verify no physical stage/root/marker/listing is reachable directly, and malformed/encoded paths cannot bypass the trusted-key route. Confirm uploads cannot execute under IIS.
- [ ] Measure process memory, concurrent authorized uploads, SQL pool3/min0, lock/flush/hash latency, disk quota and30s proxy timeout. No global upload concurrency limiter/disk quota enforcer is implemented. Establish operator controls without a destructive background worker.

## Backup, recovery and integration checks

- [ ] Establish paired SQL+filesystem backups, access-controlled manifests, retention, actual isolated restore rehearsal and pending/ready/failed reconciliation. Read STORAGE_RECOVERY. The current repair CLI refuses production; review a production procedure separately.
- [ ] Test simulated process termination between registration/link/ready stages on a staging host, then read-only audit and explicitly reviewed repair; do not reset/drop production or automatically collect orphans.
- [ ] For Phase6 only: set the final absolute HTTPS same-origin NEXT_PUBLIC_API_BASE_URL (no /api suffix), approve the final host's /uploads/** in Next Image configuration, preserve existing helper/DTO contracts and test upload→content→public image delivery. Current legacy URLs/IDs need an explicit import plan; generated-key serving does not import arbitrary old storage paths.
- [ ] Keep dashboard sessions/CSRF/proxy, blocked2FA and public transport unchanged until that separate authorized integration. No checked item is implied by successful local build/tests.
