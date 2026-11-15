// Explicit operator-invoked public GET inventory only. No startup import, credentials or legacy mutations.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const report={source:'public legacy GET',publicOnly:true,protectedDatasets:'not accessed',mutations:0,modules:{},fileReferences:0};
try{
  if(process.argv.length>2)throw Error('Unsupported arguments');
  const files=new Map();
  for(const resourceName of ['Services','FAQs','OurSpecialists','Testimonials','Galleries','YouTubeGalleries','BlogPosts']){
    const ids=new Set(),slugs=new Set();let total,duplicates=0,duplicateSlugs=0,pages=0;
    for(let page=1;page<=1000;page++){
      const response=await fetch(`https://lapis.runasp.net/api/${resourceName}/get-all?PageNumber=${page}&PageSize=100&IsActive=true`,{signal:AbortSignal.timeout(15000),redirect:'error'});
      if(!response.ok)throw Error('Public inventory unavailable');const body=await response.json();if(!body.isSuccess||!Array.isArray(body.data))throw Error('Invalid public shape');
      pages++;total??=body.paging?.totalRecords;
      for(const row of body.data){if(ids.has(row.id))duplicates++;ids.add(row.id);if(row.slug){if(slugs.has(row.slug))duplicateSlugs++;slugs.add(row.slug);}for(const key of ['image','avatar','beforeImage','afterImage'])if(row[key]?.id)files.set(row[key].id,row[key].filePath);}
      if(!body.data.length||ids.size>=Number(total??0)||body.data.length<100)break;
      if(page===1000)throw Error('Inventory pagination cap');
    }
    report.modules[resourceName]={publicRows:ids.size,reportedTotal:total??null,pages,duplicateIds:duplicates,duplicateSlugs,countMatches:total===undefined?null:ids.size===total};
  }
  for(const endpoint of ['get-settings','get-ads']){const response=await fetch('https://lapis.runasp.net/api/Client/'+endpoint,{signal:AbortSignal.timeout(15000),redirect:'error'});report[endpoint]={status:response.status};await response.body?.cancel();}
  report.fileReferences=files.size;
  report.media=[];
  for(const[id,source]of files){
    try{
      const url=new URL(String(source).replace('|',''),'https://lapis.runasp.net/');
      if(url.origin!=='https://lapis.runasp.net'||!url.pathname.startsWith('/uploads/')||url.search||url.hash||url.username||url.password)throw Error('Unreviewed media path');
      const response=await fetch(url,{signal:AbortSignal.timeout(15000),redirect:'error'});if(!response.ok)throw Error('Unavailable media');
      const hash=createHash('sha256');let length=0;const reader=response.body.getReader();
      try{while(true){const{done,value}=await reader.read();if(done)break;length+=value.length;if(length>4*1024*1024){await reader.cancel();throw Error('Media exceeds import upload limit');}hash.update(value);}}finally{reader.releaseLock();}
      report.media.push({legacyId:id,status:'public-bytes-hashed',byteLength:length,mimeType:response.headers.get('content-type'),sha256:hash.digest('hex')});
    }catch{report.media.push({legacyId:id,status:'requires-authorized-export-or-manual-review'});}
  }
  const hashes=new Map();for(const media of report.media)if(media.sha256)hashes.set(media.sha256,(hashes.get(media.sha256)??0)+1);report.sharedMediaHashGroups=[...hashes.values()].filter(count=>count>1).length;
  const output=process.env.DATA_INVENTORY_REPORT;if(output){const relative=path.relative(process.cwd(),path.resolve(output));if(!path.isAbsolute(output)||(!relative.startsWith('..'+path.sep)&&!path.isAbsolute(relative)))throw Error('Private report path required');await fs.writeFile(output,JSON.stringify(report,null,2),{flag:'wx',mode:0o600});}
  console.log(JSON.stringify(report));
}catch{console.error(JSON.stringify({operation:'legacy-public-inventory',code:'INVENTORY_UNAVAILABLE',mutations:0}));process.exitCode=1;}
