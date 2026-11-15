import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, copyFile, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import sql from 'mssql';
import { assertDatabaseWriteAllowed, readDatabaseConfig } from '../../server/backend/config.ts';
import { getPool, closePool, PoolManager } from '../../server/backend/db/pool.ts';
import { query } from '../../server/backend/db/parameters.ts';
import { withTransaction } from '../../server/backend/db/transaction.ts';
import { acquireApplicationLock } from '../../server/backend/db/lock.ts';
import { loadMigrations } from '../../server/backend/db/migration-catalog.ts';
import { migrationStatus } from '../../server/backend/db/migration-history.ts';
import { migrateDatabase } from '../../server/backend/db/migrate.ts';
import { seedDevelopment } from '../../server/backend/db/seed.ts';
import { GET } from '../../app/api/health/route.ts';

const enabled = process.env.SQL_ALLOW_TESTS === 'true';

test('real SQL Server foundation (requires a new disposable database)', {
  skip: enabled ? false : 'SQL_ALLOW_TESTS and isolated SQL test credentials are not configured',
  timeout: 120000,
}, async context => {
  assertDatabaseWriteAllowed('test');
  assertDatabaseWriteAllowed('migrate');
  assertDatabaseWriteAllowed('seed');
  const pool = await getPool();
  let directory;
  try {
    // Refuse any pre-existing schema, even a previous test run. Never reset/drop it.
    const initial = await query(pool, 'SELECT COUNT(*) AS count FROM sys.tables WHERE is_ms_shipped=0;');
    assert.equal(initial.recordset[0].count, 0, 'Use a freshly provisioned disposable test database; no reset is performed');
    const migrations = await loadMigrations();
    await context.test('connectivity and uninitialized schema status', async () => {
      assert.equal((await query(pool, 'SELECT 1 AS connected;')).recordset[0].connected, 1);
      assert.equal((await migrationStatus(pool, migrations)).state, 'uninitialized');
      assert.equal((await GET()).status, 503);
      assert.equal((await query(pool, 'SELECT COUNT(*) AS count FROM sys.tables WHERE is_ms_shipped=0;')).recordset[0].count, 0);
    });
    await context.test('initialize seven real migrations and rerun without executing them again', async () => {
      assert.deepEqual(await migrateDatabase(pool), { applied: 7, total: 7 });
      assert.deepEqual(await migrateDatabase(pool), { applied: 0, total: 7 });
      assert.equal((await migrationStatus(pool, migrations)).state, 'current');
      const count = await query(pool, "SELECT COUNT(*) AS count FROM dbo.SchemaMigrations WHERE Status=N'applied';");
      assert.equal(count.recordset[0].count, 7);
    });
    await context.test('actual health handler returns safe current status with no-store', async () => {
      const response = await GET();
      assert.equal(response.status, 200);
      assert.equal(response.headers.get('cache-control'), 'no-store');
      assert.deepEqual(await response.json(), { status: 'ok', application: 'available', database: 'up', migrations: 'current' });
    });
    await context.test('parameterized Unicode round trip and rollback against real SQL tables', async () => {
      const value = "العربية کوردی 😀 '; DROP TABLE dbo.Users; --";
      await assert.rejects(withTransaction(pool, async transaction => {
        await query(transaction, 'INSERT INTO dbo.FAQs(QuestionAr,QuestionEn) VALUES(@value,@value);', [
          { name: 'value', type: sql.NVarChar(sql.MAX), value },
        ]);
        assert.equal((await query(transaction, 'SELECT QuestionAr FROM dbo.FAQs;')).recordset[0].QuestionAr, value);
        throw new Error('intentional rollback');
      }), { code: 'DB_TRANSACTION_FAILED' });
      assert.equal((await query(pool, 'SELECT COUNT(*) AS count FROM dbo.FAQs;')).recordset[0].count, 0);
      assert.equal((await query(pool, "SELECT COUNT(*) AS count FROM sys.tables WHERE name=N'Users';")).recordset[0].count, 1);
    });
    await context.test('schema stores unbounded external IDs, numeric status, nullable flags and restrictive FKs', async () => {
      const foreignKeys = await query(pool, 'SELECT delete_referential_action AS deletion, update_referential_action AS updating FROM sys.foreign_keys;');
      assert.ok(foreignKeys.recordset.length >= 10);
      assert.ok(foreignKeys.recordset.every(row => row.deletion === 0 && row.updating === 0));
      const externalId = 'synthetic-' + 'x'.repeat(900);
      await assert.rejects(withTransaction(pool, async transaction => {
        await query(transaction, 'INSERT INTO dbo.Users(ExternalId) VALUES(@id);', [{ name: 'id', type: sql.NVarChar(sql.MAX), value: externalId }]);
        const user = (await query(transaction, 'SELECT ExternalId,IsDisabled,RoleId FROM dbo.Users;')).recordset[0];
        assert.equal(user.ExternalId, externalId);
        assert.equal(user.IsDisabled, null);
        assert.equal(user.RoleId, null);
        await query(transaction, 'INSERT INTO dbo.BlogPosts(TitleAr,Status) VALUES(@title,@status);', [
          { name: 'title', type: sql.NVarChar(sql.MAX), value: 'اختبار فقط' }, { name: 'status', type: sql.Int(), value: 2 },
        ]);
        const blog = (await query(transaction, 'SELECT Status,IsActive,SortOrder,OurSpecialistId FROM dbo.BlogPosts;')).recordset[0];
        assert.equal(blog.Status, 2);
        assert.equal(blog.IsActive, null);
        assert.equal(blog.SortOrder, null);
        assert.equal(blog.OurSpecialistId, null);
        throw new Error('intentional rollback');
      }), { code: 'DB_TRANSACTION_FAILED' });
    });
    await context.test('concurrent migration/seed execution is rejected by a real SQL application lock', async () => {
      await withTransaction(pool, async transaction => {
        await acquireApplicationLock(transaction, 'LAPiS:foundation:migrations');
        await assert.rejects(migrateDatabase(pool), { code: 'DB_LOCK_UNAVAILABLE' });
        await assert.rejects(seedDevelopment(pool), { code: 'DB_LOCK_UNAVAILABLE' });
      });
      assert.equal((await migrationStatus(pool, migrations)).state, 'current');
    });
    await context.test('development seed is repeatable and never provisions users/roles/content', async () => {
      assert.deepEqual(await seedDevelopment(pool), { applied: true, domainData: 'deferred' });
      assert.deepEqual(await seedDevelopment(pool), { applied: false, domainData: 'deferred' });
      const result = await query(pool, 'SELECT (SELECT COUNT(*) FROM dbo.DevelopmentSeedHistory) AS seeds, (SELECT COUNT(*) FROM dbo.Users) AS users, (SELECT COUNT(*) FROM dbo.Roles) AS roles, (SELECT COUNT(*) FROM dbo.SiteSettings) AS settings;');
      assert.deepEqual({ ...result.recordset[0] }, { seeds: 1, users: 0, roles: 0, settings: 0 });
    });
    await context.test('CLI status/migrate/seed use the same implementation and exit cleanly', () => {
      for (const operation of ['status', 'migrate', 'seed']) {
        const result = spawnSync(process.execPath, ['--conditions=react-server', '--import', 'tsx', `scripts/db/${operation}.mjs`], { encoding: 'utf8', env: process.env, timeout: 30000 });
        assert.equal(result.status, 0, 'CLI command should succeed without printing credentials');
        const output = JSON.parse(result.stdout);
        assert.equal(output.operation, operation);
        if (operation === 'status') assert.equal(output.state, 'current');
        if (operation === 'migrate') assert.equal(output.applied, 0);
        if (operation === 'seed') assert.equal(output.applied, false);
        assert.ok(!result.stdout.includes(process.env.SQL_PASSWORD));
        assert.ok(!result.stderr.includes(process.env.SQL_PASSWORD));
      }
    });
    await context.test('real rejected login is sanitized and does not affect the shared working pool', async () => {
      const manager = new PoolManager(() => readDatabaseConfig({ ...process.env, SQL_PASSWORD: 'deliberately-wrong-test-only-password', SQL_CONNECT_TIMEOUT_MS: '2000' }));
      try { await assert.rejects(manager.get(), error => error.code === 'DB_CONNECTION_FAILED' && !String(error).includes('password')); }
      finally { await manager.close(); }
      assert.equal((await query(pool, 'SELECT 1 AS connected;')).recordset[0].connected, 1);
    });
    await context.test('applied migration checksum changes block all further work', async () => {
      directory = await mkdtemp(path.join(os.tmpdir(), 'lapis-sql-integration-'));
      for (const migration of migrations) await copyFile(path.join(process.cwd(), 'db/migrations', migration.name), path.join(directory, migration.name));
      await writeFile(path.join(directory, migrations[0].name), migrations[0].text + '\n-- changed checksum\n');
      await assert.rejects(migrateDatabase(pool, { directory }), { code: 'DB_MIGRATION_DRIFT' });
      await writeFile(path.join(directory, migrations[0].name), migrations[0].text);
    });
    await context.test('DDL failure rolls back its table, persists failure, and is never auto-retried', async () => {
      await writeFile(path.join(directory, '0008_failure_fixture.sql'), "CREATE TABLE dbo.Phase2FailureSentinel (Id INT NOT NULL);\nTHROW 51001, 'Intentional isolated test failure', 1;\n");
      await assert.rejects(migrateDatabase(pool, { directory }), { code: 'DB_MIGRATION_FAILED' });
      const sentinel = await query(pool, "SELECT CASE WHEN OBJECT_ID(N'dbo.Phase2FailureSentinel',N'U') IS NULL THEN 0 ELSE 1 END AS present;");
      assert.equal(sentinel.recordset[0].present, 0);
      const failure = await query(pool, 'SELECT Status,ErrorCode FROM dbo.SchemaMigrations WHERE Version=8;');
      assert.deepEqual({ ...failure.recordset[0] }, { Status: 'failed', ErrorCode: 'DB_MIGRATION_FAILED' });
      await assert.rejects(migrateDatabase(pool, { directory }), { code: 'DB_MIGRATION_BLOCKED' });
      const status = await migrationStatus(pool, await loadMigrations(directory));
      assert.equal(status.state, 'blocked');
      assert.equal(status.applied, 7);
      // This disposable DB intentionally retains the failed attempt for forensic review.
    });
  } finally {
    await closePool();
    if (directory) await rm(directory, { recursive: true, force: true });
  }
});
