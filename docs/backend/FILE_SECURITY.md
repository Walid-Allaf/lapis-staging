# File security policies and limits

All policies here are new INFERRED safeguards; original upload validation/access/publication behavior is UNKNOWN. There is no legacy upload fixture. Preserve the frontend contract without describing these choices as historical parity.

## Identity and public scope

Only signed, current Phase3 SQL-backed Manager/Manager or SuperAdmin/SuperAdmin identities upload. User, malformed/unsigned/tampered/expired/revoked/disabled sessions fail. Authorization happens before body/storage work and again in both commits. The auth lock precedes per-media lock, compatible with existing identity state changes. No public bypass, cookie decoder authorization or new role bootstrap exists. Profile ownership and stricter SuperAdmin User administration remain unchanged.

Administrative uploads are approved **public media** once ready, even before a content entity references them. They are not private attachments. Public routes require no token/cookie and disclose no owner/original filename/storage root. A128-bit random token prevents practical enumeration but is not confidentiality authorization. Public caching is limited to one hour; withdrawing ready state cannot revoke previously cached/downloaded copies.

## Transport and file validation

The endpoint streams one exact file part, counts actual bytes regardless of Content-Length and bounds framing/header memory. Oversized, empty, malformed, extra-field/file and interrupted streams fail; declared/actual body length disagreements fail. Before metadata attempt, only that request's exclusive stage is removed. Request and storage/database failures use sanitized upload string errors and top-level message, never stack traces/query strings/filesystem paths.

MIME is a strict five-type allowlist and must match binary/container structure. Input filename extension does not choose output type or disk path. PNG validates CRC and compressed byte count with16-million-pixel/64MiB decoded limits. JPEG/GIF/static WebP check signatures, dimensions, marker/chunk/frame bounds and exact container ending. They are not fully decoded/reencoded or stripped of metadata, so these checks are **not proof every codec bitstream is decodable**, nor an antivirus/content moderation system. The browser receives the enforced allowlisted type with nosniff and a sandbox CSP. Sophisticated codec exploits and malicious image metadata remain browser/decoder patching considerations; no universal sanitized-image claim is made.

PDF support is justified by actual ImageUpload PDF icon/iframe code. The accepted subset uses PDF1.0–1.7 with classic xref/trailer/catalog/pages structure. Reject names for JS/JavaScript/OpenAction/AA/Launch/EmbeddedFile(s)/Filespec/RichMedia/XFA/AcroForm/Encrypt/ObjStm/GoToR/SubmitForm/URI, including hex-escaped names. Encrypted, interactive, object-stream/xref-stream, linked/action-bearing and PDF2.0 documents may be refused. This conservative structural filter is **not a general PDF parser/sanitizer or malware scanner**. PDF remains application/pdf, generated inline .pdf name, nosniff and sandbox/default-src-none CSP for the unchanged iframe flow. Verify actual target browsers' PDF behavior in Phase7; never claim arbitrary PDFs become inert or image-compatible. If broader document support/private documents are needed, design that separately instead of weakening the public-media boundary silently.

## Filesystem boundary

Only configured private storage and generated keys are accepted. Reject deployment-root/ancestor/drive-root/relative/UNC/device paths and static symlink/junction ancestors. Every read requires regular-file lstat/open/fstat identity checks plus exact metadata/hash/length. Exclusive wx stage creation and same-volume exclusive link finalization prevent collision overwrites. Filename paths, encoded separators, drive names and traversal cannot select a file. No listing or unrestricted static/public directory is exposed. Never map imported arbitrary PublicPath into local filesystem paths.

Node's path checks are not an OS sandbox. A privileged local actor able to swap directories/reparse points concurrently or rewrite live files is outside this protection; dedicated NTFS ACLs and keeping UPLOAD_DIR outside IIS direct exposure are required. No public user has filesystem privileges. Node/Windows do not offer a portable transactional open-relative-dir facility; do not treat lstat checks as protection against a compromised host administrator. Disk flush/journal/power-loss durability and hard links require host verification.

## Failure and maintenance

No ready commit precedes physical validation. On ambiguity, return failure, retain pending bytes/metadata, and use explicit private recovery. Public reads do not change SQL state. Recovery never deletes content or orphan files and never promotes failed/imported keys automatically. Failed/unavailable metadata keeps FK references for operator repair. See STORAGE_RECOVERY for guarded repair and backup/restore. No unrequested antivirus service, scheduled daemon, external paid service or destructive garbage collector was introduced.
