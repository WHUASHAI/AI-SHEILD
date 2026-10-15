import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function proxy(request: NextRequest) {
  try {
    const result = await (auth as unknown as (req: NextRequest) => Promise<NextResponse | void>)(request);
    return result ?? NextResponse.next();
  } catch (error) {
    console.warn('[proxy] Auth check skipped or unconfigured:', error instanceof Error ? error.message : error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/scan/:path*', '/api/report/:path*', '/sign-in/:path*', '/sign-up'],
};

