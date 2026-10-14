import NextAuth, { AuthError, type NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import Facebook from 'next-auth/providers/facebook';
import Credentials from 'next-auth/providers/credentials';
import { NextResponse } from 'next/server';
import { getAuthProviderStatus, getAuthSessionSettings, getPasswordDatabaseUrl, getSafeAuthRedirect, isUsableAuthSecret } from './auth-settings';
import { findPasswordAccount } from './auth-db';
import { authenticatePasswordAccount, consumePasswordAttempt } from './password-auth';
import { getVerifiedSessionToken, isTrustedProviderSignIn } from './provider-verification';
import { getFacebookIdentity, requestFacebookProfile } from './facebook-auth';
import {
  WHATSAPP_CHALLENGE_COOKIE, consumeWhatsAppQuota, getWhatsAppConfig,
  normalizePhone, readWhatsAppChallenge, verifyWhatsAppCode,
} from './whatsapp';

export type { Session } from 'next-auth';

export const { auth, handlers, signIn, signOut } = NextAuth(() => {
  const sessionSettings = getAuthSessionSettings();
  const status = getAuthProviderStatus();
  const providers: NextAuthConfig['providers'] = [];
  if (status.google) providers.push(Google({ authorization: { params: { prompt: 'select_account' } } }));
  if (status.facebook) {
    // Use the version selected in the Meta app, rather than Auth.js's older v19 default.
    const version = process.env.AUTH_FACEBOOK_API_VERSION;
    providers.push(Facebook({
      authorization: { url: `https://www.facebook.com/${version}/dialog/oauth`, params: { scope: 'email' } },
      token: `https://graph.facebook.com/${version}/oauth/access_token`,
      userinfo: {
        url: `https://graph.facebook.com/${version}/me?fields=id,name,email,picture`,
        async request({ tokens }: { tokens: { access_token?: string } }) { return requestFacebookProfile(tokens.access_token, version); },
      },
      profile: getFacebookIdentity,
      checks: ['state'],
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
        if (path.startsWith('/api/scan/') || path.startsWith('/api/report/')) {
          return session?.user ? true : NextResponse.json({ error: 'Sign in before scanning or viewing private reports.' }, { status: 401 });
        }
        if (path === '/dashboard' || path.startsWith('/dashboard/')) return Boolean(session?.user);
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
