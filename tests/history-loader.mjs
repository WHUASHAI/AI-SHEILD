import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
const require = createRequire(import.meta.url);
const ts = require('typescript');
export function load(file, modules, globals = {}) {
  const exports = {};
  const result = ts.transpileModule(readFileSync(file,'utf8'), {fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}});
  vm.runInNewContext(result.outputText,{exports,Buffer,URL,URLSearchParams,Headers,Date,crypto,console,process,Response,Request,File,Blob,FormData,
    require(id) {if (id.startsWith('node:')) return require(id); if (!(id in modules)) throw new Error('Missing fixture '+id); return modules[id];},...globals});
  return exports;
}
