import test from 'node:test';
import assert from 'node:assert/strict';
import { load } from './history-loader.mjs';

const { isDeepfakeDemoFile, createDeepfakeDemoResult } = load('src/lib/deepfake-demo.ts', {});

test('clear in a video filename selects the case-insensitive deepfake presentation preset', () => {
  for (const name of ['video-clear.mp4', 'CLEAR-example.webm', 'sample_clear.mov', 'unclear.mp4']) {
    assert.equal(isDeepfakeDemoFile({ name, type: 'video/mp4' }), true);
    const result = createDeepfakeDemoResult({ name, type: 'video/mp4' });
    assert.equal(result.overallScore, 100); assert.equal(result.breakdown.deepfakeScore, 100);
    assert.equal(result.result, 'deepfake'); assert.equal(result.isDemo, true);
    assert.equal(result.isReal, false); assert.equal(result.historySaved, false); assert.equal(result.statisticsRecorded, false);
    assert.equal(result.breakdown.totalFramesAnalyzed, 0); assert.equal(result.breakdown.facesDetected, null);
    assert.equal(result.signals.length, 0); assert.equal(result.faces.length, 0);
    assert.equal(result.label, 'Deepfake Detected'); assert.match(result.provider, /preset/i);
    assert.match(result.disclaimer, /preset value/i);
    assert.doesNotMatch([result.label,result.provider,result.disclaimer,...result.limitations].join(' '), /demo/i);
  }
});

test('normal filenames and images receive no demo override', () => {
  for (const file of [undefined, { name: 'sample.mp4', type: 'video/mp4' },
    { name: 'clear.jpg', type: 'image/jpeg' }, { name: 'clear.mp4', type: 'image/png' },
    { name: 'clear.txt', type: '' }]) {
    assert.equal(isDeepfakeDemoFile(file), false); assert.equal(createDeepfakeDemoResult(file), null);
  }
  assert.equal(isDeepfakeDemoFile({ name: 'video-clear.MP4', type: '' }), true);
});
