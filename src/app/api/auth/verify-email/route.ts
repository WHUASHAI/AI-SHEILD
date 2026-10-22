import { NextRequest, NextResponse } from 'next/server';
import {
  CONFIRMED_EMAIL_COOKIE,
  createConfirmedCookieValue,
  verifyVerificationToken,
} from '@/lib/email-verification';
import { getTrustedAuthOrigin } from '@/lib/auth-settings';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const origin = getTrustedAuthOrigin(request.url) || new URL(request.url).origin;
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/verify-email?error=missing_token', origin));
  }

  const { valid, email } = verifyVerificationToken(token);
  if (!valid || !email) {
    return NextResponse.redirect(new URL('/verify-email?error=invalid_or_expired', origin));
  }

  // Update DB if configured
  try {
    const { getPasswordDatabaseUrl } = await import('@/lib/auth-settings');
    if (getPasswordDatabaseUrl()) {
      const { PrismaClient } = await import('@prisma/client');
      const { PrismaPg } = await import('@prisma/adapter-pg');
      const dbUrl = getPasswordDatabaseUrl()!;
      const client = new PrismaClient({ adapter: new PrismaPg({ connectionString: dbUrl }) });
      await client.user.updateMany({
        where: { email },
        data: { emailVerified: new Date() },
      });
    }
  } catch {
    // Ignore database errors, cookie still grants verification
  }

  // Redirect to dashboard with confirmation cookie
  const response = NextResponse.redirect(new URL('/dashboard?verified=true', origin));
  const isHttps = new URL(origin).protocol === 'https:';

  response.cookies.set(CONFIRMED_EMAIL_COOKIE, createConfirmedCookieValue(email), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 365 * 24 * 60 * 60, // 1 year
    secure: isHttps,
  });

  return response;
}
