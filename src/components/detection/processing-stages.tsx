'use client';

import React from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export type ProcessingStage =
  | 'queued'
  | 'uploading'
  | 'validating'
  | 'extracting_metadata'
  | 'preparing'
  | 'analyzing'
  | 'generating_report'
  | 'completed';

interface ProcessingStagesProps {
  currentStage: ProcessingStage;
  className?: string;
}

const STAGES: { id: ProcessingStage; label: string; sub: string }[] = [
  { id: 'queued',              label: 'Queued',              sub: 'Waiting to start...'           },
  { id: 'uploading',           label: 'Uploading',           sub: 'Transferring content...'       },
  { id: 'validating',          label: 'Validating',          sub: 'Verifying file integrity...'   },
  { id: 'extracting_metadata', label: 'Extracting Metadata', sub: 'Parsing EXIF & metadata...'    },
  { id: 'preparing',           label: 'Preparing',           sub: 'Preprocessing content...'      },
  { id: 'analyzing',           label: 'Running Analysis',    sub: 'AI models processing...'       },
  { id: 'generating_report',   label: 'Generating Report',   sub: 'Compiling results...'          },
  { id: 'completed',           label: 'Complete',            sub: 'Analysis finished!'             },
];

export function ProcessingStages({ currentStage, className }: ProcessingStagesProps) {
  const currentIndex = STAGES.findIndex(s => s.id === currentStage);
  const progressPct  = Math.round(((currentIndex) / (STAGES.length - 1)) * 100);

  return (
    <div className={cn('space-y-5 w-full', className)}>
      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-air-sup-blue/60">Progress</span>
          <span className="text-cyan-azure font-medium">{progressPct}%</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(78,122,177,0.15)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #4E7AB1, #CEB5D4)' }}
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Stage list */}
      <div className="relative">
        {/* Vertical connector line */}
        <div className="absolute left-3 top-4 bottom-4 w-px" style={{ background: 'rgba(78,122,177,0.15)' }} />
        {/* Filled portion */}
        <motion.div
          className="absolute left-3 top-4 w-px origin-top"
          style={{ background: 'linear-gradient(180deg, #4E7AB1, #CEB5D4)', scaleY: 0 }}
          animate={{ scaleY: currentIndex / (STAGES.length - 1) }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />

        <div className="space-y-4 pl-9">
          {STAGES.map((stage, idx) => {
            const done    = idx < currentIndex || currentStage === 'completed';
            const active  = idx === currentIndex && currentStage !== 'completed';
            const pending = idx > currentIndex;

            return (
              <div key={stage.id} className="relative">
                {/* Dot */}
                <div className="absolute -left-9 top-0.5 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{
                    background: done ? 'rgba(52,211,153,0.12)' : active ? 'rgba(78,122,177,0.18)' : 'rgba(255,255,255,0.04)',
                    border: done ? '1px solid rgba(52,211,153,0.3)' : active ? '1px solid rgba(78,122,177,0.4)' : '1px solid rgba(78,122,177,0.1)',
                  }}>
                  {done ? (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    </motion.div>
                  ) : active ? (
                    <Loader2 className="w-3.5 h-3.5 text-cyan-azure animate-spin" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(78,122,177,0.25)' }} />
                  )}
                </div>

                <div>
                  <p className={cn('text-sm font-medium transition-colors',
                    done ? 'text-foreground/60' : active ? 'text-foreground' : 'text-air-sup-blue/30')}>
                    {stage.label}
                  </p>
                  {active && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="text-xs text-cyan-azure/70 mt-0.5"
                    >
                      {stage.sub}
                    </motion.p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
