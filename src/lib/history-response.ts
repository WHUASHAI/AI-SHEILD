import { NextResponse } from 'next/server';
import { getGuestRequestOrigin } from './auth-settings';
import { HistoryError } from './history-core';
export function privateJson(data: unknown,status=200) {
  return NextResponse.json(data,{status,headers:{'Cache-Control':'private, no-store','Vary':'Cookie'}});
}
export function requireHistoryOrigin(request: Request) {
  // Use the same origin decision as guest entry: development follows the actual
  // loopback host/port, while production retains its configured HTTPS origin.
  const origin = getGuestRequestOrigin(request.url, request.headers.get('host'));
  if (!origin || request.headers.get('origin')!==origin) throw new HistoryError('Open this action from the Elucid AI website. Reload the page and try again.',403);
}
export function historyFailure(error: unknown) {
  return error instanceof HistoryError ? privateJson({error:error.message},error.status) : privateJson({error:'History database unavailable. Please try again.'},503);
}
