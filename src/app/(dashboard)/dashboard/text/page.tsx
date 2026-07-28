'use client';

import React from 'react';
import { DisclaimerBanner } from '@/components/detection/disclaimer-banner';
import { TextHeatmap } from '@/components/detection/text-heatmap';
import { Button } from '@/components/ui/button';
import { FileText, ShieldAlert, Cpu, User, AlignLeft, Bot, AlertTriangle } from 'lucide-react';

export default function TextDetectorPage() {
  // Mock data
  const sampleText = `The rapid advancement of artificial intelligence has brought about significant changes in various industries. From healthcare to finance, AI systems are being deployed to optimize processes, improve decision-making, and create entirely new services. However, these advancements also raise important ethical and societal questions.

One of the primary concerns is the potential for job displacement as automation becomes more sophisticated. While some argue that AI will create new job categories, others warn of widening economic inequalities if the transition is not managed carefully.

Furthermore, issues related to algorithmic bias and data privacy remain unresolved. Ensuring that AI systems are fair, transparent, and aligned with human values is a complex challenge that requires collaboration between technologists, policymakers, and society at large.`;

  const mockAnnotations = [
    { id: '1', start: 0, end: 125, score: 0.9, signalName: 'Predictable Token Patterns' },
    { id: '2', start: 295, end: 512, score: 0.85, signalName: 'Low Perplexity' },
    { id: '3', start: 514, end: 775, score: 0.6, signalName: 'Generic phrasing' },
  ];

  return (
    <div className="container max-w-6xl py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center">
          <FileText className="w-8 h-8 mr-3 text-cyan-500" /> Text Analysis
        </h1>
        <p className="text-slate-400">Analyze text for AI generation patterns and structural anomalies.</p>
      </div>

      <DisclaimerBanner />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <TextHeatmap text={sampleText} annotations={mockAnnotations} />
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center"><AlignLeft className="w-5 h-5 mr-2 text-slate-400" /> Detected Patterns</h3>
            <div className="space-y-4">
              {[
                { name: 'Low Perplexity', desc: 'Text follows highly predictable word choices typical of LLMs.', impact: 'high' },
                { name: 'Burstiness Variance', desc: 'Consistent sentence lengths without human-like variation.', impact: 'medium' },
                { name: 'Repetitive Structures', desc: 'Overuse of transition words ("Furthermore", "However").', impact: 'low' },
              ].map((pattern, i) => (
                <div key={i} className="flex items-start bg-slate-950 p-4 rounded-lg border border-slate-800">
                  <Bot className={`w-5 h-5 mr-3 mt-0.5 ${pattern.impact === 'high' ? 'text-red-500' : pattern.impact === 'medium' ? 'text-amber-500' : 'text-emerald-500'}`} />
                  <div>
                    <h4 className="font-medium text-slate-200">{pattern.name}</h4>
                    <p className="text-sm text-slate-400 mt-1">{pattern.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />
            <h2 className="text-xl font-semibold mb-6">Analysis Results</h2>
            
            <div className="flex flex-col items-center justify-center py-6 mb-6 bg-slate-950 rounded-xl border border-slate-800">
              <ShieldAlert className="w-12 h-12 text-red-500 mb-3" />
              <div className="text-2xl font-bold text-white mb-1">Likely AI-Generated</div>
              <div className="text-sm text-slate-400">Confidence: 78%</div>
            </div>

            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="flex items-center text-slate-300"><Cpu className="w-4 h-4 mr-2 text-red-500" /> AI Probability</span>
                  <span className="font-bold text-red-400">85%</span>
                </div>
                <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: '85%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="flex items-center text-slate-300"><User className="w-4 h-4 mr-2 text-emerald-500" /> Human Probability</span>
                  <span className="font-bold text-emerald-400">15%</span>
                </div>
                <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '15%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="font-semibold mb-3 flex items-center"><AlertTriangle className="w-4 h-4 mr-2 text-amber-500" /> Limitations</h3>
            <ul className="space-y-2 text-sm text-slate-400 list-disc pl-4">
              <li>Short texts under 100 words have higher false positive rates.</li>
              <li>Heavily edited human text may trigger AI patterns.</li>
              <li>Non-native English writing occasionally resembles AI outputs.</li>
            </ul>
          </div>

          <Button className="w-full bg-slate-800 hover:bg-slate-700 text-white border border-slate-700">
            Export Report
          </Button>
        </div>
      </div>
    </div>
  );
}
