> Phase6 current integration,2026-11-11:56 original operations are implemented and internally integrated; toggle-2fa remains blocked501. Frozen website/dashboard consumers use direct internal transport and the unchanged39-rule proxy. New signed SQL session/logout/cache/media adapters passed production HTTP with legacy blocked. Historical success semantics remain classified by evidence, not by this integration status. See [PHASE6_FULL_INTEGRATION](PHASE6_FULL_INTEGRATION.md), [CUTOVER_COMPATIBILITY_REPORT](CUTOVER_COMPATIBILITY_REPORT.md) and [END_TO_END_TEST_REPORT](END_TO_END_TEST_REPORT.md). No production cutover/deployment or data import occurred.

# مصفوفة توافق API — سجل المصادر وحالة Phase 4

تاريخ التدقيق: 2026-11-11. المصدر: `../../swagger.json` من جذر docs/backend (أي [swagger.json](../../swagger.json)). OpenAPI 3.0.1؛ **57 عملية / 57 path / 13 module**. بصمة SHA-256: `b5d3055716c7c485591fedfa7edd5e51f14b09b4afd16cabb8c25411f8b1072e`. هذه لقطة مصادر Phase1 مع تحديث حالة Auth/User في Phase3 والمحتوى في Phase4؛ الواجهة والاتصال القائم بـASP.NET لم يتغيرا.


تحديث Phase3: [التقرير](PHASE3_AUTHENTICATION.md)، [العقود](AUTH_API_CONTRACTS.md)، [التفويض](AUTHORIZATION_MATRIX.md). source/test evidence لا يغير تصنيف الأصل UNKNOWN؛ لا عيناتAuth/User legacy ولاcutover.

## قراءة التصنيفات

- DOCUMENTED_IN_OPENAPI: مسار/طلب موثق، لا دليل استجابة؛ جميع responses هي `200: Success` دون content/schema.
- VERIFIED_FROM_FRONTEND: حقل أو استهلاك مثبت من source، وليس إثباتًا أن legacy يرسله.
- VERIFIED_FROM_LEGACY_RESPONSE: رصد GET آمن بتاريخ التدقيق، محصور في ما ظهر.
- INFERRED: تصميم أو سياسة مقترحة، لا تُنسب للأصل. UNKNOWN: لم يمكن إثباتها.

حالة Phase5: 56 عملية منفذة معزولة (12 Auth/User + 43 content + FileUpload)، وtoggle-2fa محظورة. الرفع والتقديم المحلي موثقان في [FILE_API_CONTRACT](FILE_API_CONTRACT.md)، دون ادعاء استجابة legacy أو استمرار بعد نشر المضيف. جميع 43 content اختُبرت على SQL فعلي وHTTP إنتاجي محلي؛ سياسات الأصل غير المرصودة تبقى UNKNOWN. انظر [عقود المحتوى](CONTENT_API_CONTRACTS.md) و[اختباراته](CONTENT_COMPATIBILITY_TESTS.md). رموز R وU أدناه تبقى سجل الأدلة التاريخية.

فجوة الأخطاء المشتركة U17 تنطبق عند تصميم failure response لكل عملية: error object مرصود في GET failures، بينما الواجهة تتوقع string أو message علويًا. لا يعني ذلك أن كل original failure غير المفحوص يملك الشكل نفسه.

## قواعد الطلب العامة

`Accept-Language` header string اختياري في كل العمليات؛ الوصف يذكر `ar,en,ku` دون enum إجباري أو fallback موثق. `Authorization: Bearer …` موروث عالميًا في Swagger دون استثناءات؛ سلوك التشغيل العام مختلف كما هو موضح لكل عملية. أجسام JSON تقبل media types الثلاثة `application/json`, `text/json`, `application/*+json`. كل requestBody لا يحمل `required:true`؛ عدم وجود required للخاصية يختلف عن nullable. لا تُستنتج قواعد FluentValidation/CLR default من غيابها في الملف. `timezone` يرسله dashboard لكنه غير موثق. أسماء query المنقطة حرفية ولا تُحوّل إلى بنية JSON.

## فهرس العمليات

| ID | Method | Path | مستهلك قائم | حالة التنفيذ / الاختبار |
| --- | --- | --- | --- | --- |
| OP-01 | GET | `/api/Ads/get` | لا | IMPLEMENTED_INTERNAL_NEW_POLICY / UNIT_SQL_HTTP_TESTED |
| OP-02 | PUT | `/api/Ads/edit` | لا | IMPLEMENTED_INTERNAL_NEW_POLICY / UNIT_SQL_HTTP_TESTED |
| OP-03 | POST | `/api/auth/register` | لا | IMPLEMENTED_INTERNAL_NEW_POLICY / UNIT_SQL_HTTP_TESTED |
| OP-04 | POST | `/api/auth/login` | نعم | IMPLEMENTED_INTERNAL_NEW_POLICY / UNIT_SQL_HTTP_TESTED |
| OP-05 | POST | `/api/auth/confirm-email` | لا | IMPLEMENTED_INTERNAL_NEW_POLICY / UNIT_SQL_HTTP_TESTED |
| OP-06 | POST | `/api/auth/reset-password` | لا | IMPLEMENTED_INTERNAL_NEW_POLICY / UNIT_SQL_HTTP_TESTED |
| OP-07 | POST | `/api/auth/send-otp` | لا | IMPLEMENTED_INTERNAL_NEW_POLICY / UNIT_SQL_HTTP_TESTED |
| OP-08 | POST | `/api/auth/verify-otp` | لا | IMPLEMENTED_INTERNAL_NEW_POLICY / UNIT_SQL_HTTP_TESTED |
| OP-09 | POST | `/api/auth/toggle-2fa` | لا | BLOCKED_2FA_PUBLIC_WORKFLOW / REFUSAL_TESTED |
| OP-10 | POST | `/api/BlogPosts/add` | نعم | IMPLEMENTED_INTERNAL_NEW_POLICY / UNIT_SQL_HTTP_TESTED |
| OP-11 | GET | `/api/BlogPosts/get-all` | نعم | IMPLEMENTED_INTERNAL_NEW_POLICY / UNIT_SQL_HTTP_TESTED |
| OP-12 | GET | `/api/BlogPosts/get-by-id/{id}` | نعم | IMPLEMENTED_INTERNAL_NEW_POLICY / UNIT_SQL_HTTP_TESTED |
| OP-13 | GET | `/api/BlogPosts/by-slug/{slug}` | نعم | IMPLEMENTED_INTERNAL_NEW_POLICY / UNIT_SQL_HTTP_TESTED |
| OP-14 | PUT | `/api/BlogPosts/edit/{id}` | نعم | IMPLEMENTED_INTERNAL_NEW_POLICY / UNIT_SQL_HTTP_TESTED |
| OP-15 | DELETE | `/api/BlogPosts/delete/{id}` | نعم | IMPLEMENTED_INTERNAL_NEW_POLICY / UNIT_SQL_HTTP_TESTED |
| OP-16 | GET | `/api/Client/get-ads` | لا | IMPLEMENTED_INTERNAL_NEW_POLICY / UNIT_SQL_HTTP_TESTED |
| OP-17 | GET | `/api/Client/get-settings` | نعم | IMPLEMENTED_INTERNAL_NEW_POLICY / UNIT_SQL_HTTP_TESTED |
| OP-18 | POST | `/api/FAQs/add` | نعم | IMPLEMENTED_INTERNAL_NEW_POLICY / UNIT_SQL_HTTP_TESTED |
| OP-19 | GET | `/api/FAQs/get-all` | نعم | IMPLEMENTED_INTERNAL_NEW_POLICY / UNIT_SQL_HTTP_TESTED |
| OP-20 | GET | `/api/FAQs/get-by-id/{id}` | نعم | IMPLEMENTED_INTERNAL_NEW_POLICY / UNIT_SQL_HTTP_TESTED |
| OP-21 | PUT | `/api/FAQs/edit/{id}` | نعم | IMPLEMENTED_INTERNAL_NEW_POLICY / UNIT_SQL_HTTP_TESTED |
| OP-22 | DELETE | `/api/FAQs/delete/{id}` | نعم | IMPLEMENTED_INTERNAL_NEW_POLICY / UNIT_SQL_HTTP_TESTED |
| OP-23 | POST | `/api/FileUpload/upload` | نعم | IMPLEMENTED_INTERNAL_NEW_POLICY / UNIT_SQL_HTTP_RESTART_TESTED |
| OP-24 | POST | `/api/Galleries/add` | نعم | IMPLEMENTED_INTERNAL_NEW_POLICY / UNIT_SQL_HTTP_TESTED |
| OP-25 | GET | `/api/Galleries/get-all` | نعم | IMPLEMENTED_INTERNAL_NEW_POLICY / UNIT_SQL_HTTP_TESTED |
| OP-26 | GET | `/api/Galleries/get-by-id/{id}` | نعم | IMPLEMENTED_INTERNAL_NEW_POLICY / UNIT_SQL_HTTP_TESTED |
| OP-27 | PUT | `/api/Galleries/edit/{id}` | نعم | IMPLEMENTED_INTERNAL_NEW_POLICY / UNIT_SQL_HTTP_TESTED |
| OP-28 | DELETE | `/api/Galleries/delete/{id}` | نعم | IMPLEMENTED_INTERNAL_NEW_POLICY / UNIT_SQL_HTTP_TESTED |
| OP-29 | POST | `/api/OurSpecialists/add` | نعم | IMPLEMENTED_INTERNAL_NEW_POLICY / UNIT_SQL_HTTP_TESTED |
| OP-30 | GET | `/api/OurSpecialists/get-all` | نعم | IMPLEMENTED_INTERNAL_NEW_POLICY / UNIT_SQL_HTTP_TESTED |
| OP-31 | GET | `/api/OurSpecialists/get-by-id/{id}` | نعم | IMPLEMENTED_INTERNAL_NEW_POLICY / UNIT_SQL_HTTP_TESTED |
| OP-32 | PUT | `/api/OurSpecialists/edit/{id}` | نعم | IMPLEMENTED_INTERNAL_NEW_POLICY / UNIT_SQL_HTTP_TESTED |
| OP-33 | DELETE | `/api/OurSpecialists/delete/{id}` | نعم | IMPLEMENTED_INTERNAL_NEW_POLICY / UNIT_SQL_HTTP_TESTED |
| OP-34 | POST | `/api/Services/add` | نعم | IMPLEMENTED_INTERNAL_NEW_POLICY / UNIT_SQL_HTTP_TESTED |
| OP-35 | GET | `/api/Services/get-all` | نعم | IMPLEMENTED_INTERNAL_NEW_POLICY / UNIT_SQL_HTTP_TESTED |
| OP-36 | GET | `/api/Services/get-by-id/{id}` | نعم | IMPLEMENTED_INTERNAL_NEW_POLICY / UNIT_SQL_HTTP_TESTED |
| OP-37 | PUT | `/api/Services/edit/{id}` | نعم | IMPLEMENTED_INTERNAL_NEW_POLICY / UNIT_SQL_HTTP_TESTED |
| OP-38 | DELETE | `/api/Services/delete/{id}` | نعم | IMPLEMENTED_INTERNAL_NEW_POLICY / UNIT_SQL_HTTP_TESTED |
| OP-39 | GET | `/api/Setting/get` | نعم | IMPLEMENTED_INTERNAL_NEW_POLICY / UNIT_SQL_HTTP_TESTED |
| OP-40 | GET | `/api/Setting/get-statistic` | لا | IMPLEMENTED_INTERNAL_NEW_POLICY / UNIT_SQL_HTTP_TESTED |
| OP-41 | PUT | `/api/Setting/edit` | نعم | IMPLEMENTED_INTERNAL_NEW_POLICY / UNIT_SQL_HTTP_TESTED |
| OP-42 | POST | `/api/Testimonials/add` | نعم | IMPLEMENTED_INTERNAL_NEW_POLICY / UNIT_SQL_HTTP_TESTED |
| OP-43 | GET | `/api/Testimonials/get-all` | نعم | IMPLEMENTED_INTERNAL_NEW_POLICY / UNIT_SQL_HTTP_TESTED |
| OP-44 | GET | `/api/Testimonials/get-by-id/{id}` | نعم | IMPLEMENTED_INTERNAL_NEW_POLICY / UNIT_SQL_HTTP_TESTED |
| OP-45 | PUT | `/api/Testimonials/edit/{id}` | نعم | IMPLEMENTED_INTERNAL_NEW_POLICY / UNIT_SQL_HTTP_TESTED |
| OP-46 | DELETE | `/api/Testimonials/delete/{id}` | نعم | IMPLEMENTED_INTERNAL_NEW_POLICY / UNIT_SQL_HTTP_TESTED |
| OP-47 | GET | `/api/User/get-all` | لا | IMPLEMENTED_INTERNAL_NEW_POLICY / UNIT_SQL_HTTP_TESTED |
| OP-48 | GET | `/api/User/get-by-id/{id}` | لا | IMPLEMENTED_INTERNAL_NEW_POLICY / UNIT_SQL_HTTP_TESTED |
| OP-49 | POST | `/api/User/change-password` | لا | IMPLEMENTED_INTERNAL_NEW_POLICY / UNIT_SQL_HTTP_TESTED |
| OP-50 | PUT | `/api/User/edit-profile` | لا | IMPLEMENTED_INTERNAL_NEW_POLICY / UNIT_SQL_HTTP_TESTED |
| OP-51 | GET | `/api/User/get-info` | لا | IMPLEMENTED_INTERNAL_NEW_POLICY / UNIT_SQL_HTTP_TESTED |
| OP-52 | POST | `/api/User/toggle-disable` | لا | IMPLEMENTED_INTERNAL_NEW_POLICY / UNIT_SQL_HTTP_TESTED |
| OP-53 | POST | `/api/YouTubeGalleries/add` | نعم | IMPLEMENTED_INTERNAL_NEW_POLICY / UNIT_SQL_HTTP_TESTED |
| OP-54 | GET | `/api/YouTubeGalleries/get-all` | نعم | IMPLEMENTED_INTERNAL_NEW_POLICY / UNIT_SQL_HTTP_TESTED |
| OP-55 | GET | `/api/YouTubeGalleries/get-by-id/{id}` | نعم | IMPLEMENTED_INTERNAL_NEW_POLICY / UNIT_SQL_HTTP_TESTED |
| OP-56 | PUT | `/api/YouTubeGalleries/edit/{id}` | نعم | IMPLEMENTED_INTERNAL_NEW_POLICY / UNIT_SQL_HTTP_TESTED |
| OP-57 | DELETE | `/api/YouTubeGalleries/delete/{id}` | نعم | IMPLEMENTED_INTERNAL_NEW_POLICY / UNIT_SQL_HTTP_TESTED |

## OP-01 — GET /api/Ads/get

| الحقل | النتيجة |
| --- | --- |
| 1. Method / path | `GET /api/Ads/get` |
| 2. Parameters | لا path/query params؛ header اللغة العام فقط |
| 3. Body schema | لا requestBody موثق |
| 4. Required / nullable | لا حقول required موثقة؛ nullability والقيود الدقيقة في ملحق schemas أدناه |
| 5. Expected response | UNKNOWN: لا يوجد مستهلك يثبت استجابة النجاح.; Phase4 implementation: [CONTENT_API_CONTRACTS](CONTENT_API_CONTRACTS.md), new success contract INFERRED, legacy UNKNOWN. |
| 6. Authentication | Phase4 signed JWT and current SQL-backed session required; original Swagger global Bearer retained as historical evidence. |
| 7. Roles / access | A: canonical Manager/SuperAdmin only; User 403; INFERRED scope policy. [Matrix](CONTENT_AUTHORIZATION_MATRIX.md). |
| 8. Frontend consumers | لا يوجد مستهلك runtime في التطبيق الحالي؛ ليس مبررًا لحذف العملية |
| 9. Proposed entities | Ads, Files؛ INFERRED، وليست schema أصلية مستخرجة |
| 10. Evidence | DOCUMENTED_IN_OPENAPI (طلب فقط); VERIFIED_FROM_LEGACY_RESPONSE (401 فقط); Swagger JSON pointer: `#/paths/~1api~1Ads~1get/get` |
| 11. Unknown behavior | U01, U12, U06, U13, U22–U27; historical U12 nonimplementation snapshot superseded. |
| 12. Implementation status | IMPLEMENTED_INTERNAL_NEW_POLICY — SQL-backed, Phase6 internal server-adapter cutover; frozen frontend source; no claim of complete legacy parity. |
| 13. Contract test status | UNIT + REAL_SQL_INTEGRATION + LOCAL_PRODUCTION_HTTP PASS; legacy observation scope and differences documented per operation in CONTENT_API_CONTRACTS. |

## OP-02 — PUT /api/Ads/edit

