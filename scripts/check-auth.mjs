import { getAuthProviderStatus, getPasswordDatabaseUrl, isUsableAuthSecret } from '../src/lib/auth-settings.ts';
import { getWhatsAppConfig } from '../src/lib/whatsapp.ts';

const status = getAuthProviderStatus();
status.whatsapp = status.whatsapp && getWhatsAppConfig() !== null;
console.log(`Session secret: ${isUsableAuthSecret(process.env.AUTH_SECRET) ? 'ready' : 'needs setup'}`);
console.log(`Email/password: ${getPasswordDatabaseUrl() ? 'database URL present (connection, schema, and verified accounts still need checking)' : 'needs a real PostgreSQL database with verified accounts'}`);
for (const [provider, ready] of Object.entries(status)) {
  console.log(`${provider}: ${ready ? 'credentials present (live approval/delivery still needs testing)' : 'needs setup'}`);
}
try {
  const origin = new URL(process.env.AUTH_URL ?? 'http://localhost:3000').origin;
  console.log(`Open the app at: ${origin}`);
  for (const provider of ['google', 'facebook']) console.log(`${provider} callback: ${origin}/api/auth/callback/${provider}`);
} catch {
  console.log('AUTH_URL must be a valid app URL.');
  process.exitCode = 1;
}
