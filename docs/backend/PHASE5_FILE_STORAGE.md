# Phase 5: compatible upload and private persistent media

2026-11-11. **POST `/api/FileUpload/upload` is implemented and locally verified**, using the existing Next.js 16.4.6 application, signed Phase 3 JWT/SQL sessions, existing `dbo.Files` and configurable private local storage. Public GET/HEAD `/uploads/{key}` streams approved ready media. No new database migration, table, dependency, separate server, daemon, cloud storage or IIS configuration was added.

The website/dashboard source, upload component, DTOs, Axios, URL helpers, cookies, sessions, proxy, Next image configuration and live ASP.NET base URL remain unchanged. No production migration, deployment, legacy write or Phase 6 cutover occurred. Of 57 original operations, 56 now have isolated implementations; the Phase 3 public toggle-2fa workflow remains explicitly blocked.

Read [FILE_API_CONTRACT](FILE_API_CONTRACT.md), [STORAGE_ARCHITECTURE](STORAGE_ARCHITECTURE.md), [FILE_SECURITY](FILE_SECURITY.md), [STORAGE_RECOVERY](STORAGE_RECOVERY.md) and [MONSTERASP_STORAGE_CHECKLIST](MONSTERASP_STORAGE_CHECKLIST.md). These documents distinguish frontend-proven expectations from new storage policies. Original upload success/failure was never probed; no historical upload parity is claimed.

## Audit findings and compatibility

Swagger documents exact POST casing and multipart binary field `file`, but no success schema. `dashboard/components/form/image-upload.tsx` actually creates FormData, calls `FileUpload/upload`, sets Formik from `data.fileId`, stores `data.filePath`, and recognizes PDF through MIME/path with iframe preview. All five content forms use accept `*`; that is not authorization to accept arbitrary types. `dashboard/api/upload-limits.ts` fixes 4 MiB. Axios consumes top-level error `message`; ImageUpload consumes string `error` for resolved unsuccessful payloads. Upload therefore uses its own string-error contract, without replacing Phase 3/4 structured errors.

`dashboard/api/urls.ts` removes one historical pipe and combines relative file paths with NEXT_PUBLIC_API_BASE_URL. `lib/api/client.ts` similarly prefixes public asset paths. Services/Testimonial `avatar`, Specialist/Blog `image`, Gallery `beforeImage/afterImage`, Ads file metadata, and Phase 3 profile image all refer to numeric file IDs and nested `{id,filePath}`. The new upload response remains `{fileId,filePath}`. No IDs are renamed between these boundaries.

The public services/specialists/testimonials/galleries/blog helpers call createAssetUrl. Public components use Next Image; rich-text HTML additionally passes `lib/sanitize-html.ts`, which permits HTTPS/relative uploads paths. Dashboard forms and table/detail previews use the unchanged getAssetUrl/img/PDF logic. These existing consumers and transformations were inspected. Phase 6 must configure the final absolute same-origin API base **and the final hostname in Next images.remotePatterns**; the current allowlist only includes lapis.runasp.net/uploads. No Phase 5 configuration switch was made. PDF is a document, not a valid source for a Next Image slot; use approved image types in image-only content fields.

## Lifecycle and limits

Only canonical Manager/SuperAdmin may upload. SQL-backed authorization precedes request-body reads/storage creation and is checked again at registration and readiness. Input streams into a private exclusive staging file with 4,194,304-byte actual-file and 4,202,576-byte total-body caps. Exactly one named part is accepted; empty/malformed/multiple files fail. Validated types: JPEG, PNG, static WebP, GIF, and a conservative PDF 1.x subset. Structural checks, dimension limits and PDF exclusions are explicit new policies, not recovered legacy validation rules.

File bytes are flushed, content validated, SHA-256/length/MIME/owner recorded as pending, then linked exclusively into final storage and verified before the ready SQL commit. Success is returned only afterward. Per-file locks serialize finalization/recovery; the existing auth lock prevents identity changes racing the protected commits. There is no filesystem/SQL atomicity claim. Ambiguous failures retain bytes for private explicit recovery, never report success or delete content. See the recovery state table.

## Verification results

