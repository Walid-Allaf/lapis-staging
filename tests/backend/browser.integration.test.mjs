import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { pathToFileURL } from 'node:url';
import { spawn, spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { chromium, expect } from '@playwright/test';
import { assertDatabaseWriteAllowed } from '../../server/backend/config.ts';
import { getPool, closePool } from '../../server/backend/db/pool.ts';
import { query } from '../../server/backend/db/parameters.ts';
import { migrateDatabase } from '../../server/backend/db/migrate.ts';
import { pixel, largePng } from './file-fixtures.mjs';

test('Phase7 actual Chrome browser: empty bilingual site, dashboard CRUD, media, restart and performance', {
  skip: process.env.SQL_ALLOW_TESTS !== 'true' && 'Dedicated SQL test credentials required', timeout: 600000
}, async t => {
  assertDatabaseWriteAllowed('test');
  const pool=await getPool(), root=await fs.mkdtemp(path.join(os.tmpdir(),'lapis-phase7-browser-'));
  const base='http://127.0.0.1:3197', media=path.join(root,'media'), network=path.join(root,'legacy.log');
  const account={email:'phase7-browser@example.invalid',password:randomBytes(24).toString('base64url')};
  const evidence={steps:[],browser:'',legacyAttempts:0,pageErrors:[],reactHydrationErrors:[],performance:{},screenshots:[]};
  const report=path.join(os.tmpdir(),'lapis-phase7-browser-evidence.json');
  let child,browser,context,page,uploaded,startupMs;
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const rss=()=>{
    const r=spawnSync('powershell.exe',['-NoProfile','-Command',`(Get-Process -Id ${child.pid}).WorkingSet64`],{encoding:'utf8',windowsHide:true});
    return Number(r.stdout.trim()) || null;
  };
  const start=async()=>{
    let ready=false;const began=performance.now();
    child=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3197'],{windowsHide:true,env:{...process.env,APP_ORIGIN:base,UPLOAD_DIR:media,
      NODE_OPTIONS:'--import='+pathToFileURL(path.resolve('tests/backend/block-legacy.mjs')).href,LAPIS_TEST_NETWORK_LOG:network},stdio:['ignore','pipe','pipe']});
    child.stdout.on('data',b=>{if(String(b).includes('Ready'))ready=true;});child.stderr.on('data',()=>{});
    for(let i=0;i<250&&!ready;i++){if(child.exitCode!==null)break;await sleep(100);}
    assert.ok(ready,'Next production server starts');startupMs=Math.round(performance.now()-began);
  };
  const stop=async()=>{if(!child)return;const done=new Promise(r=>child.once('exit',r));child.kill();await done;child=undefined;};
  const step=async(name,work,required=true)=>{let ok=false;await t.test(name,async()=>{await work();ok=true;});evidence.steps.push({name,status:ok?'PASS':'FAIL'});await fs.writeFile(report,JSON.stringify(evidence,null,2));if(!ok&&required)throw Error('Browser prerequisite failed: '+name);};
  const screenshot=async name=>{const file=path.join(root,name+'.png');await page.screenshot({path:file,fullPage:true});evidence.screenshots.push(file);};
  const response=async(method,resource,action,work)=>{
    const waiting=page.waitForResponse(r=>r.request().method()===method&&new URL(r.url()).pathname.startsWith(`/dashboard/api/proxy/${resource}/${action}`),{timeout:20000});
    await work();const result=await waiting;assert.equal(result.status(),200,resource+' '+action);return result.json();
  };
  const dialog=()=>page.getByRole('dialog').filter({has:page.locator('form')}).first();
  const openAdd=async feature=>{await page.goto(base+'/dashboard/'+feature);await page.locator('button').filter({has:page.locator('svg.lucide-plus')}).click();await expect(dialog()).toBeVisible();};
  const fillForm=async(marker,{upload=false,blog=false}={})=>{
    const d=dialog();
    for(const field of await d.locator('input[name],textarea[name]').all()){
      const name=await field.getAttribute('name'),type=await field.getAttribute('type');if(type==='file'||type==='hidden'||type==='checkbox')continue;
      if(name==='videoUrl')await field.fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      else if(type==='number')await field.fill(name==='starNumber'?'5':name==='status'?'1':'1');
      else await field.fill(marker+' '+name);
    }
    if(blog){
      await d.getByRole('combobox').filter({hasText:'البحث'}).click();
      await page.getByRole('option').filter({hasText:'Phase7Specialist'}).first().click();
      const unlock=d.locator('button').filter({has:page.locator('svg.lucide-lock-open')});await expect(unlock).toHaveCount(2);
      // The icon changes after each click, so take the first remaining locked editor each time.
      await unlock.first().click();await unlock.first().click();
      const editors=d.locator('[contenteditable="true"]');await expect(editors).toHaveCount(2);
      for(const editor of await editors.all())await editor.fill(marker+' content');
    }
    if(upload)for(const file of await d.locator('input[type=file]').all()){
      const value=await response('POST','FileUpload','upload',()=>file.setInputFiles({name:'phase7.png',mimeType:'image/png',buffer:pixel('png')}));
      uploaded=value.data;await expect(d.locator('img').first()).toBeVisible();
      assert.ok(await d.locator('img').first().evaluate(img=>img.complete&&img.naturalWidth>0));
    }
    for(const toggle of await d.getByRole('switch').all())if(await toggle.getAttribute('aria-checked')==='false')await toggle.click();
  };
  const items=[['services','Services','Phase7Service'],['faqs','FAQs','Phase7FAQ'],['our-specialists','OurSpecialists','Phase7Specialist'],
    ['testimonials','Testimonials','Phase7Testimonial'],['gallery','Galleries','Phase7Gallery'],['youtube-galleries','YouTubeGalleries','Phase7Video'],['blog-posts','BlogPosts','Phase7Blog']];
  try{
    assert.equal((await query(pool,'SELECT COUNT(*) AS n FROM sys.tables WHERE is_ms_shipped=0;')).recordset[0].n,0);
    await migrateDatabase(pool);
    const initialize=spawnSync(process.execPath,['--conditions=react-server','--import','tsx','scripts/db/initialize.mjs'],{windowsHide:true,encoding:'utf8',env:{...process.env,SQL_CLEAN_START_CONFIRM:'INITIALIZE_EMPTY_LAPIS'}});
    assert.equal(initialize.status,0,'Private clean initialization CLI succeeds');
    const bootstrap=spawnSync(process.execPath,['--conditions=react-server','--import','tsx','scripts/db/bootstrap-admin.mjs'],{windowsHide:true,encoding:'utf8',env:{...process.env,AUTH_BOOTSTRAP_ALLOW:'true',AUTH_BOOTSTRAP_CONFIRM:'CREATE_FIRST_SUPERADMIN',AUTH_BOOTSTRAP_EMAIL:account.email,AUTH_BOOTSTRAP_PASSWORD:account.password}});
    assert.equal(bootstrap.status,0,'Private operator bootstrap CLI succeeds');assert.ok(!bootstrap.stdout.includes(account.password)&&!bootstrap.stderr.includes(account.password));
    evidence.privateCli={initialize:'PASS',bootstrap:'PASS',passwordLogged:false};
    await fs.writeFile(network,'');await start();await sleep(1500);evidence.performance.freshIdleRssBytes=rss();
    browser=await chromium.launch({channel:'chrome',headless:true});evidence.browser=browser.version();
    context=await browser.newContext({viewport:{width:1440,height:1000}});
    await context.route('**/*',route=>{if(new URL(route.request().url()).hostname==='lapis.runasp.net'){evidence.legacyAttempts++;return route.abort();}return route.continue();});
    page=await context.newPage();page.on('pageerror',error=>evidence.pageErrors.push(error.message));
    page.on('console',message=>{if(['error','warning'].includes(message.type())&&/hydration|hydrating|minified React error|server rendered HTML/i.test(message.text()))evidence.reactHydrationErrors.push(message.text());});
    page.setDefaultTimeout(12000);
    await step('empty public pages render in Arabic and English with metadata and sitemap',async()=>{
      for(const lang of ['ar','en']){
        await page.goto(base+'/');
        if(await page.locator('html').getAttribute('lang')!==lang)await page.locator('header button:visible').filter({hasText:lang==='en'?'English':'العربية'}).click();
        await expect(page.locator('html')).toHaveAttribute('lang',lang);
        for(const route of ['/','/services','/about','/blog','/gallery','/youtube-videos','/contact']){
          const r=await page.goto(base+route);assert.equal(r.status(),200,lang+' '+route);
          await expect(page.locator('html')).toHaveAttribute('lang',lang);
          await expect(page.locator('html')).toHaveAttribute('dir',lang==='ar'?'rtl':'ltr');
          assert.ok((await page.title()).length>5);assert.ok(await page.locator('meta[name=description]').getAttribute('content'));
        }
      }
      assert.equal((await page.request.get(base+'/sitemap.xml')).status(),200);
      for(const [,resource] of items){const r=await page.request.get(base+`/api/${resource}/get-all`);assert.equal(r.status(),200);const body=await r.json();assert.deepEqual(body.data,[]);}
    });
    await step('mobile layout at 390x844 has no settled horizontal overflow',async()=>{
      await page.setViewportSize({width:390,height:844});await page.goto(base+'/');
      await page.evaluate(()=>document.fonts.ready);await sleep(1800);
      evidence.mobile=await page.evaluate(()=>({viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth,
        overflow:[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&(r.right>innerWidth+2||r.left< -2);}).slice(0,12).map(e=>({tag:e.tagName,classes:e.className,width:Math.round(e.getBoundingClientRect().width)}))}));
      await screenshot('mobile-empty');
      await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth===innerWidth&&scrollX===0),{timeout:7000,message:'No settled horizontal overflow'}).toBe(true);
    },false);
    await page.setViewportSize({width:1440,height:1000});
    await step('unauthorized pages/APIs are rejected; invalid login fails then secure SuperAdmin login succeeds',async()=>{
      await page.goto(base+'/dashboard/services');await expect(page).toHaveURL(/\/dashboard\/login/);
      assert.equal((await page.request.get(base+'/dashboard/api/proxy/Services/get-all')).status(),401);
      await page.locator('[name=email]').fill(account.email);await page.locator('[name=password]').fill('incorrect-password');
      const bad=page.waitForResponse(r=>r.url().endsWith('/dashboard/api/session/login'));await page.locator('button[type=submit]').click();assert.equal((await bad).status(),401);
      await expect(page.locator('button[type=submit]')).toBeEnabled();
      await page.locator('[name=email]').fill(account.email);await page.locator('[name=password]').fill(account.password);await page.locator('[name=password]').blur();
      const good=page.waitForResponse(r=>r.url().endsWith('/dashboard/api/session/login'));await page.locator('button[type=submit]').click();const r=await good;
      const submitted=r.request().postDataJSON();assert.ok(submitted.email===account.email,'Login email matches operator input');assert.ok(submitted.password===account.password,'Login password matches operator input');
      assert.equal(r.status(),200);assert.equal('token' in await r.json(),false);
      await expect(page).not.toHaveURL(/login/);const cookie=(await context.cookies()).find(c=>c.name==='lapis_admin_session');assert.ok(cookie.httpOnly&&cookie.secure&&cookie.sameSite==='Strict');
      await page.reload();await expect(page).not.toHaveURL(/login/);
    });
    for(const [feature,resource,marker] of items)await step(resource+' first record create/read/update through unchanged form and table',async()=>{
      await openAdd(feature);await fillForm(marker,{upload:['Services','Galleries','BlogPosts'].includes(resource),blog:resource==='BlogPosts'});
      await response('POST',resource,'add',()=>dialog().locator('button[type=submit]').click());await expect(page.getByRole('dialog')).toHaveCount(0);
      let row=page.locator('tbody tr').filter({hasText:marker}).first();await expect(row).toBeVisible();
      await row.locator('button').filter({has:page.locator('svg.lucide-square-pen,svg.lucide-pen-square,svg.lucide-edit')}).click();
      const field=dialog().locator('[name="'+(['Services','OurSpecialists'].includes(resource)?'nameEn':resource==='FAQs'?'questionEn':'titleEn')+'"]');
      await expect(field).toHaveValue(new RegExp(marker));await field.fill(marker+'Updated');
      const arabicField=dialog().locator('[name="'+(['Services','OurSpecialists'].includes(resource)?'nameAr':resource==='FAQs'?'questionAr':'titleAr')+'"]');await arabicField.fill(marker+'Updated');
      await response('PUT',resource,'edit',()=>dialog().locator('button[type=submit]').click());await expect(page.getByRole('dialog')).toHaveCount(0);
      await expect(page.locator('tbody tr').filter({hasText:marker+'Updated'}).first()).toBeVisible();
    });
    await step('settings UI saves first values and invalidates public cache; uploaded image renders publicly',async()=>{
      await page.goto(base+'/dashboard/settings');await page.locator('button').filter({has:page.locator('svg.lucide-lock-open')}).click();
      const values={phoneNumber:'0000000000',email:'contact@example.invalid',address:'Phase7SyntheticAddress',latitude:'0',longitude:'0',aboutUs_Ar:'اختبار محلي',aboutUs_En:'Local synthetic test',contactUs_Ar:'اختبار محلي',contactUs_En:'Local synthetic test'};
      for(const[name,value]of Object.entries(values))await page.locator(`[name="${name}"]`).fill(value);
      for(const toggle of await page.getByRole('switch').all())if(await toggle.getAttribute('aria-checked')==='false')await toggle.click();
      await response('PUT','Setting','edit',()=>page.locator('button[type=submit]').click());
      await page.goto(base+'/contact');await expect(page.getByText('Phase7SyntheticAddress').first()).toBeVisible();
      await page.goto(base+'/services');await expect(page.getByText('Phase7ServiceUpdated').first()).toBeVisible();
      const img=page.locator('img').filter({hasNot:page.locator('none')});
      await expect.poll(()=>page.locator('img[src*="uploads"]').evaluateAll(images=>images.some(i=>i.complete&&i.naturalWidth>0))).toBe(true);
      await screenshot('public-service');assert.ok(img);
    });
    await step('measured startup/RSS/warm reads/concurrent reads/SQL sessions and UI image upload memory',async()=>{
      const p=evidence.performance;p.startupMs=startupMs;p.idleRssBytes=rss();
      const durations=[];for(let i=0;i<30;i++){const start=performance.now();assert.equal((await fetch(base+'/api/Services/get-all')).status,200);durations.push(performance.now()-start);}
      durations.sort((a,b)=>a-b);p.warmRead={requests:30,p50Ms:+durations[14].toFixed(2),p95Ms:+durations[28].toFixed(2)};
      const began=performance.now();const statuses=await Promise.all(Array.from({length:6},async()=>{for(let i=0;i<5;i++)assert.equal((await fetch(base+'/api/Services/get-all')).status,200);return true;}));
      p.concurrentReads={concurrency:6,requests:30,elapsedMs:Math.round(performance.now()-began),passed:statuses.length};
      const observer=spawnSync('pwsh.exe',['-NoProfile','-File','tests/backend/observe-local-sessions.ps1','-TestLogin',process.env.SQL_USER],{encoding:'utf8',windowsHide:true});
      p.sqlSessions=observer.status===0?JSON.parse(observer.stdout):'NOT TESTED: local PowerShell7/integrated observer unavailable';
      p.nextProcessId=child.pid;p.testProcessId=process.pid;
      const samples=[];const sampling=setInterval(()=>samples.push({size:pool.size,borrowed:pool.borrowed,pending:pool.pending}),10);
      try{await Promise.all(Array.from({length:6},()=>query(pool,"WAITFOR DELAY '00:00:00.100'; SELECT 1 AS probe;")));}finally{clearInterval(sampling);}
      p.isolatedDriverPool={requests:6,maxSize:Math.max(...samples.map(s=>s.size)),maxBorrowed:Math.max(...samples.map(s=>s.borrowed)),maxPending:Math.max(...samples.map(s=>s.pending)),sampleIntervalMs:10};
      p.poolConfiguredMax=Number(process.env.SQL_POOL_MAX??3);await openAdd('services');p.beforeImageUploadRssBytes=rss();
      const image=largePng(),uploadStart=performance.now();assert.ok(image.length<4*1024*1024);
      await response('POST','FileUpload','upload',()=>dialog().locator('input[type=file]').setInputFiles({name:'phase7-memory.png',mimeType:'image/png',buffer:image}));
      p.imageUploadMs=Math.round(performance.now()-uploadStart);p.afterImageUploadRssBytes=rss();p.imageFixtureBytes=image.length;p.rssMethod='Windows Get-Process WorkingSet64, checkpoints, not peak';
      await page.goto(base+'/dashboard/services');
    });
    await step('media bytes, ETag and Range persist across complete application restart; browser session restores',async()=>{
      const url=base+'/'+uploaded.filePath,before=await fetch(url),etag=before.headers.get('etag');assert.equal(before.status,200);assert.deepEqual(Buffer.from(await before.arrayBuffer()),pixel('png'));
      assert.equal((await fetch(url,{headers:{'if-none-match':etag}})).status,304);assert.equal((await fetch(url,{headers:{range:'bytes=0-7'}})).status,206);
      await stop();await start();await page.goto(base+'/dashboard/services');await expect(page).not.toHaveURL(/login/);
      assert.deepEqual(Buffer.from(await (await fetch(url)).arrayBuffer()),pixel('png'));
    });
    for(const [feature,resource,marker] of [...items].reverse())await step(resource+' delete through existing confirmation UI',async()=>{
      await page.goto(base+'/dashboard/'+feature);const row=page.locator('tbody tr').filter({hasText:marker+'Updated'}).first();await expect(row).toBeVisible();
      await row.locator('button').filter({has:page.locator('svg.lucide-trash-2')}).click();
      await response('DELETE',resource,'delete',()=>page.getByRole('dialog').getByRole('button',{name:'نعم',exact:true}).click());
      await expect(page.locator('tbody tr').filter({hasText:marker+'Updated'})).toHaveCount(0);
    });
    await step('UI logout revokes SQL session and protected routes fail; no legacy calls or browser exceptions',async()=>{
      await page.getByRole('button').filter({hasText:account.email}).click();await page.getByText('تسجيل الخروج',{exact:true}).click();
      const logout=page.waitForResponse(r=>r.url().endsWith('/dashboard/api/session/logout'));await page.getByRole('dialog').getByRole('button',{name:'نعم',exact:true}).click();assert.equal((await logout).status(),204);
      await page.goto(base+'/dashboard/services');await expect(page).toHaveURL(/login/);
      assert.equal((await page.request.get(base+'/dashboard/api/session')).status(),401);assert.equal(evidence.legacyAttempts,0);assert.equal(await fs.readFile(network,'utf8'),'');assert.deepEqual(evidence.pageErrors,[]);assert.deepEqual(evidence.reactHydrationErrors,[]);
    });
  }finally{
    if(page)await screenshot('final-state').catch(()=>{});await browser?.close();await stop();await closePool();
    await fs.writeFile(report,JSON.stringify(evidence,null,2));console.log(JSON.stringify({evidence:report,artifactDirectory:root,browser:evidence.browser,steps:evidence.steps.length,legacyAttempts:evidence.legacyAttempts}));
  }
});
