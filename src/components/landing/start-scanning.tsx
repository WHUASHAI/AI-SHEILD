'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import { ChevronRight, Sparkles, Zap, Lock, Eye, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/shared/logo';

export function StartScanning() {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section className="py-28 relative overflow-hidden" style={{ background: '#07111e' }}>
      {/* Layered radial glows */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(78,122,177,0.15) 0%, transparent 65%)' }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(206,181,212,0.08) 0%, transparent 65%)' }}
        animate={{ scale: [1, 1.12, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
      />

      {/* Grid */}
      <div className="absolute inset-0 bg-grid-pattern bg-grid-fade opacity-30 pointer-events-none" />

      {/* Floating beam accents */}
      <div className="cta-beam left-[20%] top-[10%]" style={{ animationDelay: '0s' }} />
      <div className="cta-beam right-[20%] top-[15%]" style={{ animationDelay: '1.5s' }} />
      <div className="cta-beam left-[40%] bottom-[10%]" style={{ animationDelay: '0.7s' }} />

      {/* Top border line */}
      <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(78,122,177,0.4), rgba(206,181,212,0.3), rgba(78,122,177,0.4), transparent)' }} />

      <div className="container mx-auto px-4 text-center relative z-10" ref={ref}>
        {/* Logo */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5 }}
        >
          <div className="relative">
            <div className="absolute -inset-4 rounded-full pointer-events-none animate-orb-pulse"
              style={{ background: 'radial-gradient(circle, rgba(78,122,177,0.2) 0%, transparent 70%)' }} />
            <Logo size="lg" />
          </div>
        </motion.div>

        {/* Badge removed */}

        {/* Headline */}
        <motion.h2
          className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6 leading-tight"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, delay: 0.2 }}
        >
          Ready to Analyze{' '}
          <span className="gradient-text-bright">Your Content?</span>
        </motion.h2>

        <motion.p
          className="text-xl text-air-sup-blue mb-12 max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.3 }}
        >
          Start scanning your text, images, or videos for free.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.4 }}
        >
          <Button
            size="lg"
            className="group bg-gradient-to-r from-cyan-azure to-air-sup-blue hover:from-cyan-azure-dark hover:to-cyan-azure text-white border-0 text-base h-14 px-10 btn-shimmer animate-glow-pulse hover:animate-none hover:shadow-[0_0_50px_rgba(78,122,177,0.7)] transition-all duration-300"
            asChild
          >
            <Link href="/dashboard">
              Start Scanning Now
              <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </motion.div>

        {/* Feature chips */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-4"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.55, delay: 0.55 }}
        >
          {[
            { icon: Zap,    label: 'Results in 2 seconds'  },
            { icon: Eye,    label: 'Privacy-first'          },
            { icon: Shield, label: '97% accuracy'           },
          ].map((c) => (
            <div key={c.label} className="flex items-center gap-2 text-sm text-air-sup-blue/70">
              <c.icon className="w-4 h-4 text-cyan-azure/60" />
              {c.label}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
