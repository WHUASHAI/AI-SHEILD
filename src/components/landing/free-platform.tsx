import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function FreePlatform() {
  const benefits = [
    'No subscription required',
    'Unlimited daily scans',
    'No premium paywalls',
    'Full access to all detection models',
    'Privacy-first analysis',
    'Detailed forensic reports',
    'Batch processing included',
    'API access available'
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto rounded-3xl p-[1px] bg-gradient-to-b from-cyan-500/30 to-border">
          <div className="bg-surface rounded-3xl p-8 md:p-12 lg:p-16 flex flex-col lg:flex-row items-center gap-12">
            
            <div className="flex-1 space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                Powerful AI Detection,<br/>
                <span className="text-cyan-400">Free for Everyone</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                We believe content authenticity tools should be accessible to all. That's why AI Sheild provides enterprise-grade detection capabilities completely free of charge.
              </p>
              
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                {benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-cyan-500 shrink-0" />
                    <span className="text-sm text-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row gap-4 pt-8">
                 <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-0" asChild>
                  <Link href="/dashboard/new-scan">Create Free Account</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/about">Why is it free?</Link>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                *AI Sheild relies on fair-use limits to prevent abuse and ensure platform stability for all users.
              </p>
            </div>
            
            <div className="flex-1 w-full max-w-md lg:max-w-none bg-background rounded-2xl p-8 border border-border relative">
               <div className="absolute -inset-4 bg-cyan-500/10 blur-2xl rounded-full -z-10" />
               <div className="text-center space-y-4">
                 <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-500/20 text-cyan-400 mb-2">
                   <span className="text-2xl font-bold">$0</span>
                 </div>
                 <h3 className="text-xl font-semibold text-white">Forever Free</h3>
                 <p className="text-muted-foreground text-sm">
                   Our mission is to build trust in digital media, not to lock essential tools behind a paywall.
                 </p>
               </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
