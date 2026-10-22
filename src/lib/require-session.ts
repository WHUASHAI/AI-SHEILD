import { NextResponse } from 'next/server';
import { auth } from './auth';

export async function requireSessionResponse() {
  if (process.env.REQUIRE_AUTH === 'true') {
    try {
      const session = await auth();
      if (!session?.user) {
        return NextResponse.json({ error: 'Sign in before scanning or viewing private reports.' }, { status: 401 });
      }
    } catch {
      return NextResponse.json({ error: 'Authentication service unavailable.' }, { status: 503 });
    }
  }
  return null;
}
