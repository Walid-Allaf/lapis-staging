import nextEnv from '@next/env';
import { getPool, closePool } from '../../server/backend/db/pool.ts';
import { previewProductionMaintenance } from '../../server/backend/db/production-maintenance.ts';
nextEnv.loadEnvConfig(process.cwd(), false, { info() {}, error() {} });
try {
  if (process.argv.length !== 2) throw new Error('Unsupported arguments');
  const plan = await previewProductionMaintenance(await getPool());
  console.log(JSON.stringify({ operation: plan.operation, sha256: plan.sha256, expiresAt: plan.expiresAt, target: plan.state.target, status: plan.state.status, catalog: plan.state.catalog }, null, 2));
} catch { console.error(JSON.stringify({ operation: 'production-plan', code: 'DB_MAINTENANCE_PREVIEW_FAILED' })); process.exitCode = 1; }
finally { await closePool().catch(() => { process.exitCode = 1; }); }
