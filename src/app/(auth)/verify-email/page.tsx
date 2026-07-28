'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, RefreshCw, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function VerifyEmailPage() {
  const [countdown, setCountdown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResend = async () => {
    if (countdown > 0) return;
    
    setIsResending(true);
    setMessage('');
    
    try {
      // Stub for actual API call
      // await fetch('/api/auth/resend-verification', { method: 'POST' });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCountdown(60);
      setMessage('Verification email has been resent.');
    } catch (error) {
      setMessage('Failed to resend verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8 text-center">
      <div className="p-5 bg-cyan-950/40 rounded-full border border-cyan-900/50">
        <Mail className="h-12 w-12 text-cyan-500" />
      </div>
      
      <div className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight text-white">Check your email</h1>
        <p className="text-slate-400 max-w-sm mx-auto">
          We've sent a verification link to your email address. Please click the link to verify your account.
        </p>
      </div>

      <div className="w-full space-y-4">
        {message && (
          <div className="p-3 text-sm rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            {message}
          </div>
        )}

        <Button 
          variant="outline" 
          onClick={handleResend}
          disabled={countdown > 0 || isResending}
          className="w-full bg-slate-900 border-slate-700 text-white hover:bg-slate-800 hover:text-white"
        >
          {isResending ? (
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          ) : countdown > 0 ? (
            `Resend email in ${countdown}s`
          ) : (
            'Resend verification email'
          )}
        </Button>

        <Button asChild variant="ghost" className="w-full text-slate-400 hover:text-white hover:bg-slate-800">
          <Link href="/sign-in">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to sign in
          </Link>
        </Button>
      </div>
    </div>
  );
}
