'use client';

import { useSearchParams } from 'next/navigation';

export function AuthErrorNotice() {
  const error = useSearchParams().get('error');
  if (!error) return null;
  const message = error === 'Configuration'
    ? 'Account sign-in is not available yet. Please choose another option.'
    : error === 'AccessDenied'
      ? 'Your account could not be verified. Please verify it with the account provider and try again.'
    : 'Sign-in could not be completed. Please try again.';
  return <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center text-sm text-red-300">{message}</p>;
}
