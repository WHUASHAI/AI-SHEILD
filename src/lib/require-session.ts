import { NextResponse } from 'next/server';
import { auth } from './auth';

export async function requireSessionResponse() {
  const session = await auth();
  return session?.user ? null : NextResponse.json({ error: 'Sign in before scanning or viewing private reports.' }, { status: 401 });
}
