'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Logo } from '@/components/shared/logo';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { SocialLoginButtons } from '@/components/auth/social-login-buttons';
import { Button } from '@/components/ui/button';

interface ScanChoiceDialogProps {
  children: React.ReactNode;
}

export function ScanChoiceDialog({ children }: ScanChoiceDialogProps) {
  const router = useRouter();
  const [isStartingGuest, setIsStartingGuest] = useState(false);
  const [isStartingGoogle, setIsStartingGoogle] = useState(false);
  const [error, setError] = useState('');

  const startGuest = async () => {
    setIsStartingGuest(true);
    setError('');
    try {
      const response = await fetch('/api/guest', { method: 'POST' });
      if (!response.ok) throw new Error('Guest access unavailable');
      router.push('/dashboard/new-scan');
      router.refresh();
    } catch {
      setError('Could not start guest scanning. Please try again.');
      setIsStartingGuest(false);
    }
  };
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md border-cyan-azure/25 bg-[#0a1526]/95 backdrop-blur-xl p-6 text-foreground sm:rounded-2xl shadow-palette">
        <DialogHeader className="text-center sm:text-center">
          <div className="mx-auto mb-2">
            <Logo variant="icon" size="lg" />
          </div>
          <DialogTitle className="text-2xl font-bold tracking-tight text-white">
            Start Scanning
          </DialogTitle>
          <DialogDescription className="text-sm text-air-sup-blue/80">
            Choose Google for account history, or keep guest history in this browser.
          </DialogDescription>
        </DialogHeader>
        <div className="pt-2">
          <SocialLoginButtons disabled={isStartingGuest} onPendingChange={setIsStartingGoogle} redirectTo="/dashboard/new-scan" />
          <p className="mt-2 text-xs text-muted-foreground">Your scan history stays saved to your account across visits and devices.</p>
          <Button type="button" variant="outline" disabled={isStartingGuest || isStartingGoogle} onClick={() => void startGuest()} className="mt-5 h-12 w-full">
            {isStartingGuest && <Loader2 aria-hidden="true" className="size-4 animate-spin" />}
            Continue as Guest
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">Your guest history stays saved for this browser while its guest cookie remains available.</p>
          {error && <p role="alert" className="mt-3 text-sm text-red-400">{error}</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
