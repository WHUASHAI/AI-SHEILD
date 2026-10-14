import { NextRequest, NextResponse } from 'next/server';
import { isValidPhoneNumber } from 'libphonenumber-js/max';
import { getTrustedAuthOrigin, isUsableAuthSecret } from '@/lib/auth-settings';
import {
  WHATSAPP_CHALLENGE_COOKIE, WHATSAPP_CHALLENGE_TTL, consumeWhatsAppQuota,
  createWhatsAppChallenge, getWhatsAppConfig, normalizePhone, requestWhatsAppCode,
} from '@/lib/whatsapp';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  const trustedOrigin = getTrustedAuthOrigin(request.url);
  if (!origin || !trustedOrigin || origin !== trustedOrigin) {
    return NextResponse.json({ error: 'Please request your code from this website.' }, { status: 403 });
  }
  if (!request.headers.get('content-type')?.startsWith('application/json') || Number(request.headers.get('content-length') ?? 0) > 1024) {
    return NextResponse.json({ error: 'Invalid verification request.' }, { status: 400 });
  }
  let phone: string | null;
  try {
    const body: unknown = await request.json();
    phone = typeof body === 'object' && body !== null && 'phone' in body ? normalizePhone(body.phone) : null;
  } catch {
    return NextResponse.json({ error: 'Invalid verification request.' }, { status: 400 });
  }
  if (!phone || !isValidPhoneNumber(phone)) return NextResponse.json({ error: 'Enter a valid phone number with its country code.' }, { status: 400 });
  const secret = process.env.AUTH_SECRET;
  if (!getWhatsAppConfig() || !isUsableAuthSecret(secret)) {
    return NextResponse.json({ error: 'WhatsApp sign-in is not available yet. Please choose another option.' }, { status: 503 });
  }
  const clientId = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  const quota = consumeWhatsAppQuota('send', phone, clientId);
  if (!quota.allowed) {
    return NextResponse.json({ error: 'Please wait before requesting another code.', retryAfter: quota.retryAfter }, { status: 429, headers: { 'Retry-After': String(quota.retryAfter) } });
  }
  try {
    const { sid } = await requestWhatsAppCode(phone);
    const challenge = createWhatsAppChallenge(phone, sid, secret);
    const response = NextResponse.json({ sent: true, retryAfter: 60 });
    response.cookies.set(WHATSAPP_CHALLENGE_COOKIE, challenge, {
      httpOnly: true, sameSite: 'lax', path: '/api/auth', maxAge: WHATSAPP_CHALLENGE_TTL,
      secure: new URL(trustedOrigin).protocol === 'https:',
    });
    return response;
  } catch {
    return NextResponse.json({ error: 'Could not send a WhatsApp code. Please try again later.' }, { status: 502 });
  }
}
