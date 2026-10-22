'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Shield, Clock, FileSearch, Globe } from 'lucide-react';

const stats = [
  { icon: FileSearch, value: 4_200_000, suffix: '+', label: 'Files Analyzed',   color: 'text-cyan-azure'    },
  { icon: Shield,     value: 97,        suffix: '%',  label: 'Detection Accuracy', color: 'text-pink-lavender' },
  { icon: Clock,      value: 2,         suffix: 's',  label: 'Avg. Scan Time',   color: 'text-air-sup-blue'  },
  { icon: Globe,      value: 180,       suffix: '+',  label: 'Countries Served', color: 'text-cyan-azure-light' },
];

function AnimatedNumber({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  useEffect(() => {
    if (!inView) return;
    let start: number | null = null;
    const duration = 1800;
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setCount(Math.floor(easeOut(progress) * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target]);

  const formatted = count >= 1_000_000
    ? (count / 1_000_000).toFixed(1) + 'M'
    : count >= 1_000
    ? (count / 1_000).toFixed(0) + 'K'
    : count.toString();

  return <span ref={ref}>{formatted}{suffix}</span>;
}

export function StatsBar() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <div ref={ref} className="relative border-y border-cyan-azure/15 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-space-cadet-dark via-space-cadet to-space-cadet-dark" />
      <div className="absolute inset-0 bg-dot-pattern opacity-30" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-cyan-azure/12">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex flex-col items-center gap-3 py-10 px-6 group hover:bg-cyan-azure/5 transition-colors duration-300"
            >
              <div className={`w-10 h-10 rounded-xl bg-space-cadet-dark border border-cyan-azure/20 flex items-center justify-center group-hover:border-cyan-azure/40 transition-colors ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div className="text-center">
                <div className={`text-3xl font-bold ${s.color} tabular-nums`}>
                  {inView
                    ? <AnimatedNumber target={s.value} suffix={s.suffix} />
                    : <span>0{s.suffix}</span>
                  }
                </div>
                <div className="text-xs text-ucla-blue mt-1 font-medium uppercase tracking-wider">{s.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Sheen */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-azure/3 to-transparent pointer-events-none step-line" style={{ top: 'auto', height: '1px', bottom: 0 }} />
    </div>
  );
}
