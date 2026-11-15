# Private local media architecture

One existing Next App Router process/application, existing SQL pool, existing `dbo.Files`, and one operator-configured persistent directory. No default UPLOAD_DIR is silently chosen. There are no uploads under public, .next, the checkout, a deployment artifact or a temporary fallback.

## Physical layout

```text
<absolute private UPLOAD_DIR>/
  .lapis-media-v1
  staging/<32hex>.part
  objects/<32hex>.<jpg|png|webp|gif|pdf>
```

The configured path must be absolute, dedicated, neither inside nor an ancestor of the running project root, and not a filesystem root, UNC/device path or symlink/junction path. Newly created directories use0700 and files0600 where the OS honors Unix modes. Windows requires explicit NTFS ACLs; those modes do not establish IIS app-pool identity rights. Existing nonempty directories without the ownership marker are rejected. The application safely creates missing directories only for an authenticated upload; serving/recovery do not initialize a new store. Parent lstat and realpath checks reject static symlinks/junctions; regular-file handles are checked against named file identity before use. See FILE_SECURITY for local filesystem trust assumptions.

Generate a cryptographically random128-bit token, exclusively create the stage with wx, ignore client paths, and retry occupied stage/final tokens at most four times. No upload request enumerates the objects directory; collision probes cover five fixed extensions. Stage and final directories reside on the same filesystem. Finalization uses an exclusive hard link, so it never replaces a destination (rename can replace on some platforms). Hosts lacking hard-link support fail safely; no unsafe copy/overwrite fallback is used. The staging link is removed only after readiness commit; a retained redundant hard link shares the same bytes and is harmless to metadata/public access.

## Lifecycle and consistency

1. Verify JWT signature/claims and current SQL session/Manager or SuperAdmin role under the existing auth state lock. No upload bytes or directories are touched before this check.
2. Stream and count the one multipart file into exclusive stage; compute SHA-256 incrementally. Bound file4MiB, headers8192bytes, whole multipart4,202,576bytes. An aborted/malformed request before registration closes and removes only its own stage.
3. Flush/fsync and close stage. Read at most4MiB once for bounded content/container validation; PNG inflation is streamed/discarded, not an allocated bitmap.
4. Reauthorize under auth lock, then per-key `LAPiS:media:<key>` lock. Insert accurate pending metadata in the first SQL transaction. Unique StorageKey protects SQL identity. No migration/seed runs from HTTP.
5. In a second auth→media locked transaction, reauthorize, check pending row/owner/key, verify stage metadata/hash, create exclusive final link and verify final regular-file length/hash. Update StorageState to ready and record the security event, then commit.
6. Return the committed numeric fileId and relative public path. Best-effort unlink of the redundant owned stage follows commit; failure there never rolls back a valid ready object.

These two systems do not form one atomic transaction. A crash/SQL acknowledgement failure can leave pending rows, stages without rows or final objects with pending rows. No success is returned on that failure. Preserve ambiguous bytes rather than delete a possibly committed file; private recovery handles them. A power failure, administrator deletion, disk corruption or external ACL change can still make a formerly ready object unavailable: serving verifies bytes and fails404; explicit recovery can withdraw the row. Content and file FKs are never deleted as compensation.

## Metadata and references

No schema changes: seven existing migrations/19 tables remain. StorageKey, PublicPath, sanitized OriginalName, normalized MIME, accurate ByteLength, binary SHA256, actual CreatedByUserKey, pending/ready/failed and SQL UTC CreatedAtUtc use existing columns. The existing schema permits state strings; the service defines these meanings without rewriting imported rows. No deduplication by hash is assumed; identical uploads get distinct numeric IDs/keys.

Services/Blog/Specialists/Galleries/Testimonials/Ads use the unchanged Phase4 ready-metadata checks and DTO joins. Gallery before and after IDs are independent. The unchanged Phase3 profile policy permits only a file owned by that account; ordinary Users still cannot upload here or borrow administrative media. Several content entities may share a file. Deleting one entity does not delete metadata/bytes. Failed file-state withdrawal does not clear content FKs; content joins treat unavailable files as absent, while old profile mapping may retain its saved path and public retrieval still404s. This is an operational repair situation, not an automatic contract rewrite.

## Read/performance behavior

Resolve only generated keys through the unique SQL StorageKey index and ready state. Exact physical SHA256/length is verified in64KiB reads before response headers; the same open handle then streams the requested bytes. This uses two disk passes for a full GET, with bounded memory and no whole-file serving copy. HEAD/304 also verify consistency before returning. Per-request signature validation holds at most4MiB input; no new codec/processing dependency, memory cache or background process is required. Existing shared pool defaults3/min0; no per-upload pool. Resource cost grows with concurrent authorized uploads and checksum reads; host load/quota/timeouts must be measured. No claim of a global upload concurrency or disk quota limiter is made.

Explicit recovery is private, bounded to100 SQL rows plus100 staging entries per call; no request-triggered repair or destructive GC. Detailed cursor/retention behavior is in STORAGE_RECOVERY.
