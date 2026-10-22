import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { load } from './history-loader.mjs';
import * as core from '../src/lib/history-core.ts';
function fixture({outage=false,replay=null}={}) {
  const records=[];let called=0;
  const persistence={findCompletedScan:async()=>replay,completeScan:async input=>{records.push(input);if(outage)throw Error('offline');return {scanId:'saved',snapshot:{result:'human'},replayed:false};}};
  const mod=existsSync('src/lib/with-scan-history.ts')?load('src/lib/with-scan-history.ts',{
    './scan-owner':{resolveScanOwner:async()=>({kind:'guest',id:'private-owner'})},
    './scan-persistence':persistence,'./history-core':core,
    './history-response':{requireHistoryOrigin:()=>{},privateJson:(data,status=200)=>Response.json(data,{status}),historyFailure:e=>Response.json({error:e.message},{status:e.status||503})},
  }):{};
  const req=()=>new Request('https://shield.test/api/scan/image',{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':'3f3ba00f-2b0d-438c-90d6-4541bff0fb24'},body:JSON.stringify({text:'private text'})});
  return {mod,records,req,get called(){return called;},analyze:async()=>{called++;return Response.json({result:'human',confidence:90,isReal:true});}};
}
for(const kind of ['text','image','video','deepfake','plagiarism'])test(`${kind}: wrapper saves the trusted completion under the resolved owner`,async()=>{
  const f=fixture();assert.equal(typeof f.mod.withScanHistory,'function');
  const response=await f.mod.withScanHistory(kind,f.analyze)(f.req());
  const result=await response.json();assert.equal(result.historySaved,true);assert.equal(result.scanId,'saved');assert.equal(f.records.length,1);assert.equal(f.records[0].owner.id,'private-owner');
  assert.equal(f.records[0].module,kind);assert.ok(!f.records[0].displayName.includes('private text'));
});
test('saved replay skips the provider; outages return explicit unsaved results',async()=>{
  const f=fixture({replay:{scanId:'existing',snapshot:{result:'human'}}});assert.equal(typeof f.mod.withScanHistory,'function');
  const response=await f.mod.withScanHistory('image',f.analyze)(f.req());assert.equal((await response.json()).scanId,'existing');assert.equal(f.called,0);
  const g=fixture({outage:true});const unsaved=await g.mod.withScanHistory('image',g.analyze)(g.req());
  const body=await unsaved.json();assert.equal(body.historySaved,false);assert.equal(body.statisticsRecorded,false);assert.equal(body.scanId,undefined);
});
test('provider errors and demos never enter persistence and missing keys are rejected',async()=>{
  const f=fixture();assert.equal(typeof f.mod.withScanHistory,'function');
  const error=await f.mod.withScanHistory('image',async()=>Response.json({error:'provider'},{status:502}))(f.req());assert.equal(error.status,502);assert.equal(f.records.length,0);
  const demo=await f.mod.withScanHistory('text',async()=>Response.json({result:'human',isReal:false}))(f.req());assert.equal((await demo.json()).isDemo,true);assert.equal(f.records.length,0);
  const req=f.req();req.headers.delete('Idempotency-Key');assert.equal((await f.mod.withScanHistory('text',f.analyze)(req)).status,400);
});
