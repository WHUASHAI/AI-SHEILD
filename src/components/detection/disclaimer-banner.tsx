import React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function DisclaimerBanner({ className }: { className?: string }) {
  return (
    <div className={cn("bg-slate-800/50 border border-slate-700 p-4 rounded-lg flex items-start gap-3", className)}>
      <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
      <div className="text-sm text-slate-300">
        <p className="font-semibold text-slate-200 mb-1">Probability-based Analysis</p>
        AI Shield provides a probability-based analysis. Results may contain false positives or false negatives and should not be treated as definitive proof that content was generated or modified by AI.
      </div>
    </div>
  );
}
