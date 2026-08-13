'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  FileText, ImageIcon, Video, UserX, BookOpen,
  ShieldCheck, ChevronRight, ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const SCAN_TYPES = [
  {
    id: 'text',
    label: 'Text Detection',
    description: 'Detect if text was written by ChatGPT, Claude, Gemini, or any AI model.',
    icon: FileText,
    href: '/dashboard/text',
    accent: 'from-blue-500/20 to-cyan-500/20',
    border: 'border-blue-500/30',
    iconColor: 'text-blue-400',
    badge: 'AI Written · Paraphrased',
  },
  {
    id: 'image',
    label: 'Image Analysis',
    description: 'Detect AI-generated images, deepfake faces, and AI enhancement on real photos.',
    icon: ImageIcon,
    href: '/dashboard/image',
    accent: 'from-cyan-azure/20 to-air-sup-blue/20',
    border: 'border-cyan-azure/30',
    iconColor: 'text-cyan-azure',
    badge: 'DALL-E · Midjourney · SD · Flux',
    live: true,
  },
  {
    id: 'video',
    label: 'Video Analysis',
    description: 'Frame-by-frame AI generation and deepfake detection across video content.',
    icon: Video,
    href: '/dashboard/video',
    accent: 'from-violet-500/20 to-purple-500/20',
    border: 'border-violet-500/30',
    iconColor: 'text-violet-400',
    badge: 'AI Video · Synthetic Media',
    live: true,
  },
  {
    id: 'deepfake',
    label: 'Deepfake Detection',
    description: 'Identify face swaps, lip-sync manipulation, and facial re-enactment in images and videos.',
    icon: UserX,
    href: '/dashboard/deepfake',
    accent: 'from-red-500/20 to-rose-500/20',
    border: 'border-red-500/30',
    iconColor: 'text-red-400',
    badge: 'Face Swap · Lip-Sync · GAN Faces',
    live: true,
  },
  {
    id: 'plagiarism',
    label: 'Plagiarism Check',
    description: 'Identify copied, paraphrased, or structurally similar content from web and academic sources.',
    icon: BookOpen,
    href: '/dashboard/plagiarism',
    accent: 'from-amber-500/20 to-orange-500/20',
    border: 'border-amber-500/30',
    iconColor: 'text-amber-400',
    badge: 'Web Sources · Academic',
  },
] as const;

export default function NewScanPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  const handleStart = () => {
    const target = SCAN_TYPES.find((s) => s.id === selected);
    if (target) router.push(target.href);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-air-sup-blue hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Start a New Scan</h1>
        <p className="text-air-sup-blue">
          Choose what type of content you want to analyze. Select a detector to get started.
        </p>
      </div>

      {/* Scan type cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SCAN_TYPES.map((type, i) => {
          const Icon = type.icon;
          const isSelected = selected === type.id;
          return (
            <motion.button
              key={type.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => setSelected(type.id)}
              className={cn(
                'relative text-left w-full p-5 rounded-2xl border transition-all duration-200 glass-card',
                'hover:scale-[1.02] hover:shadow-lg',
                isSelected
                  ? `bg-gradient-to-br ${type.accent} ${type.border} ring-2 ring-cyan-azure/30`
                  : 'border-white/10 hover:border-white/20',
              )}
            >
              {/* Live badge */}
              {'live' in type && type.live && (
                <span className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-2 py-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE
                </span>
              )}

              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br', type.accent, 'border', type.border)}>
                <Icon className={cn('w-5 h-5', type.iconColor)} />
              </div>

              <h3 className="font-semibold text-foreground mb-1">{type.label}</h3>
              <p className="text-xs text-air-sup-blue leading-relaxed mb-3">{type.description}</p>
              <p className="text-[10px] font-bold text-ucla-blue/60 uppercase tracking-widest">{type.badge}</p>

              {/* Selected check */}
              {isSelected && (
                <div className="absolute top-3 left-3 w-5 h-5 rounded-full bg-cyan-azure flex items-center justify-center">
                  <ShieldCheck className="w-3 h-3 text-white" />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* CTA */}
      <div className="flex items-center gap-4 pt-2">
        <Button
          onClick={handleStart}
          disabled={!selected}
          className="h-12 px-8 bg-gradient-to-r from-cyan-azure to-air-sup-blue hover:from-cyan-azure-dark hover:to-cyan-azure text-white font-semibold text-base shadow-palette-glow disabled:opacity-40 transition-all"
        >
          Start Analysis
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
        {selected && (
          <p className="text-sm text-air-sup-blue">
            You selected:{' '}
            <span className="text-foreground font-medium">
              {SCAN_TYPES.find((s) => s.id === selected)?.label}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
