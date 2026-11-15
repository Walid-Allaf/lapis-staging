import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';
import { loadTs } from '../load-ts.mjs';
import { randomBytes } from 'node:crypto';
import { deflateSync } from 'node:zlib';

// Synthetic noise image for bounded local memory measurement, never production seed data.
export function largePng() {
  const chunk=(kind,data)=>{
    const body=Buffer.concat([Buffer.from(kind),data]),out=Buffer.alloc(data.length+12);out.writeUInt32BE(data.length);body.copy(out,4);
    let crc=0xffffffff;for(const byte of body){crc^=byte;for(let i=0;i<8;i++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}
    out.writeUInt32BE((crc^0xffffffff)>>>0,out.length-4);return out;
  };
  const header=Buffer.alloc(13);header.writeUInt32BE(1024,0);header.writeUInt32BE(1024,4);header[8]=8;header[9]=2;
  const rows=randomBytes(1024*(1+1024*3));for(let y=0;y<1024;y++)rows[y*(1+1024*3)]=0;
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(rows)),chunk('IEND',Buffer.alloc(0))]);
}

export const pixel = extension => fs.readFileSync(new URL('./fixtures/media/pixel.' + extension, import.meta.url));
export function pdfFixture(size) {
  let body='%PDF-1.4\n';
  const objects=['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 200 200] >>'];
  const offsets=[0];
  for(let i=0;i<objects.length;i++){offsets.push(Buffer.byteLength(body));body+=`${i+1} 0 obj\n${objects[i]}\nendobj\n`;}
  const build = padding => {
    const content=body+(padding?'%'+ ' '.repeat(padding-2)+'\n':'');
    const xref=Buffer.byteLength(content);
    return Buffer.from(content+`xref\n0 4\n0000000000 65535 f \n`+offsets.slice(1).map(n=>String(n).padStart(10,'0')+' 00000 n \n').join('')+`trailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
  };
  if(!size)return build(0);
  let padding=size-build(0).length;
  for(let i=0;i<4;i++){const bytes=build(padding);if(bytes.length===size)return bytes;padding+=size-bytes.length;}
  throw Error('PDF size fixture mismatch');
}
export function uploadRequest(bytes=pixel('png'),type='image/png',token='aa.bb.cc',options={}) {
  const boundary='lapis-test-boundary';
  const part=(field,name)=>Buffer.concat([Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${field}"; filename="${name}"\r\nContent-Type: ${type}\r\n\r\n`),bytes,Buffer.from('\r\n')]);
  const body=Buffer.concat([part(options.field??'file',options.filename??'sample.png'),...(options.multiple?[part('file','second.png')]:[]),Buffer.from(`--${boundary}--\r\n`)]);
  return new Request('https://local/api/FileUpload/upload',{method:'POST',headers:{'content-type':'multipart/form-data; boundary='+boundary,...(token?{authorization:'Bearer '+token}:{})},body});
}

// Execute the actual unchanged TSX component with test-only hook/transport adapters.
// No source rewriting and no deployed adapter. Its real input onChange creates FormData and consumes the response.
export async function exerciseImageUpload(post, bytes=pixel('png'), type='image/png') {
  const state=[], fields=[], changes=[];let cursor=0;
  const hooks={useState:initial=>{const i=cursor++;if(!(i in state))state[i]=initial;return[state[i],value=>{state[i]=value;}];},useEffect:()=>{},useMemo:fn=>fn()};
  const context={setFieldValue:(...args)=>fields.push(args),setFieldTouched:()=>{},touched:{},errors:{}};
  const nodeRequire=createRequire(path.resolve('package.json'));
  const requireModule=name=>{
    if(name==='react')return hooks;
    if(name==='formik')return{getIn:()=>undefined,useField:()=>[{value:null}],useFormikContext:()=>context};
    if(name==='@/dashboard/api/axios')return{__esModule:true,default:{post}};
    if(name==='@/dashboard/api/urls')return loadTs('dashboard/api/urls.ts');
    if(name==='@/dashboard/api/upload-limits')return loadTs('dashboard/api/upload-limits.ts');
    if(name==='react/jsx-runtime')return nodeRequire(name);
    if(name==='@/dashboard/lib/utils')return{cn:(...args)=>args.filter(Boolean).join(' ')};
    if(name==='react-i18next')return{useTranslation:()=>({t:value=>value})};
    if(name==='@/dashboard/assets')return{PDFImage:'/synthetic-pdf-icon.png'};
    return new Proxy({}, {get:(_target,key)=>String(key)});
  };
  const source=fs.readFileSync('dashboard/components/form/image-upload.tsx','utf8');
  const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
  const compiledModule={exports:{}};
  vm.runInNewContext(compiled,{module:compiledModule,exports:compiledModule.exports,require:requireModule,FormData,File,FileReader:class{readAsDataURL(){}},console,Error});
  const props={name:'fileId',label:'Image',accept:'*',onChange:(...args)=>changes.push(args)};
  const tree=compiledModule.exports.ImageUpload(props);
  const find=(node,predicate)=>{if(!node||typeof node!=='object')return undefined;if(predicate(node))return node;for(const child of [node.props?.children].flat(Infinity)){const found=find(child,predicate);if(found)return found;}};
  const input=find(tree,node=>node.type==='input'&&node.props.type==='file');
  if(!input)throw Error('Actual ImageUpload input missing');
  const target={files:[new File([bytes],type==='application/pdf'?'sample.pdf':'sample.png',{type})],value:'selected'};
  await input.props.onChange({target});
  cursor=0;
  const updated=compiledModule.exports.ImageUpload(props);
  return{fields,changes,state,inputReset:target.value,preview:find(updated,node=>node.type==='img'),pdfPreview:find(updated,node=>node.type==='iframe')};
}
