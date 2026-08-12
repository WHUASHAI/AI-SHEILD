'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { FileText, Image as ImageIcon, Video, Database, BookOpen, Zap } from 'lucide-react';

const columns = [
  {
    title: 'Text Signals',
    icon: FileText,
    accentColor: '#4E7AB1',
    accentBg: 'rgba(78,122,177,0.12)',
    accentBorder: 'rgba(78,122,177,0.25)',
    items: [
      { label: 'Perplexity & Burstiness', strength: 92 },
      { label: 'Predictable token choices', strength: 88 },
      { label: 'Repetitive phrasing', strength: 74 },
      { label: 'Lack of semantic depth', strength: 81 },
    ],
  },
  {
    title: 'Plagiarism Signals',
    icon: BookOpen,
    accentColor: '#9b8cc4',
    accentBg: 'rgba(155,140,196,0.12)',
    accentBorder: 'rgba(155,140,196,0.25)',
    items: [
      { label: 'Cross-source matching', strength: 95 },
      { label: 'Paraphrased structure', strength: 79 },
      { label: 'Originality scoring', strength: 88 },
      { label: 'Source attribution ID', strength: 72 },
    ],
  },
  {
    title: 'Image Signals',
    icon: ImageIcon,
    accentColor: '#CEB5D4',
    accentBg: 'rgba(206,181,212,0.12)',
    accentBorder: 'rgba(206,181,212,0.25)',
    items: [
      { label: 'Lighting inconsistencies', strength: 86 },
      { label: 'Asymmetrical features', strength: 91 },
      { label: 'Unnatural textures', strength: 83 },
      { label: 'Generative noise', strength: 77 },
    ],
  },
  {
    title: 'Video Signals',
    icon: Video,
    accentColor: '#7D9FC0',
    accentBg: 'rgba(125,159,192,0.12)',
    accentBorder: 'rgba(125,159,192,0.25)',
    items: [
      { label: 'Temporal inconsistency', strength: 89 },
      { label: 'Unnatural blinking', strength: 84 },
      { label: 'Audio-visual desync', strength: 93 },
      { label: 'Edge bleeding', strength: 78 },
    ],
  },
  {
    title: 'Metadata Signals',
    icon: Database,
    accentColor: '#6a83a8',
    accentBg: 'rgba(106,131,168,0.12)',
    accentBorder: 'rgba(106,131,168,0.25)',
    items: [
      { label: 'Missing EXIF data', strength: 97 },
      { label: 'Software signatures', strength: 85 },
      { label: 'Inconsistent timestamps', strength: 90 },
      { label: 'AI tool footprints', strength: 88 },
    ],
  },
];

function SignalBar({ label, strength, color, delay }: { label: string; strength: number; color: string; delay: number }) {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <div ref={ref} className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-air-sup-blue truncate pr-2">{label}</span>
        <span className="text-foreground/70 font-medium shrink-0">{strength}%</span>
      </div>
      <div className="w-full h-1.5 bg-space-cadet-dark rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}aa, ${color})` }}
          initial={{ width: 0 }}
          animate={inView ? { width: `${strength}%` } : { width: 0 }}
          transition={{ duration: 0.9, delay, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

export function DetectionCapabilities() {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section className="py-28 relative overflow-hidden" style={{ background: '#09182e' }}>
      {/* Background */}
      <div className="absolute inset-0 bg-grid-pattern bg-grid-fade opacity-40 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(78,122,177,0.08) 0%, transparent 70%)', top: '-100px' }} />
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(206,181,212,0.06) 0%, transparent 70%)' }} />

      <div className="container mx-auto px-4 relative z-10" ref={ref}>
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full badge-accent text-xs font-semibold uppercase tracking-widest mb-5">
            <Zap className="w-3 h-3 text-pink-lavender" />
            Multi-Modal Analysis
          </span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-5">
            Comprehensive{' '}
            <span className="gradient-text">Detection Capabilities</span>
          </h2>
          <p className="text-air-sup-blue max-w-2xl mx-auto text-lg leading-relaxed">
            Our multi-modal approach looks at hundreds of subtle signals across different media types, providing nuanced probability scores.
          </p>
        </motion.div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 max-w-7xl mx-auto">
          {columns.map((col, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: i * 0.1 }}
              className="bento-card rounded-2xl p-6 group"
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/5">
                <div className="w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110"
                  style={{ background: col.accentBg, borderColor: col.accentBorder }}
                >
                  <col.icon className="w-4 h-4" style={{ color: col.accentColor }} />
                </div>
                <h3 className="font-semibold text-foreground text-sm">{col.title}</h3>
              </div>

              {/* Signal bars */}
              <div className="space-y-4">
                {col.items.map((item, j) => (
                  <SignalBar
                    key={j}
                    label={item.label}
                    strength={item.strength}
                    color={col.accentColor}
                    delay={0.4 + i * 0.08 + j * 0.07}
                  />
                ))}
              </div>

              {/* Hover top glow line */}
              <div className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `linear-gradient(90deg, transparent, ${col.accentColor}60, transparent)` }} />
            </motion.div>
          ))}
        </div>

        <p className="text-center text-xs text-ucla-blue mt-10 max-w-3xl mx-auto leading-relaxed opacity-60">
          Note: Not every signal is available for every file. Missing metadata does not automatically indicate AI-generated content,
          but serves as one of many indicators in our overall probability assessment.
        </p>
      </div>
    </section>
  );
}
