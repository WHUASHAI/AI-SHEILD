import test from 'node:test';
import assert from 'node:assert/strict';
import {load} from './history-loader.mjs';
import * as core from '../src/lib/history-core.ts';
const responseModule=load('src/lib/history-response.ts',{
  'next/server':{NextResponse:{json:(data,init)=>Response.json(data,init)}},
  './auth-settings':{getTrustedAuthOrigin:()=> 'https://shield.test',getGuestRequestOrigin:()=> 'https://shield.test'},'./history-core':core,
});

function responseForEnvironment(env) {
  const settings=load('src/lib/auth-settings.ts',{}, {process:{env}});
  const responses=load('src/lib/history-response.ts',{
    'next/server':{NextResponse:{json:(data,init)=>Response.json(data,init)}},
    './auth-settings':settings,'./history-core':core,
  });
  return {settings,responses};
}

test('local scan/history actions follow the actual loopback host and port instead of the configured OAuth address',()=>{
  const {settings,responses}=responseForEnvironment({NODE_ENV:'development',AUTH_URL:'http://localhost:3001'});
  for(const origin of ['http://localhost:3000','http://localhost:3002','http://127.0.0.1:3000','http://[::1]:3000']) {
    for(const path of ['/api/scan/deepfake','/api/history']) {
      const request=new Request(origin+path,{method:'POST',headers:{origin,host:new URL(origin).host}});
      assert.doesNotThrow(()=>responses.requireHistoryOrigin(request));
    }
  }
  assert.equal(settings.getTrustedAuthOrigin('http://localhost:3000/api/auth/signin'),'http://localhost:3001');
});

test('local actions still reject other origins, ports, missing origins, and forged non-loopback hosts',()=>{
  const {responses}=responseForEnvironment({NODE_ENV:'development',AUTH_URL:'http://localhost:3001'});
  for(const headers of [
    {host:'localhost:3000'},
    {host:'localhost:3000',origin:'null'},
    {host:'localhost:3000',origin:'http://localhost:3001'},
    {host:'localhost:3000',origin:'https://evil.test'},
    {host:'evil.test',origin:'http://evil.test'},
    {host:'localhost:3000',origin:'https://evil.test','x-forwarded-host':'evil.test','x-forwarded-proto':'https'},
  ]) assert.throws(()=>responses.requireHistoryOrigin(new Request('http://localhost:3000/api/scan/deepfake',{method:'POST',headers})),error=>error.status===403);
});

test('production scan/history actions keep the configured HTTPS origin behind a proxy and reject hostile origins',()=>{
  const {responses}=responseForEnvironment({NODE_ENV:'production',AUTH_URL:'https://elucid.test/api/auth'});
  assert.doesNotThrow(()=>responses.requireHistoryOrigin(new Request('http://localhost:3000/api/scan/deepfake',{
    method:'POST',headers:{origin:'https://elucid.test',host:'localhost:3000'},
  })));
  for(const origin of ['https://evil.test','http://localhost:3000','http://elucid.test','https://elucid.test.evil.test']) {
    assert.throws(()=>responses.requireHistoryOrigin(new Request('http://localhost:3000/api/scan/deepfake',{
      method:'POST',headers:{origin,host:new URL(origin).host,'x-forwarded-host':new URL(origin).host},
    })),error=>error.status===403);
  }
  for(const env of [{NODE_ENV:'production'},{NODE_ENV:'production',AUTH_URL:'http://localhost:3000'}]) {
    const {responses:invalid}=responseForEnvironment(env);
    assert.throws(()=>invalid.requireHistoryOrigin(new Request('http://localhost:3000/api/scan/deepfake',{
      method:'POST',headers:{origin:'http://localhost:3000',host:'localhost:3000'},
    })),error=>error.status===403);
  }
});
test('history responses are private and cross-origin mutations fail closed',()=>{
  const response=responseModule.privateJson({items:[]});assert.equal(response.headers.get('cache-control'),'private, no-store');
  assert.throws(()=>responseModule.requireHistoryOrigin(new Request('https://shield.test/api/history',{method:'DELETE'})),e=>e.status===403);
  assert.throws(()=>responseModule.requireHistoryOrigin(new Request('https://shield.test/api/history',{method:'DELETE',headers:{origin:'https://evil.test'}})),e=>e.status===403);
  assert.doesNotThrow(()=>responseModule.requireHistoryOrigin(new Request('https://shield.test/api/history',{method:'DELETE',headers:{origin:'https://shield.test'}})));
  const failure=responseModule.historyFailure(Error('secret connection url'));assert.equal(failure.status,503);
});
test('actual history handlers resolve identity on every read and deletion',async()=>{
  let ownerCalls=0;const owner={kind:'guest',id:'private'};const calls=[];
  const route=load('src/app/api/history/route.ts',{
    '@/lib/scan-owner':{resolveScanOwner:async()=>{ownerCalls++;return owner;}},
    '@/lib/scan-history-repository':{listScanHistory:async(o,c)=>{calls.push([o,c]);return {items:[],nextCursor:null};},deleteScanHistory:async o=>{calls.push([o]);return 1;}},
    '@/lib/history-response':responseModule,
  });
  const result=await route.GET(new Request('https://shield.test/api/history?cursor=next'));
  assert.equal((await result.json()).isGuest,true);assert.equal(calls[0][0],owner);assert.equal(calls[0][1],'next');
  assert.equal((await route.DELETE(new Request('https://shield.test/api/history',{method:'DELETE',headers:{origin:'https://evil.test'}}))).status,403);
  assert.equal(ownerCalls,1);
  assert.equal((await route.DELETE(new Request('https://shield.test/api/history',{method:'DELETE',headers:{origin:'https://shield.test'}}))).status,200);assert.equal(ownerCalls,2);
});
test('scan owner requires private token and keeps selected guest separate from a signed-in account',async()=>{
  let token,guest='1',authCalls=0;const writes=[];
  const ownerModule=load('src/lib/scan-owner.ts',{
    'next/headers':{cookies:async()=>({get:name=>({value:name==='aishield_guest_mode'?guest:token}),set:(...args)=>writes.push(args)})},
    './auth':{auth:async()=>{authCalls++;return {user:{id:'credentials:u'}};}},
    './auth-db':{getAuthDatabase:()=>({})},'./history-account':{resolveAccountIdentity:async()=> 'u'},
    './history-core':core,'./guest-mode':{GUEST_COOKIE_NAME:'aishield_guest_mode',isGuestCookie:v=>v==='1'},
  });
  await assert.rejects(ownerModule.resolveScanOwner(),e=>e.status===401);
  token=core.newGuestToken();assert.equal((await ownerModule.resolveScanOwner()).id,core.guestTokenHash(token));assert.equal(authCalls,0);assert.equal(writes[0][2].httpOnly,true);
  guest='';assert.equal((await ownerModule.resolveScanOwner()).kind,'user');assert.equal(authCalls,1);
});
