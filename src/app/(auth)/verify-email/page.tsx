import Link from 'next/link';
import { Mail, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function VerifyEmailPage() {
  return (
    <div className="flex flex-col items-center justify-center space-y-8 text-center">
      <div className="p-5 bg-cyan-950/40 rounded-full border border-cyan-900/50">
        <Mail className="h-12 w-12 text-cyan-500" />
      </div>
      
      <div className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight text-white">Verify your email</h1>
        <p className="text-slate-400 max-w-sm mx-auto">
          Email verification is currently unavailable. Return to sign-in to use a connected account.
        </p>
      </div>

      <div className="w-full space-y-4">
        <Button 
          variant="outline" 
          disabled
          className="w-full bg-slate-900 border-slate-700 text-white hover:bg-slate-800 hover:text-white"
        >
          Resend verification email
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
