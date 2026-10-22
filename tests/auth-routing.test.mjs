import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
import * as historyCore from '../src/lib/history-core.ts';
import vm from 'node:vm';
import * as settings from '../src/lib/auth-settings.ts';
import * as guestMode from '../src/lib/guest-mode.ts';

const ts = createRequire(import.meta.url)('typescript');
function load(filename, modules, env = {}) {
  const exports = {};
  const { outputText } = ts.transpileModule(readFileSync(filename, 'utf8'), {
    fileName: filename, compilerOptions: { module: ts.ModuleKind.CommonJS },
  });
  vm.runInNewContext(outputText, {
    exports, process: { env }, console: { warn() {} }, URL,
    require(id) { assert.ok(id in modules, `Unexpected dependency: ${id}`); return modules[id]; },
  });
  return exports;
}

const NextResponse = {
  json: (data, init) => Response.json(data, init),
  redirect: url => Response.redirect(url, 307),
  next: () => new Response(null, { headers: { 'x-middleware-next': '1' } }),
};

function routing(requireAuth) {
  let config;
  const env = {
    REQUIRE_AUTH: requireAuth, AUTH_SECRET: 'synthetic-routing-test-secret-at-least-32-characters',
    AUTH_GOOGLE_ID: 'synthetic-google-client', AUTH_GOOGLE_SECRET: 'synthetic-google-secret',
  };
  load('src/lib/auth.ts', {
    'next-auth': { default: factory => { config = factory(); return {}; } },
    'next-auth/providers/google': { default: options => ({ id: 'google', ...options }) },
    'next-auth/providers/credentials': { default: options => options },
    'next/server': { NextResponse },
    './auth-settings': {
      ...settings,
      getAuthSessionSettings: () => settings.getAuthSessionSettings(env),
      getAuthProviderStatus: () => settings.getAuthProviderStatus(env),
      getGoogleCredentials: () => settings.getGoogleCredentials(env),
      getPasswordDatabaseUrl: () => null,
    },
    './auth-db': {}, './password-auth': {}, './provider-verification': {}, './guest-mode': guestMode,
  }, env);
  return (path, session, guest = false) => config.callbacks.authorized({ auth: session, request: {
    nextUrl: new URL(path, 'https://shield.test'), url: `https://shield.test${path}`,
    cookies: { get: name => guest && name === guestMode.GUEST_COOKIE_NAME ? { value: '1' } : undefined },
  } });
}

test('Sign In remains visible for an existing session instead of skipping Google account selection', () => {
  const authorized = routing(undefined);
  for (const path of ['/sign-in', '/sign-in/password', '/sign-up']) {
    assert.equal(authorized(path, { user: { id: 'google:123456' } }), true);
  }
});

test('dashboard and scan APIs require a real session or an explicit guest choice', async () => {
  for (const flag of [undefined, 'false', 'true']) {
    const authorized = routing(flag);
    assert.equal(authorized('/dashboard', null), false);
    assert.equal(authorized('/dashboard/image', null), false);
    for (const path of ['/api/scan/text', '/api/report/123']) {
      const response = authorized(path, null);
      assert.equal(response.status, 401);
      assert.match((await response.json()).error, /Sign in/);
    }
    assert.equal(authorized('/dashboard', { user: { id: 'google:123456' } }), true);
  }
});

test('scan handler session checks deny guests independently of the proxy', async () => {
  for (const flag of [undefined, 'false', 'true']) {
    const { requireSessionResponse } = load('src/lib/require-session.ts', {
      'next/server': { NextResponse }, './auth': { auth: async () => null },
      './guest-access': { hasGuestAccess: async () => false },
    }, { REQUIRE_AUTH: flag });
    assert.equal((await requireSessionResponse()).status, 401);
  }
});

test('session check permits authenticated requests and reports auth outages', async () => {
  const success = load('src/lib/require-session.ts', {
    'next/server': { NextResponse }, './auth': { auth: async () => ({ user: { id: 'google:123456' } }) },
    './guest-access': { hasGuestAccess: async () => false },
  });
  assert.equal(await success.requireSessionResponse(), null);
  const failure = load('src/lib/require-session.ts', {
    'next/server': { NextResponse }, './auth': { auth: async () => { throw new Error('Auth unavailable'); } },
    './guest-access': { hasGuestAccess: async () => false },
  });
  assert.equal((await failure.requireSessionResponse()).status, 503);
});

