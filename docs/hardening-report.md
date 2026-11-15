# Lapis security hardening report

## 1. Summary

Completed Parts A–D: server-side sanitization of public rich text, httpOnly admin sessions and a constrained same-origin server proxy, immediate tagged public-cache expiration after mutations, and the requested regression checks and documentation.

The backend contract, `.env`, public URLs, public design/copy, JSON-LD scripts, and dashboard feature forms remain unchanged. No real credentials were used and no live content was mutated. No commit or deployment was made. The pre-existing merge changes and the existing `Admin` role allowance were preserved.

## 2. Files added or changed

| Part | Files |
| --- | --- |
| A | `lib/sanitize-html.ts`; `lib/api/blog-posts.ts`; `dashboard/components/form/autocomplete-field.tsx`; `tests/sanitize.test.mjs`; `tests/load-ts.mjs`; package manifest/lockfile |
| B | `app/(dashboard)/dashboard/api/session/{route.ts,login/route.ts,logout/route.ts}`; `app/(dashboard)/dashboard/api/proxy/[...path]/route.ts`; `dashboard/server/{session,http,body-limit}.ts`; `dashboard/api/{session-contract,upload-limits,proxy-policy}.ts`; `proxy.ts`; `next.config.ts` |
| B client | `dashboard/api/axios.ts`; `dashboard/stores/use-auth-store.ts`; `dashboard/providers.tsx`; login service/logout service/hooks; protected layout and login page; account-menu email access; image-upload limit; auth and proxy tests |
| C | `lib/public-cache-tags.ts`; additive tags in public services/FAQs/specialists/testimonials/gallery/videos/blog/settings fetches; proxy policy/tag mapping and success-only expiration |
| D/docs | Dashboard root metadataBase; README; generated `docs/dashboard-proxy-allowlist.md`; its generator script; this report and `hardening-verification.json`; historical notice on the merge report |

A temporary, authenticated table-selection regression page was used and removed. Mock backends, fixture credentials, browser scripts, and Playwright remain outside the repository. No test backend address is present in application configuration or source. The final build uses the unchanged real API environment.

New dependencies are exactly `sanitize-html@2.18.1` (published 2026-10-14) and dev dependency `@types/sanitize-html@2.16.2` (published 2026-09-28), both more than 14 days old at the task date. No force/legacy-peer-deps flags were used. The installed Next guide explicitly makes installation of `server-only` optional; its marker is handled internally, so no additional package was needed.

## 3. Sanitization policy

The server-only helper runs in the blog mapper for `contentAr`, `contentEn`, and the nested specialist's `descriptionAr`/`descriptionEn`, for both list and by-slug responses. The existing client components receive only sanitized HTML. Their styling wrappers and rendering code are unchanged. Other public descriptions/answers are rendered as escaped React text. JSON-LD `<` escaping is untouched. The unused dashboard autocomplete HTML branch and its `renderHtml` field were removed.

- Allowed elements: `p br hr h1 h2 h3 h4 h5 h6 strong b em i u s del code pre blockquote ul ol li a span img`.
- Allowed attributes: links `href title target rel`; images `src alt width height`. No arbitrary classes, CSS, IDs, event handlers, or data attributes.
- Links permit HTTP, HTTPS, mailto, tel, and safe relative URLs. Protocol-relative URLs, controls, and executable schemes are rejected. Only `_blank` targets survive, with `rel="noopener noreferrer"` forced.
- Images permit absolute HTTPS URLs and upload-relative paths resolved to the configured HTTPS API origin under `/uploads/`. Protocol-relative, data, HTTP, executable-scheme, and escaping relative paths are rejected. Images without a valid source are removed. Dimensions must be numeric.
- Script/style/iframe/object/embed/form/input/button/textarea/select/SVG/MathML/link/meta/base/template elements are discarded, including child content where the HTML element can own children. Void elements such as `embed` have no child content in HTML parsing.
- Empty/null/undefined input becomes an empty string. The parser normalizes entities, closes malformed markup, and serializes void tags. Benign StarterKit formatting is byte-identical where already normalized and otherwise DOM-equivalent.

The real API was reachable and returned two posts. Eight content/specialist language fields were compared: seven were byte-identical. The English Medium-derived article uses link classes `aow aoa id` / `as lk`; these were removed, and existing new-tab `noopener` values gained `noreferrer`. All its legitimate paragraph/link/underline/list/break elements remain. No allowlist extension was needed. No class-specific rules for those copied class names exist in the public stylesheet.

