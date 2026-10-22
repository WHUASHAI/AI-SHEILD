'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { UploadCloud, ScanLine, BarChart3, Download, ArrowRight } from 'lucide-react';

const steps = [
  {
    title: 'Upload Your Content',
    icon: UploadCloud,
    desc: 'Drag and drop text, images, or videos into the scanner. Supports all major formats.',
    accentColor: '#4E7AB1',
    accentBg: 'rgba(78,122,177,0.12)',
    accentBorder: 'rgba(78,122,177,0.3)',
  },
  {
    title: 'Run the Analysis',
    icon: ScanLine,
    desc: 'Our ensemble of AI models analyzes the content for synthetic signatures in seconds.',
    accentColor: '#7D9FC0',
    accentBg: 'rgba(125,159,192,0.12)',
    accentBorder: 'rgba(125,159,192,0.3)',
  },
  {
    title: 'Review the Evidence',
    icon: BarChart3,
    desc: 'See a detailed breakdown of detected signals and overall AI probability score.',
    accentColor: '#CEB5D4',
    accentBg: 'rgba(206,181,212,0.12)',
    accentBorder: 'rgba(206,181,212,0.3)',
  },
  {
    title: 'Export the Report',
    icon: Download,
    desc: 'Download a verifiable PDF report for your records or share it with stakeholders.',
    accentColor: '#6a83a8',
    accentBg: 'rgba(106,131,168,0.12)',
    accentBorder: 'rgba(106,131,168,0.3)',
  },
];

export function HowItWorks() {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="py-28 relative overflow-hidden bg-space-cadet">
      {/* Ambient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#09182e] via-space-cadet to-space-cadet pointer-events-none" />
      <div className="absolute inset-0 bg-dot-pattern opacity-20 pointer-events-none" />

      {/* Centre glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(78,122,177,0.1) 0%, transparent 70%)' }} />

      <div className="container mx-auto px-4 relative z-10" ref={ref}>
        {/* Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55 }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full badge-primary text-xs font-semibold uppercase tracking-widest mb-5">
            Simple Process
          </span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-5">
            How It <span className="gradient-text-primary">Works</span>
          </h2>
          <p className="text-air-sup-blue max-w-xl mx-auto text-lg">
            Get comprehensive results in seconds with our streamlined four-step process.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative max-w-5xl mx-auto">
          {/* Connecting animated line (desktop) */}
          <div className="hidden md:block absolute top-[2.25rem] left-[12.5%] right-[12.5%] z-0">
            <div className="relative h-0.5">
              <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(78,122,177,0.15), rgba(206,181,212,0.25), rgba(78,122,177,0.15))' }} />
              {inView && (
                <motion.div
                  className="absolute inset-y-0 left-0 h-full"
                  style={{ background: 'linear-gradient(90deg, #4E7AB1, #7D9FC0, #CEB5D4)' }}
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1.5, delay: 0.4, ease: 'easeInOut' }}
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                className="flex flex-col items-center text-center"
                initial={{ opacity: 0, y: 32 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.55, delay: 0.2 + i * 0.15 }}
              >
                {/* Icon circle */}
                <div className="relative mb-6 group cursor-default">
                  <div
                    className="w-18 h-18 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                    style={{
                      background: step.accentBg,
                      border: `1px solid ${step.accentBorder}`,
                      boxShadow: `0 0 0 0 ${step.accentColor}`,
                      width: 72, height: 72,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow = `0 0 20px ${step.accentColor}50`;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 0 transparent';
                    }}
                  >
                    <step.icon className="w-7 h-7" style={{ color: step.accentColor }} />
                  </div>
                  {/* Step number badge */}
                  <div
                    className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center border-2 border-space-cadet"
                    style={{ background: step.accentColor }}
                  >
                    {i + 1}
                  </div>
                </div>

                <h3 className="text-sm font-semibold text-foreground mb-2 leading-snug">{step.title}</h3>
                <p className="text-xs text-air-sup-blue leading-relaxed">{step.desc}</p>

                {/* Arrow connector (mobile) */}
                {i < steps.length - 1 && (
                  <div className="md:hidden mt-4 text-cyan-azure/40">
                    <ArrowRight className="w-4 h-4 rotate-90" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
