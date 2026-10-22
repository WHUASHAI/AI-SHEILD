'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Plus, ArrowRight, ShieldCheck, AlertTriangle, Activity,
  FileText, Image as ImageIcon, Video, Clock, TrendingUp, Zap,
} from 'lucide-react';
import { RecentScansTable } from '@/components/dashboard/recent-scans-table';

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
import { usePlatformStatistics } from '@/lib/use-platform-statistics';

export default function DashboardPage() {
  const { scans, isGuest, isClient, loading: historyLoading, error: historyError } = useRecentScans();
  const { statistics, loading, error, retry } = usePlatformStatistics();
  const format = (value: number | undefined) => value === undefined ? '—' : value.toLocaleString();
  const percentage = (value: number) => statistics?.totalScans ? Math.round(value / statistics.totalScans * 100) : 0;
  const unavailable = loading ? 'Loading website totals…' : 'Unavailable';
  const stats = [
    { label: 'Total Scans', value: format(statistics?.totalScans),
      change: statistics ? `${statistics.scansThisWeek.toLocaleString()} in the last 7 days` : unavailable,
      icon: Activity, accent: '#4E7AB1', bg: 'rgba(78,122,177,0.12)', border: 'rgba(78,122,177,0.25)' },
    { label: 'AI Detected', value: format(statistics?.aiDetected),
      change: statistics ? `Likely AI · ${percentage(statistics.aiDetected)}% of scans` : unavailable,
      icon: AlertTriangle, accent: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.2)' },
    { label: 'Human Verified', value: format(statistics?.humanVerified),
      change: statistics ? `Likely human · ${percentage(statistics.humanVerified)}% of scans` : unavailable,
      icon: ShieldCheck, accent: '#34d399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.2)' },
    { label: 'Scans This Month', value: format(statistics?.scansThisMonth),
      change: statistics ? 'Calendar month (UTC)' : unavailable,
      icon: TrendingUp, accent: '#CEB5D4', bg: 'rgba(206,181,212,0.12)', border: 'rgba(206,181,212,0.25)' },
  ];
  const largestDay = Math.max(1, ...(statistics?.activity.map(day => day.scans) ?? []));

  return (
    <motion.div className="space-y-8" variants={container} initial="hidden" animate="show">
      {/* Page header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Overview</h1>
          <p className="text-sm text-air-sup-blue/70 mt-1">Website-wide scan activity across all users.</p>
        </div>

        <div className="flex items-center gap-3">
          {isClient && (
            <div
              className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs border ${
                isGuest
                  ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
                  : 'border-cyan-azure/30 bg-cyan-azure/10 text-cyan-azure'
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${isGuest ? 'bg-amber-400 animate-pulse' : 'bg-cyan-azure'}`} />
              {isGuest ? `Guest history: ${scans.length} recent` : `Saved history: ${scans.length} recent`}
            </div>
          )}

          {isGuest && (
            <Link
              href="/sign-in"
              className="text-xs font-medium text-pink-lavender hover:text-white underline underline-offset-2"
            >
              Sign In for Account History
            </Link>
          )}
        </div>
      </motion.div>

      {error && (
        <div role="status" className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-4 text-sm text-amber-200">
          {error}{' '}
          <button type="button" onClick={retry} className="underline underline-offset-2">Retry</button>
        </div>
      )}
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
          {statistics ? (
            <div className="flex items-end gap-2 h-28" aria-label="Website-wide scan activity over the last seven days">
              {statistics.activity.map((day, index) => (
                <div key={day.date} className="h-full flex-1 flex flex-col items-center justify-end gap-1.5" title={`${day.date}: ${day.scans} scans`}>
                  <span className="text-[10px] text-air-sup-blue/70">{day.scans.toLocaleString()}</span>
                  <div className="w-full rounded-t-md shrink-0" style={{
                    height: `${day.scans / largestDay * 65}%`,
                    background: index === 6 ? 'linear-gradient(180deg, #4E7AB1 0%, #7D9FC0 100%)' : 'rgba(78,122,177,0.25)',
                  }} />
                  <span className="text-[10px] text-air-sup-blue/50">
                    {new Date(`${day.date}T00:00:00Z`).toLocaleDateString('en', { weekday: 'short', timeZone: 'UTC' })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-28 flex items-center justify-center text-sm text-air-sup-blue/60">
              {loading ? 'Loading scan activity…' : 'Scan activity is unavailable.'}
            </div>
          )}
        </div>
      </motion.div>

      {/* Recent scans */}
      <motion.div variants={item}>
        <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(78,122,177,0.14)' }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(78,122,177,0.1)' }}>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-azure" />
              <h3 className="text-sm font-semibold text-foreground">Recent Scans</h3>
              {isClient && (
                <span className="text-[11px] text-air-sup-blue/60 ml-2">
                  ({scans.length} {scans.length === 1 ? 'scan' : 'scans'} {isGuest ? 'guest results' : 'saved'})
                </span>
              )}
            </div>
            <Link
              href="/dashboard/history"
              className="flex items-center gap-1 text-xs text-cyan-azure hover:text-white transition-colors"
            >
              View Full History
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {historyLoading ? <p role="status" className="p-6">Loading history?</p> : historyError ? <p role="alert" className="p-6 text-amber-300">{historyError}</p> : isClient && scans.length > 0 ? (
            <RecentScansTable scans={scans} />
          ) : (
            <div className="p-8 text-center space-y-3">
              <p className="text-sm text-air-sup-blue/70">
                No scans recorded yet in this {isGuest ? 'session' : 'account'}.
              </p>
              <Link
                href="/dashboard/new-scan"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-cyan-azure hover:text-white bg-cyan-azure/10 hover:bg-cyan-azure/20 px-3 py-1.5 rounded-lg border border-cyan-azure/30 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Start a New Scan
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
