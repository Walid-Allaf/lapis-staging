import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { loadMigrations, validateMigrationSql } from '../../server/backend/db/migration-catalog.ts';
import { inspectHistory } from '../../server/backend/db/migration-history.ts';

async function directoryTest(work) {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'lapis-migration-unit-'));
  try { await work(directory); }
  finally { await rm(directory, { recursive: true, force: true }); }
}
test('catalog orders numeric versions, hashes exact bytes, and detects modified files', async () => directoryTest(async directory => {
  await writeFile(path.join(directory, '0002_second.sql'), 'SELECT 2;\n');
  await writeFile(path.join(directory, '0001_first.sql'), 'SELECT 1;\n');
  const migrations = await loadMigrations(directory);
  assert.deepEqual(migrations.map(m => m.version), [1, 2]);
  const rows = migrations.map(m => ({ Version: m.version, Name: m.name, Checksum: Buffer.from(m.checksum, 'hex'), Status: 'applied' }));
  assert.equal(inspectHistory(migrations, rows).state, 'current');
  await writeFile(path.join(directory, '0001_first.sql'), 'SELECT 1;\r\n');
  assert.equal(inspectHistory(await loadMigrations(directory), rows).state, 'drift');
}));
test('catalog rejects duplicate/gapped/invalid version filenames', async () => {
  for (const files of [['0001_a.sql', '0001_b.sql'], ['0001_a.sql', '0003_c.sql'], ['one.sql']]) await directoryTest(async directory => {
    for (const file of files) await writeFile(path.join(directory, file), 'SELECT 1;');
    await assert.rejects(loadMigrations(directory), { code: 'DB_MIGRATION_INVALID' });
  });
});
test('migration batches reject reset/transaction/GO directives but allow quoted words', () => {
  for (const text of ['DROP TABLE t;', 'TRUNCATE TABLE t;', 'BEGIN TRANSACTION; SELECT 1;', 'COMMIT;', 'SELECT 1;\nGO\nSELECT 2;', 'USE other;', 'EXEC(@sql);', 'SET XACT_ABORT OFF;', ':r file.sql', 'CREATE DATABASE other;', 'ALTER LOGIN other DISABLE;']) {
    assert.throws(() => validateMigrationSql(text), { code: 'DB_MIGRATION_INVALID' });
  }
  validateMigrationSql("/* nested /* DROP */ GO */ SELECT N'GO\nCOMMIT', [DROP], \"USE\"; -- ROLLBACK\n");
  assert.throws(() => validateMigrationSql('/* incomplete'), { code: 'DB_MIGRATION_INVALID' });
});
test('failed/interrupted attempts, missing source and out-of-order history block reruns', async () => {
  const migrations = await loadMigrations();
  const first = migrations[0];
  const row = { Version: 1, Name: first.name, Checksum: Buffer.from(first.checksum, 'hex'), Status: 'failed' };
  assert.equal(inspectHistory(migrations, null).state, 'uninitialized');
  assert.equal(inspectHistory(migrations, []).state, 'pending');
  assert.equal(inspectHistory(migrations, [row]).state, 'blocked');
  assert.equal(inspectHistory(migrations, [{ ...row, Status: 'running' }]).state, 'blocked');
  assert.equal(inspectHistory([], [{ ...row, Status: 'applied' }]).state, 'drift');
  assert.equal(inspectHistory(migrations, [{ Version: 2, Name: migrations[1].name, Checksum: Buffer.from(migrations[1].checksum, 'hex'), Status: 'applied' }]).state, 'drift');
});
test('all seven reviewed additive migrations are executable single batches', async () => {
  const migrations = await loadMigrations();
  assert.equal(migrations.length, 7);
  for (const migration of migrations) assert.match(migration.checksum, /^[a-f0-9]{64}$/);
});
