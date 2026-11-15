import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { receiveMultipart } from '../../server/backend/modules/files/multipart.ts';
import { validateMedia } from '../../server/backend/modules/files/validation.ts';
import { MAX_FILE_BYTES } from '../../server/backend/modules/files/errors.ts';
import { LocalMediaStore, storageRoot } from '../../server/backend/modules/files/storage.ts';
import { FileService } from '../../server/backend/modules/files/service.ts';
import { createUploadHandler, createMediaHandler } from '../../server/backend/http/file-handler.ts';
import { pixel, pdfFixture, uploadRequest, exerciseImageUpload } from './file-fixtures.mjs';

test('exact Swagger upload route and public serving use Node runtime and preserve frontend envelope',async()=>{
  const swagger=JSON.parse(await fs.readFile('swagger.json','utf8'));
  assert.ok(swagger.paths['/api/FileUpload/upload'].post.requestBody.content['multipart/form-data'].schema.properties.file);
  for(const file of ['app/api/FileUpload/upload/route.ts','app/uploads/[key]/route.ts'])assert.match(await fs.readFile(file,'utf8'),/runtime = "nodejs"/);
  const handler=createUploadHandler(async()=>({upload:async()=>({fileId:42,filePath:'uploads/'+ 'a'.repeat(32)+'.png'})}));
  const response=await handler(uploadRequest());
  assert.deepEqual(await response.json(),{isSuccess:true,data:{fileId:42,filePath:'uploads/'+'a'.repeat(32)+'.png'},error:null,paging:null});
  assert.equal(response.headers.get('cache-control'),'no-store');
});
test('JPEG/PNG/WebP/GIF and conservative PDF signatures/containers validate; mismatches/truncation reject',async()=>{
  for(const[ext,mime]of[['jpg','image/jpeg'],['png','image/png'],['gif','image/gif'],['webp','image/webp']]){
    const bytes=pixel(ext);assert.equal((await validateMedia(bytes,mime)).extension,ext);
    await assert.rejects(validateMedia(bytes.subarray(0,bytes.length-2),mime));
    await assert.rejects(validateMedia(bytes,'application/pdf'));
  }
  assert.equal((await validateMedia(pdfFixture(),'application/pdf')).extension,'pdf');
  for(const bytes of [Buffer.from('%PDF-1.4\n%%EOF'),Buffer.from(pdfFixture().toString().replace('/Catalog','/JavaScript /Catalog'))])await assert.rejects(validateMedia(bytes,'application/pdf'));
  for(const mime of ['image/svg+xml','text/html','application/javascript','application/x-msdownload','application/octet-stream'])await assert.rejects(validateMedia(Buffer.from('<svg/>'),mime),error=>error.status===415);
  await assert.rejects(validateMedia(Buffer.alloc(0),'image/png'));
  await assert.rejects(validateMedia(Buffer.alloc(MAX_FILE_BYTES+1),'image/png'),error=>error.status===413);
});
test('one multipart file streams faithfully including one-byte boundaries and ignores unsafe original path',async()=>{
  const original=uploadRequest(pixel('png'),'image/png','aa.bb.cc',{filename:'../../unsafe.png'}),bytes=Buffer.from(await original.arrayBuffer());
  let i=0;const chunks=[];
  const request=new Request(original.url,{method:'POST',headers:original.headers,duplex:'half',body:new ReadableStream({pull(c){if(i===bytes.length)c.close();else c.enqueue(bytes.subarray(i,i+++1));}})});
  const part=await receiveMultipart(request,async chunk=>chunks.push(chunk));
  assert.equal(part.originalName,'unsafe.png');assert.deepEqual(Buffer.concat(chunks),pixel('png'));
});
test('multipart rejects wrong/missing/multiple/empty files, malformed framing, unsupported transport and oversized bodies',async()=>{
  for(const request of [uploadRequest(Buffer.alloc(0)),uploadRequest(undefined,undefined,undefined,{field:'other'}),uploadRequest(undefined,undefined,undefined,{multiple:true}),new Request('https://local',{method:'POST',headers:{'content-type':'multipart/form-data; boundary=x'},body:'--x\r\nmissing'}),new Request('https://local',{method:'POST',headers:{'content-type':'application/json'},body:'{}'})])await assert.rejects(receiveMultipart(request,async()=>{}));
  await assert.rejects(receiveMultipart(uploadRequest(Buffer.alloc(MAX_FILE_BYTES+1)),async()=>{}),error=>error.status===413);
  const early=new Request('https://local',{method:'POST',headers:{'content-type':'multipart/form-data; boundary=x','content-length':String(MAX_FILE_BYTES+9000)},body:'x'});
  await assert.rejects(receiveMultipart(early,async()=>{}),error=>error.status===413);
  const bytes=pdfFixture(MAX_FILE_BYTES);let count=0;
  assert.equal((await receiveMultipart(uploadRequest(bytes,'application/pdf'),async b=>{count+=b.length;})).byteLength,MAX_FILE_BYTES);
  assert.equal(count,MAX_FILE_BYTES);await validateMedia(bytes,'application/pdf');
});
test('upload failures use string error and message alias, reject unsigned requests and hide private diagnostics',async()=>{
  await assert.rejects(new FileService(undefined).upload(uploadRequest(),undefined),error=>error.status===401);
  let opened=0;const handler=createUploadHandler(async()=>{opened++;throw Error('password=private C:\\secret');});
  for(const request of [uploadRequest(undefined,undefined,''),new Request('https://local',{method:'POST',headers:{authorization:'Bearer unsigned'}})])assert.equal((await handler(request)).status,401);
  assert.equal(opened,0);
  const result=await handler(uploadRequest());assert.equal(result.status,503);
  const payload=await result.json();assert.equal(typeof payload.error,'string');assert.equal(payload.message,payload.error);assert.doesNotMatch(JSON.stringify(payload),/password|secret|private/);
});
test('storage paths fail closed inside deployment, drive roots, relative paths and missing configuration',()=>{
  for(const value of [undefined,'relative',process.cwd(),path.join(process.cwd(),'.next','uploads'),path.parse(process.cwd()).root,path.dirname(process.cwd())])assert.throws(()=>storageRoot({UPLOAD_DIR:value}));
});
test('persistent storage is exclusive, syncs bytes/hash, prevents symlinks and never overwrites a collision',async()=>{
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'lapis-media-unit-'));
  try{
    const store=new LocalMediaStore({UPLOAD_DIR:root});const stage=await store.begin();const bytes=pixel('png');
    await store.write(stage,bytes);assert.deepEqual(await store.seal(stage),bytes);
    const row={StorageKey:stage.token+'.png',PublicPath:'uploads/'+stage.token+'.png',ByteLength:bytes.length,Sha256:createHash('sha256').update(bytes).digest(),MimeType:'image/png'};
    await store.finalize(row);await assert.rejects(store.finalize(row),error=>error.status===409);
    const reopened=new LocalMediaStore({UPLOAD_DIR:root});await reopened.initialize();const fd=await reopened.openVerified(row);try{assert.deepEqual(await fd.readFile(),bytes);}finally{await fd.close();}
    await store.forgetCommittedStage(row);assert.deepEqual(await fs.readdir(path.join(root,'staging')),[]);
    await assert.rejects(new LocalMediaStore({UPLOAD_DIR:root},process.cwd(),()=>stage.token).begin(),error=>error.status===409);
    await assert.rejects(store.openVerified({...row,StorageKey:'../secret.png'}));
    await fs.writeFile(path.join(root,'objects',row.StorageKey),Buffer.alloc(bytes.length));await assert.rejects(store.openVerified(row));
    const alias=path.join(root,'junction');await fs.symlink(root,alias,'junction');await assert.rejects(new LocalMediaStore({UPLOAD_DIR:alias}).initialize());await fs.unlink(alias);
  }finally{await fs.rm(root,{recursive:true,force:true});}
});
test('filesystem failures and interrupted multipart do not produce upload success',async()=>{
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'lapis-media-failure-'));
  try{
    const file=path.join(root,'not-directory');await fs.writeFile(file,'private');await assert.rejects(new LocalMediaStore({UPLOAD_DIR:file}).begin());
    const request=new Request('https://local',{method:'POST',headers:{'content-type':'multipart/form-data; boundary=x'},duplex:'half',body:new ReadableStream({start(c){c.error(Error('interrupted'));}})});
    await assert.rejects(receiveMultipart(request,async()=>{}));
  }finally{await fs.rm(root,{recursive:true,force:true});}
});
test('public delivery verifies metadata/bytes and safely implements GET/HEAD/ranges/conditionals/404',async()=>{
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'lapis-media-serving-'));
  try{
    const store=new LocalMediaStore({UPLOAD_DIR:root}),stage=await store.begin(),bytes=pixel('png');await store.write(stage,bytes);await store.seal(stage);
    const row={StorageKey:stage.token+'.png',PublicPath:'uploads/'+stage.token+'.png',ByteLength:bytes.length,Sha256:stage.hash.digest(),MimeType:'image/png'};await store.finalize(row);
    const handler=createMediaHandler(async()=>({readyFile:async()=>row}),()=>store),request=(headers,method='GET')=>new Request('https://local/uploads/'+row.StorageKey,{headers,method});
    const full=await handler(request(),row.StorageKey);assert.equal(full.status,200);assert.equal(full.headers.get('content-type'),'image/png');assert.equal(full.headers.get('x-content-type-options'),'nosniff');assert.deepEqual(Buffer.from(await full.arrayBuffer()),bytes);
    assert.equal((await handler(request({'if-none-match':full.headers.get('etag')}),row.StorageKey)).status,304);
    assert.equal((await handler(request({'if-modified-since':full.headers.get('last-modified')}),row.StorageKey)).status,304);
    const head=await handler(request({},'HEAD'),row.StorageKey);assert.equal(head.status,200);assert.equal((await head.arrayBuffer()).byteLength,0);
    for(const[range,start,end]of[['bytes=0-3',0,4],['bytes=-4',bytes.length-4,bytes.length],['bytes=4-',4,bytes.length]]){
      const part=await handler(request({range}),row.StorageKey);assert.equal(part.status,206);assert.deepEqual(Buffer.from(await part.arrayBuffer()),bytes.subarray(start,end));
    }
    for(const range of ['bytes=999999-','bytes=4-2','bytes=0-1,3-4','bytes=-0'])assert.equal((await handler(request({range}),row.StorageKey)).status,416);
    const mismatch=await handler(request({range:'bytes=0-1','if-range':'"other"'}),row.StorageKey);assert.equal(mismatch.status,200);await mismatch.arrayBuffer();
    for(const key of ['../secret','%2e%2e','C:\\secret',row.StorageKey+'.html'])assert.equal((await handler(request(),key)).status,404);
    assert.equal((await createMediaHandler(async()=>({readyFile:async()=>undefined}),()=>store)(request(),row.StorageKey)).status,404);
    await fs.unlink(path.join(root,'objects',row.StorageKey));assert.equal((await handler(request(),row.StorageKey)).status,404);
  }finally{await fs.rm(root,{recursive:true,force:true});}
});
test('actual unchanged ImageUpload creates file FormData and consumes numeric fileId/filePath',async()=>{
  const old=process.env.NEXT_PUBLIC_API_BASE_URL;process.env.NEXT_PUBLIC_API_BASE_URL='https://same-origin.invalid';
  try{
    const key='uploads/'+'f'.repeat(32)+'.png';
    const ui=await exerciseImageUpload(async(route,form,options)=>{assert.equal(route,'FileUpload/upload');assert.ok(form.get('file') instanceof File);assert.equal(options.headers['Content-Type'],'multipart/form-data');return{data:{isSuccess:true,data:{fileId:45,filePath:key},error:null,paging:null}};});
    assert.deepEqual(ui.fields,[['fileId',45]]);assert.equal(ui.changes[0][0],45);assert.equal(ui.changes[0][1],key);assert.equal(ui.inputReset,'');assert.equal(ui.preview.props.src,'https://same-origin.invalid/'+key);
  }finally{if(old===undefined)delete process.env.NEXT_PUBLIC_API_BASE_URL;else process.env.NEXT_PUBLIC_API_BASE_URL=old;}
});
test('actual ImageUpload failure branch consumes string errors and clears field without false success',async()=>{
  const ui=await exerciseImageUpload(async()=>({data:{isSuccess:false,data:null,error:'Synthetic upload rejection',paging:null}}));
  assert.deepEqual(ui.fields,[['fileId',null]]);assert.deepEqual(ui.changes,[]);assert.ok(ui.state.includes('Synthetic upload rejection'));assert.equal(ui.inputReset,'');
});
