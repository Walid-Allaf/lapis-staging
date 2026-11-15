import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';

const source = fs.readFileSync(path.join(process.cwd(), 'dashboard/api/auth.ts'), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const context = { exports: {}, URL, atob, Date };
vm.runInNewContext(compiled, context);
const { isAdminRole, safeDashboardRedirect, expiryTime } = context.exports;

test('accepts only the currently configured administrator roles', () => {
  for (const role of [1, 2, '1', '2', 'SuperAdmin', 'SUPER_ADMIN', 'super-admin', 'Manager', 'mAnAgEr', 'Admin']) {
    assert.equal(isAdminRole(role), true, String(role));
  }
  for (const role of [0, 3, -1, 1.5, 'Owner', 'User', '', null, undefined, {}, []]) {
    assert.equal(isAdminRole(role), false, String(role));
  }
});

test('preserves internal dashboard destinations and query strings', () => {
  assert.equal(safeDashboardRedirect('/dashboard/blog-posts?search=test'), '/dashboard/blog-posts?search=test');
  assert.equal(safeDashboardRedirect('/dashboard'), '/dashboard');
});

test('rejects external, ambiguous, escaping, and login-loop redirects', () => {
  for (const value of [null, '', 'https://evil.com', '//evil.com', '/dashboardevil', '/services',
    '/dashboard/../services', '/dashboard/%2e%2e/services', '/dashboard\\evil',
    '/dashboard/%5c%5cevil.com', '/dashboard/login', '/dashboard/login?redirect=/dashboard',
    '/dashboard\n/evil', '%', 'javascript:alert(1)']) {
    assert.equal(safeDashboardRedirect(value), '/dashboard', String(value));
  }
});

test('parses API UTC timestamps consistently and fails closed on missing expiry', () => {
  assert.equal(expiryTime('2030-01-01T00:00:00'), Date.parse('2030-01-01T00:00:00Z'));
  assert.equal(expiryTime('2030-01-01T03:00:00+03:00'), Date.parse('2030-01-01T00:00:00Z'));
  assert.equal(expiryTime(null), 0);
  assert.equal(expiryTime('invalid'), 0);
});

