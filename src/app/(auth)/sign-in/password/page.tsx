'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getProviders, getSession, signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { SocialLoginButtons } from '@/components/auth/social-login-buttons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSignInEmail } from '@/lib/use-sign-in-email';

const passwordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters').max(256, 'Password is too long'),
});

type PasswordValues = z.infer<typeof passwordSchema>;

export default function PasswordPage() {
  const router = useRouter();
  const email = useSignInEmail();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    if (email === '') router.replace('/sign-in');
  }, [email, router]);

  const onSubmit = async ({ password }: PasswordValues) => {
    if (!email) return;
    setIsLoading(true);
    setError('');
    try {
      const providers = await getProviders();
      if (!providers?.credentials) {
        setError('Email sign-in is not configured yet. Please choose a connected account below.');
        return;
      }
      const result = await signIn('credentials', { email, password, redirect: false, redirectTo: '/dashboard' });
      if (!result?.ok || result.error) {
        setError('Email or password is incorrect, or the account has not verified its email.');
        return;
      }
      if (!(await getSession())?.user?.id) {
        setError('Sign-in could not be confirmed. Please try again.');
        return;
      }
      router.replace('/dashboard');
      router.refresh();
    } catch {
      setError('Unable to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!email) {
    return <p role="status" className="text-center text-sm text-muted-foreground">Preparing sign-in...</p>;
  }

  return (
    <div className="auth-slide-right space-y-8">
      <div className="space-y-3 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pink-lavender">Welcome back</p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Enter your password</h1>
        <div className="space-y-1">
          <p className="break-all text-sm text-muted-foreground">{email}</p>
          <Link href="/sign-in" className="text-sm text-pink-lavender underline underline-offset-4 hover:text-foreground">
            Change email
          </Link>
        </div>
      </div>

      <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-2">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="password" className="text-foreground">Password</Label>
            <Link href="/forgot-password" className="text-sm text-pink-lavender hover:underline">Forgot password?</Link>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            autoFocus
            disabled={isLoading}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'password-error' : undefined}
            className={`bg-card border-border text-foreground ${errors.password ? 'border-red-500' : ''}`}
            {...register('password')}
          />
          {errors.password && (
            <p id="password-error" role="alert" className="text-sm text-red-400">{errors.password.message}</p>
          )}
        </div>
        {error && (
          <div role="alert" className="rounded-md border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-400">{error}</div>
        )}
        <Button type="submit" disabled={isLoading} className="w-full bg-cyan-azure-dark text-white hover:bg-space-cadet-light">
          {isLoading && <Loader2 aria-hidden="true" className="size-4 animate-spin" />}
          Sign In
        </Button>
      </form>

      <div className="space-y-4">
        <p className="text-center text-sm text-muted-foreground">Choose an account to continue to your dashboard.</p>
        <SocialLoginButtons disabled={isLoading} />
      </div>
    </div>
  );
}
