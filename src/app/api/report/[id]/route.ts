import { NextRequest, NextResponse } from 'next/server';
import { requireSessionResponse } from '@/lib/require-session';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireSessionResponse();
  if (unauthorized) return unauthorized;
  const { id } = await params;
  
  // Return mock report data
  return NextResponse.json({
    id: id,
    message: 'Database not configured. Add DATABASE_URL to enable persistence.',
    status: 'pending_setup'
  });
}
