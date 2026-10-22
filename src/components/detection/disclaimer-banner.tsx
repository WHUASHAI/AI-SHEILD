import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function DisclaimerBanner({ className }: { className?: string }) {
  return (
    <div
      className={cn('flex items-start gap-3 p-4 rounded-xl', className)}
      style={{
        background: 'rgba(251,191,36,0.06)',
        border: '1px solid rgba(251,191,36,0.2)',
      }}
    >
      <div className="p-1.5 rounded-lg shrink-0 mt-0.5" style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.25)' }}>
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
      </div>
      <div className="text-sm">
        <p className="font-semibold text-foreground/90 mb-0.5">Probability-based Analysis</p>
        <p className="text-air-sup-blue/70 leading-relaxed text-xs">
          AI Shield provides probability scores, not definitive verdicts. Results may contain false positives or false negatives and should not be used as sole evidence in academic, legal, or disciplinary proceedings.
        </p>
      </div>
    </div>
  );
}
