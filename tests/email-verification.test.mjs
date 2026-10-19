import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createVerificationToken,
  verifyVerificationToken,
  createConfirmedCookieValue,
  isConfirmedCookieValid,
} from '../src/lib/email-verification.ts';

const secret = 'test-secret-at-least-thirty-two-chars-long-12345';

test('verification token creates and validates matching email', () => {
  const email = 'user@example.com';
  const token = createVerificationToken(email, secret);
  const result = verifyVerificationToken(token, secret);
  assert.equal(result.valid, true);
  assert.equal(result.email, email);
});

test('verification token rejects wrong secret or tampered token', () => {
  const email = 'user@example.com';
  const token = createVerificationToken(email, secret);
  const result = verifyVerificationToken(token, 'different-secret-with-32-characters-length');
  assert.equal(result.valid, false);

  const tampered = token.slice(0, -4) + 'abcd';
  assert.equal(verifyVerificationToken(tampered, secret).valid, false);
});

test('confirmed cookie value creates and verifies signature', () => {
  const email = 'valid.user@gmail.com';
  const cookieVal = createConfirmedCookieValue(email, secret);
  assert.equal(isConfirmedCookieValid(cookieVal, secret), email);
});

test('confirmed cookie rejects tampered email or wrong secret', () => {
  const email = 'valid.user@gmail.com';
  const cookieVal = createConfirmedCookieValue(email, secret);
  assert.equal(isConfirmedCookieValid(cookieVal, 'another-secret-with-32-characters'), null);
  assert.equal(isConfirmedCookieValid('fake@gmail.com:wrongsignature', secret), null);
  assert.equal(isConfirmedCookieValid(undefined, secret), null);
});
