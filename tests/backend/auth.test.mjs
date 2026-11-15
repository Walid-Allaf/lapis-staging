import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { SignJWT } from 'jose';
import { readAuthConfig } from '../../server/backend/auth/config.ts';
import { signIdentity, verifyIdentity, CLAIMS } from '../../server/backend/auth/jwt.ts';
import { hashPassword, verifyPassword } from '../../server/backend/auth/password.ts';
import { authSchemas, userSchemas } from '../../server/backend/modules/auth/validation.ts';
import { createAuthHandler, createUserHandler, parseUserFilters } from '../../server/backend/http/auth-handler.ts';
import { smtpMailAdapter } from '../../server/backend/auth/mail.ts';
import { usableAccount } from '../../server/backend/auth/authorize.ts';
import { loadTs } from '../load-ts.mjs';

const env = { AUTH_JWT_KEYS: JSON.stringify({ active: randomBytes(32).toString('base64'), old: randomBytes(32).toString('base64') }),
  AUTH_JWT_ACTIVE_KID: 'active', AUTH_JWT_ISSUER: 'synthetic-issuer', AUTH_JWT_AUDIENCE: 'synthetic-audience', AUTH_OTP_KEY: randomBytes(32).toString('base64') };
const config = readAuthConfig(env);
const identity = { id: 'synthetic-id', email: 'operator@example.invalid', role: 'SuperAdmin', version: 0 };

