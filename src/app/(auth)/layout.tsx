import Link from 'next/link';
import { ScanLine, FileSearch } from 'lucide-react';
import { Logo } from '@/components/shared/logo';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-space-cadet">

      {/* ── Left brand panel ── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-space-cadet-dark via-space-cadet to-ucla-blue/20 relative overflow-hidden border-r border-cyan-azure/15">

        {/* Grid pattern background */}
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M0 40V0H40" fill="none" stroke="#4E7AB1" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-pattern)" />
          </svg>
        </div>

        {/* Ambient glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-cyan-azure/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-0 w-64 h-64 bg-pink-lavender/8 rounded-full blur-[80px] pointer-events-none" />

        {/* Logo + headline */}
        <div className="relative z-10 flex flex-col items-start space-y-8">
          <Link href="/">
            <Logo size="lg" />
          </Link>

          <div className="space-y-4 max-w-md">
            <h1 className="text-4xl font-bold text-foreground tracking-tight leading-tight">
              Know Where Digital Content{' '}
              <span className="gradient-text">Really Came From</span>
            </h1>
            <p className="text-lg text-air-sup-blue leading-relaxed">
              The most advanced multi-modal content detection platform to verify text, images, and
              audio authenticity.
            </p>
          </div>
        </div>

        {/* Feature highlights */}
        <div className="relative z-10 space-y-6 max-w-md">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-cyan-azure/10 rounded-xl border border-cyan-azure/25 shrink-0">
              <ScanLine className="h-6 w-6 text-cyan-azure" />
            </div>
            <div>
              <h3 className="text-foreground font-semibold mb-1">Advanced AI Detection</h3>
              <p className="text-sm text-air-sup-blue leading-relaxed">
                Identify AI-generated, human-written, or mixed content with high accuracy.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-pink-lavender/10 rounded-xl border border-pink-lavender/25 shrink-0">
              <FileSearch className="h-6 w-6 text-pink-lavender" />
            </div>
            <div>
              <h3 className="text-foreground font-semibold mb-1">Deep Source Analysis</h3>
              <p className="text-sm text-air-sup-blue leading-relaxed">
                Scan across images, audio, and documents to trace original provenance.
              </p>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <div className="relative z-10 text-xs text-ucla-blue leading-relaxed">
          <p>© {new Date().getFullYear()} AI Shield. All rights reserved.</p>
          <p className="mt-1">
            AI Shield provides a probability-based analysis. Results may contain false positives or
            false negatives and should not be treated as definitive proof.
          </p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col p-8 overflow-y-auto bg-space-cadet">
        {/* Mobile logo */}
        <div className="lg:hidden flex justify-center mb-8">
          <Link href="/">
            <Logo size="md" />
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md space-y-8">
            {children}
          </div>
        </div>
      </div>

    </div>
  );
}
