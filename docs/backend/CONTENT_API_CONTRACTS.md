> Phase5 addition: approved uploads now produce real ready dbo.Files IDs/relative paths accepted by these unchanged Phase4 contracts. Local upload→content→media retrieval passed for Services, BlogPosts, OurSpecialists, Gallery before/after, Testimonials and Ads; Phase3 profile ownership is unchanged. No request/DTO/sort/default/visibility policy below changed. See [FILE_API_CONTRACT](FILE_API_CONTRACT.md). Host persistence, legacy imports and final Next Image/transport configuration remain Phase6/7 gates.

# Content API contracts

Phase 4, 2026-11-11. All behavior below not explicitly classified as documented, frontend-verified or legacy-observed is **INFERRED replacement policy**. The original OpenAPI and its full request schemas remain in [API_COMPATIBILITY_MATRIX](API_COMPATIBILITY_MATRIX.md); no canonical field was renamed and no schema or frontend source was rewritten.

## Transport and envelope

Canonical paths and methods in the inventory below are exact and case-sensitive. JSON supports `application/json`, `text/json` and `application/*+json`; optional empty bodies become `{}` and still undergo schema validation. Unknown properties, non-int32 integers, wrong primitive types and prohibited nulls return 400. No string-to-number/body boolean coercion. UTF-8/JSON must be valid; nonempty unsupported bodies return 415 and streamed bodies over 4 MiB return 413. GET/DELETE reject actual request bytes but accept an empty transport stream (Next may provide one for DELETE).

Success is HTTP 200, `{isSuccess:true,data,error:null,paging}`. Lists return `data:DTO[]` and `paging:{pageNumber,pageSize,totalRecords}`. Details, slug and singleton reads return an object and `paging:null`. Create/update return the saved mapped DTO; delete returns `data:null,paging:null`. Mutation success bodies are **INFERRED**, since no legacy writes were exercised.

Failures retain `{isSuccess:false,data:null,error:{code,message,details:null},paging:null}` and add top-level `message` equal to `error.message` for existing consumers. Legacy 400/401/404 structures were observed; exact new codes/messages, other status branches and the alias are INFERRED. Validation 400, absent/invalid session 401, insufficient role 403, missing/hidden record 404, referenced specialist 409, media type 415, body size 413, database/unexpected failure 503. Driver/configuration/credential details never enter responses. Framework-generated unsupported-method responses are 405; direct handler guards also provide structured 405. Next's automatic HEAD/OPTIONS behavior is unchanged.

`Accept-Language` preserves bilingual keys/values for ar/en/ku. Common ar errors have Arabic messages; en/ku use English fallback. Historical message translations/fallbacks remain UNKNOWN. No Kurdish content is generated. All new responses use `Cache-Control:no-store` and `X-Content-Type-Options:nosniff`.

## Narrow frontend tolerances

| Conflict | Canonical contract preserved | Explicit extension |
| --- | --- | --- |
| Seven creates send `isActive` | Swagger create schemas omit this property | Boolean `isActive` accepted on these seven resources only |
| Seven updates send `id` | Path `{id}` is authoritative | Optional int32 body id must equal path; mismatch 400 |
| Testimonial spelling | Create `starNumber`, update `starsNumber` | Update accepts `starNumber`; unequal pair 400; create still rejects `starsNumber` |
| Testimonial DTO | Legacy GET `starsNumber` | Adds `starNumber` with identical numeric value for unchanged frontend |
| Error type mismatch | Structured legacy `error` object | Adds top-level string `message`; no claim all existing UI error presentation was browser-tested |
| Query casing | PascalCase and literal `Sort.Field`/`Sort.Descending` | Recognized query names accept case aliases used by frontend; duplicates, including case variants, fail 400 |

Setting/Ads bodies do not accept the resource id/isActive extensions beyond their own canonical fields. Other unknown JSON fields fail rather than disappear. Unknown query keys are ignored; legacy autocomplete `perPage` and `page` remain ignored, not pagination aliases.

## SQL-to-DTO rules

