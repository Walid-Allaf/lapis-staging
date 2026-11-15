import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

// Real-browser diagnostics, public reads only. No CSS override is used in after-mode.
export async function diagnoseMobile({base, directory, before=false, repeats=1}) {
  await fs.mkdir(directory,{recursive:true});
  const browser=await chromium.launch({channel:'chrome',headless:true});
  const result={browser:browser.version(),before,repeats,cases:[],errors:[],legacyAttempts:0};
  const pause=ms=>new Promise(r=>setTimeout(r,ms));
  async function snapshot(page, action) {
    return page.evaluate(action=>{
      const rect=e=>{const r=e.getBoundingClientRect();const s=getComputedStyle(e);return {tag:e.tagName,classes:typeof e.className==='string'?e.className:'svg',
        text:e.textContent?.trim().slice(0,100),left:+r.left.toFixed(2),right:+r.right.toFixed(2),top:+r.top.toFixed(2),width:+r.width.toFixed(2),height:+r.height.toFixed(2),
        offsetWidth:e.offsetWidth??null,transform:s.transform,opacity:s.opacity,overflowX:s.overflowX,overflowY:s.overflowY,
        gridColumns:s.gridTemplateColumns,position:s.position,direction:s.direction,animation:e.getAttribute('data-aos'),animated:e.classList.contains('aos-animate')};};
      return {action,viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth,scrollX,scrollY,
        language:document.documentElement.lang,direction:document.documentElement.dir,readyState:document.readyState,
        reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches,
        welcome:[...document.querySelectorAll('.welcome-layout,.welcome-copy,.welcome-visual,.welcome-image-frame,.welcome-visual-gradient')].map(rect),
        headline:[...document.querySelectorAll('.hero-copy h1,.hero-copy h1 > span')].map(rect),
        hero:document.querySelector('.hero-copy')?rect(document.querySelector('.hero-copy')):null,
        overflowing:[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&(r.right>innerWidth+1||r.left< -1);}).slice(0,32).map(rect)};
    },action);
  }
  const capture=async(page,entry,action)=>{const state=await snapshot(page,action);entry.states.push(state);return state;};
  async function language(page,lang) {
    if(await page.locator('html').getAttribute('lang')!==lang){
      await page.locator('header button:visible').filter({hasText:lang==='en'?'English':'العربية'}).click();
      await page.waitForFunction(lang=>document.documentElement.lang===lang,lang);
    }
  }
  try {
    for(let run=1;run<=repeats;run++)for(const width of [320,375,390,414,430,1440])for(const lang of ['ar','en']){
      const context=await browser.newContext({viewport:{width,height:width===1440?1000:844},locale:lang,reducedMotion:'no-preference'});
      await context.addCookies([{name:'lapis.language',value:lang,url:base}]);
      await context.addInitScript(lang=>localStorage.setItem('lapis.language',lang),lang);
      await context.route('**/*',r=>{if(new URL(r.request().url()).hostname==='lapis.runasp.net'){result.legacyAttempts++;return r.abort();}return r.continue();});
      const page=await context.newPage();page.on('pageerror',e=>result.errors.push(e.message));
      const entry={run,width,lang,states:[],screenshots:[]};result.cases.push(entry);
      try{
        assert.equal((await page.goto(base+'/',{waitUntil:'domcontentloaded'})).status(),200);
        await capture(page,entry,'direct-dom-ready');
        await page.waitForFunction(()=>document.body.hasAttribute('data-aos-duration'));
        await page.evaluate(()=>document.fonts.ready);await pause(850);
        if(!before)await page.waitForFunction(()=>Number(getComputedStyle(document.querySelector('.hero-copy')).opacity)===1,{},{timeout:5000});
        await capture(page,entry,'AOS-initialized-offscreen');
        if(run===1&&width===390){const p=path.join(directory,`${lang}-390-top.png`);await page.screenshot({path:p});entry.screenshots.push(path.basename(p));}
        if(before){
          const style=await page.addStyleTag({content:'.welcome-copy,.welcome-visual { transform: none !important; }'});
          await pause(850);await capture(page,entry,'diagnostic-only-welcome-transform-none');await style.evaluate(e=>e.remove());
          const both=await page.addStyleTag({content:'.welcome-copy,.welcome-visual,.smile-copy,.smile-visual { transform: none !important; }'});
          await pause(850);await capture(page,entry,'diagnostic-only-both-transforms-none');await both.evaluate(e=>e.remove());await pause(850);
        }
        // In-app navigation preserves a sentinel; a document reload cannot satisfy this check.
        await page.evaluate(()=>{window.__lapisClientNavigation='preserved';});
        if(!(await page.locator('header a[href="/about"]:visible').count()))await page.locator('header button[aria-expanded]').click();
        await page.locator('header a[href="/about"]:visible').first().click();await page.waitForURL(base+'/about');
        await page.locator('header a[href="/"]:visible').first().click();await page.waitForURL(base+'/');
        assert.equal(await page.evaluate(()=>window.__lapisClientNavigation),'preserved');await pause(850);
        await capture(page,entry,'client-navigation-home');
        await language(page,lang==='en'?'ar':'en');await pause(850);await capture(page,entry,'language-switched');
        await language(page,lang);await page.locator('#welcoming-heading').scrollIntoViewIfNeeded();await pause(1000);
        await capture(page,entry,'welcome-in-view');
        const image=page.locator('.welcome-image-frame img');await image.scrollIntoViewIfNeeded();await pause(850);
        assert.ok(await image.evaluate(i=>i.complete&&i.naturalWidth>0),'Welcome image renders');
        await page.locator('#welcoming-heading').scrollIntoViewIfNeeded();
        const visual=await snapshot(page,'visual-settled');entry.states.push(visual);
        if(run===1&&width===390){const p=path.join(directory,`${lang}-390-welcome.png`);await page.screenshot({path:p});entry.screenshots.push(path.basename(p));}
        // Real content, including the decorative gradient, must fit after its animation.
        entry.contentFits=visual.welcome.every(e=>e.left>=-1&&e.right<=width+1);
        const animated=visual.welcome.filter(e=>/\bwelcome-(copy|visual)\b/.test(e.classes)&&e.animation);
        entry.animationWorks=animated.length===2&&animated.every(e=>e.animated&&Number(e.opacity)===1);
        // Visit the rest of the page so intentional entrance offsets have finished
        // before checking real text, controls and images for persistent clipping.
        await page.evaluate(async()=>{for(let y=0;y<document.documentElement.scrollHeight;y+=600){scrollTo({top:y,behavior:'instant'});await new Promise(r=>setTimeout(r,110));}});
        await pause(1000);
        entry.inaccessibleText=await page.evaluate(()=>{
          const nodes=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT),bad=[];let node;
          while((node=nodes.nextNode())){
            const el=node.parentElement;if(!node.textContent.trim()||!el||el.closest('script,style,svg,[aria-hidden=true],.sr-only'))continue;
            if(!el.checkVisibility({checkOpacity:true,checkVisibilityCSS:true}))continue;
            const range=document.createRange();range.selectNodeContents(node);
            if([...range.getClientRects()].some(r=>r.width>0&&(r.left< -1||r.right>innerWidth+1)))bad.push({text:node.textContent.trim().slice(0,100),tag:el.tagName,classes:el.className});
          }return bad;
        });
        await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await pause(150);await capture(page,entry,'scrolled-back-top');
        await page.evaluate(()=>scrollTo({left:100,behavior:'instant'}));await capture(page,entry,'positive-horizontal-scroll-attempt');
        await page.evaluate(()=>scrollTo({left:-100,behavior:'instant'}));await capture(page,entry,'negative-horizontal-scroll-attempt');
        await page.emulateMedia({reducedMotion:'reduce'});await page.reload();await page.waitForFunction(()=>document.body.hasAttribute('data-aos-duration'));await pause(150);
        const reduced=await capture(page,entry,'reduced-motion');
        entry.reducedMotionRespected=reduced.welcome.filter(e=>e.animation).every(e=>Number(e.opacity)===1&&(e.transform==='none'||e.transform==='matrix(1, 0, 0, 1, 0, 0)'));
        entry.noHorizontalScroll=entry.states.every(s=>s.scrollWidth===width&&s.scrollX===0);
      }finally{await context.close();await fs.writeFile(path.join(directory,'measurements.json'),JSON.stringify(result,null,2));}
    }
    return result;
  }finally{await browser.close();await fs.writeFile(path.join(directory,'measurements.json'),JSON.stringify(result,null,2));}
}
