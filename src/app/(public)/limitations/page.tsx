import { AlertTriangle, CheckCircle } from 'lucide-react';
import { DisclaimerBanner } from '@/components/shared/disclaimer-banner';

export default function LimitationsPage() {
  return (
    <div className="pt-32 pb-20 container mx-auto px-4 max-w-4xl">
      <h1 className="text-4xl font-bold text-white mb-6">Limitations & Responsible Use</h1>
      <p className="text-lg text-muted-foreground mb-12">
        We believe in being fully transparent about the capabilities and boundaries of AI Sheild. Please read this guide to understand how to correctly interpret our results.
      </p>

      <DisclaimerBanner className="mb-12" />

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Statistical Nature of Detection</h2>
        <p className="text-muted-foreground mb-4">
          AI Sheild does not have a magical watermarking system that provides absolute certainty. Instead, it relies on complex statistical models and pattern recognition. It analyzes the content against known signatures of AI generation and provides a <strong>probability score</strong>.
        </p>
        <p className="text-muted-foreground">
          A high probability score (e.g., 90%) means that the content exhibits many characteristics commonly found in AI-generated material. It does <strong>not</strong> mean we are 90% sure, or that 90% of the document is AI. It is a statistical likelihood.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Types of Errors</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 bg-surface border border-border rounded-xl">
            <h3 className="text-xl font-medium text-white mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" /> False Positives
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              When human-created content is incorrectly flagged as AI-generated.
            </p>
            <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
              <li>Highly formulaic or structured writing.</li>
              <li>Heavily edited photos (e.g., extensive retouching in Photoshop).</li>
              <li>Text written by non-native speakers that may lack typical human "burstiness".</li>
            </ul>
          </div>
          <div className="p-6 bg-surface border border-border rounded-xl">
             <h3 className="text-xl font-medium text-white mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" /> False Negatives
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              When AI-generated content is incorrectly flagged as human-created.
            </p>
             <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
              <li>Content heavily edited by a human after AI generation.</li>
              <li>Output from very new or highly fine-tuned AI models.</li>
              <li>Very short text snippets (under 200 words) where statistical analysis is unreliable.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">When NOT to rely solely on this tool</h2>
        <ul className="space-y-4">
          <li className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">Academic Disciplinary Action:</strong>
              <p className="text-muted-foreground text-sm">Never use this tool as the sole evidence to accuse a student of plagiarism or AI cheating. Use it as a conversation starter.</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">Legal Evidence:</strong>
              <p className="text-muted-foreground text-sm">Our reports provide technical analysis but are not a substitute for certified digital forensic experts in a court of law.</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">Employment Decisions:</strong>
              <p className="text-muted-foreground text-sm">Do not fire or penalize employees or freelancers based solely on automated detection results.</p>
            </div>
          </li>
        </ul>
      </section>
      
    </div>
  );
}
