# Phase7 clean start — local validation, 2026-11-11

**PASS (local)**. Launch uses a new empty SQL database and an empty private upload location. No historical import, legacy user/password recovery, copied settings, advertisements, media or sample production content is required or authorized. The original ASP.NET service/database was not accessed or modified by this phase.

The explicit order is `db:migrate` → `db:initialize` → `db:bootstrap-admin`. There is no initialization from HTTP or application startup. Seven migration files remain immutable. A new schema has 19 tables including migration history, foreign keys and indexes. Migrations alone deliberately leave the settings table empty, so public readiness returns503 until the explicit initializer runs.

`db:initialize` requires the exact database acknowledgement, SQL_ALLOW_SEED=true and SQL_CLEAN_START_CONFIRM=INITIALIZE_EMPTY_LAPIS. Production additionally requires the reviewed production plan/backup procedure. Under auth and foundation SQL application locks it checks all seven schema checksums, refuses any users, files, seven content collections or development seed history, and refuses existing settings/ads on its first invocation. It writes only:

| System record | Neutral initial value |
| --- | --- |
| Roles | user→User, manager→Manager, superadmin→SuperAdmin, string contracts |
| SiteSettings Id1 | NULL contact, social, description and coordinate values; six visibility toggles false |
| Ads Id1 | NULL text/link/file, inactive, non-external |
| SecurityEvents | CleanStartInitialized allowed audit event, no credentials |

A repeat before users/content exist is a no-op. It never overwrites settings/ads/role contracts, resets data or deletes anything. After bootstrap or content creation it refuses clean initialization. Missing configuration/schema/SQL continues to fail readiness503; valid empty content returns200 with empty data arrays. Browser fixtures are synthetic records in isolated test databases only.

**PASS evidence:** release SQL simulation8 child checks; actual browser reads all seven empty public API collections, visits fourteen bilingual public pages, loads empty dashboard tables and creates first records through existing forms. Existing foundation SQL suite verifies checksums, constraints, concurrent locking, failure rollback and blocked retry. See [release readiness](PHASE7_RELEASE_READINESS.md).

**NOT TESTED (host):** private absolute upload path, ownership ACL, quota and persistent redeploy. Have the provider confirm a dedicated empty directory outside wwwroot, checkout/build/staging and their ancestors, writable by the Node identity. The media store creates its marker/staging/objects on first use. Do not upload dummy production files merely to initialize storage.

Historical DATA_IMPORT_PLAN and optional import tools are archival capabilities only; they are not a release gate and must not be run for this clean launch. Initializer additionally refuses unknown/malformed preexisting role contracts; the release SQL suite verifies refusal before settings insertion.
