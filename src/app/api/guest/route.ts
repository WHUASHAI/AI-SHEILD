import { NextRequest, NextResponse } from 'next/server';
import { GUEST_COOKIE_NAME } from '@/lib/guest-mode';
import { getGuestRequestOrigin } from '@/lib/auth-settings';
import { guestTokenHash, newGuestToken } from '@/lib/history-core';

function changeGuestMode(request: NextRequest, guest: boolean) {
  const origin = getGuestRequestOrigin(request.url, request.headers.get('host'));
  if (!origin || request.headers.get('origin') !== origin) {
    return NextResponse.json({ error: 'Open guest scanning from this website.' }, { status: 403 });
  }
  const response = NextResponse.json({ guest });
  if (guest) {
    const existing = request.cookies.get('aishield_guest_session')?.value;
    response.cookies.set('aishield_guest_session', guestTokenHash(existing) ? existing! : newGuestToken(), {
      path: '/', sameSite: 'lax', secure: new URL(origin).protocol === 'https:',
      httpOnly: true, maxAge: 365 * 24 * 60 * 60,
    });
  }
  response.cookies.set(GUEST_COOKIE_NAME, guest ? '1' : '', {
    path: '/', sameSite: 'lax', secure: new URL(origin).protocol === 'https:',
    httpOnly: false, maxAge: guest ? 365 * 24 * 60 * 60 : 0,
  });
  return response;
}

export function POST(request: NextRequest) { return changeGuestMode(request, true); }
export function DELETE(request: NextRequest) { return changeGuestMode(request, false); }
