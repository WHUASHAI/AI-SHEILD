'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import { ChevronRight, CheckCircle2, Sparkles, Shield, Zap, Lock, Database, Files, Code2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const benefits = [
  { icon: Shield,   label: 'No subscription required'            },
  { icon: Zap,      label: 'Unlimited daily scans'               },
  { icon: Lock,     label: 'No premium paywalls'                 },
  { icon: Database, label: 'Full access to all detection models' },
  { icon: Shield,   label: 'Privacy-first analysis'              },
  { icon: Files,    label: 'Detailed forensic reports'           },
  { icon: Files,    label: 'Batch processing included'           },
  { icon: Code2,    label: 'API access available'                },
];

export function FreePlatform() {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section className="py-28 relative overflow-hidden bg-space-cadet">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#09182e] to-space-cadet pointer-events-none" />
      <div className="absolute inset-0 bg-dot-pattern opacity-15 pointer-events-none" />

      {/* Ambient orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none animate-orb-pulse"
        style={{ background: 'radial-gradient(circle, rgba(78,122,177,0.07) 0%, transparent 65%)' }} />

      <div className="container mx-auto px-4 relative z-10" ref={ref}>
        {/* Removed box card */}
      </div>
    </section>
  );
}
