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
    'API access available',
  ];

  return (
    <section className="py-24 relative overflow-hidden bg-space-cadet">
      {/* Background orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-azure/6 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Gradient border wrapper */}
        <div className="max-w-5xl mx-auto rounded-3xl p-px bg-gradient-to-br from-cyan-azure/50 via-pink-lavender/30 to-air-sup-blue/20">
          <div className="bg-space-cadet-dark rounded-3xl p-8 md:p-12 lg:p-16 flex flex-col lg:flex-row items-center gap-12">

            {/* Left: copy + checklist */}
            <div className="flex-1 space-y-6">
              <span className="inline-block px-3 py-1 rounded-full badge-primary text-xs font-semibold uppercase tracking-wider text-cyan-azure">
                Always Free
              </span>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                Powerful AI Detection,{' '}
                <br />
                <span className="gradient-text">Free for Everyone</span>
              </h2>
              <p className="text-air-sup-blue leading-relaxed">
                We believe content authenticity tools should be accessible to all. That's why AI
                Shield provides enterprise-grade detection capabilities completely free of charge.
              </p>

              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                {benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-cyan-azure shrink-0" />
                    <span className="text-sm text-air-sup-blue">{benefit}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-cyan-azure to-air-sup-blue hover:from-cyan-azure-dark hover:to-cyan-azure text-white border-0 shadow-palette-glow"
                  asChild
                >
                  <Link href="/dashboard/new-scan">Create Free Account</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-cyan-azure/30 text-air-sup-blue hover:bg-cyan-azure/10 hover:text-pink-lavender hover:border-pink-lavender/30"
                  asChild
                >
                  <Link href="/about">Why is it free?</Link>
                </Button>
              </div>
              <p className="text-xs text-ucla-blue">
                *AI Shield relies on fair-use limits to prevent abuse and ensure platform stability.
              </p>
            </div>

            {/* Right: price card */}
            <div className="flex-1 w-full max-w-md lg:max-w-xs glass-card rounded-2xl p-8 relative text-center">
              <div className="absolute -inset-4 bg-cyan-azure/8 blur-2xl rounded-full -z-10" />
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-cyan-azure/20 to-pink-lavender/20 border border-cyan-azure/30 text-foreground mb-4">
                <span className="text-3xl font-bold gradient-text">$0</span>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Forever Free</h3>
              <p className="text-air-sup-blue text-sm leading-relaxed">
                Our mission is to build trust in digital media, not to lock essential tools behind a
                paywall.
              </p>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
