import { CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { DISCLAIMER } from '@/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function TrustTransparency() {
  const points = [
    'We employ statistical models that provide a probability, not absolute certainty.',
    'False positives (human content flagged as AI) can occur, especially with highly structured writing or heavily edited authentic photos.',
    'False negatives (AI content flagged as human) can occur as AI generation tools rapidly evolve.',
    'Results should be used as one data point in a broader verification process, not as definitive proof for punitive actions.',
  ];

  return (
    <section className="py-24 bg-space-cadet">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

          {/* Left: copy */}
          <div>
            <span className="inline-block px-3 py-1 rounded-full badge-primary text-xs font-semibold uppercase tracking-wider mb-5 text-cyan-azure">
              Transparency First
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-6">
              Trust &{' '}
              <span className="gradient-text">Transparency</span>
            </h2>
            <p className="text-air-sup-blue mb-8 leading-relaxed">
              We believe in being upfront about the capabilities and limitations of AI detection
              technology. While our tools are state-of-the-art, no system is infallible.
            </p>

            <ul className="space-y-4 mb-8">
              {points.map((point, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-cyan-azure mt-0.5 shrink-0" />
                  <span className="text-sm text-air-sup-blue leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>

            <Button variant="link" className="px-0 text-cyan-azure hover:text-pink-lavender transition-colors" asChild>
              <Link href="/limitations" className="flex items-center gap-2">
                Read our full limitations policy <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          {/* Right: disclaimer card */}
          <div className="glass-card rounded-2xl p-8 relative overflow-hidden border border-cyan-azure/20">
            {/* Decorative alert triangle */}
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <AlertTriangle className="w-32 h-32 text-pink-lavender" />
            </div>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 text-pink-lavender font-semibold mb-4">
                <AlertTriangle className="w-5 h-5" />
                Important Disclaimer
              </div>
              <p className="text-air-sup-blue text-sm leading-relaxed mb-6">
                {DISCLAIMER}
              </p>
              <div className="p-4 bg-pink-lavender/8 border border-pink-lavender/20 rounded-xl">
                <p className="text-xs text-pink-lavender/80 leading-relaxed">
                  Always combine automated detection results with human judgment and context verification.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
