import nextEnv from '@next/env';
import { getPool, closePool } from '../../server/backend/db/pool.ts';
import { FileService } from '../../server/backend/modules/files/service.ts';
import { query } from '../../server/backend/db/parameters.ts';
nextEnv.loadEnvConfig(process.cwd(), process.env.NODE_ENV !== 'production', { info() {}, error() {} });
try {
  if (process.argv.length > 2 || !['development', 'test'].includes(process.env.SQL_ENV) || process.env.SQL_EXPECT_DATABASE !== process.env.SQL_DATABASE || !process.env.SQL_DATABASE || ['master','model','msdb','tempdb'].includes(process.env.SQL_DATABASE.toLowerCase())) throw Error('Recovery not acknowledged');
  const repair = process.env.STORAGE_RECOVERY_REPAIR === 'true';
  if (process.env.STORAGE_RECOVERY_REPAIR !== undefined && !['true','false'].includes(process.env.STORAGE_RECOVERY_REPAIR)) throw Error('Invalid flag');
  if (repair && process.env.STORAGE_RECOVERY_CONFIRM !== 'RECONCILE_MEDIA_WITHOUT_DELETION') throw Error('Recovery not acknowledged');
  const afterId = Number(process.env.STORAGE_RECOVERY_AFTER_ID ?? 0);
  const pool = await getPool();
  if ((await query(pool, 'SELECT DB_NAME() AS name;')).recordset[0]?.name !== process.env.SQL_EXPECT_DATABASE) throw Error('Recovery target mismatch');
  console.log(JSON.stringify({ operation: repair ? 'storage-repair' : 'storage-audit', ...await new FileService(pool).recover({ afterId, repair }) }));
} catch { console.error(JSON.stringify({ operation: 'storage-recovery', code: 'STORAGE_RECOVERY_FAILED' })); process.exitCode = 1; }
finally { await closePool().catch(() => { process.exitCode = 1; }); }
