import assert from 'node:assert/strict';
import test from 'node:test';
import { Auth, setEnvDefaults } from '@auth/core';
import { encode } from '@auth/core/jwt';
import Google from '@auth/core/providers/google';
import Facebook from '@auth/core/providers/facebook';
import parseProviders from '../node_modules/@auth/core/lib/utils/providers.js';
import { getUserAndAccount } from '../node_modules/@auth/core/lib/actions/callback/oauth/callback.js';

const policy = await import('../src/lib/provider-verification.ts').catch(error => {
  if (error.code === 'ERR_MODULE_NOT_FOUND') return {};
  throw error;
});
function implementation(name) {
  assert.equal(typeof policy[name], 'function', `${name} must be implemented`);
  return policy[name];
}

test('removed GitHub login and existing GitHub sessions are rejected', () => {
  const account = { provider: 'github', type: 'oauth', providerAccountId: '123456' };
  const user = { id: 'internal-user', email: 'verified@example.test' };
  const profile = { id: 123456, email: user.email, email_verified: true };
  assert.equal(implementation('isTrustedProviderSignIn')({ account, user, profile }), false);
  assert.equal(implementation('getVerifiedSessionToken')({ sub: 'github:123456', authenticationVerified: true }), null);
  assert.equal(implementation('getVerifiedSessionToken')({}, account, user), null);
});

test('Google rejects missing/unverified claims and mismatched identities', () => {
  const account = { provider: 'google', type: 'oidc', providerAccountId: 'google-user' };
  const user = { id: 'google-user', email: 'google@example.test' };
  const profile = { sub: user.id, email: user.email, email_verified: true };
  assert.equal(implementation('isTrustedProviderSignIn')({ account, user, profile }), true);
  for (const invalid of [{ ...profile, email_verified: false }, { ...profile, email_verified: 'true' }, { ...profile, email_verified: undefined }, { ...profile, sub: 'different-user' }, { ...profile, email: 'another@example.test' }]) {
    assert.equal(implementation('isTrustedProviderSignIn')({ account, user, profile: invalid }), false);
  }
});

test('real Auth.js profile conversion accepts verified OAuth accounts with independent user IDs', async () => {
  const cases = [
    [Google, { sub: '12345', name: 'Google record', email: 'Mixed.Case@EXAMPLE.TEST', email_verified: true }],
    [Facebook, { id: '12345', name: 'Facebook record', picture: { data: { url: 'https://images.example.test/profile.png' } } }],
  ];
  for (const [providerFactory, profile] of cases) {
    const { providers } = parseProviders({ url: new URL('http://localhost:3000'), config: { basePath: '/api/auth', providers: [providerFactory] } });
    const { account, user } = await getUserAndAccount(profile, providers[0], {}, { debug() {}, error(error) { throw error; } });
    assert.notEqual(user.id, account.providerAccountId);
    assert.equal(implementation('isTrustedProviderSignIn')({ account, user, profile }), true);
    assert.equal(implementation('getVerifiedSessionToken')({}, account, user).sub, `${account.provider}:12345`);
  }
});

test('Facebook requires matching authenticated provider IDs; unknown providers are denied', () => {
  const account = { provider: 'facebook', type: 'oauth', providerAccountId: '12345678' };
  const user = { id: account.providerAccountId };
  assert.equal(implementation('isTrustedProviderSignIn')({ account, user, profile: { id: user.id } }), true);
  assert.equal(implementation('isTrustedProviderSignIn')({ account, user, profile: { id: 'other-user' } }), false);
  assert.equal(implementation('isTrustedProviderSignIn')({ account: { ...account, provider: 'demo' }, user, profile: { id: user.id } }), false);
  assert.equal(implementation('isTrustedProviderSignIn')({ account: null, user }), false);
});

test('credentials require internal verification flags, never just user-supplied identifiers', () => {
  const account = { provider: 'credentials', type: 'credentials', providerAccountId: 'stored-id' };
  const user = { id: 'stored-id', email: 'stored@example.test' };
  assert.equal(implementation('isTrustedProviderSignIn')({ account, user }), false);
  assert.equal(implementation('isTrustedProviderSignIn')({ account, user: { ...user, emailVerified: true } }), true);
  assert.equal(implementation('isTrustedProviderSignIn')({ account: { ...account, provider: 'whatsapp' }, user }), false);
});

test('legacy or manually assembled JWTs are denied by the actual session callback', async () => {
  const secret = 'synthetic-session-verification-key-with-32-characters';
  for (const verified of [undefined, false, 'true', true]) {
    const config = { providers: [], secret, trustHost: true, basePath: '/api/auth', session: { strategy: 'jwt' },
      callbacks: { jwt({ token }) { return implementation('getVerifiedSessionToken')(token); } },
      logger: { error() {}, warn() {}, debug() {} },
    };
    setEnvDefaults({}, config, true);
    const jwt = await encode({ secret, salt: 'authjs.session-token', token: { name: 'Isolated test user', sub: 'google:123456', authenticationVerified: verified } });
    const response = await Auth(new Request('http://localhost:3000/api/auth/session', { headers: { cookie: `authjs.session-token=${jwt}` } }), config);
    assert.equal(response.status, 200);
    const session = await response.json();
    assert.equal(Boolean(session?.user), verified === true);
  }
});
