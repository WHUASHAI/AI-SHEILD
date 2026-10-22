'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  BookOpen, GraduationCap, Newspaper, Shield, Share2, Briefcase,
  Scale, FlaskConical, PenTool, Users, Building2, User,
} from 'lucide-react';

const cases = [
  { title: 'Students & Teachers',    icon: BookOpen,      desc: 'Verify academic integrity and ensure original writing.',       accent: '#4E7AB1' },
  { title: 'Schools & Universities', icon: GraduationCap, desc: 'Institution-wide scanning for admissions and coursework.',     accent: '#7D9FC0' },
  { title: 'Journalists & Newsrooms',icon: Newspaper,     desc: 'Verify source materials and images before publication.',      accent: '#CEB5D4' },
  { title: 'Content Moderation',     icon: Shield,        desc: 'Filter synthetic spam and deepfakes from platforms.',         accent: '#6a83a8' },
  { title: 'Social Media',           icon: Share2,        desc: 'Identify coordinated inauthentic synthetic campaigns.',       accent: '#4E7AB1' },
  { title: 'Recruitment',            icon: Briefcase,     desc: 'Verify portfolios and applications for authenticity.',        accent: '#7D9FC0' },
  { title: 'Legal & Compliance',     icon: Scale,         desc: 'Establish the provenance of digital evidence.',              accent: '#CEB5D4' },
  { title: 'Researchers',            icon: FlaskConical,  desc: 'Study the prevalence and impact of AI-generated media.',     accent: '#6a83a8' },
  { title: 'Creative Agencies',      icon: PenTool,       desc: 'Ensure purchased assets and freelance work are authentic.',  accent: '#4E7AB1' },
  { title: 'Marketplace Admins',     icon: Users,         desc: 'Prevent fraud by verifying user-submitted product photos.',  accent: '#7D9FC0' },
  { title: 'Government Orgs',        icon: Building2,     desc: 'Protect against misinformation and synthetic propaganda.',   accent: '#CEB5D4' },
  { title: 'General Users',          icon: User,          desc: 'Fact-check viral content and media shared online.',          accent: '#6a83a8' },
];

export function UseCases() {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section className="py-28 relative overflow-hidden bg-space-cadet-dark">
      {/* Background */}
      <div className="absolute inset-0 bg-dot-pattern opacity-20 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(78,122,177,0.3), rgba(206,181,212,0.2), rgba(78,122,177,0.3), transparent)' }} />

      {/* Top left orb */}
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(78,122,177,0.07) 0%, transparent 70%)' }} />
      {/* Bottom right orb */}
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(206,181,212,0.05) 0%, transparent 70%)' }} />

      <div className="container mx-auto px-4 relative z-10" ref={ref}>
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55 }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full badge-accent text-xs font-semibold uppercase tracking-widest mb-5">
            Use Cases
          </span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-5">
            Who Uses{' '}
            <span className="gradient-text">AI Shield?</span>
          </h2>
          <p className="text-air-sup-blue max-w-xl mx-auto text-lg">
            Trusted by professionals across industries to verify digital authenticity.
          </p>
        </motion.div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
          {cases.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.45, delay: i * 0.05 }}
              className="group bento-card rounded-xl p-5 cursor-default"
              whileHover={{ y: -4, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
            >
              {/* Icon */}
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center mb-3 transition-all duration-300 group-hover:scale-110"
                style={{
                  background: `${c.accent}18`,
                  border: `1px solid ${c.accent}35`,
                }}
              >
                <c.icon className="w-4.5 h-4.5" style={{ color: c.accent, width: 18, height: 18 }} />
              </div>

              <h3 className="font-semibold text-foreground text-sm mb-1.5 group-hover:text-pink-lavender transition-colors duration-200">
                {c.title}
              </h3>
              <p className="text-xs text-air-sup-blue leading-relaxed">{c.desc}</p>

              {/* Bottom glow line on hover */}
              <div className="absolute bottom-0 left-0 h-px w-0 group-hover:w-full transition-all duration-500"
                style={{ background: `linear-gradient(90deg, transparent, ${c.accent}80, transparent)` }} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
