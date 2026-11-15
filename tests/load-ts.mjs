import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';

const nodeRequire = createRequire(path.join(process.cwd(), 'package.json'));
// Tests execute server-marked modules outside Next; production keeps its marker.
export function loadTs(file, overrides = {}) {
  const absolute = path.resolve(file);
  const source = fs.readFileSync(absolute, 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true, target: ts.ScriptTarget.ES2022 } }).outputText;
  const compiledModule = { exports: {} };
  const requireModule = name => {
    if (Object.hasOwn(overrides, name)) return overrides[name];
    if (name === 'server-only') return {};
    if (name.startsWith('@/') || name.startsWith('.')) {
      const target = name.startsWith('@/') ? path.resolve(name.slice(2)) : path.resolve(path.dirname(absolute), name);
      return loadTs(target.endsWith('.ts') ? target : target + '.ts', overrides);
    }
    return nodeRequire(name);
  };
  vm.runInNewContext(compiled, { module: compiledModule, exports: compiledModule.exports, require: requireModule, URL, atob, Buffer, Date, process, Headers, Request, Response, ReadableStream, TransformStream, AbortController, AbortSignal, setTimeout, clearTimeout, TextEncoder, TextDecoder, fetch, console }, { filename: absolute });
  return compiledModule.exports;
}
