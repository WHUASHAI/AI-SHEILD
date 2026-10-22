import { NextRequest, NextResponse } from 'next/server';
import { GUEST_COOKIE_NAME } from '@/lib/guest-mode';
import { getTrustedAuthOrigin } from '@/lib/auth-settings';

function changeGuestMode(request: NextRequest, guest: boolean) {
  const origin = getTrustedAuthOrigin(request.url);
  if (!origin || request.headers.get('origin') !== origin) {
    return NextResponse.json({ error: 'Open guest scanning from this website.' }, { status: 403 });
  }
  const response = NextResponse.json({ guest });
  response.cookies.set(GUEST_COOKIE_NAME, guest ? '1' : '', {
    path: '/', sameSite: 'lax', secure: new URL(origin).protocol === 'https:',
    httpOnly: false, ...(guest ? {} : { maxAge: 0 }),
  });
  return response;
}

export function POST(request: NextRequest) { return changeGuestMode(request, true); }
export function DELETE(request: NextRequest) { return changeGuestMode(request, false); }
