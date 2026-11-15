import fs from 'node:fs/promises';
import path from 'node:path';
import nextEnv from '@next/env';
import { analyzeImport } from '../../server/backend/import/dry-run.ts';
nextEnv.loadEnvConfig(process.cwd(),true,{info(){},error(){}});
try{
  if(process.argv.length>2)throw Error('Unsupported arguments');
  const input=process.env.DATA_IMPORT_SOURCE;
  if(!input||!path.isAbsolute(input)||(await fs.stat(input)).size>25*1024*1024)throw Error('Invalid source');
  const report=analyzeImport(JSON.parse(await fs.readFile(input,'utf8')));
  const output=process.env.DATA_IMPORT_REPORT;
  if(output){const relative=path.relative(process.cwd(),path.resolve(output));if(!path.isAbsolute(output)||(!relative.startsWith('..'+path.sep)&&!path.isAbsolute(relative)))throw Error('Report must be private outside checkout');await fs.writeFile(output,JSON.stringify(report,null,2),{flag:'wx',mode:0o600});}
  console.log(JSON.stringify({mode:report.mode,writes:0,counts:report.counts,issues:report.issues.length,applySupported:false}));
}catch{console.error(JSON.stringify({operation:'import-dry-run',code:'IMPORT_REVIEW_FAILED'}));process.exitCode=1;}
