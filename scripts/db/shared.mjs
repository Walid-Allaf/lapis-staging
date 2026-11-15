import nextEnv from '@next/env';
import { readDatabaseConfig, assertDatabaseWriteAllowed } from '../../server/backend/config.ts';
import { databaseErrorCode } from '../../server/backend/db/errors.ts';
import { getPool, closePool } from '../../server/backend/db/pool.ts';
import { assertProductionMaintenance } from '../../server/backend/db/production-maintenance.ts';

export async function runDatabaseCommand(operation, work) {
  // Same .env precedence as Next; process env always wins. Never rewrite env files.
  nextEnv.loadEnvConfig(process.cwd(), process.env.NODE_ENV !== 'production', { info() {}, error() {} });
  try {
    if (process.argv.length > 2) throw new Error('Unsupported arguments');
    readDatabaseConfig();
    if (operation === 'migrate' && process.env.SQL_ENV === 'production') assertProductionMaintenance('migrate', process.env);
    else if (operation !== 'status') assertDatabaseWriteAllowed(operation);
    const result = await work(await getPool());
    console.log(JSON.stringify({ operation, ...result }, null, 2));
    if (operation === 'status' && result.state !== 'current') process.exitCode = 1;
  } catch (error) {
    console.error(JSON.stringify({ operation, code: databaseErrorCode(error) }));
    process.exitCode = 1;
  } finally {
    try { await closePool(); }
    catch { console.error(JSON.stringify({ operation, code: 'DB_SHUTDOWN_FAILED' })); process.exitCode = 1; }
  }
}