| الحقل | النتيجة |
| --- | --- |
| 1. Method / path | `PUT /api/Ads/edit` |
| 2. Parameters | لا path/query params؛ header اللغة العام فقط |
| 3. Body schema | [AdsUpdateCommand](#schema-adsupdatecommand)؛ JSON body اختياري وفق OpenAPI |
| 4. Required / nullable | لا حقول required موثقة؛ nullability والقيود الدقيقة في ملحق schemas أدناه |
| 5. Expected response | UNKNOWN: لا يوجد مستهلك يثبت استجابة النجاح.; Phase4 implementation: [CONTENT_API_CONTRACTS](CONTENT_API_CONTRACTS.md), new success contract INFERRED, legacy UNKNOWN. |
| 6. Authentication | Phase4 signed JWT and current SQL-backed session required; original Swagger global Bearer retained as historical evidence. |
| 7. Roles / access | A: canonical Manager/SuperAdmin only; User 403; INFERRED scope policy. [Matrix](CONTENT_AUTHORIZATION_MATRIX.md). |
| 8. Frontend consumers | لا يوجد مستهلك runtime في التطبيق الحالي؛ ليس مبررًا لحذف العملية |
| 9. Proposed entities | Ads, Files؛ INFERRED، وليست schema أصلية مستخرجة |
| 10. Evidence | DOCUMENTED_IN_OPENAPI (طلب فقط); Swagger JSON pointer: `#/paths/~1api~1Ads~1edit/put` |
| 11. Unknown behavior | U01, U12, U06, U13, U22–U27; historical U12 nonimplementation snapshot superseded. |
| 12. Implementation status | IMPLEMENTED_INTERNAL_NEW_POLICY — SQL-backed, Phase6 internal server-adapter cutover; frozen frontend source; no claim of complete legacy parity. |
| 13. Contract test status | UNIT + REAL_SQL_INTEGRATION + LOCAL_PRODUCTION_HTTP PASS; legacy observation scope and differences documented per operation in CONTENT_API_CONTRACTS. |

## OP-03 — POST /api/auth/register

| الحقل | النتيجة |
| --- | --- |
| 1. Method / path | `POST /api/auth/register` |
| 2. Parameters | لا path/query params؛ header اللغة العام فقط |
| 3. Body schema | [RegisterRequest](#schema-registerrequest)؛ JSON body اختياري وفق OpenAPI |
| 4. Required / nullable | body.email, body.firstName, body.lastName, body.password, body.phoneNumber؛ nullability والقيود الدقيقة في ملحق schemas أدناه |
| 5. Expected response | UNKNOWN: لا يوجد مستهلك يثبت استجابة النجاح.؛ new implementation في [AUTH_API_CONTRACTS](AUTH_API_CONTRACTS.md)، INFERRED لا VERIFIED_FROM_LEGACY_RESPONSE |
| 6. Authentication | OpenAPI: Bearer عالمي؛ لا security override لهذه العملية. انظر السلوك المرصود/المقترح في خانة الأدوار. |
| 7. Roles / access | مقترح وصول أولي عام مع ضوابط OTP/rate limits، لا إصدار JWT قبل اكتمال التحقق؛ OpenAPI يورث Bearer حتى هنا؛ U06/U11. |
| 8. Frontend consumers | لا يوجد مستهلك runtime في التطبيق الحالي؛ ليس مبررًا لحذف العملية |
| 9. Proposed entities | Users, Roles, OtpChallenges, AuthSessions, SecurityEvents؛ INFERRED، وليست schema أصلية مستخرجة |
| 10. Evidence | DOCUMENTED_IN_OPENAPI (طلب فقط); Swagger JSON pointer: `#/paths/~1api~1auth~1register/post` |
| 11. Unknown behavior | U01, U12, U11, U13, U14, U18, U19 |
| 12. Implementation status | IMPLEMENTED_INTERNAL_NEW_POLICY — SQL-backed، دونfrontend cutover؛ لا claim legacy parity |
| 13. Contract test status | UNIT + REAL_SQL_INTEGRATION + LOCAL_PRODUCTION_HTTP؛ implementation contract tested، original legacy behavior UNKNOWN |

## OP-04 — POST /api/auth/login

| الحقل | النتيجة |
| --- | --- |
| 1. Method / path | `POST /api/auth/login` |
| 2. Parameters | لا path/query params؛ header اللغة العام فقط |
| 3. Body schema | [LoginRequest](#schema-loginrequest)؛ JSON body اختياري وفق OpenAPI |
| 4. Required / nullable | لا حقول required موثقة؛ nullability والقيود الدقيقة في ملحق schemas أدناه |
| 5. Expected response | R-LOGIN-UPSTREAM: data{id,email,role,token,expiresOn} مطلوبة بواسطة adapter؛ VERIFIED_FROM_FRONTEND فقط؛ لا توجد جلسة legacy حقيقية جرى فحصها.؛ new implementation في [AUTH_API_CONTRACTS](AUTH_API_CONTRACTS.md)، INFERRED لا VERIFIED_FROM_LEGACY_RESPONSE |
| 6. Authentication | OpenAPI: Bearer عالمي؛ لا security override لهذه العملية. انظر السلوك المرصود/المقترح في خانة الأدوار. |
| 7. Roles / access | مقترح وصول أولي عام مع ضوابط OTP/rate limits، لا إصدار JWT قبل اكتمال التحقق؛ OpenAPI يورث Bearer حتى هنا؛ U06/U11. |
| 8. Frontend consumers | `app/(dashboard)/dashboard/api/session/login/route.ts (upstream adapter)`; `dashboard/features/login/services/login-service.ts (يدعو adapter المحلي، لا هذا المسار مباشرة)` |
| 9. Proposed entities | Users, Roles, OtpChallenges, AuthSessions, SecurityEvents؛ INFERRED، وليست schema أصلية مستخرجة |
| 10. Evidence | DOCUMENTED_IN_OPENAPI (طلب فقط); VERIFIED_FROM_FRONTEND; Swagger JSON pointer: `#/paths/~1api~1auth~1login/post` |
| 11. Unknown behavior | U01, U12, U11, U13, U14, U15, U18, U19 |
| 12. Implementation status | IMPLEMENTED_INTERNAL_NEW_POLICY — SQL-backed، دونfrontend cutover؛ لا claim legacy parity |
| 13. Contract test status | UNIT + REAL_SQL_INTEGRATION + LOCAL_PRODUCTION_HTTP؛ implementation contract tested، original legacy behavior UNKNOWN |

## OP-05 — POST /api/auth/confirm-email

| الحقل | النتيجة |
| --- | --- |
| 1. Method / path | `POST /api/auth/confirm-email` |
| 2. Parameters | لا path/query params؛ header اللغة العام فقط |
| 3. Body schema | [ConfirmEmailRequest](#schema-confirmemailrequest)؛ JSON body اختياري وفق OpenAPI |
| 4. Required / nullable | لا حقول required موثقة؛ nullability والقيود الدقيقة في ملحق schemas أدناه |
| 5. Expected response | UNKNOWN: لا يوجد مستهلك يثبت استجابة النجاح.؛ new implementation في [AUTH_API_CONTRACTS](AUTH_API_CONTRACTS.md)، INFERRED لا VERIFIED_FROM_LEGACY_RESPONSE |
| 6. Authentication | OpenAPI: Bearer عالمي؛ لا security override لهذه العملية. انظر السلوك المرصود/المقترح في خانة الأدوار. |
| 7. Roles / access | مقترح وصول أولي عام مع ضوابط OTP/rate limits، لا إصدار JWT قبل اكتمال التحقق؛ OpenAPI يورث Bearer حتى هنا؛ U06/U11. |
| 8. Frontend consumers | لا يوجد مستهلك runtime في التطبيق الحالي؛ ليس مبررًا لحذف العملية |
| 9. Proposed entities | Users, Roles, OtpChallenges, AuthSessions, SecurityEvents؛ INFERRED، وليست schema أصلية مستخرجة |
| 10. Evidence | DOCUMENTED_IN_OPENAPI (طلب فقط); Swagger JSON pointer: `#/paths/~1api~1auth~1confirm-email/post` |
| 11. Unknown behavior | U01, U12, U11, U13, U14, U18, U19 |
| 12. Implementation status | IMPLEMENTED_INTERNAL_NEW_POLICY — SQL-backed، دونfrontend cutover؛ لا claim legacy parity |
| 13. Contract test status | UNIT + REAL_SQL_INTEGRATION + LOCAL_PRODUCTION_HTTP؛ implementation contract tested، original legacy behavior UNKNOWN |

## OP-06 — POST /api/auth/reset-password

| الحقل | النتيجة |
| --- | --- |
| 1. Method / path | `POST /api/auth/reset-password` |
| 2. Parameters | لا path/query params؛ header اللغة العام فقط |
| 3. Body schema | [ResetPasswordRequest](#schema-resetpasswordrequest)؛ JSON body اختياري وفق OpenAPI |
| 4. Required / nullable | body.code, body.email, body.newPassword؛ nullability والقيود الدقيقة في ملحق schemas أدناه |
| 5. Expected response | UNKNOWN: لا يوجد مستهلك يثبت استجابة النجاح.؛ new implementation في [AUTH_API_CONTRACTS](AUTH_API_CONTRACTS.md)، INFERRED لا VERIFIED_FROM_LEGACY_RESPONSE |
| 6. Authentication | OpenAPI: Bearer عالمي؛ لا security override لهذه العملية. انظر السلوك المرصود/المقترح في خانة الأدوار. |
| 7. Roles / access | مقترح وصول أولي عام مع ضوابط OTP/rate limits، لا إصدار JWT قبل اكتمال التحقق؛ OpenAPI يورث Bearer حتى هنا؛ U06/U11. |
| 8. Frontend consumers | لا يوجد مستهلك runtime في التطبيق الحالي؛ ليس مبررًا لحذف العملية |
| 9. Proposed entities | Users, Roles, OtpChallenges, AuthSessions, SecurityEvents؛ INFERRED، وليست schema أصلية مستخرجة |
| 10. Evidence | DOCUMENTED_IN_OPENAPI (طلب فقط); Swagger JSON pointer: `#/paths/~1api~1auth~1reset-password/post` |
| 11. Unknown behavior | U01, U12, U11, U13, U14, U18, U19 |
| 12. Implementation status | IMPLEMENTED_INTERNAL_NEW_POLICY — SQL-backed، دونfrontend cutover؛ لا claim legacy parity |
| 13. Contract test status | UNIT + REAL_SQL_INTEGRATION + LOCAL_PRODUCTION_HTTP؛ implementation contract tested، original legacy behavior UNKNOWN |

## OP-07 — POST /api/auth/send-otp

| الحقل | النتيجة |
| --- | --- |
| 1. Method / path | `POST /api/auth/send-otp` |
| 2. Parameters | لا path/query params؛ header اللغة العام فقط |
| 3. Body schema | [SendOtpRequest](#schema-sendotprequest)؛ JSON body اختياري وفق OpenAPI |
| 4. Required / nullable | body.email؛ nullability والقيود الدقيقة في ملحق schemas أدناه |
| 5. Expected response | UNKNOWN: لا يوجد مستهلك يثبت استجابة النجاح.؛ new implementation في [AUTH_API_CONTRACTS](AUTH_API_CONTRACTS.md)، INFERRED لا VERIFIED_FROM_LEGACY_RESPONSE |
| 6. Authentication | OpenAPI: Bearer عالمي؛ لا security override لهذه العملية. انظر السلوك المرصود/المقترح في خانة الأدوار. |
| 7. Roles / access | مقترح وصول أولي عام مع ضوابط OTP/rate limits، لا إصدار JWT قبل اكتمال التحقق؛ OpenAPI يورث Bearer حتى هنا؛ U06/U11. |
| 8. Frontend consumers | لا يوجد مستهلك runtime في التطبيق الحالي؛ ليس مبررًا لحذف العملية |
| 9. Proposed entities | Users, Roles, OtpChallenges, AuthSessions, SecurityEvents؛ INFERRED، وليست schema أصلية مستخرجة |
| 10. Evidence | DOCUMENTED_IN_OPENAPI (طلب فقط); Swagger JSON pointer: `#/paths/~1api~1auth~1send-otp/post` |
| 11. Unknown behavior | U01, U12, U11, U13, U14, U18, U19 |
| 12. Implementation status | IMPLEMENTED_INTERNAL_NEW_POLICY — SQL-backed، دونfrontend cutover؛ لا claim legacy parity |
| 13. Contract test status | UNIT + REAL_SQL_INTEGRATION + LOCAL_PRODUCTION_HTTP؛ implementation contract tested، original legacy behavior UNKNOWN |

## OP-08 — POST /api/auth/verify-otp

| الحقل | النتيجة |
| --- | --- |
| 1. Method / path | `POST /api/auth/verify-otp` |
| 2. Parameters | لا path/query params؛ header اللغة العام فقط |
| 3. Body schema | [OtpRequest](#schema-otprequest)؛ JSON body اختياري وفق OpenAPI |
| 4. Required / nullable | لا حقول required موثقة؛ nullability والقيود الدقيقة في ملحق schemas أدناه |
| 5. Expected response | UNKNOWN: لا يوجد مستهلك يثبت استجابة النجاح.؛ new implementation في [AUTH_API_CONTRACTS](AUTH_API_CONTRACTS.md)، INFERRED لا VERIFIED_FROM_LEGACY_RESPONSE |
| 6. Authentication | OpenAPI: Bearer عالمي؛ لا security override لهذه العملية. انظر السلوك المرصود/المقترح في خانة الأدوار. |
| 7. Roles / access | مقترح وصول أولي عام مع ضوابط OTP/rate limits، لا إصدار JWT قبل اكتمال التحقق؛ OpenAPI يورث Bearer حتى هنا؛ U06/U11. |
| 8. Frontend consumers | لا يوجد مستهلك runtime في التطبيق الحالي؛ ليس مبررًا لحذف العملية |
| 9. Proposed entities | Users, Roles, OtpChallenges, AuthSessions, SecurityEvents؛ INFERRED، وليست schema أصلية مستخرجة |
| 10. Evidence | DOCUMENTED_IN_OPENAPI (طلب فقط); Swagger JSON pointer: `#/paths/~1api~1auth~1verify-otp/post` |
| 11. Unknown behavior | U01, U12, U11, U13, U14, U18, U19 |
| 12. Implementation status | IMPLEMENTED_INTERNAL_NEW_POLICY — SQL-backed، دونfrontend cutover؛ لا claim legacy parity |
| 13. Contract test status | UNIT + REAL_SQL_INTEGRATION + LOCAL_PRODUCTION_HTTP؛ implementation contract tested، original legacy behavior UNKNOWN |

## OP-09 — POST /api/auth/toggle-2fa

| الحقل | النتيجة |
| --- | --- |
| 1. Method / path | `POST /api/auth/toggle-2fa` |
| 2. Parameters | لا path/query params؛ header اللغة العام فقط |
| 3. Body schema | [ToggleTwoFactorRequest](#schema-toggletwofactorrequest)؛ JSON body اختياري وفق OpenAPI |
| 4. Required / nullable | لا حقول required موثقة؛ nullability والقيود الدقيقة في ملحق schemas أدناه |
| 5. Expected response | UNKNOWN: لا يوجد مستهلك يثبت استجابة النجاح.؛ new implementation في [AUTH_API_CONTRACTS](AUTH_API_CONTRACTS.md)، INFERRED لا VERIFIED_FROM_LEGACY_RESPONSE |
| 6. Authentication | OpenAPI: Bearer عالمي؛ لا security override لهذه العملية. انظر السلوك المرصود/المقترح في خانة الأدوار. |
| 7. Roles / access | مقترح JWT متحقق للحساب نفسه؛ ليس عامًا، ولا حساب مستهدف في body. |
| 8. Frontend consumers | لا يوجد مستهلك runtime في التطبيق الحالي؛ ليس مبررًا لحذف العملية |
| 9. Proposed entities | Users, Roles, OtpChallenges, AuthSessions, SecurityEvents؛ INFERRED، وليست schema أصلية مستخرجة |
| 10. Evidence | DOCUMENTED_IN_OPENAPI (طلب فقط); Swagger JSON pointer: `#/paths/~1api~1auth~1toggle-2fa/post` |
| 11. Unknown behavior | U01, U12, U11, U13, U14, U18, U19, U20 |
| 12. Implementation status | BLOCKED_2FA_PUBLIC_WORKFLOW — authenticated501 بلاmutation؛ handler ليس تنفيذًا للتبديل |
| 13. Contract test status | UNIT + REAL_SQL_INTEGRATION + LOCAL_PRODUCTION_HTTP؛ refusal/authorization فقط؛ workflow محظور |

## OP-10 — POST /api/BlogPosts/add

| الحقل | النتيجة |
| --- | --- |
| 1. Method / path | `POST /api/BlogPosts/add` |
| 2. Parameters | لا path/query params؛ header اللغة العام فقط |
| 3. Body schema | [BlogPostsCreateCommand](#schema-blogpostscreatecommand)؛ JSON body اختياري وفق OpenAPI |
| 4. Required / nullable | لا حقول required موثقة؛ nullability والقيود الدقيقة في ملحق schemas أدناه |
| 5. Expected response | R-MUTATION: Promise<response.data>؛ شكل النجاح ومحتوى data غير مثبتين؛ VERIFIED_FROM_FRONTEND للـ HTTP/await فقط، UNKNOWN للـ payload.; Phase4 implementation: [CONTENT_API_CONTRACTS](CONTENT_API_CONTRACTS.md), new success contract INFERRED, legacy UNKNOWN. |
| 6. Authentication | Phase4 signed JWT and current SQL-backed session required; original Swagger global Bearer retained as historical evidence. |
| 7. Roles / access | A: canonical Manager/SuperAdmin only; User 403; INFERRED scope policy. [Matrix](CONTENT_AUTHORIZATION_MATRIX.md). |
| 8. Frontend consumers | `dashboard/features/blog-posts/services/blog-posts-create-service.ts` |
| 9. Proposed entities | BlogPosts, OurSpecialists, Files؛ INFERRED، وليست schema أصلية مستخرجة |
| 10. Evidence | DOCUMENTED_IN_OPENAPI (طلب فقط); VERIFIED_FROM_FRONTEND; Swagger JSON pointer: `#/paths/~1api~1BlogPosts~1add/post` |
| 11. Unknown behavior | U01, U12, U03, U04, U05, U07, U09, U10, U08, U22–U27; historical U12 nonimplementation snapshot superseded. |
| 12. Implementation status | IMPLEMENTED_INTERNAL_NEW_POLICY — SQL-backed, Phase6 internal server-adapter cutover; frozen frontend source; no claim of complete legacy parity. |
| 13. Contract test status | UNIT + REAL_SQL_INTEGRATION + LOCAL_PRODUCTION_HTTP PASS; legacy observation scope and differences documented per operation in CONTENT_API_CONTRACTS. |

## OP-11 — GET /api/BlogPosts/get-all

| الحقل | النتيجة |
| --- | --- |
| 1. Method / path | `GET /api/BlogPosts/get-all` |
| 2. Parameters | `PageNumber` (query, integer(int32), optional); `PageSize` (query, integer(int32), optional); `Search` (query, string, optional); `IsActive` (query, boolean, optional); `IsFeatured` (query, boolean, optional); `Sort.Field` (query, BlogPostsSortFieldEnum, optional); `Sort.Descending` (query, boolean, optional); `Status` (query, BlogPostStatusEnum, optional) |
| 3. Body schema | لا requestBody موثق |
| 4. Required / nullable | لا حقول required موثقة؛ nullability والقيود الدقيقة في ملحق schemas أدناه |
| 5. Expected response | R-BlogPosts: Envelope.data array + paging؛ VERIFIED_FROM_FRONTEND + VERIFIED_FROM_LEGACY_RESPONSE; Phase4 implementation: [CONTENT_API_CONTRACTS](CONTENT_API_CONTRACTS.md), sampled GET shape tested; unobserved branches INFERRED. |
| 6. Authentication | Phase4 public GET; supplied JWT must still verify; original Swagger global Bearer retained as historical evidence. |
| 7. Roles / access | P: anonymous/User public projection; Manager/SuperAdmin administrative content view (Client remains public projection); INFERRED scope policy. [Matrix](CONTENT_AUTHORIZATION_MATRIX.md). |
| 8. Frontend consumers | `dashboard/features/blog-posts/services/blog-posts-get-all-service.ts`; `lib/api/blog-posts.ts` |
| 9. Proposed entities | BlogPosts, OurSpecialists, Files؛ INFERRED، وليست schema أصلية مستخرجة |
| 10. Evidence | DOCUMENTED_IN_OPENAPI (طلب فقط); VERIFIED_FROM_FRONTEND; VERIFIED_FROM_LEGACY_RESPONSE (GET بلا token); Swagger JSON pointer: `#/paths/~1api~1BlogPosts~1get-all/get` |
| 11. Unknown behavior | U01, U12, U06, U07, U09, U10, U08, U22–U27; historical U12 nonimplementation snapshot superseded. |
| 12. Implementation status | IMPLEMENTED_INTERNAL_NEW_POLICY — SQL-backed, Phase6 internal server-adapter cutover; frozen frontend source; no claim of complete legacy parity. |
| 13. Contract test status | UNIT + REAL_SQL_INTEGRATION + LOCAL_PRODUCTION_HTTP PASS; legacy observation scope and differences documented per operation in CONTENT_API_CONTRACTS. |

## OP-12 — GET /api/BlogPosts/get-by-id/{id}

| الحقل | النتيجة |
| --- | --- |
| 1. Method / path | `GET /api/BlogPosts/get-by-id/{id}` |
| 2. Parameters | `id` (path, integer(int32), required) |
| 3. Body schema | لا requestBody موثق |
| 4. Required / nullable | path:id؛ nullability والقيود الدقيقة في ملحق schemas أدناه |
| 5. Expected response | R-BlogPosts: Envelope.data object + paging:null؛ VERIFIED_FROM_FRONTEND + VERIFIED_FROM_LEGACY_RESPONSE; Phase4 implementation: [CONTENT_API_CONTRACTS](CONTENT_API_CONTRACTS.md), sampled GET shape tested; unobserved branches INFERRED. |
| 6. Authentication | Phase4 public GET; supplied JWT must still verify; original Swagger global Bearer retained as historical evidence. |
| 7. Roles / access | P: anonymous/User public projection; Manager/SuperAdmin administrative content view (Client remains public projection); INFERRED scope policy. [Matrix](CONTENT_AUTHORIZATION_MATRIX.md). |
| 8. Frontend consumers | `dashboard/features/blog-posts/services/blog-posts-get-by-id-service.ts` |
| 9. Proposed entities | BlogPosts, OurSpecialists, Files؛ INFERRED، وليست schema أصلية مستخرجة |
| 10. Evidence | DOCUMENTED_IN_OPENAPI (طلب فقط); VERIFIED_FROM_FRONTEND; VERIFIED_FROM_LEGACY_RESPONSE (GET بلا token); Swagger JSON pointer: `#/paths/~1api~1BlogPosts~1get-by-id~1{id}/get` |
| 11. Unknown behavior | U01, U12, U06, U07, U09, U10, U08, U22–U27; historical U12 nonimplementation snapshot superseded. |
| 12. Implementation status | IMPLEMENTED_INTERNAL_NEW_POLICY — SQL-backed, Phase6 internal server-adapter cutover; frozen frontend source; no claim of complete legacy parity. |
| 13. Contract test status | UNIT + REAL_SQL_INTEGRATION + LOCAL_PRODUCTION_HTTP PASS; legacy observation scope and differences documented per operation in CONTENT_API_CONTRACTS. |

## OP-13 — GET /api/BlogPosts/by-slug/{slug}

| الحقل | النتيجة |
| --- | --- |
| 1. Method / path | `GET /api/BlogPosts/by-slug/{slug}` |
| 2. Parameters | `slug` (path, string, required) |
| 3. Body schema | لا requestBody موثق |
| 4. Required / nullable | path:slug؛ nullability والقيود الدقيقة في ملحق schemas أدناه |
| 5. Expected response | R-BlogPosts: Envelope.data object + paging:null؛ VERIFIED_FROM_FRONTEND + VERIFIED_FROM_LEGACY_RESPONSE; Phase4 implementation: [CONTENT_API_CONTRACTS](CONTENT_API_CONTRACTS.md), sampled GET shape tested; unobserved branches INFERRED. |
| 6. Authentication | Phase4 public GET; supplied JWT must still verify; original Swagger global Bearer retained as historical evidence. |
| 7. Roles / access | P: anonymous/User public projection; Manager/SuperAdmin administrative content view (Client remains public projection); INFERRED scope policy. [Matrix](CONTENT_AUTHORIZATION_MATRIX.md). |
| 8. Frontend consumers | `lib/api/blog-posts.ts`; `app/(site)/blog/[slug]/page.tsx` |
| 9. Proposed entities | BlogPosts, OurSpecialists, Files؛ INFERRED، وليست schema أصلية مستخرجة |
| 10. Evidence | DOCUMENTED_IN_OPENAPI (طلب فقط); VERIFIED_FROM_FRONTEND; VERIFIED_FROM_LEGACY_RESPONSE (GET بلا token); Swagger JSON pointer: `#/paths/~1api~1BlogPosts~1by-slug~1{slug}/get` |
| 11. Unknown behavior | U01, U12, U06, U07, U09, U10, U08, U22–U27; historical U12 nonimplementation snapshot superseded. |
| 12. Implementation status | IMPLEMENTED_INTERNAL_NEW_POLICY — SQL-backed, Phase6 internal server-adapter cutover; frozen frontend source; no claim of complete legacy parity. |
| 13. Contract test status | UNIT + REAL_SQL_INTEGRATION + LOCAL_PRODUCTION_HTTP PASS; legacy observation scope and differences documented per operation in CONTENT_API_CONTRACTS. |

## OP-14 — PUT /api/BlogPosts/edit/{id}

| الحقل | النتيجة |
| --- | --- |
| 1. Method / path | `PUT /api/BlogPosts/edit/{id}` |
| 2. Parameters | `id` (path, integer(int32), required) |
| 3. Body schema | [BlogPostsUpdateCommand](#schema-blogpostsupdatecommand)؛ JSON body اختياري وفق OpenAPI |
| 4. Required / nullable | path:id؛ nullability والقيود الدقيقة في ملحق schemas أدناه |
| 5. Expected response | R-MUTATION: Promise<response.data>؛ شكل النجاح ومحتوى data غير مثبتين؛ VERIFIED_FROM_FRONTEND للـ HTTP/await فقط، UNKNOWN للـ payload.; Phase4 implementation: [CONTENT_API_CONTRACTS](CONTENT_API_CONTRACTS.md), new success contract INFERRED, legacy UNKNOWN. |
| 6. Authentication | Phase4 signed JWT and current SQL-backed session required; original Swagger global Bearer retained as historical evidence. |
| 7. Roles / access | A: canonical Manager/SuperAdmin only; User 403; INFERRED scope policy. [Matrix](CONTENT_AUTHORIZATION_MATRIX.md). |
| 8. Frontend consumers | `dashboard/features/blog-posts/services/blog-posts-update-service.ts` |
| 9. Proposed entities | BlogPosts, OurSpecialists, Files؛ INFERRED، وليست schema أصلية مستخرجة |
| 10. Evidence | DOCUMENTED_IN_OPENAPI (طلب فقط); VERIFIED_FROM_FRONTEND; Swagger JSON pointer: `#/paths/~1api~1BlogPosts~1edit~1{id}/put` |
| 11. Unknown behavior | U01, U12, U03, U04, U05, U07, U09, U10, U08, U22–U27; historical U12 nonimplementation snapshot superseded. |
| 12. Implementation status | IMPLEMENTED_INTERNAL_NEW_POLICY — SQL-backed, Phase6 internal server-adapter cutover; frozen frontend source; no claim of complete legacy parity. |
| 13. Contract test status | UNIT + REAL_SQL_INTEGRATION + LOCAL_PRODUCTION_HTTP PASS; legacy observation scope and differences documented per operation in CONTENT_API_CONTRACTS. |

## OP-15 — DELETE /api/BlogPosts/delete/{id}

| الحقل | النتيجة |
| --- | --- |
| 1. Method / path | `DELETE /api/BlogPosts/delete/{id}` |
| 2. Parameters | `id` (path, integer(int32), required) |
| 3. Body schema | لا requestBody موثق |
| 4. Required / nullable | path:id؛ nullability والقيود الدقيقة في ملحق schemas أدناه |
| 5. Expected response | R-MUTATION: Promise<response.data>؛ شكل النجاح ومحتوى data غير مثبتين؛ VERIFIED_FROM_FRONTEND للـ HTTP/await فقط، UNKNOWN للـ payload.; Phase4 implementation: [CONTENT_API_CONTRACTS](CONTENT_API_CONTRACTS.md), new success contract INFERRED, legacy UNKNOWN. |
| 6. Authentication | Phase4 signed JWT and current SQL-backed session required; original Swagger global Bearer retained as historical evidence. |
| 7. Roles / access | A: canonical Manager/SuperAdmin only; User 403; INFERRED scope policy. [Matrix](CONTENT_AUTHORIZATION_MATRIX.md). |
| 8. Frontend consumers | `dashboard/features/blog-posts/services/blog-posts-remove-service.ts` |
| 9. Proposed entities | BlogPosts, OurSpecialists, Files؛ INFERRED، وليست schema أصلية مستخرجة |
| 10. Evidence | DOCUMENTED_IN_OPENAPI (طلب فقط); VERIFIED_FROM_FRONTEND; Swagger JSON pointer: `#/paths/~1api~1BlogPosts~1delete~1{id}/delete` |
| 11. Unknown behavior | U01, U12, U03, U04, U05, U07, U09, U10, U08, U22–U27; historical U12 nonimplementation snapshot superseded. |
| 12. Implementation status | IMPLEMENTED_INTERNAL_NEW_POLICY — SQL-backed, Phase6 internal server-adapter cutover; frozen frontend source; no claim of complete legacy parity. |
| 13. Contract test status | UNIT + REAL_SQL_INTEGRATION + LOCAL_PRODUCTION_HTTP PASS; legacy observation scope and differences documented per operation in CONTENT_API_CONTRACTS. |

## OP-16 — GET /api/Client/get-ads

| الحقل | النتيجة |
| --- | --- |
| 1. Method / path | `GET /api/Client/get-ads` |
| 2. Parameters | لا path/query params؛ header اللغة العام فقط |
| 3. Body schema | لا requestBody موثق |
| 4. Required / nullable | لا حقول required موثقة؛ nullability والقيود الدقيقة في ملحق schemas أدناه |
| 5. Expected response | R-CLIENT-ADS: Envelope.data{text:null,url:null,isActive:boolean} في العينة فقط؛ VERIFIED_FROM_LEGACY_RESPONSE؛ بقية فروع العرض UNKNOWN.; Phase4 implementation: [CONTENT_API_CONTRACTS](CONTENT_API_CONTRACTS.md), sampled GET shape tested; unobserved branches INFERRED. |
| 6. Authentication | Phase4 public GET; supplied JWT must still verify; original Swagger global Bearer retained as historical evidence. |
| 7. Roles / access | P: anonymous/User public projection; Manager/SuperAdmin administrative content view (Client remains public projection); INFERRED scope policy. [Matrix](CONTENT_AUTHORIZATION_MATRIX.md). |
| 8. Frontend consumers | لا يوجد مستهلك runtime في التطبيق الحالي؛ ليس مبررًا لحذف العملية |
| 9. Proposed entities | Ads, Files؛ INFERRED، وليست schema أصلية مستخرجة |
| 10. Evidence | DOCUMENTED_IN_OPENAPI (طلب فقط); VERIFIED_FROM_LEGACY_RESPONSE; Swagger JSON pointer: `#/paths/~1api~1Client~1get-ads/get` |
| 11. Unknown behavior | U01, U12, U13, U22–U27; historical U12 nonimplementation snapshot superseded. |
| 12. Implementation status | IMPLEMENTED_INTERNAL_NEW_POLICY — SQL-backed, Phase6 internal server-adapter cutover; frozen frontend source; no claim of complete legacy parity. |
| 13. Contract test status | UNIT + REAL_SQL_INTEGRATION + LOCAL_PRODUCTION_HTTP PASS; legacy observation scope and differences documented per operation in CONTENT_API_CONTRACTS. |

## OP-17 — GET /api/Client/get-settings

| الحقل | النتيجة |
| --- | --- |
| 1. Method / path | `GET /api/Client/get-settings` |
| 2. Parameters | لا path/query params؛ header اللغة العام فقط |
| 3. Body schema | لا requestBody موثق |
| 4. Required / nullable | لا حقول required موثقة؛ nullability والقيود الدقيقة في ملحق schemas أدناه |
| 5. Expected response | R-SETTINGS: Envelope.data object؛ VERIFIED_FROM_FRONTEND + VERIFIED_FROM_LEGACY_RESPONSE.; Phase4 implementation: [CONTENT_API_CONTRACTS](CONTENT_API_CONTRACTS.md), sampled GET shape tested; unobserved branches INFERRED. |
| 6. Authentication | Phase4 public GET; supplied JWT must still verify; original Swagger global Bearer retained as historical evidence. |
| 7. Roles / access | P: anonymous/User public projection; Manager/SuperAdmin administrative content view (Client remains public projection); INFERRED scope policy. [Matrix](CONTENT_AUTHORIZATION_MATRIX.md). |
| 8. Frontend consumers | `lib/api/settings.ts` |
| 9. Proposed entities | SiteSettings؛ INFERRED، وليست schema أصلية مستخرجة |
| 10. Evidence | DOCUMENTED_IN_OPENAPI (طلب فقط); VERIFIED_FROM_FRONTEND; VERIFIED_FROM_LEGACY_RESPONSE; Swagger JSON pointer: `#/paths/~1api~1Client~1get-settings/get` |
| 11. Unknown behavior | U01, U12, U22–U27; historical U12 nonimplementation snapshot superseded. |
| 12. Implementation status | IMPLEMENTED_INTERNAL_NEW_POLICY — SQL-backed, Phase6 internal server-adapter cutover; frozen frontend source; no claim of complete legacy parity. |
| 13. Contract test status | UNIT + REAL_SQL_INTEGRATION + LOCAL_PRODUCTION_HTTP PASS; legacy observation scope and differences documented per operation in CONTENT_API_CONTRACTS. |

## OP-18 — POST /api/FAQs/add

| الحقل | النتيجة |
| --- | --- |
| 1. Method / path | `POST /api/FAQs/add` |
| 2. Parameters | لا path/query params؛ header اللغة العام فقط |
| 3. Body schema | [FAQsCreateCommand](#schema-faqscreatecommand)؛ JSON body اختياري وفق OpenAPI |
| 4. Required / nullable | لا حقول required موثقة؛ nullability والقيود الدقيقة في ملحق schemas أدناه |
| 5. Expected response | R-MUTATION: Promise<response.data>؛ شكل النجاح ومحتوى data غير مثبتين؛ VERIFIED_FROM_FRONTEND للـ HTTP/await فقط، UNKNOWN للـ payload.; Phase4 implementation: [CONTENT_API_CONTRACTS](CONTENT_API_CONTRACTS.md), new success contract INFERRED, legacy UNKNOWN. |
| 6. Authentication | Phase4 signed JWT and current SQL-backed session required; original Swagger global Bearer retained as historical evidence. |
| 7. Roles / access | A: canonical Manager/SuperAdmin only; User 403; INFERRED scope policy. [Matrix](CONTENT_AUTHORIZATION_MATRIX.md). |
| 8. Frontend consumers | `dashboard/features/faqs/services/faqs-create-service.ts` |
| 9. Proposed entities | FAQs؛ INFERRED، وليست schema أصلية مستخرجة |
| 10. Evidence | DOCUMENTED_IN_OPENAPI (طلب فقط); VERIFIED_FROM_FRONTEND; Swagger JSON pointer: `#/paths/~1api~1FAQs~1add/post` |
| 11. Unknown behavior | U01, U12, U03, U04, U05, U07, U09, U10, U22–U27; historical U12 nonimplementation snapshot superseded. |
| 12. Implementation status | IMPLEMENTED_INTERNAL_NEW_POLICY — SQL-backed, Phase6 internal server-adapter cutover; frozen frontend source; no claim of complete legacy parity. |
| 13. Contract test status | UNIT + REAL_SQL_INTEGRATION + LOCAL_PRODUCTION_HTTP PASS; legacy observation scope and differences documented per operation in CONTENT_API_CONTRACTS. |

## OP-19 — GET /api/FAQs/get-all

| الحقل | النتيجة |
| --- | --- |
| 1. Method / path | `GET /api/FAQs/get-all` |
| 2. Parameters | `PageNumber` (query, integer(int32), optional); `PageSize` (query, integer(int32), optional); `Search` (query, string, optional); `IsActive` (query, boolean, optional); `Sort.Field` (query, FAQsSortFieldEnum, optional); `Sort.Descending` (query, boolean, optional) |
| 3. Body schema | لا requestBody موثق |
| 4. Required / nullable | لا حقول required موثقة؛ nullability والقيود الدقيقة في ملحق schemas أدناه |
| 5. Expected response | R-FAQs: Envelope.data array + paging؛ VERIFIED_FROM_FRONTEND + VERIFIED_FROM_LEGACY_RESPONSE; Phase4 implementation: [CONTENT_API_CONTRACTS](CONTENT_API_CONTRACTS.md), sampled GET shape tested; unobserved branches INFERRED. |
| 6. Authentication | Phase4 public GET; supplied JWT must still verify; original Swagger global Bearer retained as historical evidence. |
| 7. Roles / access | P: anonymous/User public projection; Manager/SuperAdmin administrative content view (Client remains public projection); INFERRED scope policy. [Matrix](CONTENT_AUTHORIZATION_MATRIX.md). |
| 8. Frontend consumers | `dashboard/features/faqs/services/faqs-get-all-service.ts`; `lib/api/faqs.ts` |
| 9. Proposed entities | FAQs؛ INFERRED، وليست schema أصلية مستخرجة |
| 10. Evidence | DOCUMENTED_IN_OPENAPI (طلب فقط); VERIFIED_FROM_FRONTEND; VERIFIED_FROM_LEGACY_RESPONSE (GET بلا token); Swagger JSON pointer: `#/paths/~1api~1FAQs~1get-all/get` |
| 11. Unknown behavior | U01, U12, U06, U07, U09, U10, U22–U27; historical U12 nonimplementation snapshot superseded. |
| 12. Implementation status | IMPLEMENTED_INTERNAL_NEW_POLICY — SQL-backed, Phase6 internal server-adapter cutover; frozen frontend source; no claim of complete legacy parity. |
| 13. Contract test status | UNIT + REAL_SQL_INTEGRATION + LOCAL_PRODUCTION_HTTP PASS; legacy observation scope and differences documented per operation in CONTENT_API_CONTRACTS. |

## OP-20 — GET /api/FAQs/get-by-id/{id}

| الحقل | النتيجة |
| --- | --- |
| 1. Method / path | `GET /api/FAQs/get-by-id/{id}` |
| 2. Parameters | `id` (path, integer(int32), required) |
| 3. Body schema | لا requestBody موثق |
| 4. Required / nullable | path:id؛ nullability والقيود الدقيقة في ملحق schemas أدناه |
| 5. Expected response | R-FAQs: Envelope.data object + paging:null؛ VERIFIED_FROM_FRONTEND + VERIFIED_FROM_LEGACY_RESPONSE; Phase4 implementation: [CONTENT_API_CONTRACTS](CONTENT_API_CONTRACTS.md), sampled GET shape tested; unobserved branches INFERRED. |
| 6. Authentication | Phase4 public GET; supplied JWT must still verify; original Swagger global Bearer retained as historical evidence. |
| 7. Roles / access | P: anonymous/User public projection; Manager/SuperAdmin administrative content view (Client remains public projection); INFERRED scope policy. [Matrix](CONTENT_AUTHORIZATION_MATRIX.md). |
| 8. Frontend consumers | `dashboard/features/faqs/services/faqs-get-by-id-service.ts` |
| 9. Proposed entities | FAQs؛ INFERRED، وليست schema أصلية مستخرجة |
| 10. Evidence | DOCUMENTED_IN_OPENAPI (طلب فقط); VERIFIED_FROM_FRONTEND; VERIFIED_FROM_LEGACY_RESPONSE (GET بلا token); Swagger JSON pointer: `#/paths/~1api~1FAQs~1get-by-id~1{id}/get` |
| 11. Unknown behavior | U01, U12, U06, U07, U09, U10, U22–U27; historical U12 nonimplementation snapshot superseded. |
| 12. Implementation status | IMPLEMENTED_INTERNAL_NEW_POLICY — SQL-backed, Phase6 internal server-adapter cutover; frozen frontend source; no claim of complete legacy parity. |
| 13. Contract test status | UNIT + REAL_SQL_INTEGRATION + LOCAL_PRODUCTION_HTTP PASS; legacy observation scope and differences documented per operation in CONTENT_API_CONTRACTS. |

## OP-21 — PUT /api/FAQs/edit/{id}

| الحقل | النتيجة |
| --- | --- |
| 1. Method / path | `PUT /api/FAQs/edit/{id}` |
| 2. Parameters | `id` (path, integer(int32), required) |
| 3. Body schema | [FAQsUpdateCommand](#schema-faqsupdatecommand)؛ JSON body اختياري وفق OpenAPI |
| 4. Required / nullable | path:id؛ nullability والقيود الدقيقة في ملحق schemas أدناه |
| 5. Expected response | R-MUTATION: Promise<response.data>؛ شكل النجاح ومحتوى data غير مثبتين؛ VERIFIED_FROM_FRONTEND للـ HTTP/await فقط، UNKNOWN للـ payload.; Phase4 implementation: [CONTENT_API_CONTRACTS](CONTENT_API_CONTRACTS.md), new success contract INFERRED, legacy UNKNOWN. |
| 6. Authentication | Phase4 signed JWT and current SQL-backed session required; original Swagger global Bearer retained as historical evidence. |
| 7. Roles / access | A: canonical Manager/SuperAdmin only; User 403; INFERRED scope policy. [Matrix](CONTENT_AUTHORIZATION_MATRIX.md). |
| 8. Frontend consumers | `dashboard/features/faqs/services/faqs-update-service.ts` |
| 9. Proposed entities | FAQs؛ INFERRED، وليست schema أصلية مستخرجة |
| 10. Evidence | DOCUMENTED_IN_OPENAPI (طلب فقط); VERIFIED_FROM_FRONTEND; Swagger JSON pointer: `#/paths/~1api~1FAQs~1edit~1{id}/put` |
| 11. Unknown behavior | U01, U12, U03, U04, U05, U07, U09, U10, U22–U27; historical U12 nonimplementation snapshot superseded. |
| 12. Implementation status | IMPLEMENTED_INTERNAL_NEW_POLICY — SQL-backed, Phase6 internal server-adapter cutover; frozen frontend source; no claim of complete legacy parity. |
| 13. Contract test status | UNIT + REAL_SQL_INTEGRATION + LOCAL_PRODUCTION_HTTP PASS; legacy observation scope and differences documented per operation in CONTENT_API_CONTRACTS. |

## OP-22 — DELETE /api/FAQs/delete/{id}

| الحقل | النتيجة |
| --- | --- |
| 1. Method / path | `DELETE /api/FAQs/delete/{id}` |
| 2. Parameters | `id` (path, integer(int32), required) |
| 3. Body schema | لا requestBody موثق |
| 4. Required / nullable | path:id؛ nullability والقيود الدقيقة في ملحق schemas أدناه |
| 5. Expected response | R-MUTATION: Promise<response.data>؛ شكل النجاح ومحتوى data غير مثبتين؛ VERIFIED_FROM_FRONTEND للـ HTTP/await فقط، UNKNOWN للـ payload.; Phase4 implementation: [CONTENT_API_CONTRACTS](CONTENT_API_CONTRACTS.md), new success contract INFERRED, legacy UNKNOWN. |
| 6. Authentication | Phase4 signed JWT and current SQL-backed session required; original Swagger global Bearer retained as historical evidence. |
| 7. Roles / access | A: canonical Manager/SuperAdmin only; User 403; INFERRED scope policy. [Matrix](CONTENT_AUTHORIZATION_MATRIX.md). |
| 8. Frontend consumers | `dashboard/features/faqs/services/faqs-remove-service.ts` |
| 9. Proposed entities | FAQs؛ INFERRED، وليست schema أصلية مستخرجة |
| 10. Evidence | DOCUMENTED_IN_OPENAPI (طلب فقط); VERIFIED_FROM_FRONTEND; Swagger JSON pointer: `#/paths/~1api~1FAQs~1delete~1{id}/delete` |
| 11. Unknown behavior | U01, U12, U03, U04, U05, U07, U09, U10, U22–U27; historical U12 nonimplementation snapshot superseded. |
| 12. Implementation status | IMPLEMENTED_INTERNAL_NEW_POLICY — SQL-backed, Phase6 internal server-adapter cutover; frozen frontend source; no claim of complete legacy parity. |
| 13. Contract test status | UNIT + REAL_SQL_INTEGRATION + LOCAL_PRODUCTION_HTTP PASS; legacy observation scope and differences documented per operation in CONTENT_API_CONTRACTS. |

## OP-23 — POST /api/FileUpload/upload

| الحقل | النتيجة |
| --- | --- |
| 1. Method / path | `POST /api/FileUpload/upload` |
| 2. Parameters | لا path/query params؛ header اللغة العام فقط |
| 3. Body schema | multipart/form-data؛ file:string(binary)، encoding.style=form، body وfile غير موسومين required في Swagger |
| 4. Required / nullable | لا حقول required موثقة؛ nullability والقيود الدقيقة في ملحق schemas أدناه |
| 5. Expected response | VERIFIED_FROM_FRONTEND: success isSuccess/data{fileId:number,filePath:string}/error:null/paging. New implementation uses paging:null; failure error:string with top-level message alias is explicitly INFERRED. [FILE_API_CONTRACT](FILE_API_CONTRACT.md). Original upload response UNKNOWN; no legacy write probe. |
| 6. Authentication | Phase3 signed JWT and current SQL-backed session required before body/storage work and at both SQL commits; no cookie decoder bypass. |
| 7. Roles / access | Canonical Manager/SuperAdmin only; anonymous401, ordinary User403; new INFERRED administrative-media policy. Public delivery only approved ready media. |
| 8. Frontend consumers | `dashboard/components/form/image-upload.tsx` |
| 9. Proposed entities | Files + UPLOAD_DIR؛ INFERRED، وليست schema أصلية مستخرجة |
| 10. Evidence | DOCUMENTED_IN_OPENAPI (طلب فقط); VERIFIED_FROM_FRONTEND; Swagger JSON pointer: `#/paths/~1api~1FileUpload~1upload/post` |
| 11. Unknown behavior | U16/U28/U29/U30/U31/U32: original upload validation/errors/publication, private host path/ACL/hard links/redeploy/backup and Phase6 final URLs/import/Next Image configuration. |
| 12. Implementation status | IMPLEMENTED_INTERNAL_NEW_POLICY; real dbo.Files + private UPLOAD_DIR + GET/HEAD uploads serving, Phase6 local internal integration; no hosted cutover. |
| 13. Contract test status | UNIT + REAL_SQL_FILESYSTEM + ACTUAL_IMAGEUPLOAD + LOCAL_PRODUCTION_HTTP + FULL_NEXT_RESTART PASS. MonsterASP redeploy NOT_RUN; original upload parity UNKNOWN. |

## OP-24 — POST /api/Galleries/add

| الحقل | النتيجة |
| --- | --- |
| 1. Method / path | `POST /api/Galleries/add` |
| 2. Parameters | لا path/query params؛ header اللغة العام فقط |
| 3. Body schema | [GalleriesCreateCommand](#schema-galleriescreatecommand)؛ JSON body اختياري وفق OpenAPI |
| 4. Required / nullable | لا حقول required موثقة؛ nullability والقيود الدقيقة في ملحق schemas أدناه |
| 5. Expected response | R-MUTATION: Promise<response.data>؛ شكل النجاح ومحتوى data غير مثبتين؛ VERIFIED_FROM_FRONTEND للـ HTTP/await فقط، UNKNOWN للـ payload.; Phase4 implementation: [CONTENT_API_CONTRACTS](CONTENT_API_CONTRACTS.md), new success contract INFERRED, legacy UNKNOWN. |
| 6. Authentication | Phase4 signed JWT and current SQL-backed session required; original Swagger global Bearer retained as historical evidence. |
| 7. Roles / access | A: canonical Manager/SuperAdmin only; User 403; INFERRED scope policy. [Matrix](CONTENT_AUTHORIZATION_MATRIX.md). |
| 8. Frontend consumers | `dashboard/features/gallery/services/gallery-create-service.ts` |
| 9. Proposed entities | Galleries, Files × 2؛ INFERRED، وليست schema أصلية مستخرجة |
| 10. Evidence | DOCUMENTED_IN_OPENAPI (طلب فقط); VERIFIED_FROM_FRONTEND; Swagger JSON pointer: `#/paths/~1api~1Galleries~1add/post` |
| 11. Unknown behavior | U01, U12, U03, U04, U05, U07, U09, U10, U22–U27; historical U12 nonimplementation snapshot superseded. |
| 12. Implementation status | IMPLEMENTED_INTERNAL_NEW_POLICY — SQL-backed, Phase6 internal server-adapter cutover; frozen frontend source; no claim of complete legacy parity. |
| 13. Contract test status | UNIT + REAL_SQL_INTEGRATION + LOCAL_PRODUCTION_HTTP PASS; legacy observation scope and differences documented per operation in CONTENT_API_CONTRACTS. |

## OP-25 — GET /api/Galleries/get-all

| الحقل | النتيجة |
| --- | --- |
| 1. Method / path | `GET /api/Galleries/get-all` |
| 2. Parameters | `PageNumber` (query, integer(int32), optional); `PageSize` (query, integer(int32), optional); `Search` (query, string, optional); `IsActive` (query, boolean, optional); `Sort.Field` (query, GalleriesSortFieldEnum, optional); `Sort.Descending` (query, boolean, optional) |
| 3. Body schema | لا requestBody موثق |
| 4. Required / nullable | لا حقول required موثقة؛ nullability والقيود الدقيقة في ملحق schemas أدناه |
| 5. Expected response | R-Galleries: Envelope.data array + paging؛ VERIFIED_FROM_FRONTEND + VERIFIED_FROM_LEGACY_RESPONSE; Phase4 implementation: [CONTENT_API_CONTRACTS](CONTENT_API_CONTRACTS.md), sampled GET shape tested; unobserved branches INFERRED. |
| 6. Authentication | Phase4 public GET; supplied JWT must still verify; original Swagger global Bearer retained as historical evidence. |
| 7. Roles / access | P: anonymous/User public projection; Manager/SuperAdmin administrative content view (Client remains public projection); INFERRED scope policy. [Matrix](CONTENT_AUTHORIZATION_MATRIX.md). |
| 8. Frontend consumers | `dashboard/features/gallery/services/gallery-get-all-service.ts`; `lib/api/galleries.ts` |
| 9. Proposed entities | Galleries, Files × 2؛ INFERRED، وليست schema أصلية مستخرجة |
| 10. Evidence | DOCUMENTED_IN_OPENAPI (طلب فقط); VERIFIED_FROM_FRONTEND; VERIFIED_FROM_LEGACY_RESPONSE (GET بلا token); Swagger JSON pointer: `#/paths/~1api~1Galleries~1get-all/get` |
| 11. Unknown behavior | U01, U12, U06, U07, U09, U10, U22–U27; historical U12 nonimplementation snapshot superseded. |
| 12. Implementation status | IMPLEMENTED_INTERNAL_NEW_POLICY — SQL-backed, Phase6 internal server-adapter cutover; frozen frontend source; no claim of complete legacy parity. |
| 13. Contract test status | UNIT + REAL_SQL_INTEGRATION + LOCAL_PRODUCTION_HTTP PASS; legacy observation scope and differences documented per operation in CONTENT_API_CONTRACTS. |

## OP-26 — GET /api/Galleries/get-by-id/{id}

| الحقل | النتيجة |
| --- | --- |
| 1. Method / path | `GET /api/Galleries/get-by-id/{id}` |
| 2. Parameters | `id` (path, integer(int32), required) |
| 3. Body schema | لا requestBody موثق |
| 4. Required / nullable | path:id؛ nullability والقيود الدقيقة في ملحق schemas أدناه |
| 5. Expected response | R-Galleries: Envelope.data object + paging:null؛ VERIFIED_FROM_FRONTEND + VERIFIED_FROM_LEGACY_RESPONSE; Phase4 implementation: [CONTENT_API_CONTRACTS](CONTENT_API_CONTRACTS.md), sampled GET shape tested; unobserved branches INFERRED. |
| 6. Authentication | Phase4 public GET; supplied JWT must still verify; original Swagger global Bearer retained as historical evidence. |
| 7. Roles / access | P: anonymous/User public projection; Manager/SuperAdmin administrative content view (Client remains public projection); INFERRED scope policy. [Matrix](CONTENT_AUTHORIZATION_MATRIX.md). |
| 8. Frontend consumers | `dashboard/features/gallery/services/gallery-get-by-id-service.ts` |
| 9. Proposed entities | Galleries, Files × 2؛ INFERRED، وليست schema أصلية مستخرجة |
| 10. Evidence | DOCUMENTED_IN_OPENAPI (طلب فقط); VERIFIED_FROM_FRONTEND; VERIFIED_FROM_LEGACY_RESPONSE (GET بلا token); Swagger JSON pointer: `#/paths/~1api~1Galleries~1get-by-id~1{id}/get` |
| 11. Unknown behavior | U01, U12, U06, U07, U09, U10, U22–U27; historical U12 nonimplementation snapshot superseded. |
| 12. Implementation status | IMPLEMENTED_INTERNAL_NEW_POLICY — SQL-backed, Phase6 internal server-adapter cutover; frozen frontend source; no claim of complete legacy parity. |
| 13. Contract test status | UNIT + REAL_SQL_INTEGRATION + LOCAL_PRODUCTION_HTTP PASS; legacy observation scope and differences documented per operation in CONTENT_API_CONTRACTS. |

## OP-27 — PUT /api/Galleries/edit/{id}

| الحقل | النتيجة |
| --- | --- |
| 1. Method / path | `PUT /api/Galleries/edit/{id}` |
| 2. Parameters | `id` (path, integer(int32), required) |
| 3. Body schema | [GalleriesUpdateCommand](#schema-galleriesupdatecommand)؛ JSON body اختياري وفق OpenAPI |
| 4. Required / nullable | path:id؛ nullability والقيود الدقيقة في ملحق schemas أدناه |
| 5. Expected response | R-MUTATION: Promise<response.data>؛ شكل النجاح ومحتوى data غير مثبتين؛ VERIFIED_FROM_FRONTEND للـ HTTP/await فقط، UNKNOWN للـ payload.; Phase4 implementation: [CONTENT_API_CONTRACTS](CONTENT_API_CONTRACTS.md), new success contract INFERRED, legacy UNKNOWN. |
| 6. Authentication | Phase4 signed JWT and current SQL-backed session required; original Swagger global Bearer retained as historical evidence. |
| 7. Roles / access | A: canonical Manager/SuperAdmin only; User 403; INFERRED scope policy. [Matrix](CONTENT_AUTHORIZATION_MATRIX.md). |
| 8. Frontend consumers | `dashboard/features/gallery/services/gallery-update-service.ts` |
| 9. Proposed entities | Galleries, Files × 2؛ INFERRED، وليست schema أصلية مستخرجة |
| 10. Evidence | DOCUMENTED_IN_OPENAPI (طلب فقط); VERIFIED_FROM_FRONTEND; Swagger JSON pointer: `#/paths/~1api~1Galleries~1edit~1{id}/put` |
| 11. Unknown behavior | U01, U12, U03, U04, U05, U07, U09, U10, U22–U27; historical U12 nonimplementation snapshot superseded. |
| 12. Implementation status | IMPLEMENTED_INTERNAL_NEW_POLICY — SQL-backed, Phase6 internal server-adapter cutover; frozen frontend source; no claim of complete legacy parity. |
| 13. Contract test status | UNIT + REAL_SQL_INTEGRATION + LOCAL_PRODUCTION_HTTP PASS; legacy observation scope and differences documented per operation in CONTENT_API_CONTRACTS. |

## OP-28 — DELETE /api/Galleries/delete/{id}

| الحقل | النتيجة |
| --- | --- |
| 1. Method / path | `DELETE /api/Galleries/delete/{id}` |
| 2. Parameters | `id` (path, integer(int32), required) |
| 3. Body schema | لا requestBody موثق |
| 4. Required / nullable | path:id؛ nullability والقيود الدقيقة في ملحق schemas أدناه |
| 5. Expected response | R-MUTATION: Promise<response.data>؛ شكل النجاح ومحتوى data غير مثبتين؛ VERIFIED_FROM_FRONTEND للـ HTTP/await فقط، UNKNOWN للـ payload.; Phase4 implementation: [CONTENT_API_CONTRACTS](CONTENT_API_CONTRACTS.md), new success contract INFERRED, legacy UNKNOWN. |
| 6. Authentication | Phase4 signed JWT and current SQL-backed session required; original Swagger global Bearer retained as historical evidence. |
| 7. Roles / access | A: canonical Manager/SuperAdmin only; User 403; INFERRED scope policy. [Matrix](CONTENT_AUTHORIZATION_MATRIX.md). |
| 8. Frontend consumers | `dashboard/features/gallery/services/gallery-remove-service.ts` |
| 9. Proposed entities | Galleries, Files × 2؛ INFERRED، وليست schema أصلية مستخرجة |
| 10. Evidence | DOCUMENTED_IN_OPENAPI (طلب فقط); VERIFIED_FROM_FRONTEND; Swagger JSON pointer: `#/paths/~1api~1Galleries~1delete~1{id}/delete` |
| 11. Unknown behavior | U01, U12, U03, U04, U05, U07, U09, U10, U22–U27; historical U12 nonimplementation snapshot superseded. |
| 12. Implementation status | IMPLEMENTED_INTERNAL_NEW_POLICY — SQL-backed, Phase6 internal server-adapter cutover; frozen frontend source; no claim of complete legacy parity. |
| 13. Contract test status | UNIT + REAL_SQL_INTEGRATION + LOCAL_PRODUCTION_HTTP PASS; legacy observation scope and differences documented per operation in CONTENT_API_CONTRACTS. |

## OP-29 — POST /api/OurSpecialists/add

| الحقل | النتيجة |
| --- | --- |
| 1. Method / path | `POST /api/OurSpecialists/add` |
| 2. Parameters | لا path/query params؛ header اللغة العام فقط |
| 3. Body schema | [OurSpecialistsCreateCommand](#schema-ourspecialistscreatecommand)؛ JSON body اختياري وفق OpenAPI |
| 4. Required / nullable | لا حقول required موثقة؛ nullability والقيود الدقيقة في ملحق schemas أدناه |
| 5. Expected response | R-MUTATION: Promise<response.data>؛ شكل النجاح ومحتوى data غير مثبتين؛ VERIFIED_FROM_FRONTEND للـ HTTP/await فقط، UNKNOWN للـ payload.; Phase4 implementation: [CONTENT_API_CONTRACTS](CONTENT_API_CONTRACTS.md), new success contract INFERRED, legacy UNKNOWN. |
| 6. Authentication | Phase4 signed JWT and current SQL-backed session required; original Swagger global Bearer retained as historical evidence. |
| 7. Roles / access | A: canonical Manager/SuperAdmin only; User 403; INFERRED scope policy. [Matrix](CONTENT_AUTHORIZATION_MATRIX.md). |
| 8. Frontend consumers | `dashboard/features/our-specialists/services/our-specialists-create-service.ts` |
| 9. Proposed entities | OurSpecialists, Files؛ INFERRED، وليست schema أصلية مستخرجة |
| 10. Evidence | DOCUMENTED_IN_OPENAPI (طلب فقط); VERIFIED_FROM_FRONTEND; Swagger JSON pointer: `#/paths/~1api~1OurSpecialists~1add/post` |
| 11. Unknown behavior | U01, U12, U03, U04, U05, U07, U09, U10, U22–U27; historical U12 nonimplementation snapshot superseded. |
| 12. Implementation status | IMPLEMENTED_INTERNAL_NEW_POLICY — SQL-backed, Phase6 internal server-adapter cutover; frozen frontend source; no claim of complete legacy parity. |
| 13. Contract test status | UNIT + REAL_SQL_INTEGRATION + LOCAL_PRODUCTION_HTTP PASS; legacy observation scope and differences documented per operation in CONTENT_API_CONTRACTS. |

## OP-30 — GET /api/OurSpecialists/get-all

| الحقل | النتيجة |
| --- | --- |
| 1. Method / path | `GET /api/OurSpecialists/get-all` |
| 2. Parameters | `PageNumber` (query, integer(int32), optional); `PageSize` (query, integer(int32), optional); `Search` (query, string, optional); `IsActive` (query, boolean, optional); `Sort.Field` (query, OurSpecialistsSortFieldEnum, optional); `Sort.Descending` (query, boolean, optional) |
| 3. Body schema | لا requestBody موثق |
| 4. Required / nullable | لا حقول required موثقة؛ nullability والقيود الدقيقة في ملحق schemas أدناه |
| 5. Expected response | R-OurSpecialists: Envelope.data array + paging؛ VERIFIED_FROM_FRONTEND + VERIFIED_FROM_LEGACY_RESPONSE; Phase4 implementation: [CONTENT_API_CONTRACTS](CONTENT_API_CONTRACTS.md), sampled GET shape tested; unobserved branches INFERRED. |
| 6. Authentication | Phase4 public GET; supplied JWT must still verify; original Swagger global Bearer retained as historical evidence. |
| 7. Roles / access | P: anonymous/User public projection; Manager/SuperAdmin administrative content view (Client remains public projection); INFERRED scope policy. [Matrix](CONTENT_AUTHORIZATION_MATRIX.md). |
| 8. Frontend consumers | `dashboard/features/our-specialists/services/our-specialists-get-all-service.ts`; `lib/api/specialists.ts` |
| 9. Proposed entities | OurSpecialists, Files؛ INFERRED، وليست schema أصلية مستخرجة |
| 10. Evidence | DOCUMENTED_IN_OPENAPI (طلب فقط); VERIFIED_FROM_FRONTEND; VERIFIED_FROM_LEGACY_RESPONSE (GET بلا token); Swagger JSON pointer: `#/paths/~1api~1OurSpecialists~1get-all/get` |
| 11. Unknown behavior | U01, U12, U06, U07, U09, U10, U22–U27; historical U12 nonimplementation snapshot superseded. |
| 12. Implementation status | IMPLEMENTED_INTERNAL_NEW_POLICY — SQL-backed, Phase6 internal server-adapter cutover; frozen frontend source; no claim of complete legacy parity. |
| 13. Contract test status | UNIT + REAL_SQL_INTEGRATION + LOCAL_PRODUCTION_HTTP PASS; legacy observation scope and differences documented per operation in CONTENT_API_CONTRACTS. |

## OP-31 — GET /api/OurSpecialists/get-by-id/{id}

| الحقل | النتيجة |
| --- | --- |
| 1. Method / path | `GET /api/OurSpecialists/get-by-id/{id}` |
| 2. Parameters | `id` (path, integer(int32), required) |
| 3. Body schema | لا requestBody موثق |
| 4. Required / nullable | path:id؛ nullability والقيود الدقيقة في ملحق schemas أدناه |
| 5. Expected response | R-OurSpecialists: Envelope.data object + paging:null؛ VERIFIED_FROM_FRONTEND + VERIFIED_FROM_LEGACY_RESPONSE; Phase4 implementation: [CONTENT_API_CONTRACTS](CONTENT_API_CONTRACTS.md), sampled GET shape tested; unobserved branches INFERRED. |
| 6. Authentication | Phase4 public GET; supplied JWT must still verify; original Swagger global Bearer retained as historical evidence. |
| 7. Roles / access | P: anonymous/User public projection; Manager/SuperAdmin administrative content view (Client remains public projection); INFERRED scope policy. [Matrix](CONTENT_AUTHORIZATION_MATRIX.md). |
| 8. Frontend consumers | `dashboard/features/our-specialists/services/our-specialists-get-by-id-service.ts` |
| 9. Proposed entities | OurSpecialists, Files؛ INFERRED، وليست schema أصلية مستخرجة |
| 10. Evidence | DOCUMENTED_IN_OPENAPI (طلب فقط); VERIFIED_FROM_FRONTEND; VERIFIED_FROM_LEGACY_RESPONSE (GET بلا token); Swagger JSON pointer: `#/paths/~1api~1OurSpecialists~1get-by-id~1{id}/get` |
| 11. Unknown behavior | U01, U12, U06, U07, U09, U10, U22–U27; historical U12 nonimplementation snapshot superseded. |
| 12. Implementation status | IMPLEMENTED_INTERNAL_NEW_POLICY — SQL-backed, Phase6 internal server-adapter cutover; frozen frontend source; no claim of complete legacy parity. |
| 13. Contract test status | UNIT + REAL_SQL_INTEGRATION + LOCAL_PRODUCTION_HTTP PASS; legacy observation scope and differences documented per operation in CONTENT_API_CONTRACTS. |

## OP-32 — PUT /api/OurSpecialists/edit/{id}

| الحقل | النتيجة |
| --- | --- |
| 1. Method / path | `PUT /api/OurSpecialists/edit/{id}` |
| 2. Parameters | `id` (path, integer(int32), required) |
| 3. Body schema | [OurSpecialistsUpdateCommand](#schema-ourspecialistsupdatecommand)؛ JSON body اختياري وفق OpenAPI |
| 4. Required / nullable | path:id؛ nullability والقيود الدقيقة في ملحق schemas أدناه |
| 5. Expected response | R-MUTATION: Promise<response.data>؛ شكل النجاح ومحتوى data غير مثبتين؛ VERIFIED_FROM_FRONTEND للـ HTTP/await فقط، UNKNOWN للـ payload.; Phase4 implementation: [CONTENT_API_CONTRACTS](CONTENT_API_CONTRACTS.md), new success contract INFERRED, legacy UNKNOWN. |
| 6. Authentication | Phase4 signed JWT and current SQL-backed session required; original Swagger global Bearer retained as historical evidence. |
| 7. Roles / access | A: canonical Manager/SuperAdmin only; User 403; INFERRED scope policy. [Matrix](CONTENT_AUTHORIZATION_MATRIX.md). |
| 8. Frontend consumers | `dashboard/features/our-specialists/services/our-specialists-update-service.ts` |
| 9. Proposed entities | OurSpecialists, Files؛ INFERRED، وليست schema أصلية مستخرجة |
| 10. Evidence | DOCUMENTED_IN_OPENAPI (طلب فقط); VERIFIED_FROM_FRONTEND; Swagger JSON pointer: `#/paths/~1api~1OurSpecialists~1edit~1{id}/put` |
| 11. Unknown behavior | U01, U12, U03, U04, U05, U07, U09, U10, U22–U27; historical U12 nonimplementation snapshot superseded. |
| 12. Implementation status | IMPLEMENTED_INTERNAL_NEW_POLICY — SQL-backed, Phase6 internal server-adapter cutover; frozen frontend source; no claim of complete legacy parity. |
| 13. Contract test status | UNIT + REAL_SQL_INTEGRATION + LOCAL_PRODUCTION_HTTP PASS; legacy observation scope and differences documented per operation in CONTENT_API_CONTRACTS. |

## OP-33 — DELETE /api/OurSpecialists/delete/{id}

| الحقل | النتيجة |
| --- | --- |
| 1. Method / path | `DELETE /api/OurSpecialists/delete/{id}` |
| 2. Parameters | `id` (path, integer(int32), required) |
| 3. Body schema | لا requestBody موثق |
| 4. Required / nullable | path:id؛ nullability والقيود الدقيقة في ملحق schemas أدناه |
| 5. Expected response | R-MUTATION: Promise<response.data>؛ شكل النجاح ومحتوى data غير مثبتين؛ VERIFIED_FROM_FRONTEND للـ HTTP/await فقط، UNKNOWN للـ payload.; Phase4 implementation: [CONTENT_API_CONTRACTS](CONTENT_API_CONTRACTS.md), new success contract INFERRED, legacy UNKNOWN. |
| 6. Authentication | Phase4 signed JWT and current SQL-backed session required; original Swagger global Bearer retained as historical evidence. |
| 7. Roles / access | A: canonical Manager/SuperAdmin only; User 403; INFERRED scope policy. [Matrix](CONTENT_AUTHORIZATION_MATRIX.md). |
| 8. Frontend consumers | `dashboard/features/our-specialists/services/our-specialists-remove-service.ts` |
| 9. Proposed entities | OurSpecialists, Files؛ INFERRED، وليست schema أصلية مستخرجة |
| 10. Evidence | DOCUMENTED_IN_OPENAPI (طلب فقط); VERIFIED_FROM_FRONTEND; Swagger JSON pointer: `#/paths/~1api~1OurSpecialists~1delete~1{id}/delete` |
| 11. Unknown behavior | U01, U12, U03, U04, U05, U07, U09, U10, U22–U27; historical U12 nonimplementation snapshot superseded. |
| 12. Implementation status | IMPLEMENTED_INTERNAL_NEW_POLICY — SQL-backed, Phase6 internal server-adapter cutover; frozen frontend source; no claim of complete legacy parity. |
| 13. Contract test status | UNIT + REAL_SQL_INTEGRATION + LOCAL_PRODUCTION_HTTP PASS; legacy observation scope and differences documented per operation in CONTENT_API_CONTRACTS. |

## OP-34 — POST /api/Services/add

| الحقل | النتيجة |
| --- | --- |
| 1. Method / path | `POST /api/Services/add` |
| 2. Parameters | لا path/query params؛ header اللغة العام فقط |
| 3. Body schema | [ServicesCreateCommand](#schema-servicescreatecommand)؛ JSON body اختياري وفق OpenAPI |
| 4. Required / nullable | لا حقول required موثقة؛ nullability والقيود الدقيقة في ملحق schemas أدناه |
| 5. Expected response | R-MUTATION: Promise<response.data>؛ شكل النجاح ومحتوى data غير مثبتين؛ VERIFIED_FROM_FRONTEND للـ HTTP/await فقط، UNKNOWN للـ payload.; Phase4 implementation: [CONTENT_API_CONTRACTS](CONTENT_API_CONTRACTS.md), new success contract INFERRED, legacy UNKNOWN. |
| 6. Authentication | Phase4 signed JWT and current SQL-backed session required; original Swagger global Bearer retained as historical evidence. |
| 7. Roles / access | A: canonical Manager/SuperAdmin only; User 403; INFERRED scope policy. [Matrix](CONTENT_AUTHORIZATION_MATRIX.md). |
| 8. Frontend consumers | `dashboard/features/services/services/services-create-service.ts` |
| 9. Proposed entities | Services, Files؛ INFERRED، وليست schema أصلية مستخرجة |
| 10. Evidence | DOCUMENTED_IN_OPENAPI (طلب فقط); VERIFIED_FROM_FRONTEND; Swagger JSON pointer: `#/paths/~1api~1Services~1add/post` |
| 11. Unknown behavior | U01, U12, U03, U04, U05, U07, U09, U10, U22–U27; historical U12 nonimplementation snapshot superseded. |
| 12. Implementation status | IMPLEMENTED_INTERNAL_NEW_POLICY — SQL-backed, Phase6 internal server-adapter cutover; frozen frontend source; no claim of complete legacy parity. |
| 13. Contract test status | UNIT + REAL_SQL_INTEGRATION + LOCAL_PRODUCTION_HTTP PASS; legacy observation scope and differences documented per operation in CONTENT_API_CONTRACTS. |

## OP-35 — GET /api/Services/get-all

| الحقل | النتيجة |
| --- | --- |
| 1. Method / path | `GET /api/Services/get-all` |
| 2. Parameters | `PageNumber` (query, integer(int32), optional); `PageSize` (query, integer(int32), optional); `Search` (query, string, optional); `IsActive` (query, boolean, optional); `Sort.Field` (query, ServicesSortFieldEnum, optional); `Sort.Descending` (query, boolean, optional) |
| 3. Body schema | لا requestBody موثق |
| 4. Required / nullable | لا حقول required موثقة؛ nullability والقيود الدقيقة في ملحق schemas أدناه |
| 5. Expected response | R-Services: Envelope.data array + paging؛ VERIFIED_FROM_FRONTEND + VERIFIED_FROM_LEGACY_RESPONSE; Phase4 implementation: [CONTENT_API_CONTRACTS](CONTENT_API_CONTRACTS.md), sampled GET shape tested; unobserved branches INFERRED. |
| 6. Authentication | Phase4 public GET; supplied JWT must still verify; original Swagger global Bearer retained as historical evidence. |
| 7. Roles / access | P: anonymous/User public projection; Manager/SuperAdmin administrative content view (Client remains public projection); INFERRED scope policy. [Matrix](CONTENT_AUTHORIZATION_MATRIX.md). |
| 8. Frontend consumers | `dashboard/features/services/services/services-get-all-service.ts`; `lib/api/services.ts` |
| 9. Proposed entities | Services, Files؛ INFERRED، وليست schema أصلية مستخرجة |
| 10. Evidence | DOCUMENTED_IN_OPENAPI (طلب فقط); VERIFIED_FROM_FRONTEND; VERIFIED_FROM_LEGACY_RESPONSE (GET بلا token); Swagger JSON pointer: `#/paths/~1api~1Services~1get-all/get` |
| 11. Unknown behavior | U01, U12, U06, U07, U09, U10, U22–U27; historical U12 nonimplementation snapshot superseded. |
| 12. Implementation status | IMPLEMENTED_INTERNAL_NEW_POLICY — SQL-backed, Phase6 internal server-adapter cutover; frozen frontend source; no claim of complete legacy parity. |
| 13. Contract test status | UNIT + REAL_SQL_INTEGRATION + LOCAL_PRODUCTION_HTTP PASS; legacy observation scope and differences documented per operation in CONTENT_API_CONTRACTS. |

## OP-36 — GET /api/Services/get-by-id/{id}

| الحقل | النتيجة |
| --- | --- |
| 1. Method / path | `GET /api/Services/get-by-id/{id}` |
| 2. Parameters | `id` (path, integer(int32), required) |
| 3. Body schema | لا requestBody موثق |
| 4. Required / nullable | path:id؛ nullability والقيود الدقيقة في ملحق schemas أدناه |
| 5. Expected response | R-Services: Envelope.data object + paging:null؛ VERIFIED_FROM_FRONTEND + VERIFIED_FROM_LEGACY_RESPONSE; Phase4 implementation: [CONTENT_API_CONTRACTS](CONTENT_API_CONTRACTS.md), sampled GET shape tested; unobserved branches INFERRED. |
| 6. Authentication | Phase4 public GET; supplied JWT must still verify; original Swagger global Bearer retained as historical evidence. |
| 7. Roles / access | P: anonymous/User public projection; Manager/SuperAdmin administrative content view (Client remains public projection); INFERRED scope policy. [Matrix](CONTENT_AUTHORIZATION_MATRIX.md). |
| 8. Frontend consumers | `dashboard/features/services/services/services-get-by-id-service.ts` |
| 9. Proposed entities | Services, Files؛ INFERRED، وليست schema أصلية مستخرجة |
| 10. Evidence | DOCUMENTED_IN_OPENAPI (طلب فقط); VERIFIED_FROM_FRONTEND; VERIFIED_FROM_LEGACY_RESPONSE (GET بلا token); Swagger JSON pointer: `#/paths/~1api~1Services~1get-by-id~1{id}/get` |
| 11. Unknown behavior | U01, U12, U06, U07, U09, U10, U22–U27; historical U12 nonimplementation snapshot superseded. |
| 12. Implementation status | IMPLEMENTED_INTERNAL_NEW_POLICY — SQL-backed, Phase6 internal server-adapter cutover; frozen frontend source; no claim of complete legacy parity. |
| 13. Contract test status | UNIT + REAL_SQL_INTEGRATION + LOCAL_PRODUCTION_HTTP PASS; legacy observation scope and differences documented per operation in CONTENT_API_CONTRACTS. |

## OP-37 — PUT /api/Services/edit/{id}

| الحقل | النتيجة |
| --- | --- |
| 1. Method / path | `PUT /api/Services/edit/{id}` |
| 2. Parameters | `id` (path, integer(int32), required) |
| 3. Body schema | [ServicesUpdateCommand](#schema-servicesupdatecommand)؛ JSON body اختياري وفق OpenAPI |
| 4. Required / nullable | path:id؛ nullability والقيود الدقيقة في ملحق schemas أدناه |
| 5. Expected response | R-MUTATION: Promise<response.data>؛ شكل النجاح ومحتوى data غير مثبتين؛ VERIFIED_FROM_FRONTEND للـ HTTP/await فقط، UNKNOWN للـ payload.; Phase4 implementation: [CONTENT_API_CONTRACTS](CONTENT_API_CONTRACTS.md), new success contract INFERRED, legacy UNKNOWN. |
| 6. Authentication | Phase4 signed JWT and current SQL-backed session required; original Swagger global Bearer retained as historical evidence. |
| 7. Roles / access | A: canonical Manager/SuperAdmin only; User 403; INFERRED scope policy. [Matrix](CONTENT_AUTHORIZATION_MATRIX.md). |
| 8. Frontend consumers | `dashboard/features/services/services/services-update-service.ts` |
| 9. Proposed entities | Services, Files؛ INFERRED، وليست schema أصلية مستخرجة |
| 10. Evidence | DOCUMENTED_IN_OPENAPI (طلب فقط); VERIFIED_FROM_FRONTEND; Swagger JSON pointer: `#/paths/~1api~1Services~1edit~1{id}/put` |
| 11. Unknown behavior | U01, U12, U03, U04, U05, U07, U09, U10, U22–U27; historical U12 nonimplementation snapshot superseded. |
| 12. Implementation status | IMPLEMENTED_INTERNAL_NEW_POLICY — SQL-backed, Phase6 internal server-adapter cutover; frozen frontend source; no claim of complete legacy parity. |
| 13. Contract test status | UNIT + REAL_SQL_INTEGRATION + LOCAL_PRODUCTION_HTTP PASS; legacy observation scope and differences documented per operation in CONTENT_API_CONTRACTS. |

## OP-38 — DELETE /api/Services/delete/{id}

| الحقل | النتيجة |
| --- | --- |
| 1. Method / path | `DELETE /api/Services/delete/{id}` |
| 2. Parameters | `id` (path, integer(int32), required) |
| 3. Body schema | لا requestBody موثق |
| 4. Required / nullable | path:id؛ nullability والقيود الدقيقة في ملحق schemas أدناه |
| 5. Expected response | R-MUTATION: Promise<response.data>؛ شكل النجاح ومحتوى data غير مثبتين؛ VERIFIED_FROM_FRONTEND للـ HTTP/await فقط، UNKNOWN للـ payload.; Phase4 implementation: [CONTENT_API_CONTRACTS](CONTENT_API_CONTRACTS.md), new success contract INFERRED, legacy UNKNOWN. |
| 6. Authentication | Phase4 signed JWT and current SQL-backed session required; original Swagger global Bearer retained as historical evidence. |
| 7. Roles / access | A: canonical Manager/SuperAdmin only; User 403; INFERRED scope policy. [Matrix](CONTENT_AUTHORIZATION_MATRIX.md). |
| 8. Frontend consumers | `dashboard/features/services/services/services-remove-service.ts` |
| 9. Proposed entities | Services, Files؛ INFERRED، وليست schema أصلية مستخرجة |
| 10. Evidence | DOCUMENTED_IN_OPENAPI (طلب فقط); VERIFIED_FROM_FRONTEND; Swagger JSON pointer: `#/paths/~1api~1Services~1delete~1{id}/delete` |
| 11. Unknown behavior | U01, U12, U03, U04, U05, U07, U09, U10, U22–U27; historical U12 nonimplementation snapshot superseded. |
| 12. Implementation status | IMPLEMENTED_INTERNAL_NEW_POLICY — SQL-backed, Phase6 internal server-adapter cutover; frozen frontend source; no claim of complete legacy parity. |
| 13. Contract test status | UNIT + REAL_SQL_INTEGRATION + LOCAL_PRODUCTION_HTTP PASS; legacy observation scope and differences documented per operation in CONTENT_API_CONTRACTS. |

## OP-39 — GET /api/Setting/get

| الحقل | النتيجة |
| --- | --- |
| 1. Method / path | `GET /api/Setting/get` |
| 2. Parameters | لا path/query params؛ header اللغة العام فقط |
| 3. Body schema | لا requestBody موثق |
| 4. Required / nullable | لا حقول required موثقة؛ nullability والقيود الدقيقة في ملحق schemas أدناه |
| 5. Expected response | R-SETTINGS: Envelope.data object؛ VERIFIED_FROM_FRONTEND؛ legacy غير مصادق أعاد 401، لذلك نجاح Setting/get ليس مثبتًا حيًا.; Phase4 implementation: [CONTENT_API_CONTRACTS](CONTENT_API_CONTRACTS.md), new success contract INFERRED, legacy UNKNOWN. |
| 6. Authentication | Phase4 signed JWT and current SQL-backed session required; original Swagger global Bearer retained as historical evidence. |
| 7. Roles / access | A: canonical Manager/SuperAdmin only; User 403; INFERRED scope policy. [Matrix](CONTENT_AUTHORIZATION_MATRIX.md). |
| 8. Frontend consumers | `dashboard/features/setting/services/setting-get-all-service.ts`; `lib/api/settings.ts (fallback)` |
| 9. Proposed entities | SiteSettings؛ INFERRED، وليست schema أصلية مستخرجة |
| 10. Evidence | DOCUMENTED_IN_OPENAPI (طلب فقط); VERIFIED_FROM_FRONTEND; VERIFIED_FROM_LEGACY_RESPONSE (401 فقط); Swagger JSON pointer: `#/paths/~1api~1Setting~1get/get` |
| 11. Unknown behavior | U01, U12, U06, U13, U22–U27; historical U12 nonimplementation snapshot superseded. |
| 12. Implementation status | IMPLEMENTED_INTERNAL_NEW_POLICY — SQL-backed, Phase6 internal server-adapter cutover; frozen frontend source; no claim of complete legacy parity. |
| 13. Contract test status | UNIT + REAL_SQL_INTEGRATION + LOCAL_PRODUCTION_HTTP PASS; legacy observation scope and differences documented per operation in CONTENT_API_CONTRACTS. |

## OP-40 — GET /api/Setting/get-statistic

| الحقل | النتيجة |
| --- | --- |
| 1. Method / path | `GET /api/Setting/get-statistic` |
| 2. Parameters | لا path/query params؛ header اللغة العام فقط |
| 3. Body schema | لا requestBody موثق |
| 4. Required / nullable | لا حقول required موثقة؛ nullability والقيود الدقيقة في ملحق schemas أدناه |
| 5. Expected response | UNKNOWN: لا يوجد مستهلك يثبت استجابة النجاح.; Phase4 implementation: [CONTENT_API_CONTRACTS](CONTENT_API_CONTRACTS.md), new success contract INFERRED, legacy UNKNOWN. |
| 6. Authentication | Phase4 signed JWT and current SQL-backed session required; original Swagger global Bearer retained as historical evidence. |
| 7. Roles / access | A: canonical Manager/SuperAdmin only; User 403; INFERRED scope policy. [Matrix](CONTENT_AUTHORIZATION_MATRIX.md). |
| 8. Frontend consumers | لا يوجد مستهلك runtime في التطبيق الحالي؛ ليس مبررًا لحذف العملية |
| 9. Proposed entities | SiteSettings + تجميعات الكيانات (حقول الإحصاء UNKNOWN)؛ INFERRED، وليست schema أصلية مستخرجة |
| 10. Evidence | DOCUMENTED_IN_OPENAPI (طلب فقط); VERIFIED_FROM_LEGACY_RESPONSE (401 فقط); Swagger JSON pointer: `#/paths/~1api~1Setting~1get-statistic/get` |
| 11. Unknown behavior | U01, U12, U06, U13, U22–U27; historical U12 nonimplementation snapshot superseded. |
| 12. Implementation status | IMPLEMENTED_INTERNAL_NEW_POLICY — SQL-backed, Phase6 internal server-adapter cutover; frozen frontend source; no claim of complete legacy parity. |
| 13. Contract test status | UNIT + REAL_SQL_INTEGRATION + LOCAL_PRODUCTION_HTTP PASS; legacy observation scope and differences documented per operation in CONTENT_API_CONTRACTS. |

## OP-41 — PUT /api/Setting/edit

| الحقل | النتيجة |
| --- | --- |
| 1. Method / path | `PUT /api/Setting/edit` |
| 2. Parameters | لا path/query params؛ header اللغة العام فقط |
| 3. Body schema | [SettingUpdateCommand](#schema-settingupdatecommand)؛ JSON body اختياري وفق OpenAPI |
| 4. Required / nullable | لا حقول required موثقة؛ nullability والقيود الدقيقة في ملحق schemas أدناه |
| 5. Expected response | R-MUTATION: body غير مستهلك؛ استجابة نجاح UNKNOWN.; Phase4 implementation: [CONTENT_API_CONTRACTS](CONTENT_API_CONTRACTS.md), new success contract INFERRED, legacy UNKNOWN. |
| 6. Authentication | Phase4 signed JWT and current SQL-backed session required; original Swagger global Bearer retained as historical evidence. |
| 7. Roles / access | A: canonical Manager/SuperAdmin only; User 403; INFERRED scope policy. [Matrix](CONTENT_AUTHORIZATION_MATRIX.md). |
| 8. Frontend consumers | `dashboard/features/setting/services/setting-update-service.ts` |
| 9. Proposed entities | SiteSettings؛ INFERRED، وليست schema أصلية مستخرجة |
| 10. Evidence | DOCUMENTED_IN_OPENAPI (طلب فقط); VERIFIED_FROM_FRONTEND; Swagger JSON pointer: `#/paths/~1api~1Setting~1edit/put` |
| 11. Unknown behavior | U01, U12, U06, U13, U22–U27; historical U12 nonimplementation snapshot superseded. |
| 12. Implementation status | IMPLEMENTED_INTERNAL_NEW_POLICY — SQL-backed, Phase6 internal server-adapter cutover; frozen frontend source; no claim of complete legacy parity. |
| 13. Contract test status | UNIT + REAL_SQL_INTEGRATION + LOCAL_PRODUCTION_HTTP PASS; legacy observation scope and differences documented per operation in CONTENT_API_CONTRACTS. |

## OP-42 — POST /api/Testimonials/add

| الحقل | النتيجة |
| --- | --- |
| 1. Method / path | `POST /api/Testimonials/add` |
| 2. Parameters | لا path/query params؛ header اللغة العام فقط |
| 3. Body schema | [TestimonialsCreateCommand](#schema-testimonialscreatecommand)؛ JSON body اختياري وفق OpenAPI |
| 4. Required / nullable | لا حقول required موثقة؛ nullability والقيود الدقيقة في ملحق schemas أدناه |
| 5. Expected response | R-MUTATION: Promise<response.data>؛ شكل النجاح ومحتوى data غير مثبتين؛ VERIFIED_FROM_FRONTEND للـ HTTP/await فقط، UNKNOWN للـ payload.; Phase4 implementation: [CONTENT_API_CONTRACTS](CONTENT_API_CONTRACTS.md), new success contract INFERRED, legacy UNKNOWN. |
| 6. Authentication | Phase4 signed JWT and current SQL-backed session required; original Swagger global Bearer retained as historical evidence. |
| 7. Roles / access | A: canonical Manager/SuperAdmin only; User 403; INFERRED scope policy. [Matrix](CONTENT_AUTHORIZATION_MATRIX.md). |
| 8. Frontend consumers | `dashboard/features/testimonials/services/testimonials-create-service.ts` |
| 9. Proposed entities | Testimonials, Files؛ INFERRED، وليست schema أصلية مستخرجة |
| 10. Evidence | DOCUMENTED_IN_OPENAPI (طلب فقط); VERIFIED_FROM_FRONTEND; Swagger JSON pointer: `#/paths/~1api~1Testimonials~1add/post` |
| 11. Unknown behavior | U01, U12, U03, U04, U05, U07, U09, U10, U02, U22–U27; historical U12 nonimplementation snapshot superseded. |
| 12. Implementation status | IMPLEMENTED_INTERNAL_NEW_POLICY — SQL-backed, Phase6 internal server-adapter cutover; frozen frontend source; no claim of complete legacy parity. |
| 13. Contract test status | UNIT + REAL_SQL_INTEGRATION + LOCAL_PRODUCTION_HTTP PASS; legacy observation scope and differences documented per operation in CONTENT_API_CONTRACTS. |

## OP-43 — GET /api/Testimonials/get-all

| الحقل | النتيجة |
| --- | --- |
| 1. Method / path | `GET /api/Testimonials/get-all` |
| 2. Parameters | `PageNumber` (query, integer(int32), optional); `PageSize` (query, integer(int32), optional); `Search` (query, string, optional); `IsActive` (query, boolean, optional); `Sort.Field` (query, TestimonialsSortFieldEnum, optional); `Sort.Descending` (query, boolean, optional) |
| 3. Body schema | لا requestBody موثق |
| 4. Required / nullable | لا حقول required موثقة؛ nullability والقيود الدقيقة في ملحق schemas أدناه |
| 5. Expected response | R-Testimonials: Envelope.data array + paging؛ VERIFIED_FROM_FRONTEND + VERIFIED_FROM_LEGACY_RESPONSE مع تعارض starNumber/starsNumber (U02); Phase4 implementation: [CONTENT_API_CONTRACTS](CONTENT_API_CONTRACTS.md), sampled GET shape tested; unobserved branches INFERRED. |
| 6. Authentication | Phase4 public GET; supplied JWT must still verify; original Swagger global Bearer retained as historical evidence. |
| 7. Roles / access | P: anonymous/User public projection; Manager/SuperAdmin administrative content view (Client remains public projection); INFERRED scope policy. [Matrix](CONTENT_AUTHORIZATION_MATRIX.md). |
| 8. Frontend consumers | `dashboard/features/testimonials/services/testimonials-get-all-service.ts`; `lib/api/testimonials.ts` |
| 9. Proposed entities | Testimonials, Files؛ INFERRED، وليست schema أصلية مستخرجة |
| 10. Evidence | DOCUMENTED_IN_OPENAPI (طلب فقط); VERIFIED_FROM_FRONTEND; VERIFIED_FROM_LEGACY_RESPONSE (GET بلا token); Swagger JSON pointer: `#/paths/~1api~1Testimonials~1get-all/get` |
| 11. Unknown behavior | U01, U12, U06, U07, U09, U10, U02, U22–U27; historical U12 nonimplementation snapshot superseded. |
| 12. Implementation status | IMPLEMENTED_INTERNAL_NEW_POLICY — SQL-backed, Phase6 internal server-adapter cutover; frozen frontend source; no claim of complete legacy parity. |
| 13. Contract test status | UNIT + REAL_SQL_INTEGRATION + LOCAL_PRODUCTION_HTTP PASS; legacy observation scope and differences documented per operation in CONTENT_API_CONTRACTS. |

## OP-44 — GET /api/Testimonials/get-by-id/{id}

| الحقل | النتيجة |
| --- | --- |
| 1. Method / path | `GET /api/Testimonials/get-by-id/{id}` |
| 2. Parameters | `id` (path, integer(int32), required) |
| 3. Body schema | لا requestBody موثق |
| 4. Required / nullable | path:id؛ nullability والقيود الدقيقة في ملحق schemas أدناه |
| 5. Expected response | R-Testimonials: Envelope.data object + paging:null؛ VERIFIED_FROM_FRONTEND + VERIFIED_FROM_LEGACY_RESPONSE مع تعارض starNumber/starsNumber (U02); Phase4 implementation: [CONTENT_API_CONTRACTS](CONTENT_API_CONTRACTS.md), sampled GET shape tested; unobserved branches INFERRED. |
| 6. Authentication | Phase4 public GET; supplied JWT must still verify; original Swagger global Bearer retained as historical evidence. |
| 7. Roles / access | P: anonymous/User public projection; Manager/SuperAdmin administrative content view (Client remains public projection); INFERRED scope policy. [Matrix](CONTENT_AUTHORIZATION_MATRIX.md). |
| 8. Frontend consumers | `dashboard/features/testimonials/services/testimonials-get-by-id-service.ts` |
| 9. Proposed entities | Testimonials, Files؛ INFERRED، وليست schema أصلية مستخرجة |
| 10. Evidence | DOCUMENTED_IN_OPENAPI (طلب فقط); VERIFIED_FROM_FRONTEND; VERIFIED_FROM_LEGACY_RESPONSE (GET بلا token); Swagger JSON pointer: `#/paths/~1api~1Testimonials~1get-by-id~1{id}/get` |
| 11. Unknown behavior | U01, U12, U06, U07, U09, U10, U02, U22–U27; historical U12 nonimplementation snapshot superseded. |
| 12. Implementation status | IMPLEMENTED_INTERNAL_NEW_POLICY — SQL-backed, Phase6 internal server-adapter cutover; frozen frontend source; no claim of complete legacy parity. |
| 13. Contract test status | UNIT + REAL_SQL_INTEGRATION + LOCAL_PRODUCTION_HTTP PASS; legacy observation scope and differences documented per operation in CONTENT_API_CONTRACTS. |

## OP-45 — PUT /api/Testimonials/edit/{id}

| الحقل | النتيجة |
| --- | --- |
| 1. Method / path | `PUT /api/Testimonials/edit/{id}` |
| 2. Parameters | `id` (path, integer(int32), required) |
| 3. Body schema | [TestimonialsUpdateCommand](#schema-testimonialsupdatecommand)؛ JSON body اختياري وفق OpenAPI |
| 4. Required / nullable | path:id؛ nullability والقيود الدقيقة في ملحق schemas أدناه |
| 5. Expected response | R-MUTATION: Promise<response.data>؛ شكل النجاح ومحتوى data غير مثبتين؛ VERIFIED_FROM_FRONTEND للـ HTTP/await فقط، UNKNOWN للـ payload.; Phase4 implementation: [CONTENT_API_CONTRACTS](CONTENT_API_CONTRACTS.md), new success contract INFERRED, legacy UNKNOWN. |
| 6. Authentication | Phase4 signed JWT and current SQL-backed session required; original Swagger global Bearer retained as historical evidence. |
| 7. Roles / access | A: canonical Manager/SuperAdmin only; User 403; INFERRED scope policy. [Matrix](CONTENT_AUTHORIZATION_MATRIX.md). |
| 8. Frontend consumers | `dashboard/features/testimonials/services/testimonials-update-service.ts` |
| 9. Proposed entities | Testimonials, Files؛ INFERRED، وليست schema أصلية مستخرجة |
| 10. Evidence | DOCUMENTED_IN_OPENAPI (طلب فقط); VERIFIED_FROM_FRONTEND; Swagger JSON pointer: `#/paths/~1api~1Testimonials~1edit~1{id}/put` |
| 11. Unknown behavior | U01, U12, U03, U04, U05, U07, U09, U10, U02, U22–U27; historical U12 nonimplementation snapshot superseded. |
| 12. Implementation status | IMPLEMENTED_INTERNAL_NEW_POLICY — SQL-backed, Phase6 internal server-adapter cutover; frozen frontend source; no claim of complete legacy parity. |
| 13. Contract test status | UNIT + REAL_SQL_INTEGRATION + LOCAL_PRODUCTION_HTTP PASS; legacy observation scope and differences documented per operation in CONTENT_API_CONTRACTS. |

## OP-46 — DELETE /api/Testimonials/delete/{id}

| الحقل | النتيجة |
| --- | --- |
| 1. Method / path | `DELETE /api/Testimonials/delete/{id}` |
| 2. Parameters | `id` (path, integer(int32), required) |
| 3. Body schema | لا requestBody موثق |
| 4. Required / nullable | path:id؛ nullability والقيود الدقيقة في ملحق schemas أدناه |
| 5. Expected response | R-MUTATION: Promise<response.data>؛ شكل النجاح ومحتوى data غير مثبتين؛ VERIFIED_FROM_FRONTEND للـ HTTP/await فقط، UNKNOWN للـ payload.; Phase4 implementation: [CONTENT_API_CONTRACTS](CONTENT_API_CONTRACTS.md), new success contract INFERRED, legacy UNKNOWN. |
| 6. Authentication | Phase4 signed JWT and current SQL-backed session required; original Swagger global Bearer retained as historical evidence. |
| 7. Roles / access | A: canonical Manager/SuperAdmin only; User 403; INFERRED scope policy. [Matrix](CONTENT_AUTHORIZATION_MATRIX.md). |
| 8. Frontend consumers | `dashboard/features/testimonials/services/testimonials-remove-service.ts` |
| 9. Proposed entities | Testimonials, Files؛ INFERRED، وليست schema أصلية مستخرجة |
| 10. Evidence | DOCUMENTED_IN_OPENAPI (طلب فقط); VERIFIED_FROM_FRONTEND; Swagger JSON pointer: `#/paths/~1api~1Testimonials~1delete~1{id}/delete` |
| 11. Unknown behavior | U01, U12, U03, U04, U05, U07, U09, U10, U02, U22–U27; historical U12 nonimplementation snapshot superseded. |
| 12. Implementation status | IMPLEMENTED_INTERNAL_NEW_POLICY — SQL-backed, Phase6 internal server-adapter cutover; frozen frontend source; no claim of complete legacy parity. |
| 13. Contract test status | UNIT + REAL_SQL_INTEGRATION + LOCAL_PRODUCTION_HTTP PASS; legacy observation scope and differences documented per operation in CONTENT_API_CONTRACTS. |

## OP-47 — GET /api/User/get-all

| الحقل | النتيجة |
| --- | --- |
| 1. Method / path | `GET /api/User/get-all` |
| 2. Parameters | `Search` (query, string, optional); `PageNumber` (query, integer(int32), optional); `PageSize` (query, integer(int32), optional); `Sort.Field` (query, UserSortField, optional); `Sort.Descending` (query, boolean, optional); `IsActive` (query, boolean, optional) |
| 3. Body schema | لا requestBody موثق |
| 4. Required / nullable | لا حقول required موثقة؛ nullability والقيود الدقيقة في ملحق schemas أدناه |
| 5. Expected response | UNKNOWN: لا يوجد مستهلك يثبت استجابة النجاح.؛ new implementation في [AUTH_API_CONTRACTS](AUTH_API_CONTRACTS.md)، INFERRED لا VERIFIED_FROM_LEGACY_RESPONSE |
| 6. Authentication | OpenAPI: Bearer عالمي؛ لا security override لهذه العملية. انظر السلوك المرصود/المقترح في خانة الأدوار. |
| 7. Roles / access | مقترح: SuperAdmin فقط؛ منع إسقاط آخر مدير. صلاحيات legacy غير مثبتة. |
| 8. Frontend consumers | لا يوجد مستهلك runtime في التطبيق الحالي؛ ليس مبررًا لحذف العملية |
| 9. Proposed entities | Users, Roles, Files, AuthSessions, SecurityEvents؛ INFERRED، وليست schema أصلية مستخرجة |
| 10. Evidence | DOCUMENTED_IN_OPENAPI (طلب فقط); Swagger JSON pointer: `#/paths/~1api~1User~1get-all/get` |
| 11. Unknown behavior | U01, U12, U11, U13, U14, U18, U19 |
| 12. Implementation status | IMPLEMENTED_INTERNAL_NEW_POLICY — SQL-backed، دونfrontend cutover؛ لا claim legacy parity |
| 13. Contract test status | UNIT + REAL_SQL_INTEGRATION + LOCAL_PRODUCTION_HTTP؛ implementation contract tested، original legacy behavior UNKNOWN |

## OP-48 — GET /api/User/get-by-id/{id}

| الحقل | النتيجة |
| --- | --- |
| 1. Method / path | `GET /api/User/get-by-id/{id}` |
| 2. Parameters | `id` (path, string, required) |
| 3. Body schema | لا requestBody موثق |
| 4. Required / nullable | path:id؛ nullability والقيود الدقيقة في ملحق schemas أدناه |
| 5. Expected response | UNKNOWN: لا يوجد مستهلك يثبت استجابة النجاح.؛ new implementation في [AUTH_API_CONTRACTS](AUTH_API_CONTRACTS.md)، INFERRED لا VERIFIED_FROM_LEGACY_RESPONSE |
| 6. Authentication | OpenAPI: Bearer عالمي؛ لا security override لهذه العملية. انظر السلوك المرصود/المقترح في خانة الأدوار. |
| 7. Roles / access | مقترح: SuperAdmin فقط؛ منع إسقاط آخر مدير. صلاحيات legacy غير مثبتة. |
| 8. Frontend consumers | لا يوجد مستهلك runtime في التطبيق الحالي؛ ليس مبررًا لحذف العملية |
| 9. Proposed entities | Users, Roles, Files, AuthSessions, SecurityEvents؛ INFERRED، وليست schema أصلية مستخرجة |
| 10. Evidence | DOCUMENTED_IN_OPENAPI (طلب فقط); Swagger JSON pointer: `#/paths/~1api~1User~1get-by-id~1{id}/get` |
| 11. Unknown behavior | U01, U12, U11, U13, U14, U18, U19 |
| 12. Implementation status | IMPLEMENTED_INTERNAL_NEW_POLICY — SQL-backed، دونfrontend cutover؛ لا claim legacy parity |
| 13. Contract test status | UNIT + REAL_SQL_INTEGRATION + LOCAL_PRODUCTION_HTTP؛ implementation contract tested، original legacy behavior UNKNOWN |

## OP-49 — POST /api/User/change-password

| الحقل | النتيجة |
| --- | --- |
| 1. Method / path | `POST /api/User/change-password` |
| 2. Parameters | لا path/query params؛ header اللغة العام فقط |
| 3. Body schema | [ChangePasswordRequest](#schema-changepasswordrequest)؛ JSON body اختياري وفق OpenAPI |
| 4. Required / nullable | لا حقول required موثقة؛ nullability والقيود الدقيقة في ملحق schemas أدناه |
| 5. Expected response | UNKNOWN: لا يوجد مستهلك يثبت استجابة النجاح.؛ new implementation في [AUTH_API_CONTRACTS](AUTH_API_CONTRACTS.md)، INFERRED لا VERIFIED_FROM_LEGACY_RESPONSE |
| 6. Authentication | OpenAPI: Bearer عالمي؛ لا security override لهذه العملية. انظر السلوك المرصود/المقترح في خانة الأدوار. |
| 7. Roles / access | مقترح: JWT متحقق للحساب نفسه؛ لا قبول userId من العميل لتغيير حساب آخر. |
| 8. Frontend consumers | لا يوجد مستهلك runtime في التطبيق الحالي؛ ليس مبررًا لحذف العملية |
| 9. Proposed entities | Users, Roles, Files, AuthSessions, SecurityEvents؛ INFERRED، وليست schema أصلية مستخرجة |
| 10. Evidence | DOCUMENTED_IN_OPENAPI (طلب فقط); Swagger JSON pointer: `#/paths/~1api~1User~1change-password/post` |
| 11. Unknown behavior | U01, U12, U11, U13, U14, U18, U19 |
| 12. Implementation status | IMPLEMENTED_INTERNAL_NEW_POLICY — SQL-backed، دونfrontend cutover؛ لا claim legacy parity |
| 13. Contract test status | UNIT + REAL_SQL_INTEGRATION + LOCAL_PRODUCTION_HTTP؛ implementation contract tested، original legacy behavior UNKNOWN |

## OP-50 — PUT /api/User/edit-profile

| الحقل | النتيجة |
| --- | --- |
| 1. Method / path | `PUT /api/User/edit-profile` |
| 2. Parameters | لا path/query params؛ header اللغة العام فقط |
| 3. Body schema | [UpdateUserRequest](#schema-updateuserrequest)؛ JSON body اختياري وفق OpenAPI |
| 4. Required / nullable | لا حقول required موثقة؛ nullability والقيود الدقيقة في ملحق schemas أدناه |
| 5. Expected response | UNKNOWN: لا يوجد مستهلك يثبت استجابة النجاح.؛ new implementation في [AUTH_API_CONTRACTS](AUTH_API_CONTRACTS.md)، INFERRED لا VERIFIED_FROM_LEGACY_RESPONSE |
| 6. Authentication | OpenAPI: Bearer عالمي؛ لا security override لهذه العملية. انظر السلوك المرصود/المقترح في خانة الأدوار. |
| 7. Roles / access | مقترح: JWT متحقق للحساب نفسه؛ لا قبول userId من العميل لتغيير حساب آخر. |
| 8. Frontend consumers | لا يوجد مستهلك runtime في التطبيق الحالي؛ ليس مبررًا لحذف العملية |
| 9. Proposed entities | Users, Roles, Files, AuthSessions, SecurityEvents؛ INFERRED، وليست schema أصلية مستخرجة |
| 10. Evidence | DOCUMENTED_IN_OPENAPI (طلب فقط); Swagger JSON pointer: `#/paths/~1api~1User~1edit-profile/put` |
| 11. Unknown behavior | U01, U12, U11, U13, U14, U18, U19 |
| 12. Implementation status | IMPLEMENTED_INTERNAL_NEW_POLICY — SQL-backed، دونfrontend cutover؛ لا claim legacy parity |
| 13. Contract test status | UNIT + REAL_SQL_INTEGRATION + LOCAL_PRODUCTION_HTTP؛ implementation contract tested، original legacy behavior UNKNOWN |

## OP-51 — GET /api/User/get-info

| الحقل | النتيجة |
| --- | --- |
| 1. Method / path | `GET /api/User/get-info` |
| 2. Parameters | لا path/query params؛ header اللغة العام فقط |
| 3. Body schema | لا requestBody موثق |
| 4. Required / nullable | لا حقول required موثقة؛ nullability والقيود الدقيقة في ملحق schemas أدناه |
| 5. Expected response | UNKNOWN: لا يوجد مستهلك يثبت استجابة النجاح.؛ new implementation في [AUTH_API_CONTRACTS](AUTH_API_CONTRACTS.md)، INFERRED لا VERIFIED_FROM_LEGACY_RESPONSE |
| 6. Authentication | OpenAPI: Bearer عالمي؛ لا security override لهذه العملية. انظر السلوك المرصود/المقترح في خانة الأدوار. |
| 7. Roles / access | مقترح: JWT متحقق للحساب نفسه؛ لا قبول userId من العميل لتغيير حساب آخر. |
| 8. Frontend consumers | لا يوجد مستهلك runtime في التطبيق الحالي؛ ليس مبررًا لحذف العملية |
| 9. Proposed entities | Users, Roles, Files, AuthSessions, SecurityEvents؛ INFERRED، وليست schema أصلية مستخرجة |
| 10. Evidence | DOCUMENTED_IN_OPENAPI (طلب فقط); Swagger JSON pointer: `#/paths/~1api~1User~1get-info/get` |
| 11. Unknown behavior | U01, U12, U11, U13, U14, U18, U19 |
| 12. Implementation status | IMPLEMENTED_INTERNAL_NEW_POLICY — SQL-backed، دونfrontend cutover؛ لا claim legacy parity |
| 13. Contract test status | UNIT + REAL_SQL_INTEGRATION + LOCAL_PRODUCTION_HTTP؛ implementation contract tested، original legacy behavior UNKNOWN |

## OP-52 — POST /api/User/toggle-disable

| الحقل | النتيجة |
| --- | --- |
| 1. Method / path | `POST /api/User/toggle-disable` |
| 2. Parameters | لا path/query params؛ header اللغة العام فقط |
| 3. Body schema | [DisableAgentRequest](#schema-disableagentrequest)؛ JSON body اختياري وفق OpenAPI |
| 4. Required / nullable | body.email؛ nullability والقيود الدقيقة في ملحق schemas أدناه |
| 5. Expected response | UNKNOWN: لا يوجد مستهلك يثبت استجابة النجاح.؛ new implementation في [AUTH_API_CONTRACTS](AUTH_API_CONTRACTS.md)، INFERRED لا VERIFIED_FROM_LEGACY_RESPONSE |
| 6. Authentication | OpenAPI: Bearer عالمي؛ لا security override لهذه العملية. انظر السلوك المرصود/المقترح في خانة الأدوار. |
| 7. Roles / access | مقترح: SuperAdmin فقط؛ منع إسقاط آخر مدير. صلاحيات legacy غير مثبتة. |
| 8. Frontend consumers | لا يوجد مستهلك runtime في التطبيق الحالي؛ ليس مبررًا لحذف العملية |
| 9. Proposed entities | Users, Roles, Files, AuthSessions, SecurityEvents؛ INFERRED، وليست schema أصلية مستخرجة |
| 10. Evidence | DOCUMENTED_IN_OPENAPI (طلب فقط); Swagger JSON pointer: `#/paths/~1api~1User~1toggle-disable/post` |
| 11. Unknown behavior | U01, U12, U11, U13, U14, U18, U19 |
| 12. Implementation status | IMPLEMENTED_INTERNAL_NEW_POLICY — SQL-backed، دونfrontend cutover؛ لا claim legacy parity |
| 13. Contract test status | UNIT + REAL_SQL_INTEGRATION + LOCAL_PRODUCTION_HTTP؛ implementation contract tested، original legacy behavior UNKNOWN |

## OP-53 — POST /api/YouTubeGalleries/add

| الحقل | النتيجة |
| --- | --- |
| 1. Method / path | `POST /api/YouTubeGalleries/add` |
| 2. Parameters | لا path/query params؛ header اللغة العام فقط |
| 3. Body schema | [YouTubeGalleriesCreateCommand](#schema-youtubegalleriescreatecommand)؛ JSON body اختياري وفق OpenAPI |
| 4. Required / nullable | لا حقول required موثقة؛ nullability والقيود الدقيقة في ملحق schemas أدناه |
| 5. Expected response | R-MUTATION: Promise<response.data>؛ شكل النجاح ومحتوى data غير مثبتين؛ VERIFIED_FROM_FRONTEND للـ HTTP/await فقط، UNKNOWN للـ payload.; Phase4 implementation: [CONTENT_API_CONTRACTS](CONTENT_API_CONTRACTS.md), new success contract INFERRED, legacy UNKNOWN. |
| 6. Authentication | Phase4 signed JWT and current SQL-backed session required; original Swagger global Bearer retained as historical evidence. |
| 7. Roles / access | A: canonical Manager/SuperAdmin only; User 403; INFERRED scope policy. [Matrix](CONTENT_AUTHORIZATION_MATRIX.md). |
| 8. Frontend consumers | `dashboard/features/youtube-galleries/services/youtube-galleries-create-service.ts` |
| 9. Proposed entities | YouTubeGalleries؛ INFERRED، وليست schema أصلية مستخرجة |
| 10. Evidence | DOCUMENTED_IN_OPENAPI (طلب فقط); VERIFIED_FROM_FRONTEND; Swagger JSON pointer: `#/paths/~1api~1YouTubeGalleries~1add/post` |
| 11. Unknown behavior | U01, U12, U03, U04, U05, U07, U09, U10, U22–U27; historical U12 nonimplementation snapshot superseded. |
| 12. Implementation status | IMPLEMENTED_INTERNAL_NEW_POLICY — SQL-backed, Phase6 internal server-adapter cutover; frozen frontend source; no claim of complete legacy parity. |
| 13. Contract test status | UNIT + REAL_SQL_INTEGRATION + LOCAL_PRODUCTION_HTTP PASS; legacy observation scope and differences documented per operation in CONTENT_API_CONTRACTS. |

## OP-54 — GET /api/YouTubeGalleries/get-all

| الحقل | النتيجة |
| --- | --- |
| 1. Method / path | `GET /api/YouTubeGalleries/get-all` |
| 2. Parameters | `PageNumber` (query, integer(int32), optional); `PageSize` (query, integer(int32), optional); `Search` (query, string, optional); `IsActive` (query, boolean, optional); `Sort.Field` (query, YouTubeGalleriesSortFieldEnum, optional); `Sort.Descending` (query, boolean, optional) |
| 3. Body schema | لا requestBody موثق |
| 4. Required / nullable | لا حقول required موثقة؛ nullability والقيود الدقيقة في ملحق schemas أدناه |
| 5. Expected response | R-YouTubeGalleries: Envelope.data array + paging؛ VERIFIED_FROM_FRONTEND + VERIFIED_FROM_LEGACY_RESPONSE; Phase4 implementation: [CONTENT_API_CONTRACTS](CONTENT_API_CONTRACTS.md), sampled GET shape tested; unobserved branches INFERRED. |
| 6. Authentication | Phase4 public GET; supplied JWT must still verify; original Swagger global Bearer retained as historical evidence. |
| 7. Roles / access | P: anonymous/User public projection; Manager/SuperAdmin administrative content view (Client remains public projection); INFERRED scope policy. [Matrix](CONTENT_AUTHORIZATION_MATRIX.md). |
| 8. Frontend consumers | `dashboard/features/youtube-galleries/services/youtube-galleries-get-all-service.ts`; `lib/api/youtube-galleries.ts` |
| 9. Proposed entities | YouTubeGalleries؛ INFERRED، وليست schema أصلية مستخرجة |
| 10. Evidence | DOCUMENTED_IN_OPENAPI (طلب فقط); VERIFIED_FROM_FRONTEND; VERIFIED_FROM_LEGACY_RESPONSE (GET بلا token); Swagger JSON pointer: `#/paths/~1api~1YouTubeGalleries~1get-all/get` |
| 11. Unknown behavior | U01, U12, U06, U07, U09, U10, U22–U27; historical U12 nonimplementation snapshot superseded. |
| 12. Implementation status | IMPLEMENTED_INTERNAL_NEW_POLICY — SQL-backed, Phase6 internal server-adapter cutover; frozen frontend source; no claim of complete legacy parity. |
| 13. Contract test status | UNIT + REAL_SQL_INTEGRATION + LOCAL_PRODUCTION_HTTP PASS; legacy observation scope and differences documented per operation in CONTENT_API_CONTRACTS. |

## OP-55 — GET /api/YouTubeGalleries/get-by-id/{id}

| الحقل | النتيجة |
| --- | --- |
| 1. Method / path | `GET /api/YouTubeGalleries/get-by-id/{id}` |
| 2. Parameters | `id` (path, integer(int32), required) |
| 3. Body schema | لا requestBody موثق |
| 4. Required / nullable | path:id؛ nullability والقيود الدقيقة في ملحق schemas أدناه |
| 5. Expected response | R-YouTubeGalleries: Envelope.data object + paging:null؛ VERIFIED_FROM_FRONTEND + VERIFIED_FROM_LEGACY_RESPONSE; Phase4 implementation: [CONTENT_API_CONTRACTS](CONTENT_API_CONTRACTS.md), sampled GET shape tested; unobserved branches INFERRED. |
| 6. Authentication | Phase4 public GET; supplied JWT must still verify; original Swagger global Bearer retained as historical evidence. |
| 7. Roles / access | P: anonymous/User public projection; Manager/SuperAdmin administrative content view (Client remains public projection); INFERRED scope policy. [Matrix](CONTENT_AUTHORIZATION_MATRIX.md). |
| 8. Frontend consumers | `dashboard/features/youtube-galleries/services/youtube-galleries-get-by-id-service.ts` |
| 9. Proposed entities | YouTubeGalleries؛ INFERRED، وليست schema أصلية مستخرجة |
| 10. Evidence | DOCUMENTED_IN_OPENAPI (طلب فقط); VERIFIED_FROM_FRONTEND; VERIFIED_FROM_LEGACY_RESPONSE (GET بلا token); Swagger JSON pointer: `#/paths/~1api~1YouTubeGalleries~1get-by-id~1{id}/get` |
| 11. Unknown behavior | U01, U12, U06, U07, U09, U10, U22–U27; historical U12 nonimplementation snapshot superseded. |
| 12. Implementation status | IMPLEMENTED_INTERNAL_NEW_POLICY — SQL-backed, Phase6 internal server-adapter cutover; frozen frontend source; no claim of complete legacy parity. |
| 13. Contract test status | UNIT + REAL_SQL_INTEGRATION + LOCAL_PRODUCTION_HTTP PASS; legacy observation scope and differences documented per operation in CONTENT_API_CONTRACTS. |

## OP-56 — PUT /api/YouTubeGalleries/edit/{id}

| الحقل | النتيجة |
| --- | --- |
| 1. Method / path | `PUT /api/YouTubeGalleries/edit/{id}` |
| 2. Parameters | `id` (path, integer(int32), required) |
| 3. Body schema | [YouTubeGalleriesUpdateCommand](#schema-youtubegalleriesupdatecommand)؛ JSON body اختياري وفق OpenAPI |
| 4. Required / nullable | path:id؛ nullability والقيود الدقيقة في ملحق schemas أدناه |
| 5. Expected response | R-MUTATION: Promise<response.data>؛ شكل النجاح ومحتوى data غير مثبتين؛ VERIFIED_FROM_FRONTEND للـ HTTP/await فقط، UNKNOWN للـ payload.; Phase4 implementation: [CONTENT_API_CONTRACTS](CONTENT_API_CONTRACTS.md), new success contract INFERRED, legacy UNKNOWN. |
| 6. Authentication | Phase4 signed JWT and current SQL-backed session required; original Swagger global Bearer retained as historical evidence. |
| 7. Roles / access | A: canonical Manager/SuperAdmin only; User 403; INFERRED scope policy. [Matrix](CONTENT_AUTHORIZATION_MATRIX.md). |
| 8. Frontend consumers | `dashboard/features/youtube-galleries/services/youtube-galleries-update-service.ts` |
| 9. Proposed entities | YouTubeGalleries؛ INFERRED، وليست schema أصلية مستخرجة |
| 10. Evidence | DOCUMENTED_IN_OPENAPI (طلب فقط); VERIFIED_FROM_FRONTEND; Swagger JSON pointer: `#/paths/~1api~1YouTubeGalleries~1edit~1{id}/put` |
| 11. Unknown behavior | U01, U12, U03, U04, U05, U07, U09, U10, U22–U27; historical U12 nonimplementation snapshot superseded. |
| 12. Implementation status | IMPLEMENTED_INTERNAL_NEW_POLICY — SQL-backed, Phase6 internal server-adapter cutover; frozen frontend source; no claim of complete legacy parity. |
| 13. Contract test status | UNIT + REAL_SQL_INTEGRATION + LOCAL_PRODUCTION_HTTP PASS; legacy observation scope and differences documented per operation in CONTENT_API_CONTRACTS. |

## OP-57 — DELETE /api/YouTubeGalleries/delete/{id}

| الحقل | النتيجة |
| --- | --- |
| 1. Method / path | `DELETE /api/YouTubeGalleries/delete/{id}` |
| 2. Parameters | `id` (path, integer(int32), required) |
| 3. Body schema | لا requestBody موثق |
| 4. Required / nullable | path:id؛ nullability والقيود الدقيقة في ملحق schemas أدناه |
| 5. Expected response | R-MUTATION: Promise<response.data>؛ شكل النجاح ومحتوى data غير مثبتين؛ VERIFIED_FROM_FRONTEND للـ HTTP/await فقط، UNKNOWN للـ payload.; Phase4 implementation: [CONTENT_API_CONTRACTS](CONTENT_API_CONTRACTS.md), new success contract INFERRED, legacy UNKNOWN. |
| 6. Authentication | Phase4 signed JWT and current SQL-backed session required; original Swagger global Bearer retained as historical evidence. |
| 7. Roles / access | A: canonical Manager/SuperAdmin only; User 403; INFERRED scope policy. [Matrix](CONTENT_AUTHORIZATION_MATRIX.md). |
| 8. Frontend consumers | `dashboard/features/youtube-galleries/services/youtube-galleries-remove-service.ts` |
| 9. Proposed entities | YouTubeGalleries؛ INFERRED، وليست schema أصلية مستخرجة |
| 10. Evidence | DOCUMENTED_IN_OPENAPI (طلب فقط); VERIFIED_FROM_FRONTEND; Swagger JSON pointer: `#/paths/~1api~1YouTubeGalleries~1delete~1{id}/delete` |
| 11. Unknown behavior | U01, U12, U03, U04, U05, U07, U09, U10, U22–U27; historical U12 nonimplementation snapshot superseded. |
| 12. Implementation status | IMPLEMENTED_INTERNAL_NEW_POLICY — SQL-backed, Phase6 internal server-adapter cutover; frozen frontend source; no claim of complete legacy parity. |
| 13. Contract test status | UNIT + REAL_SQL_INTEGRATION + LOCAL_PRODUCTION_HTTP PASS; legacy observation scope and differences documented per operation in CONTENT_API_CONTRACTS. |

# ملحق schemas: نسخة وصفية كاملة للطلبات والـ enums

العلامة nullable لا تجعل الحقل required، والعكس صحيح. جميع object schemas: additionalProperties=false. جميع defaults غير موثقة. لا توجد أسماء أعضاء enum في Swagger.

## Schema AdsUpdateCommand

| Property | Type / format | Required | Nullable | Constraints |
| --- | --- | --- | --- | --- |
| `text` | string | لا | نعم | غير موثقة |
| `isExternal` | boolean | لا | لا/غير موسومة | غير موثقة |
| `url` | string | لا | نعم | غير موثقة |
| `fileId` | integer(int32) | لا | نعم | غير موثقة |
| `isActive` | boolean | لا | لا/غير موسومة | غير موثقة |

## Schema BlogPostStatusEnum

DOCUMENTED_IN_OPENAPI: integer(int32)؛ القيم الحرفية: `0, 1, 2`. أسماء القيم/دلالاتها UNKNOWN؛ لا تُنشأ خريطة sort أو purpose من ترتيب حقول object.

## Schema BlogPostsCreateCommand

| Property | Type / format | Required | Nullable | Constraints |
| --- | --- | --- | --- | --- |
| `titleAr` | string | لا | نعم | غير موثقة |
| `titleEn` | string | لا | نعم | غير موثقة |
| `summaryAr` | string | لا | نعم | غير موثقة |
| `summaryEn` | string | لا | نعم | غير موثقة |
| `contentAr` | string | لا | نعم | غير موثقة |
| `contentEn` | string | لا | نعم | غير موثقة |
| `ourSpecialistId` | integer(int32) | لا | لا/غير موسومة | غير موثقة |
| `metaTitleAr` | string | لا | نعم | غير موثقة |
| `metaTitleEn` | string | لا | نعم | غير موثقة |
| `metaDescriptionAr` | string | لا | نعم | غير موثقة |
| `metaDescriptionEn` | string | لا | نعم | غير موثقة |
| `status` | BlogPostStatusEnum | لا | لا/غير موسومة | غير موثقة |
| `isFeatured` | boolean | لا | لا/غير موسومة | غير موثقة |
| `order` | integer(int32) | لا | لا/غير موسومة | غير موثقة |
| `fileId` | integer(int32) | لا | نعم | غير موثقة |

## Schema BlogPostsSortFieldEnum

DOCUMENTED_IN_OPENAPI: integer(int32)؛ القيم الحرفية: `0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17`. أسماء القيم/دلالاتها UNKNOWN؛ لا تُنشأ خريطة sort أو purpose من ترتيب حقول object.

## Schema BlogPostsUpdateCommand

| Property | Type / format | Required | Nullable | Constraints |
| --- | --- | --- | --- | --- |
| `titleAr` | string | لا | نعم | غير موثقة |
| `titleEn` | string | لا | نعم | غير موثقة |
| `summaryAr` | string | لا | نعم | غير موثقة |
| `summaryEn` | string | لا | نعم | غير موثقة |
| `contentAr` | string | لا | نعم | غير موثقة |
| `contentEn` | string | لا | نعم | غير موثقة |
| `ourSpecialistId` | integer(int32) | لا | لا/غير موسومة | غير موثقة |
| `metaTitleAr` | string | لا | نعم | غير موثقة |
| `metaTitleEn` | string | لا | نعم | غير موثقة |
| `metaDescriptionAr` | string | لا | نعم | غير موثقة |
| `metaDescriptionEn` | string | لا | نعم | غير موثقة |
| `status` | BlogPostStatusEnum | لا | لا/غير موسومة | غير موثقة |
| `isFeatured` | boolean | لا | لا/غير موسومة | غير موثقة |
| `order` | integer(int32) | لا | لا/غير موسومة | غير موثقة |
| `fileId` | integer(int32) | لا | نعم | غير موثقة |
| `isActive` | boolean | لا | لا/غير موسومة | غير موثقة |

## Schema ChangePasswordRequest

| Property | Type / format | Required | Nullable | Constraints |
| --- | --- | --- | --- | --- |
| `currentPassword` | string | لا | نعم | غير موثقة |
| `newPassword` | string | لا | نعم | غير موثقة |

## Schema ConfirmEmailRequest

| Property | Type / format | Required | Nullable | Constraints |
| --- | --- | --- | --- | --- |
| `email` | string | لا | نعم | غير موثقة |
| `code` | string | لا | نعم | غير موثقة |

## Schema DisableAgentRequest

| Property | Type / format | Required | Nullable | Constraints |
| --- | --- | --- | --- | --- |
| `email` | string | نعم | لا/غير موسومة | minLength=1 |

## Schema FAQsCreateCommand

| Property | Type / format | Required | Nullable | Constraints |
| --- | --- | --- | --- | --- |
| `questionAr` | string | لا | نعم | غير موثقة |
| `questionEn` | string | لا | نعم | غير موثقة |
| `answerAr` | string | لا | نعم | غير موثقة |
| `answerEn` | string | لا | نعم | غير موثقة |

## Schema FAQsSortFieldEnum

DOCUMENTED_IN_OPENAPI: integer(int32)؛ القيم الحرفية: `0, 1, 2, 3`. أسماء القيم/دلالاتها UNKNOWN؛ لا تُنشأ خريطة sort أو purpose من ترتيب حقول object.

## Schema FAQsUpdateCommand

| Property | Type / format | Required | Nullable | Constraints |
| --- | --- | --- | --- | --- |
| `questionAr` | string | لا | نعم | غير موثقة |
| `questionEn` | string | لا | نعم | غير موثقة |
| `answerAr` | string | لا | نعم | غير موثقة |
| `answerEn` | string | لا | نعم | غير موثقة |
| `isActive` | boolean | لا | لا/غير موسومة | غير موثقة |

## Schema GalleriesCreateCommand

| Property | Type / format | Required | Nullable | Constraints |
| --- | --- | --- | --- | --- |
| `titleAr` | string | لا | نعم | غير موثقة |
| `titleEn` | string | لا | نعم | غير موثقة |
| `descriptionAr` | string | لا | نعم | غير موثقة |
| `descriptionEn` | string | لا | نعم | غير موثقة |
| `beforeFileId` | integer(int32) | لا | نعم | غير موثقة |
| `afterFileId` | integer(int32) | لا | نعم | غير موثقة |

## Schema GalleriesSortFieldEnum

DOCUMENTED_IN_OPENAPI: integer(int32)؛ القيم الحرفية: `0, 1, 2, 3, 4, 5, 6`. أسماء القيم/دلالاتها UNKNOWN؛ لا تُنشأ خريطة sort أو purpose من ترتيب حقول object.

## Schema GalleriesUpdateCommand

| Property | Type / format | Required | Nullable | Constraints |
| --- | --- | --- | --- | --- |
| `titleAr` | string | لا | نعم | غير موثقة |
| `titleEn` | string | لا | نعم | غير موثقة |
| `descriptionAr` | string | لا | نعم | غير موثقة |
| `descriptionEn` | string | لا | نعم | غير موثقة |
| `beforeFileId` | integer(int32) | لا | نعم | غير موثقة |
| `afterFileId` | integer(int32) | لا | نعم | غير موثقة |
| `isActive` | boolean | لا | لا/غير موسومة | غير موثقة |

## Schema LoginRequest

| Property | Type / format | Required | Nullable | Constraints |
| --- | --- | --- | --- | --- |
| `email` | string | لا | نعم | غير موثقة |
| `password` | string | لا | نعم | غير موثقة |
| `code` | string | لا | نعم | غير موثقة |

## Schema OtpPurposeEnum

DOCUMENTED_IN_OPENAPI: integer(int32)؛ القيم الحرفية: `0, 1, 2`. أسماء القيم/دلالاتها UNKNOWN؛ لا تُنشأ خريطة sort أو purpose من ترتيب حقول object.

## Schema OtpRequest

| Property | Type / format | Required | Nullable | Constraints |
| --- | --- | --- | --- | --- |
| `email` | string(email) | لا | نعم | غير موثقة |
| `code` | string | لا | نعم | minLength=6; maxLength=6 |

## Schema OurSpecialistsCreateCommand

| Property | Type / format | Required | Nullable | Constraints |
| --- | --- | --- | --- | --- |
| `nameAr` | string | لا | نعم | غير موثقة |
| `nameEn` | string | لا | نعم | غير موثقة |
| `descriptionAr` | string | لا | نعم | غير موثقة |
| `descriptionEn` | string | لا | نعم | غير موثقة |
| `specialistAr` | string | لا | نعم | غير موثقة |
| `specialistEn` | string | لا | نعم | غير موثقة |
| `fileId` | integer(int32) | لا | نعم | غير موثقة |

## Schema OurSpecialistsSortFieldEnum

DOCUMENTED_IN_OPENAPI: integer(int32)؛ القيم الحرفية: `0, 1, 2, 3, 4, 5, 6, 7`. أسماء القيم/دلالاتها UNKNOWN؛ لا تُنشأ خريطة sort أو purpose من ترتيب حقول object.

## Schema OurSpecialistsUpdateCommand

| Property | Type / format | Required | Nullable | Constraints |
| --- | --- | --- | --- | --- |
| `nameAr` | string | لا | نعم | غير موثقة |
| `nameEn` | string | لا | نعم | غير موثقة |
| `descriptionAr` | string | لا | نعم | غير موثقة |
| `descriptionEn` | string | لا | نعم | غير موثقة |
| `specialistAr` | string | لا | نعم | غير موثقة |
| `specialistEn` | string | لا | نعم | غير موثقة |
| `fileId` | integer(int32) | لا | نعم | غير موثقة |
| `isActive` | boolean | لا | لا/غير موسومة | غير موثقة |

## Schema RegisterRequest

| Property | Type / format | Required | Nullable | Constraints |
| --- | --- | --- | --- | --- |
| `firstName` | string | نعم | لا/غير موسومة | minLength=1 |
| `lastName` | string | نعم | لا/غير موسومة | minLength=1 |
| `email` | string(email) | نعم | لا/غير موسومة | minLength=1 |
| `password` | string | نعم | لا/غير موسومة | minLength=1 |
| `country` | string | لا | نعم | غير موثقة |
| `phoneNumber` | string | نعم | لا/غير موسومة | minLength=1 |

## Schema ResetPasswordRequest

| Property | Type / format | Required | Nullable | Constraints |
| --- | --- | --- | --- | --- |
| `email` | string(email) | نعم | لا/غير موسومة | minLength=1 |
| `code` | string | نعم | لا/غير موسومة | minLength=1 |
| `newPassword` | string | نعم | لا/غير موسومة | minLength=6; maxLength=20 |

## Schema SendOtpRequest

| Property | Type / format | Required | Nullable | Constraints |
| --- | --- | --- | --- | --- |
| `email` | string(email) | نعم | لا/غير موسومة | minLength=1 |
| `purpose` | OtpPurposeEnum | لا | لا/غير موسومة | غير موثقة |

## Schema ServicesCreateCommand

| Property | Type / format | Required | Nullable | Constraints |
| --- | --- | --- | --- | --- |
| `nameAr` | string | لا | نعم | غير موثقة |
| `nameEn` | string | لا | نعم | غير موثقة |
| `simpleDescriptionAr` | string | لا | نعم | غير موثقة |
| `simpleDescriptionEn` | string | لا | نعم | غير موثقة |
| `descriptionAr` | string | لا | نعم | غير موثقة |
| `descriptionEn` | string | لا | نعم | غير موثقة |
| `order` | integer(int32) | لا | لا/غير موسومة | غير موثقة |
| `fileId` | integer(int32) | لا | نعم | غير موثقة |

## Schema ServicesSortFieldEnum

DOCUMENTED_IN_OPENAPI: integer(int32)؛ القيم الحرفية: `0, 1, 2, 3, 4, 5, 6, 7, 8`. أسماء القيم/دلالاتها UNKNOWN؛ لا تُنشأ خريطة sort أو purpose من ترتيب حقول object.

## Schema ServicesUpdateCommand

| Property | Type / format | Required | Nullable | Constraints |
| --- | --- | --- | --- | --- |
| `nameAr` | string | لا | نعم | غير موثقة |
| `nameEn` | string | لا | نعم | غير موثقة |
| `simpleDescriptionAr` | string | لا | نعم | غير موثقة |
| `simpleDescriptionEn` | string | لا | نعم | غير موثقة |
| `descriptionAr` | string | لا | نعم | غير موثقة |
| `descriptionEn` | string | لا | نعم | غير موثقة |
| `order` | integer(int32) | لا | لا/غير موسومة | غير موثقة |
| `fileId` | integer(int32) | لا | نعم | غير موثقة |
| `isActive` | boolean | لا | لا/غير موسومة | غير موثقة |

## Schema SettingUpdateCommand

| Property | Type / format | Required | Nullable | Constraints |
| --- | --- | --- | --- | --- |
| `phoneNumber` | string | لا | نعم | غير موثقة |
| `email` | string | لا | نعم | غير موثقة |
| `address` | string | لا | نعم | غير موثقة |
| `aboutUs_Ar` | string | لا | نعم | غير موثقة |
| `aboutUs_En` | string | لا | نعم | غير موثقة |
| `contactUs_Ar` | string | لا | نعم | غير موثقة |
| `contactUs_En` | string | لا | نعم | غير موثقة |
| `latitude` | number(double) | لا | نعم | غير موثقة |
| `longitude` | number(double) | لا | نعم | غير موثقة |
| `facebookUrl` | string | لا | نعم | غير موثقة |
| `instagramUrl` | string | لا | نعم | غير موثقة |
| `twitterUrl` | string | لا | نعم | غير موثقة |
| `youtubeUrl` | string | لا | نعم | غير موثقة |
| `tiktokUrl` | string | لا | نعم | غير موثقة |
| `faQsTabToggle` | boolean | لا | لا/غير موسومة | غير موثقة |
| `servicesTabToggle` | boolean | لا | لا/غير موسومة | غير موثقة |
| `galleriesTabToggle` | boolean | لا | لا/غير موسومة | غير موثقة |
| `youTubeGalleriesTabToggle` | boolean | لا | لا/غير موسومة | غير موثقة |
| `testimonialsTabToggle` | boolean | لا | لا/غير موسومة | غير موثقة |
| `ourSpecialistsTabToggle` | boolean | لا | لا/غير موسومة | غير موثقة |

## Schema TestimonialsCreateCommand

| Property | Type / format | Required | Nullable | Constraints |
| --- | --- | --- | --- | --- |
| `titleAr` | string | لا | نعم | غير موثقة |
| `titleEn` | string | لا | نعم | غير موثقة |
| `descriptionAr` | string | لا | نعم | غير موثقة |
| `descriptionEn` | string | لا | نعم | غير موثقة |
| `starNumber` | integer(int32) | لا | لا/غير موسومة | غير موثقة |
| `fileId` | integer(int32) | لا | نعم | غير موثقة |

## Schema TestimonialsSortFieldEnum

DOCUMENTED_IN_OPENAPI: integer(int32)؛ القيم الحرفية: `0, 1, 2, 3, 4, 5, 6`. أسماء القيم/دلالاتها UNKNOWN؛ لا تُنشأ خريطة sort أو purpose من ترتيب حقول object.

## Schema TestimonialsUpdateCommand

| Property | Type / format | Required | Nullable | Constraints |
| --- | --- | --- | --- | --- |
| `titleAr` | string | لا | نعم | غير موثقة |
| `titleEn` | string | لا | نعم | غير موثقة |
| `descriptionAr` | string | لا | نعم | غير موثقة |
| `descriptionEn` | string | لا | نعم | غير موثقة |
| `starsNumber` | integer(int32) | لا | لا/غير موسومة | غير موثقة |
| `fileId` | integer(int32) | لا | نعم | غير موثقة |
| `isActive` | boolean | لا | لا/غير موسومة | غير موثقة |

## Schema ToggleTwoFactorRequest

| Property | Type / format | Required | Nullable | Constraints |
| --- | --- | --- | --- | --- |
| — | object فارغ | لا | لا/غير موسومة | لا حقول enabled أو userId؛ لا تُخترع |

## Schema UpdateUserRequest

| Property | Type / format | Required | Nullable | Constraints |
| --- | --- | --- | --- | --- |
| `firstName` | string | لا | نعم | غير موثقة |
| `lastName` | string | لا | نعم | غير موثقة |
| `phoneNumber` | string | لا | نعم | غير موثقة |
| `fileId` | integer(int32) | لا | نعم | غير موثقة |

## Schema UserSortField

DOCUMENTED_IN_OPENAPI: integer(int32)؛ القيم الحرفية: `0, 1, 2, 3, 4`. أسماء القيم/دلالاتها UNKNOWN؛ لا تُنشأ خريطة sort أو purpose من ترتيب حقول object.

## Schema YouTubeGalleriesCreateCommand

| Property | Type / format | Required | Nullable | Constraints |
| --- | --- | --- | --- | --- |
| `titleAr` | string | لا | نعم | غير موثقة |
| `titleEn` | string | لا | نعم | غير موثقة |
| `descriptionAr` | string | لا | نعم | غير موثقة |
| `descriptionEn` | string | لا | نعم | غير موثقة |
| `videoUrl` | string | لا | نعم | غير موثقة |

## Schema YouTubeGalleriesSortFieldEnum

DOCUMENTED_IN_OPENAPI: integer(int32)؛ القيم الحرفية: `0, 1, 2, 3, 4, 5, 6`. أسماء القيم/دلالاتها UNKNOWN؛ لا تُنشأ خريطة sort أو purpose من ترتيب حقول object.

## Schema YouTubeGalleriesUpdateCommand

| Property | Type / format | Required | Nullable | Constraints |
| --- | --- | --- | --- | --- |
| `titleAr` | string | لا | نعم | غير موثقة |
| `titleEn` | string | لا | نعم | غير موثقة |
| `descriptionAr` | string | لا | نعم | غير موثقة |
| `descriptionEn` | string | لا | نعم | غير موثقة |
| `videoUrl` | string | لا | نعم | غير موثقة |
| `isActive` | boolean | لا | لا/غير موسومة | غير موثقة |
