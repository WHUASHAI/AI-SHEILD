import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'full' | 'icon';
}

export function Logo({ className, size = 'md', variant = 'full' }: LogoProps) {
  const sizes = { sm: 28, md: 36, lg: 48 };
  const px = sizes[size];
  const textSizes = { sm: 'text-base', md: 'text-xl', lg: 'text-2xl' };

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <svg width={px} height={px} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Scanning frame corners */}
        <path d="M4 12V6a2 2 0 0 1 2-2h6" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M28 4h6a2 2 0 0 1 2 2v6" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M36 28v6a2 2 0 0 1-2 2h-6" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M12 36H6a2 2 0 0 1-2-2v-6" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round"/>
        {/* Center scan lines */}
        <circle cx="20" cy="20" r="7" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="3 2"/>
        <circle cx="20" cy="20" r="3.5" fill="#06b6d4" opacity="0.9"/>
        {/* Scan line */}
        <line x1="8" y1="20" x2="13" y2="20" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="27" y1="20" x2="32" y2="20" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
      {variant === 'full' && (
        <span className={cn('font-bold tracking-tight', textSizes[size])}>
          <span className="text-foreground">AI</span>
          <span className="text-cyan-400"> Shield</span>
        </span>
      )}
    </div>
  );
}
