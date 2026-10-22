import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

function check(env) {
  return spawnSync(process.execPath, ['scripts/check-auth.mjs'], {
    encoding: 'utf8', env: { SystemRoot: process.env.SystemRoot, ...env },
  });
}

test('deployment check reports missing Google credentials and fails without printing secrets', () => {
  const result = check({ NODE_ENV: 'production', AUTH_URL: 'https://shield.test' });
  assert.equal(result.status, 1);
  assert.match(result.stdout, /AUTH_SECRET/);
  assert.match(result.stdout, /AUTH_GOOGLE_ID/);
  assert.doesNotMatch(result.stdout, /facebook/i);
});

test('deployment check supports Google aliases and derives the production Vercel callback', () => {
  const result = check({
    NODE_ENV: 'production', VERCEL_PROJECT_PRODUCTION_URL: 'shield.vercel.app',
    AUTH_SECRET: 'synthetic-session-key-at-least-thirty-two-characters',
    GOOGLE_CLIENT_ID: 'synthetic-client.apps.googleusercontent.com', GOOGLE_CLIENT_SECRET: 'synthetic-provider-secret',
  });
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /https:\/\/shield.vercel.app\/api\/auth\/callback\/google/);
  assert.doesNotMatch(result.stdout, /synthetic|facebook/i);
});

test('production callback checks reject a localhost origin even when credentials are present', () => {
  const result = check({
    NODE_ENV: 'production', AUTH_URL: 'http://localhost:3000',
    AUTH_SECRET: 'synthetic-session-key-at-least-thirty-two-characters',
    AUTH_GOOGLE_ID: 'google-client', AUTH_GOOGLE_SECRET: 'google-secret',
  });
  assert.equal(result.status, 1);
  assert.match(result.stdout, /AUTH_URL/);
});
