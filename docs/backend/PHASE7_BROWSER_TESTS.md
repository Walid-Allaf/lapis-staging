# Phase7 actual browser evidence — revalidated 2026-11-12

**PASS correction run:21/21 child scenarios,22 including the parent,0fail/skip.** Playwright1.65.0 launches installed Chrome157.0.8103.51 headless, not a mocked DOM/Route Handler adapter. The prior failure remains preserved in [historical November11 evidence](evidence/phase7-browser.json). Current evidence is in [correction results](evidence/phase7-corrections/test-counts.json), [browser JSON](evidence/phase7-corrections/browser.json) and [mobile matrix](evidence/phase7-corrections/mobile-summary.json). No hosted site or historical content was tested.

| Browser verification | Final result / evidence |
| --- | --- |
| Fresh initialization/bootstrap |PASS actual private CLI processes, secure synthetic operator input in memory, no password printed, then real dashboard login |
| Empty public content |PASS ar/en home/services/about/blog/gallery/youtube-videos/contact200; HTML lang/dir, title/description, sitemap; seven public lists[] |
| Login/session |PASS invalid password401, valid login200, no JWT in JSON, Secure/HttpOnly/Strict cookie, refresh restoration |
| Protected access |PASS anonymous dashboard redirect and direct proxy401, logged-out session401 |
| Services |PASS empty table, create/read/edit/delete through unchanged form/confirmation, UI image upload/preview |
| FAQs |PASS create/read/edit/delete through unchanged form/table |
| Specialists |PASS create/read/edit/delete; created first specialist selected by blog UI |
| Testimonials |PASS create/read/edit/delete |
| Galleries |PASS create/read/edit/delete; before/after file inputs upload real images |
| YouTubeGalleries |PASS create/read/edit/delete; existing Arabic-only displayed title accounted for by changing both language fields |
| BlogPosts |PASS create/read/edit/delete, actual specialist autocomplete, unlocked Arabic/English Tiptap editors, image upload |
| Settings/cache |PASS first settings saved through UI, public contact/service immediately show actual SQL changes |
| Public images |PASS rendered browser image with nonzero naturalWidth, original bytes/hash-equivalence, Next optimizer also covered by HTTP suite |
| Restart |PASS complete Next process stop/start; original bytes/ETag304/Range206 and browser cookie session retained |
| Logout |PASS menu and confirmation UI, HTTP204, protected page redirect/session401 |
| Legacy isolation |PASS Node fetch/http/https/DNS blocker plus browser interception,0observed attempts during successful run |
| Browser exceptions |PASS0 pageerror events |
| Mobile |PASS320/375/390/414/430px, Arabic/English, repeated direct/client navigation, language change and scrolling; all document widths equal viewport; see correction below |

Desktop viewport1440×1000. Browser fixtures exist only in new disposable SQL/private temp media. Successful runs delete all seven created business records through the real UI; file lifecycle/orphans are not silently garbage-collected. No public migration/bootstrap/test-mail/debug endpoint was added. API-only regressions complement this browser coverage for disabled/expired/tampered sessions, Manager/User authorization, password changes, CSRF, OTP and exact-limit/signature upload failures.

**PASS confirmed correction:** the original defect was reproduced up to485px at390px, and the cause was isolated to persistent offscreen AOS translateX offsets in **both** welcome and smile sections. Removing only welcome transforms in the diagnostic still left484px; removing both returned390px. This was a genuine scroll-area defect while below-fold elements waited to animate, rather than a timer to ignore. The owner explicitly authorized this minimal frontend exception. Only site globals.css changed: local horizontal clipping on the two section containers preserves final gradients/real content; a narrow hero highlighted-phrase wrapping correction prevents real text clipping at320px; reduced-motion CSS reveals AOS content without movement. No global overflow hiding, relaxed assertion, AOS initializer rewrite or unrelated UI change was made.

Three repeated matrix rounds cover30mobile cases and6desktop cases/360snapshots. Strict width equality and zero horizontal scroll are checked before/in/after animation, client navigation, both language directions, positive/negative scroll attempts and fresh reduced-motion reloads. Visible text ranges, welcome image dimensions/position and both real AOS element opacities/classes pass. Desktop1440px geometry matches the original. See [confirmed cause, measurements, exact changes and screenshots](PHASE7_MOBILE_CORRECTION.md). Historical evidence is retained unchanged; its FAIL was not relabeled PASS.

The original21 scenarios still drive unchanged forms/CRUD/session interfaces. Tests now require exact document-width equality instead of the previous two-pixel allowance and capture React hydration console errors as well as page exceptions. The only frontend change is the explicitly authorized CSS correction; no API behavior was rewritten to satisfy tests.

**NOT TESTED:** real hosted HTTPS/forwarding/IIS/body limits/redeploy, mobile physical devices/Safari/Firefox, real SMTP delivery, production browser credentials, and host-specific resource/persistence/restore behavior. Local Secure-cookie loopback behavior is not a real-domain HTTPS certificate test.
