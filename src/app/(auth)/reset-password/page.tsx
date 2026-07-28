'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordStrength } from '@/components/auth/password-strength';

const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams?.get('token');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const watchPassword = watch('password', '');

  const onSubmit = async (data: ResetPasswordValues) => {
    if (!token) {
      setError('Invalid or missing password reset token');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Stub for actual API call
      // const res = await fetch('/api/auth/reset-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ token, password: data.password }),
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSuccess(true);
      
    } catch (err: any) {
      setError(err.message || 'An error occurred while resetting your password');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 text-center">
        <div className="p-4 bg-red-500/10 rounded-full border border-red-500/20">
          <AlertCircle className="h-10 w-10 text-red-500" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-white">Invalid Reset Link</h1>
          <p className="text-slate-400 max-w-sm">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
        </div>
        <Button asChild className="mt-4 w-full bg-cyan-600 hover:bg-cyan-700 text-white">
          <Link href="/forgot-password">Request new link</Link>
        </Button>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 text-center">
        <div className="p-4 bg-emerald-500/10 rounded-full border border-emerald-500/20">
          <CheckCircle2 className="h-10 w-10 text-emerald-500" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-white">Password reset complete</h1>
          <p className="text-slate-400 max-w-sm">
            Your password has been reset successfully. You can now sign in with your new password.
          </p>
        </div>
        <Button asChild className="mt-4 w-full bg-cyan-600 hover:bg-cyan-700 text-white">
          <Link href="/sign-in">Sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-white">Set new password</h1>
        <p className="text-sm text-slate-400">
          Enter your new password below.
        </p>
      </div>

      <div className="grid gap-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-slate-300">New Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                disabled={isLoading}
                className={`bg-slate-900 border-slate-700 text-white ${errors.password ? 'border-red-500' : ''}`}
                {...register('password')}
              />
              <PasswordStrength password={watchPassword} />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirmPassword" className="text-slate-300">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                disabled={isLoading}
                className={`bg-slate-900 border-slate-700 text-white ${errors.confirmPassword ? 'border-red-500' : ''}`}
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>

            {error && (
              <div className="p-3 text-sm rounded-md bg-red-500/10 border border-red-500/50 text-red-400">
                {error}
              </div>
            )}

            <Button disabled={isLoading} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white">
              {isLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Reset Password
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
