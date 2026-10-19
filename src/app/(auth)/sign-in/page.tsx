'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SocialLoginButtons } from '@/components/auth/social-login-buttons';
import { AuthErrorNotice } from '@/components/auth/auth-error-notice';
import { saveSignInEmail, signInEmailSchema, useSignInEmail } from '@/lib/use-sign-in-email';

const signInSchema = z.object({
  email: signInEmailSchema,
});

type SignInValues = z.infer<typeof signInSchema>;

export default function SignInPage() {
  const router = useRouter();
  const email = useSignInEmail();
  const [isContinuing, setIsContinuing] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    values: { email: email ?? '' },
  });

  const onSubmit = (data: SignInValues) => {
    setError('');
    try {
      saveSignInEmail(data.email);
      setIsContinuing(true);
      router.push('/sign-in/password');
    } catch {
      setIsContinuing(false);
      setError('Unable to continue. Please allow browser storage and try again.');
    }
  };

  return (
    <>
      <div className="flex flex-col space-y-3 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pink-lavender">Welcome to AI Shield</p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Sign in to start scanning</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email to continue.
        </p>
      </div>

      <div className="grid gap-6">
        <Suspense fallback={null}><AuthErrorNotice /></Suspense>
        <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-foreground">Email</Label>
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="username"
              autoCorrect="off"
              disabled={isContinuing}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'email-error' : undefined}
              className={`bg-card border-border text-foreground ${errors.email ? 'border-red-500' : ''}`}
              {...register('email')}
            />
            {errors.email && (
              <p id="email-error" role="alert" className="text-sm text-red-400">{errors.email.message}</p>
            )}
          </div>
          {error && (
            <div role="alert" className="rounded-md border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-400">{error}</div>
          )}
          <Button type="submit" disabled={isContinuing} className="w-full bg-cyan-azure-dark text-white hover:bg-space-cadet-light">
            {isContinuing && <Loader2 aria-hidden="true" className="size-4 animate-spin" />}
            Continue
          </Button>
        </form>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          <span>Or continue with an account</span>
          <span className="h-px flex-1 bg-border" />
        </div>
        <SocialLoginButtons disabled={isContinuing} />

        <div className="pt-1">
          <Button
            type="button"
            variant="ghost"
            className="w-full text-air-sup-blue hover:text-white hover:bg-white/5 border border-cyan-azure/20 rounded-xl py-5"
            asChild
          >
            <Link href="/dashboard/new-scan">
              Continue as Guest (No account needed)
            </Link>
          </Button>
        </div>
      </div>


      <div className="text-center">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back to home
        </Link>
      </div>
    </>
  );
}
