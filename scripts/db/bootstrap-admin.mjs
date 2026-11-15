import nextEnv from '@next/env';
import { getPool, closePool } from '../../server/backend/db/pool.ts';
import { assertDatabaseWriteAllowed } from '../../server/backend/config.ts';
import { bootstrapAdministrator } from '../../server/backend/auth/bootstrap.ts';
import { assertProductionMaintenance } from '../../server/backend/db/production-maintenance.ts';

nextEnv.loadEnvConfig(process.cwd(), process.env.NODE_ENV !== 'production', { info() {}, error() {} });
try {
  if (process.env.SQL_ENV === 'production') assertProductionMaintenance('bootstrap', process.env);
  else assertDatabaseWriteAllowed('seed');
  if (process.env.AUTH_BOOTSTRAP_ALLOW !== 'true' || process.env.AUTH_BOOTSTRAP_CONFIRM !== 'CREATE_FIRST_SUPERADMIN' ||
    process.argv.length !== 2 || !process.env.AUTH_BOOTSTRAP_EMAIL || !process.env.AUTH_BOOTSTRAP_PASSWORD) throw new Error('not allowed');
  // Approved process-secret provisioning; never accept a password argument or print it.
  const password = process.env.AUTH_BOOTSTRAP_PASSWORD;
  delete process.env.AUTH_BOOTSTRAP_PASSWORD;
  const result = await bootstrapAdministrator(await getPool(), { email: process.env.AUTH_BOOTSTRAP_EMAIL, password });
  console.log(JSON.stringify({ operation: 'bootstrap-admin', ...result }));
} catch { console.error(JSON.stringify({ operation: 'bootstrap-admin', code: 'AUTH_BOOTSTRAP_FAILED' })); process.exitCode = 1; }
finally { await closePool().catch(() => { process.exitCode = 1; }); }
