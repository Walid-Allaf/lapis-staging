# File API contract

2026-11-11. Classification: DOCUMENTED_IN_OPENAPI = route/multipart field/header; VERIFIED_FROM_FRONTEND = consumed upload envelope/URL helpers/4 MiB/PDF UI; VERIFIED_FROM_LEGACY_RESPONSE = **no upload response**. Validation/storage/public serving/status/error policies are INFERRED. UNKNOWN includes original allowlist/errors/deduplication/ownership/publication/URL layout and host behavior.

## Upload

`POST /api/FileUpload/upload`, Node runtime, exact case. Header `Authorization: Bearer <signed token>` is mandatory. Accept-Language ar/en/ku follows existing conventions: ar common errors are Arabic; en/ku use English fallback. No Kurdish content is fabricated. Content-Type is multipart/form-data with a valid 1–70-character boundary. Exactly one binary part named `file` with filename and Content-Type is required. Other parts, duplicate headers, secondary files, preambles, epilogues, transfer encoding and incomplete framing fail. Browser FormData is supported unchanged. OriginalName is informational, reduced to its basename and never used in storage keys or response headers.

HTTP200 success has exactly:

```json
{"isSuccess":true,"data":{"fileId":123,"filePath":"uploads/0123456789abcdef0123456789abcdef.png"},"error":null,"paging":null}
```

The example key/ID is illustrative; actual values come from cryptographic randomness and committed SQL identity. No nested object or url/id alias replaces fileId/filePath. Cache-Control:no-store and nosniff apply. Existing getAssetUrl/createAssetUrl append the relative path to the configured base. Current live base stays external; Phase6 requires the final absolute HTTPS same-origin origin (without /api suffix) and approved Next Image hostname configuration.

Failures use non-2xx and `{isSuccess:false,data:null,error:string,paging:null,message:string}`. `message === error` is the narrow Axios compatibility alias. Unlike content APIs, this endpoint preserves the uploader's string-error type. No original upload failure shape was observed, so neither this choice nor its status/messages are historical verification. Framework-generated unsupported methods may have framework405 bodies.

| Condition | Status |
| --- | --- |
| Missing/empty/multiple/wrong field, malformed multipart, invalid signature/container, MIME/content mismatch, interrupted request | 400 |
| Missing, unsigned, tampered, expired, revoked or disabled SQL-backed session | 401 |
| Signed ordinary User or nonadministrative role | 403 |
| Exclusive stage/final/SQL key collision | 409 |
| File bytes >4,194,304 or multipart bytes >4,202,576 | 413 |
| Unsupported MIME or missing/invalid multipart Content-Type/boundary | 415 |
| Database unavailable, write/flush/link failure, metadata inconsistency or unexpected failure | 503 |

No SQL/server paths/stack traces/passwords/tokens are returned. Incorrect present credentials never fall back to anonymous. Authorization is in the service too, not just frontend or route matching.

## Allowlist

| MIME | Generated extension | Checks / explicit restrictions |
| --- | --- | --- |
| image/jpeg | jpg | SOI/EOI, marker bounds, supported SOF0/1/2 dimensions, nonempty scan framing |
| image/png | png | Signature, IHDR, dimensions/depth/color, chunk bounds/CRC, IDAT inflate byte count, IEND, no trailing bytes; Adam7 size accounting |
| image/webp | webp | RIFF/WEBP lengths, permitted chunks, VP8/VP8L signatures/dimensions; animated WebP rejected |
| image/gif | gif | GIF87a/89a, dimensions, palette/subblock/frame/trailer bounds |
| application/pdf | pdf | PDF1.0–1.7 header, EOF, classic xref/trailer/catalog/pages structure; conservative active/encrypted/object-stream exclusions |

Image dimensions are limited to 16 million pixels; PNG decoded byte count is capped at64MiB and streamed/discarded. These are new resource policies. MIME must match content; image/jpg or octet-stream is not silently reclassified. Empty files and SVG/HTML/JS/executables are prohibited. Filename extension is untrusted and ignored for output naming. Container validation is not an antivirus, a complete image codec decoder or a general PDF sanitizer; security and limitations are detailed in FILE_SECURITY.

## Public media reads

`GET /uploads/{key}` and `HEAD /uploads/{key}` are new read-only delivery routes, not an additional original Swagger operation. Key is exactly 32 lower-case hex digits plus an allowlisted extension. Only ready SQL metadata with exact `uploads/<key>`, matching MIME/extension, existing regular private file, exact byte count and SHA-256 is served. Original/imported arbitrary paths are not mapped automatically. No file listings, query-selected paths or bearer tokens in URLs.

200 streams64KiB chunks with correct Content-Type/Length, nosniff, safe generated inline filename, CSP `default-src 'none'; sandbox`, no-referrer, public max-age3600 immutable, ETag=quoted SHA256 and Last-Modified. PDF remains application/pdf with sandbox policy, never image MIME. Rendering in each browser's PDF viewer still needs manual verification. Public approval means an authorized administrative upload intended for public media, not content-reference publication; the opaque URL is public once ready. Unreferenced uploaded media is therefore still public. Do not upload private documents to this endpoint.

Conditional If-None-Match (including weak/wildcard) and If-Modified-Since return304 after metadata/physical verification. GET supports one bounded byte or suffix range206 and If-Range; invalid/multiple/unsatisfiable ranges416. HEAD has no body and ignores Range. Invalid/nonready/missing/inaccessible/mismatched physical media returns404 without paths; SQL unavailability returns sanitized503. Reading never repairs or writes metadata. A withdrawn file may remain in clients' public caches for up to one hour; this endpoint is not a confidential-document revocation system.
