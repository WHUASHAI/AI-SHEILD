import assert from 'node:assert/strict';
import test from 'node:test';
import { Auth, setEnvDefaults } from '@auth/core';
import Facebook from '@auth/core/providers/facebook';
import parseProviders from '../node_modules/@auth/core/lib/utils/providers.js';
import { getUserAndAccount } from '../node_modules/@auth/core/lib/actions/callback/oauth/callback.js';
import { isTrustedProviderSignIn } from '../src/lib/provider-verification.ts';

const facebook = await import('../src/lib/facebook-auth.ts').catch(error => {
  if (error.code === 'ERR_MODULE_NOT_FOUND') return {};
  throw error;
});
function implementation(name) {
  assert.equal(typeof facebook[name], 'function', `${name} must be implemented`);
  return facebook[name];
}

test('Facebook sign-in opens the configured Facebook login dialog with reauthentication and OAuth state', async () => {
  const config = {
    providers: [implementation('createFacebookProvider')('v25.0')],
    secret: 'synthetic-facebook-test-session-secret-at-least-32-characters',
    trustHost: true,
    basePath: '/api/auth',
    logger: { error(error) { throw error; }, warn() {}, debug() {} },
  };
  setEnvDefaults({ AUTH_FACEBOOK_ID: '123456789', AUTH_FACEBOOK_SECRET: 'synthetic-app-secret' }, config, true);
  const csrfResponse = await Auth(new Request('http://localhost:3000/api/auth/csrf'), config);
  const { csrfToken } = await csrfResponse.json();
  const cookie = csrfResponse.headers.getSetCookie().map(value => value.split(';')[0]).join('; ');
  const response = await Auth(new Request('http://localhost:3000/api/auth/signin/facebook', {
    method: 'POST',
    headers: { cookie, 'Content-Type': 'application/x-www-form-urlencoded', 'X-Auth-Return-Redirect': '1' },
    body: new URLSearchParams({ csrfToken, callbackUrl: 'http://localhost:3000/dashboard' }),
  }), config);

  assert.equal(response.status, 200);
  const { url } = await response.json();
  const destination = new URL(url);
  assert.equal(destination.origin, 'https://www.facebook.com');
  assert.equal(destination.pathname, '/v25.0/dialog/oauth');
  assert.equal(destination.searchParams.get('auth_type'), 'reauthenticate');
  assert.equal(destination.searchParams.get('client_id'), '123456789');
  assert.equal(destination.searchParams.get('redirect_uri'), 'http://localhost:3000/api/auth/callback/facebook');
  assert.equal(destination.searchParams.get('response_type'), 'code');
  assert.equal(destination.searchParams.get('scope'), 'email');
  assert.ok(destination.searchParams.get('state'));
  assert.equal(destination.searchParams.has('client_secret'), false);
  assert.ok(response.headers.getSetCookie().some(value => value.startsWith('authjs.state=') && /HttpOnly/i.test(value)));
});

test('Facebook accounts without email or a profile photo still pass Auth.js profile conversion', async () => {
  const profile = { id: '12345678', name: 'Provider profile' };
  const { providers } = parseProviders({ url: new URL('http://localhost:3000'), config: {
    providers: [Facebook({ profile: implementation('getFacebookIdentity') })], basePath: '/api/auth',
  } });
  const { user, account } = await getUserAndAccount(profile, providers[0], {}, { debug() {}, error(error) { throw error; } });
  assert.notEqual(user.id, profile.id);
  assert.equal(account.providerAccountId, profile.id);
  assert.equal(isTrustedProviderSignIn({ user, account, profile }), true);
});

test('Facebook profile mapping requires a real provider ID and safely handles optional fields', () => {
  const map = implementation('getFacebookIdentity');
  assert.deepEqual(map({ id: '12345678' }), { id: '12345678', name: null, email: null, image: null });
  assert.equal(map({ id: '12345678', picture: { data: { url: 'javascript:alert(1)' } } }).image, null);
  for (const profile of [null, {}, { id: 'fake-account' }, { id: '0' }, { id: 12345678 }, { error: { message: 'Sensitive error' } }]) {
    assert.throws(() => map(profile), /^Error: Facebook account verification failed\.$/);
  }
});

test('Facebook requests authenticate to the configured Graph version and never follow redirects', async t => {
  const profile = { id: '12345678', name: 'Provider profile' };
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(new URL(url).origin, 'https://graph.facebook.com');
    assert.equal(new URL(url).pathname, '/v25.0/me');
    assert.equal(options.headers.Authorization, 'Bearer synthetic-access-token');
    assert.equal(options.redirect, 'error');
    assert.equal(options.cache, 'no-store');
    return Response.json(profile);
  });
  assert.deepEqual(await implementation('requestFacebookProfile')('synthetic-access-token', 'v25.0'), profile);
});

test('Facebook rejects absent credentials, failed responses, and fabricated IDs without exposing upstream details', async t => {
  const request = implementation('requestFacebookProfile');
  for (const response of [Response.json({ error: { message: 'Sensitive token' } }, { status: 401 }), Response.json({ id: 'fake' })]) {
    t.mock.method(globalThis, 'fetch', async () => response);
    await assert.rejects(() => request('synthetic-token', 'v25.0'), /^Error: Facebook account verification failed\.$/);
  }
  t.mock.method(globalThis, 'fetch', async () => { throw new Error('Sensitive network error'); });
  await assert.rejects(() => request('synthetic-token', 'v25.0'), /^Error: Facebook account verification failed\.$/);
  await assert.rejects(() => request(undefined, 'v25.0'), /^Error: Facebook account verification failed\.$/);
  await assert.rejects(() => request('synthetic-token', '../../foreign-host'), /^Error: Facebook account verification failed\.$/);
});
