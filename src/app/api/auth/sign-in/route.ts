import { AuthError } from 'next-auth';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { signIn } from '@/lib/auth';
import { getPasswordDatabaseUrl, getTrustedAuthOrigin } from '@/lib/auth-settings';
import { hasIssuedPasswordSession, readAuthSessionCookie } from '@/lib/auth-session-cookie';

export const runtime = 'nodejs';
const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().max(254).email(), password: z.string().min(8).max(256),
});

export async function POST(request: NextRequest) {
  const origin = getTrustedAuthOrigin(request.url);
  if (!origin || request.headers.get('origin') !== origin) {
    return NextResponse.json({ error: 'Please sign in from this website.' }, { status: 403 });
  }
  if (request.headers.has('x-auth-return-redirect') || !request.headers.get('content-type')?.startsWith('application/json') || Number(request.headers.get('content-length') ?? 0) > 4096) {
    return NextResponse.json({ error: 'Invalid sign-in request.' }, { status: 400 });
  }
  let credentials;
  try {
    const text = await request.text();
    if (text.length > 4096) throw new Error();
    credentials = credentialsSchema.parse(JSON.parse(text));
  } catch {
    return NextResponse.json({ error: 'Enter a valid email and password.' }, { status: 400 });
  }
  if (!getPasswordDatabaseUrl()) {
    return NextResponse.json({ error: 'Email sign-in is not configured yet. Please choose a connected account.', status: 'pending_setup' }, { status: 503 });
  }
  try {
    const cookieStore = await cookies();
    const previous = readAuthSessionCookie(cookieStore.getAll(), origin);
    const destination = await signIn('credentials', { ...credentials, redirect: false, redirectTo: '/dashboard' });
    const issued = readAuthSessionCookie(cookieStore.getAll(), origin);
    if (!hasIssuedPasswordSession(destination, origin, previous, issued)) {
      return NextResponse.json({ error: 'Sign-in could not be confirmed.' }, { status: 401 });
    }
    return NextResponse.json({ authenticated: true, redirectTo: '/dashboard' });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: 'Email or password is incorrect, or the account has not verified its email.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Sign-in is unavailable. Please try again later.' }, { status: 503 });
  }
}
