import Link from 'next/link';
import { Shield, ScanLine, FileSearch } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#0a0f1e]">
      {/* Left panel - brand */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900/30 relative overflow-hidden border-r border-slate-800">
        {/* Background grid pattern */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M0 40V0H40" fill="none" stroke="currentColor" strokeWidth="1" className="text-cyan-500/30" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-pattern)" />
          </svg>
        </div>

        {/* Logo and top content */}
        <div className="relative z-10 flex flex-col items-start space-y-6">
          <Link href="/" className="flex items-center gap-2 text-cyan-400">
            <Shield className="h-8 w-8" />
            <span className="text-2xl font-bold tracking-tight text-white">AI Shield</span>
          </Link>
          
          <div className="space-y-4 max-w-md">
            <h1 className="text-4xl font-bold text-white tracking-tight leading-tight">
              Know Where Digital Content Really Came From
            </h1>
            <p className="text-lg text-slate-300">
              The most advanced multi-modal content detection platform to verify text, images, and audio authenticity.
            </p>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="relative z-10 space-y-8 max-w-md">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-cyan-950/50 rounded-lg border border-cyan-900/50">
              <ScanLine className="h-6 w-6 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Advanced AI Detection</h3>
              <p className="text-sm text-slate-400">Identify AI-generated, human-written, or mixed content with high accuracy.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-950/50 rounded-lg border border-blue-900/50">
              <FileSearch className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Deep Source Analysis</h3>
              <p className="text-sm text-slate-400">Scan across images, audio, and documents to trace original provenance.</p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-sm text-slate-500">
          <p>© {new Date().getFullYear()} AI Shield. All rights reserved.</p>
          <p className="mt-1">AI Shield provides a probability-based analysis. Results may contain false positives or false negatives and should not be treated as definitive proof.</p>
        </div>
      </div>
      
      {/* Right panel - form */}
      <div className="flex-1 flex flex-col p-8 overflow-y-auto">
        <div className="lg:hidden flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2 text-cyan-400">
            <Shield className="h-8 w-8" />
            <span className="text-2xl font-bold tracking-tight text-white">AI Shield</span>
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
