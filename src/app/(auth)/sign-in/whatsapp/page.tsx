'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSession, signIn } from 'next-auth/react';
import type { CountryCode } from 'libphonenumber-js/max';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CountryCodeSelect } from '@/components/auth/country-code-select';
import { getInternationalCountry, getInternationalPhone, phoneCountries } from '@/lib/phone-countries';

const responseSchema = z.object({
  sent: z.boolean().optional(),
  error: z.string().optional(),
  retryAfter: z.number().int().min(0).max(600).optional(),
});

export default function WhatsAppSignInPage() {
  const router = useRouter();
  const [country, setCountry] = useState<CountryCode>('PH');
  const [numberInput, setNumberInput] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [stage, setStage] = useState<'phone' | 'code'>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState('');
  const selectedCountry = phoneCountries.find(value => value.country === country)!;

  useEffect(() => {
    if (cooldown === 0) return;
    const timer = window.setTimeout(() => setCooldown(value => Math.max(0, value - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const sendCode = async () => {
    const number = getInternationalPhone(country, numberInput);
    if (!number) {
      setError('Enter a valid WhatsApp phone number for the selected country.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/whatsapp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: number }),
      });
      const body: unknown = await response.json();
      const result = responseSchema.safeParse(body);
      if (!response.ok) {
        if (result.success && result.data.retryAfter) setCooldown(result.data.retryAfter);
        throw new Error(result.success && result.data.error ? result.data.error : 'Could not send a code. Please try again.');
      }
      if (!result.success || result.data.sent !== true || result.data.error) {
        throw new Error('Could not confirm that a code was sent. Please try again.');
      }
      setPhone(number);
      setCode('');
      setStage('code');
      setCooldown(60);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not send a code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!/^\d{6}$/.test(code)) {
      setError('Enter the six-digit code from WhatsApp.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const result = await signIn('whatsapp', { phone, code, redirect: false, redirectTo: '/dashboard' });
      if (!result?.ok || result.error) {
        setError('That code could not be verified. Try again or request a new code.');
        return;
      }
      if (!(await getSession())?.user?.id) {
        setError('Sign-in could not be confirmed. Please try again.');
        return;
      }
      router.replace('/dashboard');
      router.refresh();
    } catch {
      setError('Could not verify the code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-slide-right space-y-8">
      <div className="space-y-3 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#25D366]">WhatsApp sign-in</p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{stage === 'phone' ? 'Enter your phone number' : 'Check your WhatsApp'}</h1>
        <p className="text-sm text-muted-foreground">
          {stage === 'phone' ? 'We’ll send a six-digit code to your WhatsApp number.' : `Enter the code sent to ${phone}.`}
        </p>
      </div>

      <form className="grid gap-4" onSubmit={event => { event.preventDefault(); void (stage === 'phone' ? sendCode() : verifyCode()); }}>
        <div className="grid gap-2">
          {stage === 'phone' ? (
            <>
              <Label htmlFor="whatsapp-phone">WhatsApp phone number</Label>
              <div className="flex min-w-0 items-start gap-2">
                <CountryCodeSelect country={country} onChange={value => { setCountry(value); setError(''); }} disabled={isLoading} />
                <Input id="whatsapp-phone" type="tel" inputMode="tel" autoComplete="tel-national" maxLength={64}
                  placeholder={country === 'PH' ? '917 123 4567' : 'Phone number'} value={numberInput}
                  onChange={event => {
                    setNumberInput(event.target.value);
                    const detected = getInternationalCountry(event.target.value);
                    if (detected) setCountry(detected);
                    setError('');
                  }} disabled={isLoading} required aria-describedby="whatsapp-country-hint whatsapp-error" className="min-w-0 flex-1" />
              </div>
              <p id="whatsapp-country-hint" className="text-xs text-muted-foreground">
                {selectedCountry.name} (+{selectedCountry.callingCode}). Enter your local number or paste a full international number.
              </p>
            </>
          ) : (
            <>
              <Label htmlFor="whatsapp-code">Verification code</Label>
              <Input id="whatsapp-code" inputMode="numeric" autoComplete="one-time-code" placeholder="000000" maxLength={6} value={code} onChange={event => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} disabled={isLoading} required autoFocus aria-describedby="whatsapp-error" className="text-center text-xl tracking-[0.35em]" />
            </>
          )}
        </div>
        <div id="whatsapp-error" role="alert" aria-live="polite">
          {error && <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
        </div>
        <Button type="submit" disabled={isLoading || (stage === 'phone' && cooldown > 0)} className="w-full bg-cyan-azure-dark text-white hover:bg-space-cadet-light">
          {isLoading && <Loader2 aria-hidden="true" className="size-4 animate-spin" />}
          {stage === 'phone' ? (cooldown > 0 ? `Try again in ${cooldown}s` : 'Send code via WhatsApp') : 'Verify and sign in'}
        </Button>
      </form>

      {stage === 'code' && (
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
          <Button type="button" variant="link" disabled={isLoading || cooldown > 0} onClick={() => void sendCode()} className="text-pink-lavender">
            {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
          </Button>
          <Button type="button" variant="link" disabled={isLoading} onClick={() => { setStage('phone'); setCode(''); setError(''); }} className="text-pink-lavender">Change number</Button>
        </div>
      )}

      <div className="text-center">
        <Link href="/sign-in" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft aria-hidden="true" className="size-4" /> Choose another sign-in option
        </Link>
      </div>
    </div>
  );
}
