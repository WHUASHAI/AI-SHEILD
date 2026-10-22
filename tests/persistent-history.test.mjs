import test from 'node:test';
import assert from 'node:assert/strict';

const core = await import('../src/lib/history-core.ts').catch(e => {
  if (e.code === 'ERR_MODULE_NOT_FOUND') return {};
  throw e;
});
const fn = name => { assert.equal(typeof core[name], 'function', name); return core[name]; };

test('guest tokens are random, private hashed identities and reject public mode flags', () => {
  const token = fn('newGuestToken')();
  assert.equal(token.length, 64);
  assert.notEqual(token, core.newGuestToken());
  assert.equal(core.guestTokenHash('1'), null);
  assert.equal(core.guestTokenHash(''), null);
  assert.equal(core.guestTokenHash(token).length, 64);
  assert.notEqual(core.guestTokenHash(token), token);
});

test('ownership filters reject missing or forged owner types', () => {
  assert.deepEqual(fn('ownerFilter')({kind:'user', id:'u1'}), {userId:'u1', guestSessionId:null});
  assert.deepEqual(core.ownerFilter({kind:'guest', id:'g1'}), {userId:null, guestSessionId:'g1'});
  assert.throws(() => core.ownerFilter({kind:'admin',id:'u1'}));
  assert.throws(() => core.ownerFilter({kind:'user',id:''}));
});

test('saved snapshots allow analysis summaries without raw text or source secrets', () => {
  const saved = fn('resultSnapshot')({result:'human', confidence:90, text:'private input',
    sources:[{url:'https://private.test/?token=secret', snippet:'private input'}],
    sentenceBreakdown:[{sentence:'private input'}], signals:[{name:'AI score',score:.1,description:'generic'}],
    breakdown:{aiGenerated:10}, statisticsRecorded:true, scanId:'old'});
  assert.equal(saved.result, 'human');
  assert.equal(saved.confidence, 90);
  assert.deepEqual(saved.breakdown, {aiGenerated:10});
  for (const key of ['text','sources','sentenceBreakdown','scanId','statisticsRecorded']) assert.equal(saved[key],undefined);
});

test('cursor encodes both timestamp and id and rejects corrupt values', () => {
  const row = {id:'scan2', createdAt:new Date('2026-10-22T00:00:00Z')};
  const cursor = fn('encodeHistoryCursor')(row);
  assert.deepEqual(core.decodeHistoryCursor(cursor), {id:row.id, createdAt:row.createdAt});
  assert.throws(() => core.decodeHistoryCursor('garbage'));
  assert.throws(() => core.decodeHistoryCursor('x'.repeat(1025)));
});

test('session subjects resolve by provider without trusting email or browser owner claims', () => {
  assert.deepEqual(fn('parseVerifiedSubject')('credentials:user-id'), {provider:'credentials', id:'user-id'});
  assert.deepEqual(core.parseVerifiedSubject('google:subject:extra'), {provider:'google',id:'subject:extra'});
  assert.throws(() => core.parseVerifiedSubject('demo:admin'));
  assert.throws(() => core.parseVerifiedSubject('google:'));
});

test('plagiarism replays retain numeric totals required by the real result view', () => {
  const snapshot=fn('resultSnapshot')({verdict:'Likely Original',overallSimilarity:0,totalSourcesChecked:130000000000,verdictColor:'green'});
  assert.equal(snapshot.totalSourcesChecked,130000000000);
  assert.doesNotThrow(()=>snapshot.totalSourcesChecked.toLocaleString());
  assert.equal(snapshot.verdictColor,'green');
});