| Check | Result |
| --- | --- |
| test:files | 11 passing unit/contract/filesystem/security cases |
| test:files:integration | 12 passing leaf cases + parent (13 reported), real SQL and filesystem, zero skips |
| Existing test:content / test:db / test:auth | 10 / 21 / 11 passing |
| Existing dashboard auth / sanitize / proxy | 4 / 6 / 7 passing |
| Existing SQL content / foundation / auth integration | 13 / 11 / 18 passing leaf cases; all actual content routes preserved |
| Production Next HTTP | Upload/retrieval/content reference200, Range206, conditional304, HEAD200, exact4MiB200, oversize413, anonymous401, wrong method405; same ID/path/bytes after full Next process restart |
| Typecheck / lint / production build | Passed; lint0 errors, 12 existing frontend warnings |

Total **124 passing leaf tests** (128 reported including four integration parents), plus production HTTP verification. ImageUpload's actual unchanged TSX input handler ran with test-only hook/transport adapters against the real upload handler and SQL; both PNG and PDF results were consumed successfully and its actual failure branch cleared the field. Public retrieval used exact original bytes. This is not a full browser PDF-renderer or final-site cutover test.

Tests cover bad authorization/tampered/disabled sessions, all formats, true 4MiB boundary, multiple/missing/empty files, MIME mismatch, malicious names/traversal, symlink/junction rejection, collisions, interrupted streams, storage and actual SQL DML failures, recovery, missing/corrupt media, concurrent uploads, shared references, gallery before/after, unchanged profile ownership, and fresh-process persistence. New synthetic 2x2 fixtures contain no user data; existing local Sharp generated these test bytes only and is not imported into the new runtime. No package/lock dependency changes.

Each SQL suite used a new acknowledged disposable database and scoped temporary login; storage tests used newly created OS temporary directories. No applied migration 0001–0007 changed. The old Phase 4 test that asserted upload absence now asserts its POST export; every content-route assertion remains. No prior behavior assertion was removed. Temporary credentials are removed and generated logins disabled after final verification; databases remain without reset/drop.

## Remaining host and integration gates

Local restart persistence passed. **MonsterASP.NET redeploy persistence has not been tested.** The private absolute path, ACLs, same-volume hard links, filesystem flush semantics, storage quota, backup/restore and Git Deploy behavior require the separate Phase 7 checklist. Local tests do not establish host access or power-loss durability. Original file import, final Next Image hostname configuration, internal transport dispatch and cache/session coordination belong to explicitly instructed Phase 6. No automatic garbage collector or destructive orphan cleanup exists.

Final SHA-256 preservation audit passed over 562 pre-existing files. Only the 11 explicitly listed source/test/documentation files below changed. All existing frontend components/pages/forms/services/DTOs/hooks/translations, dashboard sessions/proxy, public helpers, Next configuration, actual .env, package-lock, Phase3/4 runtime and migrations0001–0007 matched their start-of-Phase5 hashes.

## Exact Phase 5 change inventory

New files (22):

- `app/api/FileUpload/upload/route.ts`
- `app/uploads/[key]/route.ts`
- `docs/backend/FILE_API_CONTRACT.md`
- `docs/backend/FILE_SECURITY.md`
- `docs/backend/MONSTERASP_STORAGE_CHECKLIST.md`
- `docs/backend/PHASE5_FILE_STORAGE.md`
- `docs/backend/STORAGE_ARCHITECTURE.md`
- `docs/backend/STORAGE_RECOVERY.md`
- `scripts/db/recover-storage.mjs`
- `server/backend/http/file-handler.ts`
- `server/backend/modules/files/errors.ts`
- `server/backend/modules/files/multipart.ts`
- `server/backend/modules/files/service.ts`
- `server/backend/modules/files/storage.ts`
- `server/backend/modules/files/validation.ts`
- `tests/backend/file-fixtures.mjs`
- `tests/backend/files.integration.test.mjs`
- `tests/backend/files.test.mjs`
- `tests/backend/fixtures/media/pixel.gif`
- `tests/backend/fixtures/media/pixel.jpg`
- `tests/backend/fixtures/media/pixel.png`
- `tests/backend/fixtures/media/pixel.webp`

Existing files changed (11):

- `.env.example`
- `AGENTS.md`
- `docs/backend/API_COMPATIBILITY_MATRIX.md`
- `docs/backend/CONTENT_API_CONTRACTS.md`
- `docs/backend/DATABASE_DESIGN.md`
- `docs/backend/DEPLOYMENT_RUNBOOK.md`
- `docs/backend/IMPLEMENTATION_PLAN.md`
- `docs/backend/RESPONSE_CONTRACTS.md`
- `docs/backend/UNKNOWN_BEHAVIORS.md`
- `package.json`
- `tests/backend/content.test.mjs`
