'use client';

import { useState } from 'react';
import { FileText, Image as ImageIcon, Video, ExternalLink, RefreshCw, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export type ScanResultStatus =
  | 'Likely human-created'
  | 'Likely AI-generated'
  | 'Likely AI-edited'
  | 'Likely AI-enhanced'
  | 'Mixed or partially synthetic'
  | 'Inconclusive'
  | string;

export type ScanType = 'text' | 'image' | 'video';

export interface Scan {
  id: string;
  name: string;
  type: ScanType;
  result: ScanResultStatus;
  confidence: number;
  date: string;
  status: 'completed' | 'processing' | 'failed';
}

interface Props { scans: Scan[] }

function ResultBadge({ result }: { result: ScanResultStatus }) {
  const map: Record<ScanResultStatus, { color: string; bg: string; border: string }> = {
    'Likely human-created':       { color: '#34d399', bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.25)'  },
    'Likely AI-generated':        { color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.25)' },
    'Likely AI-edited':           { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.25)'  },
    'Likely AI-enhanced':         { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.25)'  },
    'Mixed or partially synthetic':{ color: '#fb923c', bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.25)'  },
    'Inconclusive':               { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.2)'  },
  };
  const s = map[result] ?? map['Inconclusive'];
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap"
      style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}>
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: s.color }} />
      {result}
    </span>
  );
}

function TypeIcon({ type }: { type: ScanType }) {
  const map: Record<ScanType, { icon: typeof FileText; color: string }> = {
    text:  { icon: FileText,  color: '#4E7AB1' },
    image: { icon: ImageIcon, color: '#9b8cc4' },
    video: { icon: Video,     color: '#CEB5D4' },
  };
  const { icon: Icon, color } = map[type];
  return (
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
        <Icon className="w-3.5 h-3.5" style={{ color }} />
      </div>
      <span className="capitalize text-xs text-air-sup-blue/80 hidden sm:inline">{type}</span>
    </div>
  );
}

function ConfidenceBar({ value }: { value: number }) {
  const color = value > 80 ? '#f87171' : value > 50 ? '#fbbf24' : '#34d399';
  return (
    <div className="flex items-center gap-2 min-w-[80px]">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ background: color }}
        />
      </div>
      <span className="text-xs font-medium tabular-nums" style={{ color }}>{value}%</span>
    </div>
  );
}

export function RecentScansTable({ scans }: Props) {
  const [sortKey, setSortKey] = useState<'name' | 'confidence' | 'date'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const sorted = [...scans].sort((a, b) => {
    if (sortKey === 'confidence') return sortDir === 'asc' ? a.confidence - b.confidence : b.confidence - a.confidence;
    if (sortKey === 'name') return sortDir === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    return 0;
  });

  const SortIcon = ({ k }: { k: typeof sortKey }) =>
    sortKey === k
      ? sortDir === 'asc'
        ? <ChevronUp className="w-3 h-3" />
        : <ChevronDown className="w-3 h-3" />
      : <ChevronDown className="w-3 h-3 opacity-30" />;

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(78,122,177,0.1)' }}>
            {[
              { label: 'Name',       k: 'name'       as const, cls: '' },
              { label: 'Type',       k: null,                   cls: '' },
              { label: 'Result',     k: null,                   cls: '' },
              { label: 'Confidence', k: 'confidence' as const, cls: 'hidden md:table-cell' },
              { label: 'Date',       k: 'date'       as const, cls: 'hidden sm:table-cell' },
              { label: 'Actions',    k: null,                   cls: 'text-right' },
            ].map((col) => (
              <th key={col.label}
                className={cn('px-5 py-3 text-left', col.cls)}
                onClick={col.k ? () => toggleSort(col.k!) : undefined}
              >
                <span className={cn('inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-air-sup-blue/50',
                  col.k && 'cursor-pointer hover:text-air-sup-blue transition-colors select-none')}>
                  {col.label}
                  {col.k && <SortIcon k={col.k} />}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((scan, i) => (
            <motion.tr
              key={scan.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              className="group transition-colors"
              style={{ borderBottom: '1px solid rgba(78,122,177,0.06)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(78,122,177,0.05)')}
              onMouseLeave={e => (e.currentTarget.style.background = '')}
            >
              <td className="px-5 py-3.5 max-w-[160px] sm:max-w-[220px]">
                <p className="font-medium text-foreground truncate text-sm">{scan.name}</p>
              </td>
              <td className="px-5 py-3.5"><TypeIcon type={scan.type} /></td>
              <td className="px-5 py-3.5"><ResultBadge result={scan.result} /></td>
              <td className="px-5 py-3.5 hidden md:table-cell"><ConfidenceBar value={scan.confidence} /></td>
              <td className="px-5 py-3.5 hidden sm:table-cell">
                <span className="text-xs text-air-sup-blue/50">{scan.date}</span>
              </td>
              <td className="px-5 py-3.5">
                <div className="flex items-center justify-end gap-1">
                  {[
                    { icon: ExternalLink, title: 'View report', hoverColor: 'text-cyan-azure' },
                    { icon: RefreshCw,    title: 'Rescan',      hoverColor: 'text-air-sup-blue' },
                    { icon: Trash2,       title: 'Delete',      hoverColor: 'text-rose-400' },
                  ].map((btn) => (
                    <button key={btn.title} title={btn.title}
                      className={cn('p-1.5 rounded-lg text-air-sup-blue/40 transition-all hover:bg-white/5', btn.hoverColor)}>
                      <btn.icon className="w-3.5 h-3.5" />
                    </button>
                  ))}
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
