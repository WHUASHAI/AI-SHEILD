import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: { value: number; label: string; positive: boolean };
  icon: ReactNode;
  description?: string;
  variant?: 'default' | 'cyan' | 'blue' | 'green' | 'red' | 'amber';
}

export function StatsCard({
  title,
  value,
  change,
  icon,
  description,
  variant = 'default'
}: StatsCardProps) {
  
  const getVariantStyles = () => {
    switch (variant) {
      case 'cyan': return 'text-[#06b6d4] bg-[#06b6d4]/10';
      case 'blue': return 'text-blue-400 bg-blue-400/10';
      case 'green': return 'text-emerald-400 bg-emerald-400/10';
      case 'red': return 'text-rose-400 bg-rose-400/10';
      case 'amber': return 'text-amber-400 bg-amber-400/10';
      default: return 'text-gray-400 bg-gray-800';
    }
  };

  return (
    <div className="relative group overflow-hidden rounded-xl bg-[#111827] border border-[#1f2937] p-5 transition-all hover:shadow-lg hover:shadow-black/50">
      {/* Subtle animated border gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#06b6d4]/10 to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />
      
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <h3 className="text-2xl font-bold text-white mt-2">{value}</h3>
          
          {(change || description) && (
            <div className="mt-3 flex items-center gap-2">
              {change && (
                <span className={cn(
                  "inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full",
                  change.positive 
                    ? "text-emerald-400 bg-emerald-400/10" 
                    : "text-rose-400 bg-rose-400/10"
                )}>
                  {change.positive ? '+' : '-'}{Math.abs(change.value)}%
                </span>
              )}
              {description && (
                <span className="text-xs text-gray-500">{description}</span>
              )}
            </div>
          )}
        </div>
        
        <div className={cn("p-3 rounded-lg", getVariantStyles())}>
          {icon}
        </div>
      </div>
    </div>
  );
}
