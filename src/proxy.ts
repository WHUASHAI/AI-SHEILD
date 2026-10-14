export { auth as proxy } from '@/lib/auth';

export const config = {
  matcher: ['/dashboard/:path*', '/api/scan/:path*', '/api/report/:path*', '/sign-in/:path*', '/sign-up'],
};
