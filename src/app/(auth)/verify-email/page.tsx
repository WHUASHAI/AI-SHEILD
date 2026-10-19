'use client';

import { Suspense, useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, ArrowLeft, RefreshCw, CheckCircle2, AlertTriangle, ExternalLink, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut, useSession } from 'next-auth/react';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const queryEmail = searchParams.get('email');
  const errorParam = searchParams.get('error');
  const userEmail = queryEmail || session?.user?.email || '';

  const [isSending, setIsSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [devPreviewUrl, setDevPreviewUrl] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const hasAutoSent = useRef(false);

  // Auto-send verification email on first landing if email is known
  useEffect(() => {
    if (userEmail && !hasAutoSent.current && !errorParam) {
      hasAutoSent.current = true;
      void handleSendEmail(true);
    }
  }, [userEmail, errorParam]);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Poll for confirmation status (in case user clicks link on another tab or device)
  useEffect(() => {
    if (!userEmail || isConfirmed) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/auth/check-verification?email=${encodeURIComponent(userEmail)}`);
        const data = await res.json();
        if (data.confirmed) {
          setIsConfirmed(true);
          clearInterval(interval);
          setTimeout(() => {
            router.push('/dashboard?verified=true');
          }, 1200);
        }
      } catch {
        // Silently ignore polling errors
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [userEmail, isConfirmed, router]);

  const handleSendEmail = async (isInitial = false) => {
    if (!userEmail || (cooldown > 0 && !isInitial)) return;
    setIsSending(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatusMessage({
          type: 'success',
          text: isInitial
            ? `Confirmation email sent to ${userEmail}.`
            : `New confirmation link sent to ${userEmail}. Check your inbox!`,
        });
        setCooldown(60);
        if (data.previewUrl) {
          setDevPreviewUrl(data.previewUrl);
        }
      } else {
        if (data.previewUrl) {
          setDevPreviewUrl(data.previewUrl);
          setStatusMessage({
            type: 'info',
            text: 'Resend API key is not configured yet in Vercel. You can use the direct link below for testing.',
          });
        } else {
          setStatusMessage({
            type: 'error',
            text: data.error || 'Failed to send confirmation email. Please try again.',
          });
        }
      }
    } catch {
      setStatusMessage({
        type: 'error',
        text: 'Network error. Please try again.',
      });
    } finally {
      setIsSending(false);
    }
  };

  if (isConfirmed) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 text-center py-6">
        <div className="p-4 bg-emerald-500/10 rounded-full border border-emerald-500/30 text-emerald-400 animate-pulse">
          <ShieldCheck className="h-12 w-12" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Email Confirmed!</h1>
          <p className="text-sm text-muted-foreground">Redirecting you to the AI Shield dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-6 text-center py-4">
      {/* Icon */}
      <div className="p-5 bg-cyan-azure/10 rounded-full border border-cyan-azure/25">
        <Mail className="h-12 w-12 text-cyan-azure animate-bounce" style={{ animationDuration: '3s' }} />
      </div>

      {/* Header */}
      <div className="space-y-2 max-w-sm">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Confirm your email
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Before accessing the dashboard, please verify your Google account by clicking the confirmation link sent to:
        </p>
        {userEmail ? (
          <p className="font-semibold text-cyan-azure text-base bg-cyan-azure/10 py-1.5 px-3 rounded-lg border border-cyan-azure/20 inline-block break-all">
            {userEmail}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground italic">Your registered Google email address</p>
        )}
      </div>

      {/* Error notification if clicked an expired token */}
      {errorParam === 'invalid_or_expired' && (
        <div className="w-full flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-left text-sm text-amber-200">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-400" />
          <p>This verification link is invalid or has expired. Please send a new one below.</p>
        </div>
      )}

      {/* Status message */}
      {statusMessage && (
        <div
          className={`w-full flex items-start gap-3 rounded-xl p-4 text-left text-sm ${
            statusMessage.type === 'success'
              ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
              : statusMessage.type === 'error'
              ? 'border border-red-500/30 bg-red-500/10 text-red-300'
              : 'border border-blue-500/30 bg-blue-500/10 text-blue-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-400" />
          )}
          <p>{statusMessage.text}</p>
        </div>
      )}

      {/* Development fallback link when RESEND_API_KEY is pending */}
      {devPreviewUrl && (
        <div className="w-full rounded-xl border border-cyan-azure/30 bg-space-cadet-dark/60 p-4 text-left text-xs space-y-2">
          <p className="font-semibold text-cyan-azure flex items-center gap-1.5">
            <ExternalLink className="size-3.5" />
            Testing / Development Mode:
          </p>
          <p className="text-muted-foreground">
            Configure <code className="text-pink-lavender">RESEND_API_KEY</code> in Vercel to send real emails to your Gmail. For now, you can click this test link directly:
          </p>
          <a
            href={devPreviewUrl}
            className="inline-block mt-1 font-medium text-cyan-azure hover:underline break-all"
          >
            Activate account now &rarr;
          </a>
        </div>
      )}

      {/* Action buttons */}
      <div className="w-full space-y-3 pt-2">
        <Button
          type="button"
          onClick={() => void handleSendEmail(false)}
          disabled={isSending || cooldown > 0}
          className="w-full bg-cyan-azure-dark text-white hover:bg-space-cadet-light py-5 rounded-xl font-medium"
        >
          {isSending ? (
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Mail className="mr-2 h-4 w-4" />
          )}
          {cooldown > 0 ? `Resend email in ${cooldown}s` : 'Resend confirmation email'}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => void signOut({ redirectTo: '/sign-in' })}
          className="w-full border-cyan-azure/25 bg-space-cadet-dark/30 hover:bg-white/5 text-muted-foreground hover:text-foreground py-5 rounded-xl"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Sign in with another account
        </Button>
      </div>

      <div className="text-xs text-muted-foreground pt-2">
        <p>Didn&apos;t receive it? Check your Spam / Junk folder or click Resend above.</p>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center p-8 text-sm text-muted-foreground">
          Loading email verification...
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
