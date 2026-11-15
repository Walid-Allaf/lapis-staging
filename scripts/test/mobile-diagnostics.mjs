import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {assertDatabaseWriteAllowed} from '../../server/backend/config.ts';
import {diagnoseMobile} from '../../tests/backend/mobile-diagnostics.mjs';
assertDatabaseWriteAllowed('test');
const before=process.env.PHASE7_MOBILE_MODE==='before',base='http://127.0.0.1:3197';
const directory=await fs.mkdtemp(path.join(os.tmpdir(),`lapis-phase7-mobile-${before?'before':'after'}-`));
let ready=false;
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3197'],{windowsHide:true,
  env:{...process.env,APP_ORIGIN:base,NODE_OPTIONS:'--import='+pathToFileURL(path.resolve('tests/backend/block-legacy.mjs')).href},stdio:['ignore','pipe','pipe']});
server.stdout.on('data',b=>{if(String(b).includes('Ready'))ready=true;});server.stderr.on('data',()=>{});
try{
  for(let i=0;i<250&&!ready;i++){if(server.exitCode!==null)break;await new Promise(r=>setTimeout(r,100));}
  if(!ready)throw Error('Diagnostic server did not start');
  const result=await diagnoseMobile({base,directory,before,repeats:before?1:3});
  const failed=result.cases.filter(c=>!c.noHorizontalScroll||!c.contentFits||!c.animationWorks||!c.reducedMotionRespected||c.inaccessibleText?.length);
  console.log(JSON.stringify({directory,cases:result.cases.length,failures:failed.map(c=>({width:c.width,lang:c.lang,run:c.run,widths:c.states.map(s=>s.scrollWidth),contentFits:c.contentFits,animation:c.animationWorks,reducedMotion:c.reducedMotionRespected,inaccessibleText:c.inaccessibleText})),errors:result.errors,legacyAttempts:result.legacyAttempts}));
  if(!before&&(failed.length||result.errors.length||result.legacyAttempts))process.exitCode=1;
}finally{const stopped=new Promise(r=>server.once('exit',r));if(server.exitCode===null){server.kill();await stopped;}}
