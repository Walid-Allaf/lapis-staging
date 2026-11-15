# Phase7 dependency and security review — 2026-11-11

**PASS for targeted runtime fixes; residual development-tool findings documented.** Audits are a dated advisory snapshot, not a guarantee of absence of vulnerabilities.

| Check | Result and evidence |
| --- | --- |
| Initial npm audit |39 findings:5high,34moderate,0critical |
| Final npm audit |7moderate,0high,0critical |
| npm audit --omit=dev |0 findings |
| Focused runtime updates |Axios1.11.0→1.21.1; Tiptap direct dependencies and existing overrides3.20.0→3.30.5; package-lock synchronized |
| Other updates |Named transitive tooling updates within existing allowed ranges: browserslist, baseline-browser-mapping, js-yaml, minimatch, brace-expansion and typescript-eslint family; no audit fix --force |
| Runtime baseline |Next16.4.6, React19.2.4, JOSE6.2.17, mssql12.7.14, nodemailer10.5.0, sanitize-html2.18.1; no direct advisories in this audit |
| Browser regression |Installed @playwright/test1.65.0 as dev-only; real installed Chrome157.0.8103.50; rich-text unlock/edit/save and all seven CRUDs verified |

[Axios1.21.1 release](https://github.com/axios/axios/releases/tag/v1.21.1) raises the redirect dependency security floor without changing its API. Tiptap3.30.5 includes fixes for [inherited DOM attributes](https://github.com/ueberdosis/tiptap/security/advisories/GHSA-cp6q-959q-f8rh) and [Markdown parser ReDoS](https://github.com/ueberdosis/tiptap/security/advisories/GHSA-j95f-988m-3j2f). Frontend source was preserved and its actual browser behavior checked after these package changes.

The remaining seven audit entries are minimatch10.2.6 under @typescript-eslint/typescript-estree and its six affected tooling ancestors: eslint-plugin/parser/type-utils/typescript-estree/utils/typescript-eslint8.72.2. GHSA-g3hv-75wg-m249 concerns adversarial glob-part amplification; the advisory patch is11.0.1+, a different major from the installed consumer's range. These are development/build lint tools, absent from the production dependency audit; the request/upload paths do not accept minimatch glob patterns. Avoid an unsupported forced cross-major override; track upstream tooling and re-audit before release. A compromised build dependency remains a supply-chain concern, so production audit zero does not make build tooling risk zero.

| Application check | Status / coverage |
| --- | --- |
| Signed identity plus SQL session, issuer/audience/expiry/security version |PASS auth unit/SQL and real Next HTTP suite; no decoded-JWT authorization |
| Cookie and CSRF |PASS actual Chrome HttpOnly/Secure/SameSite Strict/Path dashboard; no JWT in login JSON; wrong/missing origin403; logout204 and replay401 |
| Roles |PASS Manager/SuperAdmin content; User and disabled/expired/revoked accounts denied; SuperAdmin-only user management; no registration elevation |
| Passwords |PASS salted bounded-cost scrypt, weak bootstrap rejection, password-change invalidation; no credential logging or password arguments |
| SQL |PASS parameterized queries and exact target/schema ownership/history/hash/lock guards; production verified TLS configuration retained |
| Media |PASS authenticated upload, signature allowlist/actual-byte cap, random keys, non-overwrite, SQL lifecycle and hash verification; nosniff/sandbox/Range/ETag |
| HTML |PASS existing sanitization/slug/reference regression; no editor/sanitizer bypass added |
| Maintenance |PASS CLI-only expiring reviewed plans; backup receipt required for existing-schema writes; no auto-startup/public maintenance |
| Hosting identity/TLS/IIS/restore |NOT TESTED; requires authorized staging |

OTP tests use only an injected in-memory MailAdapter in disposable SQL tests. No production runtime test-mail switch and no real messages were sent. OTPs use six random digits, independent HMAC key and salt/purpose/identity binding; five-minute expiry, sixty-second resend cooldown, bounded attempts and SQL-backed global/action rate limits remain. The auth SQL suite covers confirmation, replay, expiration, attempt exhaustion, password-reset proof consumption, SQL rollback on mail failure and two-factor-enabled fail-closed login.

Production SMTP requires SMTP_HOST, PORT, SECURE (false for STARTTLS such as587, true for implicit TLS such as465), USER, PASSWORD and FROM. Configure verified sender/domain and provider outbound policy. requireTLS is enforced when SECURE=false; certificate validation is never disabled. Missing configuration, timeout, rejected recipient or transport failure returns503 through the existing boundary; challenge/account writes roll back instead of a successful-send response. Actual SMTP delivery/quotas remain NOT TESTED.

`POST /api/auth/toggle-2fa` intentionally remains501. Source search confirms the current dashboard does not call it. Its login contract has no second-factor input; do not enable TwoFactorEnabled directly or claim full API parity.56 operations are implemented;57-operation full parity is not claimed. Secure documented challenge UX requires a future explicit contract decision.
