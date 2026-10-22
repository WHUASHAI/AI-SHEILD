import { cookies } from 'next/headers';
import { GUEST_COOKIE_NAME, isGuestCookie } from './guest-mode';

export async function hasGuestAccess(): Promise<boolean> {
  return isGuestCookie((await cookies()).get(GUEST_COOKIE_NAME)?.value);
}