The sanitizer follows the library's allowlist and transform mechanisms; upstream documentation is in the [sanitize-html monorepo](https://github.com/apostrophecms/apostrophe/tree/main/packages/sanitize-html).

## 4. Implemented auth model

### Session and routes

`lapis_admin_session` contains only the backend JWT and is set with `HttpOnly`, `SameSite=Strict`, `Path=/dashboard`, expiry/max-age derived from the earlier of backend `expiresOn` and JWT `exp`, and `Secure` in production. Cookie deletion uses the same scope/attributes and zero max-age. Tokens above 3,500 bytes are rejected with a server-session-store recommendation rather than truncated; this leaves headroom below the usual 4 KiB cookie cap.

| Route | Behavior |
| --- | --- |
| `POST /dashboard/api/session/login` | Same-origin check; bounded credentials JSON; server calls the unchanged backend login; verifies allowed response role, JWT claims/expiry, and matching identity; returns only `{user, expiresOn}` |
| `GET /dashboard/api/session` | Reads the httpOnly cookie, checks identity/role/expiry claims, and returns the non-sensitive projection or 401 |
| `POST /dashboard/api/session/logout` | Same-origin check; idempotently clears the cookie and returns 204 |
| `/dashboard/api/proxy/[...path]` | GET/POST/PUT/PATCH/DELETE handlers; fixed backend origin and validated paths; method/endpoint allowlist; server role/expiry check; server-added Authorization header |

Role and expiry are rechecked at login, GET/session, and every proxied operation. The current allowed role set is numeric 1/2, their numeric strings, SuperAdmin, Manager, and the pre-existing Admin alias. The JWT decoder accepts standard `sub`/`id`/nameidentifier identity claims, email/emailaddress/unique_name, and role or the standard .NET role URI. Missing/malformed claims and opaque tokens fail closed.

JWT signature verification remains the backend's responsibility: no backend signing key or verification configuration was supplied. Decoded claims control the session projection and proxy admission; an actual operation must still be authorized and cryptographically validated by the backend. This is the requested JWT-decoding option, not a new claim that unsigned client data is authoritative.

The client store has only in-memory user, expiry, status, and navigation state. It has no token or persistence middleware. Dashboard startup deletes the old `lapis-auth` entry. Session checks are deduplicated, stale startup responses cannot overwrite a new login, and protected content is not mounted until the check succeeds. Expiry clears the client session; backend 401 clears the cookie and returns the user to login. Logout clears query data and replaces the login destination.

### Proxy controls

