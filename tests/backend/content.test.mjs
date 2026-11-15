import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { resources, adsFields, settingFields } from '../../server/backend/modules/content/definitions.ts';
import { AdsUpdate, SettingUpdate } from '../../server/backend/modules/content/validation.ts';
import { parseContentFilters, parseContentId, stableSlug } from '../../server/backend/modules/content/query.ts';
import { contentDate, contentDto } from '../../server/backend/modules/content/mapper.ts';
import { createResourceHandler, createSingletonHandler } from '../../server/backend/http/content-handler.ts';
import { resourceSelect } from '../../server/backend/modules/content/repository.ts';
import { isContentAdministrator } from '../../server/backend/modules/content/service.ts';

const swagger = JSON.parse(fs.readFileSync('swagger.json', 'utf8'));
test('all 43 content method/path operations have Node.js Route Handlers independently of Phase 5 upload', () => {
  const operations = Object.entries(swagger.paths).filter(([path]) => !/^\/api\/(auth|User|FileUpload)\//.test(path));
  assert.equal(operations.length, 43);
  for (const [path, methods] of operations) {
    const route = 'app' + path.replace(/\{([^}]+)\}/g, '[$1]') + '/route.ts';
    const source = fs.readFileSync(route, 'utf8');
    for (const method of Object.keys(methods)) assert.match(source, new RegExp('export (?:async function |const )' + method.toUpperCase() + '\\b'));
    assert.match(source, /runtime = "nodejs"/);
    assert.match(source, /force-dynamic/);
  }
  assert.match(fs.readFileSync('app/api/FileUpload/upload/route.ts', 'utf8'), /export const POST/);
});
test('each module keeps Swagger keys, nullable fields, int32 and every numeric sort value', () => {
  for (const resource of Object.values(resources)) {
    for (const [mode, validator] of [['Create', resource.create], ['Update', resource.update]]) {
      const schema = swagger.components.schemas[resource.name + mode + 'Command'];
      assert.doesNotThrow(() => validator.parse({}));
      for (const [key, property] of Object.entries(schema.properties)) {
        if (property.nullable) assert.doesNotThrow(() => validator.parse({ [key]: null }));
        else assert.throws(() => validator.parse({ [key]: null }));
        if (property.type === 'integer') assert.throws(() => validator.parse({ [key]: 2147483648 }));
      }
      assert.throws(() => validator.parse({ unauthorizedProperty: true }));
    }
    assert.equal(resource.sortColumns.length, swagger.components.schemas[resource.name + 'SortFieldEnum'].enum.length);
    for (const value of swagger.components.schemas[resource.name + 'SortFieldEnum'].enum) {
      assert.equal(parseContentFilters(`https://local/api/${resource.name}/get-all?Sort.Field=${value}`, resource).sort, value);
    }
  }
});
test('compatibility tolerances are limited to create isActive, update id and testimonial starNumber', () => {
  for (const resource of Object.values(resources)) {
    assert.doesNotThrow(() => resource.create.parse({ isActive: true }));
    assert.throws(() => resource.create.parse({ id: 1 }));
    assert.doesNotThrow(() => resource.update.parse({ id: 1 }));
    assert.throws(() => resource.update.parse({ id: null }));
  }
  assert.doesNotThrow(() => resources.Testimonials.create.parse({ starNumber: 4 }));
  assert.throws(() => resources.Testimonials.create.parse({ starsNumber: 4 }));
  assert.doesNotThrow(() => resources.Testimonials.update.parse({ starsNumber: 4 }));
  assert.doesNotThrow(() => resources.Testimonials.update.parse({ starNumber: 4 }));
  assert.throws(() => SettingUpdate.parse({ id: 1 }));
  assert.throws(() => AdsUpdate.parse({ id: 1 }));
});
test('dotted query names and frontend case aliases work while legacy perPage/page remain ignored', () => {
  const filters = parseContentFilters('https://local/api/Services/get-all?pageNumber=2&pageSize=3&search=العربية&Sort.Field=7&Sort.Descending=true&isActive=false', resources.Services);
  assert.deepEqual(filters, { pageNumber: 2, pageSize: 3, search: 'العربية', sort: 7, descending: true, isActive: false, isFeatured: undefined, status: undefined });
  const autocomplete = parseContentFilters('https://local/api/OurSpecialists/get-all?perPage=3&page=2&search=text', resources.OurSpecialists);
  assert.equal(autocomplete.pageNumber, 1);
  assert.equal(autocomplete.pageSize, 10);
  for (const query of ['PageNumber=0', 'PageSize=101', 'Sort.Field=NameAr', 'Sort.Field=1%3BDROP', 'IsActive=invalid', 'PageSize=1&pageSize=2']) {
    assert.throws(() => parseContentFilters('https://local/api/Services/get-all?' + query, resources.Services));
  }
  assert.equal(parseContentId('-1'), -1);
  assert.throws(() => parseContentId('1.5'));
});
test('blog status/featured filters preserve numeric enum and stable slugs preserve Unicode', () => {
  const filters = parseContentFilters('https://local/api/BlogPosts/get-all?Status=2&IsFeatured=false', resources.BlogPosts);
  assert.equal(filters.status, 2);
  assert.equal(filters.isFeatured, false);
  assert.throws(() => parseContentFilters('https://local/api/BlogPosts/get-all?Status=3', resources.BlogPosts));
  assert.equal(stableSlug(' Hello World! ', 12), 'hello-world-12');
  assert.equal(stableSlug('العربية کوردی', 13), 'العربية-کوردی-13');
  assert.equal(stableSlug('', 14), 'post-14');
});
test('DTOs preserve date precision/offset convention and testimonial response alias without SQL internals', () => {
  assert.equal(contentDate('2026-01-02T03:04:05.1234567'), '2026-01-02T03:04:05.1234567');
  assert.equal(contentDate('2026-01-02T03:04:05.1234560'), '2026-01-02T03:04:05.123456');
  assert.equal(contentDate('2026-01-02T03:04:05.0000000'), '2026-01-02T03:04:05');
  assert.throws(() => contentDate('2026-01-02T03:04:05Z'));
  const dto = contentDto(resources.Testimonials, { Id: 1, TitleAr: null, Rating: 4, IsActive: true, CreatedAtWire: '2026-01-02T03:04:05.1234567', RowVersion: 'private' }, false);
  assert.equal(dto.starNumber, 4);
  assert.equal(dto.starsNumber, 4);
  assert.equal(dto.titleAr, '');
  assert.equal(dto.avatar, null);
  assert.ok(!Object.hasOwn(dto, 'RowVersion'));
  for (const resource of Object.values(resources)) assert.doesNotMatch(resourceSelect(resource).select, /SELECT\s+\*/i);
});
test('only canonical Manager/SuperAdmin can administer content; User admin policy is not changed', () => {
  assert.equal(isContentAdministrator({ RoleCode: 'manager', ContractValueKind: 'string', ContractValue: 'Manager' }), true);
  assert.equal(isContentAdministrator({ RoleCode: 'superadmin', ContractValueKind: 'string', ContractValue: 'SuperAdmin' }), true);
  assert.equal(isContentAdministrator({ RoleCode: 'user', ContractValueKind: 'string', ContractValue: 'User' }), false);
  assert.equal(isContentAdministrator({ RoleCode: 'manager', ContractValueKind: 'number', ContractValue: '2' }), false);
  assert.equal(settingFields.length, Object.keys(swagger.components.schemas.SettingUpdateCommand.properties).length);
  assert.equal(adsFields.length, Object.keys(swagger.components.schemas.AdsUpdateCommand.properties).length);
});
test('HTTP method/auth/body/validation failures stay structured and do not leak driver details', async () => {
  const factory = async () => { throw new Error('SQL password=DO_NOT_LEAK server=private'); };
  const anonymous = await createResourceHandler('Services', 'create', factory)(new Request('https://local/api/Services/add', { method: 'POST' }));
  assert.equal(anonymous.status, 401);
  const wrongMethod = await createResourceHandler('Services', 'list', factory)(new Request('https://local/api/Services/get-all', { method: 'POST' }));
  assert.equal(wrongMethod.status, 405);
  const invalid = await createResourceHandler('Services', 'list', factory)(new Request('https://local/api/Services/get-all?PageSize=invalid'));
  assert.equal(invalid.status, 400);
  const failure = await createResourceHandler('Services', 'list', factory)(new Request('https://local/api/Services/get-all'));
  assert.equal(failure.status, 503);
  assert.doesNotMatch(JSON.stringify(await failure.json()), /DO_NOT_LEAK|password|private/);
  const singleton = await createSingletonHandler('settings-get', factory)(new Request('https://local/api/Setting/get'));
  assert.equal(singleton.status, 401);
  const extra = await createResourceHandler('Services', 'create', factory)(new Request('https://local/api/Services/add', { method: 'POST', headers: { authorization: 'Bearer aa.bb.cc', 'content-type': 'application/json' }, body: '{"unauthorizedProperty":true}' }));
  assert.equal(extra.status, 400);
});
test('content JSON framing is bounded and rejects malformed/unsupported input before SQL', async () => {
  let opened = 0;
  const handler = createResourceHandler('Services', 'create', async () => { opened++; throw new Error('SQL must not be reached'); });
  for (const [body, type, status] of [['{', 'application/json', 400], ['{}', 'text/plain', 415], [JSON.stringify({ nameAr: 'x'.repeat(4 * 1024 * 1024) }), 'application/json', 413]]) {
    const response = await handler(new Request('https://local/api/Services/add', { method: 'POST', headers: { authorization: 'Bearer aa.bb.cc', 'content-type': type }, body }));
    assert.equal(response.status, status);
  }
  assert.equal(opened, 0);
});

test('DELETE accepts an empty transport stream and rejects actual request bytes before SQL', async () => {
  let removed = 0;
  const handler = createResourceHandler('Services', 'delete', async () => ({ async remove(_resource, id) { assert.equal(id, 1); removed++; return { data: null }; } }));
  const request = body => new Request('https://local/api/Services/delete/1', { method: 'DELETE', headers: { authorization: 'Bearer aa.bb.cc' }, body });
  assert.equal((await handler(request(''), '1')).status, 200);
  assert.equal((await handler(request('{}'), '1')).status, 400);
  assert.equal(removed, 1);
});
