import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  
  if (!body.email || !body.password || !body.name) {
    return NextResponse.json({ error: 'Name, email, and password required' }, { status: 400 });
  }
  
  return NextResponse.json({ 
    message: 'Auth service not yet configured. Connect NextAuth or Clerk to enable authentication.',
    status: 'pending_setup'
  }, { status: 501 });
}
