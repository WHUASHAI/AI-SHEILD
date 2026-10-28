'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LandingFooter } from './v2/footer';
import { Logo } from '../shared/logo';
import { DISCLAIMER } from '@/types';
import { ExternalLink } from 'lucide-react';
import { FOOTER_NAV_LINKS as links } from '@/lib/public-navigation';

export function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  if (pathname === '/') return <LandingFooter />;

  return (
    <footer className="relative overflow-hidden" style={{ background: '#070f1d' }}>
      {/* Top gradient border */}
      <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent 5%, rgba(78,122,177,0.5) 30%, rgba(206,181,212,0.4) 50%, rgba(78,122,177,0.5) 70%, transparent 95%)' }} />

      {/* Background elements */}
      <div className="absolute inset-0 bg-dot-pattern opacity-15 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(78,122,177,0.06) 0%, transparent 70%)' }} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="pt-16 pb-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12">

          {/* Brand column */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="inline-block">
              <Logo size="md" />
            </Link>
            <p className="text-air-sup-blue text-sm leading-relaxed max-w-xs">
              Know where digital content really came from. Free, powerful AI detection for text, images, and videos.
            </p>

            {/* Status pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full badge-primary text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-air-sup-blue">All systems operational</span>
            </div>
          </div>

          {/* Nav columns */}
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <h4 className="font-semibold text-pink-lavender mb-5 text-xs uppercase tracking-widest">{section}</h4>
              <ul className="space-y-3">
                {items.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="group flex items-center gap-1.5 text-sm text-air-sup-blue hover:text-pink-lavender transition-colors duration-200"
                    >
                      {label}
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-cyan-azure/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-ucla-blue/70">
            © {currentYear} Elucid AI. All rights reserved. Built with transparency.
          </p>
          <div className="text-xs text-ucla-blue/50 max-w-xl text-center md:text-right leading-relaxed">
            {DISCLAIMER}
          </div>
        </div>
      </div>
    </footer>
  );
}
