import assert from 'node:assert/strict';
import test from 'node:test';

const history = await import('../src/lib/scan-history-store.ts').catch(error => {
  if (error.code === 'ERR_MODULE_NOT_FOUND') return {};
  throw error;
});
function create(storage) {
  assert.equal(typeof history.createScanHistoryStore, 'function');
  return history.createScanHistoryStore(storage);
}
function storage() {
  const values = new Map();
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
}
const scan = id => ({ id: String(id), name: `${id}.txt`, type: 'text', result: 'Inconclusive', confidence: 50, date: 'Just now', status: 'completed' });

test('guest history keeps only the latest 20 scans without persisting them', () => {
  const disk = storage();
  const store = create(disk);
  for (let id = 1; id <= 25; id++) store.add(null, scan(id));
  assert.equal(store.read(null).length, 20);
  assert.equal(store.read(null)[0].id, '25');
  assert.equal(store.read(null)[19].id, '6');
  assert.equal(disk.getItem('aishield_guest_scans'), null);
});

test('guest history survives client navigation but is empty in a refreshed document', () => {
  const disk = storage();
  const documentStore = create(disk);
  documentStore.add(null, scan(1));
  assert.equal(documentStore.read(null)[0].id, '1');
  assert.equal(documentStore.read(null), documentStore.read(null));
  assert.deepEqual(create(disk).read(null), []);
});

test('Google history survives refresh and reopening with the same account', () => {
  const disk = storage();
  const firstVisit = create(disk);
  for (let id = 1; id <= 23; id++) firstVisit.add('google:123', scan(id));
  const reopenedVisit = create(disk);
  assert.equal(reopenedVisit.read('google:123').length, 20);
  assert.equal(reopenedVisit.read('google:123')[0].id, '23');
  assert.equal(reopenedVisit.read('google:123')[19].id, '4');
});

test('guest and different Google account histories stay separate', () => {
  const store = create(storage());
  store.add(null, scan('guest'));
  store.add('google:one', scan('one'));
  store.add('google:two', scan('two'));
  assert.equal(store.read(null)[0].id, 'guest');
  assert.equal(store.read('google:one')[0].id, 'one');
  assert.equal(store.read('google:two')[0].id, 'two');
});

test('history loads existing account storage and ignores invalid stored data', () => {
  const disk = storage();
  disk.setItem('aishield_user_scans_google:123', JSON.stringify([scan(1)]));
  assert.equal(create(disk).read('google:123')[0].id, '1');
  disk.setItem('aishield_user_scans_google:123', 'broken JSON');
  assert.deepEqual(create(disk).read('google:123'), []);
});

test('subscribers update across views and clearing one account preserves others', () => {
  const disk = storage();
  const store = create(disk);
  let updates = 0;
  const unsubscribe = store.subscribe(() => updates++);
  store.add('google:one', scan(1));
  store.add('google:two', scan(2));
  store.clear('google:one');
  assert.equal(updates, 3);
  assert.deepEqual(create(disk).read('google:one'), []);
  assert.equal(create(disk).read('google:two')[0].id, '2');
  unsubscribe();
  store.clear(null);
  assert.equal(updates, 3);
});
