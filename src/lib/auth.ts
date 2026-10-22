import NextAuth, { AuthError, type NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { NextResponse } from 'next/server';
import { getAuthProviderStatus, getAuthSessionSettings, getGoogleCredentials, getPasswordDatabaseUrl, getSafeAuthRedirect } from './auth-settings';
import { findPasswordAccount } from './auth-db';
import { authenticatePasswordAccount, consumePasswordAttempt } from './password-auth';
import { getVerifiedSessionToken, isTrustedProviderSignIn } from './provider-verification';
import { GUEST_COOKIE_NAME, isGuestCookie, isGuestAccessiblePath } from './guest-mode';

export type { Session } from 'next-auth';

export const { auth, handlers, signIn, signOut } = NextAuth(() => {
  const sessionSettings = getAuthSessionSettings();
  const status = getAuthProviderStatus();
  const google = getGoogleCredentials();
  const providers: NextAuthConfig['providers'] = [];
  if (status.google && google) {
    providers.push(Google({
      ...google,
      authorization: { params: { prompt: 'select_account' } },
    }));
  }
  if (getPasswordDatabaseUrl()) {
    providers.push(Credentials({
      id: 'credentials', name: 'Email and password',
      credentials: { email: { type: 'email' }, password: { type: 'password' } },
      async authorize(credentials, request) {
        const clientId = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
        if (!consumePasswordAttempt(credentials.email, clientId).allowed) return null;
        return authenticatePasswordAccount(credentials, findPasswordAccount);
      },
    }));
  }

  return {
    ...sessionSettings,
    providers,
    trustHost: true,
    pages: { signIn: '/sign-in', error: '/sign-in' },
    callbacks: {
      signIn(input) { return isTrustedProviderSignIn(input); },
      authorized({ auth: session, request }) {
        const path = request.nextUrl.pathname;
        if (isGuestAccessiblePath(path) && isGuestCookie(request.cookies.get(GUEST_COOKIE_NAME)?.value)) return true;
        if (path.startsWith('/api/scan/') || path.startsWith('/api/report/')) {
          return session?.user ? true : NextResponse.json({ error: 'Sign in before scanning or viewing private reports.' }, { status: 401 });
        }
        if (path === '/dashboard' || path.startsWith('/dashboard/')) return Boolean(session?.user);
        // Sign-in stays accessible so users can explicitly choose their Google account.
        return true;
      },
      redirect({ url, baseUrl }) { return getSafeAuthRedirect(url, baseUrl); },
      jwt({ token, account, user }) {
        return getVerifiedSessionToken(token, account ?? undefined, user);
      },
      session({ session, token }) {
        if (session.user && token.sub) session.user.id = token.sub;
        return session;
      },
    },
    logger: { error(error) { console.error('[auth]', error instanceof AuthError ? error.type : 'AuthenticationError'); } },
  } satisfies NextAuthConfig;
});
