import test from 'node:test';
import assert from 'node:assert/strict';
const mod=await import('../src/lib/history-client.ts').catch(e=>{if(e.code==='ERR_MODULE_NOT_FOUND')return {};throw e;});
test('fresh clients load server history and append pages beyond 20',async()=>{
  assert.equal(typeof mod.createHistoryClient,'function');
  let calls=0;const fetcher=async()=>Response.json({items:Array.from({length:++calls===1?20:5},(_,i)=>({id:String((calls-1)*20+i)})),nextCursor:calls===1?'next':null,isGuest:false});
  const client=mod.createHistoryClient(fetcher);await client.refresh();assert.equal(client.read().scans.length,20);
  await client.loadMore();assert.equal(client.read().scans.length,25);
  const nextDay=mod.createHistoryClient(async()=>Response.json({items:[{id:'persisted'}],nextCursor:null,isGuest:false}));
  await nextDay.refresh();assert.equal(nextDay.read().scans[0].id,'persisted');
});
test('load errors stay distinct from empty history and failed deletes preserve results',async()=>{
  assert.equal(typeof mod.createHistoryClient,'function');
  let failure=false;const client=mod.createHistoryClient(async()=>failure?Response.json({error:'offline'},{status:503}):Response.json({items:[{id:'saved'}],nextCursor:null,isGuest:true}));
  await client.refresh();failure=true;await assert.rejects(client.deleteScan('saved'));assert.equal(client.read().scans.length,1);assert.equal(client.read().error,'offline');
  await client.refresh();assert.equal(client.read().scans.length,0);assert.equal(client.read().error,'offline');assert.equal(client.read().loading,false);
});
test('a stale request cannot reveal the previous identity after refresh',async()=>{
  assert.equal(typeof mod.createHistoryClient,'function');
  let release;let calls=0;const client=mod.createHistoryClient(async()=>++calls===1?new Promise(r=>release=r):Response.json({items:[{id:'new-account'}],nextCursor:null,isGuest:false}));
  const previous=client.refresh();await client.refresh();release(Response.json({items:[{id:'old-account'}],nextCursor:null,isGuest:false}));await previous;
  assert.equal(client.read().scans[0].id,'new-account');
});
