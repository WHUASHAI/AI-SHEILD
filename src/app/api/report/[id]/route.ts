import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  // Return mock report data
  return NextResponse.json({
    id: params.id,
    message: 'Database not configured. Add DATABASE_URL to enable persistence.',
    status: 'pending_setup'
  });
}
