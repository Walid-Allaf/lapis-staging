# Content authorization matrix

Phase 4, 2026-11-11. These are **INFERRED least-privilege replacement policies**, except that successful anonymous reads and protected legacy 401 responses were observed as identified below. Swagger globally declares Bearer even on proven anonymous endpoints. The isolated API follows the observed public exceptions without altering existing dashboard authentication.

| Policy | Operations | Anonymous | Signed User | Canonical Manager | Canonical SuperAdmin |
| --- | --- | --- | --- | --- | --- |
| P | Seven content get-all/get-by-id; BlogPosts/by-slug (15 GETs) | Active public view | Same public view | Administrative view | Administrative view |
| P | Client/get-settings, Client/get-ads (2 GETs) | Public projection | Public projection | Public projection | Public projection |
| A | Seven add/edit/delete groups (21 writes) | 401 | 403 | Allowed | Allowed |
| A | Setting/get, Setting/get-statistic, Ads/get (3 GETs) | 401 | 403 | Allowed | Allowed |
| A | Setting/edit, Ads/edit (2 writes) | 401 | 403 | Allowed | Allowed |

Total 17 public reads + 26 administrative operations = 43. Manager requires SQL RoleCode `manager` and string ContractValue `Manager`; SuperAdmin requires `superadmin`/`SuperAdmin`. Numeric or inconsistent presentation roles never confer permission. Phase 3 still reserves user administration to SuperAdmin; content Manager does not gain User/get-all access.

All supplied tokens use existing JOSE signed verification, configured issuer/audience/key/expiry and the SQL-backed current session/user/role checks. Disabled users, revoked/expired sessions and invalid signatures fail 401. A malformed or invalid token on a public route fails 401 instead of silently downgrading to anonymous. No cookie decoder or unverified payload establishes identity. Anonymous public reads do not need JWT configuration loaded.

Public content requires IsActive=1 and public blogs also Status=0. Requesting IsActive=false or Status=1/2 does not bypass that scope. Hidden detail/slug is 404. The nested inactive blog specialist is null publicly; admins may see it. Exact historical inactive/status/role behavior remains UNKNOWN.

Authorization occurs in the service as well as HTTP boundary so internal callers cannot bypass it. Authenticated operations acquire the existing auth state application lock before the content state lock; JWT and SQL authorization then remain consistent with concurrent disable/password changes. Content read/write locks and the actual SQL work share one serializable transaction. Successful mutations record existing security events without raw bearer tokens or content bodies.

Tests exercise anonymous, User, Manager and SuperAdmin policies, invalid Bearer, actual Phase 3 login tokens and unchanged SuperAdmin user-management restrictions. See [CONTENT_COMPATIBILITY_TESTS](CONTENT_COMPATIBILITY_TESTS.md). Original successful administrative roles were not probed against legacy.
