import { NextResponse } from 'next/server';
import { requireSessionResponse } from '@/lib/require-session';

// Keep old cached clients from calling the removed paid integration.
export async function POST() {
  const unauthorized = await requireSessionResponse();
  if (unauthorized) return unauthorized;
  return NextResponse.json({
    error: 'Text analysis now runs on your device. Refresh the Text Analysis page and run the free detector there.',
    code: 'ON_DEVICE_TEXT_ONLY',
  }, { status: 410, headers: { 'Cache-Control': 'private, no-store' } });
}
