import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { INTERNAL_OPERATIONS, dispatchInternal } from '../../server/integration/dispatch.ts';
import { applicationOrigin } from '../../server/integration/origin.ts';
import { contentTags } from '../../server/integration/invalidation.ts';
import { loadTs } from '../load-ts.mjs';
import { analyzeImport } from '../../server/backend/import/dry-run.ts';
import { dispatchPublic } from '../../server/integration/public-dispatch.ts';

test('internal registry exactly covers all57 original operations and does not infer arbitrary modules',async()=>{
  const swagger=JSON.parse(fs.readFileSync('swagger.json','utf8'));
  const expected=Object.entries(swagger.paths).flatMap(([path,methods])=>Object.keys(methods).map(method=>method.toUpperCase()+' '+path)).sort();
  assert.deepEqual(INTERNAL_OPERATIONS.map(o=>o.method+' '+o.path).sort(),expected);
  assert.equal((await dispatchInternal(new Request('https://internal/api/Unknown/secret'))).status,404);
  assert.equal((await dispatchInternal(new Request('https://internal/api/Services/add'))).status,405);
  assert.equal((await dispatchPublic(new Request('https://internal/api/Setting/get'))).status,401);
});
test('origin validation rejects legacy host, untrusted cleartext, paths, credentials and unsafe production defaults',()=>{
  assert.equal(applicationOrigin({}).origin,'http://localhost:3000');
  assert.equal(applicationOrigin({SQL_ENV:'production',APP_ORIGIN:'https://example.invalid'}).origin,'https://example.invalid');
  for(const raw of ['https://lapis.runasp.net','https://lapis.runasp.net.','https://*.example.invalid','https://**.example.invalid','http://example.invalid','https://user:secret@example.invalid','https://example.invalid/path','https://example.invalid?x=1','https://example.invalid/#x','javascript:alert(1)'])assert.throws(()=>applicationOrigin({APP_ORIGIN:raw}));
  assert.throws(()=>applicationOrigin({SQL_ENV:'production'}));assert.throws(()=>applicationOrigin({SQL_ENV:'production',APP_ORIGIN:'http://127.0.0.1:3000'}));
});
test('public transport preserves query omission/casing,60s tags and private-cache separation without HTTP',async()=>{
  let reads=0,connections=0,latest;const cache=new Map(),policies=[];
  const overrides={
    'next/server':{connection:async()=>{connections++;}},
    'next/cache':{unstable_cache:(fn,keys,options)=>{policies.push(options);return async()=>{const key=JSON.stringify(keys);if(!cache.has(key))cache.set(key,await fn());return cache.get(key);};}},
    './public-dispatch':{dispatchPublic:async request=>{reads++;latest=request;return Response.json({isSuccess:true,data:[{id:reads}],error:null,paging:null});}},
  };
  const {publicApiResponse}=loadTs('server/integration/public-transport.ts',overrides);
  const options={query:{PageNumber:2,'Sort.Field':0,'Sort.Descending':false,Search:'العربية',IsActive:true,skip:null,empty:'',missing:undefined},next:{revalidate:60,tags:['landing-services']}};
  assert.equal((await publicApiResponse('/api/Services/get-all',options)).status,200);await publicApiResponse('/api/Services/get-all',options);assert.equal(reads,1);assert.equal(connections,2);
  const url=new URL(latest.url);assert.equal(url.searchParams.get('PageNumber'),'2');assert.equal(url.searchParams.get('Sort.Descending'),'false');assert.equal(url.searchParams.get('Search'),'العربية');assert.equal(url.searchParams.has('skip'),false);assert.equal(url.searchParams.has('empty'),false);assert.equal(policies[0].revalidate,60);assert.deepEqual(policies[0].tags,['landing-services']);
  await publicApiResponse('/api/Services/get-all',{...options,headers:{Authorization:'Bearer private'}});await publicApiResponse('/api/Services/get-all',{...options,headers:{Authorization:'Bearer private'}});assert.equal(reads,3);
  assert.equal((await publicApiResponse('/api/User/get-all',{})).status,403);
  assert.equal((await publicApiResponse('https://lapis.runasp.net/api/Services/get-all',{})).status,403);
});
test('public error behavior remains an exception; failures are never cached as empty success',async()=>{
  const {publicApiResponse}=loadTs('server/integration/public-transport.ts',{'next/server':{connection:async()=>{}},'next/cache':{unstable_cache:fn=>fn},'./public-dispatch':{dispatchPublic:async()=>Response.json({isSuccess:false,data:null,error:{message:'unavailable'},paging:null},{status:503})}});
  const client=loadTs('lib/api/client.ts',{'@/server/integration/public-transport':{publicApiResponse}});
  await assert.rejects(client.apiFetch('/api/Services/get-all',{next:{revalidate:60}}),/API request failed: 503 Service Unavailable/);
});
test('all original public tags remain, specialist mutation also invalidates blog and no user/auth data tags exist',()=>{
  assert.deepEqual(contentTags('OurSpecialists'),['landing-specialists','landing-blog']);
  assert.deepEqual(contentTags('Setting'),['landing-settings']);assert.deepEqual(contentTags('User'),[]);
  const expected=['landing-services','landing-faqs','landing-specialists','landing-testimonials','landing-gallery','landing-youtube','landing-blog','landing-settings'];
  const all=new Set(['Services','FAQs','OurSpecialists','Testimonials','Galleries','YouTubeGalleries','BlogPosts','Setting'].flatMap(contentTags));assert.deepEqual([...all].sort(),expected.sort());
});
test('runtime adapters contain no legacy fetch fallback; frozen dashboard39-rule allowlist remains unchanged',()=>{
  for(const file of ['lib/api/client.ts','app/(dashboard)/dashboard/api/session/login/route.ts','app/(dashboard)/dashboard/api/proxy/[...path]/route.ts'])assert.doesNotMatch(fs.readFileSync(file,'utf8'),/\bfetch\s*\(|lapis\.runasp\.net/);
  const {PROXY_RULES}=loadTs('dashboard/api/proxy-policy.ts');assert.equal(PROXY_RULES.length,39);
});
test('configured application origin preserves strict CSRF despite Next loopback normalization/IIS listener differences',()=>{
  const old=process.env.APP_ORIGIN;process.env.APP_ORIGIN='https://site.example';
  try{
    const{isSameOriginMutation}=loadTs('dashboard/server/http.ts');
    assert.equal(isSameOriginMutation(new Request('http://localhost:1234/dashboard/api/session/login',{method:'POST',headers:{origin:'https://site.example'}})),true);
    for(const origin of ['https://evil.example','null','http://site.example','https://site.example:444'])assert.equal(isSameOriginMutation(new Request('http://localhost:1234/dashboard/api/session/login',{method:'POST',headers:{origin,'x-forwarded-host':'evil.example'}})),false);
  }finally{if(old===undefined)delete process.env.APP_ORIGIN;else process.env.APP_ORIGIN=old;}
});
const emptyExport=()=>({exportVersion:1,files:[],settings:{},modules:Object.fromEntries(['Services','FAQs','OurSpecialists','Testimonials','Galleries','YouTubeGalleries','BlogPosts'].map(name=>[name,[]]))});
test('import dry run preserves proposed numeric identity mapping without writes or fabricated source data',()=>{
  const source=emptyExport();source.modules.Services=[{id:12,nameAr:'العربية',nameEn:'Original',isActive:true,createdAt:'2026-01-01T00:00:00.1234567'}];
  const before=JSON.stringify(source),report=analyzeImport(source);assert.equal(JSON.stringify(source),before);assert.equal(report.writes,0);assert.equal(report.applySupported,false);assert.deepEqual(report.mappings.Services,[{legacyId:12,proposedId:12}]);assert.equal(report.issues.length,0);
});
test('import dry run detects duplicate IDs/slugs, missing file/author references and unverified media hashes',()=>{
  const source=emptyExport();source.files=[{id:1,filePath:'uploads/legacy.png'}];source.modules.BlogPosts=[{id:1,slug:'saved-slug',titleAr:'نص',titleEn:'Text',isActive:true,status:0,ourSpecialistId:44,image:{id:2,filePath:'uploads/missing.png'},createdAt:'2026-01-01T00:00:00'}, {id:1,slug:'saved-slug',isActive:true,status:0,createdAt:'2026-01-01T00:00:00'}];
  const report=analyzeImport(source),codes=new Set(report.issues.map(i=>i.code));
  for(const code of ['DUPLICATE_ID','DUPLICATE_SLUG','MISSING_FILE_RELATIONSHIP','MISSING_SPECIALIST_RELATIONSHIP','MEDIA_BYTES_HASH_METADATA_UNVERIFIED'])assert.ok(codes.has(code),code);
  assert.doesNotMatch(JSON.stringify(report),/uploads\/legacy|uploads\/missing/);
});
test('import dry run rejects invalid export versions and records incomplete protected datasets as unresolved',()=>{
  assert.throws(()=>analyzeImport({}));const source=emptyExport();delete source.modules.BlogPosts;delete source.settings;
  const codes=new Set(analyzeImport(source).issues.map(i=>i.code));assert.ok(codes.has('MODULE_EXPORT_MISSING'));assert.ok(codes.has('SETTINGS_EXPORT_MISSING'));
});
