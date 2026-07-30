'use client';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/shared/logo';

export function StartScanning() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4 text-center">
        <div className="flex justify-center mb-6">
          <Logo size="lg" />
        </div>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-6">
          Ready to Analyze Your Content?
        </h2>
        <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
          Start scanning your text, images, or videos for free. No payment or account required to get started.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-0 text-base h-12 px-8" asChild>
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
