import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { pathToFileURL } from 'node:url';
import { randomBytes, createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import sql from 'mssql';
import { assertDatabaseWriteAllowed } from '../../server/backend/config.ts';
import { getPool, closePool } from '../../server/backend/db/pool.ts';
import { query } from '../../server/backend/db/parameters.ts';
import { migrateDatabase } from '../../server/backend/db/migrate.ts';
import { bootstrapAdministrator } from '../../server/backend/auth/bootstrap.ts';
import { readAuthConfig } from '../../server/backend/auth/config.ts';
import { hashPassword } from '../../server/backend/auth/password.ts';
import { AuthenticationService } from '../../server/backend/modules/auth/service.ts';
import { UserService } from '../../server/backend/modules/users/service.ts';
import { authTransaction, ensureRole, insertUser, text, integer, userKey } from '../../server/backend/modules/auth/repository.ts';
import { FileService } from '../../server/backend/modules/files/service.ts';
import { FileError, MAX_FILE_BYTES } from '../../server/backend/modules/files/errors.ts';
import { LocalMediaStore } from '../../server/backend/modules/files/storage.ts';
import { createUploadHandler } from '../../server/backend/http/file-handler.ts';
import { pixel, pdfFixture, uploadRequest, exerciseImageUpload } from './file-fixtures.mjs';
import { loadTs } from '../load-ts.mjs';

test('Phase 5 real SQL, private filesystem, upload/content/frontend contracts and recovery',{skip:process.env.SQL_ALLOW_TESTS==='true'?false:'Explicit disposable SQL credentials are not configured',timeout:180000},async context=>{
  assertDatabaseWriteAllowed('test');
  const pool=await getPool(),root=await fs.mkdtemp(path.join(os.tmpdir(),'lapis-media-sql-'));
  const oldRoot=process.env.UPLOAD_DIR,oldBase=process.env.NEXT_PUBLIC_API_BASE_URL;process.env.UPLOAD_DIR=root;process.env.NEXT_PUBLIC_API_BASE_URL='https://same-origin.invalid';
  const store=()=>new LocalMediaStore({UPLOAD_DIR:root}),service=new FileService(pool,store),auth=new AuthenticationService(pool,readAuthConfig(),()=>{throw Error('No real mail in file tests');});
  const upload=(await import('../../app/api/FileUpload/upload/route.ts')).POST;
  const media=async(key,headers={},method='GET')=>{const routes=await import('../../app/uploads/[key]/route.ts');return routes[method](new Request('https://same-origin.invalid/uploads/'+key,{method,headers}),{params:Promise.resolve({key})});};
  let adminToken,managerToken,memberToken,manager;const uploaded={};
  const count=async()=>Number((await query(pool,'SELECT COUNT(*) AS total FROM dbo.Files;')).recordset[0].total);
  const rowById=async id=>(await query(pool,'SELECT *,CONVERT(VARCHAR(20),CreatedByUserKey) AS ActorKey FROM dbo.Files WHERE Id=@id;',[integer('id',id)])).recordset[0];
  const send=async(bytes=pixel('png'),mime='image/png',token=managerToken,options={})=>{const response=await upload(uploadRequest(bytes,mime,token,options));return{status:response.status,body:await response.json()};};
  const uploadOk=async(bytes=pixel('png'),mime='image/png',options={})=>{const r=await send(bytes,mime,managerToken,options);assert.equal(r.status,200);assert.deepEqual(Object.keys(r.body).sort(),['data','error','isSuccess','paging']);assert.equal(r.body.isSuccess,true);return r.body.data;};
  const contentCall=async(name,action,method,body,id)=>{
    const route='app/api/'+name+'/'+action+(id===undefined?'':'/[id]')+'/route.ts';
    const handler=(await import(pathToFileURL(path.resolve(route)).href))[method];
    const response=await handler(new Request('https://local/api/'+name+'/'+action+(id===undefined?'':'/'+id),{method,headers:{authorization:'Bearer '+managerToken,'content-type':'application/json'},...(body===undefined?{}:{body:JSON.stringify(body)})}),{params:Promise.resolve({id:String(id)})});
    return{status:response.status,body:await response.json()};
  };
  try{
    assert.equal((await query(pool,'SELECT COUNT(*) AS n FROM sys.tables WHERE is_ms_shipped=0;')).recordset[0].n,0,'Must use a newly provisioned empty SQL database');
    assert.deepEqual(await migrateDatabase(pool),{applied:7,total:7});
    const credentials={email:'files-admin@example.invalid',password:randomBytes(18).toString('base64url')};
    await bootstrapAdministrator(pool,credentials,{...process.env,AUTH_BOOTSTRAP_ALLOW:'true',AUTH_BOOTSTRAP_CONFIRM:'CREATE_FIRST_SUPERADMIN'});
    adminToken=(await auth.login(credentials)).data.token;
    const managerCredentials={email:'files-manager@example.invalid',password:randomBytes(18).toString('base64url')},memberCredentials={email:'files-member@example.invalid',password:randomBytes(18).toString('base64url')};
    await authTransaction(pool,async tx=>{
      const role=(await query(tx,"INSERT INTO dbo.Roles(Code,ContractValue,ContractValueKind) OUTPUT INSERTED.RoleId VALUES(N'manager',N'Manager',N'string');")).recordset[0].RoleId;
      manager=await insertUser(tx,{...managerCredentials,passwordHash:await hashPassword(managerCredentials.password),firstName:'Synthetic',lastName:'Manager',phoneNumber:null,country:null},role,true);
      await insertUser(tx,{...memberCredentials,passwordHash:await hashPassword(memberCredentials.password),firstName:'Synthetic',lastName:'Member',phoneNumber:null,country:null},await ensureRole(tx,'user','User'),true);
    });
    managerToken=(await auth.login(managerCredentials)).data.token;memberToken=(await auth.login(memberCredentials)).data.token;
    await context.test('anonymous/User/tampered tokens cannot upload or initialize disk; Manager and SuperAdmin may upload',async()=>{
      assert.equal((await send(undefined,undefined,'')).status,401);
      assert.equal((await send(undefined,undefined,memberToken)).status,403);
      const parts=managerToken.split('.');parts[2]=(parts[2][0]==='A'?'B':'A')+parts[2].slice(1);assert.equal((await send(undefined,undefined,parts.join('.'))).status,401);
      assert.deepEqual(await fs.readdir(root),[]);assert.equal(await count(),0);
      assert.equal((await send(undefined,undefined,adminToken)).status,200);
      const users=new UserService(auth);await users.toggleDisable(adminToken,managerCredentials.email);
      assert.equal((await send(undefined,undefined,managerToken)).status,401);
      await users.toggleDisable(adminToken,managerCredentials.email);managerToken=(await auth.login(managerCredentials)).data.token;
    });
    await context.test('five actual formats persist accurate metadata/hash/owner and browser retrieval bytes with safe headers',async()=>{
      for(const[extension,mime]of[['png','image/png'],['jpg','image/jpeg'],['webp','image/webp'],['gif','image/gif'],['pdf','application/pdf']]){
        const bytes=extension==='pdf'?pdfFixture():pixel(extension),dto=await uploadOk(bytes,mime,{filename:'../../untrusted.'+extension});uploaded[extension]=dto;
        const row=await rowById(dto.fileId);assert.equal(row.StorageState,'ready');assert.equal(row.ActorKey,manager.UserKey);assert.equal(Number(row.ByteLength),bytes.length);assert.equal(row.MimeType,mime);assert.ok(row.Sha256.equals(createHash('sha256').update(bytes).digest()));assert.equal(row.OriginalName,'untrusted.'+extension);assert.equal(row.PublicPath,dto.filePath);assert.match(row.StorageKey,new RegExp('^[a-f0-9]{32}\\.'+extension+'$'));
        const response=await media(row.StorageKey);assert.equal(response.status,200);assert.equal(response.headers.get('content-type'),mime);assert.equal(response.headers.get('x-content-type-options'),'nosniff');assert.match(response.headers.get('content-security-policy'),/sandbox/);assert.deepEqual(Buffer.from(await response.arrayBuffer()),bytes);
        assert.equal(loadTs('dashboard/api/urls.ts').getAssetUrl(dto.filePath),'https://same-origin.invalid/'+dto.filePath);
        assert.equal(loadTs('lib/api/client.ts').createAssetUrl(dto.filePath),'/'+dto.filePath);
      }
    });
    await context.test('actual ImageUpload component posts FormData to actual route and consumes PNG/PDF results unchanged',async()=>{
      for(const mime of ['image/png','application/pdf']){
        let saved;
        const ui=await exerciseImageUpload(async(route,form)=>{assert.equal(route,'FileUpload/upload');const response=await upload(new Request('https://local/api/'+route,{method:'POST',headers:{authorization:'Bearer '+managerToken},body:form}));const body=await response.json();assert.equal(response.status,200);saved=body.data;return{data:body};},mime==='application/pdf'?pdfFixture():pixel('png'),mime);
        assert.deepEqual(ui.fields,[['fileId',saved.fileId]]);assert.equal(ui.changes[0][1],saved.filePath);assert.equal(ui.inputReset,'');
        if(mime==='application/pdf')assert.equal(ui.pdfPreview.props.src,'https://same-origin.invalid/'+saved.filePath);else assert.equal(ui.preview.props.src,'https://same-origin.invalid/'+saved.filePath);
      }
    });
    await context.test('exact 4 MiB allowed; empty/oversize/multiple/mismatch/unsupported/malformed fail before ready metadata',async()=>{
      const dto=await uploadOk(pdfFixture(MAX_FILE_BYTES),'application/pdf');assert.equal(Number((await rowById(dto.fileId)).ByteLength),MAX_FILE_BYTES);
      const before=await count();
      for(const[bytes,mime,options,status]of[[Buffer.alloc(0),'image/png',{},400],[Buffer.alloc(MAX_FILE_BYTES+1),'image/png',{},413],[pixel('png'),'image/png',{multiple:true},400],[pixel('png'),'image/png',{field:'other'},400],[pixel('png'),'image/jpeg',{},400],[Buffer.from('<svg/>'),'image/svg+xml',{},415]]){const r=await send(bytes,mime,managerToken,options);assert.equal(r.status,status);assert.equal(typeof r.body.error,'string');assert.equal(r.body.error,r.body.message);}
      const malformed=await upload(new Request('https://local/api/FileUpload/upload',{method:'POST',headers:{authorization:'Bearer '+managerToken,'content-type':'multipart/form-data; boundary=x'},body:'--x\r\nbroken'}));assert.equal(malformed.status,400);
      const interrupted=await upload(new Request('https://local/api/FileUpload/upload',{method:'POST',headers:{authorization:'Bearer '+managerToken,'content-type':'multipart/form-data; boundary=x'},duplex:'half',body:new ReadableStream({start(controller){controller.error(Error('Interrupted client write'));}})}));assert.equal(interrupted.status,400);
      const unavailable=path.join(root,'not-a-directory');await fs.writeFile(unavailable,'synthetic');
      assert.equal((await createUploadHandler(async()=>new FileService(pool,()=>new LocalMediaStore({UPLOAD_DIR:unavailable})))(uploadRequest(undefined,undefined,managerToken))).status,503);
      assert.equal(await count(),before);assert.deepEqual(await fs.readdir(path.join(root,'staging')),[]);
    });
    await context.test('real uploaded IDs work for all Phase 4 file consumers and independent gallery before/after without deletion cascades',async()=>{
      const png=uploaded.png,jpg=uploaded.jpg;
      const specialist=await contentCall('OurSpecialists','add','POST',{fileId:png.fileId,isActive:true,nameAr:'طبيب'});assert.equal(specialist.status,200);assert.equal(specialist.body.data.image.filePath,png.filePath);
      for(const[name,body,image]of[['Services',{fileId:png.fileId},'avatar'],['BlogPosts',{fileId:png.fileId,ourSpecialistId:specialist.body.data.id,status:0},'image'],['Testimonials',{fileId:png.fileId,starNumber:4},'avatar'],['Ads',{fileId:png.fileId,isActive:true},'file']]){
        const r=await contentCall(name,name==='Ads'?'edit':'add',name==='Ads'?'PUT':'POST',{...body,isActive:true});assert.equal(r.status,200);assert.deepEqual(r.body.data[image],{id:png.fileId,filePath:png.filePath});
        if(name==='Services'){assert.equal((await contentCall(name,'delete','DELETE',undefined,r.body.data.id)).status,200);const still=await media(png.filePath.slice(8));assert.equal(still.status,200);await still.arrayBuffer();}
      }
      const gallery=await contentCall('Galleries','add','POST',{beforeFileId:png.fileId,afterFileId:jpg.fileId,isActive:true});assert.equal(gallery.status,200);assert.deepEqual(gallery.body.data.beforeImage,{id:png.fileId,filePath:png.filePath});assert.deepEqual(gallery.body.data.afterImage,{id:jpg.fileId,filePath:jpg.filePath});
    });
    await context.test('Phase 3 profile ownership stays enforced for newly uploaded Manager media; User cannot borrow it',async()=>{
      const users=new UserService(auth);const own=await users.editProfile(managerToken,{fileId:uploaded.png.fileId});assert.equal(own.data.image.filePath,uploaded.png.filePath);
      await assert.rejects(users.editProfile(adminToken,{fileId:uploaded.png.fileId}),error=>error.code==='USER_INVALID_FILE');
      await assert.rejects(users.editProfile(memberToken,{fileId:uploaded.png.fileId}),error=>error.code==='USER_INVALID_FILE');
      await assert.rejects(users.getAll(managerToken,{pageNumber:1,pageSize:10,sort:0,descending:false}),error=>error.status===403);
    });
    await context.test('concurrent uploads have unique exclusive keys and real persisted bytes without overwriting each other',async()=>{
      const results=await Promise.all(Array.from({length:5},()=>uploadOk()));assert.equal(new Set(results.map(r=>r.fileId)).size,5);assert.equal(new Set(results.map(r=>r.filePath)).size,5);
      for(const dto of results){const response=await media(dto.filePath.slice(8));assert.equal(response.status,200);assert.deepEqual(Buffer.from(await response.arrayBuffer()),pixel('png'));}
    });
    await context.test('SQL key collision and physical destination collision never replace existing media',async()=>{
      const token=randomBytes(16).toString('hex'),key=token+'.png';
      await query(pool,"INSERT INTO dbo.Files(StorageKey,PublicPath,MimeType,ByteLength,Sha256,CreatedByUserKey,StorageState) VALUES(@key,@path,N'image/png',1,@hash,@userKey,N'failed');",[text('key',key),text('path','uploads/'+key),{name:'hash',type:sql.VarBinary(32),value:Buffer.alloc(32)},userKey(manager.UserKey)]);
      const handler=createUploadHandler(async()=>new FileService(pool,()=>new LocalMediaStore({UPLOAD_DIR:root},process.cwd(),()=>token)));
      const response=await handler(uploadRequest(undefined,undefined,managerToken));assert.equal(response.status,409);assert.equal((await query(pool,'SELECT COUNT(*) AS n FROM dbo.Files WHERE StorageKey=@key;',[text('key',key)])).recordset[0].n,1);
      const existing=await rowById(uploaded.png.fileId);await assert.rejects(new LocalMediaStore({UPLOAD_DIR:root},process.cwd(),()=>existing.StorageKey.slice(0,32)).begin(),error=>error.status===409);
    });
    await context.test('filesystem finalization failure leaves pending, not ready; read-only audit then explicit recovery restores staged bytes',async()=>{
      class BrokenStore extends LocalMediaStore{async finalize(){throw new FileError(503,'FILE_STORAGE_UNAVAILABLE','Storage unavailable.');}}
      const handler=createUploadHandler(async()=>new FileService(pool,()=>new BrokenStore({UPLOAD_DIR:root})));
      const response=await handler(uploadRequest(undefined,undefined,managerToken,{filename:'pending-stage.png'}));assert.equal(response.status,503);
      const row=(await query(pool,"SELECT * FROM dbo.Files WHERE OriginalName=N'pending-stage.png';")).recordset[0];assert.equal(row.StorageState,'pending');assert.equal((await media(row.StorageKey)).status,404);
      assert.ok((await service.recover()).results.some(r=>r.fileId===row.Id&&r.action==='recent-pending-skipped'));
      await query(pool,'UPDATE dbo.Files SET CreatedAtUtc=DATEADD(HOUR,-2,SYSUTCDATETIME()) WHERE Id=@id;',[integer('id',row.Id)]);
      assert.ok((await service.recover()).results.some(r=>r.fileId===row.Id&&r.action==='pending-recoverable'));assert.equal((await rowById(row.Id)).StorageState,'pending');
      assert.ok((await service.recover({repair:true})).results.some(r=>r.fileId===row.Id&&r.action==='promoted-ready'));
      const restored=await media(row.StorageKey);assert.equal(restored.status,200);assert.deepEqual(Buffer.from(await restored.arrayBuffer()),pixel('png'));
    });
    await context.test('real SQL registration/ready-commit failures retain recoverable bytes and never acknowledge success',async()=>{
      await query(pool,"CREATE TRIGGER dbo.Phase5RejectInsert ON dbo.Files AFTER INSERT AS THROW 51000,'Synthetic file failure',1;");
      try{assert.equal((await send(undefined,undefined,managerToken,{filename:'fail-insert.png'})).status,503);}finally{await query(pool,'DROP TRIGGER dbo.Phase5RejectInsert;');}
      await query(pool,"CREATE TRIGGER dbo.Phase5RejectReady ON dbo.Files AFTER UPDATE AS BEGIN SET NOCOUNT ON; IF EXISTS(SELECT 1 FROM inserted WHERE OriginalName=N'fail-ready.png' AND StorageState=N'ready') THROW 51000,'Synthetic file failure',1; END;");
      try{assert.equal((await send(undefined,undefined,managerToken,{filename:'fail-ready.png'})).status,503);}finally{await query(pool,'DROP TRIGGER dbo.Phase5RejectReady;');}
      assert.equal((await query(pool,"SELECT COUNT(*) AS n FROM dbo.Files WHERE OriginalName=N'fail-insert.png';")).recordset[0].n,0);
      assert.ok((await service.recover()).staging.unregisteredRetained>=1);
      const row=(await query(pool,"SELECT * FROM dbo.Files WHERE OriginalName=N'fail-ready.png';")).recordset[0];assert.equal(row.StorageState,'pending');assert.equal((await media(row.StorageKey)).status,404);
      await query(pool,'UPDATE dbo.Files SET CreatedAtUtc=DATEADD(HOUR,-2,SYSUTCDATETIME()) WHERE Id=@id;',[integer('id',row.Id)]);
      assert.ok((await service.recover({repair:true})).results.some(r=>r.fileId===row.Id&&r.action==='promoted-ready'));
      const response=await media(row.StorageKey);assert.equal(response.status,200);await response.arrayBuffer();
    });
    await context.test('missing/corrupt ready media return 404; repair withdraws state while retaining content references and bytes',async()=>{
      const dto=await uploadOk(),row=await rowById(dto.fileId);
      await fs.writeFile(path.join(root,'objects',row.StorageKey),Buffer.alloc(Number(row.ByteLength)));
      assert.equal((await media(row.StorageKey)).status,404);
      assert.ok((await service.recover({repair:true})).results.some(r=>r.fileId===row.Id&&r.action==='withdrawn-failed-retained'));assert.equal((await rowById(dto.fileId)).StorageState,'failed');
      const valid=await uploadOk(),other=await rowById(valid.fileId);await fs.unlink(path.join(root,'objects',other.StorageKey));assert.equal((await media(other.StorageKey)).status,404);
    });
    await context.test('fresh Node process serves the same SQL-backed bytes after restart; recovery CLI is private and non-destructive',async()=>{
      const key=uploaded.png.filePath.slice(8),moduleUrl=pathToFileURL(path.resolve('server/backend/http/file-handler.ts')).href;
      const script=`const {createMediaHandler}=await import(${JSON.stringify(moduleUrl)});const r=await createMediaHandler()(new Request('https://local/uploads/'+process.env.FILE_TEST_KEY),process.env.FILE_TEST_KEY);if(r.status!==200)process.exitCode=1;else console.log(JSON.stringify({status:r.status,bytes:(await r.arrayBuffer()).byteLength}));const{closePool}=await import(${JSON.stringify(pathToFileURL(path.resolve('server/backend/db/pool.ts')).href)});await closePool();`;
      const child=spawnSync(process.execPath,['--conditions=react-server','--import','tsx','--input-type=module','-e',script],{cwd:process.cwd(),env:{...process.env,FILE_TEST_KEY:key},encoding:'utf8',windowsHide:true,timeout:30000});assert.equal(child.status,0);assert.equal(JSON.parse(child.stdout).bytes,pixel('png').length);
      const cli=spawnSync(process.execPath,['--conditions=react-server','--import','tsx','scripts/db/recover-storage.mjs'],{env:{...process.env,STORAGE_RECOVERY_REPAIR:'false'},encoding:'utf8',windowsHide:true,timeout:30000});assert.equal(cli.status,0);assert.equal(JSON.parse(cli.stdout).operation,'storage-audit');assert.doesNotMatch(cli.stdout,/StorageKey|OriginalName|password|token|UPLOAD_DIR/);
      const blocked=spawnSync(process.execPath,['--conditions=react-server','--import','tsx','scripts/db/recover-storage.mjs'],{env:{...process.env,SQL_ENV:'production'},encoding:'utf8',windowsHide:true,timeout:30000});assert.equal(blocked.status,1);assert.match(blocked.stderr,/STORAGE_RECOVERY_FAILED/);
    });
  }finally{
    await closePool();if(oldRoot===undefined)delete process.env.UPLOAD_DIR;else process.env.UPLOAD_DIR=oldRoot;if(oldBase===undefined)delete process.env.NEXT_PUBLIC_API_BASE_URL;else process.env.NEXT_PUBLIC_API_BASE_URL=oldBase;
    assert.ok(root.startsWith(path.join(os.tmpdir(),'lapis-media-sql-')));await fs.rm(root,{recursive:true,force:true});
  }
});