test('auth secrets are mandatory, independent, and rotation keys are explicit', () => {
  assert.equal(config.keys.size, 2);
  for (const values of [{ AUTH_JWT_KEYS: '{}' }, { AUTH_JWT_ACTIVE_KID: 'missing' }, { AUTH_OTP_KEY: 'weak' }, { AUTH_JWT_ISSUER: '' }, { AUTH_TOKEN_TTL_SECONDS: '99999' }]) {
    assert.throws(() => readAuthConfig({ ...env, ...values }), { status: 503 });
  }
});
test('signed JWT verifies and projects through the unchanged dashboard decoder', async () => {
  const signed = await signIdentity(config, identity);
  const verified = await verifyIdentity(config, signed.token);
  assert.equal(verified.id, identity.id);
  assert.equal(verified.role, identity.role);
  const { decodeAdminSession } = loadTs('dashboard/server/session.ts');
  const session = decodeAdminSession(signed.token);
  assert.deepEqual(JSON.parse(JSON.stringify(session.user)), { id: identity.id, email: identity.email, role: identity.role });
  assert.equal(session.expiresOn, signed.expiresOn);
});
test('tampering, unsigned JWTs, wrong issuer/audience/kid/algorithm are rejected', async () => {
  const signed = await signIdentity(config, identity);
  const parts = signed.token.split('.');
  parts[1] = Buffer.from(JSON.stringify({ ...JSON.parse(Buffer.from(parts[1], 'base64url')), role: 'User' })).toString('base64url');
  await assert.rejects(verifyIdentity(config, parts.join('.')), { status: 401 });
  await assert.rejects(verifyIdentity(config, `${Buffer.from('{"alg":"none"}').toString('base64url')}.${parts[1]}.`), { status: 401 });
  for (const overrides of [{ issuer: 'other' }, { audience: 'other' }, { keys: new Map() }]) await assert.rejects(verifyIdentity({ ...config, ...overrides }, signed.token), { status: 401 });
  const wrong = await new SignJWT({ ...identity, sv: 0 }).setProtectedHeader({ alg: 'HS384', typ: 'JWT', kid: 'active' }).setSubject(identity.id)
    .setIssuer(config.issuer).setAudience(config.audience).setIssuedAt().setNotBefore('0s').setExpirationTime('10m').setJti('synthetic')
    .sign(config.keys.get('active'));
  await assert.rejects(verifyIdentity(config, wrong), { status: 401 });
});
test('expired and not-yet-valid tokens fail; retired key works only while retained', async () => {
  const now = Math.floor(Date.now() / 1000);
  await assert.rejects(verifyIdentity(config, (await signIdentity(config, identity, now - 2000)).token), { status: 401 });
  await assert.rejects(verifyIdentity(config, (await signIdentity(config, identity, now + 120)).token), { status: 401 });
  const old = await signIdentity({ ...config, activeKid: 'old' }, identity);
  assert.equal((await verifyIdentity(config, old.token)).id, identity.id);
  await assert.rejects(verifyIdentity({ ...config, keys: new Map([['active', config.keys.get('active')]]) }, old.token), { status: 401 });
});
test('legacy .NET claim aliases work with cryptographic verification; conflicting aliases fail', async () => {
  const base = { [CLAIMS.id]: identity.id, [CLAIMS.email]: identity.email, [CLAIMS.role]: identity.role, sv: 0 };
  async function token(payload) { return new SignJWT(payload).setProtectedHeader({ alg: 'HS256', kid: 'active', typ: 'JWT' }).setIssuer(config.issuer).setAudience(config.audience).setIssuedAt().setNotBefore('0s').setExpirationTime('5m').setJti('alias-test').sign(config.keys.get('active')); }
  assert.equal((await verifyIdentity(config, await token(base))).role, identity.role);
  await assert.rejects(verifyIdentity(config, await token({ ...base, sub: 'different-id' })), { status: 401 });
  await assert.rejects(verifyIdentity(config, await token({ ...base, [CLAIMS.role]: undefined })), { status: 401 });
});
test('scrypt hashes are salted; invalid and unknown hashes cannot authenticate', async () => {
  const password = 'Synthetic-secret-123!';
  const one = await hashPassword(password), two = await hashPassword(password);
  assert.ok(one !== two);
  assert.ok(!one.includes(password));
  assert.equal(await verifyPassword(password, one), true);
  assert.equal(await verifyPassword('incorrect', one), false);
  assert.equal(await verifyPassword(password, null), false);
  assert.equal(await verifyPassword(password, '$scrypt$v1$999999999$8$3$bad$bad'), false);
  await assert.rejects(hashPassword('short'), { code: 'AUTH_PASSWORD_POLICY' });
});
test('Swagger optional/null/required/casing and closed-object constraints remain explicit', () => {
  assert.deepEqual(authSchemas.login.parse({ email: null }), { email: null });
  assert.deepEqual(userSchemas['edit-profile'].parse({ firstName: null, fileId: null }), { firstName: null, fileId: null });
  assert.throws(() => authSchemas.login.parse({ Email: 'a@example.invalid' }));
  assert.throws(() => authSchemas.register.parse({}));
  assert.throws(() => authSchemas['send-otp'].parse({ email: 'a@example.invalid', purpose: 3 }));
  assert.throws(() => authSchemas['verify-otp'].parse({ email: 'a@example.invalid', code: '12345' }));
  assert.throws(() => authSchemas['reset-password'].parse({ email: 'a@example.invalid', code: 'x', newPassword: 'x'.repeat(21) }));
  assert.throws(() => authSchemas['toggle-2fa'].parse({ enabled: true }));
  assert.throws(() => userSchemas['edit-profile'].parse({ role: 'SuperAdmin' }));
});
test('literal dotted queries and new pagination/sort policy parse without interpolation', () => {
  const filters = parseUserFilters('https://local/api/User/get-all?PageNumber=2&PageSize=3&Sort.Field=1&Sort.Descending=false&IsActive=true');
  assert.deepEqual(filters, { pageNumber: 2, pageSize: 3, search: undefined, sort: 1, descending: false, isActive: true });
  assert.throws(() => parseUserFilters('https://local/api/User/get-all?Sort.Field=1%3BDROP'));
  assert.throws(() => parseUserFilters('https://local/api/User/get-all?PageSize=0'));
  assert.throws(() => parseUserFilters('https://local/api/User/get-all?PageNumber=1&PageNumber=2'));
});
test('missing/unknown roles and unresolved/disabled/unconfirmed states fail closed', () => {
  const user = { Email: identity.email, NormalizedEmail: identity.email, IsDisabled: false, EmailConfirmed: true, TwoFactorEnabled: false, SecurityVersion: 0, RoleCode: 'superadmin', ContractValue: 'SuperAdmin', ContractValueKind: 'string' };
  assert.equal(usableAccount(user), true);
  for (const invalid of [{ RoleCode: null }, { ContractValue: 'Admin' }, { ContractValue: '1', ContractValueKind: 'number' }, { EmailConfirmed: false }, { IsDisabled: true }, { IsDisabled: null }, { TwoFactorEnabled: null }, { SecurityVersion: null }]) assert.equal(usableAccount({ ...user, ...invalid }), false);
});
test('HTTP boundary rejects malformed/oversized input without reflecting data or opening SQL', async () => {
  let opened = 0;
  const handler = createAuthHandler('login', async () => { opened++; throw new Error('password=private'); });
  const invalid = await handler(new Request('https://local/api/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{"password":' }));
  assert.equal(invalid.status, 400);
  assert.equal(opened, 0);
  const large = await handler(new Request('https://local/api/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ password: 'x'.repeat(17000) }) }));
  assert.equal(large.status, 413);
  const failure = await handler(new Request('https://local/api/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' }));
  assert.equal(failure.status, 503);
  assert.doesNotMatch(JSON.stringify(await failure.json()), /password|private/);
  const anonymous = await createUserHandler('get-info') (new Request('https://local/api/User/get-info'));
  assert.equal(anonymous.status, 401);
});
test('SMTP absence fails safely; no development mail bypass exists in runtime factory', () => {
  assert.throws(() => smtpMailAdapter({}), { status: 503 });
});
