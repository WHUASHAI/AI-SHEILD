import { NextRequest, NextResponse } from 'next/server';
import { isEmailConfirmed } from '@/lib/email-verification';
import { auth } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  let email = request.nextUrl.searchParams.get('email');

  if (!email) {
    try {
      const session = await auth();
      if (session?.user?.email) {
        email = session.user.email;
      }
    } catch {
      // Ignore session errors
    }
  }

  if (!email) {
    return NextResponse.json({ confirmed: false });
  }

  const confirmed = await isEmailConfirmed(email);
  return NextResponse.json({ confirmed });
}
