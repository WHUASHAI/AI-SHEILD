import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { load } from './history-loader.mjs';

const references = JSON.parse(readFileSync('src/lib/plagiarism-references.json', 'utf8'));
const core = load('src/lib/local-plagiarism.ts', { './plagiarism-references.json': { default: references } });
const { submitWithDetectorBackup, createProviderCooldown } = load('src/lib/detector-fallback.ts', {}, { TypeError });
const passage = 'Silver herons crossed the quiet northern inlet before sunrise.';
const mixed = passage + ' Unexpected weather delayed travel.';
const quota = () => Response.json({ code: 'PROVIDER_LIMIT_REACHED' }, { status: 429 });

function backup(fetcher) {
  return load('src/lib/plagiarism-backup.ts', { './local-plagiarism': core, './detector-fallback': { createProviderCooldown } }, { fetch: fetcher, AbortSignal }).runPlagiarismBackup;
}

test('the bundled library supplies real matches after a double outage, without declaring other passages original', async () => {
  const run = backup(async () => { throw new TypeError('offline'); });
  const phrase = references[0].paragraphs[0].toUpperCase();
  const data = await run(phrase, 'standard', new AbortController().signal);
  assert.equal(data.searchedWikipedia, false);
  assert.equal(data.report.overlap, 100);
  assert.equal(data.report.matches[0].url, references[0].url);
  assert.equal(data.report.sourcesChecked.length, references.length);
  const unmatched = core.checkLocalPlagiarism(passage);
  assert.equal(unmatched.matchedWords, 0);
  assert.equal(unmatched.overlap, 0);
  assert.equal(unmatched.verdict, undefined);
  assert.equal(unmatched.historySaved, false);
  assert.equal(unmatched.statisticsRecorded, false);
});

test('counts overlapping phrases and duplicate sources once across the submitted text', () => {
  const other = { title: 'Second document', url: 'https://example.com', paragraphs: [passage] };
  const report = core.checkLocalPlagiarism(mixed, passage.toUpperCase().replace('QUIET', 'QUIET,'), [other]);
  assert.equal(report.matchedWords, 9);
  assert.equal(report.wordCount, 13);
  assert.equal(report.overlap, 69.2);
  assert.equal(report.matches.length, 2);
  assert.ok(report.matches.every(match => match.matchedWords === 9));
  assert.equal(core.checkLocalPlagiarism(mixed, 'Silver herons crossed the quiet but stormy inlet.').matchedWords, 0);
});

test('reads matching Wikipedia snippets, keeps the source link, and never treats search rank as evidence', async () => {
  const run = backup(async (url, options) => {
    const params = new URL(url).searchParams;
    assert.match(params.get('srsearch'), /"silver herons crossed the quiet northern"/);
    assert.equal(options.credentials, 'omit');
    return Response.json({ query: { search: [
      { pageid: 19, title: 'Birds', snippet: '<span class="searchmatch">Silver herons</span> crossed the quiet northern inlet before sunrise.' },
      { pageid: 23, title: 'Other page', snippet: 'Silver herons crossed the … quiet northern inlet before sunrise.' },
      { pageid: 42, title: 'Similar topic', snippet: 'Water birds sometimes visit this habitat during bad weather.' },
    ] } });
  });
  const output = await run(mixed, 'deep', new AbortController().signal);
  assert.equal(output.searchedWikipedia, true);
  assert.equal(output.report.overlap, 69.2);
  assert.equal(output.report.matches.length, 1);
  assert.equal(output.report.matches[0].url, 'https://en.wikipedia.org/?curid=19');
});

test('a quota switches only the affected provider to backup and never repeats its paid request', async () => {
  const search = createProviderCooldown(), media = createProviderCooldown();
  let primaryCalls = 0, publicCalls = 0, mediaCalls = 0;
  const run = backup(async () => { publicCalls++; return quota(); });
  for (let i = 0; i < 2; i++) {
    const response = await submitWithDetectorBackup(async () => { primaryCalls++; return quota(); },
      () => run(passage, 'standard', new AbortController().signal), search);
    assert.equal((await response.json()).report.mode, 'local-backup');
  }
  assert.equal(primaryCalls, 1);
  assert.equal(publicCalls, 1);
  const response = await submitWithDetectorBackup(async () => { mediaCalls++; return Response.json({ online: true }); },
    () => assert.fail('unexpected fallback'), media);
  assert.equal((await response.json()).online, true);
  assert.equal(mediaCalls, 1);
});

test('invalid documents and cancellation cannot become scored backups', async () => {
  const run = backup(() => assert.fail('unexpected request'));
  for (const input of ['too short', 'word '.repeat(10001), '%PDF-1.7 this contains binary document bytes please decode']) {
    await assert.rejects(run(input, 'standard', new AbortController().signal));
  }
  await assert.rejects(run(passage, 'standard', AbortSignal.abort()), { name: 'AbortError' });
});
