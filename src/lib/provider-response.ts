import { NextResponse } from 'next/server';
import { ProviderError } from './provider-error';
export function providerFailure(error:unknown,fallback='Detection is temporarily unavailable. Please try later.') {
  const known=error instanceof ProviderError;
  return NextResponse.json({error:known?error.message:fallback,code:known?error.code:'DETECTION_UNAVAILABLE'},
    {status:known?error.status:503,headers:{'Cache-Control':'private, no-store',...(known&&error.retryAfter?{'Retry-After':error.retryAfter}:{})}});
}
