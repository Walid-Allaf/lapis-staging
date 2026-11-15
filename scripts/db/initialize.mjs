import nextEnv from '@next/env';
import { getPool, closePool } from '../../server/backend/db/pool.ts';
import { initializeCleanDatabase } from '../../server/backend/db/initialize.ts';
nextEnv.loadEnvConfig(process.cwd(), process.env.NODE_ENV !== 'production', { info() {}, error() {} });
try {
  if (process.argv.length !== 2) throw new Error('Unsupported arguments');
  console.log(JSON.stringify({ operation: 'initialize', ...await initializeCleanDatabase(await getPool()) }));
} catch { console.error(JSON.stringify({ operation: 'initialize', code: 'DB_CLEAN_START_FAILED' })); process.exitCode = 1; }
finally { await closePool().catch(() => { process.exitCode = 1; }); }
