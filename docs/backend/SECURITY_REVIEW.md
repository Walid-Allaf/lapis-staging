> Phase7 clean-start policy (2026-11-11) supersedes historical release requirements below. Use a NEW database, immutable migrations0001-0007, explicit neutral initialization and one operator-supplied SuperAdmin; empty content/uploads; NO historical import or credential transfer. Phase7A is local only. Read [PHASE7_RELEASE_READINESS](PHASE7_RELEASE_READINESS.md), [PHASE7_MIGRATION_BOOTSTRAP](PHASE7_MIGRATION_BOOTSTRAP.md) and [PHASE7_RELEASE_RUNBOOK](PHASE7_RELEASE_RUNBOOK.md) for current evidence, guarded production CLI design and remaining blockers. No hosting/deployment authorization is implied. Older phase statements below describe their historical scope.

# Phase 3 security review — 2026-11-11

The isolated Auth/User backend is implemented and locally tested. This is not production-readiness or legacy-parity certification. No production deployment, migration, bootstrap or live cutover occurred.

## Focused Next.js upgrade

Reviewed primary sources: [October 14 security update](https://nextjs.org/blog/nextjs-security-update-october-14-2026), [official advisories](https://github.com/vercel/next.js/security/advisories), [16.4.5 security release](https://github.com/vercel/next.js/releases/tag/v16.4.5), and [16.4.6 release](https://github.com/vercel/next.js/releases/tag/v16.4.6).

Upgraded next, @next/env and eslint-config-next from 16.2.7 to **16.4.6**, within the same major, with lockfile changes. Version 16.4.5 contains the November 3 security fixes; 16.4.6 is the later November 9 stable release. No audit fix --force or frontend source rewrite was used.

The post-upgrade npm audit reported **0 critical**, with no entry for next/jose/nodemailer/zod. There remain 39 findings: 34 moderate and 5 high in other existing dependencies, including Axios, Tiptap and build tooling. Their remediation/regression testing remains a separate pre-production gate. Passing build/tests is not a clean vulnerability audit.

The installed Next engine requires Node>=20.9.0. Local verification used Windows and Node26.3.1. The actual MonsterASP.NET runtime/memory budget remains unverified. The installed Next documentation was read before handlers/config were written.

Turbopack initially tried to trace an optional PowerShell executable through SQL identity dependencies. The focused fix is serverExternalPackages for mssql/nodemailer, following the installed Next guide, rather than copying an executable or rewriting UI code. Dynamic CLI test-directory filesystem calls receive tracing annotations; explicit health tracing still includes the six SQL files. This avoids tracing the whole checkout. The final build passes; IIS configuration is unchanged.

## Password storage

Argon2id is preferred, but native-addon support and the host's memory/runtime budget could not be verified. The implementation uses Node crypto scrypt without a new native hashing dependency: N32768/r8/p3, random 16-byte salt, 32-byte derived hash, timing-safe comparison, and a bounded versioned format. This is one of the [OWASP scrypt alternatives](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html), using the [documented Node API](https://nodejs.org/api/crypto.html#cryptoscryptpassword-salt-keylen-options-callback).

Each operation uses about 32 MiB with maxmem64MiB; two active operations and sixteen queued operations per process bound resource use. Benchmark the target host before cutover. Unknown users/unrecognized hashes receive equal-cost dummy work; DB-supplied costs are never trusted. ASP.NET hash import is unsupported until explicitly designed.

The new password policy requires at least twelve characters and at most 1024 UTF-8 bytes when creating/changing a password. Reset also retains Swagger's maximum twenty characters. This is a declared security difference from Swagger shape constraints, not claimed legacy behavior. No plaintext/default administrator credentials exist.

## JWT, keys and SQL state

[JOSE](https://github.com/panva/jose) verifies HS256 only, typ/kid, issuer/audience and exp/nbf/iat/jti. JWT keys require at least 32 random bytes. The OTP HMAC key must be independent. Legacy .NET identity/role aliases are supported and conflicting aliases are rejected. Outgoing tokens fit the existing 3500-byte dashboard cap.

Rotation procedure: distribute the new kid/key to every worker, switch AUTH_JWT_ACTIVE_KID and restart, retain old verification keys until all tokens issued under them have expired (configured maximum TTL3600s, accounting for staggered deployment), then remove them. Compromise requires reviewed key removal and session revocation. Never fall back to decoded legacy tokens. Rotating AUTH_OTP_KEY invalidates pending HMAC codes; coordinate resend and rate-limit handling operationally.

After signature verification, SQL must match the external ID, email, role, security version and an unrevoked/unexpired session jti hash. Password change/reset and disable/enable revoke all sessions/proofs. The old dashboard decoder remains unchanged for the external backend; new services never trust it as authorization.

## Authorization and protected operations

[Authorization policy](AUTHORIZATION_MATRIX.md): User/Manager can act on their own profile/password; SuperAdmin alone manages users. Public registration cannot select a role. Profile edits cannot target another identity or mutate role/email, and file metadata must belong to the actor. Self-disable and disabling the last active administrator are prohibited.

A shared SQL security lock and transactions serialize sensitive checks/mutations, including concurrent administrator disable attempts. Parameterized SQL and fixed sorting/update whitelists prevent request-controlled SQL identifiers. IsActive is newly defined as inverse IsDisabled only; confirmation remains a separate authentication condition.

[OTP policy](OTP_AND_2FA_POLICY.md) documents purpose binding, protected storage, expiry, attempts, cooldown and persistent rate limits. SMTP acceptance is required; missing/rejected delivery fails safely. In-memory test mail is injected only by test code, never exposed through a runtime toggle or route.

SecurityEvents contains no request bodies, raw emails, passwords, OTPs, JWTs, keys or IP addresses. Public errors and health responses contain no SQL/connection details. Local production HTTP tests exercised all thirteen routes, including explicit 501/503 responses, without sending real messages.

## Remaining gates

- Public toggle-2fa remains explicitly blocked: no verified proof contract or current UI challenge flow.
- Role/purpose/sort mappings, User responses, password policy, pagination defaults, IsActive semantics, dates and message alias are new decisions requiring compatibility review.
- Actual SMTP, host SQL/TLS, clock alignment, pool quota, backup restore, secret storage and private bootstrap/migration execution facility are unverified on MonsterASP.NET.
- The implementation intentionally does not trust forwarded IP headers. Approved proxy/abuse controls and SMTP quotas must be established before cutover.
- Expired OTP/proof/event retention needs an approved operational procedure and database-growth monitoring.
- Other dependency advisories remain; no production deployment is authorized by these results.
