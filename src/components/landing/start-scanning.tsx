'use client';
import Link from 'next/link';
import { ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/shared/logo';

export function StartScanning() {
  return (
    <section className="py-24 bg-space-cadet relative overflow-hidden">
      {/* Decorative glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-cyan-azure/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-pink-lavender/6 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="flex justify-center mb-6">
          <Logo size="lg" />
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full badge-accent text-sm font-medium mb-6">
          <Sparkles className="w-4 h-4 text-pink-lavender" />
          <span className="text-pink-lavender/80">Enterprise-grade · Always Free</span>
        </div>

        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-6">
          Ready to Analyze{' '}
          <span className="gradient-text">Your Content?</span>
        </h2>
        <p className="text-lg text-air-sup-blue mb-10 max-w-2xl mx-auto leading-relaxed">
          Start scanning your text, images, or videos for free. No payment or account required to get
          started.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            className="bg-gradient-to-r from-cyan-azure to-air-sup-blue hover:from-cyan-azure-dark hover:to-cyan-azure text-white border-0 text-base h-12 px-10 shadow-palette-glow animate-pulse-ring"
            asChild
          >
            <Link href="/dashboard/new-scan">
              Start Scanning Now
              <ChevronRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
