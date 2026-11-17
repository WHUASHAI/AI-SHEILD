import test from 'node:test';
import assert from 'node:assert/strict';
import { load } from './history-loader.mjs';
const source = load('src/lib/source-family.ts', {});

test('source windows fit the 256-token model context and cover beginning/middle/end', () => {
  for (const size of [1, 254, 255, 3000]) {
    const tokens = Array.from({ length: size }, (_, i) => i);
    const selected = source.sourceWindows(tokens);
    assert.ok(selected.windows.length <= 3);
    assert.ok(selected.windows.every(window => window.length > 0 && window.length <= 254));
    assert.equal(selected.windows[0][0], 0); assert.equal(selected.windows.at(-1).at(-1), size - 1);
  }
});

test('trimmed-vocabulary token mapping is applied and rejects invalid ids or maps', () => {
  const map = new Int32Array([0, 1, 2, 3, 100]);
  assert.deepEqual(Array.from(source.remapSourceIds([0, 4, 2], map)), [BigInt(0), BigInt(100), BigInt(2)]);
  for (const ids of [[-1], [5], [.5]]) assert.throws(() => source.remapSourceIds(ids, map));
  assert.throws(() => source.remapSourceIds([0], new Int32Array([-1])));
});

test('source probabilities use a stable five-class softmax and reject malformed logits', () => {
  const values = source.sourceProbabilities([1000, 1001, 999, 998, 997]);
  assert.ok(Math.abs(values.reduce((a, b) => a + b) - 1) < 1e-8);
  assert.equal(values.indexOf(Math.max(...values)), 1);
  for (const value of [[], [1, 2], [1, 2, 3, 4, NaN]]) assert.throws(() => source.sourceProbabilities(value));
});

test('family guesses use model evidence instead of platform mentions or a fixed brand', () => {
  for (const [probabilities, family] of [
    [[.1, .7, .1, .05, .05], 'openai'], [[.1, .1, .7, .05, .05], 'anthropic'],
    [[.1, .1, .05, .7, .05], 'google'], [[.1, .1, .05, .05, .7], 'other_ai'],
  ]) {
    const result = source.summarizeSourceFamily([{ probabilities, tokens: 100 }], 1);
    assert.equal(result.family, family); assert.equal(result.method, 'trained-model-family');
    assert.equal(result.confidence, undefined);
    assert.equal(result.candidates.length, 4);
    assert.equal(result.candidates[0].family, result.family);
    assert.ok(Math.abs(result.candidates.reduce((sum, candidate) => sum + candidate.score, 0) - 1) < 1e-8);
    assert.ok(result.candidates.every((candidate, index, all) => index === 0 || candidate.score <= all[index - 1].score));
    if (family === 'other_ai') assert.equal(result.label, 'Other AI family');
  }
  assert.throws(() => source.summarizeSourceFamily([], 0));
  assert.throws(() => source.summarizeSourceFamily([{ probabilities: [1, 0, 0, 0, 0], tokens: 10 }], 1));
});

test('source family follows weighted evidence and does not invent unsupported platform classes', () => {
  const result = source.summarizeSourceFamily([
    { probabilities: [.1, .6, .1, .1, .1], tokens: 10 },
    { probabilities: [.1, .1, .1, .6, .1], tokens: 90 },
  ], 2);
  assert.equal(result.candidates[0].family, 'google');
  assert.equal(result.candidates[0].label, 'Gemini / Google');
  for (const name of ['DeepSeek', 'Microsoft Copilot', 'Qwen', 'Poe']) {
    assert.equal(result.candidates.some(candidate => candidate.label === name), false);
  }
});
