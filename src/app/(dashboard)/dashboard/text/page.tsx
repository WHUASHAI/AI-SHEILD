'use client';

import React, { useState } from 'react';
import { FileText, ShieldCheck, Zap, Info, Bot, User, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface TextScanResult {
  scanId: string;
  language: string;
  status: string;
  result: 'Likely AI-Generated' | 'Likely Human-Created';
  sourceModel?: string | null;
  confidence: number;
  overallScore: number;
  signals: Array<{ name: string; score: number; description: string }>;
  limitations: string[];
  disclaimer: string;
  wordCount: number;
}

import { useRecentScans } from '@/lib/use-recent-scans';
import { useRouter } from 'next/navigation';

export default function TextDetectorPage() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TextScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { addScan } = useRecentScans();
  const router = useRouter();

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const charCount = text.length;

  const handleScan = async () => {
    if (text.length < 10) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/scan/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to analyze text.');
      } else {
        addScan({
          name: text.substring(0, 20) + '...',
          type: 'text',
          result: data.result,
          confidence: data.confidence,
        });
        setResult(data);
      }
    } catch (err) {
      setError('Network error analyzing text.');
    } finally {
      setLoading(false);
    }
  };

  const isAi = result?.result === 'Likely AI-Generated';

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-azure/20 to-air-sup-blue/20 border border-cyan-azure/30 flex items-center justify-center">
          <FileText className="w-6 h-6 text-cyan-azure" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Text Analysis</h1>
          <p className="text-sm text-air-sup-blue mt-0.5">Detect AI-generated text patterns.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
        <div className="xl:col-span-3 space-y-6">
          <div className="glass-card rounded-2xl p-6 space-y-5">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your text here to analyze... (minimum 10 characters)"
              rows={12}
              className="w-full bg-space-cadet-dark/60 border border-cyan-azure/20 rounded-xl p-4 text-sm text-foreground placeholder:text-ucla-blue focus:outline-none focus:border-cyan-azure/50 focus:ring-1 focus:ring-cyan-azure/25 resize-none transition-all"
            />
            <div className="flex items-center justify-between mt-2 px-1 text-xs text-ucla-blue">
              <span>{wordCount} words · {charCount} chars</span>
            </div>

            {error && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
            <Button
              onClick={handleScan}
              disabled={loading || text.length < 10}
              suppressHydrationWarning
              className="w-full h-12 bg-gradient-to-r from-cyan-azure to-air-sup-blue hover:from-cyan-azure-dark hover:to-cyan-azure text-white font-semibold text-base shadow-palette-glow disabled:opacity-50 transition-all"
            >
              {loading ? 'Analyzing...' : 'Run AI Analysis'}
              <ShieldCheck className="w-4 h-4 ml-2" />
            </Button>
          </div>
          
          {/* Signals breakdown */}
          {result && (
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <h3 className="font-semibold text-foreground text-sm">Detection Signals</h3>
              <div className="space-y-3">
                {result.signals.map((signal) => (
                  <div key={signal.name} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-foreground font-medium">{signal.name}</span>
                      <span className="text-air-sup-blue">{Math.round(signal.score * 100)}%</span>
                    </div>
                    <div className="h-1.5 bg-space-cadet-dark/60 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-700',
                          signal.score > 0.6 ? 'bg-red-400' : signal.score > 0.35 ? 'bg-amber-400' : 'bg-emerald-400'
                        )}
                        style={{ width: `${Math.round(signal.score * 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-ucla-blue">{signal.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="xl:col-span-2 space-y-4">
            {!result ? (
              <>
                <div className="glass-card rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                    <Zap className="w-12 h-12 text-cyan-azure mb-4" />
                    <h3 className="text-lg font-semibold text-foreground">Awaiting Input</h3>
                    <p className="text-sm text-air-sup-blue mt-2">Paste your text and run analysis to see AI detection results here.</p>
                </div>
                
                <div className="glass-card rounded-2xl p-6 space-y-5">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Info className="w-4 h-4 text-cyan-azure" /> How It Works
                  </h3>
                  <p className="text-xs text-ucla-blue leading-relaxed">
                    Paste your text, and our AI models will analyze perplexity and burstiness to detect patterns characteristic of AI-generated content.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className={cn('glass-card rounded-2xl p-6 border', isAi ? 'bg-red-500/10 border-red-500/20' : 'bg-emerald-500/10 border-emerald-500/20')}>
                  <div className="flex items-center gap-3 mb-4">
                    {isAi ? <Bot className="w-8 h-8 text-red-400" /> : <User className="w-8 h-8 text-emerald-400" />}
                    <div>
                      <p className="text-xs text-air-sup-blue">Detection Result</p>
                      <h3 className={cn('text-lg font-bold', isAi ? 'text-red-400' : 'text-emerald-400')}>{result.result}</h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative w-20 h-20">
                      <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                        <circle cx="40" cy="40" r="32" fill="none" stroke="currentColor" strokeWidth="6" className="text-space-cadet-dark/40" />
                        <circle
                          cx="40" cy="40" r="32" fill="none" strokeWidth="6" strokeLinecap="round"
                          className={isAi ? 'text-red-400' : 'text-emerald-400'}
                          stroke="currentColor"
                          strokeDasharray={`${2 * Math.PI * 32}`}
                          strokeDashoffset={`${2 * Math.PI * 32 * (1 - result.overallScore / 100)}`}
                          style={{ transition: 'stroke-dashoffset 1s ease' }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={cn('text-lg font-bold', isAi ? 'text-red-400' : 'text-emerald-400')}>{result.overallScore}%</span>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      {isAi && result.sourceModel && (
                        <div>
                          <p className="text-xs text-air-sup-blue">Predicted Source</p>
                          <p className="font-semibold text-foreground flex items-center gap-2">
                            <Bot className="w-4 h-4 text-cyan-azure" />
                            {result.sourceModel}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-air-sup-blue">Confidence</p>
                        <p className="font-medium text-foreground">{result.confidence}% Match</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-4 text-xs text-ucla-blue space-y-2">
                  <p className="font-medium text-foreground">Limitations</p>
                  <ul className="space-y-1 list-disc list-inside">
                    {result.limitations.map((l, i) => <li key={i}>{l}</li>)}
                  </ul>
                </div>
              </>
            )}
        </div>
      </div>
    </div>
  );
}