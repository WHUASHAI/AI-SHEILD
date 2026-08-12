import type { Metadata } from 'next';
import { Geist, Geist_Mono, Inter } from 'next/font/google';
import './globals.css';
import { ThemeProviderWrapper } from '@/components/theme-provider-wrapper';

const inter     = Inter({ variable: '--font-inter', subsets: ['latin'], display: 'swap' });
const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'AI Shield — Know Where Digital Content Really Came From',
    template: '%s | AI Shield',
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
    icon:     [{ url: '/favicon-shield.jpg', type: 'image/jpeg', sizes: '512x512' }],
    apple:    [{ url: '/favicon-shield.jpg', type: 'image/jpeg', sizes: '512x512' }],
    shortcut:  '/favicon-shield.jpg',
  },

  // ── Open Graph ─────────────────────────────────────────────────────────
  openGraph: {
    title: 'AI Shield',
    description: 'Know Where Digital Content Really Came From',
    type: 'website',
    images: [{ url: '/favicon-shield.jpg', width: 512, height: 512, alt: 'AI Shield' }],
  },
  twitter: {
    card: 'summary',
    title: 'AI Shield',
    description: 'Free AI detection for text, images, and videos.',
    images: ['/favicon-shield.jpg'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}