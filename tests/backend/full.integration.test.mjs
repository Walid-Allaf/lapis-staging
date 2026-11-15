import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawn, spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { assertDatabaseWriteAllowed } from '../../server/backend/config.ts';
import { getPool, closePool } from '../../server/backend/db/pool.ts';
import { query } from '../../server/backend/db/parameters.ts';
import { migrateDatabase } from '../../server/backend/db/migrate.ts';
import { bootstrapAdministrator } from '../../server/backend/auth/bootstrap.ts';
import { readAuthConfig } from '../../server/backend/auth/config.ts';
import { signIdentity } from '../../server/backend/auth/jwt.ts';
import { hashPassword } from '../../server/backend/auth/password.ts';
import { authTransaction, ensureRole, insertUser, text } from '../../server/backend/modules/auth/repository.ts';
import { resources } from '../../server/backend/modules/content/definitions.ts';
import { loadTs } from '../load-ts.mjs';
import { pixel, pdfFixture, exerciseImageUpload } from './file-fixtures.mjs';

test('Phase6 production Next HTTP cutover with blocked legacy, real SQL/storage and unchanged frontend functions',{skip:process.env.SQL_ALLOW_TESTS==='true'?false:'Explicit disposable SQL credentials are not configured',timeout:240000},async context=>{
  assertDatabaseWriteAllowed('test');
  const step=async(name,work)=>{let passed=false;await context.test(name,async()=>{await work();passed=true;});if(!passed)throw Error('Integration prerequisite failed: '+name);};
  const pool=await getPool(),root=await fs.mkdtemp(path.join(os.tmpdir(),'lapis-phase6-http-')),log=path.join(root,'network.log'),storage=path.join(root,'media');
  const base='http://127.0.0.1:3197',preload=pathToFileURL(path.resolve('tests/backend/block-legacy.mjs')).href;
  let child,output='',cookie='',token='',uploaded,settings,requestCount=0;
  const records={},markers={};
  const feature={Services:'services',FAQs:'faqs',OurSpecialists:'our-specialists',Testimonials:'testimonials',Galleries:'gallery',YouTubeGalleries:'youtube-galleries',BlogPosts:'blog-posts'};
  const admin={email:'phase6-admin@example.invalid',password:randomBytes(18).toString('base64url')},member={email:'phase6-user@example.invalid',password:randomBytes(18).toString('base64url')};
  const manager={email:'phase6-manager@example.invalid',password:randomBytes(18).toString('base64url')};
  const start=async(env={})=>{
    let ready=false;output='';child=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3197'],{cwd:process.cwd(),env:{...process.env,APP_ORIGIN:base,NEXT_PUBLIC_API_BASE_URL:'http://127.0.0.1:9',UPLOAD_DIR:storage,NODE_OPTIONS:'--import='+preload,LAPIS_TEST_NETWORK_LOG:log,...env},windowsHide:true,stdio:['ignore','pipe','pipe']});
    child.stdout.on('data',data=>{output+=data.toString();if(data.toString().includes('Ready'))ready=true;});child.stderr.on('data',data=>{output+=data.toString();});
    for(let i=0;i<200&&!ready;i++)await new Promise(resolve=>setTimeout(resolve,100));assert.ok(ready,'Next production server must start');
  };
  const stop=async()=>{if(!child)return;const done=new Promise(resolve=>child.once('exit',resolve));child.kill();await done;child=undefined;};
  const call=async(route,{method='GET',body,auth=true,bearer,csrf=true,headers={}}={})=>{
    requestCount++;const multipart=body instanceof FormData;
    const response=await fetch(base+route,{method,redirect:'manual',headers:{...(auth&&cookie?{cookie}:{}),...(!['GET','HEAD'].includes(method)&&csrf?{origin:base}:{}),...(body!==undefined&&!multipart?{'content-type':'application/json'}:{}),...(bearer?{authorization:'Bearer '+bearer}:{}),...headers},...(body===undefined?{}:{body:multipart?body:JSON.stringify(body)})});
    const type=response.headers.get('content-type')??'',payload=type.includes('json')?await response.json():await response.text();return{response,payload,status:response.status};
  };
  const login=async(credentials=admin)=>{
    const result=await call('/dashboard/api/session/login',{method:'POST',body:credentials,auth:false});if(result.status!==200)console.error(JSON.stringify({operation:'dashboard-login',status:result.status,message:result.payload.message}));assert.equal(result.status,200);
    assert.deepEqual(Object.keys(result.payload).sort(),['expiresOn','user']);assert.equal('token'in result.payload,false);
    const set=result.response.headers.get('set-cookie');assert.ok(set&&set.includes('HttpOnly')&&set.includes('Path=/dashboard')&&set.includes('SameSite=strict'));
    cookie=set.split(';')[0];token=decodeURIComponent(cookie.slice(cookie.indexOf('=')+1));return result.payload;
  };
  const axios={};for(const[operation,method]of[['get','GET'],['post','POST'],['put','PUT'],['delete','DELETE']])axios[operation]=async(route,bodyOrOptions,options={})=>{
    const url=new URL(base+'/dashboard/api/proxy/'+route);
    if(method==='GET')for(const[k,v]of Object.entries(bodyOrOptions?.params??{}))if(v!==undefined&&v!==null&&v!=='')url.searchParams.set(k,String(v));
    const result=await call(url.pathname+url.search,{method,body:['POST','PUT'].includes(method)?bodyOrOptions:undefined,headers:options.headers&&!(bodyOrOptions instanceof FormData)?options.headers:{}});
    assert.equal(result.status,200,method+' '+route);assert.equal(result.response.headers.get('cache-control'),'no-store');return{data:result.payload};
  };
  const overrides={'@/dashboard/api/axios':{__esModule:true,default:axios,axios},'@/dashboard/utils':loadTs('dashboard/utils/index.ts')};
  const sole=exports=>{const values=Object.values(exports).filter(v=>typeof v==='function');assert.equal(values.length,1);return values[0];};
  const fn=(name,kind)=>sole(loadTs(`dashboard/features/${feature[name]}/services/${feature[name]}-${kind}-service.ts`,overrides));
  const html=async route=>{const result=await call(route,{auth:false,headers:{cookie:'lapis.language=en'}});assert.equal(result.status,200,route);assert.ok(typeof result.payload==='string');return result.payload;};
  try{
    assert.equal((await query(pool,'SELECT COUNT(*) AS n FROM sys.tables WHERE is_ms_shipped=0;')).recordset[0].n,0,'Must use a new empty disposable SQL database');await migrateDatabase(pool);
    await bootstrapAdministrator(pool,admin,{...process.env,AUTH_BOOTSTRAP_ALLOW:'true',AUTH_BOOTSTRAP_CONFIRM:'CREATE_FIRST_SUPERADMIN'});
    await authTransaction(pool,async tx=>insertUser(tx,{...member,passwordHash:await hashPassword(member.password),firstName:'Synthetic',lastName:'User',phoneNumber:null,country:null},await ensureRole(tx,'user','User'),true));
    await authTransaction(pool,async tx=>{const role=(await query(tx,"INSERT INTO dbo.Roles(Code,ContractValue,ContractValueKind) OUTPUT INSERTED.RoleId VALUES(N'manager',N'Manager',N'string');")).recordset[0].RoleId;await insertUser(tx,{...manager,passwordHash:await hashPassword(manager.password),firstName:'Synthetic',lastName:'Manager',phoneNumber:null,country:null},role,true);});
    await step('legacy network blocker is effective; uninitialized public site fails503 instead of empty fallback',async()=>{
      const check=spawnSync(process.execPath,['--import',preload,'--input-type=module','-e',"try{await fetch('https://lapis.runasp.net/api/Services/get-all')}catch{}"],{env:{...process.env,LAPIS_TEST_NETWORK_LOG:log},encoding:'utf8',windowsHide:true});assert.equal(check.status,0);assert.ok((await fs.readFile(log,'utf8')).includes('blocked_legacy_request'));await fs.writeFile(log,'');
      await start();assert.equal((await call('/',{auth:false})).status,503);assert.equal((await call('/sitemap.xml',{auth:false})).status,503);
    });
    await step('real dashboard login/session/current user preserve cookie/projection and deny ordinary User/CSRF',async()=>{
      assert.equal((await call('/dashboard/api/session/login',{method:'POST',body:admin,auth:false,csrf:false})).status,403);
      const denied=await call('/dashboard/api/session/login',{method:'POST',body:member,auth:false});assert.equal(denied.status,403);
      const session=await login();assert.equal(session.user.role,'SuperAdmin');assert.equal((await call('/dashboard/api/session')).payload.user.id,session.user.id);
      assert.equal((await call('/api/User/get-info',{auth:true})).status,401);
      assert.equal((await call('/api/User/get-info',{auth:false,bearer:token})).status,200);
      assert.equal((await call('/dashboard/api/proxy/User/get-info')).status,403);
      assert.equal((await login(manager)).user.role,'Manager');assert.equal((await call('/api/User/get-all',{auth:false,bearer:token})).status,403);await login();
    });
    await step('unchanged settings service persists all visibility toggles; public shell contains actual database data',async()=>{
      settings={phoneNumber:'phase6-phone',email:'contact@example.invalid',address:'Phase6Address',aboutUs_Ar:'عن المرحلة السادسة',aboutUs_En:'Phase6About',contactUs_Ar:'اتصل بنا',contactUs_En:'Phase6Contact',faQsTabToggle:true,servicesTabToggle:true,galleriesTabToggle:true,youTubeGalleriesTabToggle:true,testimonialsTabToggle:true,ourSpecialistsTabToggle:true};
      const update=sole(loadTs('dashboard/features/setting/services/setting-update-service.ts',overrides));assert.equal((await update(settings)).isSuccess,true);
      const get=sole(loadTs('dashboard/features/setting/services/setting-get-all-service.ts',overrides));assert.equal((await get()).data.address,settings.address);
      const shell=await html('/contact');assert.ok(shell.includes('Phase6Address'));
    });
    await step('actual ImageUpload posts streaming multipart through real proxy; PNG/PDF previews and serving work',async()=>{
      for(const[mime,bytes]of[['image/png',pixel('png')],['application/pdf',pdfFixture()]]){
        let data;const ui=await exerciseImageUpload(async(route,body)=>{const result=await axios.post(route,body);data=result.data.data;return result;},bytes,mime);
        assert.equal(ui.fields[0][1],data.fileId);assert.equal(ui.changes[0][1],data.filePath);
        const response=await fetch(base+'/'+data.filePath);assert.equal(response.status,200);assert.equal(response.headers.get('content-type'),mime);assert.deepEqual(Buffer.from(await response.arrayBuffer()),bytes);
        if(mime==='image/png')uploaded=data;else assert.ok(ui.pdfPreview);
      }
      const exact=new FormData();exact.append('file',new File([pdfFixture(4*1024*1024)],'exact.pdf',{type:'application/pdf'}));assert.equal((await call('/dashboard/api/proxy/FileUpload/upload',{method:'POST',body:exact})).status,200);
      const large=new FormData();large.append('file',new File([Buffer.alloc(4*1024*1024+1)],'large.png',{type:'image/png'}));assert.equal((await call('/dashboard/api/proxy/FileUpload/upload',{method:'POST',body:large})).status,413);
      assert.equal((await call('/dashboard/api/proxy/Services/add',{method:'POST',body:{nameEn:'x'.repeat(4*1024*1024)}})).status,413);
    });
    for(const name of ['Services','FAQs','OurSpecialists','Testimonials','Galleries','YouTubeGalleries','BlogPosts'])await step(name+' full CRUD using actual frozen frontend service functions and real proxy',async()=>{
      markers[name]='Phase6'+name+randomBytes(3).toString('hex');
      const body=Object.fromEntries(resources[name].fields.map(field=>[field.property,field.property==='isActive'?true:field.reference==='file'?uploaded.fileId:field.reference==='specialist'?records.OurSpecialists.id:field.kind==='string'?field.property==='videoUrl'?'https://www.youtube.com/watch?v=abcdefghijk':markers[name]:field.kind==='boolean'?false:field.property==='status'?0:2]));
      const created=await fn(name,'create')(body);assert.equal(created.isSuccess,true);const id=created.data.id;records[name]=created.data;
      assert.equal((await fn(name,'get-by-id')(id)).id,id);const list=await fn(name,'get-all')({pageNumber:1,pageSize:1,search:markers[name]});assert.equal(list.paging.totalRecords,1);assert.equal(list.data[0].id,id);
      const edited=await fn(name,'update')({...body,id});assert.equal(edited.isSuccess,true);
      // Exercise delete on a second record while preserving visible content for SSR/SEO assertions.
      const temporary=await fn(name,'create')(body);assert.equal((await fn(name,'remove')(temporary.data.id)).isSuccess,true);
      assert.equal((await call(`/dashboard/api/proxy/${name}/get-by-id/${temporary.data.id}`)).status,404);
    });
    await step('all public pages render populated SQL content, blog SEO/JSON-LD/canonical and sitemap retain actual slug',async()=>{
      for(const[route,names]of[['/',['Services','OurSpecialists','Testimonials','FAQs']],['/services',['Services']],['/about',['Services']],['/gallery',['Galleries']],['/youtube-videos',['YouTubeGalleries']],['/blog',['BlogPosts']],['/blog/'+records.BlogPosts.slug,['BlogPosts','OurSpecialists']]]){
        const page=await html(route);for(const name of names)assert.ok(page.includes(markers[name]),route+' must render SQL '+name);assert.ok(!page.includes('lapis.runasp.net'));
      }
      const detail=await html('/blog/'+records.BlogPosts.slug);assert.ok(detail.includes('application/ld+json'));assert.ok(detail.includes('rel="canonical"'));assert.ok(detail.includes(base+'/blog/'));
      const sitemap=await html('/sitemap.xml');assert.ok(sitemap.includes(records.BlogPosts.slug));assert.ok(sitemap.includes(base));assert.ok((await html('/robots.txt')).includes('/dashboard'));
      assert.equal((await call('/blog/phase6-missing-slug',{auth:false})).status,404);
    });
    await step('public caches invalidate immediately after proxy and direct API mutations, including specialist→blog dependency',async()=>{
      const before=markers.Services;assert.ok((await html('/services')).includes(before));
      const after='Phase6CacheUpdated'+randomBytes(3).toString('hex');await fn('Services','update')({id:records.Services.id,nameEn:after,nameAr:after});assert.ok((await html('/services')).includes(after),'Proxy mutation must invalidate public services');
      const second='Phase6DirectCache'+randomBytes(3).toString('hex');assert.equal((await call('/api/Services/edit/'+records.Services.id,{method:'PUT',auth:false,bearer:token,body:{nameEn:second,nameAr:second}})).status,200);assert.ok((await html('/services')).includes(second),'Direct API mutation must invalidate public services');
      const author='Phase6AuthorUpdated';await fn('OurSpecialists','update')({id:records.OurSpecialists.id,nameEn:author,nameAr:author});assert.ok((await html('/blog/'+records.BlogPosts.slug)).includes(author));
      const setting='Phase6AddressUpdated';await axios.put('Setting/edit',{address:setting});assert.ok((await html('/contact')).includes(setting));
    });
    await step('same-origin Next Image optimizer works without broad hosts; original files survive full Next restart',async()=>{
      const optimized=await fetch(base+'/_next/image?'+new URLSearchParams({url:base+'/'+uploaded.filePath,w:'64',q:'75'}));assert.equal(optimized.status,200);assert.ok(optimized.headers.get('content-type').startsWith('image/'));assert.ok((await optimized.arrayBuffer()).byteLength>0);
      const bad=await fetch(base+'/_next/image?'+new URLSearchParams({url:'https://example.invalid/uploads/x.png',w:'64',q:'75'}));assert.equal(bad.status,400);
      await stop();await start();assert.equal((await call('/dashboard/api/session')).status,200);const image=await fetch(base+'/'+uploaded.filePath);assert.equal(image.status,200);assert.deepEqual(Buffer.from(await image.arrayBuffer()),pixel('png'));
    });
    await step('tampered cookie, SQL expiry, disablement and password change independently invalidate sessions',async()=>{
      const saved=cookie,parts=token.split('.');parts[2]=(parts[2][0]==='A'?'B':'A')+parts[2].slice(1);
      const tampered=await call('/dashboard/api/session',{auth:false,headers:{cookie:'lapis_admin_session='+parts.join('.')}});assert.equal(tampered.status,401);assert.ok(tampered.response.headers.has('set-cookie'));cookie=saved;
      const current=(await call('/dashboard/api/session')).payload.user,config=readAuthConfig();const expired=await signIdentity(config,{id:current.id,email:current.email,role:current.role,version:0},Math.floor(Date.now()/1000)-config.ttlSeconds-60);assert.equal((await call('/dashboard/api/session',{auth:false,headers:{cookie:'lapis_admin_session='+expired.token}})).status,401);
      await query(pool,"UPDATE dbo.AuthSessions SET ExpiresAtUtc=DATEADD(SECOND,-1,SYSUTCDATETIME()) WHERE RevokedAtUtc IS NULL;");assert.equal((await call('/dashboard/api/session')).status,401);await login();
      await query(pool,"UPDATE dbo.Users SET IsDisabled=1 WHERE Email=@email;",[text('email',admin.email)]);assert.equal((await call('/dashboard/api/session')).status,401);await query(pool,"UPDATE dbo.Users SET IsDisabled=0 WHERE Email=@email;",[text('email',admin.email)]);await login();
      const changed=await call('/api/User/change-password',{method:'POST',auth:false,bearer:token,body:{currentPassword:admin.password,newPassword:'Phase6-new-password-123!'}});assert.equal(changed.status,200);assert.equal((await call('/dashboard/api/session')).status,401);admin.password='Phase6-new-password-123!';await login();
      assert.equal((await call('/api/auth/toggle-2fa',{method:'POST',auth:false,bearer:token,body:{}})).status,501);
    });
    await step('logout revokes the exact SQL session, clears cookie, remains204 idempotent and replays fail on direct/proxy APIs',async()=>{
      const previousToken=token;assert.equal((await call('/dashboard/api/session/logout',{method:'POST',csrf:false})).status,403);
      const logout=await call('/dashboard/api/session/logout',{method:'POST'});assert.equal(logout.status,204);assert.ok(logout.response.headers.get('set-cookie')?.includes('Max-Age=0'));
      assert.equal((await call('/dashboard/api/session')).status,401);assert.equal((await call('/api/User/get-info',{auth:false,bearer:previousToken})).status,401);assert.equal((await call('/dashboard/api/proxy/Services/get-all')).status,401);assert.equal((await call('/dashboard/api/session/logout',{method:'POST'})).status,204);
    });
    await step('database outage fails public readiness/session closed rather than returning empty200; no legacy request occurred',async()=>{
      await stop();await start({SQL_PORT:'1'});assert.equal((await call('/',{auth:false})).status,503);await stop();await start();assert.equal((await call('/',{auth:false})).status,200);
      assert.equal(await fs.readFile(log,'utf8'),'');assert.ok(!/Legacy backend is unavailable/.test(output));
      console.log(JSON.stringify({productionHTTPRequests:requestCount,legacyAttempts:0,sqlContent:true,realBrowser:false,frontendFunctions:'unchanged',nextImage:'optimized',restartPersistence:true}));
    });
  }finally{await stop();await closePool();assert.ok(path.resolve(root).startsWith(path.resolve(os.tmpdir())+path.sep+'lapis-phase6-http-'));await fs.rm(root,{recursive:true,force:true});}
});