test('proxy errors never open dashboard or scan access, while sign-in can still render', async () => {
  const { proxy } = load('src/proxy.ts', {
    'next/server': { NextResponse }, '@/lib/auth': { auth: async () => { throw new Error('Auth unavailable'); } },
    '@/lib/guest-mode': guestMode,
    '@/lib/history-core': historyCore,
  });
  const request = path => ({ nextUrl: new URL(path, 'https://shield.test'), url: `https://shield.test${path}`, cookies: { get: () => undefined } });
  const dashboard = await proxy(request('/dashboard/image'));
  assert.equal(dashboard.status, 307);
  assert.equal(new URL(dashboard.headers.get('location')).pathname, '/sign-in');
  assert.equal((await proxy(request('/api/scan/text'))).status, 503);
  assert.equal((await proxy(request('/sign-in'))).headers.get('x-middleware-next'), '1');
});

test('explicit guest choice opens scanning and history but not private account tools', () => {
  const authorized = routing(undefined);
  for (const path of ['/dashboard', '/dashboard/text', '/dashboard/history', '/api/scan/image']) {
    assert.equal(authorized(path, null, true), true);
  }
  for (const path of ['/dashboard/settings', '/dashboard/admin', '/dashboard/api-keys']) {
    assert.equal(authorized(path, null, true), false);
  }
  assert.equal(authorized('/api/report/123', null, true).status, 401);
});

test('explicit guests can scan without authentication but cannot read private reports', async () => {
  const { requireSessionResponse } = load('src/lib/require-session.ts', {
    'next/server': { NextResponse },
    './auth': { auth: async () => null }, './guest-access': { hasGuestAccess: async () => true },
  });
  assert.equal(await requireSessionResponse(), null);
  assert.equal((await requireSessionResponse({ allowGuest: false })).status, 401);
});

test('guest scan access works even when Google configuration is unavailable', async () => {
  const { proxy } = load('src/proxy.ts', {
    'next/server': { NextResponse }, '@/lib/auth': { auth: async () => { throw new Error('Google unavailable'); } },
    '@/lib/guest-mode': guestMode,
  });
  const response = await proxy({ nextUrl: new URL('https://shield.test/dashboard/history'),
    url: 'https://shield.test/dashboard/history', cookies: { get: () => ({ value: '1' }) } });
  assert.equal(response.headers.get('x-middleware-next'), '1');
});

function guestEndpoint() {
  return load('src/app/api/guest/route.ts', {
    '@/lib/history-core': historyCore,
    'next/server': { NextResponse: { json(data, init) {
      const response = Response.json(data, init);
      response.cookieChanges = [];
      response.cookies = { set: (...args) => response.cookieChanges.push(args) };
      return response;
    } } },
    '@/lib/guest-mode': guestMode,
    '@/lib/auth-settings': { getTrustedAuthOrigin: url => settings.getTrustedAuthOrigin(url, { NODE_ENV: 'production', AUTH_URL: 'https://shield.test' }) },
  });
}

test('guest entry creates a private session and Google entry clears only mode selection', async () => {
  const endpoint = guestEndpoint();
  const request = { url: 'https://shield.test/api/guest', headers: new Headers({ origin: 'https://shield.test' }), cookies:{get:()=>undefined} };
  const start = endpoint.POST(request);
  assert.deepEqual(await start.json(), { guest: true });
  assert.equal(start.cookieChanges.length, 2);
  const privateCookie=start.cookieChanges.shift();
  assert.equal(privateCookie[0],'aishield_guest_session');
  assert.equal(privateCookie[2].httpOnly,true);
  assert.equal(privateCookie[2].maxAge,31536000);
  assert.ok(historyCore.guestTokenHash(privateCookie[1]));
  assert.equal(start.cookieChanges[0][0], 'aishield_guest_mode');
  assert.equal(start.cookieChanges[0][1], '1');
  assert.equal(start.cookieChanges[0][2].sameSite, 'lax');
  assert.equal(start.cookieChanges[0][2].secure, true);
  const end = endpoint.DELETE(request);
  assert.deepEqual(await end.json(), { guest: false });
  assert.equal(end.cookieChanges[0][1], '');
  assert.equal(end.cookieChanges[0][2].maxAge, 0);
});

test('another origin cannot change guest selection', () => {
  const endpoint = guestEndpoint();
  for (const origin of [undefined, 'https://foreign.test']) {
    const request = { url: 'https://shield.test/api/guest', headers: new Headers(origin ? { origin } : {}) };
    for (const method of ['POST', 'DELETE']) {
      const response = endpoint[method](request);
      assert.equal(response.status, 403);
      assert.equal(response.cookieChanges.length, 0);
    }
  }
});
