import { AlertTriangle } from 'lucide-react';
import { DISCLAIMER } from '@/types';
import { cn } from '@/lib/utils';

export function DisclaimerBanner({ className }: { className?: string }) {
  return (
    <div className={cn(
      'flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200',
      className
    )}>
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
      <p>{DISCLAIMER}</p>
    </div>
  );
}
