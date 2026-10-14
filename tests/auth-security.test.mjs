import assert from 'node:assert/strict';
import test from 'node:test';
import { Auth, setEnvDefaults } from '@auth/core';
import { encode } from '@auth/core/jwt';
import { getAuthSessionSettings, getTrustedAuthOrigin } from '../src/lib/auth-settings.ts';

const strongSecret = 'synthetic-integration-secret-at-least-32-characters';
const placeholder = 'your-secret-here-min-32-chars';

function sessionConfig(env) {
  const config = {
    ...getAuthSessionSettings(env), providers: [], trustHost: true,
    basePath: '/api/auth', logger: { error() {}, warn() {}, debug() {} },
  };
  setEnvDefaults(env, config, true);
  return config;
}

async function readSession(config, secret) {
  const token = await encode({
    secret, salt: 'authjs.session-token',
    token: { sub: 'google:synthetic-user', name: 'Synthetic user' }, maxAge: 60,
  });
  const response = await Auth(new Request('http://localhost:3000/api/auth/session', {
    headers: { cookie: `authjs.session-token=${token}` },
  }), config);
  assert.equal(response.status, 200);
  return response.json();
}

test('invalid primary secrets fail before Auth.js can restore environment defaults', () => {
  for (const env of [
    {}, { AUTH_SECRET: placeholder },
    { NEXTAUTH_SECRET: placeholder },
    { AUTH_SECRET: '', AUTH_SECRET_1: placeholder },
    { NEXTAUTH_SECRET: strongSecret },
  ]) {
    assert.throws(() => sessionConfig(env), /Configure a strong AUTH_SECRET/);
  }
});

test('Auth.js authenticates with the validated primary key and rejects legacy placeholder keys', async () => {
  const config = sessionConfig({
    AUTH_SECRET: strongSecret, AUTH_SECRET_1: placeholder, NEXTAUTH_SECRET: placeholder,
  });
  assert.equal(config.secret, strongSecret);
  assert.equal((await readSession(config, strongSecret))?.user?.name, 'Synthetic user');
  assert.equal(await readSession(config, placeholder), null);
});

test('the configured public origin controls verification behind a reverse proxy', () => {
  const env = { AUTH_URL: 'https://shield.example/api/auth', NODE_ENV: 'production' };
  assert.equal(getTrustedAuthOrigin('http://localhost:3000/api/auth/whatsapp/request', env), 'https://shield.example');
  assert.equal(getTrustedAuthOrigin('http://untrusted.example/api/auth/whatsapp/request', env), 'https://shield.example');
});

test('origin configuration rejects unsafe URLs and limits development fallback to loopback', () => {
  const requestUrl = 'http://localhost:3000/api/auth/whatsapp/request';
  for (const value of ['broken', 'javascript:alert(1)', 'https://user:password@shield.example', 'http://shield.example']) {
    assert.equal(getTrustedAuthOrigin(requestUrl, { AUTH_URL: value, NODE_ENV: 'production' }), null);
  }
  assert.equal(getTrustedAuthOrigin(requestUrl, { NODE_ENV: 'production' }), null);
  assert.equal(getTrustedAuthOrigin(requestUrl, { NODE_ENV: 'development' }), 'http://localhost:3000');
  assert.equal(getTrustedAuthOrigin('http://127.0.0.1:3000/api/auth/whatsapp/request', { NODE_ENV: 'development' }), 'http://127.0.0.1:3000');
  assert.equal(getTrustedAuthOrigin('http://untrusted.example/api/auth/whatsapp/request', { NODE_ENV: 'development' }), null);
});
