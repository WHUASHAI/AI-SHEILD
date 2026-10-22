'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getProviders, signIn } from 'next-auth/react';
import { ArrowRight, Info, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Google brand icon as inline SVG (brand icons removed from lucide-react v0.400+)
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.026 4.388 11.02 10.125 11.927v-8.437H7.078v-3.49h3.047V9.413c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.971h-1.513c-1.491 0-1.956.931-1.956 1.887v2.263h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073Z" />
    </svg>
  );
}

const providers = [
  { id: 'google', name: 'Google', description: 'Use your Gmail or Google account', icon: GoogleIcon, color: 'text-foreground' },
  { id: 'facebook', name: 'Facebook', description: 'Use your Facebook account', icon: FacebookIcon, color: 'text-[#4795FF]' },
] as const;

type Provider = (typeof providers)[number];

export function SocialLoginButtons({ disabled = false }: { disabled?: boolean }) {
  const router = useRouter();
  const [pendingProvider, setPendingProvider] = useState<Provider['id'] | null>(null);
  const [error, setError] = useState('');

  const startSignIn = async (provider: Provider) => {
    setError('');
    setPendingProvider(provider.id);
    try {
      const available = await getProviders();
      if (!available?.[provider.id]) {
        setError(`${provider.name} sign-in is not available yet. Please choose another option.`);
        return;
      }
      await signIn(provider.id, { redirectTo: '/dashboard' });
    } catch {
      setError(`Could not connect to ${provider.name}. Please try again.`);
    } finally {
      setPendingProvider(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid gap-3" aria-label="Sign-in options">
        {providers.map((provider) => (
          <Button
            key={provider.name}
            type="button"
            variant="outline"
            disabled={disabled || pendingProvider !== null}
            aria-label={`Continue with ${provider.name}`}
            onClick={() => void startSignIn(provider)}
            className="group h-auto min-h-16 w-full justify-start gap-4 whitespace-normal rounded-xl border-cyan-azure/25 bg-space-cadet-dark/40 px-4 py-3 text-left text-foreground hover:border-cyan-azure/60 hover:bg-cyan-azure/10 hover:text-foreground"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5">
              <provider.icon className={`!size-5 ${provider.color}`} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">Continue with {provider.name}</span>
              <span className="mt-0.5 block text-xs font-normal text-muted-foreground">{provider.description}</span>
            </span>
            {pendingProvider === provider.id
              ? <Loader2 aria-hidden="true" className="animate-spin text-muted-foreground" />
              : <ArrowRight aria-hidden="true" className="text-muted-foreground transition-transform group-hover:translate-x-1" />}
          </Button>
        ))}
      </div>

      <div role="status" aria-live="polite" aria-atomic="true">
        {error && (
          <div className="flex items-start gap-3 rounded-xl border-cyan-azure/25 border bg-cyan-azure/10 p-4 text-sm text-foreground">
            <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-air-superiority-blue" />
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
