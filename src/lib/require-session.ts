import { NextResponse } from 'next/server';
import { auth } from './auth';
import { hasGuestAccess } from './guest-access';

export async function requireSessionResponse({ allowGuest = true }: { allowGuest?: boolean } = {}) {
  try {
    if (allowGuest && await hasGuestAccess()) return null;
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Sign in before scanning or viewing private reports.' }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ error: 'Authentication service unavailable.' }, { status: 503 });
  }
  return null;
}
