import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadTs } from './load-ts.mjs';

const { buildUpstreamUrl, matchProxyRule, PROXY_RULES } = loadTs('dashboard/api/proxy-policy.ts');
const { isSameOriginMutation } = loadTs('dashboard/server/http.ts');
const { decodeAdminSession, MAX_SESSION_TOKEN_BYTES } = loadTs('dashboard/server/session.ts');
const { boundedRequestBody } = loadTs('dashboard/server/body-limit.ts');
const { MAX_UPLOAD_BYTES } = loadTs('dashboard/api/upload-limits.ts');

test('proxy path validation rejects traversal, delimiters and alternate origins', () => {
  for (const parts of [[], [''], ['..'], ['.'], ['Services','../get-all'], ['Services','%2f'], ['%252e%252e'], ['https:', 'evil.test'], ['//evil.test'], ['x\\y'], ['x\ny'], ['x?y'], ['x#y']]) {
    assert.throws(() => buildUpstreamUrl('https://backend.example', parts, ''));
  }
  assert.equal(buildUpstreamUrl('https://backend.example/', ['Services','get-all'], '?pageNumber=2').href, 'https://backend.example/api/Services/get-all?pageNumber=2');
  assert.throws(() => buildUpstreamUrl('https://backend.example/other', ['Services'], ''));
});

test('allowlist is method and endpoint specific, with no auth relay', () => {
  assert(matchProxyRule('GET', ['Services','get-all']));
  assert(matchProxyRule('PUT', ['Setting','edit']));
  assert(matchProxyRule('POST', ['FileUpload','upload']));
  for (const [method,parts] of [['POST',['Services','get-all']],['GET',['auth','login']],['POST',['auth','login']],['GET',['Users','get-all']],['PATCH',['Setting','edit']],['DELETE',['Services','delete','oops']]]) assert.equal(matchProxyRule(method,parts), undefined);
  assert.equal(PROXY_RULES.length, 39);
});

test('mutations require same-origin Origin or Referer', () => {
  const req = headers => new Request('https://site.example/dashboard/api/session/login', { method:'POST', headers });
  assert(isSameOriginMutation(req({Origin:'https://site.example'})));
  assert(isSameOriginMutation(req({Referer:'https://site.example/dashboard/login'})));
  for (const headers of [{},{Origin:'null'},{Origin:'https://evil.example'},{Referer:'https://evil.example/x'},{Origin:'https://site.example.evil.test'},{Origin:'https://bad@site.example'}]) assert.equal(isSameOriginMutation(req(headers)),false);
});

test('cookie claims fail closed and expose only the session projection', () => {
  const claims={sub:'id',email:'mail@example.test',role:'Manager',exp:Math.floor(Date.now()/1000)+3600};
  const jwt = value => 'e30.'+Buffer.from(JSON.stringify(value)).toString('base64url')+'.c2ln';
  const session=decodeAdminSession(jwt(claims));
  assert.equal(session.user.email,claims.email);assert.equal('token' in session,false);
  for (const value of [undefined,'opaque',jwt({...claims,role:'User'}),jwt({...claims,exp:1}),jwt({...claims,email:null}),jwt({...claims,nbf:claims.exp+3600}),'x'.repeat(MAX_SESSION_TOKEN_BYTES+1)]) assert.equal(decodeAdminSession(value),null);
});

test('streams an exact-limit file including multipart framing, rejects one extra byte', async () => {
  async function consume(size) {
    const form = new FormData();form.set('file',new Blob([new Uint8Array(size)]),'upload.bin');
    const request = new Request('https://site.example/upload',{method:'POST',body:form});
    const limited=boundedRequestBody(request);
    try { await new Response(limited.body).arrayBuffer(); } catch { throw limited.getFailure(); }
  }
  await consume(MAX_UPLOAD_BYTES);
  await assert.rejects(consume(MAX_UPLOAD_BYTES+1), error => error.status===413);
});

test('JSON bodies are bounded without accumulating the request', async () => {
  const body=new Uint8Array(MAX_UPLOAD_BYTES+1);
  const limited=boundedRequestBody(new Request('https://site.example/json',{method:'POST',body}));
  await assert.rejects(new Response(limited.body).arrayBuffer());
  assert.equal(limited.getFailure().status,413);
});

test('background unauthenticated checks preserve an intentional logout', () => {
  const { useAuthStore } = loadTs('dashboard/stores/use-auth-store.ts');
  useAuthStore.getState().logout(true);
  useAuthStore.getState().logout();
  assert.equal(useAuthStore.getState().isLoggingOut, true);
  assert.equal(useAuthStore.getState().status, 'unauthenticated');
  assert.equal('token' in useAuthStore.getState(), false);
  assert.equal('persist' in useAuthStore, false);
});
