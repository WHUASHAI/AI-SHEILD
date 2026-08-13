'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Plus, ArrowRight, ShieldCheck, AlertTriangle, Activity,
  FileText, Image as ImageIcon, Video, Clock, TrendingUp, Zap,
} from 'lucide-react';
import { RecentScansTable, Scan } from '@/components/dashboard/recent-scans-table';

const MOCK_SCANS: Scan[] = [
  { id: '1', name: 'essay_final_v2.pdf',   type: 'text',  result: 'Likely AI-generated',       confidence: 92, date: '2 hrs ago',  status: 'completed' },
  { id: '2', name: 'profile_pic.jpg',       type: 'image', result: 'Likely human-created',       confidence: 15, date: '4 hrs ago',  status: 'completed' },
  { id: '3', name: 'interview_clip.mp4',    type: 'video', result: 'Mixed or partially synthetic', confidence: 65, date: '1 day ago', status: 'completed' },
  { id: '4', name: 'article_draft.docx',    type: 'text',  result: 'Likely AI-edited',           confidence: 45, date: '2 days ago', status: 'completed' },
  { id: '5', name: 'unknown_source.png',    type: 'image', result: 'Inconclusive',               confidence: 50, date: '2 days ago', status: 'completed' },
];

const stats = [
  {
    label: 'Total Scans',
    value: '247',
    change: '+12 this week',
    positive: true,
    icon: Activity,
    accent: '#4E7AB1',
    bg: 'rgba(78,122,177,0.12)',
    border: 'rgba(78,122,177,0.25)',
  },
  {
    label: 'AI Detected',
    value: '83',
    change: '34% of all scans',
    positive: null,
    icon: AlertTriangle,
    accent: '#f87171',
    bg: 'rgba(248,113,113,0.1)',
    border: 'rgba(248,113,113,0.2)',
  },
  {
    label: 'Human Verified',
    value: '138',
    change: '56% of all scans',
    positive: true,
    icon: ShieldCheck,
    accent: '#34d399',
    bg: 'rgba(52,211,153,0.1)',
    border: 'rgba(52,211,153,0.2)',
  },
  {
    label: 'Scans This Month',
    value: '45',
    change: '55 remaining',
    positive: null,
    icon: TrendingUp,
    accent: '#CEB5D4',
    bg: 'rgba(206,181,212,0.12)',
    border: 'rgba(206,181,212,0.25)',
  },
];

const quickTools = [
  { label: 'Scan Text',      href: '/dashboard/text',       icon: FileText,  accent: '#4E7AB1' },
  { label: 'Scan Image',     href: '/dashboard/image',      icon: ImageIcon, accent: '#9b8cc4' },
  { label: 'Scan Video',     href: '/dashboard/video',      icon: Video,     accent: '#CEB5D4' },
  { label: 'Detect Deepfake',href: '/dashboard/deepfake',   icon: Zap,       accent: '#f87171' },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

import { useRecentScans } from '@/lib/use-recent-scans';

export default function DashboardPage() {
  const { scans } = useRecentScans();
  const displayScans = scans.length > 0 ? scans : MOCK_SCANS;

  return (
    <motion.div className="space-y-8" variants={container} initial="hidden" animate="show">
      {/* Page header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Overview</h1>
          <p className="text-sm text-air-sup-blue/70 mt-1">Your AI detection dashboard at a glance.</p>
        </div>
      </motion.div>

      {/* Stats grid */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:translate-y-[-2px]"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(78,122,177,0.14)', boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}>
            {/* Hover glow */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-2xl"
              style={{ background: `radial-gradient(ellipse at top right, ${s.bg} 0%, transparent 70%)` }} />
            {/* Bottom accent bar */}
            <div className="absolute bottom-0 left-0 h-px w-0 group-hover:w-full transition-all duration-500 pointer-events-none"
              style={{ background: `linear-gradient(90deg, transparent, ${s.accent}80, transparent)` }} />

            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-air-sup-blue/70 uppercase tracking-wider mb-2">{s.label}</p>
                <p className="text-3xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-air-sup-blue/60 mt-1.5">{s.change}</p>
              </div>
              <div className="p-2.5 rounded-xl shrink-0" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                <s.icon className="w-5 h-5" style={{ color: s.accent }} />
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Quick access + Activity row */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick tools */}
        <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(78,122,177,0.14)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Quick Scan</h3>
            <Zap className="w-4 h-4 text-pink-lavender/60" />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {quickTools.map((t) => (
              <Link key={t.label} href={t.href}
                className="group flex flex-col items-center justify-center gap-2 p-4 rounded-xl text-center transition-all duration-200 hover:scale-105"
                style={{ background: `${t.accent}10`, border: `1px solid ${t.accent}25` }}>
                <t.icon className="w-5 h-5 transition-colors" style={{ color: t.accent }} />
                <span className="text-xs font-medium text-air-sup-blue group-hover:text-foreground transition-colors leading-tight">{t.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Activity summary */}
        <div className="lg:col-span-2 rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(78,122,177,0.14)' }}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-foreground">Scan Activity</h3>
            <span className="text-xs text-air-sup-blue/50 px-2 py-1 rounded-full" style={{ background: 'rgba(78,122,177,0.1)' }}>Last 7 days</span>
          </div>
          {/* Simple bar chart mockup */}
          <div className="flex items-end gap-2 h-28">
            {[18, 32, 22, 45, 38, 25, 41].map((v, i) => {
              const days = ['M','T','W','T','F','S','S'];
              const isLast = i === 6;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="relative w-full rounded-t-md overflow-hidden group cursor-pointer" style={{ height: `${(v / 50) * 100}%` }}>
                    <div className="absolute inset-0 rounded-t-md transition-all duration-300 group-hover:brightness-125"
                      style={{
                        background: isLast
                          ? 'linear-gradient(180deg, #4E7AB1 0%, #7D9FC0 100%)'
                          : 'rgba(78,122,177,0.25)',
                        border: '1px solid rgba(78,122,177,0.3)',
                      }} />
                  </div>
                  <span className="text-[10px] text-air-sup-blue/50">{days[i]}</span>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Recent scans */}
      <motion.div variants={item}>
        <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(78,122,177,0.14)' }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(78,122,177,0.1)' }}>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-air-sup-blue/60" />
              <h3 className="text-sm font-semibold text-foreground">Recent Scans</h3>
            </div>
            <Link href="/dashboard/history" className="flex items-center gap-1 text-xs text-cyan-azure hover:text-pink-lavender transition-colors">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <RecentScansTable scans={displayScans} />
        </div>
      </motion.div>
    </motion.div>
  );
}
