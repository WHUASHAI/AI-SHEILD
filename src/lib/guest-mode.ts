// This flag selects public guest scanning. It is never proof of Google authentication.
export const GUEST_COOKIE_NAME = 'aishield_guest_mode';
export const isGuestCookie = (value: string | undefined) => value === '1';

export function isGuestBrowser(cookie: string): boolean {
  return cookie.split(';').some(part => part.trim() === `${GUEST_COOKIE_NAME}=1`);
}

export function isGuestAccessiblePath(path: string): boolean {
  if (path.startsWith('/api/scan/')) return true;
  return ['/dashboard', '/dashboard/new-scan', '/dashboard/text', '/dashboard/image',
    '/dashboard/video', '/dashboard/deepfake', '/dashboard/plagiarism', '/dashboard/history']
    .includes(path) || path.startsWith('/dashboard/scans/');
}
