import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { load } from './history-loader.mjs';
import * as core from '../src/lib/history-core.ts';
function fixture() {
  const rows=Array.from({length:25},(_,i)=>({id:String(100-i).padStart(3,'0'),userId:'u',guestSessionId:null,createdAt:new Date('2026-10-22'),contentType:'image',contentName:'Image',modules:['image'],result:'human',confidenceScore:90,status:'completed',resultSnapshot:{result:'human'}}));
  rows.push({...rows[0],id:'other',userId:'other'});
  const matches=(r,w)=>Object.entries(w).every(([k,v])=> k==='OR'?v.some(sub=>matches(r,sub)):v&&typeof v==='object'&&'lt'in v?r[k]<v.lt:r[k] instanceof Date&&v instanceof Date?r[k].getTime()===v.getTime():r[k]===v);
  const db={scan:{findMany:async({where,take})=>rows.filter(r=>matches(r,where)).slice(0,take),findFirst:async({where})=>rows.find(r=>matches(r,where))||null,deleteMany:async({where})=>{let count=0;for(let i=rows.length-1;i>=0;i--)if(matches(rows[i],where)){rows.splice(i,1);count++;}return {count};}}};
  const mod=existsSync('src/lib/scan-history-repository.ts')?load('src/lib/scan-history-repository.ts',{'./auth-db':{getAuthDatabase:()=>db},'./history-core':core}):{};
  return {mod,rows};
}
test('history paginates 20 records with equal timestamps and enforces ownership',async()=>{
  const {mod}=fixture();assert.equal(typeof mod.listScanHistory,'function');
  const first=await mod.listScanHistory({kind:'user',id:'u'});
  assert.equal(first.items.length,20);assert.ok(first.nextCursor);
  const second=await mod.listScanHistory({kind:'user',id:'u'},first.nextCursor);
  assert.equal(second.items.length,5);assert.equal(second.nextCursor,null);
  assert.equal(await mod.getScanHistory({kind:'user',id:'u'},'other'),null);
  assert.equal((await mod.listScanHistory({kind:'guest',id:'u'})).items.length,0);
});
test('clear and item delete affect only owned results',async()=>{
  const {mod,rows}=fixture();assert.equal(typeof mod.deleteScanHistory,'function');
  assert.equal(await mod.deleteScanHistory({kind:'user',id:'u'},'other'),0);
  assert.equal(await mod.deleteScanHistory({kind:'user',id:'u'}),25);
  assert.equal(rows.length,1);assert.equal(rows[0].userId,'other');
});
