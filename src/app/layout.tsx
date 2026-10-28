import type { Metadata } from 'next';
import { Geist, Geist_Mono, Inter } from 'next/font/google';
import './globals.css';
import { getTrustedAuthOrigin } from '@/lib/auth-settings';

const inter     = Inter({ variable: '--font-inter', subsets: ['latin'], display: 'swap' });
const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(getTrustedAuthOrigin('http://localhost:3000') ?? 'http://localhost:3000'),
  title: {
    default: 'Elucid AI — Know Where Digital Content Really Came From',
    template: '%s | Elucid AI',
  },
  description:
    'Free AI detection platform for text, images, and videos. Analyze content for signs of AI generation, synthetic editing, enhancement, and deepfake manipulation.',
  keywords: [
    'AI detection',
    'plagiarism detector',
    'deepfake detector',
    'AI image detection',
    'AI text detection',
    'content authenticity',
  ],

  // ── Favicon / Icons ────────────────────────────────────────────────────
  // Next.js App Router automatically injects these as <link> tags in <head>
  icons: {
    icon: [
      { url: '/brand/favicon-v2-32.png', type: 'image/png', sizes: '32x32' },
      { url: '/brand/favicon-v2-16.png', type: 'image/png', sizes: '16x16' },
    ],
    apple: [{ url: '/brand/apple-touch-icon-v2.png', type: 'image/png', sizes: '180x180' }],
    shortcut: '/favicon.ico',
  },

  // ── Open Graph ─────────────────────────────────────────────────────────
  openGraph: {
    title: 'Elucid AI',
    description: 'Know Where Digital Content Really Came From',
    type: 'website',
    images: [{ url: '/brand/elucid-ai-lens.png', width: 512, height: 512, alt: 'Elucid AI' }],
  },
  twitter: {
    card: 'summary',
    title: 'Elucid AI',
    description: 'Free AI detection for text, images, and videos.',
    images: ['/brand/elucid-ai-lens.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
