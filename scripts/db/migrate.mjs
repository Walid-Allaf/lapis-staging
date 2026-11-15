import { migrateDatabase } from '../../server/backend/db/migrate.ts';
import { runDatabaseCommand } from './shared.mjs';

await runDatabaseCommand('migrate', pool => migrateDatabase(pool));
