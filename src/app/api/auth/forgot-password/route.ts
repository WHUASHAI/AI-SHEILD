import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  
  if (!body.email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 });
  }
  
  return NextResponse.json({ 
    message: 'Auth service not yet configured. Connect NextAuth or Clerk to enable authentication.',
    status: 'pending_setup'
  }, { status: 501 });
}
