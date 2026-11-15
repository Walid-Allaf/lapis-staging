import { loadMigrations } from '../../server/backend/db/migration-catalog.ts';
import { migrationStatus } from '../../server/backend/db/migration-history.ts';
import { runDatabaseCommand } from './shared.mjs';

await runDatabaseCommand('status', async pool => migrationStatus(pool, await loadMigrations()));
