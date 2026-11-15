import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import sql from 'mssql';
import { PoolManager } from '../../server/backend/db/pool.ts';
import { query, bindParameters } from '../../server/backend/db/parameters.ts';
import { withTransaction } from '../../server/backend/db/transaction.ts';
import { acquireApplicationLock, assertApplicationLock } from '../../server/backend/db/lock.ts';
import { verifyWriteTarget } from '../../server/backend/db/write-target.ts';

test('concurrent callers share a single pool; shutdown waits for connection', async () => {
  let release;
  const ready = new Promise(resolve => { release = resolve; });
  let constructed = 0;
  class FakePool extends EventEmitter {
    connected = false;
    closed = 0;
    async connect() { await ready; this.connected = true; return this; }
    async close() { this.closed++; this.connected = false; }
  }
  const fake = new FakePool();
  const manager = new PoolManager(() => ({ sql: {} }), () => { constructed++; return fake; });
  const first = manager.get(), second = manager.get();
  const closing = manager.close();
  release();
  assert.equal(await first, await second);
  await closing;
  assert.equal(constructed, 1);
  assert.equal(fake.closed, 1);
});
test('failed connection closes the pool and allows a later retry with safe errors', async () => {
  let attempts = 0, closed = 0;
  const manager = new PoolManager(() => ({ sql: {} }), () => {
    const pool = new EventEmitter();
    pool.connect = async () => { if (++attempts === 1) throw new Error('password=DO-NOT-LEAK'); pool.connected = true; return pool; };
    pool.close = async () => { closed++; };
    return pool;
  });
  await assert.rejects(manager.get(), error => error.code === 'DB_CONNECTION_FAILED' && !String(error).includes('DO-NOT-LEAK'));
  assert.equal(closed, 1);
  await manager.get();
  assert.equal(attempts, 2);
  await manager.close();
});
test('query binds typed Unicode data separately from SQL and rejects ambiguous parameters', async () => {
  const inputs = [];
  const injection = "العربية کوردی '; DROP TABLE dbo.Users; --";
  const request = { input(...args) { inputs.push(args); return this; }, async query(text) { assert.equal(text, 'SELECT @value AS value;'); return { recordset: [{ value: injection }] }; } };
  const result = await query({ request: () => request }, 'SELECT @value AS value;', [{ name: 'value', type: sql.NVarChar(sql.MAX), value: injection }]);
  assert.equal(result.recordset[0].value, injection);
  assert.equal(inputs[0][2], injection);
  assert.throws(() => bindParameters(request, [{ name: 'bad;name', type: sql.Int(), value: 1 }]), { code: 'DB_QUERY_FAILED' });
  assert.throws(() => bindParameters(request, [{ name: 'v', type: sql.Int(), value: undefined }]), { code: 'DB_QUERY_FAILED' });
  assert.throws(() => bindParameters(request, [{ name: 'v', type: sql.Int(), value: 1 }, { name: 'V', type: sql.Int(), value: 2 }]), { code: 'DB_QUERY_FAILED' });
});
function transactionFixture(failure) {
  const calls = [];
  const transaction = new EventEmitter();
  transaction.begin = async () => { calls.push('begin'); };
  transaction.commit = async () => { calls.push('commit'); };
  transaction.rollback = async () => { calls.push('rollback'); transaction.emit('rollback'); if (failure) throw new Error('driver detail'); };
  return { pool: { transaction: () => transaction }, transaction, calls };
}
test('transaction commits successful work and rolls back failed work', async () => {
  const success = transactionFixture();
  assert.equal(await withTransaction(success.pool, async () => 42), 42);
  assert.deepEqual(success.calls, ['begin', 'commit']);
  const failed = transactionFixture();
  await assert.rejects(withTransaction(failed.pool, async () => { throw new Error('sensitive'); }), { code: 'DB_TRANSACTION_FAILED' });
  assert.deepEqual(failed.calls, ['begin', 'rollback']);
});
test('automatic XACT_ABORT rollback is not rolled back twice; rollback failures surface', async () => {
  const aborted = transactionFixture();
  await assert.rejects(withTransaction(aborted.pool, async transaction => { transaction.emit('rollback'); throw new Error('aborted'); }), { code: 'DB_TRANSACTION_FAILED' });
  assert.deepEqual(aborted.calls, ['begin']);
  const broken = transactionFixture(true);
  await assert.rejects(withTransaction(broken.pool, async () => { throw new Error('failed'); }), { code: 'DB_ROLLBACK_FAILED' });
});
test('application lock negative return codes fail closed', async () => {
  const executor = result => ({ request: () => ({ input() { return this; }, async query() { return { recordset: [{ result }] }; } }) });
  await acquireApplicationLock(executor(0), 'LAPiS:test');
  await acquireApplicationLock(executor(1), 'LAPiS:test');
  for (const code of [-1, -2, -3, -999]) await assert.rejects(acquireApplicationLock(executor(code), 'LAPiS:test'), { code: 'DB_LOCK_UNAVAILABLE' });
});
test('a lost lock-owning session cannot authorize another migration file', async () => {
  const executor = mode => ({ request: () => ({ input() { return this; }, async query() { return { recordset: [{ mode }] }; } }) });
  await assertApplicationLock(executor('Exclusive'), 'LAPiS:test');
  await assert.rejects(assertApplicationLock(executor('NoLock'), 'LAPiS:test'), { code: 'DB_LOCK_UNAVAILABLE' });
  await assert.rejects(assertApplicationLock({ request() { throw new Error('session lost'); } }, 'LAPiS:test'), { code: 'DB_LOCK_UNAVAILABLE' });
});
test('write target checks actual DB_NAME before a write, not just environment labels', async () => {
  const env = { SQL_ENV: 'test', SQL_SERVER: 'local', SQL_DATABASE: 'lapis_test_0123456789abcdef', SQL_USER: 'fake', SQL_PASSWORD: 'fake', SQL_EXPECT_DATABASE: 'lapis_test_0123456789abcdef', SQL_ALLOW_MIGRATIONS: 'true' };
  const pool = { request: () => ({ async query() { return { recordset: [{ name: 'wrong_database' }] }; } }) };
  await assert.rejects(verifyWriteTarget(pool, 'migrate', env), { code: 'DB_OPERATION_NOT_ALLOWED' });
});
