'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import {
  ShieldCheck, FileText, ImageIcon, Scan, CheckCircle2,
  ChevronRight, Sparkles, Zap, Lock, Eye, ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

/* ─ Animated particle canvas ─ */
function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = (canvas.width  = window.innerWidth);
    let H = (canvas.height = window.innerHeight);

    const particles: Array<{
      x: number; y: number; vx: number; vy: number;
      r: number; alpha: number; alphaDir: number;
    }> = Array.from({ length: 70 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.4,
      alpha: Math.random(), alphaDir: Math.random() > 0.5 ? 1 : -1,
    }));

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        p.alpha += p.alphaDir * 0.005;
        if (p.alpha >= 1 || p.alpha <= 0) p.alphaDir *= -1;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(78, 122, 177, ${p.alpha * 0.7})`;
        ctx.fill();
      }

      /* Connections */
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(78, 122, 177, ${0.12 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    const onResize = () => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}

/* ─ Animated scan card ─ */
const signals = [
  { icon: Scan,         text: 'Unnatural texture patterns detected',  color: 'text-pink-lavender', badge: 'High' },
  { icon: FileText,     text: 'Missing EXIF camera metadata',          color: 'text-air-sup-blue',  badge: 'Med'  },
  { icon: CheckCircle2, text: 'Lighting inconsistencies on subject',   color: 'text-red-400',        badge: 'High' },
];

function ScanCard() {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'scanning' | 'done'>('scanning');

  useEffect(() => {
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 4 + 1;
      if (p >= 87) { p = 87; setPhase('done'); clearInterval(interval); }
      setProgress(Math.min(p, 87));
    }, 60);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative rounded-2xl glass-card p-5 shadow-lg overflow-hidden animate-float">
      {/* Scanning line */}
      {phase === 'scanning' && (
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-azure to-transparent animate-scan-line pointer-events-none" />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-azure/5 via-transparent to-pink-lavender/5 pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-cyan-azure/15">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-azure/15 border border-cyan-azure/25 flex items-center justify-center">
            <ImageIcon className="w-5 h-5 text-cyan-azure" />
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">portrait_shot.jpg</div>
            <div className="text-xs text-air-sup-blue">2.4 MB · Image Analysis</div>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.5 }}
          className={`px-2.5 py-1 rounded-full text-xs font-bold ${
            phase === 'done'
              ? 'bg-red-500/12 border border-red-500/25 text-red-400'
              : 'bg-cyan-azure/12 border border-cyan-azure/25 text-cyan-azure'
          }`}
        >
          {phase === 'done' ? 'AI Detected' : 'Scanning…'}
        </motion.div>
      </div>

      {/* AI Probability bar */}
      <div className="mb-5">
        <div className="flex justify-between text-xs mb-2">
          <span className="text-air-sup-blue font-medium">AI Probability</span>
          <span className="text-foreground font-bold">{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-2 bg-space-cadet-dark rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #4E7AB1, #CEB5D4, #ef4444)',
            }}
            transition={{ type: 'spring', stiffness: 60 }}
          />
        </div>
      </div>

      {/* Signal pills */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2 text-xs font-semibold text-foreground mb-2">
          <Sparkles className="w-3.5 h-3.5 text-pink-lavender" />
          Detected Signals
        </div>
        {signals.map((s, i) => (
          <motion.div
            key={i}
            className="flex items-center justify-between p-2.5 rounded-lg bg-space-cadet-dark/60 border border-cyan-azure/12 hover:border-cyan-azure/28 transition-colors"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 1.2 + i * 0.18 }}
          >
            <div className="flex items-center gap-2.5">
              <s.icon className={`w-3.5 h-3.5 shrink-0 ${s.color}`} />
              <span className="text-xs text-air-sup-blue">{s.text}</span>
            </div>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              s.badge === 'High' ? 'bg-red-500/15 text-red-400' : 'bg-cyan-azure/15 text-cyan-azure'
            }`}>{s.badge}</span>
          </motion.div>
        ))}
      </div>

      {/* Confidence meter */}
      <div className="mt-4 pt-4 border-t border-cyan-azure/12 grid grid-cols-3 gap-3">
        {[
          { label: 'Confidence', value: '91%', color: 'text-pink-lavender' },
          { label: 'Signals',    value: '12',  color: 'text-cyan-azure'    },
          { label: 'Model Ver.', value: 'v4.1',color: 'text-air-sup-blue'  },
        ].map((m) => (
          <div key={m.label} className="text-center">
            <div className={`text-sm font-bold ${m.color}`}>{m.value}</div>
            <div className="text-[10px] text-ucla-blue mt-0.5">{m.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─ Typewriter headline ─ */
const WORDS = ['Texts', 'Images', 'Videos', 'Deepfakes', 'Plagiarisms'];
function Typewriter() {
  const [idx, setIdx]       = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [deleting, setDeleting]   = useState(false);

  useEffect(() => {
    const word = WORDS[idx];
    let timeout: ReturnType<typeof setTimeout>;
    if (!deleting) {
      if (displayed.length < word.length) {
        timeout = setTimeout(() => setDisplayed(word.slice(0, displayed.length + 1)), 80);
      } else {
        timeout = setTimeout(() => setDeleting(true), 1800);
      }
    } else {
      if (displayed.length > 0) {
        timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 45);
      } else {
        setDeleting(false);
        setIdx((i) => (i + 1) % WORDS.length);
      }
    }
    return () => clearTimeout(timeout);
  }, [displayed, deleting, idx]);

  return (
    <span className="gradient-text-bright">
      {displayed}
      <span className="inline-block w-0.5 h-[0.85em] bg-cyan-azure ml-0.5 align-middle animate-pulse" />
    </span>
  );
}

export function Hero() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, -60]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden gradient-hero noise-overlay">
      {/* Particle field */}
      <ParticleField />

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-grid-pattern bg-grid-fade pointer-events-none" style={{ zIndex: 1 }} />

      {/* Radial orbs */}
      <motion.div
        className="absolute top-[-10%] left-[30%] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(78,122,177,0.18) 0%, transparent 70%)', zIndex: 1 }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-[5%] right-[-5%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(206,181,212,0.12) 0%, transparent 70%)', zIndex: 1 }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />

      {/* Trust bar at top */}
      <motion.div
        className="absolute top-20 left-1/2 -translate-x-1/2 z-20"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
      {/* Removed badge */}
      </motion.div>

      <div className="container mx-auto px-4 relative z-10 pt-16">
        <div className="flex flex-col lg:flex-row items-center gap-14 lg:gap-20">

          {/* ── Left: Text Content ── */}
          <motion.div
            className="flex-1 text-center lg:text-left"
            style={{ y, opacity }}
          >
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.2 }}
            >
              {/* Headline */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6 leading-[1.05]">
                Detect AI in<br />
                <Typewriter />
              </h1>

              <p className="text-lg md:text-xl text-air-sup-blue mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                The most advanced AI detection platform. Analyze text, images, and videos for signs of AI generation, deepfakes, and synthetic manipulation.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-6">
                <Button
                  size="lg"
                  className="group w-full sm:w-auto bg-gradient-to-r from-cyan-azure to-air-sup-blue hover:from-cyan-azure-dark hover:to-cyan-azure text-white border-0 text-base h-13 px-8 btn-shimmer shadow-palette-glow transition-all duration-300 hover:shadow-[0_0_40px_rgba(78,122,177,0.6)]"
                  asChild
                >
                  <Link href="/dashboard/new-scan">
                    Start Scanning
                    <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>

              {/* Trust chips */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                {[
                  { icon: Lock,     label: 'Privacy-First' },
                  { icon: Zap,      label: 'Results in Seconds' },
                  { icon: Eye,      label: 'No Account Needed' },
                ].map((c) => (
                  <div key={c.label} className="flex items-center gap-1.5 text-xs text-air-sup-blue">
                    <c.icon className="w-3.5 h-3.5 text-cyan-azure" />
                    {c.label}
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* ── Right: Scan Card ── */}
          <motion.div
            className="flex-1 w-full max-w-sm lg:max-w-none relative z-10"
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <ScanCard />

            {/* Ambient glow halo */}
            <div className="absolute -inset-6 bg-gradient-to-r from-cyan-azure/15 to-pink-lavender/12 rounded-3xl blur-3xl -z-10 animate-orb-pulse" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
