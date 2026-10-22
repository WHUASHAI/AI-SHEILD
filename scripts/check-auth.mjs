import { getAuthProviderStatus, getGoogleCredentials, getPasswordDatabaseUrl, getTrustedAuthOrigin, isUsableAuthSecret } from '../src/lib/auth-settings.ts';

const status = getAuthProviderStatus();
const secretReady = isUsableAuthSecret(process.env.AUTH_SECRET);
console.log(`Session secret: ${secretReady ? 'ready' : 'set AUTH_SECRET to a random secret of at least 32 characters'}`);
if (!secretReady) process.exitCode = 1;
if (!getGoogleCredentials()) {
  console.log('Google credentials: set AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET (or GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET).');
  process.exitCode = 1;
}
console.log(`Email/password: ${getPasswordDatabaseUrl() ? 'database URL present (connection, schema, and verified accounts still need checking)' : 'needs a real PostgreSQL database with verified accounts'}`);
for (const [provider, ready] of Object.entries(status)) {
  console.log(`${provider}: ${ready ? 'credentials present (live approval/delivery still needs testing)' : 'needs setup'}`);
}
const origin = getTrustedAuthOrigin('http://localhost:3000');
if (origin) {
  console.log(`Open the app at: ${origin}`);
  console.log(`Google callback: ${origin}/api/auth/callback/google`);
} else {
  console.log('Set AUTH_URL to the public HTTPS app origin in production (or provide a valid Vercel deployment URL).');
  process.exitCode = 1;
}
