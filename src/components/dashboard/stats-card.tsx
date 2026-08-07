import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: { value: number; label: string; positive: boolean };
  icon: ReactNode;
  description?: string;
  variant?: 'default' | 'cyan' | 'blue' | 'lavender' | 'red' | 'amber';
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
      case 'cyan':     return 'text-cyan-azure bg-cyan-azure/15 border border-cyan-azure/25';
      case 'blue':     return 'text-air-sup-blue bg-air-sup-blue/15 border border-air-sup-blue/25';
      case 'lavender': return 'text-pink-lavender bg-pink-lavender/15 border border-pink-lavender/25';
      case 'red':      return 'text-rose-400 bg-rose-400/10 border border-rose-400/20';
      case 'amber':    return 'text-amber-400 bg-amber-400/10 border border-amber-400/20';
      default:         return 'text-air-sup-blue bg-ucla-blue/20 border border-ucla-blue/25';
    }
  };

  return (
    <div className="relative group overflow-hidden rounded-xl glass-card p-5 transition-all duration-300 hover:shadow-palette-glow hover:border-cyan-azure/30">
      {/* Shimmer effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-azure/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-air-sup-blue">{title}</p>
          <h3 className="text-2xl font-bold text-foreground mt-2">{value}</h3>

          {(change || description) && (
            <div className="mt-3 flex items-center gap-2">
              {change && (
                <span className={cn(
                  'inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full',
                  change.positive
                    ? 'text-cyan-azure bg-cyan-azure/10 border border-cyan-azure/20'
                    : 'text-rose-400 bg-rose-400/10 border border-rose-400/20'
                )}>
                  {change.positive ? '+' : '-'}{Math.abs(change.value)}%
                </span>
              )}
              {description && (
                <span className="text-xs text-ucla-blue">{description}</span>
              )}
            </div>
          )}
        </div>

        <div className={cn('p-3 rounded-xl', getVariantStyles())}>
          {icon}
        </div>
      </div>

      {/* Bottom gradient accent line */}
      <div className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-cyan-azure to-pink-lavender transition-all duration-500" />
    </div>
  );
}
