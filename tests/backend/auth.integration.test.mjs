import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { assertDatabaseWriteAllowed } from '../../server/backend/config.ts';
import { readAuthConfig } from '../../server/backend/auth/config.ts';
import { getPool, closePool } from '../../server/backend/db/pool.ts';
import { query } from '../../server/backend/db/parameters.ts';
import { migrateDatabase } from '../../server/backend/db/migrate.ts';
import { bootstrapAdministrator } from '../../server/backend/auth/bootstrap.ts';
import { AuthenticationService } from '../../server/backend/modules/auth/service.ts';
import { authTransaction, byEmail, emailHash, binary, integer, text, userKey, insertUser, ensureRole } from '../../server/backend/modules/auth/repository.ts';
import { verifyPassword, hashPassword } from '../../server/backend/auth/password.ts';
import { unavailable } from '../../server/backend/auth/errors.ts';
import { createAuthHandler, createUserHandler } from '../../server/backend/http/auth-handler.ts';

const enabled = process.env.SQL_ALLOW_TESTS === 'true';
test('real SQL authentication/User contracts with isolated test-only mail capture', { skip: enabled ? false : 'Explicit disposable SQL credentials are not configured', timeout: 180000 }, async context => {
  assertDatabaseWriteAllowed('test');
  const pool = await getPool();
  const config = readAuthConfig();
  const messages = [];
  const mail = { async sendOtp(email, purpose, code) { messages.push({ email, purpose, code }); } };
  const service = new AuthenticationService(pool, config, () => mail);
  const bootstrapEnv = { ...process.env, AUTH_BOOTSTRAP_ALLOW: 'true', AUTH_BOOTSTRAP_CONFIRM: 'CREATE_FIRST_SUPERADMIN' };
  const admin = { email: 'operator@example.invalid', password: randomBytes(18).toString('base64url') };
  const member = { email: 'member@example.invalid', password: randomBytes(18).toString('base64url') };
  let adminToken, memberToken;
  const json = async response => ({ status: response.status, body: await response.json() });
  async function auth(operation, input = {}, token, chosen = service) {
    const request = new Request(`https://local/api/auth/${operation}`, { method: 'POST', headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(input) });
    return json(await createAuthHandler(operation, async () => chosen)(request));
  }
  async function user(operation, token, input, suffix = '') {
    const method = operation === 'edit-profile' ? 'PUT' : ['change-password', 'toggle-disable'].includes(operation) ? 'POST' : 'GET';
    const request = new Request(`https://local/api/User/${operation}${suffix}`, { method, headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) }, ...(method === 'GET' ? {} : { body: JSON.stringify(input ?? {}) }) });
    return json(await createUserHandler(operation, async () => service)(request, operation === 'get-by-id' ? suffix : undefined));
  }
  const code = (email, purpose) => messages.findLast(message => message.email === email && message.purpose === purpose)?.code;
  async function age(email, purpose) { await query(pool, 'UPDATE dbo.OtpChallenges SET CreatedAtUtc=DATEADD(SECOND,-61,SYSUTCDATETIME()) WHERE EmailHash=@hash AND Purpose=@purpose;', [binary('hash', emailHash(email)), integer('purpose', purpose)]); }
  async function signup(email, password = randomBytes(18).toString('base64url'), confirmed = true) {
    assert.equal((await auth('register', { email, password, firstName: 'اختبار', lastName: 'کوردی', phoneNumber: 'synthetic' })).status, 200);
    if (confirmed) assert.equal((await auth('confirm-email', { email, code: code(email, 0) })).status, 200);
    return { email, password };
  }
  async function login(account) { const result = await auth('login', account); assert.equal(result.status, 200); assert.ok(typeof result.body.data.token === 'string'); return result.body.data.token; }
  try {
    assert.equal((await query(pool, 'SELECT COUNT(*) AS count FROM sys.tables WHERE is_ms_shipped=0;')).recordset[0].count, 0, 'A fresh empty disposable database is required');
    assert.deepEqual(await migrateDatabase(pool), { applied: 7, total: 7 });
    // Simulate independent time windows between cases, never disable rate enforcement.
    context.beforeEach(async () => { await query(pool, 'UPDATE dbo.AuthRateLimits SET ExpiresAtUtc=DATEADD(SECOND,-1,SYSUTCDATETIME());'); });

    await context.test('bootstrap is explicit, one-time, idempotent, and never promotes a registration', async () => {
      await assert.rejects(bootstrapAdministrator(pool, admin, { ...bootstrapEnv, AUTH_BOOTSTRAP_ALLOW: 'false' }), { status: 403 });
      assert.deepEqual(await bootstrapAdministrator(pool, admin, bootstrapEnv), { applied: true });
      assert.deepEqual(await bootstrapAdministrator(pool, { ...admin, password: randomBytes(18).toString('base64url') }, bootstrapEnv), { applied: false });
      await assert.rejects(bootstrapAdministrator(pool, { email: 'other-admin@example.invalid', password: admin.password }, bootstrapEnv), { status: 409 });
      adminToken = await login(admin);
    });
    await context.test('registration, duplicate identities and protected salted hashes persist in SQL', async () => {
      await signup(member.email, member.password, false);
      const before = await byEmail(pool, member.email);
      assert.equal(before.RoleCode, 'user');
      assert.equal(before.EmailConfirmed, false);
      assert.equal(await verifyPassword(member.password, before.PasswordHash), true);
      await age(member.email, 0);
      const duplicate = await auth('register', { email: member.email.toUpperCase(), password: randomBytes(18).toString('base64url'), firstName: 'Ignored', lastName: 'Ignored', phoneNumber: 'Ignored' });
      assert.equal(duplicate.status, 200);
      assert.equal(duplicate.body.data, null);
      const after = await byEmail(pool, member.email);
      assert.equal(after.UserKey, before.UserKey);
      assert.equal(after.PasswordHash, before.PasswordHash);
      assert.equal(after.FirstName, 'اختبار');
      const proof = (await query(pool, 'SELECT TOP(1) SecretHash,Salt FROM dbo.OtpChallenges WHERE EmailHash=@hash ORDER BY CreatedAtUtc DESC;', [binary('hash', emailHash(member.email))])).recordset[0];
      assert.equal(proof.SecretHash.length, 32);
      assert.ok(proof.SecretHash.toString() !== code(member.email, 0));
    });
    await context.test('unconfirmed/unknown/wrong-password login fail identically; confirmation is single-use', async () => {
      for (const input of [member, { ...member, password: 'incorrect' }, { email: 'missing@example.invalid', password: member.password }]) {
        const result = await auth('login', input); assert.equal(result.status, 401); assert.equal(result.body.data, null); assert.equal(result.body.error.code, 'AUTH_INVALID_CREDENTIALS');
      }
      const confirmation = code(member.email, 0);
      assert.equal((await auth('confirm-email', { email: member.email, code: confirmation })).status, 200);
      assert.equal((await auth('confirm-email', { email: member.email, code: confirmation })).status, 400);
      memberToken = await login(member);
    });
    await context.test('all User reads authenticate; only SuperAdmin lists/looks up arbitrary users', async () => {
      assert.equal((await user('get-info')).status, 401);
      assert.equal((await user('get-info', memberToken)).status, 200);
      assert.equal((await user('get-all', memberToken)).status, 403);
      const memberId = (await byEmail(pool, member.email)).ExternalId;
      assert.equal((await user('get-by-id', memberToken, undefined, memberId)).status, 403);
      const detail = await user('get-by-id', adminToken, undefined, memberId);
      assert.equal(detail.status, 200);
      assert.equal(detail.body.data.role, 'User');
      for (const field of ['PasswordHash', 'passwordHash', 'NormalizedEmail', 'SecurityVersion', 'UserKey']) assert.ok(!(field in detail.body.data));
      const list = await user('get-all', adminToken, undefined, '?PageNumber=1&PageSize=1&Sort.Field=3&Sort.Descending=false&IsActive=true');
      assert.equal(list.status, 200);
      assert.equal(list.body.data.length, 1);
      assert.equal(list.body.paging.totalRecords, 2);
      assert.equal((await user('get-by-id', adminToken, undefined, 'not-a-guid-id')).status, 404);
    });
    await context.test('profile editing preserves omission/null, rejects privilege fields and isolates ownership', async () => {
      const edited = await user('edit-profile', memberToken, { firstName: null, phoneNumber: "اختبار '; DROP TABLE dbo.Users; --" });
      assert.equal(edited.status, 200);
      assert.equal(edited.body.data.firstName, null);
      assert.equal(edited.body.data.lastName, 'کوردی');
      assert.equal((await byEmail(pool, admin.email)).FirstName, 'Operator');
      assert.equal((await user('edit-profile', memberToken, { role: 'SuperAdmin' })).status, 400);
      assert.equal((await user('edit-profile', memberToken, { email: admin.email })).status, 400);
      assert.equal((await user('edit-profile', memberToken, { fileId: 2147483647 })).status, 400);
    });
    await context.test('profile files require ready metadata owned by the authenticated user', async () => {
      const stored = await byEmail(pool, member.email);
      const file = (await query(pool, `INSERT INTO dbo.Files(StorageKey,PublicPath,MimeType,ByteLength,Sha256,CreatedByUserKey,StorageState)
        OUTPUT INSERTED.Id VALUES(@key,@path,N'image/webp',1,@hash,@userKey,N'ready');`, [
        text('key', randomBytes(16).toString('hex')), text('path', 'uploads/synthetic-fixture.webp'), binary('hash', Buffer.alloc(32)), userKey(stored.UserKey),
      ])).recordset[0].Id;
      assert.equal((await user('edit-profile', adminToken, { fileId: file })).status, 400);
      const own = await user('edit-profile', memberToken, { fileId: file });
      assert.equal(own.status, 200);
      assert.deepEqual(own.body.data.image, { id: file, filePath: 'uploads/synthetic-fixture.webp' });
      assert.equal((await user('edit-profile', memberToken, { fileId: null })).body.data.image, null);
    });
    await context.test('password change validates current password and invalidates all prior sessions', async () => {
      assert.equal((await user('change-password', memberToken, { currentPassword: 'wrong', newPassword: member.password })).status, 401);
      assert.equal((await user('get-info', memberToken)).status, 200);
      assert.equal((await user('change-password', memberToken, { currentPassword: member.password, newPassword: 'short' })).status, 400);
      const next = randomBytes(18).toString('base64url');
      const previous = memberToken;
      assert.equal((await user('change-password', memberToken, { currentPassword: member.password, newPassword: next })).status, 200);
      assert.equal((await user('get-info', previous)).status, 401);
      assert.equal((await auth('login', member)).status, 401);
      member.password = next;
      memberToken = await login(member);
    });
    await context.test('OTP cooldown, expiry, attempt cap and purpose binding persist independently of failures', async () => {
      assert.equal((await auth('send-otp', { email: member.email, purpose: 1 })).status, 200);
      assert.equal((await auth('send-otp', { email: member.email, purpose: 1 })).status, 429);
      await query(pool, 'UPDATE dbo.OtpChallenges SET ExpiresAtUtc=DATEADD(SECOND,-1,SYSUTCDATETIME()) WHERE EmailHash=@hash AND Purpose=1;', [binary('hash', emailHash(member.email))]);
      assert.equal((await auth('verify-otp', { email: member.email, code: code(member.email, 1) })).status, 400);
      await age(member.email, 1);
      assert.equal((await auth('send-otp', { email: member.email, purpose: 1 })).status, 200);
      const actual = code(member.email, 1), wrong = actual === '000000' ? '000001' : '000000';
      for (let i = 0; i < 5; i++) assert.equal((await auth('verify-otp', { email: member.email, code: wrong })).status, 400);
      assert.equal((await auth('verify-otp', { email: member.email, code: actual })).status, 400);
      const row = (await query(pool, 'SELECT TOP(1) Attempts FROM dbo.OtpChallenges WHERE EmailHash=@hash AND Purpose=1 ORDER BY CreatedAtUtc DESC;', [binary('hash', emailHash(member.email))])).recordset[0];
      assert.equal(row.Attempts, 5);
    });
    await context.test('reset proofs are single-use and expiry/reset invalidate OTPs and existing sessions', async () => {
      await age(member.email, 1);
      assert.equal((await auth('send-otp', { email: member.email, purpose: 1 })).status, 200);
      const current = code(member.email, 1);
      assert.equal((await auth('confirm-email', { email: member.email, code: current })).status, 400);
      const verified = await auth('verify-otp', { email: member.email, code: current });
      assert.equal(verified.status, 200);
      assert.ok(/^[A-Za-z0-9_-]{43}$/.test(verified.body.data.resetToken));
      assert.equal((await auth('verify-otp', { email: member.email, code: current })).status, 400);
      await query(pool, 'UPDATE dbo.AccountTokens SET ExpiresAtUtc=DATEADD(SECOND,-1,SYSUTCDATETIME()) WHERE UserKey=@userKey;', [userKey((await byEmail(pool, member.email)).UserKey)]);
      assert.equal((await auth('reset-password', { email: member.email, code: verified.body.data.resetToken, newPassword: 'Synthetic-reset-123!' })).status, 400);
      await age(member.email, 1);
      assert.equal((await auth('send-otp', { email: member.email, purpose: 1 })).status, 200);
      const proof = await auth('verify-otp', { email: member.email, code: code(member.email, 1) });
      assert.equal(proof.status, 200);
      const previous = memberToken;
      const input = { email: member.email, code: proof.body.data.resetToken, newPassword: 'Synthetic-reset-123!' };
      assert.equal((await auth('reset-password', input)).status, 200);
      assert.equal((await auth('reset-password', input)).status, 400);
      assert.equal((await user('get-info', previous)).status, 401);
      member.password = input.newPassword;
      memberToken = await login(member);
    });
    await context.test('concurrent one-step resets consume a code only once', async () => {
      await age(member.email, 1);
      assert.equal((await auth('send-otp', { email: member.email, purpose: 1 })).status, 200);
      const input = { email: member.email, code: code(member.email, 1), newPassword: 'Concurrent-reset-12!' };
      const responses = await Promise.all([auth('reset-password', input), auth('reset-password', input)]);
      assert.deepEqual(responses.map(r => r.status).sort(), [200, 400]);
      member.password = input.newPassword;
      memberToken = await login(member);
    });
    await context.test('only administrators disable/enable other accounts; disabling revokes sessions', async () => {
      assert.equal((await user('toggle-disable', memberToken, { email: admin.email })).status, 403);
      assert.equal((await user('toggle-disable', adminToken, { email: admin.email })).status, 403);
      assert.equal((await user('toggle-disable', adminToken, { email: member.email })).status, 200);
      assert.equal((await user('get-info', memberToken)).status, 401);
      assert.equal((await auth('login', member)).status, 401);
      assert.equal((await user('toggle-disable', adminToken, { email: member.email })).status, 200);
      assert.equal((await user('get-info', memberToken)).status, 401);
      memberToken = await login(member);
    });
    await context.test('2FA login foundation requires password plus single-use purpose-2 proof; toggle remains blocked', async () => {
      const account = await signup('factor@example.invalid');
      const stored = await byEmail(pool, account.email);
      await query(pool, 'UPDATE dbo.Users SET TwoFactorEnabled=1 WHERE UserKey=@userKey;', [userKey(stored.UserKey)]);
      const challenge = await auth('login', account);
      assert.equal(challenge.status, 401);
      assert.equal(challenge.body.error.code, 'AUTH_CHALLENGE_REQUIRED');
      const loginProof = code(account.email, 2);
      assert.ok(/^\d{6}$/.test(loginProof));
      const valid = await auth('login', { ...account, code: loginProof });
      assert.equal(valid.status, 200);
      assert.equal((await auth('login', { ...account, code: loginProof })).status, 401);
      assert.equal((await auth('toggle-2fa', {})).status, 401);
      assert.equal((await auth('toggle-2fa', {}, memberToken)).status, 501);
      assert.equal((await auth('toggle-2fa', { enabled: true }, memberToken)).status, 400);
      assert.equal((await byEmail(pool, member.email)).TwoFactorEnabled, false);
    });
    await context.test('SMTP absence/failure rolls back identity and OTP; no false delivery success', async () => {
      const failed = new AuthenticationService(pool, config, () => ({ async sendOtp() { throw unavailable(); } }));
      const input = { email: 'mail-failure@example.invalid', password: randomBytes(18).toString('base64url'), firstName: 'Test', lastName: 'Test', phoneNumber: 'synthetic' };
      assert.equal((await auth('register', input, undefined, failed)).status, 503);
      assert.equal(await byEmail(pool, input.email), undefined);
      assert.equal((await query(pool, 'SELECT COUNT(*) AS count FROM dbo.OtpChallenges WHERE EmailHash=@hash;', [binary('hash', emailHash(input.email))])).recordset[0].count, 0);
      assert.equal((await auth('send-otp', { email: 'missing@example.invalid', purpose: 1 })).status, 200);
      assert.equal((await auth('verify-otp', { email: 'missing@example.invalid', code: code('missing@example.invalid', 1) })).status, 400);
      const account = await signup('delivery-rollback@example.invalid');
      assert.equal((await auth('send-otp', { email: account.email, purpose: 1 })).status, 200);
      const oldProof = code(account.email, 1);
      await age(account.email, 1);
      assert.equal((await auth('send-otp', { email: account.email, purpose: 1 }, undefined, failed)).status, 503);
      assert.equal((await auth('verify-otp', { email: account.email, code: oldProof })).status, 200);
    });
    await context.test('Manager presentation role does not grant user administration; unresolved roles deny login', async () => {
      const account = await signup('manager@example.invalid');
      const stored = await byEmail(pool, account.email);
      const role = (await query(pool, "INSERT INTO dbo.Roles(Code,ContractValue,ContractValueKind) OUTPUT INSERTED.RoleId VALUES(N'manager',N'Manager',N'string');")).recordset[0].RoleId;
      await query(pool, 'UPDATE dbo.Users SET RoleId=@role WHERE UserKey=@userKey;', [integer('role', role), userKey(stored.UserKey)]);
      const token = await login(account);
      assert.equal((await user('get-info', token)).body.data.role, 'Manager');
      assert.equal((await user('get-all', token)).status, 403);
      await query(pool, 'UPDATE dbo.Users SET RoleId=NULL WHERE UserKey=@userKey;', [userKey(stored.UserKey)]);
      assert.equal((await user('get-info', token)).status, 401);
      assert.equal((await auth('login', account)).status, 401);
    });
    await context.test('parallel duplicate registrations keep one identity and never overwrite credentials', async () => {
      const input = { email: 'race@example.invalid', password: randomBytes(18).toString('base64url'), firstName: 'Test', lastName: 'Test', phoneNumber: 'synthetic' };
      const responses = await Promise.all([auth('register', input), auth('register', input)]);
      assert.deepEqual(responses.map(r => r.status).sort(), [200, 429]);
      const count = await query(pool, 'SELECT COUNT(*) AS count FROM dbo.Users WHERE EmailHash=@hash;', [binary('hash', emailHash(input.email))]);
      assert.equal(count.recordset[0].count, 1);
      assert.equal((await byEmail(pool, input.email)).RoleCode, 'user');
    });
    await context.test('SQL rate limiting persists denied attempts and never leaks credentials', async () => {
      for (let i = 0; i < 10; i++) assert.equal((await auth('login', { email: 'rate@example.invalid', password: 'wrong' })).status, 401);
      const limited = await auth('login', { email: 'rate@example.invalid', password: 'wrong' });
      assert.equal(limited.status, 429);
      assert.equal(limited.body.data, null);
      const events = (await query(pool, 'SELECT EventType,Outcome FROM dbo.SecurityEvents;')).recordset;
      assert.ok(events.length > 10);
      assert.ok(!JSON.stringify(events).includes(admin.password));
      assert.ok(!JSON.stringify(events).includes(adminToken));
    });
    await context.test('private admin CLI is idempotent and never prints the operator secret', () => {
      const result = spawnSync(process.execPath, ['--conditions=react-server', '--import', 'tsx', 'scripts/db/bootstrap-admin.mjs'], {
        encoding: 'utf8', timeout: 30000, env: { ...bootstrapEnv, AUTH_BOOTSTRAP_EMAIL: admin.email, AUTH_BOOTSTRAP_PASSWORD: admin.password },
      });
      assert.equal(result.status, 0);
      assert.equal(JSON.parse(result.stdout).applied, false);
      assert.ok(!result.stdout.includes(admin.password));
      assert.ok(!result.stderr.includes(admin.password));
      const rejected = spawnSync(process.execPath, ['--conditions=react-server', '--import', 'tsx', 'scripts/db/bootstrap-admin.mjs'], {
        encoding: 'utf8', timeout: 30000, env: { ...bootstrapEnv, NODE_ENV: 'production', AUTH_BOOTSTRAP_EMAIL: admin.email, AUTH_BOOTSTRAP_PASSWORD: admin.password },
      });
      assert.equal(rejected.status, 1);
      assert.ok(!rejected.stderr.includes(admin.password));
    });
    await context.test('last enabled administrator survives concurrent disable attempts', async () => {
      const second = { email: 'second-operator@example.invalid', password: randomBytes(18).toString('base64url') };
      const hash = await hashPassword(second.password);
      await authTransaction(pool, async transaction => { await insertUser(transaction, { ...second, passwordHash: hash, firstName: 'Synthetic', lastName: 'Operator', phoneNumber: null, country: null }, await ensureRole(transaction, 'superadmin', 'SuperAdmin'), true); });
      const secondToken = await login(second);
      const responses = await Promise.all([user('toggle-disable', adminToken, { email: second.email }), user('toggle-disable', secondToken, { email: admin.email })]);
      assert.deepEqual(responses.map(r => r.status).sort(), [200, 401]);
      const remaining = await query(pool, "SELECT COUNT(*) AS count FROM dbo.Users u JOIN dbo.Roles r ON r.RoleId=u.RoleId WHERE r.Code=N'superadmin' AND u.IsDisabled=0 AND u.EmailConfirmed=1;");
      assert.equal(remaining.recordset[0].count, 1);
    });
  } finally { messages.length = 0; await closePool(); }
});
