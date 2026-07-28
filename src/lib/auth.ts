// Auth configuration - install next-auth when ready
// npm install next-auth@beta @auth/prisma-adapter
// This is a stub until NextAuth v5 is configured

export const AUTH_CONFIG = {
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: '/sign-in',
    signOut: '/',
    error: '/sign-in',
    verifyRequest: '/verify-email',
  },
} as const;

// Stub session type
export interface Session {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role: 'user' | 'admin';
  };
  expires: string;
}
