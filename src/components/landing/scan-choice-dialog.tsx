'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession, getProviders, signIn } from 'next-auth/react';
import {
  Sparkles,
  ArrowRight,
  Shield,
  Loader2,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

// Google brand icon
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

// Facebook brand icon
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.026 4.388 11.02 10.125 11.927v-8.437H7.078v-3.49h3.047V9.413c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.971h-1.513c-1.491 0-1.956.931-1.956 1.887v2.263h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073Z" />
    </svg>
  );
}

interface ScanChoiceDialogProps {
  children: React.ReactNode;
}

export function ScanChoiceDialog({ children }: ScanChoiceDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleTriggerClick = async (e: React.MouseEvent) => {
    try {
      const session = await getSession();
      if (session?.user) {
        // User is already logged in, go straight to scanning
        e.preventDefault();
        router.push('/dashboard/new-scan');
        return;
      }
    } catch {
      // Proceed to show dialog
    }
    setOpen(true);
  };

  const handleContinueAsGuest = () => {
    setOpen(false);
    router.push('/dashboard/new-scan');
  };

  const handleSocialSignIn = async (providerId: 'google' | 'facebook', providerName: string) => {
    setError('');
    setLoadingProvider(providerId);
    try {
      const available = await getProviders();
      if (!available?.[providerId]) {
        setError(`${providerName} sign-in is not configured yet. You can still scan as a Guest!`);
        return;
      }
      await signIn(providerId, { redirectTo: '/dashboard/new-scan' });
    } catch {
      setError(`Could not connect to ${providerName}. Please try again or continue as Guest.`);
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div onClick={handleTriggerClick} className="inline-block cursor-pointer">
        {children}
      </div>

      <DialogContent className="max-w-md border-cyan-azure/25 bg-[#0a1526]/95 backdrop-blur-xl p-6 text-foreground sm:rounded-2xl shadow-palette">
        <DialogHeader className="text-center sm:text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-azure/20 to-air-sup-blue/20 border border-cyan-azure/30">
            <Shield className="h-6 w-6 text-cyan-azure" />
          </div>
          <DialogTitle className="text-2xl font-bold tracking-tight text-white">
            Start Scanning
          </DialogTitle>
          <DialogDescription className="text-sm text-air-sup-blue/80">
            Choose how you would like to analyze your content.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
            {error}
          </div>
        )}

        <div className="space-y-4 pt-2">
          {/* Option 1: Continue as Guest */}
          <div
            onClick={handleContinueAsGuest}
            className="group relative cursor-pointer overflow-hidden rounded-xl border border-cyan-azure/30 bg-gradient-to-r from-cyan-azure/10 via-air-sup-blue/5 to-transparent p-4 transition-all duration-200 hover:border-cyan-azure hover:bg-cyan-azure/15 hover:shadow-[0_0_25px_rgba(78,122,177,0.25)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-azure/20 text-cyan-azure">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">Continue as Guest</span>
                    <span className="rounded-full bg-cyan-azure/20 px-2 py-0.5 text-[10px] font-medium text-cyan-azure">
                      Instant Access
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-air-sup-blue/70">
                    No sign-in required. Scan history is active for this browser session.
                  </p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-cyan-azure transition-transform group-hover:translate-x-1 mt-1 shrink-0" />
            </div>
          </div>

          {/* Divider */}
          <div className="relative my-4 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-cyan-azure/15" />
            </div>
            <div className="relative bg-[#0a1526] px-3 text-[11px] font-medium uppercase tracking-wider text-air-sup-blue/60">
              Or Sign In to Save History
            </div>
          </div>

          {/* Social Sign-In buttons (Google & Facebook) */}
          <div className="space-y-2.5">
            {/* Google */}
            <Button
              type="button"
              variant="outline"
              disabled={loadingProvider !== null}
              onClick={() => void handleSocialSignIn('google', 'Google')}
              className="h-12 w-full justify-start gap-3 rounded-xl border-cyan-azure/20 bg-white/[0.04] px-4 text-left text-sm font-medium text-white hover:border-cyan-azure/50 hover:bg-white/[0.08]"
            >
              <GoogleIcon className="h-5 w-5 shrink-0" />
              <span className="flex-1">Continue with Google</span>
              {loadingProvider === 'google' && <Loader2 className="h-4 w-4 animate-spin text-cyan-azure" />}
            </Button>

            {/* Facebook */}
            <Button
              type="button"
              variant="outline"
              disabled={loadingProvider !== null}
              onClick={() => void handleSocialSignIn('facebook', 'Facebook')}
              className="h-12 w-full justify-start gap-3 rounded-xl border-cyan-azure/20 bg-white/[0.04] px-4 text-left text-sm font-medium text-white hover:border-cyan-azure/50 hover:bg-white/[0.08]"
            >
              <FacebookIcon className="h-5 w-5 shrink-0 text-[#1877F2]" />
              <span className="flex-1">Continue with Facebook</span>
              {loadingProvider === 'facebook' && <Loader2 className="h-4 w-4 animate-spin text-cyan-azure" />}
            </Button>
          </div>

          <div className="rounded-lg bg-white/[0.02] p-2.5 text-center text-xs text-air-sup-blue/60">
            <Clock className="inline-block mr-1 h-3.5 w-3.5 text-cyan-azure/70 align-text-bottom" />
            Signed-in accounts automatically keep up to <strong>20 recent scans</strong> across all devices.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
