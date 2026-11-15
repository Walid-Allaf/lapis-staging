import { seedDevelopment } from '../../server/backend/db/seed.ts';
import { runDatabaseCommand } from './shared.mjs';

await runDatabaseCommand('seed', pool => seedDevelopment(pool));
