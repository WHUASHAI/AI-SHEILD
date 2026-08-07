'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ShieldCheck, FileText, ImageIcon, Scan, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32 gradient-hero">
      {/* Decorative radial orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-cyan-azure/10 blur-[120px] -z-10 pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-pink-lavender/8 blur-[100px] -z-10 pointer-events-none rounded-full" />

      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

          {/* ── Left Text Content ── */}
          <div className="flex-1 text-center lg:text-left z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
            >
              {/* Badge */}
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full badge-primary text-sm font-medium mb-6">
                <ShieldCheck className="w-4 h-4 text-cyan-azure" />
                <span className="text-air-sup-blue">Free · No Payment Required · Open Platform</span>
              </span>

              {/* Headline */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6 leading-tight">
                Know Where Digital Content{' '}
                <br className="hidden lg:block" />
                <span className="gradient-text">Really Came From</span>
              </h1>

              <p className="text-lg text-air-sup-blue mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                The most advanced, completely free AI detection platform. Analyze text, images, and
                videos for signs of AI generation, synthetic editing, enhancement, and deepfake
                manipulation.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-4">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-cyan-azure to-air-sup-blue hover:from-cyan-azure-dark hover:to-cyan-azure text-white border-0 text-base h-12 px-8 shadow-palette-glow transition-all duration-300"
                  asChild
                >
                  <Link href="/dashboard/new-scan">
                    Start Scanning for Free
                    <ChevronRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto h-12 px-8 border-cyan-azure/40 text-air-sup-blue hover:bg-cyan-azure/10 hover:text-pink-lavender hover:border-pink-lavender/40 transition-all"
                  asChild
                >
                  <Link href="/sample-report">View Sample Report</Link>
                </Button>
              </div>
              <p className="text-xs text-ucla-blue">Free to use. No payment information required.</p>
            </motion.div>
          </div>

          {/* ── Right Product Preview ── */}
          <motion.div
            className="flex-1 w-full max-w-lg lg:max-w-none relative z-10"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="relative rounded-2xl glass-card p-6 shadow-palette overflow-hidden animate-float">
              {/* Top gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-azure/5 via-transparent to-pink-lavender/5 pointer-events-none" />

              {/* File header row */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-cyan-azure/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-cyan-azure/15 border border-cyan-azure/30 flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 text-cyan-azure" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">portrait_shot.jpg</div>
                    <div className="text-xs text-air-sup-blue">2.4 MB · Image Analysis</div>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-semibold">
                  Likely AI-Generated
                </div>
              </div>

              {/* AI Probability bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-air-sup-blue">AI Probability</span>
                  <span className="text-foreground font-bold">87%</span>
                </div>
                <div className="w-full h-2.5 bg-space-cadet-dark rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-azure via-pink-lavender to-red-400"
                    initial={{ width: 0 }}
                    animate={{ width: '87%' }}
                    transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
                  />
                </div>
              </div>

              {/* Detected signals */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                  <Sparkles className="w-4 h-4 text-pink-lavender" />
                  Detected Signals
                </div>

                {[
                  { icon: Scan,         text: 'Unnatural texture patterns detected in background', color: 'text-pink-lavender' },
                  { icon: FileText,     text: 'Missing EXIF camera metadata',                      color: 'text-air-sup-blue' },
                  { icon: CheckCircle2, text: 'Lighting inconsistencies on subject',               color: 'text-red-400' },
                ].map((signal, i) => (
                  <motion.div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-lg bg-space-cadet-dark/60 border border-cyan-azure/15 hover:border-cyan-azure/30 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 1 + i * 0.2 }}
                  >
                    <signal.icon className={`w-4 h-4 mt-0.5 shrink-0 ${signal.color}`} />
                    <span className="text-sm text-air-sup-blue">{signal.text}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Glow halo behind card */}
            <div className="absolute -inset-2 bg-gradient-to-r from-cyan-azure/20 to-pink-lavender/15 rounded-2xl blur-2xl -z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
