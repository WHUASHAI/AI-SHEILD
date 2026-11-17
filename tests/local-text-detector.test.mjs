import test from 'node:test';
import assert from 'node:assert/strict';
import { load } from './history-loader.mjs';
import { francAll } from 'franc';

const core = load('src/lib/local-text-detector.ts', {});
const coverage = { wordCount: 250, language: 'eng', totalPassages: 2, totalTokens: 400 };

test('local detector rejects short/oversized input and cleans upstream prose formatting', () => {
  for (const value of [null, {}, 'x'.repeat(299), 'x'.repeat(50001), ' '.repeat(400)]) {
    assert.throws(() => core.validateLocalText(value));
  }
  assert.equal(core.cleanLocalText('# **Hello** [world](https://example.test) &amp; &#x41; &#66;\n```js\nignore();\n```\n> quote\n- prose'), 'Hello world & A B prose');
  assert.doesNotThrow(() => core.cleanLocalText('&#999999999; &#xD800;'));
});

const fiftyWords = 'I took my small dog to the park this morning and sat by the old pond while he ran on the grass. A child came to say hello and asked his name. We spoke for a while then went home to have a warm meal and rest in the sun.'.split(/\s+/).slice(0, 50).join(' ');
test('exactly 50 readable words are accepted even below the old 300-character limit; 49 are rejected', () => {
  assert.equal(core.localTextWordCount(fiftyWords), 50);
  assert.ok(fiftyWords.length < 300);
  assert.equal(core.validateLocalText(fiftyWords), fiftyWords);
  assert.throws(() => core.validateLocalText(fiftyWords.split(' ').slice(0, 49).join(' ')), /at least 50/);
  assert.throws(() => core.validateLocalText('```\n' + fiftyWords + '\n```'), /at least 50/);
});

test('passage sampling stays within token budget and includes beginning and end', () => {
  for (const size of [1, 383, 384, 385, 3000, 50000]) {
    const tokens = Array.from({ length: size }, (_, i) => i);
    const selected = core.selectTextPassages(tokens, 'quick');
    assert.ok(selected.passages.length <= 8);
    assert.ok(selected.passages.every(p => p.tokens.length > 0 && p.tokens.length <= 384));
    assert.equal(selected.passages[0].tokens[0], 0);
    assert.equal(selected.passages.at(-1).tokens.at(-1), size - 1);
    assert.equal(new Set(selected.passages.map(p => p.index)).size, selected.passages.length);
    if (size <= 8 * 384) assert.deepEqual(Array.from(selected.passages.flatMap(p => p.tokens)), tokens);
  }
});

test('thorough scans cover every token instead of silently limiting the document to eight passages', () => {
  const tokens = Array.from({ length: 5000 }, (_, i) => i);
  const selected = core.selectTextPassages(tokens);
  assert.ok(selected.passages.length > 8);
  assert.equal(selected.passages.length, selected.totalPassages);
  assert.deepEqual(Array.from(selected.passages.flatMap(p => p.tokens)), tokens);
  assert.ok(selected.passages.every(p => p.tokens.length <= 384));
});

test('local scores require both known labels and finite normalized probabilities', () => {
  assert.equal(core.readLocalAiScore([{ label: 'Human', score: .1 }, { label: 'AI', score: .9 }]), .9);
  for (const output of [null, [], [{ label: 'AI', score: .9 }], [{ label: 'LABEL_1', score: .9 }, { label: 'Human', score: .1 }],
    [{ label: 'AI', score: NaN }, { label: 'Human', score: .1 }], [{ label: 'AI', score: 2 }, { label: 'Human', score: -1 }],
    [{ label: 'AI', score: .9 }, { label: 'Human', score: .9 }]]) assert.throws(() => core.readLocalAiScore(output));
});

test('binary labels follow the higher model score; borderline and conflicting evidence retains a low-confidence warning', () => {
  const analyze = (a, b) => core.localTextResult({ ...coverage, passages: [{ index: 0, score: a, tokens: 200 }, { index: 1, score: b, tokens: 200 }] });
  assert.equal(analyze(.94, .96).result, 'Likely AI-Generated');
  assert.equal(analyze(.04, .06).result, 'Likely Human-Created');
  assert.equal(analyze(.4, .6).result, 'Likely AI-Generated');
  assert.equal(analyze(.4, .6).lowConfidence, true);
  assert.equal(analyze(.3, .4).result, 'Likely Human-Created');
  assert.equal(analyze(.3, .4).humanScore, 65);
  assert.equal(analyze(.3, .4).verdictScore, 65);
  const mixed = core.localTextResult({ ...coverage, passages: [{ index: 0, score: .99, tokens: 380 }, { index: 1, score: .01, tokens: 20 }] });
  assert.equal(mixed.overallScore, 94.1); assert.equal(mixed.result, 'Likely AI-Generated');
  assert.equal(mixed.lowConfidence, true);
  assert.equal(mixed.sourceModel, null); assert.equal(mixed.mode, 'local');
  assert.equal(mixed.aiProbabilityScore, undefined); assert.equal(mixed.confidence, undefined);
});

