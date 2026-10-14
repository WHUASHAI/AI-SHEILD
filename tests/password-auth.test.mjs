import assert from 'node:assert/strict';
import test from 'node:test';
import { Auth, setEnvDefaults } from '@auth/core';
import Credentials from '@auth/core/providers/credentials';
import { isTrustedProviderSignIn, getVerifiedSessionToken } from '../src/lib/provider-verification.ts';

const auth = await import('../src/lib/password-auth.ts').catch(error => {
  if (error.code === 'ERR_MODULE_NOT_FOUND') return {};
  throw error;
});
function implementation(name) {
  assert.equal(typeof auth[name], 'function', `${name} must be implemented`);
  return auth[name];
}
const password = 'A-strong-synthetic-password!';
const email = 'account@example.test';

test('passwords use salted scrypt hashes and reject incorrect or malformed hashes', async () => {
  const hash = await implementation('hashPassword')(password);
  assert.match(hash, /^scrypt-v1\$[a-f0-9]{32}\$[a-f0-9]{128}$/);
  assert.notEqual(await implementation('hashPassword')(password), hash);
  assert.equal(await implementation('verifyPassword')(password, hash), true);
  assert.equal(await implementation('verifyPassword')('Wrong-password!', hash), false);
  for (const invalid of [password, '', 'scrypt-v1$invalid$invalid', null]) {
    assert.equal(await implementation('verifyPassword')(password, invalid), false);
  }
});

test('password hashing and authentication bound inputs without querying accounts', async () => {
  await assert.rejects(() => implementation('hashPassword')('short'), /8 to 256/);
  await assert.rejects(() => implementation('hashPassword')('x'.repeat(257)), /8 to 256/);
  for (const credentials of [null, {}, { email: 'invalid', password }, { email, password: 'short' }, { email, password: 'x'.repeat(257) }]) {
    const user = await implementation('authenticatePasswordAccount')(credentials, async () => { throw new Error('Unexpected account query'); });
    assert.equal(user, null);
  }
});

test('password sign-in requires the existing account, matching hash, and verified email', async () => {
  const passwordHash = await implementation('hashPassword')(password);
  const account = { id: 'stored-user-id', name: 'Stored user', email, passwordHash, emailVerified: new Date('2026-01-01') };
  const result = await implementation('authenticatePasswordAccount')({ email: ' ACCOUNT@EXAMPLE.TEST ', password }, async normalized => {
    assert.equal(normalized, email);
    return account;
  });
  assert.deepEqual(result, { id: account.id, name: account.name, email, emailVerified: true });
  for (const candidate of [null, { ...account, emailVerified: null }, { ...account, emailVerified: new Date('invalid') }, { ...account, email: 'other@example.test' }, { ...account, passwordHash: null }]) {
    assert.equal(await implementation('authenticatePasswordAccount')({ email, password, emailVerified: true }, async () => candidate), null);
  }
  assert.equal(await implementation('authenticatePasswordAccount')({ email, password: 'Wrong-password!' }, async () => account), null);
});

test('database failures never authenticate or leak connection errors', async () => {
  assert.equal(await implementation('authenticatePasswordAccount')({ email, password }, async () => { throw new Error('Sensitive connection details'); }), null);
});

test('the real Auth.js flow issues sessions only for verified existing accounts with correct passwords', async () => {
  const hash = await implementation('hashPassword')(password);
  const stored = { id: 'stored-id', name: 'Verified record', email, passwordHash: hash, emailVerified: new Date('2026-01-01') };
  for (const [account, entered, accepted] of [
    [null, password, false], [{ ...stored, emailVerified: null }, password, false],
    [stored, 'Wrong-password!', false], [stored, password, true],
  ]) {
    const config = {
      secret: 'isolated-authjs-test-secret-over-32-characters', trustHost: true, basePath: '/api/auth',
      providers: [Credentials({ authorize(credentials) {
        return implementation('authenticatePasswordAccount')(credentials, async () => account);
      } })],
      session: { strategy: 'jwt' }, callbacks: {
        signIn: isTrustedProviderSignIn,
        jwt({ token, account, user }) { return getVerifiedSessionToken(token, account ?? undefined, user); },
      }, logger: { error() {}, warn() {}, debug() {} },
    };
    setEnvDefaults({}, config, true);
    const csrf = await Auth(new Request('http://localhost:3000/api/auth/csrf'), config);
    const { csrfToken } = await csrf.json();
    const cookie = csrf.headers.getSetCookie().map(value => value.split(';')[0]).join('; ');
    const response = await Auth(new Request('http://localhost:3000/api/auth/callback/credentials', {
      method: 'POST', headers: { cookie, 'Content-Type': 'application/x-www-form-urlencoded', 'X-Auth-Return-Redirect': '1' },
      body: new URLSearchParams({ email, password: entered, csrfToken, emailVerified: 'true', callbackUrl: 'http://localhost:3000/dashboard' }),
    }), config);
    const sessionCookie = response.headers.getSetCookie().find(value => value.startsWith('authjs.session-token='));
    assert.equal(Boolean(sessionCookie), accepted);
    if (accepted) {
      const session = await Auth(new Request('http://localhost:3000/api/auth/session', { headers: { cookie: sessionCookie.split(';')[0] } }), config);
      assert.equal((await session.json())?.user?.name, 'Verified record');
    }
  }
});

test('password attempt limits cap account and client attempts, expire, and reject malformed identities', () => {
  const now = 1_900_000_000_000;
  for (let i = 0; i < 5; i++) assert.equal(implementation('consumePasswordAttempt')(email, 'password-test-client', now).allowed, true);
  assert.equal(implementation('consumePasswordAttempt')(email, 'another-client', now).allowed, false);
  assert.equal(implementation('consumePasswordAttempt')(email, 'password-test-client', now + 600_001).allowed, true);
  for (let i = 0; i < 20; i++) assert.equal(implementation('consumePasswordAttempt')(`person${i}@example.test`, 'shared-client', now).allowed, true);
  assert.equal(implementation('consumePasswordAttempt')('another@example.test', 'shared-client', now).allowed, false);
  assert.equal(implementation('consumePasswordAttempt')('invalid', 'client', now).allowed, false);
});
