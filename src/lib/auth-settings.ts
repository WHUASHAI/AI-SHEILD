export function isUsableAuthSecret(value: string | undefined): value is string {
  return isConfiguredValue(value) && value.length >= 32 && value.length <= 4096
    && value.trim() === value && !/[\u0000-\u001f\u007f]/u.test(value) && !/^(.)\1{7,}$/u.test(value);
}

export function getAuthSessionSettings(env: NodeJS.ProcessEnv = process.env) {
  if (!isUsableAuthSecret(env.AUTH_SECRET)) {
    // Reject before Auth.js can reload weak or legacy keys from environment defaults.
    throw new Error('Configure a strong AUTH_SECRET before enabling authentication.');
  }
  return { secret: env.AUTH_SECRET, session: { strategy: 'jwt' as const, maxAge: 7 * 24 * 60 * 60 } };
}

export function getTrustedAuthOrigin(requestUrl: string, env: NodeJS.ProcessEnv = process.env): string | null {
  const vercelUrl = env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`
    : (env.VERCEL_URL ? `https://${env.VERCEL_URL}` : undefined);
  const configuredUrl = env.AUTH_URL ?? env.NEXTAUTH_URL ?? vercelUrl;
  try {
    const url = new URL(configuredUrl ?? requestUrl);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return null;
    if (env.NODE_ENV === 'production' && (url.protocol !== 'https:' || !configuredUrl)) return null;
    if (!configuredUrl && !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) return null;
    return url.origin;
  } catch {
    return null;
  }
}

export function getPasswordDatabaseUrl(env: NodeJS.ProcessEnv = process.env): string | null {
  try {
    const url = new URL(env.DATABASE_URL ?? '');
    if (!['postgres:', 'postgresql:'].includes(url.protocol) || !url.username || url.pathname.length < 2
      || !isConfiguredValue(url.hostname) || ['host', 'your-host', 'db-host'].includes(url.hostname)) return null;
    return env.DATABASE_URL ?? null;
  } catch { return null; }
}

function isConfiguredValue(value: string | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0
    && !/your[-_ ]|placeholder|change[-_ ]?me|example|replace[-_ ]*(?:me|with)|insert[-_ ]*(?:secret|token|key)|(?:^|[-_ ])(?:dummy|todo|tbd)(?:$|[-_ ])/i.test(value);
}

export function getAuthProviderStatus(env: NodeJS.ProcessEnv = process.env) {
  const secretReady = isUsableAuthSecret(env.AUTH_SECRET);
  return {
    google: secretReady && isConfiguredValue(env.AUTH_GOOGLE_ID) && isConfiguredValue(env.AUTH_GOOGLE_SECRET),
    facebook: secretReady && isConfiguredValue(env.AUTH_FACEBOOK_ID) && isConfiguredValue(env.AUTH_FACEBOOK_SECRET)
      && /^v\d{2}\.\d+$/.test(env.AUTH_FACEBOOK_API_VERSION ?? ''),
    whatsapp: secretReady
      && /^AC[0-9a-f]{32}$/i.test(env.TWILIO_ACCOUNT_SID ?? '')
      && isConfiguredValue(env.TWILIO_AUTH_TOKEN)
      && /^VA[0-9a-f]{32}$/i.test(env.TWILIO_VERIFY_SERVICE_SID ?? ''),
  };
}

export function getSafeAuthRedirect(url: string, baseUrl: string): string {
  const origin = new URL(baseUrl).origin;
  try {
    const destination = new URL(url, origin);
    const allowedPath = destination.pathname === '/'
      || destination.pathname === '/dashboard'
      || destination.pathname.startsWith('/dashboard/');
    if (destination.origin === origin && allowedPath && !destination.username && !destination.password) {
      return destination.href;
    }
  } catch {
    // Malformed destinations use the same safe fallback as foreign URLs.
  }
  return `${origin}/dashboard`;
}
