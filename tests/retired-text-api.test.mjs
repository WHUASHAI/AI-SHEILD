import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { load } from './history-loader.mjs';

test('the retired text API cannot spend credits, return fabricated results, or save unverified browser scores', async () => {
  let externalCalls = 0;
  const route = load('src/app/api/scan/text/route.ts', {
    'next/server': { NextResponse: { json: (data, init) => Response.json(data, init) } },
    '@/lib/require-session': { requireSessionResponse: async () => null },
  }, { fetch: async () => { externalCalls++; throw new Error('Paid calls are forbidden'); } });
  const response = await route.POST();
  const body = await response.json();
  assert.equal(response.status, 410); assert.equal(body.code, 'ON_DEVICE_TEXT_ONLY');
  assert.equal(body.result, undefined); assert.equal(body.confidence, undefined);
  assert.equal(body.scanId, undefined); assert.equal(externalCalls, 0);
  assert.match(response.headers.get('cache-control'), /no-store/);
});

test('retired text API still requires scanning access', async () => {
  const route = load('src/app/api/scan/text/route.ts', {
    'next/server': { NextResponse: { json: (data, init) => Response.json(data, init) } },
    '@/lib/require-session': { requireSessionResponse: async () => Response.json({ error: 'Sign in' }, { status: 401 }) },
  });
  assert.equal((await route.POST()).status, 401);
});

test('text page exposes only local analysis with no paid provider selector or request', () => {
  const page = readFileSync('src/app/(dashboard)/dashboard/text/page.tsx', 'utf8');
  assert.doesNotMatch(page, /Sapling|submitScan|\/api\/scan\/text|Mixed or Inconclusive|at least 100/);
  assert.match(page, /analyzeLocal\(text\)/);
  assert.match(page, /at least 50/);
});
