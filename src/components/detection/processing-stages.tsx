'use client';

import React from 'react';
import { CheckCircle2, Loader2, Circle } from 'lucide-react';
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

const STAGES: { id: ProcessingStage; label: string }[] = [
  { id: 'queued', label: 'Queued' },
  { id: 'uploading', label: 'Uploading' },
  { id: 'validating', label: 'Validating file' },
  { id: 'extracting_metadata', label: 'Extracting metadata' },
  { id: 'preparing', label: 'Preparing content' },
  { id: 'analyzing', label: 'Running analysis' },
  { id: 'generating_report', label: 'Generating report' },
  { id: 'completed', label: 'Completed' },
];

export function ProcessingStages({ currentStage, className }: ProcessingStagesProps) {
  const currentIndex = STAGES.findIndex(s => s.id === currentStage);

  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="text-lg font-medium text-white mb-6">Processing Status</h3>
      <div className="relative">
        <div className="absolute left-[11px] top-3 bottom-4 w-[2px] bg-slate-800" />
        <div className="space-y-6">
          {STAGES.map((stage, index) => {
            const isCompleted = index < currentIndex || currentStage === 'completed';
            const isCurrent = index === currentIndex && currentStage !== 'completed';
            const isPending = index > currentIndex;

            return (
              <div key={stage.id} className="relative flex items-center space-x-4">
                <div className="relative z-10 flex items-center justify-center bg-slate-950 w-6 h-6">
                  {isCompleted ? (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 bg-slate-950" />
                    </motion.div>
                  ) : isCurrent ? (
                    <Loader2 className="w-5 h-5 text-cyan-500 animate-spin bg-slate-950" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-700 bg-slate-950" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-sm font-medium transition-colors duration-300",
                    isCompleted ? "text-slate-300" : isCurrent ? "text-cyan-400" : "text-slate-600"
                  )}
                >
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
