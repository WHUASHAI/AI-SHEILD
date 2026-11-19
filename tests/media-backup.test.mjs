import test from 'node:test';
import assert from 'node:assert/strict';
import { load } from './history-loader.mjs';
const core = load('src/lib/local-media-detector.ts', {});
const fallback = load('src/lib/detector-fallback.ts', {}, { TypeError });

test('media fallback validates both model classes and never turns missing scores into a verdict', () => {
  assert.equal(core.readMediaScore([{label:'REAL',score:.1},{label:'FAKE',score:.9}], 'image'), .9);
  assert.equal(core.readMediaScore([{label:'Deepfake',score:.2},{label:'Realism',score:.8}], 'deepfake'), .2);
  for (const output of [[], [{label:'FAKE',score:.9}], [{label:'FAKE',score:NaN},{label:'REAL',score:.1}],
    [{label:'FAKE',score:.9},{label:'FAKE',score:.1}], [{label:'FAKE',score:.9},{label:'REAL',score:.9}]]) {
    assert.throws(() => core.readMediaScore(output,'image'));
  }
});

test('local media output reflects real frame scores and does not invent faces, photo scores, history, or generator identity', () => {
  const image = core.localMediaResult('image',[{timestamp:0,ai:.8}],false);
  assert.equal(image.result,'ai_generated'); assert.equal(image.overallScore,80);
  assert.equal(image.breakdown.photo,null); assert.equal(image.breakdown.facesDetected,null);
  assert.equal(image.deepfakeAnalyzed,false); assert.equal(image.breakdown.deepfakeScore,null);
  assert.equal(image.historySaved,false); assert.equal(image.statisticsRecorded,false);
  assert.equal(image.sourceModel,undefined); assert.equal(image.mode,'local-backup');
  const deepfake = core.localMediaResult('deepfake',[{timestamp:0,deepfake:.1,faceCount:1}],false);
  assert.equal(deepfake.result,'human'); assert.equal(deepfake.label,'Lower Deepfake Signals');
  assert.equal(deepfake.overallScore,90); assert.equal(deepfake.faces.length,0);
  const video = core.localMediaResult('video',[
    {timestamp:2.5,ai:.9,deepfake:.1,faceCount:1},{timestamp:5,ai:.7,deepfake:.2,faceCount:1},{timestamp:7.5,ai:.8,deepfake:.3,faceCount:1},
  ],true);
  assert.equal(video.breakdown.totalFramesAnalyzed,3); assert.equal(video.breakdown.avgAiGeneratedScore,80);
  assert.equal(video.breakdown.avgDeepfakeScore,20); assert.equal(video.timeline[2].timestamp,7.5);
  assert.match(video.limitations.join(' '),/Only 3 frames/);
  for (const frames of [[], [{timestamp:0}], [{timestamp:-1,ai:.7,deepfake:.1}], [{timestamp:0,ai:NaN,deepfake:.1}]]) {
    assert.throws(() => core.localMediaResult('video',frames,true));
  }
  assert.throws(() => core.localMediaResult('image',[{timestamp:0,ai:.5},{timestamp:1,ai:.5}],false));
});

test('provider success is preserved and quota triggers one real local inference without another paid request', async () => {
  let now = 0, paid = 0, local = 0, switched = 0;
  const policy = fallback.createProviderCooldown(() => now);
  const primary = async () => { paid++; return Response.json({code:'PROVIDER_LIMIT_REACHED'},{status:429,headers:{'Retry-After':'2'}}); };
  const backup = async () => { local++; return core.localMediaResult('image',[{timestamp:0,ai:.9}],false); };
  const response = await fallback.submitWithDetectorBackup(primary,backup,policy,()=>{switched++;});
  assert.equal(response.status,200); assert.equal((await response.json()).mode,'local-backup');
  await fallback.submitWithDetectorBackup(primary,backup,policy);
  assert.equal(paid,1); assert.equal(local,2); assert.equal(switched,1);
  now=2001;
  const success=Response.json({provider:'Sightengine',historySaved:true});
  assert.equal(await fallback.submitWithDetectorBackup(async()=>success,backup,policy),success);
  assert.equal(local,2);
});

test('authentication, invalid input, operation conflicts, and unrelated limits do not invoke local fallback', async () => {
  for(const status of [400,401,403,404,409,413,415,422,429]) {
    const response=Response.json({code:status===429?'ACCOUNT_RATE_LIMIT':'INVALID_REQUEST'},{status});
    assert.equal(await fallback.submitWithDetectorBackup(async()=>response,()=>{throw Error('Backup should not run');},fallback.createProviderCooldown()),response);
  }
});

