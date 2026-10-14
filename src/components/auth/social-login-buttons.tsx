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

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.52 3.48A11.9 11.9 0 0 0 12.04 0C5.45 0 .09 5.36.09 11.95c0 2.1.55 4.15 1.6 5.96L0 24l6.25-1.64a11.94 11.94 0 0 0 5.78 1.47h.01c6.59 0 11.95-5.36 11.95-11.95 0-3.19-1.24-6.19-3.47-8.4ZM12.04 21.8a9.9 9.9 0 0 1-5.05-1.38l-.36-.21-3.71.97.99-3.62-.24-.37a9.88 9.88 0 0 1-1.52-5.24c0-5.48 4.46-9.94 9.94-9.94a9.87 9.87 0 0 1 7.03 2.92 9.87 9.87 0 0 1 2.9 7.03c0 5.48-4.46 9.94-9.98 9.94Zm5.45-7.44c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.48-1.77-1.65-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.62-.91-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.08 4.48.71.31 1.26.49 1.7.63.71.22 1.36.19 1.87.11.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35Z" />
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
  { id: 'whatsapp', name: 'WhatsApp', description: 'Use your WhatsApp phone number', icon: WhatsAppIcon, color: 'text-[#25D366]' },
  { id: 'facebook', name: 'Facebook', description: 'Use your Facebook account', icon: FacebookIcon, color: 'text-[#4795FF]' },
] as const;

type Provider = (typeof providers)[number];

export function SocialLoginButtons({ disabled = false }: { disabled?: boolean }) {
  const router = useRouter();
  const [pendingProvider, setPendingProvider] = useState<Provider['id'] | null>(null);
  const [error, setError] = useState('');

  const startSignIn = async (provider: Provider) => {
    setError('');
    if (provider.id === 'whatsapp') {
      router.push('/sign-in/whatsapp');
      return;
    }
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
