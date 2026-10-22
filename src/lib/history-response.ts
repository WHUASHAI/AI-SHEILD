import { NextResponse } from 'next/server';
import { getTrustedAuthOrigin } from './auth-settings';
import { HistoryError } from './history-core';
export function privateJson(data: unknown,status=200) {
  return NextResponse.json(data,{status,headers:{'Cache-Control':'private, no-store','Vary':'Cookie'}});
}
export function requireHistoryOrigin(request: Request) {
  const origin = getTrustedAuthOrigin(request.url);
  if (!origin || request.headers.get('origin')!==origin) throw new HistoryError('Open this action from AI-SHIELD.',403);
}
export function historyFailure(error: unknown) {
  return error instanceof HistoryError ? privateJson({error:error.message},error.status) : privateJson({error:'History database unavailable. Please try again.'},503);
}