Every content DTO has numeric `id`, offset-free `createdAt`, boolean `isActive`, and the exact module fields. Services: `nameAr/nameEn`, `simpleDescriptionAr/En`, `descriptionAr/En`, `order`, `avatar`. FAQs: `questionAr/En`, `answerAr/En`. Specialists: `nameAr/En`, `descriptionAr/En`, `specialistAr/En`, `image`. Testimonials: `titleAr/En`, `descriptionAr/En`, `starsNumber` plus alias `starNumber`, `avatar`. Galleries: `titleAr/En`, `descriptionAr/En`, `beforeImage`, `afterImage`. YouTube: `titleAr/En`, `descriptionAr/En`, `videoUrl`. Blog: `titleAr/En`, `summaryAr/En`, `contentAr/En`, `ourSpecialistId`, `metaTitleAr/En`, `metaDescriptionAr/En`, `status`, `isFeatured`, `order`, `image`, `slug`, `updatedAt`, `ourSpecialist`.

Images are `{id:number,filePath:string}` or null, never raw SQL rows, storage keys or invented URLs. Nested blog specialist uses the complete specialist DTO; inactive specialists become null for public reads. Public file paths are exact persisted values joined from ready `dbo.Files`. Supplied file references require existing ready metadata with a nonempty path; specialist references must exist. Omitted blog specialist stores SQL NULL and maps to numeric `ourSpecialistId:0` plus `ourSpecialist:null` to preserve frontend field types; this sentinel branch is INFERRED, never a stored FK 0.

Optional nullable strings store NULL and map to empty strings for frontend consumers that call `.trim()`; nullable images map to null, optional ints/bools default to 0/false. Missing create `isActive` is false. These unobserved default/null branches are new policy, not legacy proof. Explicit nullable null remains SQL NULL. PUT is partial: omitted fields remain unchanged; supplied null is stored only where the canonical schema permits it. No hidden hard minimum title/rating or additional field-length restrictions are imposed beyond int32/enums and bounded transport.

Dates preserve `YYYY-MM-DDTHH:mm:ss` with up to seven fractional digits, no appended `Z` or offset. SQL string projections preserve 100 ns precision; trailing fractional zeros are trimmed. Six/seven digits and no offset were observed; the all-zero fraction branch and UTC storage-to-wire interpretation are inferred. Legacy timezone/instant meaning remains UNKNOWN. Blog updatedAt falls back to createdAt for historical SQL NULL.

## Query, search and sorting

All seven lists accept `PageNumber`, `PageSize`, `Search`, `IsActive`, `Sort.Field`, `Sort.Descending`; Blog also accepts `Status` (0/1/2) and `IsFeatured`. Recognized booleans are literal `true`/`false`. New defaults: page 1, size 10, maximum size 100, ascending; zero/negative paging fails, large page offsets use bigint without integer overflow. IDs are int32, not GUIDs; a valid absent negative id returns 404. Search is parameterized substring search across the explicit module string fields, including Arabic/English, with literal escaping for `~`, `%`, `_`, `[`. Database collation controls case/accent behavior, not Accept-Language. Anonymous/User filters cannot expose inactive/status-withheld rows. Count and page use the same transaction; ties end with Id ascending (the primary selected column honors the requested direction).

Numeric enum values are DOCUMENTED_IN_OPENAPI; **all column meanings/defaults below are INFERRED**, not recovered legacy enum names. Invalid numeric values or user column names fail 400.

| Module | Numeric Sort.Field → fixed SQL column (starting at 0) | Default |
| --- | --- | --- |
| Services | Id, NameAr, NameEn, SimpleDescriptionAr, SimpleDescriptionEn, DescriptionAr, DescriptionEn, SortOrder, CreatedAtUtc | 7 |
| FAQs | Id, QuestionAr, QuestionEn, CreatedAtUtc | 0 |
| OurSpecialists | Id, NameAr, NameEn, DescriptionAr, DescriptionEn, SpecialistAr, SpecialistEn, CreatedAtUtc | 0 |
| Testimonials | Id, TitleAr, TitleEn, DescriptionAr, DescriptionEn, Rating, CreatedAtUtc | 0 |
| Galleries | Id, TitleAr, TitleEn, DescriptionAr, DescriptionEn, CreatedAtUtc, IsActive | 0 |
| YouTubeGalleries | Id, TitleAr, TitleEn, DescriptionAr, DescriptionEn, VideoUrl, CreatedAtUtc | 0 |
| BlogPosts | Id, TitleAr, TitleEn, Slug, SummaryAr, SummaryEn, ContentAr, ContentEn, OurSpecialistId, MetaTitleAr, MetaTitleEn, MetaDescriptionAr, MetaDescriptionEn, Status, IsFeatured, SortOrder, CreatedAtUtc, UpdatedAtUtc | 15 |