test('unsuitable input has no invented result; sampling coverage is explicit', () => {
  assert.throws(() => core.localTextResult({ wordCount: 50, language: 'und' }));
  assert.throws(() => core.localTextResult({ ...coverage, passages: [{ index: 0, score: NaN, tokens: 10 }] }));
  const sampled = core.localTextResult({ ...coverage, totalPassages: 20, totalTokens: 6000,
    passages: [{ index: 0, score: .95, tokens: 200 }, { index: 19, score: .95, tokens: 200 }] });
  assert.equal(sampled.lowConfidence, true); assert.equal(sampled.coverage.totalPassages, 20);
  assert.match(sampled.limitations.join(' '), /Only 2 of 20 passages/);
});

test('platform mentions are literal clues, not source attribution or evidence used to classify authorship', () => {
  assert.deepEqual(Array.from(core.findPlatformMentions('This compares ChatGPT, Claude and Gemini.')), ['ChatGPT', 'Claude', 'Gemini']);
  assert.equal(core.findPlatformMentions('claudette and a grokking exercise').length, 0);
  const result = core.localTextResult({ ...coverage, platformMentions: ['ChatGPT'], passages: [{ index: 0, score: .01, tokens: 400, excerpt: 'A discussion about ChatGPT.' }] });
  assert.equal(result.sourceModel, null); assert.equal(result.result, 'Likely Human-Created');
  assert.equal(result.platformMentions[0], 'ChatGPT');
  assert.equal(result.overallScore + result.humanScore, 100);
  assert.equal(result.passages[0].excerpt, 'A discussion about ChatGPT.');
});

test('platform guesses use explicit self-identification or generation credits and expose their evidence', () => {
  const chatgpt = core.findPlatformClues('I’m ChatGPT, an AI assistant. Here is my answer.');
  assert.equal(chatgpt.length, 1); assert.equal(chatgpt[0].platform, 'ChatGPT');
  assert.equal(chatgpt[0].kind, 'self-identification');
  assert.match(chatgpt[0].excerpt, /ChatGPT/);
  const deepseek = core.findPlatformClues('This summary was generated using DeepSeek.');
  assert.equal(deepseek.length, 1); assert.equal(deepseek[0].platform, 'DeepSeek');
  assert.equal(deepseek[0].kind, 'source-credit');
});

test('ordinary brand mentions, generic AI phrasing, negations, and questions do not become platform guesses', () => {
  for (const text of ['I compared ChatGPT, Claude, and DeepSeek.', 'As an AI language model, I can help.',
    'This was not generated by DeepSeek.', 'Was this written by ChatGPT?', 'I am not ChatGPT.', "I'm Claude Monet, a painter."]) {
    assert.equal(core.findPlatformClues(text).length, 0, text);
  }
});

test('conflicting platform claims stay separate and never alter model scores or verified sourceModel', () => {
  const clues = core.findPlatformClues('This was generated by ChatGPT. This was written by DeepSeek.');
  assert.equal(clues.length, 2);
  const result = core.localTextResult({ ...coverage, platformClues: clues,
    passages: [{ index: 0, score: .91, tokens: 400 }] });
  assert.equal(result.overallScore, 91); assert.equal(result.sourceModel, null);
  assert.equal(result.platformClues.length, 2);
});

