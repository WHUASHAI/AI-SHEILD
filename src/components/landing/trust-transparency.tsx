'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { CheckCircle2, AlertTriangle, ArrowRight, Shield } from 'lucide-react';
import { DISCLAIMER } from '@/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const points = [
  'We employ statistical models that provide a probability, not absolute certainty.',
  'False positives (human content flagged as AI) can occur, especially with highly structured writing or heavily edited authentic photos.',
  'False negatives (AI content flagged as human) can occur as AI generation tools rapidly evolve.',
  'Results should be used as one data point in a broader verification process, not as definitive proof for punitive actions.',
];

export function TrustTransparency() {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section className="py-28 relative overflow-hidden" style={{ background: '#09182e' }}>
      <div className="absolute inset-0 bg-dot-pattern opacity-20 pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(78,122,177,0.3), transparent)' }} />

      <div className="container mx-auto px-4 max-w-6xl relative z-10" ref={ref}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-14 items-center">

          {/* Left: copy */}
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full badge-primary text-xs font-semibold uppercase tracking-widest mb-6">
              <Shield className="w-3 h-3 text-cyan-azure" />
              Transparency First
            </span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-6 leading-tight">
              Trust &{' '}
              <span className="gradient-text">Transparency</span>
            </h2>
            <p className="text-air-sup-blue mb-8 leading-relaxed text-lg">
              We believe in being upfront about the capabilities and limitations of AI detection technology. While our tools are state-of-the-art, no system is infallible.
            </p>

            <ul className="space-y-4 mb-8">
              {points.map((point, i) => (
                <motion.li
                  key={i}
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, x: -16 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                >
                  <div className="mt-0.5 w-5 h-5 rounded-full bg-cyan-azure/12 border border-cyan-azure/25 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-cyan-azure" />
                  </div>
                  <span className="text-sm text-air-sup-blue leading-relaxed">{point}</span>
                </motion.li>
              ))}
            </ul>

            <Button variant="link" className="group px-0 text-cyan-azure hover:text-pink-lavender transition-colors" asChild>
              <Link href="/limitations" className="flex items-center gap-2">
                Read our full limitations policy
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </motion.div>

          {/* Right: disclaimer card */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.65, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="bento-card rounded-2xl p-8 relative overflow-hidden">
              {/* Large decorative triangle */}
              <div className="absolute top-0 right-0 p-4 opacity-4 pointer-events-none">
                <AlertTriangle className="w-40 h-40 text-pink-lavender" />
              </div>

              {/* Content */}
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2.5 mb-6 p-3 rounded-xl bg-pink-lavender/8 border border-pink-lavender/20">
                  <AlertTriangle className="w-5 h-5 text-pink-lavender shrink-0" />
                  <span className="text-pink-lavender font-semibold text-sm">Important Disclaimer</span>
                </div>

                <p className="text-air-sup-blue text-sm leading-relaxed mb-6">{DISCLAIMER}</p>

                <div className="p-4 rounded-xl border"
                  style={{ background: 'rgba(206,181,212,0.06)', borderColor: 'rgba(206,181,212,0.2)' }}
                >
                  <p className="text-xs text-pink-lavender/80 leading-relaxed">
                    Always combine automated detection results with human judgment and context verification.
                  </p>
                </div>
              </div>

              {/* Top glow line */}
              <div className="absolute inset-x-0 top-0 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(206,181,212,0.4), transparent)' }} />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
