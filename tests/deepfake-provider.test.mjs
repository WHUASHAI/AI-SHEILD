import test from 'node:test';
import assert from 'node:assert/strict';
import { load } from './history-loader.mjs';
import * as providerErrors from '../src/lib/provider-error.ts';

const nextServer = { NextResponse: { json: (body, init) => Response.json(body, init) } };
const providerResponse = load('src/lib/provider-response.ts', {
  'next/server': nextServer, './provider-error': providerErrors,
});

// Match the documented Sightengine schema, which has no `faces` array:
// https://sightengine.com/docs/deepfake-detection
const prediction = score => ({ status: 'success', type: { deepfake: score } });

function fixture(outputs, { authenticated = true } = {}) {
  const calls = [];
  const client = load('src/lib/sightengine.ts', { './provider-error': providerErrors }, {
    process: { env: { SIGHTENGINE_API_USER: 'fixture-user', SIGHTENGINE_API_SECRET: 'fixture-secret' } },
    fetch: async (url, init) => {
      calls.push({ url, init });
      assert.ok(calls.length <= outputs.length, 'Unexpected extra provider request');
      const output = outputs[calls.length - 1];
      return output instanceof Response ? output : Response.json(output);
    },
  });
  const route = load('src/app/api/scan/deepfake/route.ts', {
    'next/server': nextServer,
    '@/lib/require-session': { requireSessionResponse: async () => authenticated ? null : Response.json({ error: 'Sign in' }, { status: 401 }) },
    '@/lib/with-scan-history': { withScanHistory: (_kind, analyze) => analyze },
    '@/lib/sightengine': client,
    '@/lib/provider-response': providerResponse,
  });
  return { calls, post: body => route.POST(new Request('https://elucid.test/api/scan/deepfake', {
    method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body),
    ...(body instanceof FormData ? {} : { headers: { 'content-type': 'application/json' } }),
  })) };
}

function frames(count = 3) {
  const body = new FormData(); body.set('isFrames', 'true');
  for (let index = 0; index < count; index++) {
    body.append(`frame_${index}`, new File(['decoded-frame-pixels'], `frame_${index}.jpg`, { type: 'image/jpeg' }));
    body.set(`timestamp_${index}`, String((index + 1) * 2.5));
  }
  return body;
}

test('video frames consume real type.deepfake scores without requiring a faces array', async () => {
  const f = fixture([prediction(.1), prediction(.93), prediction(.2)]);
  const response = await f.post(frames());
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.result, 'deepfake'); assert.equal(result.overallScore, 93);
  assert.equal(result.breakdown.deepfakeScore, 93); assert.equal(result.breakdown.totalFramesAnalyzed, 3);
  assert.equal(result.breakdown.facesDetected, null); assert.deepEqual(result.faces, []);
  assert.equal(result.signals.length, 1); assert.match(result.signals[0].description, /highest/i);
  assert.doesNotMatch(JSON.stringify(result.signals), /lip.sync/i);
  assert.deepEqual(result.timeline.map(frame => frame.timestamp), [2.5, 5, 7.5]);
  assert.deepEqual(result.timeline.map(frame => frame.deepfakeScore), [10, 93, 20]);
  assert.equal(f.calls.length, 3);
  for (const call of f.calls) {
    assert.equal(call.init.body.get('models'), 'deepfake');
    assert.equal(call.init.body.get('media').size, new Blob(['decoded-frame-pixels']).size);
  }
});

test('valid zero and low deepfake scores are not misreported as missing faces', async () => {
  const f = fixture([prediction(0), prediction(.02), prediction(.1)]);
  const response = await f.post(frames()); assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.result, 'human'); assert.equal(result.breakdown.deepfakeScore, 10);
  assert.doesNotMatch(result.label, /no faces/i); assert.equal(result.breakdown.facesDetected, null);
});

test('image upload and image URL use the same documented deepfake score', async () => {
  const body = new FormData(); body.set('file', new File(['photo'], 'face.jpg', { type: 'image/jpeg' }));
  for (const input of [body, { url: 'https://media.test/face.jpg' }]) {
    const f = fixture([prediction(.86)]); const response = await f.post(input);
    assert.equal(response.status, 200); const result = await response.json();
    assert.equal(result.result, 'deepfake'); assert.equal(result.breakdown.deepfakeScore, 86);
    assert.equal(result.isVideo, false); assert.equal(result.breakdown.facesDetected, null);
  }
});

test('classification uses unrounded scores at the 0.5 boundary', async () => {
  for (const score of [.499, .5]) {
    const f = fixture([prediction(score)]);
    const result = await (await f.post(frames(1))).json();
    assert.equal(result.result, score < .5 ? 'human' : 'deepfake');
    assert.equal(result.signals[0].score, score);
  }
});

test('missing, invalid, or legacy-only scores cannot become no-face or authentic verdicts', async () => {
  for (const output of [
    { status: 'success' }, { status: 'success', faces: [{ id: 1, deepfake: .99 }] },
    prediction(null), prediction('0.9'), prediction(-.1), prediction(1.1),
    { status: 'success', type: { deepfake: .9 }, error: { message: 'private upstream failure' } },
  ]) {
    const f = fixture([output]); const response = await f.post(frames());
    assert.ok(response.status >= 500); const body = await response.json();
    assert.equal(body.result, undefined); assert.doesNotMatch(body.error, /no faces|private upstream/i);
    assert.equal(f.calls.length, 1);
  }
});

test('a later quota failure stops remaining paid frame requests and returns no partial verdict', async () => {
  const f = fixture([prediction(.8), Response.json({ error: { type: 'usage_limit' } }, { status: 429 })]);
  const response = await f.post(frames()); assert.equal(response.status, 429);
  const body = await response.json(); assert.equal(body.code, 'PROVIDER_LIMIT_REACHED');
  assert.equal(body.result, undefined); assert.equal(f.calls.length, 2);
});

test('authentication and unusable frame submissions are rejected before provider requests', async () => {
  const denied = fixture([], { authenticated: false });
  assert.equal((await denied.post(frames())).status, 401); assert.equal(denied.calls.length, 0);
  for (const body of [frames(0), frames(9), (() => {
    const value = frames(1); value.set('frame_0', new File(['not an image'], 'bad.txt', { type: 'text/plain' })); return value;
  })(), (() => {
    const value = frames(1); value.set('timestamp_0', 'invalid'); return value;
  })(), (() => {
    const value = frames(1); value.delete('timestamp_0'); return value;
  })()]) {
    const f = fixture([]); assert.equal((await f.post(body)).status, 400); assert.equal(f.calls.length, 0);
  }
});
