'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from 'next-auth/react';
import {
  Sparkles,
  ArrowRight,
  Shield,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SocialLoginButtons } from '@/components/auth/social-login-buttons';

interface ScanChoiceDialogProps {
  children: React.ReactNode;
}

export function ScanChoiceDialog({ children }: ScanChoiceDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

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

          <SocialLoginButtons redirectTo="/dashboard/new-scan" />

          <div className="rounded-lg bg-white/[0.02] p-2.5 text-center text-xs text-air-sup-blue/60">
            <Clock className="inline-block mr-1 h-3.5 w-3.5 text-cyan-azure/70 align-text-bottom" />
            Signed-in accounts automatically keep up to <strong>20 recent scans</strong> across all devices.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
