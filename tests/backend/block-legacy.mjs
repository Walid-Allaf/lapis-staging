// Test-process preload only. Never imported by deployed application code.
import fs from 'node:fs';
import http from 'node:http';
import https from 'node:https';
import dns from 'node:dns';
const blocked=value=>{
  let host='';
  if(typeof value==='string'||value instanceof URL){try{host=new URL(value).hostname;}catch{host=String(value);}}
  else if(value)host=value.hostname??value.host??'';
  if(String(host).toLowerCase().replace(/:\d+$/,'')!=='lapis.runasp.net')return;
  if(process.env.LAPIS_TEST_NETWORK_LOG)fs.appendFileSync(process.env.LAPIS_TEST_NETWORK_LOG,JSON.stringify({event:'blocked_legacy_request'})+'\n');
  throw Error('Legacy backend is unavailable in this integration test.');
};
const fetchOriginal=globalThis.fetch;
globalThis.fetch=(input,options)=>{blocked(input instanceof Request?input.url:input);return fetchOriginal(input,options);};
for(const transport of [http,https])for(const method of ['request','get']){const original=transport[method];transport[method]=function(...args){blocked(args[0]);return original.apply(this,args);};}
const lookup=dns.lookup;
dns.lookup=function(host,...args){blocked(host);return lookup.call(this,host,...args);};
