import Link from 'next/link';
import { Logo } from '../shared/logo';
import { DISCLAIMER } from '@/types';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-space-cadet-dark border-t border-cyan-azure/20 pt-16 pb-8 relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-space-cadet/80 to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">

          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-6">
              <Logo size="md" />
            </Link>
            <p className="text-air-sup-blue text-sm mb-6 max-w-md leading-relaxed">
              Know where digital content really came from. Free, powerful AI detection for text,
              images, and videos.
            </p>
            {/* Social icons */}
            <div className="flex gap-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-9 h-9 rounded-lg glass-card hover:border-cyan-azure/50 hover:bg-cyan-azure/10 flex items-center justify-center cursor-pointer transition-all duration-200"
                />
              ))}
            </div>
          </div>

          {/* Product links */}
          <div>
            <h4 className="font-semibold text-pink-lavender mb-4 text-sm uppercase tracking-wider">Product</h4>
            <ul className="space-y-3">
              {[
                ['Text Detector',      '/tools/text-detector'],
                ['Image Detector',     '/tools/image-detector'],
                ['Video Detector',     '/tools/video-detector'],
                ['Deepfake Detector',  '/tools/deepfake-detector'],
                ['Batch Scanner',      '/tools/batch-scanner'],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-air-sup-blue hover:text-pink-lavender transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources links */}
          <div>
            <h4 className="font-semibold text-pink-lavender mb-4 text-sm uppercase tracking-wider">Resources</h4>
            <ul className="space-y-3">
              {[
                ['How It Works',       '/how-it-works'],
                ['Use Cases',          '/use-cases'],
                ['API Documentation',  '/api-docs'],
                ['Sample Report',      '/sample-report'],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-air-sup-blue hover:text-pink-lavender transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h4 className="font-semibold text-pink-lavender mb-4 text-sm uppercase tracking-wider">Company</h4>
            <ul className="space-y-3">
              {[
                ['About Us',          '/about'],
                ['Limitations Policy','/limitations'],
                ['Privacy Policy',    '/privacy'],
                ['Terms of Service',  '/terms'],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-air-sup-blue hover:text-pink-lavender transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-cyan-azure/15 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-ucla-blue">
            © {currentYear} AI Shield. All rights reserved.
          </p>
          <div className="text-xs text-ucla-blue max-w-2xl text-center md:text-right leading-relaxed">
            {DISCLAIMER}
          </div>
        </div>
      </div>
    </footer>
  );
}
