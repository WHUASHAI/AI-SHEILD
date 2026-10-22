import test from 'node:test';
import assert from 'node:assert/strict';
const mod = await import('../src/lib/history-account.ts').catch(e => { if(e.code === 'ERR_MODULE_NOT_FOUND') return {}; throw e; });
test('credentials use stored IDs and missing accounts fail closed', async () => {
  assert.equal(typeof mod.resolveAccountIdentity,'function');
  const repo = {findUser:async id => id === 'stored' ? {id} : null};
  assert.equal(await mod.resolveAccountIdentity('credentials:stored', null, repo),'stored');
  await assert.rejects(mod.resolveAccountIdentity('credentials:missing',null,repo));
});
test('Google uses provider mapping and refuses automatic email linking', async () => {
  assert.equal(typeof mod.resolveAccountIdentity,'function');
  let created = 0;
  const repo = {findProvider:async () => ({userId:'internal'}), createGoogle:async () => {created++;return 'new';}};
  assert.equal(await mod.resolveAccountIdentity('google:provider', {email:'verified@example.test'},repo),'internal');
  assert.equal(created,0);
  repo.findProvider = async () => null;
  repo.createGoogle = async () => {throw new Error('Email belongs to another account');};
  await assert.rejects(mod.resolveAccountIdentity('google:provider',{email:'existing@example.test'},repo));
  await assert.rejects(mod.resolveAccountIdentity('google:provider',null,repo));
});
