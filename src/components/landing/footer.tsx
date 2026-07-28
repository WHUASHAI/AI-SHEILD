import Link from 'next/link';
import { Logo } from '../shared/logo';
import { DISCLAIMER } from '@/types';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t border-border pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-6">
              <Logo size="md" />
            </Link>
            <p className="text-muted-foreground text-sm mb-6 max-w-md">
              Know where digital content really came from. Free, powerful AI detection for text, images, and videos.
            </p>
            {/* Social Icons Placeholder */}
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded bg-surface border border-border hover:border-cyan-500/50 flex items-center justify-center cursor-pointer transition-colors" />
              <div className="w-8 h-8 rounded bg-surface border border-border hover:border-cyan-500/50 flex items-center justify-center cursor-pointer transition-colors" />
              <div className="w-8 h-8 rounded bg-surface border border-border hover:border-cyan-500/50 flex items-center justify-center cursor-pointer transition-colors" />
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Product</h4>
            <ul className="space-y-3">
              <li><Link href="/tools/text-detector" className="text-sm text-muted-foreground hover:text-cyan-400 transition-colors">Text Detector</Link></li>
              <li><Link href="/tools/image-detector" className="text-sm text-muted-foreground hover:text-cyan-400 transition-colors">Image Detector</Link></li>
              <li><Link href="/tools/video-detector" className="text-sm text-muted-foreground hover:text-cyan-400 transition-colors">Video Detector</Link></li>
              <li><Link href="/tools/deepfake-detector" className="text-sm text-muted-foreground hover:text-cyan-400 transition-colors">Deepfake Detector</Link></li>
              <li><Link href="/tools/batch-scanner" className="text-sm text-muted-foreground hover:text-cyan-400 transition-colors">Batch Scanner</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Resources</h4>
            <ul className="space-y-3">
              <li><Link href="/how-it-works" className="text-sm text-muted-foreground hover:text-cyan-400 transition-colors">How It Works</Link></li>
              <li><Link href="/use-cases" className="text-sm text-muted-foreground hover:text-cyan-400 transition-colors">Use Cases</Link></li>
              <li><Link href="/api-docs" className="text-sm text-muted-foreground hover:text-cyan-400 transition-colors">API Documentation</Link></li>
              <li><Link href="/sample-report" className="text-sm text-muted-foreground hover:text-cyan-400 transition-colors">Sample Report</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-sm text-muted-foreground hover:text-cyan-400 transition-colors">About Us</Link></li>
              <li><Link href="/limitations" className="text-sm text-muted-foreground hover:text-cyan-400 transition-colors">Limitations Policy</Link></li>
              <li><Link href="/privacy" className="text-sm text-muted-foreground hover:text-cyan-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm text-muted-foreground hover:text-cyan-400 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {currentYear} AI Shield. All rights reserved.
          </p>
          <div className="text-xs text-muted-foreground max-w-2xl text-center md:text-right">
            {DISCLAIMER}
          </div>
        </div>
      </div>
    </footer>
  );
}
