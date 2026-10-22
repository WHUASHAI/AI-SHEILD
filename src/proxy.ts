import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { GUEST_COOKIE_NAME, isGuestCookie, isGuestAccessiblePath } from '@/lib/guest-mode';

export async function proxy(request: NextRequest) {
  if (isGuestAccessiblePath(request.nextUrl.pathname)
    && isGuestCookie(request.cookies.get(GUEST_COOKIE_NAME)?.value)) return NextResponse.next();
  try {
    const result = await (auth as unknown as (req: NextRequest) => Promise<NextResponse | void>)(request);
    return result ?? NextResponse.next();
  } catch (error) {
    console.warn('[proxy] Authentication check failed:', error instanceof Error ? error.message : error);
    const path = request.nextUrl.pathname;
    if (path.startsWith('/api/scan/') || path.startsWith('/api/report/')) {
      return NextResponse.json({ error: 'Authentication service unavailable.' }, { status: 503 });
    }
    if (path === '/dashboard' || path.startsWith('/dashboard/')) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/scan/:path*', '/api/report/:path*', '/sign-in', '/sign-in/:path*', '/sign-up'],
};

