import { pathToFileURL } from 'node:url';

export async function checkDeployment(value, fetcher = fetch) {
  const base = new URL(value);
  if (base.protocol !== 'https:' || base.username || base.password || base.pathname !== '/' || base.search || base.hash) {
    throw new Error('Provide the HTTPS website origin, without a path, credentials, or query.');
  }
  const origin = base.origin;
  const cookies = new Map();
  const checks = [];
  const require = (condition, message) => { if (!condition) throw new Error(message); };
  async function request(path, options = {}) {
    const response = await fetcher(origin + path, {
      ...options, redirect: 'manual', signal: AbortSignal.timeout(20000),
      headers: { cookie: [...cookies].map(([name, value]) => `${name}=${value}`).join('; '), ...options.headers },
    });
    for (const cookie of response.headers.getSetCookie()) {
      const [pair] = cookie.split(';');
      const separator = pair.indexOf('=');
      cookies.set(pair.slice(0, separator), pair.slice(separator + 1));
    }
    return response;
  }

  for (const path of ['/', '/sign-in', '/how-it-works', '/use-cases', '/resources', '/about', '/limitations']) {
    const response = await request(path);
    require(response.status === 200, `${path} returned HTTP ${response.status}.`);
    require((await response.text()).includes('Elucid AI'), `${path} is not serving the Elucid AI source yet.`);
  }
  checks.push('Elucid AI public pages and sign-in render.');

  const providers = await request('/api/auth/providers');
  require(providers.status === 200, 'Authentication configuration is unavailable. Check Vercel environment variables.');
  require(Boolean((await providers.json()).google), 'Google is not configured on this deployment.');
  const session = await request('/api/auth/session');
  require(session.status === 200 && (await session.json()) === null, 'Fresh session lookup did not return an unauthenticated response.');
  checks.push('Google provider and session endpoint are available.');

  const protectedPage = await request('/dashboard/new-scan');
  const destination = new URL(protectedPage.headers.get('location') ?? '/', origin);
  require([302, 303, 307, 308].includes(protectedPage.status) && destination.origin === origin && destination.pathname === '/sign-in', 'Dashboard did not require sign-in before selecting guest mode.');
  const guest = await request('/api/guest', { method: 'POST', headers: { origin } });
  require(guest.status === 200 && (await guest.json()).guest === true, 'Guest entry failed. Check the production origin configuration.');
  require(cookies.get('aishield_guest_mode') === '1', 'Guest entry did not issue its mode cookie.');
  require(guest.headers.getSetCookie().some(cookie => cookie.startsWith('aishield_guest_mode=') && /;\s*secure(?:;|$)/i.test(cookie)), 'Guest mode cookie is not secure on HTTPS.');
  for (let attempt = 0; attempt < 2; attempt++) {
    const dashboard = await request('/dashboard/new-scan');
    require(dashboard.status === 200 && (await dashboard.text()).includes('Start a New Scan'), 'Guest dashboard entry or refresh failed.');
  }
  checks.push('Guest entry and dashboard refresh work with secure cookies.');

  const leaveGuest = await request('/api/guest', { method: 'DELETE', headers: { origin } });
  require(leaveGuest.status === 200, 'Could not leave guest mode before Google sign-in.');
  const csrf = await request('/api/auth/csrf');
  require(csrf.status === 200, 'Could not start Google sign-in.');
  const { csrfToken } = await csrf.json();
  require(typeof csrfToken === 'string' && csrfToken.length > 0, 'Sign-in CSRF token is missing.');
  const signin = await request('/api/auth/signin/google', {
    method: 'POST', headers: { origin, 'content-type': 'application/x-www-form-urlencoded', 'x-auth-return-redirect': '1' },
    body: new URLSearchParams({ csrfToken, callbackUrl: origin + '/dashboard/new-scan' }),
  });
  require(signin.status === 200, 'Google sign-in did not start successfully.');
  const authorization = new URL((await signin.json()).url);
  require(authorization.origin === 'https://accounts.google.com', 'Google sign-in did not reach the Google authorization service.');
  require(authorization.searchParams.get('redirect_uri') === origin + '/api/auth/callback/google', 'Google callback uses the wrong website origin.');
  require(authorization.searchParams.get('prompt') === 'select_account', 'Google sign-in is missing account selection.');
  checks.push('Google authorization starts with the exact production callback.');
  return checks;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    if (!process.argv[2]) throw new Error('Usage: npm run check:deployment -- https://your-website.com');
    for (const check of await checkDeployment(process.argv[2])) console.log(`PASS ${check}`);
    console.log('Complete a real Google account login to verify consent, callback, and session persistence.');
  } catch (error) {
    console.error(`Deployment check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exitCode = 1;
  }
}
