import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'AI Shield — Know Where Digital Content Really Came From',
    template: '%s | AI Shield',
  },
  description: 'Free AI detection platform for text, images, and videos. Analyze content for signs of AI generation, synthetic editing, enhancement, and deepfake manipulation.',
  keywords: ['AI detection', 'deepfake detector', 'AI image detection', 'AI text detection', 'content authenticity'],
  openGraph: {
    title: 'AI Shield',
    description: 'Know Where Digital Content Really Came From',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}>
        {children}
      </body>
    </html>
  );
}