function workerFixture({ language = 'eng', fail = false, invalid = false, realLanguage = false, sourceFailure = false, human = false } = {}) {
  const messages = [], loads = [], calls = [], sourceCalls = [];
  let listener;
  const detector = async (excerpt, options) => {
    calls.push({ excerpt, options });
    if (fail) throw new Error('Runtime failed');
    return invalid ? [{ label: 'AI', score: .9 }] : [{ label: 'AI', score: human ? .01 : .91 }, { label: 'Human', score: human ? .99 : .09 }];
  };
  detector.tokenizer = { encode: text => Array.from(text, (_, i) => i), decode: tokens => `Passage with ${tokens.length} tokens` };
  load('src/workers/local-text.worker.ts', {
    '@huggingface/transformers': { env: { backends: { onnx: { wasm: {} } } }, pipeline: async (...args) => { loads.push(args); return detector; } },
    franc: { francAll: realLanguage ? francAll : () => [[language, 1]] }, '../lib/local-text-detector': core,
    './compact-text-model': { COMPACT_TEXT_MODEL: 'compact-fixture', COMPACT_TEXT_REVISION: 'revision', loadCompactTextModel: async () => detector },
    './source-family-model': { estimateSourceFamily: async text => {
      sourceCalls.push(text);
      if (sourceFailure) throw new Error('Source model unavailable');
      return { family: 'openai', label: 'ChatGPT / OpenAI', method: 'trained-model-family', analyzedPassages: 1, totalPassages: 1, model: 'source-fixture' };
    } },
  }, { self: { addEventListener: (_, callback) => { listener = callback; }, postMessage: message => messages.push(message) } });
  return { messages, loads, calls, sourceCalls, run: (text, depth) => listener({ data: { id: 'scan-fixture', text, depth } }) };
}

const prose = 'I got to the station just after seven. The usual entrance was closed because a delivery truck had blocked the pavement. A woman carrying two shopping bags showed me the side door. Inside, a clerk explained that my train would arrive late, so I bought a sandwich and sat near the window. I had packed my notebook but forgotten a pen. Luckily the cafe had a box of spare pencils beside the counter. While waiting I wrote down a few questions for the afternoon meeting and checked the address again. It was a quiet morning until a school group arrived with their teachers. Their excited conversation made the room feel much smaller, and I moved outside to wait in the fresh air.';

test('worker reuses a pinned real-model pipeline and classifies bounded passages with no scan API', async () => {
  const f = workerFixture(); await f.run(prose); await f.run(prose);
  assert.equal(f.loads.length, 1);
  assert.equal(f.loads[0][1], core.LOCAL_TEXT_MODEL);
  assert.equal(f.loads[0][2].revision, core.LOCAL_TEXT_REVISION);
  assert.equal(f.loads[0][2].dtype, 'fp32');
  assert.ok(f.calls.length > 0); assert.ok(f.calls.every(call => call.options.top_k === 2));
  const result = f.messages.filter(message => message.type === 'result').at(-1).result;
  assert.equal(result.overallScore, 91); assert.equal(result.result, 'Likely AI-Generated');
  assert.ok(result.coverage.checkedTokens > 0);
  assert.equal(result.platformGuess.label, 'ChatGPT / OpenAI');
});

test('source-family failures preserve real AI scores and human results do not run the extra model', async () => {
  const failed = workerFixture({ sourceFailure: true }); await failed.run(prose);
  const result = failed.messages.at(-1).result;
  assert.equal(result.result, 'Likely AI-Generated'); assert.equal(result.overallScore, 91);
  assert.equal(result.platformGuess, undefined); assert.equal(result.platformGuessUnavailable, true);
  const human = workerFixture({ human: true }); await human.run(prose);
  assert.equal(human.sourceCalls.length, 0);
  assert.equal(human.messages.at(-1).result.result, 'Likely Human-Created');
});

test('worker skips model loading for unsupported language and repetition', async () => {
  const unsupported = workerFixture({ language: 'spa' }); await unsupported.run(prose);
  assert.equal(unsupported.loads.length, 0);
  assert.equal(unsupported.messages.at(-1).type, 'error');
  assert.match(unsupported.messages.at(-1).message, /English prose only/);
  const repeated = workerFixture(); await repeated.run('This is a repeated sentence. '.repeat(100));
  assert.equal(repeated.loads.length, 0); assert.equal(repeated.messages.at(-1).type, 'error');
});

test('worker classifies 50-word English with the real language checker, including a near-tied Scots prediction', async () => {
  const f = workerFixture({ realLanguage: true }); await f.run(fiftyWords);
  assert.equal(f.loads.length, 1); assert.ok(f.calls.length > 0);
  const result = f.messages.at(-1).result;
  assert.equal(result.result, 'Likely AI-Generated'); assert.equal(result.lowConfidence, true);
  assert.equal(result.wordCount, 50); assert.equal(result.overallScore, 91);
  assert.match(result.limitations.join(' '), /language check was ambiguous/);
  const short = workerFixture(); await short.run(fiftyWords.split(' ').slice(0, 49).join(' '));
  assert.equal(short.loads.length, 0); assert.equal(short.messages.at(-1).type, 'error');
});

test('runtime and malformed predictions cannot produce a local verdict', async () => {
  for (const options of [{ fail: true }, { invalid: true }]) {
    const f = workerFixture(options); await f.run(prose);
    assert.equal(f.messages.at(-1).type, 'error');
    assert.equal(f.messages.some(message => message.type === 'result'), false);
  }
});
