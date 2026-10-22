import assert from 'node:assert/strict';
import test from 'node:test';
import { getAuthProviderStatus, getSafeAuthRedirect, isUsableAuthSecret, getPasswordDatabaseUrl } from '../src/lib/auth-settings.ts';
import * as settings from '../src/lib/auth-settings.ts';

const validEnv = {
  AUTH_SECRET: 'test-secret-with-at-least-thirty-two-characters',
  AUTH_GOOGLE_ID: 'google-client', AUTH_GOOGLE_SECRET: 'google-secret',
  AUTH_FACEBOOK_ID: 'facebook-client', AUTH_FACEBOOK_SECRET: 'facebook-secret',
  AUTH_FACEBOOK_API_VERSION: 'v25.0',
};

test('password authentication rejects missing and placeholder database addresses', () => {
  const url = 'postgresql://app:synthetic-db-key@localhost:5432/aishield';
  assert.equal(getPasswordDatabaseUrl({ DATABASE_URL: url }), url);
  for (const value of [undefined, '', 'not-a-url', 'postgresql://user:password@host:5432/originscan', 'https://localhost/database', 'postgresql://localhost']) {
    assert.equal(getPasswordDatabaseUrl({ DATABASE_URL: value }), null);
  }
});

test('configured providers are available only with a usable session secret and complete credentials', () => {
  assert.deepEqual(getAuthProviderStatus(validEnv), { google: true });
  assert.deepEqual(getAuthProviderStatus({}), { google: false });
  assert.deepEqual(getAuthProviderStatus({ ...validEnv, AUTH_SECRET: 'your-secret-here-min-32-chars' }), { google: false });
  assert.equal(getAuthProviderStatus({ ...validEnv, AUTH_GOOGLE_SECRET: '' }).google, false);
});

test('Google credentials configured with common Vercel variable names enable sign-in', () => {
  const env = {
    AUTH_SECRET: validEnv.AUTH_SECRET,
    GOOGLE_CLIENT_ID: '  123456.apps.googleusercontent.com\n',
    GOOGLE_CLIENT_SECRET: '  GOCSPX-synthetic-secret\n',
  };
  assert.equal(getAuthProviderStatus(env).google, true);
  assert.equal(typeof settings.getGoogleCredentials, 'function');
  assert.deepEqual(settings.getGoogleCredentials(env), {
    clientId: '123456.apps.googleusercontent.com', clientSecret: 'GOCSPX-synthetic-secret',
  });
});

test('Google credential families are not mixed and explicit Auth.js credentials take priority', () => {
  assert.equal(typeof settings.getGoogleCredentials, 'function');
  assert.deepEqual(settings.getGoogleCredentials({ ...validEnv, GOOGLE_CLIENT_ID: 'other-client', GOOGLE_CLIENT_SECRET: 'other-secret' }), {
    clientId: 'google-client', clientSecret: 'google-secret',
  });
  assert.equal(getAuthProviderStatus({ AUTH_SECRET: validEnv.AUTH_SECRET, AUTH_GOOGLE_ID: 'client-one', GOOGLE_CLIENT_SECRET: 'secret-two' }).google, false);
});

test('session secrets reject missing, short, and example values', () => {
  assert.equal(isUsableAuthSecret(validEnv.AUTH_SECRET), true);
  for (const value of [undefined, '', 'short', 'your-secret-here-min-32-chars', 'placeholder-secret-that-is-long-enough', 'a'.repeat(32), ` ${validEnv.AUTH_SECRET}`]) {
    assert.equal(isUsableAuthSecret(value), false);
  }
});

test('auth redirects allow same-origin dashboard destinations and sign-out home', () => {
  const origin = 'http://localhost:3000';
  assert.equal(getSafeAuthRedirect('/dashboard/image?tab=file', origin), `${origin}/dashboard/image?tab=file`);
  assert.equal(getSafeAuthRedirect(`${origin}/dashboard/new-scan`, origin), `${origin}/dashboard/new-scan`);
  assert.equal(getSafeAuthRedirect('/', origin), `${origin}/`);
});

test('external, executable, and disguised redirect URLs fall back to the dashboard', () => {
  const origin = 'http://localhost:3000';
  for (const destination of ['https://external.example/dashboard', '//external.example', 'javascript:alert(1)', '/dashboard/../../outside', '/dashboard-evil', '/api/auth/signout']) {
    assert.equal(getSafeAuthRedirect(destination, origin), `${origin}/dashboard`);
  }
});
