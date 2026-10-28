import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'full' | 'icon';
}

export function Logo({ className, size = 'md', variant = 'full' }: LogoProps) {
  const iconSizes = { sm: 28, md: 36, lg: 52 };
  const px = iconSizes[size];

  const textConfig = {
    sm: { wrapper: 'text-sm',  name: 'text-sm',  ai: 'text-sm',  tracking: 'tracking-wide'  },
    md: { wrapper: 'text-lg',  name: 'text-lg',  ai: 'text-lg',  tracking: 'tracking-wider' },
    lg: { wrapper: 'text-2xl', name: 'text-2xl', ai: 'text-2xl', tracking: 'tracking-widest' },
  };
  const t = textConfig[size];

  return (
    <div className={cn('flex items-center gap-2.5 select-none', className)}>

      {/* ── Logo Icon Image ── */}
      <div
        className="relative shrink-0 rounded-lg overflow-hidden"
        style={{ width: px, height: px }}
      >
        {/* Subtle glow behind the icon */}
        <div
          className="absolute inset-0 rounded-lg"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(78,122,177,0.4) 0%, transparent 70%)',
            filter: 'blur(4px)',
          }}
        />
        <Image
          src="/brand/elucid-ai-lens.png"
          alt="Elucid AI Logo"
          width={px}
          height={px}
          className="relative z-10 object-contain"
          preload
        />
      </div>

      {/* ── Wordmark ── */}
      {variant === 'full' && (
        <span className={cn('flex items-baseline gap-0 font-extrabold leading-none', t.wrapper)}>
          <span
            className={cn('text-foreground', t.name)}
            style={{ letterSpacing: '0.02em' }}
          >
            Elucid{' '}
          </span>
          <span
            className={cn(t.ai, t.tracking)}
            style={{
              background: 'linear-gradient(135deg, #43DFF1 0%, #65B9F6 50%, #C2A4FA 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginLeft: '0.3em',
            }}
          >
            AI
          </span>
        </span>
      )}
    </div>
  );
}
