import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Return mock report data
  return NextResponse.json({
    id: id,
    message: 'Database not configured. Add DATABASE_URL to enable persistence.',
    status: 'pending_setup'
  });
}
