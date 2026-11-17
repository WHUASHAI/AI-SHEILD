import test from 'node:test';
import assert from 'node:assert/strict';
import { load } from './history-loader.mjs';
const {createLocalTextClient}=load('src/lib/local-text-client.ts',{}, {setTimeout,clearTimeout});
function fixture(timeout) {
 const workers=[],progress=[];
 const client=createLocalTextClient(()=>{const worker={terminated:false,postMessage(message){this.last=message;},terminate(){this.terminated=true;}};workers.push(worker);return worker;},message=>progress.push(message),timeout);
 const send=(worker,data)=>worker.onmessage?.({data:{id:worker.last.id,...data}});
 return {client,workers,progress,send};
}
test('text runtime failure destroys the failed worker and retries once with compact model, without changing input',async()=>{
 const f=fixture();const promise=f.client.analyze('same exact input','thorough');
 const first=f.workers[0];f.send(first,{type:'error',message:'Model failed',recoverable:true});
 assert.equal(first.terminated,true);assert.equal(first.onmessage,null);assert.equal(f.workers.length,2);
 assert.equal(f.workers[1].last.compact,true);assert.equal(f.workers[1].last.text,'same exact input');
 f.send(f.workers[1],{type:'result',result:{result:'Likely AI-Generated'}});
 assert.equal((await promise).result,'Likely AI-Generated');f.client.cancel();
});
test('both model failures reject instead of inventing a verdict; the next scan starts a clean worker',async()=>{
 const f=fixture();const promise=f.client.analyze('input','thorough');
 f.send(f.workers[0],{type:'error',message:'Initial failure',recoverable:true});
 f.send(f.workers[1],{type:'error',message:'Still offline',recoverable:true});
 await assert.rejects(promise,/Still offline/);assert.equal(f.workers.length,2);
 const retry=f.client.analyze('new input','thorough',true);assert.equal(f.workers.length,3);
 f.send(f.workers[2],{type:'result',result:{overallScore:32}});assert.equal((await retry).overallScore,32);f.client.cancel();
});
test('invalid input and cancellation never trigger another model, and concurrent scans are rejected',async()=>{
 const f=fixture();const first=f.client.analyze('input','thorough');
 await assert.rejects(()=>f.client.analyze('other','thorough'),/already running/);
 f.send(f.workers[0],{type:'error',message:'English only',recoverable:false});
 await assert.rejects(first,/English only/);assert.equal(f.workers.length,1);
 const cancelled=f.client.analyze('input','thorough');f.client.cancel();
 await assert.rejects(cancelled,/cancelled/);assert.equal(f.workers.length,2);
});
test('worker startup failures and timeouts use a bounded compact retry',async()=>{
 const f=fixture(10);const timed=f.client.analyze('input','thorough');
 await assert.rejects(timed,/timed out/);assert.equal(f.workers.length,2);
 let attempts=0;const broken=createLocalTextClient(()=>{attempts++;throw Error('Worker blocked');},()=>{});
 await assert.rejects(()=>broken.analyze('input','thorough'),/could not start/);assert.equal(attempts,2);
});
