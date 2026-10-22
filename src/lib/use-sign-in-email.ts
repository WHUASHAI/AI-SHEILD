'use client';

import { useSyncExternalStore } from 'react';
import { z } from 'zod';

const STORAGE_KEY = 'aishield_sign_in_email';
const CHANGE_EVENT = 'aishield:sign-in-email';

export const signInEmailSchema = z.string().trim().email('Please enter a valid email address');

function readEmail(): string {
  try {
    const result = signInEmailSchema.safeParse(window.sessionStorage.getItem(STORAGE_KEY));
    return result.success ? result.data : '';
  } catch {
    return '';
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener('storage', onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function getServerEmail() {
  return null;
}

export function useSignInEmail() {
  return useSyncExternalStore<string | null>(subscribe, readEmail, getServerEmail);
}

export function saveSignInEmail(email: string) {
  window.sessionStorage.setItem(STORAGE_KEY, signInEmailSchema.parse(email));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}
