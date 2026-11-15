# OTP and two-factor policy

All purpose meanings and workflows below are INFERRED: explicit new policies, not recovered legacy behavior. Swagger retains OtpPurposeEnum values 0, 1, 2 without invented historical names.

| Numeric value | New meaning | Consumption |
| --- | --- | --- |
| 0 | Email confirmation; default when send-otp omits purpose | confirm-email only |
| 1 | Password reset | verify-otp produces an opaque reset proof, or reset-password consumes the six-digit OTP directly |
| 2 | Login second factor | login with password and code, only when the account's 2FA flag is set |

verify-otp has no documented purpose field. It verifies purpose 1 only; it never guesses a purpose from the latest code or issues a login JWT. Purpose 0 uses confirm-email; purpose 2 uses login(code). Exact legacy behavior remains UNKNOWN.

## Protected state and concurrency

Codes have six digits from crypto.randomInt. SQL stores an HMAC-SHA256 digest with a random 16-byte salt and a separate server secret of at least 32 random bytes. The digest binds email hash, purpose, challenge ID, salt and code. Plaintext OTPs are never stored in SQL, API responses or logs.

TTL is five minutes; at most five verification attempts; resend cooldown is sixty seconds per address/purpose. Failed attempts commit before a failure response. Successful consumption and the resulting credential/session changes are atomic under a SQL transaction and the shared security lock. Concurrent resets were tested to produce one success only.

Resending consumes earlier challenges of that purpose. Purpose-1 resend invalidates earlier reset proofs. Password change/reset and disabling or re-enabling an account invalidate all outstanding OTPs/proofs and sessions through revocation plus a security-version increment.

verify-otp returns a random 256-bit base64url resetToken with a five-minute expiry. SQL stores only its SHA256 digest and account/version binding. reset-password accepts this proof in the original code field, or accepts a six-digit purpose-1 OTP directly. Replay, expiry and version mismatch fail generically. This response is a new contract, not a verified legacy response.

## Persistent limits

Limits are stored in SQL across workers; there is no memory-only fallback when SQL is unavailable:

- Global service limit: 120 requests/minute. The implementation does not trust unconfigured X-Forwarded-For headers to identify clients.
- Login, confirmation, verification and reset: 10 per identity/action in fifteen minutes.
- Registration: 5 per email/hour. send-otp: 5 per email/purpose/hour.
- Protected HTTP operations: 60 per token/minute, also subject to the global limit.
- Exceeding a limit returns 429 with Retry-After:60. A threshold event is recorded once; rate counters survive failed domain operations. Bucket identities are HMAC-protected. Expired rate rows receive bounded cleanup.

The shared authentication lock also covers SMTP acceptance inside the transaction. This favors atomic state and truthful failure responses over throughput. SMTP latency, pool capacity and service limits must be measured on the shared host before cutover. Retention/purge for expired OTPs, reset proofs and security events still needs a reviewed operational procedure; expiration prevents authentication but does not itself remove historical rows.

## SMTP and test evidence

Runtime uses Nodemailer SMTP with environment-provided sender/credentials and mandatory TLS or STARTTLS with certificate verification. There is no hardcoded provider and no runtime test-mail switch.

SMTP acceptance is required before commit. Missing settings, transport failure or rejection returns 503 and rolls back user/challenge writes. SMTP acceptance is not an inbox delivery receipt. No real provider or hosting delivery was tested.

To reduce account enumeration, send-otp sends the same message format to every syntactically valid requested address, including unregistered addresses. Such challenges have no UserKey and cannot obtain identity/session/reset proofs. Duplicate registration never changes credentials and uses generic success after the cooldown. This deliberate policy requires the documented abuse limits and an approved SMTP quota.

SQL tests inject an in-memory MailAdapter directly from test code and clear captured messages afterwards. There is no public code-retrieval route or mail bypass. No real person received test messages and the original ASP.NET API was not mutated. Tests cover delivery failure rollback, including preservation of an earlier valid challenge.

## Public toggle blocker

ToggleTwoFactorRequest is an empty object. The current dashboard login sends only email/password and does not pass code or implement a challenge screen. There is no verified contract for proving a security-setting change.

POST /api/auth/toggle-2fa is therefore **BLOCKED**: it authenticates the signed JWT and SQL session, records the refused operation, returns 501 AUTH_2FA_WORKFLOW_UNVERIFIED and does not change the flag. Anonymous requests receive 401; extra body fields receive 400. A handler is not counted as implemented behavior.

The internal login foundation is tested against synthetic fixture accounts with TwoFactorEnabled=true: a valid password alone issues a purpose-2 challenge and returns 401; a correct single-use code plus password issues the session. No public command enables 2FA on a real account. Cutover requires an approved verification/challenge workflow; bypassing the second factor is not a solution.
