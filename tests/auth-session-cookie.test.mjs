import assert from 'node:assert/strict';
import test from 'node:test';

const sessions = await import('../src/lib/auth-session-cookie.ts').catch(error => {
  if (error.code === 'ERR_MODULE_NOT_FOUND') return {};
  throw error;
});
function implementation(name) {
  assert.equal(typeof sessions[name], 'function', `${name} must be implemented`);
  return sessions[name];
}

test('session proof reads HTTP and HTTPS cookies, including ordered chunks', () => {
  assert.equal(implementation('readAuthSessionCookie')([{ name: 'authjs.session-token', value: 'session' }], 'http://localhost:3000'), 'session');
  assert.equal(implementation('readAuthSessionCookie')([{ name: '__Secure-authjs.session-token.1', value: 'second' }, { name: '__Secure-authjs.session-token.0', value: 'first' }], 'https://shield.example'), 'firstsecond');
  for (const cookies of [[], [{ name: 'authjs.session-token', value: '' }], [{ name: 'authjs.session-token.1', value: 'missing-first' }], [{ name: 'authjs.session-token.0x0', value: 'invalid-index' }]]) {
    assert.equal(implementation('readAuthSessionCookie')(cookies, 'http://localhost:3000'), null);
  }
});

test('sign-in success requires a dashboard destination and a freshly issued session cookie', () => {
  const check = implementation('hasIssuedPasswordSession');
  const origin = 'http://localhost:3000';
  assert.equal(check(`${origin}/dashboard`, origin, 'old-cookie', 'new-cookie'), true);
  assert.equal(check(`${origin}/dashboard`, origin, null, 'new-cookie'), true);
  assert.equal(check(`${origin}/dashboard`, origin, null, null), false);
  assert.equal(check(`${origin}/dashboard`, origin, 'old-cookie', 'old-cookie'), false);
  assert.equal(check(`${origin}/api/auth/callback/credentials?`, origin, null, 'new-cookie'), false);
  assert.equal(check(`${origin}/sign-in?error=CredentialsSignin`, origin, null, null), false);
  assert.equal(check('https://external.example/dashboard', origin, null, 'new-cookie'), false);
});