test('service outages can use backup but model failure and cancellation produce no invented success', async () => {
  for(const status of [402,502,503,504]) {
    let calls=0;
    const response=await fallback.submitWithDetectorBackup(async()=>Response.json({error:'Unavailable'},{status}),async()=>{calls++;return {mode:'local-backup'};},fallback.createProviderCooldown());
    assert.equal(response.status,200); assert.equal(calls,1);
  }
  await assert.rejects(()=>fallback.submitWithDetectorBackup(async()=>Response.json({},{status:429}),async()=>{throw Error('Model failed');},fallback.createProviderCooldown()),/Model failed/);
  await assert.rejects(()=>fallback.submitWithDetectorBackup(async()=>{throw Error('Analysis cancelled');},async()=>({}),fallback.createProviderCooldown()),/cancelled/);
  const cached=await fallback.submitWithDetectorBackup(async()=>{throw new TypeError('Failed to fetch');},async()=>({mode:'local-backup'}),fallback.createProviderCooldown());
  assert.equal((await cached.json()).mode,'local-backup');
});

function workerFixture({failure=false,invalid=false,noFaces=false}={}) {
  let listener; const messages=[],loads=[];
  class RawImage { rgb(){return this;} }
  load('src/workers/local-media.worker.ts',{
    '@huggingface/transformers':{RawImage,env:{backends:{onnx:{wasm:{}}}},pipeline:async(_task,id,options)=>{
      loads.push({id,options});
      return async()=>{if(failure)throw Error('Offline'); if(invalid)return [];
        return id===core.MEDIA_MODELS.image.id?[{label:'REAL',score:.1},{label:'FAKE',score:.9}]:[{label:'Realism',score:.2},{label:'Deepfake',score:.8}];
      };
    }},'../lib/local-media-detector':core,
  },{self:{addEventListener:(_name,fn)=>{listener=fn;},postMessage:message=>messages.push(message)}});
  return {messages,loads,run:(kind,count=1)=>listener({data:{id:'fixture',kind,isVideo:count>1||kind==='video',frames:Array.from({length:count},(_,i)=>({data:new Uint8Array(4),width:1,height:1,timestamp:i*2,faces:noFaces?[]:[{data:new Uint8Array(4),width:1,height:1,timestamp:i*2}]}))}})};
}

test('no-face media cannot be assigned a deepfake or authenticity verdict, and video still checks AI generation', async () => {
  const photo=workerFixture({noFaces:true}); await photo.run('deepfake');
  const result=photo.messages.at(-1).result;
  assert.equal(photo.loads.length,0); assert.equal(result.result,'inconclusive');
  assert.equal(result.overallScore,null); assert.equal(result.deepfakeAnalyzed,false);
  assert.equal(result.breakdown.deepfakeScore,null); assert.equal(result.breakdown.facesDetected,0);
  const video=workerFixture({noFaces:true}); await video.run('video',3);
  assert.equal(video.loads.length,1); assert.equal(video.messages.at(-1).result.result,'ai_generated');
  assert.equal(video.messages.at(-1).result.breakdown.avgDeepfakeScore,null);
});

test('media worker runs two pinned trained models for video, reuses them across frames, and covers every supplied frame', async () => {
  const worker=workerFixture(); await worker.run('video',3); await worker.run('image');
  assert.equal(worker.loads.length,2);
  for(const item of worker.loads){
    const config=Object.values(core.MEDIA_MODELS).find(model=>model.id===item.id);
    assert.equal(item.options.revision,config.revision); assert.equal(item.options.dtype,'q8'); assert.equal(item.options.device,'wasm');
  }
  const results=worker.messages.filter(message=>message.type==='result');
  assert.equal(results[0].result.breakdown.totalFramesAnalyzed,3);
  assert.equal(results[0].result.result,'deepfake');
  assert.equal(results[1].result.deepfakeAnalyzed,false);
});

test('media worker failures, malformed predictions, and empty input never produce a verdict', async () => {
  for(const options of [{failure:true},{invalid:true}]) {
    const worker=workerFixture(options); await worker.run('deepfake');
    assert.equal(worker.messages.at(-1).type,'error'); assert.equal(worker.messages.some(message=>message.type==='result'),false);
  }
  const empty=workerFixture(); await empty.run('video',0);
  assert.equal(empty.loads.length,0); assert.equal(empty.messages.at(-1).type,'error');
});