- The allowlist is generated from `dashboard/api/proxy-policy.ts`, which derives endpoint strings from feature constants. See `dashboard-proxy-allowlist.md`; authentication endpoints cannot be relayed through the general proxy.
- URL construction rejects empty/dot segments, percent-encoded leftovers, slashes/backslashes, controls, URL delimiters and origin/prefix changes. Only the configured origin's `/api/` tree is reachable.
- Mutations, including login/logout, require same-origin Origin or a same-origin Referer fallback. Client forwarded-host headers do not widen the trusted origin.
- Only Content-Type, Accept, Accept-Language, and timezone may be forwarded. Client Authorization, Cookie, Host, forwarded headers, hop-by-hop headers, upstream Set-Cookie, and upstream secret headers are not forwarded. The server supplies the bearer credential.
- API JSON/status bodies are preserved; non-JSON upstream error documents are served as plain text to prevent active HTML on the application origin. Responses are no-store. Redirects are not followed upstream.
- Request bodies stream using Node fetch's `duplex: "half"`. The limiter retains only bounded multipart header/tail data, counts actual file content, accepts exactly 4 MiB plus bounded multipart framing, and aborts one byte over. JSON proxy bodies are also capped at 4 MiB; credential JSON is capped at 16 KiB.
- Upstream requests and response reading have a 30-second timeout, returning 504 on expiry. API responses are buffered so a response-body timeout can still return a complete error; upload request bodies are not accumulated.
- `proxy.ts` is implemented with a tight `/dashboard/:path*` matcher, excluding login, API paths and assets. Missing-cookie page navigations redirect before protected shell delivery. It is only an extra presence gate; server and client validation remain necessary.
- Dashboard-only headers retain noindex and add `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and `Referrer-Policy: same-origin`. Public routes receive none of these new headers or a CSP.

## 5. User-visible behavior changes

**The file limit is now 4 MiB (4,194,304 bytes), reduced from 5 MiB.** The client Arabic validation shows the shared limit; the proxy rejects oversize uploads with 413. Multipart framing is bounded separately so an exact-limit file is accepted. A host's total-body limit must still accommodate framing overhead.

Existing users log in again: legacy browser-stored tokens are deleted rather than migrated. Login/refresh now waits for a server session check. API calls use the website origin, so browser API CORS is no longer required. Public image URLs remain on the API uploads host.

Confirmed logout additionally performs a full-document replacement after `router.replace`. Production testing exposed Next 16 restoring a cached login payload's old query on client-only navigation after the Route Handler cleared the cookie. The document replacement clears that Router Cache and all authenticated client state and consistently ends at exactly `/dashboard/login`.

Successful content/settings edits now expire their public data tags immediately. The next public request fetches fresh data; the existing 60-second revalidation interval remains the fallback. Specialist changes also expire blog data containing the nested specialist.

## 6. Verification and gate evidence

### Baseline

Lint passed with zero errors and 11 existing warnings; TypeScript passed; production build passed. The auth suite was **4/5**, not the expected 5/5: the current helper already allowed `Admin` while the old test rejected it. The helper allowance was preserved and the test aligned. The obsolete localStorage/JWT-recovery test was later removed with that code, as requested.

### Gate A — PASS

Six sanitizer tests pass, covering executable-element removal, URL/control/entity tricks, malicious image URLs, event/style/class attributes, target/rel hardening, malformed/unclosed HTML, benign StarterKit elements/Arabic/entities, and empty inputs. A browser comparison found identical content-wrapper DOM for the benign sample; sanitized XSS stayed inert. The build passed with server-only enforcement. Inventory found only the two mapped blog HTML sinks plus the untouched escaped JSON-LD scripts; no other unsafe public sink was found.

### Gate B — PASS

Verified against a temporary Node mock backend using the app's real server routes, never browser-only API interception. Both development and production builds were exercised.

| Requirement | Evidence/result |
| --- | --- |
| Token isolation | Login JSON has only user/expiry; no token in local/session storage; seeded legacy key deleted; document.cookie cannot expose the admin cookie |
| Cookie flags | Browser cookie inspector confirmed httpOnly, Strict, `/dashboard`, expiry, and Secure in production |
| Network isolation | Browser API traffic stayed same-origin with no Authorization header; mock backend observed valid server-added bearer credentials and no forwarded browser cookies |
| Public path scope | Populated cookie jar omitted the admin cookie on `/` and `/blog` |
| Authentication | Anonymous deep-link gate, wrong credentials, non-admin/expired login, refresh, invalid/expired claims, backend 401 deletion/redirect, safe return paths, and confirmed logout/protected re-entry passed |
| CSRF | Missing/forged origins failed for login/logout and POST/PUT/DELETE proxy operations; same-origin and Referer fallback are covered |
| Relay restrictions | Traversal/encoded delimiters, absolute URL forms, unknown endpoints, disallowed methods, forged Authorization/forwarded headers, Cookie stripping, and upstream Set-Cookie stripping passed |
| Size/timeout | Oversize request returned 413; exact-limit file and one-byte-over tested; delayed upstream returned 504 after 30 seconds |
| Features | JSON list/create/update/delete and multipart uploads passed through the real proxy; expanded feature checks cover every resource |
| Build shape | Four new API routes are dynamic; dashboard pages still build as static guarded shells; every public route/type is unchanged |

Production logout was tested separately after fixing the Router Cache issue, including the sequence of four unsafe return URLs followed by logout, actual cookie disappearance, and a subsequent protected-page 307. It passed. Network/resource-error console messages for intentionally generated 401/403/413/504 responses are expected; no JavaScript/hydration error was found in the normal feature flows.

### Gate C — PASS

Used `revalidateTag(tag, { expire: 0 })`, the documented immediate-expiration option for Route Handlers. `updateTag` is Server-Action-only; `max` would intentionally serve a stale result once. No cacheComponents/cacheLife configuration or public rendering mode was changed.

Production mock evidence: two unchanged `/services` requests kept the anonymous upstream services-read count at **18 → 18** and had identical rendered `<main>` output. After a successful proxied mutation, the very next public request increased that count to **20** and the embedded service data version advanced **72 → 73**. A settings mutation removed the services navigation link on the next public request; it was then restored in the mock. Expiration is based only on a matched server policy after a 2xx non-GET result. Tags are additive to the public fetch options and the build passes.

### Gate D and final checks — PASS

- All **23** feature checks pass through the server proxy: services, FAQs, specialists, testimonials, gallery, YouTube galleries, blog posts, and settings. They cover lists/filters/pagination, validated create/edit/delete with confirmation, uploads/previews where applicable, both rich-text editors, specialist selection, settings editing, and mobile table/sidebar behavior.
- Five targeted browser scenarios pass: accessible dialog title and number-input blur on wheel; decimal inputMode; custom rowIdKey selection/deselection callbacks and pagination; mobile hydration/open-close; and benign DOM/XSS behavior.
- Auth tests **4/4**, sanitizer tests **6/6**, proxy/session/body-limit tests **7/7**: **17 passing tests** total.
- Final lint: **zero errors, 11 warnings**, matching the baseline warning count. TypeScript: zero errors. Production build: successful. No blanket suppressions were added.
- Source checks find no browser token handling, JWT recovery, auth persistence/rehydration, old router/build-environment syntax, token logging, public auth imports, temporary test route, or test backend URL. The only active old credential-key reference deletes it. Table/preferences storage remains non-sensitive.
- The metadataBase now uses the existing `siteUrl`. Public layout/pages and JSON-LD source were untouched by hardening. Security headers are restricted to dashboard paths. No CSP or public redirect was introduced.
- Nonfatal existing build notices about fallback metadataBase and Node module registration remain. The previous Node localStorage probing warning disappears with auth persistence removal.

Detailed check results are saved in `hardening-verification.json`. The only retained browser tooling is outside the repository; the mock backend and mock-configured application processes are stopped after verification. Final build output uses the real `.env` configuration, not the test backend. A real-environment preview is available on the local production server.

## 7. Assumptions and deviations

- Preserved the existing `Admin` alias rather than removing a pre-existing authorization choice. Confirm the actual production role representation.
- Chose server-side JWT claim decoding, with no second metadata cookie or new secret. Tokens must have supported identity/email/role/expiry claims and fit the conservative cookie cap. Opaque/missing-claim/oversize tokens require a server-side session-store design rather than insecure fallback storage.
- Offset-free API expiry is UTC; the shared parser retains that behavior. Login uses the earlier expiry when the response and JWT differ.
- The mock backend had to tolerate intentionally aborted upload streams; the test client timeout was set above the app's 30-second limit. Neither adjustment changed production limits.
- Production logout deliberately finishes with a document replacement to discard Next's cached login payload. The plain `router.replace` call remains, and the resulting URL/confirmation UX is unchanged.
- No font mock was needed. No additional server-only dependency was installed because Next handles the marker internally.
- Exact real-admin login and JWT claim compatibility remain unverified: real credentials were expressly excluded. Public API reads and sanitizer comparisons were real; mutations/authentication were mock-only.

## 8. Remaining risks and deployment follow-ups

1. Confirm a real admin JWT's role and identity claim names, signature verification, token size, and expiry alignment. The backend must reject invalid and non-admin tokens on every protected operation. Supply verification-key configuration in a separate task if independent JWT verification in Next is desired.
2. Confirm the host allows a 4 MiB file plus multipart framing and a 30-second function duration. Next streams the request; a hosting platform may still apply a lower total-body limit before the handler runs.
3. Use HTTPS in production. Confirm the reverse proxy presents the correct request origin for same-origin mutation checks.
4. Rotate/revoke existing admin sessions after deployment: older tokens previously lived in browser storage, and cleanup occurs when users next load the dashboard. Merely changing storage does not revoke an already copied backend token.
5. The server proxy removes the need for browser CORS on admin API calls. If no other client needs it, remove the old standalone dashboard origin from the backend CORS allowance.
6. httpOnly cookies prevent token reads; they do not make same-origin XSS harmless. Keep server sanitization and backend authorization, and consider a public-site CSP as a separate task.
7. Stateless logout removes the browser cookie but does not revoke the underlying backend token; no backend logout/revocation contract was added. For opaque/large tokens or central revocation, use a server-side session store.
