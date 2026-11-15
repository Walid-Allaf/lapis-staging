import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { randomBytes } from 'node:crypto';
import sql from 'mssql';
import { assertDatabaseWriteAllowed } from '../../server/backend/config.ts';
import { getPool, closePool } from '../../server/backend/db/pool.ts';
import { query } from '../../server/backend/db/parameters.ts';
import { migrateDatabase } from '../../server/backend/db/migrate.ts';
import { bootstrapAdministrator } from '../../server/backend/auth/bootstrap.ts';
import { readAuthConfig } from '../../server/backend/auth/config.ts';
import { hashPassword } from '../../server/backend/auth/password.ts';
import { AuthenticationService } from '../../server/backend/modules/auth/service.ts';
import { authTransaction, ensureRole, insertUser, userKey, integer, text, byEmail } from '../../server/backend/modules/auth/repository.ts';
import { resources } from '../../server/backend/modules/content/definitions.ts';
import { assertLegacyProfile } from './content-fixtures.mjs';
import { loadTs } from '../load-ts.mjs';

const enabled = process.env.SQL_ALLOW_TESTS === 'true';
test('Phase 4 real SQL and unchanged frontend contracts, all 43 exported routes', { skip: enabled ? false : 'Explicit disposable SQL credentials are not configured', timeout: 180000 }, async context => {
  assertDatabaseWriteAllowed('test');
  const pool = await getPool();
  const config = readAuthConfig();
  const swagger = JSON.parse(fs.readFileSync('swagger.json', 'utf8'));
  const patterns = Object.entries(swagger.paths).filter(([p]) => !/^\/api\/(auth|User|FileUpload)\//.test(p)).map(([p,methods]) => ({ path: p, method: Object.keys(methods)[0].toUpperCase(), regex: new RegExp('^' + p.replace(/\{[^}]+\}/g, '([^/]+)') + '$'), keys: [...p.matchAll(/\{([^}]+)\}/g)].map(m => m[1]) }));
  const passed = new Set();
  async function call(method, route, body, token, language = 'ar') {
    const url = new URL(route.startsWith('/api/') ? 'https://local' + route : 'https://local/api/' + route);
    const pattern = patterns.find(p => p.method === method && p.regex.test(url.pathname));
    assert.ok(pattern, 'A documented content operation must match');
    const match = pattern.regex.exec(url.pathname);
    const params = Object.fromEntries(pattern.keys.map((key,index) => [key, decodeURIComponent(match[index+1])]));
    const file = path.resolve('app' + pattern.path.replace(/\{([^}]+)\}/g, '[$1]') + '/route.ts');
    const handler = (await import(pathToFileURL(file).href))[method];
    const request = new Request(url, { method, headers: { 'content-type': 'application/json', 'accept-language': language, ...(token ? { authorization: `Bearer ${token}` } : {}) }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
    const response = await handler(request, { params: Promise.resolve(params) });
    const payload = await response.json();
    assert.equal(response.headers.get('cache-control'), 'no-store');
    if (response.status === 200) { passed.add(method + ' ' + pattern.path); assert.equal(payload.isSuccess, true); assert.equal(payload.error, null); }
    else { assert.equal(payload.isSuccess, false); assert.equal(payload.data, null); assert.equal(payload.error.details, null); assert.equal(typeof payload.error.code, 'string'); assert.equal(typeof payload.error.message, 'string'); assert.equal(payload.message, payload.error.message); }
    return { status: response.status, body: payload };
  }
  const administrator = { email: 'content-operator@example.invalid', password: randomBytes(18).toString('base64url') };
  const member = { email: 'content-member@example.invalid', password: randomBytes(18).toString('base64url') };
  const manager = { email: 'content-manager@example.invalid', password: randomBytes(18).toString('base64url') };
  let adminToken, memberToken, managerToken, fileId;
  const primary = {};
  const bodyFor = resource => Object.fromEntries(resource.fields.map(field => [field.property,
    field.property === 'isActive' ? true : field.reference === 'file' ? fileId : field.reference === 'specialist' ? primary.OurSpecialists.id :
    field.kind === 'string' ? field.property === 'videoUrl' ? 'https://www.youtube.com/watch?v=abcdefghijk' : field.property.endsWith('Ar') ? 'العربية کوردی — اختبار' : 'English Alpha %_[' :
    field.kind === 'boolean' ? false : field.property === 'starNumber' ? 4 : field.property === 'status' ? 0 : 2]));
  const feature = { Services: 'services', FAQs: 'faqs', OurSpecialists: 'our-specialists', Testimonials: 'testimonials', Galleries: 'gallery', YouTubeGalleries: 'youtube-galleries', BlogPosts: 'blog-posts' };
  const soleFunction = exports => { const functions = Object.values(exports).filter(value => typeof value === 'function'); assert.equal(functions.length, 1); return functions[0]; };
  const axios = {
    async get(route, options = {}) { const url = new URL('https://local/api/' + route); for (const [k,v] of Object.entries(options.params || {})) if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v)); const result = await call('GET', url.pathname + url.search, undefined, managerToken); assert.equal(result.status, 200); return { data: result.body }; },
    async post(route, body) { const result = await call('POST', route, body, managerToken); assert.equal(result.status, 200); return { data: result.body }; },
    async put(route, body) { const result = await call('PUT', route, body, managerToken); assert.equal(result.status, 200); return { data: result.body }; },
    async delete(route) { const result = await call('DELETE', route, undefined, managerToken); assert.equal(result.status, 200); return { data: result.body }; },
  };
  const overrides = { '@/dashboard/api/axios': { __esModule: true, default: axios, axios },
    '@/dashboard/utils': loadTs('dashboard/utils/index.ts') };
  const oldBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  try {
    assert.equal((await query(pool, 'SELECT COUNT(*) AS count FROM sys.tables WHERE is_ms_shipped=0;')).recordset[0].count, 0, 'Use a newly provisioned empty disposable database');
    assert.deepEqual(await migrateDatabase(pool), { applied: 7, total: 7 });
    await bootstrapAdministrator(pool, administrator, { ...process.env, AUTH_BOOTSTRAP_ALLOW: 'true', AUTH_BOOTSTRAP_CONFIRM: 'CREATE_FIRST_SUPERADMIN' });
    const managerHash = await hashPassword(manager.password), memberHash = await hashPassword(member.password);
    await authTransaction(pool, async transaction => {
      await insertUser(transaction, { ...member, passwordHash: memberHash, firstName: 'Synthetic', lastName: 'Member', phoneNumber: null, country: null }, await ensureRole(transaction, 'user', 'User'), true);
      const role = (await query(transaction, "INSERT INTO dbo.Roles(Code,ContractValue,ContractValueKind) OUTPUT INSERTED.RoleId VALUES(N'manager',N'Manager',N'string');")).recordset[0].RoleId;
      await insertUser(transaction, { ...manager, passwordHash: managerHash, firstName: 'Synthetic', lastName: 'Manager', phoneNumber: null, country: null }, role, true);
    });
    const auth = new AuthenticationService(pool, config, () => { throw new Error('No real SMTP is permitted in content tests'); });
    adminToken = (await auth.login(administrator)).data.token;
    memberToken = (await auth.login(member)).data.token;
    managerToken = (await auth.login(manager)).data.token;
    fileId = (await query(pool, `INSERT INTO dbo.Files(StorageKey,PublicPath,MimeType,ByteLength,Sha256,CreatedByUserKey,StorageState)
      OUTPUT INSERTED.Id VALUES(@key,N'uploads/phase4-fixture.webp',N'image/webp',1,@hash,@userKey,N'ready');`, [text('key', randomBytes(16).toString('hex')), { name: 'hash', type: sql.VarBinary(32), value: Buffer.alloc(32) }, userKey((await byEmail(pool, administrator.email)).UserKey)])).recordset[0].Id;

    await context.test('Setting and Client settings: persisted singleton, projections, toggles, nulls and concurrent partial edits', async () => {
      assert.equal((await call('GET', '/api/Client/get-settings')).status, 404);
      const anonymous = await call('GET', '/api/Setting/get');
      assert.equal(anonymous.status, 401);
      assertLegacyProfile('/api/Setting/get', anonymous.body, ['message']);
      assert.equal((await call('PUT', '/api/Setting/edit', {}, memberToken)).status, 403);
      const input = Object.fromEntries(Object.entries(swagger.components.schemas.SettingUpdateCommand.properties).map(([key,p]) => [key, p.type === 'boolean' ? true : p.type === 'number' ? 12.5 : 'العربية English']));
      assert.equal((await call('PUT', '/api/Setting/edit', input, managerToken)).status, 200);
      const settings = await call('GET', '/api/Client/get-settings');
      assertLegacyProfile('/api/Client/get-settings', settings.body);
      assert.equal((await call('GET', '/api/Setting/get', undefined, managerToken)).status, 200);
      assert.deepEqual((await call('GET', '/api/Setting/get', undefined, adminToken)).body.data, settings.body.data);
      assert.equal((await call('PUT', '/api/Setting/edit', { faQsTabToggle: false, latitude: null }, managerToken)).status, 200);
      assert.equal((await call('GET', '/api/Client/get-settings')).body.data.faQsTabToggle, false);
      assert.equal((await call('GET', '/api/Client/get-settings')).body.data.latitude, null);
      const parallel = await Promise.all([call('PUT', '/api/Setting/edit', { address: 'Address' }, managerToken), call('PUT', '/api/Setting/edit', { email: 'contact@example.invalid' }, adminToken)]);
      assert.ok(parallel.every(result => result.status === 200));
      const row = (await call('GET', '/api/Client/get-settings')).body.data;
      assert.equal(row.address, 'Address'); assert.equal(row.email, 'contact@example.invalid');
      assert.equal((await query(pool, 'SELECT COUNT(*) AS count FROM dbo.SiteSettings;')).recordset[0].count, 1);
      assert.equal((await call('PUT', '/api/Setting/edit', { id: 1 }, managerToken)).status, 400);
      // Restore numeric observation branch for later structural comparisons.
      await call('PUT', '/api/Setting/edit', { latitude: 12.5 }, adminToken);
    });

    // Each module's tests finish before the next module starts, in the requested order.
    for (const name of ['Services','FAQs','OurSpecialists','Testimonials','Galleries','YouTubeGalleries','BlogPosts']) {
      const resource = resources[name];
      await context.test(`${name}: all CRUD routes, legacy DTOs, persistence, queries, authorization and rollback`, async () => {
        const body = bodyFor(resource);
        assert.equal((await call('POST', `/api/${name}/add`, body)).status, 401);
        assert.equal((await call('POST', `/api/${name}/add`, body, memberToken)).status, 403);
        const created = await call('POST', `/api/${name}/add`, body, managerToken);
        assert.equal(created.status, 200);
        primary[name] = created.body.data;
        const id = primary[name].id;
        assert.equal(typeof id, 'number');
        assert.equal((await query(pool, `SELECT COUNT(*) AS count FROM dbo.[${resource.table}] WHERE Id=@id;`, [integer('id',id)])).recordset[0].count, 1);
        const detail = await call('GET', `/api/${name}/get-by-id/${id}`);
        assert.equal(detail.status, 200);
        assertLegacyProfile(name + '_detail', detail.body, name === 'Testimonials' ? ['starNumber'] : []);
        assert.ok(!('RowVersion' in detail.body.data));
        const list = await call('GET', `/api/${name}/get-all?PageNumber=1&PageSize=2&IsActive=true`);
        assert.equal(list.status, 200);
        assertLegacyProfile(name + '_list', list.body, name === 'Testimonials' ? ['starNumber'] : []);
        const hidden = await call('POST', `/api/${name}/add`, { ...body, isActive: false }, adminToken);
        assert.equal(hidden.status, 200);
        assert.equal((await call('GET', `/api/${name}/get-by-id/${hidden.body.data.id}`)).status, 404);
        assert.equal((await call('GET', `/api/${name}/get-all?IsActive=false`)).body.data.length, 0);
        assert.equal((await call('GET', `/api/${name}/get-all?IsActive=false`, undefined, memberToken)).body.data.length, 0);
        assert.equal((await call('GET', `/api/${name}/get-all?IsActive=false`, undefined, managerToken)).body.data.length, 1);
        const page = await call('GET', `/api/${name}/get-all?PageNumber=2&PageSize=1&Sort.Field=0&Sort.Descending=false`, undefined, adminToken);
        assert.equal(page.body.paging.totalRecords, 2); assert.equal(page.body.data[0].id, hidden.body.data.id);
        assert.equal((await call('GET', `/api/${name}/get-all?Search=${encodeURIComponent('العربية')}`)).body.data.length, 1);
        assert.equal((await call('GET', `/api/${name}/get-all?Search=${encodeURIComponent('%_[')}`)).body.data.length, 1);
        assert.equal((await call('GET', `/api/${name}/get-all?Search=__no_synthetic_match__`)).body.paging.totalRecords, 0);
        for (let sort = 0; sort < resource.sortColumns.length; sort++) assert.equal((await call('GET', `/api/${name}/get-all?Sort.Field=${sort}&Sort.Descending=true`, undefined, adminToken)).status, 200);
        assert.equal((await call('GET', `/api/${name}/get-all?Sort.Field=arbitrary-sql`)).status, 400);
        const invalidPage = await call('GET', `/api/${name}/get-all?PageSize=0`);
        assert.equal(invalidPage.status, 400);
        assertLegacyProfile('query_invalid_int', invalidPage.body, ['message']);
        assert.equal((await call('GET', `/api/${name}/get-all`, undefined, 'aa.bb.cc')).status, 401);
        assert.equal((await call('PUT', `/api/${name}/edit/${id}`, { id: id + 1 }, managerToken)).status, 400);
        assert.equal((await call('PUT', `/api/${name}/edit/${id}`, { unexpected: true }, managerToken)).status, 400);
        const field = resource.fields.find(field => field.kind === 'string');
        assert.equal((await call('PUT', `/api/${name}/edit/${id}`, { id, [field.property]: null }, managerToken)).status, 200);
        assert.equal((await query(pool, `SELECT [${field.column}] AS value FROM dbo.[${resource.table}] WHERE Id=@id;`, [integer('id',id)])).recordset[0].value, null);
        assert.equal((await call('GET', `/api/${name}/get-by-id/${id}`)).body.data[field.property], '');
        await call('PUT', `/api/${name}/edit/${id}`, { [field.property]: body[field.property] }, managerToken);
        const reference = resource.fields.find(field => field.reference === 'file');
        if (reference) {
          assert.equal((await call('PUT', `/api/${name}/edit/${id}`, { [reference.property]: 2147483647, [field.property]: 'must-not-persist' }, managerToken)).status, 400);
          assert.equal((await call('GET', `/api/${name}/get-by-id/${id}`)).body.data[field.property], body[field.property]);
          assert.equal((await call('PUT', `/api/${name}/edit/${id}`, { [reference.property]: null }, managerToken)).body.data[reference.image], null);
          await call('PUT', `/api/${name}/edit/${id}`, { [reference.property]: fileId }, managerToken);
        }
        if (name === 'Testimonials') {
          assert.equal((await call('PUT', `/api/${name}/edit/${id}`, { starsNumber: 3 }, managerToken)).body.data.starNumber, 3);
          assert.equal((await call('PUT', `/api/${name}/edit/${id}`, { starNumber: 4 }, managerToken)).body.data.starsNumber, 4);
          assert.equal((await call('PUT', `/api/${name}/edit/${id}`, { starsNumber: 3, starNumber: 4 }, managerToken)).status, 400);
        }
        for (const language of ['ar','en','ku']) assert.deepEqual((await call('GET', `/api/${name}/get-by-id/${id}`, undefined, undefined, language)).body.data, (await call('GET', `/api/${name}/get-by-id/${id}`)).body.data);
        const ephemeral = (await call('POST', `/api/${name}/add`, body, managerToken)).body.data;
        assert.equal((await call('DELETE', `/api/${name}/delete/${ephemeral.id}`, undefined, memberToken)).status, 403);
        assert.equal((await call('DELETE', `/api/${name}/delete/${ephemeral.id}`, undefined, managerToken)).status, 200);
        const deleted = await call('GET', `/api/${name}/get-by-id/${ephemeral.id}`);
        assert.equal(deleted.status, 404);
        assertLegacyProfile('not_found', deleted.body, ['message']);
        assert.equal((await query(pool, `SELECT COUNT(*) AS count FROM dbo.[${resource.table}] WHERE Id=@id;`, [integer('id',ephemeral.id)])).recordset[0].count, 0);
        assert.equal((await query(pool, 'SELECT COUNT(*) AS count FROM dbo.Files WHERE Id=@id;', [integer('id',fileId)])).recordset[0].count, 1);

        // Execute the exact existing dashboard API service functions over test-only transport.
        const folder = feature[name], prefix = folder;
        const serviceFile = suffix => `dashboard/features/${folder}/services/${prefix}-${suffix}-service.ts`;
        const originalCreate = soleFunction(loadTs(serviceFile('create'), overrides));
        const originalGetAll = soleFunction(loadTs(serviceFile('get-all'), overrides));
        const originalGetById = soleFunction(loadTs(serviceFile('get-by-id'), overrides));
        const originalUpdate = soleFunction(loadTs(serviceFile('update'), overrides));
        const originalRemove = soleFunction(loadTs(serviceFile('remove'), overrides));
        const frontendCreated = await originalCreate(body);
        const frontendId = frontendCreated.data.id;
        assert.equal((await originalGetById(frontendId)).id, frontendId);
        assert.ok(Array.isArray((await originalGetAll({ search: 'English' })).data));
        assert.equal((await originalUpdate({ ...body, id: frontendId })).isSuccess, true);
        assert.equal((await originalRemove(frontendId)).isSuccess, true);
      });
    }
    await context.test('Blog by-slug/status/featured policies, stable URLs, relationship privacy and concurrent uniqueness', async () => {
      const blog = primary.BlogPosts;
      const before = await call('GET', '/api/BlogPosts/by-slug/' + encodeURIComponent(blog.slug));
      assert.equal(before.status, 200); assertLegacyProfile('BlogPosts_slug', before.body);
      await call('PUT', `/api/BlogPosts/edit/${blog.id}`, { titleEn: 'A changed title', isFeatured: true }, managerToken);
      assert.equal((await call('GET', '/api/BlogPosts/by-slug/' + encodeURIComponent(blog.slug))).body.data.slug, blog.slug);
      assert.equal((await call('GET', '/api/BlogPosts/get-all?IsFeatured=true')).body.data.length, 1);
      await call('PUT', `/api/BlogPosts/edit/${blog.id}`, { status: 1 }, managerToken);
      assert.equal((await call('GET', `/api/BlogPosts/get-by-id/${blog.id}`)).status, 404);
      assert.equal((await call('GET', '/api/BlogPosts/get-all?Status=1')).body.data.length, 0);
      assert.ok((await call('GET', '/api/BlogPosts/get-all?Status=1', undefined, managerToken)).body.data.length >= 1);
      await call('PUT', `/api/BlogPosts/edit/${blog.id}`, { status: 0 }, managerToken);
      assert.equal((await call('DELETE', `/api/OurSpecialists/delete/${primary.OurSpecialists.id}`, undefined, managerToken)).status, 409);
      await call('PUT', `/api/OurSpecialists/edit/${primary.OurSpecialists.id}`, { isActive: false }, managerToken);
      assert.equal((await call('GET', `/api/BlogPosts/get-by-id/${blog.id}`)).body.data.ourSpecialist, null);
      assert.equal((await call('GET', `/api/BlogPosts/get-by-id/${blog.id}`, undefined, managerToken)).body.data.ourSpecialist.isActive, false);
      await call('PUT', `/api/OurSpecialists/edit/${primary.OurSpecialists.id}`, { isActive: true }, managerToken);
      const body = { ...bodyFor(resources.BlogPosts), titleEn: '', titleAr: 'عنوان عربي متكرر' };
      const concurrent = await Promise.all([call('POST','/api/BlogPosts/add',body,managerToken),call('POST','/api/BlogPosts/add',body,adminToken)]);
      assert.ok(concurrent.every(result => result.status === 200));
      assert.notEqual(concurrent[0].body.data.slug, concurrent[1].body.data.slug);
      for (const item of concurrent) assert.equal((await call('GET', '/api/BlogPosts/by-slug/' + encodeURIComponent(item.body.data.slug))).status, 200);
      const defaults = await call('POST', '/api/BlogPosts/add', {}, adminToken);
      assert.equal(defaults.status, 200); assert.equal(defaults.body.data.isActive, false); assert.equal(defaults.body.data.ourSpecialistId, 0); assert.equal(defaults.body.data.ourSpecialist, null);
      assert.equal((await call('GET', `/api/BlogPosts/get-by-id/${defaults.body.data.id}`)).status, 404);
    });
    await context.test('Ads and Client ads use persisted distinct projections without fabricated file URLs', async () => {
      assert.equal((await call('GET','/api/Ads/get')).status,401);
      assert.equal((await call('GET','/api/Client/get-ads')).status,404);
      assert.equal((await call('PUT','/api/Ads/edit',{ text:'draft',url:'https://example.invalid/ad',fileId,isActive:false,isExternal:true },managerToken)).status,200);
      assertLegacyProfile('/api/Client/get-ads',(await call('GET','/api/Client/get-ads')).body);
      const admin = await call('GET','/api/Ads/get',undefined,managerToken);
      assert.equal(admin.status,200); assert.equal(admin.body.data.file.id,fileId);
      assert.equal((await call('PUT','/api/Ads/edit',{fileId:2147483647,text:'must-not-persist'},managerToken)).status,400);
      assert.equal((await call('GET','/api/Ads/get',undefined,managerToken)).body.data.text,'draft');
      await call('PUT','/api/Ads/edit',{isActive:true},managerToken);
      assert.deepEqual((await call('GET','/api/Client/get-ads')).body.data,{text:'draft',url:'https://example.invalid/ad',isActive:true});
      assert.equal((await query(pool,'SELECT COUNT(*) AS count FROM dbo.Ads;')).recordset[0].count,1);
    });
    await context.test('statistics are actual content counts; Manager gains no User-management permission', async () => {
      assert.equal((await call('GET','/api/Setting/get-statistic')).status,401);
      assert.equal((await call('GET','/api/Setting/get-statistic',undefined,memberToken)).status,403);
      const statistics = await call('GET','/api/Setting/get-statistic',undefined,managerToken);
      assert.equal(statistics.status,200);
      for(const resource of Object.values(resources)) assert.equal(statistics.body.data[resource.name].total,(await query(pool,`SELECT COUNT(*) AS count FROM dbo.[${resource.table}];`)).recordset[0].count);
      const {GET}=await import('../../app/api/User/get-all/route.ts');
      assert.equal((await GET(new Request('https://local/api/User/get-all',{headers:{authorization:`Bearer ${managerToken}`}}))).status,403);
    });
    await context.test('unchanged public API functions consume SQL-backed DTOs and keep existing URL/cache options', async () => {
      const envMatch=fs.readFileSync('.env','utf8').match(/^\s*NEXT_PUBLIC_API_BASE_URL\s*=\s*["']?([^\r\n"']+)/m);
      process.env.NEXT_PUBLIC_API_BASE_URL=envMatch[1].trim();
      const originalClient=loadTs('lib/api/client.ts');
      const bridge={createAssetUrl:originalClient.createAssetUrl,async apiFetch(route,options={}){const url=new URL('https://local'+route);for(const [k,v]of Object.entries(options.query||{}))if(v!==undefined&&v!==null&&v!=='')url.searchParams.set(k,String(v));const response=await call('GET',url.pathname+url.search);assert.equal(response.status,200);assert.equal(options.next.revalidate,60);assert.ok(options.next.tags.length>0);return response.body;}};
      const clientOverrides={'./client':bridge};
      for(const [file,fn]of [['services','getServices'],['faqs','getFAQs'],['specialists','getSpecialists'],['testimonials','getTestimonials'],['galleries','getGalleries'],['youtube-galleries','getYouTubeGalleries'],['blog-posts','getBlogPosts']]){
        const result=await loadTs('lib/api/'+file+'.ts',clientOverrides)[fn]();assert.ok(result.data.length>=1);
      }
      const settings=await loadTs('lib/api/settings.ts',clientOverrides).getSettings();assert.equal(typeof settings.data.faQsTabToggle,'boolean');
      const extra=await call('POST','/api/Services/add',bodyFor(resources.Services),managerToken);
      assert.equal(extra.status,200);
      const allServices=await loadTs('lib/api/services.ts',clientOverrides).getAllServices({pageSize:1});
      assert.equal(allServices.data.length,2);
      await call('DELETE','/api/Services/delete/'+extra.body.data.id,undefined,managerToken);
      const post=await loadTs('lib/api/blog-posts.ts',clientOverrides).getBlogPostBySlug(primary.BlogPosts.slug);assert.equal(post.data.id,primary.BlogPosts.id);
      const settingsSource=soleFunction(loadTs('dashboard/features/setting/services/setting-get-all-service.ts',overrides));assert.equal(typeof(await settingsSource()).data.phoneNumber,'string');
    });
    await context.test('every documented content operation has a real successful SQL-backed handler exercise', () => {
      assert.equal(passed.size,43);
      for(const pattern of patterns)assert.ok(passed.has(pattern.method+' '+pattern.path));
    });
  } finally {
    if(oldBase===undefined)delete process.env.NEXT_PUBLIC_API_BASE_URL;else process.env.NEXT_PUBLIC_API_BASE_URL=oldBase;
    await closePool();
  }
});
