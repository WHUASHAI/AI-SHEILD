import { NextRequest, NextResponse } from 'next/server';
import { sendVerificationEmail } from '@/lib/email-verification';
import { getTrustedAuthOrigin } from '@/lib/auth-settings';
import { auth } from '@/lib/auth';

export const runtime = 'nodejs';

// Simple in-memory rate limiting: 1 email per 60 seconds per email
const lastSentTimestamps = new Map<string, number>();

export async function POST(request: NextRequest) {
  const origin = getTrustedAuthOrigin(request.url) || new URL(request.url).origin;

  let email: string | null = null;
  try {
    const body = await request.json();
    if (typeof body?.email === 'string') {
      email = body.email.trim().toLowerCase();
    }
  } catch {
    // Body parsing optional
  }

  if (!email) {
    try {
      const session = await auth();
      if (session?.user?.email) {
        email = session.user.email.trim().toLowerCase();
      }
    } catch {
      // Session fetch optional
    }
  }

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Valid email address is required.' }, { status: 400 });
  }

  const now = Date.now();
  const lastSent = lastSentTimestamps.get(email) || 0;
  if (now - lastSent < 60000) {
    const secondsLeft = Math.ceil((60000 - (now - lastSent)) / 1000);
    return NextResponse.json(
      { error: `Please wait ${secondsLeft} seconds before requesting another confirmation email.` },
      { status: 429 }
    );
  }

  lastSentTimestamps.set(email, now);

  const result = await sendVerificationEmail(email, origin);

  if (!result.success) {
    return NextResponse.json({
      success: false,
      error: result.error,
      previewUrl: result.previewUrl,
    }, { status: result.previewUrl ? 200 : 500 });
  }

  return NextResponse.json({ success: true, message: 'Confirmation email sent successfully.' });
}
