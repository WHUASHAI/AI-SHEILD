import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { load } from './history-loader.mjs';
import * as core from '../src/lib/history-core.ts';
import * as statistics from '../src/lib/platform-statistics.ts';
function fixture() {
  const rows=[],receipts=new Map(); let counts=0,fail=false;
  const db = {scan:{create:async ({data})=>{const row={...data,id:'scan'+rows.length,createdAt:new Date()};rows.push(row);return row;},findFirst:async ({where})=>rows.find(r=>r.id===where.id&&r.userId===where.userId&&r.guestSessionId===where.guestSessionId)||null},
    scanCompletion:{findUnique:async ({where})=>receipts.get(where.id)||null,create:async ({data})=>{receipts.set(data.id,data);}},
    $executeRaw:async (sql)=>{if(String(sql).includes('ScanStatisticsDay')){if(fail)throw Error('db failure');counts++;}},
    async $transaction(run){const before=rows.length, previous=new Map(receipts);try{return await run(db);}catch(e){rows.splice(before);receipts.clear();for(const [k,v] of previous)receipts.set(k,v);throw e;}}};
  const mod = existsSync('src/lib/scan-persistence.ts') ? load('src/lib/scan-persistence.ts',{'./auth-db':{getAuthDatabase:()=>db},'./history-core':core,'./platform-statistics':statistics}) : {};
  return {mod,rows,receipts,get counts(){return counts;},set fail(v){fail=v;}};
}
const input={owner:{kind:'guest',id:'guest'},operationKey:'test-key',requestFingerprint:'fingerprint',module:'image',displayName:'Image scan',response:{result:'human',confidence:90},isReal:true};
test('completion stores history and counters once; deleted history does not recount',async()=>{
  const f=fixture();assert.equal(typeof f.mod.completeScan,'function');
  const one=await f.mod.completeScan(input);const two=await f.mod.completeScan(input);
  assert.equal(one.scanId,two.scanId);assert.equal(f.rows.length,1);assert.equal(f.counts,1);
  f.rows.splice(0);await assert.rejects(f.mod.completeScan(input),e=>e.status===410);assert.equal(f.counts,1);
});
test('conflicting retries reject and database outage rolls history and receipt back',async()=>{
  const f=fixture();assert.equal(typeof f.mod.completeScan,'function');
  await f.mod.completeScan(input);
  await assert.rejects(f.mod.completeScan({...input,requestFingerprint:'changed'}),e=>e.status===409);
  const g=fixture();g.fail=true;await assert.rejects(g.mod.completeScan(input));
  assert.equal(g.rows.length,0);assert.equal(g.receipts.size,0);assert.equal(g.counts,0);
});
test('demos are not persisted and new intentional operation is counted separately',async()=>{
  const f=fixture();assert.equal(typeof f.mod.completeScan,'function');
  assert.equal(await f.mod.completeScan({...input,isReal:false}),null);
  assert.equal(f.rows.length,0);await f.mod.completeScan(input);await f.mod.completeScan({...input,operationKey:'new-key'});
  assert.equal(f.rows.length,2);assert.equal(f.counts,2);
});
