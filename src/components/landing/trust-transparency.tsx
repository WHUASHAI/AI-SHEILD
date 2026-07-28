import { CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { DISCLAIMER } from '@/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function TrustTransparency() {
  const points = [
    'We employ statistical models that provide a probability, not absolute certainty.',
    'False positives (human content flagged as AI) can occur, especially with highly structured writing or heavily edited authentic photos.',
    'False negatives (AI content flagged as human) can occur as AI generation tools rapidly evolve.',
    'Results should be used as one data point in a broader verification process, not as definitive proof for punitive actions.'
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white mb-6">Trust & Transparency</h2>
            <p className="text-muted-foreground mb-8">
              We believe in being upfront about the capabilities and limitations of AI detection technology. While our tools are state-of-the-art, no system is infallible.
            </p>
            
            <ul className="space-y-4 mb-8">
              {points.map((point, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-cyan-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-foreground leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
            
            <Button variant="link" className="px-0 text-cyan-400 hover:text-cyan-300" asChild>
              <Link href="/limitations" className="flex items-center gap-2">
                Read our full limitations policy <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
          
          <div className="bg-surface rounded-2xl p-8 border border-border relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <AlertTriangle className="w-32 h-32 text-amber-500" />
            </div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 text-amber-500 font-semibold mb-4">
                <AlertTriangle className="w-5 h-5" />
                Important Disclaimer
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                {DISCLAIMER}
              </p>
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <p className="text-xs text-amber-200">
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
