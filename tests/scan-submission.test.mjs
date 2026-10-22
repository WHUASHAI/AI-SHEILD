import test from 'node:test';
import assert from 'node:assert/strict';
import {load} from './history-loader.mjs';
test('a transport failure cannot automatically repeat a paid scan',async()=>{
  let calls=0;
  const moduleExports=load('src/lib/use-scan-submission.ts',{'react':{useCallback:fn=>fn,useState:()=>[null,()=>{}],useRef:value=>({current:value})}},
    {fetch:async()=>{calls++;throw Error('connection lost');},window:{dispatchEvent(){}},Headers,Event});
  const {submitScan}=moduleExports.useScanSubmission();
  await assert.rejects(submitScan('/api/scan/text',{method:'POST',body:'{}'}));assert.equal(calls,1);
});
