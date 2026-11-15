import test from 'node:test';
import assert from 'node:assert/strict';
import { databaseHealth } from '../../server/backend/db/health.ts';
import { DatabaseError } from '../../server/backend/db/errors.ts';
import { GET } from '../../app/api/health/route.ts';

function dependencies(state = 'current') {
  return { getPool: async () => ({}), query: async () => ({}), loadMigrations: async () => [], migrationStatus: async () => ({ state }) };
}
test('health distinguishes connectivity from schema readiness without doing migrations', async () => {
  assert.deepEqual(await databaseHealth(dependencies()), { status: 'ok', application: 'available', database: 'up', migrations: 'current' });
  for (const state of ['pending', 'blocked', 'uninitialized', 'drift']) {
    const health = await databaseHealth(dependencies(state));
    assert.equal(health.database, 'up');
    assert.equal(health.status, 'degraded');
    assert.equal(health.migrations, state);
  }
});
test('health masks driver errors, missing credentials and migration failures', async () => {
  for (const error of [new DatabaseError('DB_CONFIG_INVALID'), new Error('server=private;password=secret')]) {
    const health = await databaseHealth({ ...dependencies(), getPool: async () => { throw error; } });
    assert.equal(health.status, 'degraded');
    assert.equal(health.database, error.code === 'DB_CONFIG_INVALID' ? 'not_configured' : 'unavailable');
    assert.doesNotMatch(JSON.stringify(health), /private|password|secret/);
  }
  const health = await databaseHealth({ ...dependencies(), migrationStatus: async () => { throw new Error('private SQL'); } });
  assert.equal(health.database, 'up');
  assert.equal(health.migrations, 'unavailable');
});
test('unconfigured route stays available with safe 503 and no-store', async () => {
  const saved = process.env.SQL_ENV;
  delete process.env.SQL_ENV;
  try {
    const response = await GET();
    assert.equal(response.status, 503);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.deepEqual(await response.json(), { status: 'degraded', application: 'available', database: 'not_configured', migrations: 'unavailable' });
  } finally { if (saved !== undefined) process.env.SQL_ENV = saved; }
});