## Blog and deletion policies

New blog slugs use titleEn, otherwise titleAr, otherwise `post`: NFKC, lowercase Unicode letters/digits joined by hyphens, first 100 code points, then `-<numeric id>`. A bounded numeric suffix handles a pre-existing imported collision. A unique filtered SHA-256 index and serialized writes protect uniqueness; lookup uses the exact saved slug hash plus full value comparison. Saved slugs never change during title or unrelated updates. Imported slugs are not normalized. Historical slug algorithm, status enum names, redirects and SEO behavior remain UNKNOWN.

Public blogs require IsActive and Status=0. A public sample contained status 0; withholding 1/2 is conservative new policy, not proof of draft/published semantics. Admin may filter/read all values. Delete physically removes only that content row; missing is 404, specialist referenced by any blog is 409, and files are never cascaded/deleted. No soft-delete or automatic file cleanup is inferred from isActive.

## Singleton projections

Settings use Id=1, enforced by the existing schema. GET never seeds; missing singleton is 404. Authorized PUT upserts that one row, initializes toggles false, and applies only supplied fields under an exclusive transaction. The public Client DTO includes exactly the existing `phoneNumber,email,address,aboutUs_Ar,aboutUs_En,contactUs_Ar,contactUs_En,latitude,longitude,facebookUrl,instagramUrl,twitterUrl,youtubeUrl,tiktokUrl,faQsTabToggle,servicesTabToggle,galleriesTabToggle,youTubeGalleriesTabToggle,testimonialsTabToggle,ourSpecialistsTabToggle`. Coordinates remain nullable; strings follow the empty-string DTO policy. Administrative Setting/get currently uses that fieldset because its frontend interface does; legacy administrative success is UNKNOWN. Access and handlers remain separate from Client.

Ads also uses Id=1 with GET 404 when absent and PUT upsert, default false flags. Admin data is `{text,url,isExternal,fileId,isActive,file}` with nullable text/url/fileId/file; this success projection is INFERRED. Client is strictly `{text,url,isActive}`: inactive → `{text:null,url:null,isActive:false}` (legacy-observed branch); active → persisted text/url and true (INFERRED). No file path is invented as the active ad URL, and the historical active/image branch remains UNKNOWN.

Statistics is an explicitly new content-only projection: seven PascalCase resource keys, each `{total,active}` counted from SQL; active means IsActive=1, including blogs of all statuses. It is not the public blog count. No user/account counts are exposed. Original metric names/formulas are UNKNOWN; no historical parity is claimed.

## Per-operation inventory

All rows below are IMPLEMENTED_ISOLATED_NEW_POLICY and have passing real SQL persistence/relationship tests and real local production HTTP success tests. `Observed GET shape` means only the sampled legacy structure/types are reproduced; testimonial aliases are intentional additions. `New contract` leaves legacy success UNKNOWN. Policies P/A are defined in the authorization matrix. No endpoint-level blocker; the media annotation records passing local Phase5 upload/serving, with host verification still pending. Known difference groups: D1 defaults/null/date/query/sort/delete rules above; D2 narrow request/error/DTO extensions; D3 blog visibility/slug; D4 singleton/admin/statistics projections. The legacy evidence does not prove historical write permissions or mutation responses.

