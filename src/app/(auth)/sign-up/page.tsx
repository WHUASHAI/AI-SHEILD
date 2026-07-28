'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SocialLoginButtons } from '@/components/auth/social-login-buttons';
import { PasswordStrength } from '@/components/auth/password-strength';

const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  terms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and conditions'
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignUpValues = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
  });

  const watchPassword = watch('password', '');

  const onSubmit = async (data: SignUpValues) => {
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/sign-up', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || result.message || 'Failed to sign up');
      }
      
      // Route to verify email or dashboard
      // router.push('/verify-email');
      setError(result.message || 'Sign up successful, but dashboard is not ready.');
      
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign up');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-white">Create your free account</h1>
        <p className="text-sm text-slate-400">
          No payment information required
        </p>
      </div>

      <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-center">
        <p className="text-sm text-emerald-400 font-medium">
          100% free. No credit card. No hidden fees.
        </p>
      </div>

      <div className="grid gap-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-slate-300">Name</Label>
              <Input
                id="name"
                placeholder="Elijah"
                type="text"
                disabled={isLoading}
                className={`bg-slate-900 border-slate-700 text-white ${errors.name ? 'border-red-500' : ''}`}
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email" className="text-slate-300">Email</Label>
              <Input
                id="email"
                placeholder="name@example.com"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                disabled={isLoading}
                className={`bg-slate-900 border-slate-700 text-white ${errors.email ? 'border-red-500' : ''}`}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password" className="text-slate-300">Password</Label>
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
              <Label htmlFor="confirmPassword" className="text-slate-300">Confirm Password</Label>
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

            <div className="flex items-start space-x-2 my-2">
              <input
                type="checkbox"
                id="terms"
                className="mt-1 bg-slate-900 border-slate-700 text-cyan-600 rounded"
                {...register('terms')}
              />
              <Label htmlFor="terms" className="text-sm text-slate-400 font-normal leading-tight">
                I agree to the <Link href="/terms" className="text-cyan-500 hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-cyan-500 hover:underline">Privacy Policy</Link>
              </Label>
            </div>
            {errors.terms && (
              <p className="text-sm text-red-500 -mt-2">{errors.terms.message}</p>
            )}

            {error && (
              <div className="p-3 text-sm rounded-md bg-red-500/10 border border-red-500/50 text-red-400">
                {error}
              </div>
            )}

            <Button disabled={isLoading} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white">
              {isLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Account
            </Button>
          </div>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#0a0f1e] px-2 text-slate-500">
              Or continue with
            </span>
          </div>
        </div>

        <SocialLoginButtons />
      </div>

      <p className="px-8 text-center text-sm text-slate-400">
        Already have an account?{' '}
        <Link
          href="/sign-in"
          className="underline underline-offset-4 hover:text-cyan-400 text-cyan-500"
        >
          Sign in
        </Link>
      </p>
    </>
  );
}
