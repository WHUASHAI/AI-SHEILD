import assert from 'node:assert/strict';
import test from 'node:test';

const stats = await import('../src/lib/platform-statistics.ts').catch(error => {
  if (error.code === 'ERR_MODULE_NOT_FOUND') return {};
  throw error;
});
function implementation(name) { assert.equal(typeof stats[name], 'function'); return stats[name]; }

test('classifies real detector outcomes without treating plagiarism or inconclusive as human', () => {
  const classify = implementation('classifyScanResult');
  for (const result of ['ai_generated', 'ai_edited', 'ai_enhanced', 'deepfake', 'Likely AI-Generated']) assert.equal(classify(result), 'ai');
  for (const result of ['human', 'Likely Human-Created']) assert.equal(classify(result), 'human');
  for (const result of ['inconclusive', 'mixed', 'Likely Original', undefined]) assert.equal(classify(result), 'other');
});

test('summarizes all users, calendar month, and a complete seven-day activity window in UTC', () => {
  const summary = implementation('summarizeStatistics')([
    { day: new Date('2026-09-30T00:00:00Z'), totalScans: 10, aiDetected: 4, humanVerified: 6 },
    { day: new Date('2026-10-01T00:00:00Z'), totalScans: 5, aiDetected: 1, humanVerified: 3 },
    { day: new Date('2026-10-21T00:00:00Z'), totalScans: 3, aiDetected: 2, humanVerified: 0 },
    { day: new Date('2026-10-22T00:00:00Z'), totalScans: 2, aiDetected: 0, humanVerified: 1 },
    { day: new Date('2026-11-01T00:00:00Z'), totalScans: 99, aiDetected: 99, humanVerified: 0 },
  ], new Date('2026-10-22T23:59:59Z'));
  assert.equal(summary.totalScans, 20);
  assert.equal(summary.aiDetected, 7);
  assert.equal(summary.humanVerified, 10);
  assert.equal(summary.scansThisMonth, 10);
  assert.equal(summary.scansThisWeek, 5);
  assert.deepEqual(summary.activity.map(day => day.scans), [0, 0, 0, 0, 0, 3, 2]);
  assert.equal(summary.activity[0].date, '2026-10-16');
  assert.equal(summary.activity[6].date, '2026-10-22');
});

test('empty database is a real zero and month counts reset at UTC year boundaries', () => {
  const summarize = implementation('summarizeStatistics');
  const empty = summarize([], new Date('2027-01-01T00:00:00Z'));
  assert.equal(empty.totalScans, 0);
  assert.equal(empty.scansThisMonth, 0);
  assert.equal(empty.activity.length, 7);
  const result = summarize([
    { day: new Date('2026-12-31'), totalScans: 4, aiDetected: 1, humanVerified: 2 },
    { day: new Date('2027-01-01'), totalScans: 1, aiDetected: 0, humanVerified: 1 },
  ], new Date('2027-01-01T00:00:00Z'));
  assert.equal(result.totalScans, 5);
  assert.equal(result.scansThisMonth, 1);
});

test('recording skips demos and uses one atomic daily increment for each real completion', async () => {
  const increments = [];
  const service = implementation('createPlatformStatistics')({
    increment: async (...args) => increments.push(args), readDays: async () => [],
  }, () => new Date('2026-10-22T19:15:00Z'));
  assert.equal(await service.record({ result: 'human', isReal: false }), false);
  assert.equal(increments.length, 0);
  assert.equal(await service.record({ result: 'deepfake', isReal: true }), true);
  assert.equal(await service.record({ result: 'Likely Original', isReal: true }), true);
  assert.equal(increments[0][0].toISOString(), '2026-10-22T00:00:00.000Z');
  assert.equal(increments[0][1], 'ai');
  assert.equal(increments[1][1], 'other');
});

test('database read failures are reported as unavailable rather than fabricated zeroes', async () => {
  const service = implementation('createPlatformStatistics')({
    increment: async () => {}, readDays: async () => { throw new Error('Database unavailable'); },
  });
  await assert.rejects(service.read(), /Database unavailable/);
});
