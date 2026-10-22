import type { JWT } from 'next-auth/jwt';
import { z } from 'zod';

const emailSchema = z.string().max(254).email();
const enabledProviders = ['google', 'credentials'];

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

export function isTrustedProviderSignIn(input: { account?: unknown; user: unknown; profile?: unknown }): boolean {
  const account = record(input.account);
  const user = record(input.user);
  const profile = record(input.profile);
  if (!account || !user || typeof user.id !== 'string' || !user.id
    || typeof account.providerAccountId !== 'string' || !account.providerAccountId) return false;
  const providerId = account.providerAccountId;
  const profileEmail = typeof profile?.email === 'string' ? profile.email.toLowerCase() : null;
  const userEmail = typeof user.email === 'string' ? user.email.toLowerCase() : null;
  switch (account.provider) {
    case 'google':
      return account.type === 'oidc' && profile?.sub === providerId && profile.email_verified === true
        && emailSchema.safeParse(profileEmail).success && profileEmail === userEmail;
    case 'credentials':
      return account.type === 'credentials' && providerId === user.id && user.emailVerified === true && emailSchema.safeParse(user.email).success;
    default:
      return false;
  }
}

export function getVerifiedSessionToken(token: JWT, account?: { provider: string; providerAccountId: string }, user?: { id?: string }): JWT | null {
  if (account && !enabledProviders.includes(account.provider)) return null;
  if (account && user?.id && account.providerAccountId && enabledProviders.includes(account.provider)) {
    token.sub = `${account.provider}:${account.providerAccountId}`;
    token.authenticationVerified = true;
  }
  return token.authenticationVerified === true && typeof token.sub === 'string'
    && enabledProviders.includes(token.sub.split(':', 1)[0]) ? token : null;
}
