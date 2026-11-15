import test from 'node:test';
import assert from 'node:assert/strict';
import { readDatabaseConfig, assertDatabaseWriteAllowed } from '../../server/backend/config.ts';

const environment = { SQL_ENV: 'test', SQL_SERVER: 'localhost', SQL_DATABASE: 'lapis_test_0123456789abcdef', SQL_USER: 'synthetic', SQL_PASSWORD: 'synthetic-secret' };
const isConfigError = error => error.code === 'DB_CONFIG_INVALID' && !String(error).includes('synthetic-secret');

test('configuration defaults keep TLS verification and bounded pooling', () => {
  const config = readDatabaseConfig(environment);
  assert.equal(config.sql.options.encrypt, true);
  assert.equal(config.sql.options.trustServerCertificate, false);
  assert.equal(config.sql.pool.min, 0);
  assert.equal(config.sql.pool.max, 3);
  assert.equal(config.sql.options.useUTC, true);
  assert.equal(config.sql.options.abortTransactionOnError, true);
});
test('missing/invalid variables fail without leaking credentials', () => {
  for (const key of ['SQL_ENV', 'SQL_SERVER', 'SQL_DATABASE', 'SQL_USER', 'SQL_PASSWORD']) {
    assert.throws(() => readDatabaseConfig({ ...environment, [key]: '' }), isConfigError);
  }
  for (const values of [{ SQL_PORT: '1433suffix' }, { SQL_PORT: '0' }, { SQL_POOL_MAX: '11' }, { SQL_CONNECT_TIMEOUT_MS: 'NaN' }, { SQL_ENCRYPT: 'TRUE' }, { SQL_ENV: 'staging' }]) {
    assert.throws(() => readDatabaseConfig({ ...environment, ...values }), isConfigError);
  }
});
test('local self-signed trust is explicit; production cannot disable TLS validation', () => {
  assert.equal(readDatabaseConfig({ ...environment, SQL_TRUST_SERVER_CERTIFICATE: 'true' }).sql.options.trustServerCertificate, true);
  for (const values of [{ SQL_TRUST_SERVER_CERTIFICATE: 'true' }, { SQL_ENCRYPT: 'false' }]) {
    assert.throws(() => readDatabaseConfig({ ...environment, SQL_ENV: 'production', ...values }), isConfigError);
  }
});
test('writes require matching database acknowledgement and separate operation flags', () => {
  const allow = { ...environment, SQL_EXPECT_DATABASE: environment.SQL_DATABASE, SQL_ALLOW_MIGRATIONS: 'true' };
  assert.doesNotThrow(() => assertDatabaseWriteAllowed('migrate', allow));
  for (const override of [{ SQL_ALLOW_MIGRATIONS: 'false' }, { SQL_EXPECT_DATABASE: 'other' }, { SQL_ENV: 'production' }, { SQL_DATABASE: 'master', SQL_EXPECT_DATABASE: 'master' }]) {
    assert.throws(() => assertDatabaseWriteAllowed('migrate', { ...allow, ...override }), { code: 'DB_OPERATION_NOT_ALLOWED' });
  }
  assert.throws(() => assertDatabaseWriteAllowed('seed', allow), { code: 'DB_OPERATION_NOT_ALLOWED' });
});
test('integration tests cannot target arbitrary existing databases', () => {
  const allow = { ...environment, SQL_EXPECT_DATABASE: environment.SQL_DATABASE, SQL_ALLOW_TESTS: 'true' };
  assert.doesNotThrow(() => assertDatabaseWriteAllowed('test', allow));
  for (const override of [{ SQL_ENV: 'development' }, { SQL_DATABASE: 'existing_dev', SQL_EXPECT_DATABASE: 'existing_dev' }]) {
    assert.throws(() => assertDatabaseWriteAllowed('test', { ...allow, ...override }), { code: 'DB_OPERATION_NOT_ALLOWED' });
  }
});
