import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
import vm from 'node:vm';
import * as historyCore from '../src/lib/history-core.ts';
import * as nodeCrypto from 'node:crypto';
import * as providerErrors from '../src/lib/provider-error.ts';
import {load as loadHelper} from './history-loader.mjs';
const sightengine=loadHelper('src/lib/sightengine.ts',{'./provider-error':providerErrors});

const require = createRequire(import.meta.url);
const ts = require('typescript');
const zod = require('zod');
function load(filename, modules, extra = {}) {
  const exports = {};
  const { outputText } = ts.transpileModule(readFileSync(filename, 'utf8'), {
    fileName: filename, compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  vm.runInNewContext(outputText, { exports, URL, URLSearchParams, File, FormData, Blob, Buffer,
    console: { error() {}, warn() {} }, setTimeout: callback => { callback(); },
    require(id) { assert.ok(id in modules, `Unexpected dependency: ${id}`); return modules[id]; }, ...extra,
  });
  return exports;
}

function scanRoute(kind, { fail = false, mock = false, human = false, quota=false, flat=false, invalid=false, partial=false, invalidImage=false } = {}) {
  const records = [];
  let providerCalls=0,externalCalls=0;
  const image = { status: 'success', request: { id: 'provider-id', timestamp: 1, operations: 1 },
    type: { ai_generated: human ? 0.01 : 0.95, photo: human ? 0.99 : 0.01, illustration: 0, other: 0 },
    faces: [{ id: 1, deepfake: human ? 0.01 : 0.95 }] };
  const provider = async () => {providerCalls++;if(quota||(partial&&providerCalls===2))throw new providerErrors.ProviderError('Sightengine usage limit reached.',429,'PROVIDER_LIMIT_REACHED');return invalidImage?{status:'success',type:{}}:fail?{status:'failure',error:{message:'Unavailable'}}:image;};
  const route = load(`src/app/api/scan/${kind}/route.ts`, {
    'next/server': { NextResponse: { json: (data, init) => Response.json(data, init) } },
    '@/lib/require-session': { requireSessionResponse: async () => null },
    '@/lib/provider-error': providerErrors,
    '@/lib/provider-response': load('src/lib/provider-response.ts',{'next/server':{NextResponse:{json:(data,init)=>Response.json(data,init)}},'./provider-error':providerErrors}),
    '@/lib/with-scan-history': load('src/lib/with-scan-history.ts', {
      'node:crypto': nodeCrypto,
      './history-core': historyCore,
      './scan-owner': { resolveScanOwner: async () => ({kind:'guest',id:'fixture-owner'}) },
      './scan-persistence': {findCompletedScan:async()=>null,completeScan:async input=>{
        records.push({result:input.module==='plagiarism'?'inconclusive':input.response.result,isReal:input.isReal});
        return {scanId:'saved-fixture'};
      }},
      './history-response': {requireHistoryOrigin(){},privateJson:(data,status=200)=>Response.json(data,{status}),historyFailure:error=>Response.json({error:error.message},{status:error.status||503})},
    }),
    '@/lib/sightengine': { ...sightengine, checkImageUrl: provider, checkImageFile: provider,
      checkVideoUrl: async () => {providerCalls++;if(quota)throw new providerErrors.ProviderError('Sightengine usage limit reached.',429,'PROVIDER_LIMIT_REACHED');return fail ? { status: 'failure' } : {
        status: 'success', data: { frames: [{ info: { ts: 0 }, type: image.type, faces: image.faces }] },
      };} },
    zod, franc: { franc: () => 'eng' },
  }, {
    process: { env: { SIGHTENGINE_API_USER: 'synthetic-id', SIGHTENGINE_API_SECRET: 'synthetic-secret',
      HUGGINGFACE_API_KEY: mock ? '' : 'synthetic-hf-key', SERP_API_KEY: 'synthetic-search-key' } },
    fetch: async url => {
      externalCalls++;
      if(quota)return Response.json({error:'Your account has run out of searches.'},{status:429});
      if (fail) return new Response(null, { status: 502 });
      if (String(url).includes('huggingface')) {const scores=invalid?[{label:'POSITIVE',score:.9}]:[{label:'Fake',score:human?.01:.99},{label:'Real',score:human?.99:.01}];return Response.json(flat?scores:[scores]);}
      return Response.json({ organic_results: [] });
    },
  });
  return { records,get providerCalls(){return providerCalls;},get externalCalls(){return externalCalls;}, post: () => route.POST(new Request('https://shield.test/api/scan/' + kind, {
    method: 'POST', headers: { 'content-type': 'application/json', 'Idempotency-Key':'3f3ba00f-2b0d-438c-90d6-4541bff0fb24' },
    body: JSON.stringify({ url: 'https://media.test/image.jpg', text: 'This is a substantial original sentence with enough words and characters for the plagiarism sampling procedure.' }),
  })) };
}

for (const kind of ['text', 'image', 'video', 'deepfake', 'plagiarism']) test(`${kind} records exactly one completed provider-backed analysis`, async () => {
  const route = scanRoute(kind);
  const response = await route.post();
  assert.equal(response.status, 200);
  assert.equal((await response.json()).statisticsRecorded, true);
  assert.equal(route.records.length, 1);
  assert.equal(route.records[0].isReal, true);
  if (kind === 'plagiarism') assert.equal(route.records[0].result, 'inconclusive');
});

for (const kind of ['image', 'video', 'deepfake', 'plagiarism']) test(`${kind} provider failures do not increase platform totals`, async () => {
  const route = scanRoute(kind, { fail: true });
  assert.ok((await route.post()).status >= 400);
  assert.equal(route.records.length, 0);
});

test('missing text credentials fail without invented results or a platform scan', async () => {
  const route = scanRoute('text', { mock: true });
  const response=await route.post();
  assert.equal(response.status, 503);
  assert.equal((await response.json()).result,undefined);
  assert.equal(route.records.length, 0);
});

test('a failed text provider cannot return fabricated detector scores',async()=>{
  const route=scanRoute('text',{fail:true});const response=await route.post();
  assert.ok(response.status>=400);assert.equal((await response.json()).confidence,undefined);assert.equal(route.records.length,0);
});

test('detector-confirmed likely-human outcomes reach the global classifier', async () => {
  const route = scanRoute('image', { human: true });
  assert.equal((await route.post()).status, 200);
  assert.equal(route.records[0].result, 'human');
});

test('statistics endpoint reports outages instead of returning mock or zero totals', async () => {
  const route = load('src/app/api/statistics/route.ts', {
    'next/server': { NextResponse: { json: (data, init) => Response.json(data, init) } },
    '@/lib/scan-statistics': { readPlatformStatistics: async () => { throw new Error('Database unavailable'); } },
  });
  const response = await route.GET();
  assert.equal(response.status, 503);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.match((await response.json()).error, /unavailable/);
});

test('database adapter emits atomic parameterized daily increments and UTC date bounds', async () => {
  const writes = [], reads = [];
  class Database {
    async $executeRaw(strings, ...values) { writes.push({ sql: strings.join('?'), values }); }
    async $queryRaw(strings, ...values) { reads.push({ sql: strings.join('?'), values }); return []; }
  }
  const { statisticsRepository } = load('src/lib/statistics-db.ts', {
    './auth-db': {getAuthDatabase:()=>new Database()},
  });
  const day = new Date('2026-10-22T00:00:00Z');
  await Promise.all([statisticsRepository.increment(day, 'ai'), statisticsRepository.increment(day, 'human')]);
  assert.equal(writes.length, 2);
  assert.match(writes[0].sql, /ON CONFLICT \("day"\) DO UPDATE/);
  assert.match(writes[0].sql, /"totalScans" = "ScanStatisticsDay"\."totalScans" \+ 1/);
  assert.deepEqual(Array.from(writes[0].values), ['2026-10-22', 1, 0]);
  assert.deepEqual(Array.from(writes[1].values), ['2026-10-22', 0, 1]);
  await statisticsRepository.readDays(day);
  assert.deepEqual(Array.from(reads[0].values), ['2026-10-22']);
});

for(const kind of ['text','image','video','deepfake','plagiarism'])test(kind+' quota errors stay explicit and cannot become saved verdicts',async()=>{
  const route=scanRoute(kind,{quota:true});const response=await route.post();
  assert.equal(response.status,429);const body=await response.json();assert.equal(body.code,'PROVIDER_LIMIT_REACHED');assert.equal(body.result,undefined);assert.equal(route.records.length,0);
  assert.equal(route.providerCalls+route.externalCalls,1);
});
test('flat real text scores use one classifier call and no extra plagiarism search',async()=>{
 const route=scanRoute('text',{flat:true});const response=await route.post();assert.equal(response.status,200);const body=await response.json();
 assert.equal(body.sourceModel,null);assert.equal(body.isPlagiarized,undefined);assert.equal(body.signals.length,1);assert.equal(route.externalCalls,1);
 const invalid=scanRoute('text',{invalid:true});assert.equal((await invalid.post()).status,502);assert.equal(invalid.records.length,0);
});
test('optional image deepfake failure is disclosed rather than claimed authentic',async()=>{
 const route=scanRoute('image',{partial:true});const response=await route.post();assert.equal(response.status,200);const body=await response.json();assert.equal(body.deepfakeAnalyzed,false);assert.match(body.providerWarning,/unavailable/);assert.equal(route.providerCalls,2);
});

test('invalid primary image result cannot spend another model call',async()=>{const route=scanRoute('image',{invalidImage:true});assert.equal((await route.post()).status,502);assert.equal(route.providerCalls,1);assert.equal(route.records.length,0);});
