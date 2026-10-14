import { NextRequest, NextResponse } from 'next/server';
import { handlers } from '@/lib/auth';
import { getTrustedAuthOrigin } from '@/lib/auth-settings';
import { WHATSAPP_CHALLENGE_COOKIE } from '@/lib/whatsapp';

export const runtime = 'nodejs';
export const GET = handlers.GET;

export async function POST(request: NextRequest) {
  const response = await handlers.POST(request);
  const isWhatsAppCallback = new URL(request.url).pathname.endsWith('/callback/whatsapp');
  if (isWhatsAppCallback && response.headers.get('set-cookie')?.includes('authjs.session-token=')) {
    const result = new NextResponse(response.body, { status: response.status, headers: response.headers });
    const origin = getTrustedAuthOrigin(request.url);
    result.cookies.set(WHATSAPP_CHALLENGE_COOKIE, '', { httpOnly: true, sameSite: 'lax', path: '/api/auth', maxAge: 0, secure: origin !== null && new URL(origin).protocol === 'https:' });
    return result;
  }
  return response;
}
