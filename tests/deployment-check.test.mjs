import assert from 'node:assert/strict';
import test from 'node:test';
import { checkDeployment } from '../scripts/check-deployment.mjs';

const origin = 'https://elucid.test';
function deployment({ google = true, allowGuest = true, secureCookie = true, callbackOrigin = origin } = {}) {
  let enteredGuest = false;
  return async (url, options) => {
    const path = new URL(url).pathname;
    if (['/', '/sign-in', '/how-it-works', '/use-cases', '/resources', '/about', '/limitations'].includes(path)) return new Response('<title>Elucid AI</title>');
    if (path === '/api/auth/providers') return Response.json(google ? { google: { id: 'google' } } : {});
    if (path === '/api/auth/session') return Response.json(null);
    if (path === '/api/guest') {
      assert.equal(options.headers.origin, origin);
      enteredGuest = options.method === 'POST';
      return Response.json({ guest: enteredGuest }, { headers: { 'set-cookie': `aishield_guest_mode=${enteredGuest ? '1' : ''}; Path=/; SameSite=Lax${secureCookie ? '; Secure' : ''}` } });
    }
    if (path === '/dashboard/new-scan') {
      if (enteredGuest && allowGuest) {
        assert.match(options.headers.cookie, /aishield_guest_mode=1/);
        return new Response('<h1>Start a New Scan</h1>');
      }
      return new Response(null, { status: 307, headers: { location: '/sign-in' } });
    }
    if (path === '/api/auth/csrf') return Response.json({ csrfToken: 'synthetic-csrf-token' });
    if (path === '/api/auth/signin/google') {
      assert.equal(options.method, 'POST');
      assert.equal(options.body.get('csrfToken'), 'synthetic-csrf-token');
      const authorization = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authorization.searchParams.set('redirect_uri', callbackOrigin + '/api/auth/callback/google');
      authorization.searchParams.set('prompt', 'select_account');
      return Response.json({ url: authorization.href });
    }
    throw new Error(`Unexpected request: ${path}`);
  };
}

test('deployment check verifies guest access, refresh, and Google callback without creating a Google session', async () => {
  const checks = await checkDeployment(origin, deployment());
  assert.equal(checks.length, 4);
  assert.match(checks.join(' '), /Guest entry.*Google authorization/s);
});

test('deployment check fails when Google is absent or its callback uses another origin', async () => {
  await assert.rejects(checkDeployment(origin, deployment({ google: false })), /Google is not configured/);
  await assert.rejects(checkDeployment(origin, deployment({ callbackOrigin: 'https://wrong.test' })), /wrong website origin/);
});

test('deployment check fails when guests cannot enter or cookies lose HTTPS protection', async () => {
  await assert.rejects(checkDeployment(origin, deployment({ allowGuest: false })), /Guest dashboard entry or refresh failed/);
  await assert.rejects(checkDeployment(origin, deployment({ secureCookie: false })), /cookie is not secure/);
});

test('deployment check rejects non-HTTPS and non-origin inputs before making requests', async () => {
  const unexpected = () => { throw new Error('Unexpected network access'); };
  for (const url of ['http://elucid.test', 'https://elucid.test/sign-in', 'https://name:password@elucid.test', 'https://elucid.test?x=1']) {
    await assert.rejects(checkDeployment(url, unexpected), /Provide the HTTPS website origin/);
  }
});
