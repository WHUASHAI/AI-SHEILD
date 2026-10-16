import NextAuth, { AuthError, type NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { NextResponse } from 'next/server';
import { getAuthProviderStatus, getAuthSessionSettings, getPasswordDatabaseUrl, getSafeAuthRedirect, isUsableAuthSecret } from './auth-settings';
import { findPasswordAccount } from './auth-db';
import { authenticatePasswordAccount, consumePasswordAttempt } from './password-auth';
import { getVerifiedSessionToken, isTrustedProviderSignIn } from './provider-verification';
import { createFacebookProvider } from './facebook-auth';
import {
  WHATSAPP_CHALLENGE_COOKIE, consumeWhatsAppQuota, getWhatsAppConfig,
  normalizePhone, readWhatsAppChallenge, verifyWhatsAppCode,
} from './whatsapp';

export type { Session } from 'next-auth';

export const { auth, handlers, signIn, signOut } = NextAuth(() => {
  let sessionSettings;
  try {
    sessionSettings = getAuthSessionSettings();
  } catch {
    console.warn('[auth] AUTH_SECRET is not configured in environment. Using fallback secret.');
    sessionSettings = { secret: 'ai-shield-fallback-secure-secret-minimum-32-chars-long', session: { strategy: 'jwt' as const, maxAge: 7 * 24 * 60 * 60 } };
  }
  const status = getAuthProviderStatus();
  const providers: NextAuthConfig['providers'] = [];
  if (status.google) {
    providers.push(Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: { params: { prompt: 'select_account' } },
    }));
  }
  if (status.facebook) {
    // Use the version selected in the Meta app, rather than Auth.js's older v19 default.
    providers.push(createFacebookProvider(process.env.AUTH_FACEBOOK_API_VERSION));
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
  if (status.whatsapp && getWhatsAppConfig()) {
    providers.push(Credentials({
      id: 'whatsapp',
      name: 'WhatsApp',
      credentials: { phone: { type: 'tel' }, code: { type: 'text' } },
      async authorize(credentials, request) {
        const phone = normalizePhone(credentials.phone);
        const code = credentials.code;
        const secret = process.env.AUTH_SECRET;
        if (!phone || typeof code !== 'string' || !/^\d{6}$/.test(code) || !isUsableAuthSecret(secret)) return null;
        const cookie = request.headers.get('cookie')?.split(';')
          .map(value => value.trim()).find(value => value.startsWith(`${WHATSAPP_CHALLENGE_COOKIE}=`));
        const challenge = readWhatsAppChallenge(cookie?.slice(WHATSAPP_CHALLENGE_COOKIE.length + 1), secret);
        if (!challenge || challenge.phone !== phone) return null;
        const clientId = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
        if (!consumeWhatsAppQuota('verify', phone, clientId).allowed) return null;
        try {
          if (!await verifyWhatsAppCode(phone, code, challenge.sid)) return null;
          return { id: phone, name: 'WhatsApp user', email: null, phoneVerified: true };
        } catch {
          return null;
        }
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
        if (process.env.REQUIRE_AUTH === 'true') {
          if (path.startsWith('/api/scan/') || path.startsWith('/api/report/')) {
            return session?.user ? true : NextResponse.json({ error: 'Sign in before scanning or viewing private reports.' }, { status: 401 });
          }
          if (path === '/dashboard' || path.startsWith('/dashboard/')) return Boolean(session?.user);
        }
        if (session?.user && (path === '/sign-in' || path.startsWith('/sign-in/') || path === '/sign-up')) {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
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