| ID | Method and exact path | Implementation / SQL / HTTP | Legacy success evidence | Access | Differences | Blocker |
| --- | --- | --- | --- | --- | --- | --- |
| OP-01 | `GET /api/Ads/get` | Implemented / PASS / PASS | New contract; UNKNOWN legacy success | A | D1/D2/D4 | None; local media E2E Phase5 PASS, host pending |
| OP-02 | `PUT /api/Ads/edit` | Implemented / PASS / PASS | New contract; UNKNOWN legacy success | A | D1/D2/D4 | None; local media E2E Phase5 PASS, host pending |
| OP-10 | `POST /api/BlogPosts/add` | Implemented / PASS / PASS | New contract; UNKNOWN legacy success | A | D1/D2/D3 | None; local media E2E Phase5 PASS, host pending |
| OP-11 | `GET /api/BlogPosts/get-all` | Implemented / PASS / PASS | Observed GET shape | P | D1/D2/D3 | None; local media E2E Phase5 PASS, host pending |
| OP-12 | `GET /api/BlogPosts/get-by-id/{id}` | Implemented / PASS / PASS | Observed GET shape | P | D1/D2/D3 | None; local media E2E Phase5 PASS, host pending |
| OP-13 | `GET /api/BlogPosts/by-slug/{slug}` | Implemented / PASS / PASS | Observed GET shape | P | D1/D2/D3 | None; local media E2E Phase5 PASS, host pending |
| OP-14 | `PUT /api/BlogPosts/edit/{id}` | Implemented / PASS / PASS | New contract; UNKNOWN legacy success | A | D1/D2/D3 | None; local media E2E Phase5 PASS, host pending |
| OP-15 | `DELETE /api/BlogPosts/delete/{id}` | Implemented / PASS / PASS | New contract; UNKNOWN legacy success | A | D1/D2/D3 | None; local media E2E Phase5 PASS, host pending |
| OP-16 | `GET /api/Client/get-ads` | Implemented / PASS / PASS | Observed GET shape | P | D1/D2/D4 | None; local media E2E Phase5 PASS, host pending |
| OP-17 | `GET /api/Client/get-settings` | Implemented / PASS / PASS | Observed GET shape | P | D1/D2/D4 | None |
| OP-18 | `POST /api/FAQs/add` | Implemented / PASS / PASS | New contract; UNKNOWN legacy success | A | D1/D2 | None |
| OP-19 | `GET /api/FAQs/get-all` | Implemented / PASS / PASS | Observed GET shape | P | D1/D2 | None |
| OP-20 | `GET /api/FAQs/get-by-id/{id}` | Implemented / PASS / PASS | Observed GET shape | P | D1/D2 | None |
| OP-21 | `PUT /api/FAQs/edit/{id}` | Implemented / PASS / PASS | New contract; UNKNOWN legacy success | A | D1/D2 | None |
| OP-22 | `DELETE /api/FAQs/delete/{id}` | Implemented / PASS / PASS | New contract; UNKNOWN legacy success | A | D1/D2 | None |
| OP-24 | `POST /api/Galleries/add` | Implemented / PASS / PASS | New contract; UNKNOWN legacy success | A | D1/D2 | None; local media E2E Phase5 PASS, host pending |
| OP-25 | `GET /api/Galleries/get-all` | Implemented / PASS / PASS | Observed GET shape | P | D1/D2 | None; local media E2E Phase5 PASS, host pending |
| OP-26 | `GET /api/Galleries/get-by-id/{id}` | Implemented / PASS / PASS | Observed GET shape | P | D1/D2 | None; local media E2E Phase5 PASS, host pending |
| OP-27 | `PUT /api/Galleries/edit/{id}` | Implemented / PASS / PASS | New contract; UNKNOWN legacy success | A | D1/D2 | None; local media E2E Phase5 PASS, host pending |
| OP-28 | `DELETE /api/Galleries/delete/{id}` | Implemented / PASS / PASS | New contract; UNKNOWN legacy success | A | D1/D2 | None; local media E2E Phase5 PASS, host pending |
| OP-29 | `POST /api/OurSpecialists/add` | Implemented / PASS / PASS | New contract; UNKNOWN legacy success | A | D1/D2 | None; local media E2E Phase5 PASS, host pending |
| OP-30 | `GET /api/OurSpecialists/get-all` | Implemented / PASS / PASS | Observed GET shape | P | D1/D2 | None; local media E2E Phase5 PASS, host pending |
| OP-31 | `GET /api/OurSpecialists/get-by-id/{id}` | Implemented / PASS / PASS | Observed GET shape | P | D1/D2 | None; local media E2E Phase5 PASS, host pending |
| OP-32 | `PUT /api/OurSpecialists/edit/{id}` | Implemented / PASS / PASS | New contract; UNKNOWN legacy success | A | D1/D2 | None; local media E2E Phase5 PASS, host pending |
| OP-33 | `DELETE /api/OurSpecialists/delete/{id}` | Implemented / PASS / PASS | New contract; UNKNOWN legacy success | A | D1/D2 | None; local media E2E Phase5 PASS, host pending |
| OP-34 | `POST /api/Services/add` | Implemented / PASS / PASS | New contract; UNKNOWN legacy success | A | D1/D2 | None; local media E2E Phase5 PASS, host pending |
| OP-35 | `GET /api/Services/get-all` | Implemented / PASS / PASS | Observed GET shape | P | D1/D2 | None; local media E2E Phase5 PASS, host pending |
| OP-36 | `GET /api/Services/get-by-id/{id}` | Implemented / PASS / PASS | Observed GET shape | P | D1/D2 | None; local media E2E Phase5 PASS, host pending |
| OP-37 | `PUT /api/Services/edit/{id}` | Implemented / PASS / PASS | New contract; UNKNOWN legacy success | A | D1/D2 | None; local media E2E Phase5 PASS, host pending |
| OP-38 | `DELETE /api/Services/delete/{id}` | Implemented / PASS / PASS | New contract; UNKNOWN legacy success | A | D1/D2 | None; local media E2E Phase5 PASS, host pending |
| OP-39 | `GET /api/Setting/get` | Implemented / PASS / PASS | New contract; UNKNOWN legacy success | A | D1/D2/D4 | None |
| OP-40 | `GET /api/Setting/get-statistic` | Implemented / PASS / PASS | New contract; UNKNOWN legacy success | A | D1/D2/D4 | None |
| OP-41 | `PUT /api/Setting/edit` | Implemented / PASS / PASS | New contract; UNKNOWN legacy success | A | D1/D2/D4 | None |
| OP-42 | `POST /api/Testimonials/add` | Implemented / PASS / PASS | New contract; UNKNOWN legacy success | A | D1/D2 | None; local media E2E Phase5 PASS, host pending |
| OP-43 | `GET /api/Testimonials/get-all` | Implemented / PASS / PASS | Observed GET shape + rating alias | P | D1/D2 | None; local media E2E Phase5 PASS, host pending |
| OP-44 | `GET /api/Testimonials/get-by-id/{id}` | Implemented / PASS / PASS | Observed GET shape + rating alias | P | D1/D2 | None; local media E2E Phase5 PASS, host pending |
| OP-45 | `PUT /api/Testimonials/edit/{id}` | Implemented / PASS / PASS | New contract; UNKNOWN legacy success | A | D1/D2 | None; local media E2E Phase5 PASS, host pending |
| OP-46 | `DELETE /api/Testimonials/delete/{id}` | Implemented / PASS / PASS | New contract; UNKNOWN legacy success | A | D1/D2 | None; local media E2E Phase5 PASS, host pending |
| OP-53 | `POST /api/YouTubeGalleries/add` | Implemented / PASS / PASS | New contract; UNKNOWN legacy success | A | D1/D2 | None |
| OP-54 | `GET /api/YouTubeGalleries/get-all` | Implemented / PASS / PASS | Observed GET shape | P | D1/D2 | None |
| OP-55 | `GET /api/YouTubeGalleries/get-by-id/{id}` | Implemented / PASS / PASS | Observed GET shape | P | D1/D2 | None |
| OP-56 | `PUT /api/YouTubeGalleries/edit/{id}` | Implemented / PASS / PASS | New contract; UNKNOWN legacy success | A | D1/D2 | None |
| OP-57 | `DELETE /api/YouTubeGalleries/delete/{id}` | Implemented / PASS / PASS | New contract; UNKNOWN legacy success | A | D1/D2 | None |
