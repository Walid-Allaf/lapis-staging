# Storage recovery and backup

SQL and the local filesystem cannot commit atomically. Recovery is explicit and private; no public endpoint, startup migration, recurring job, automatic orphan GC or content deletion exists.

## States and interruption outcomes

| Interruption | Durable evidence / behavior | Operator action |
| --- | --- | --- |
| During multipart write/validation | No SQL row; current request normally closes/removes its own stage | A process crash can leave an unregistered .part; audit reports it, retain for reviewed cleanup |
| SQL pending registration fails/acknowledgement unknown | No success; stage retained because registration may have committed | Check exact DB row/key and byte metadata, never infer rollback from an HTTP503 |
| After pending commit, before final link | Pending row + stage, not publicly accessible | After age threshold, explicit repair verifies content/hash and exclusively finalizes |
| Final link exists, ready SQL commit fails | Pending row + final/stage links, not publicly accessible | Explicit repair validates final bytes and promotes pending |
| Ready committed, stage unlink fails | Ready row and valid final; success remains valid; redundant hard link may remain | Retain; reviewed staging maintenance is separate from content/orphan GC |
| Former ready file missing/corrupt/inaccessible | Public404, no read-side mutation | Audit then explicit repair marks failed, retaining bytes/FKs; restore from trusted backup |
| Existing failed row / non-generated imported key | Never auto-promoted or reinterpreted | Manual review/import/recovery design; no force retry |

Pending younger than **one hour** is skipped to avoid racing an active upload. Upload finalization and repair hold the same per-key SQL application lock; recovery rereads the row under UPDLOCK/HOLDLOCK. SHA256, length, MIME/key/path and format checks must pass before a pending promotion. If a destination exists but differs, it is never overwritten; repair marks failed and retains evidence. Repair does not automatically retry failed rows. Ready corruption cannot be repaired from an unrelated stage silently.

## Private CLI

`npm run storage:recover` defaults to a read-only audit. It requires SQL_ENV development/test, SQL_EXPECT_DATABASE exactly matching SQL_DATABASE and actual DB_NAME(), a configured existing marked UPLOAD_DIR and the normal private SQL credentials. System databases and production are refused. There is no public runtime repair flag. This Phase5 CLI is deliberately not authorized for production; a production operating procedure must be reviewed before Phase7.

Audit returns at most100 metadata rows after STORAGE_RECOVERY_AFTER_ID (default0), nextAfterId, per-file numeric ID/action, and counts for a sample of at most100 staging entries. It omits original names, keys, paths, owners and secrets. The staging sample reports unregisteredRetained and truncated; it is bounded and not a complete filesystem inventory. Repeat metadata batches with nextAfterId until inspected=0. Never assume a limited staging sample proves no orphan exists.

For an explicit nonproduction repair, set temporary process values:

```text
STORAGE_RECOVERY_REPAIR=true
STORAGE_RECOVERY_CONFIRM=RECONCILE_MEDIA_WITHOUT_DELETION
STORAGE_RECOVERY_AFTER_ID=0
```

Run storage:recover and review each result. SQL/ACL/configuration errors return a generic failure and nonzero exit. No filesystem path or SQL diagnostic is printed. Repair can promote valid old pending files or withdraw invalid ready/pending rows to failed; it never deletes bytes, metadata or content. Restore the read-only flag afterward. Do not call this against production or a different upload directory/database pairing.

## Retention and future cleanup

An uploaded file can be referenced by Services, BlogPosts, OurSpecialists, Gallery before/after, Testimonials, Ads and Users simultaneously. A deleted content row does not establish orphanhood. Future GC must enumerate **all** FK references, pending operations, retention windows, backups and restore needs, take coordinated locks, produce a reviewable dry-run and require a separate explicit destructive authorization. Unregistered stages may represent interrupted/ambiguous commits. No GC or scheduled deletion is implemented here.

Current-request stage removal before any registration attempt, and redundant owned-stage unlink after confirmed ready commit, are narrowly scoped lifecycle operations, not a general cleanup job. Recovery-promoted stages are retained; future maintenance may remove a redundant staging link only after independent ready-object verification and review.

## Backup, restore and rollback

1. Put uploads/content mutations into an operator-controlled maintenance window, drain active requests and record database identity/schema version. No automatic maintenance route is added.
2. Take a SQL backup including dbo.Files and every content/profile FK, plus a private byte-for-byte backup of the marked upload root. Preserve filenames, hashes, metadata and access controls. Record a paired snapshot/checksum manifest privately. A SQL-only backup cannot recover image bytes.
3. Restore SQL and files to an isolated target, preserving numeric file IDs, StorageKey/PublicPath/Sha256 and file contents. Keep UPLOAD_DIR paired with that database. Run read-only audit, inspect pending/failed states, explicitly reconcile only understood cases, and verify actual HTTP retrieval and content references.
4. Never reset identities or regenerate keys/slugs to make restoration appear successful. A mismatched restore is a failure requiring review. Do not automatically delete newer files or overwrite conflicts.
5. Deploy/rollback app artifacts independently of persistent storage; do not roll back the media directory to an unrelated version or remove it with a Git checkout. All seven applied migrations remain immutable. Rolling back to an app without these serving routes would make new URLs unavailable, so coordinate compatibility and backups before rollback.

Local fresh-process and full Next restart tests passed. They are not tests of host redeployment, backup service guarantees, disaster restore or sudden power loss. Those checks remain explicit Phase7 gates.
