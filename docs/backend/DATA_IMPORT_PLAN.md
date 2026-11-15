> Phase7 clean-start policy (2026-11-11) supersedes historical release requirements below. Use a NEW database, immutable migrations0001-0007, explicit neutral initialization and one operator-supplied SuperAdmin; empty content/uploads; NO historical import or credential transfer. Phase7A is local only. Read [PHASE7_RELEASE_READINESS](PHASE7_RELEASE_READINESS.md), [PHASE7_MIGRATION_BOOTSTRAP](PHASE7_MIGRATION_BOOTSTRAP.md) and [PHASE7_RELEASE_RUNBOOK](PHASE7_RELEASE_RUNBOOK.md) for current evidence, guarded production CLI design and remaining blockers. No hosting/deployment authorization is implied. Older phase statements below describe their historical scope.

# Legacy data inventory and safe import plan

Phase6, 2026-11-11. **No legacy business data, users or media were imported into SQL.** No existing new SQL data was overwritten, no synthetic production content was created and no mutating request was sent to ASP.NET. Read-only inventory and dry-run validation are implemented; a write/apply importer is deliberately not implemented without complete authorized exports and a reviewed target/merge decision.

## Public inventory actually observed

Explicitly invoked scripts/import/inventory.mjs accessed only seven public get-all endpoints (PageNumber/PageSize100/IsActive), two Client GETs and referenced same-origin /uploads media. It never sent credentials or accessed protected User/Ads/Setting datasets. Pages and byte reads are bounded; redirects/unreviewed origins and oversized media are rejected. The command is not imported by runtime/startup.

| Public module | Rows / reported total | Duplicate IDs / slugs |
| --- | --- | --- |
| Services |3 /3 |0 |
| FAQs |3 /3 |0 |
| OurSpecialists |2 /2 |0 |
| Testimonials |3 /3 |0 |
| Galleries |1 /1 |0 |
| YouTubeGalleries |1 /1 |0 |
| BlogPosts |2 /2 |0 |

Total15 public records,9 distinct file IDs; Client settings/ads returned200. All9 referenced public media streams were SHA256-hashed with actual byte counts and reported MIME (without saving image files). Distinct file IDs4/5 shared the same content hash; preserve both logical IDs/relationships, do not auto-merge them. Raw content, names/emails, URLs and credentials are not printed in the inventory report; it contains aggregate counts and public numeric file/hash metadata only. The report remains outside the checkout. No protected or inactive dataset completeness is implied by these public counts.

## Commands and dry-run schema

`npm run import:inventory` performs the fixed-origin public GET inventory. DATA_INVENTORY_REPORT may select a new absolute report file outside the repository; exclusive creation prevents silent overwrite. Only invoke it explicitly, never at application startup. Current internal application workflows do not use this command or the original host.

`npm run import:dry-run` reads an operator-supplied absolute DATA_IMPORT_SOURCE JSON (max25MiB) and optionally exclusively writes DATA_IMPORT_REPORT outside the checkout. It never opens a SQL write transaction or fetches supplied URLs. Source shape:

```text
{ exportVersion:1,
  modules:{Services:DTO[], FAQs:DTO[], OurSpecialists:DTO[], Testimonials:DTO[],
           Galleries:DTO[], YouTubeGalleries:DTO[], BlogPosts:DTO[]},
  files:[{id,filePath,mimeType,byteLength,sha256}], settings:{...} }
```

The analysis validates positive int32 IDs, duplicate IDs/exact saved slugs, canonical field types, explicit active/status/date state, testimonial rating aliases, file relationships and blog specialist relationships. Missing media hash/type/length and absent datasets become review issues. It proposes `{legacyId,proposedId}` identity mappings for an **empty target** and preserves source objects unchanged. It does not verify physical bytes merely because a supplied hash is well formed: physical validation and backup/count comparison remain gates. Reports declare mode=dry-run,writes=0,applySupported=false and omit source text/paths/credentials. An issue-free report is not authorization or proof of historic completeness.

## Reviewed future apply procedure — not executed

1. Obtain a complete dated authorized export from the owner, including inactive/status-withheld content, administrative singleton fields, all relationships/files and schema/type/null/date meanings. Public GET snapshots alone cannot supply these. User/role/password/2FA datasets require separately authorized secure exports/configuration; never scrape protected records, log tokens or invent accounts.
2. Inventory the target read-only, verify actual DB identity/schema0001–0007 and paired SQL/media backups. Default to a new empty reviewed nonproduction target. Any populated target/ID collision needs an explicit merge/overwrite authorization; a dry-run mapping is not permission to overwrite.
3. Import Files before references and Specialists before Blogs. Preserve legacy numeric IDs using a reviewed identity-insert procedure only on the empty target, or create durable per-module legacy→new maps and rewrite every FK explicitly. Preserve independent gallery IDs, shared file references, bilingual strings/NULLs/flags/status/order and exact immutable blog slugs. Do not regenerate/normalize saved slugs or infer missing dates/defaults.
4. Copy each authorized media stream into the Phase5 private staging lifecycle, validate allowed format/size, byte count and SHA256, generate safe local keys, and map legacy FileId to its new ID/path. Do not trust an old path as a local filename. Replace every nested/reference PublicPath with a local uploads/key path so runtime media does not depend on the old host. Unsupported files need explicit review, not renamed extensions or invented URLs. Keep old file ownership unresolved unless an authorized identity map establishes it.
5. Commit module batches with FK/unique-slug checks and checkpoint/reporting; no auto-resume of an ambiguous failed batch. Compare source/target counts by module/state, every relationship, text/date snapshots, all file hashes and representative public/admin DTOs. Test saved slug URLs/SEO and exact image retrieval with legacy blocked. Clear/rebuild public caches after the reviewed import.
6. Identity import requires a compatible verified ASP.NET password scheme or a separately approved reset campaign; current scrypt cannot interpret unknown hashes. Never insert default passwords, promote roles from display strings or disable2FA to force compatibility. Existing2FA-enabled accounts need an approved challenge flow before dashboard cutover.
7. Produce an access-controlled import report with source provenance, date, counts, maps, hashes, conflicts, skipped/unavailable records and rollback checkpoint. Run a second dry-run/verification that reports zero drift. Do not publish protected exports or secrets in Git/logs.

Remaining blockers: no complete authorized historical export/identity credentials, no approved merge target or write importer, no final host byte backup/restore/import rehearsal. Public content is obtainable as the limited inventory above; that does not establish full historical data completeness. The new backend operates independently with new SQL data, but a production cutover must not mistake an empty target for a successful migration.
