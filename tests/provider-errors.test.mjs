import test from 'node:test';
import assert from 'node:assert/strict';
const provider=await import('../src/lib/provider-error.ts').catch(e=>{if(e.code==='ERR_MODULE_NOT_FOUND')return {};throw e;});
const read=()=>{assert.equal(typeof provider.readProviderJson,'function');return provider.readProviderJson;};
test('quota errors are safe, structured and preserve a bounded retry delay',async()=>{
  const parse=read();
  await assert.rejects(parse(Response.json({error:{message:'Quota exceeded secret-token',type:'usage_limit'}},{status:429,headers:{'Retry-After':'60'}}),'Sightengine'),e=>e.status===429&&e.code==='PROVIDER_LIMIT_REACHED'&&e.retryAfter==='60'&&!e.message.includes('secret-token'));
  await assert.rejects(parse(Response.json({status:'failure',error:{type:'usage_limit',message:'Monthly limit reached'}}),'Sightengine'),e=>e.status===429);
  await assert.rejects(parse(new Response('rate limited',{status:429}),'Sightengine'),e=>e.status===429&&e.code==='PROVIDER_LIMIT_REACHED');
});
test('provider configuration, failures and malformed JSON cannot become real verdicts',async()=>{
  const parse=read();
  for(const status of [401,403,404,500,503])await assert.rejects(parse(Response.json({error:'private upstream detail'},{status}),'Hugging Face'),e=>e.status===503&&!e.message.includes('private upstream'));
  await assert.rejects(parse(new Response('not json'),'Hugging Face'),e=>e.status===502);
  const data=await parse(Response.json([{label:'Real',score:.9}]),'Hugging Face');assert.equal(data[0].score,.9);
});
test('successful empty search results are not falsely treated as quota errors',async()=>{
  const parse=read();const data=await parse(Response.json({search_metadata:{status:'Success'},error:'Google has returned no results for this query'}),'SerpApi');
  assert.equal(data.search_metadata.status,'Success');
});
