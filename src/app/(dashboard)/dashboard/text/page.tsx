'use client';

import { useState } from 'react';
import { FileText, ShieldCheck, Info, Bot, User, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useLocalTextDetector } from '@/lib/use-local-text-detector';
import { MAX_LOCAL_TEXT_CHARACTERS, MIN_LOCAL_TEXT_WORDS, localTextWordCount,
  type LocalTextResult } from '@/lib/local-text-detector';

const percentage = (score: number) => `${score.toLocaleString(undefined, { maximumFractionDigits: 1 })}%`;

export default function TextDetectorPage() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LocalTextResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { analyzeLocal, localProgress, cancelLocal } = useLocalTextDetector();
  const wordCount = localTextWordCount(text);
  const validInput = wordCount >= MIN_LOCAL_TEXT_WORDS && text.length <= MAX_LOCAL_TEXT_CHARACTERS;

  const handleScan = async () => {
    if (loading || !validInput) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try { setResult(await analyzeLocal(text)); }
    catch (error) { setError(error instanceof Error ? error.message : 'Unable to analyze this text. No verdict was generated.'); }
    finally { setLoading(false); }
  };

  const isAi = result?.result === 'Likely AI-Generated';
  const platformClues = result?.platformClues ?? [];
  const resultColor = isAi ? 'text-red-400' : 'text-emerald-400';

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-cyan-azure/15 border border-cyan-azure/30 flex items-center justify-center">
          <FileText className="w-6 h-6 text-cyan-azure" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Text Analysis</h1>
          <p className="text-sm text-air-sup-blue mt-0.5">Check your text for AI-generated writing.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
        <div className="xl:col-span-3 space-y-6">
          <div className="glass-card rounded-2xl p-6 space-y-5">
            <p className="text-sm text-air-sup-blue leading-relaxed">
              Paste at least {MIN_LOCAL_TEXT_WORDS} English words to analyze whether your text is likely AI-generated or human-created.
            </p>
            <Textarea id="text-analysis-input" autoComplete="off" value={text} disabled={loading}
              onChange={event => { setText(event.target.value); setResult(null); setError(null); }}
              placeholder="Paste English prose here (at least 50 words; up to 50,000 characters)..."
              maxLength={MAX_LOCAL_TEXT_CHARACTERS} rows={12} aria-label="Text to analyze" aria-describedby="text-input-count"
              className="w-full bg-space-cadet-dark/60 border border-cyan-azure/20 rounded-xl p-4 text-sm text-foreground placeholder:text-ucla-blue focus:border-cyan-azure/50 resize-y" />
            <div id="text-input-count" className="flex justify-between gap-3 text-xs text-air-sup-blue">
              <span>{wordCount} words · {text.length.toLocaleString()} chars</span>
              <span>{wordCount < MIN_LOCAL_TEXT_WORDS ? `${MIN_LOCAL_TEXT_WORDS - wordCount} more words needed` : 'Ready to analyze'}</span>
            </div>
            {error && <div role="alert" className="flex gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /><span>{error}</span>
            </div>}
            {/* Prevent Firefox restoring a previous enabled state before hydration. */}
            <Button id="text-analysis-submit" type="button" autoComplete="off" onClick={handleScan} disabled={loading || !validInput} className="w-full h-12 font-semibold text-base">
              {loading ? 'Analyzing...' : 'Run Free Local Analysis'}<ShieldCheck className="w-4 h-4 ml-2" />
            </Button>
            {loading && <div className="space-y-2">
              <p role="status" aria-live="polite" className="text-xs text-air-sup-blue">{localProgress}</p>
              <Button type="button" autoComplete="off" variant="outline" onClick={cancelLocal}>Cancel analysis</Button>
            </div>}
            <p className="text-xs text-ucla-blue">Your text stays on this device. Results stay on this page and are not saved to History or counted in website statistics.</p>
          </div>

          {!!result?.passages.length && <details className="glass-card rounded-2xl p-6">
            <summary className="cursor-pointer text-sm font-semibold text-foreground">Passage evidence ({result.passages.length})</summary>
            <ol className="mt-4 space-y-4">
              {result.passages.map(passage => <li key={passage.index} className="space-y-2 border-t border-cyan-azure/15 pt-3">
                <div className="flex justify-between gap-3 text-xs">
                  <span className="font-medium text-foreground">Passage {passage.index + 1}</span>
                  <span className="text-air-sup-blue">AI model score: {percentage(passage.score * 100)}</span>
                </div>
                <p className="text-xs text-ucla-blue leading-relaxed">{passage.excerpt}</p>
              </li>)}
            </ol>
          </details>}
        </div>

        <div className="xl:col-span-2 space-y-4">
          {!result ? <>
            <div className="glass-card rounded-2xl p-8 text-center">
              <FileText className="w-10 h-10 text-cyan-azure mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-foreground">Awaiting Input</h2>
              <p className="text-sm text-air-sup-blue mt-2">Paste at least 50 English words and run analysis.</p>
            </div>
            <div className="glass-card rounded-2xl p-6 space-y-3">
              <h2 className="font-semibold text-foreground flex items-center gap-2"><Info className="w-4 h-4 text-cyan-azure" />How It Works</h2>
              <p className="text-xs text-ucla-blue leading-relaxed">Fakespot RoBERTa checks every passage in your browser. The higher AI or human model score selects the likely label. Scores are estimates and can be wrong.</p>
            </div>
          </> : <>
            <div className={cn('glass-card rounded-2xl p-6 border space-y-5', isAi ? 'bg-red-500/10 border-red-500/20' : 'bg-emerald-500/10 border-emerald-500/20')}>
              <div className="flex items-center gap-3">
                {isAi ? <Bot className="w-8 h-8 text-red-400 shrink-0" /> : <User className="w-8 h-8 text-emerald-400 shrink-0" />}
                <div>
                  <p className="text-xs text-air-sup-blue">{result.provider} Result</p>
                  <h2 className={cn('text-lg font-bold', resultColor)}>{result.result}</h2>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative w-24 h-24 shrink-0">
                  <svg className="w-24 h-24 -rotate-90" viewBox="0 0 80 80" aria-hidden="true">
                    <circle cx="40" cy="40" r="32" fill="none" stroke="currentColor" strokeWidth="6" className="text-space-cadet-dark/40" />
                    <circle cx="40" cy="40" r="32" fill="none" strokeWidth="6" strokeLinecap="round" stroke="currentColor"
                      className={resultColor} strokeDasharray={`${2 * Math.PI * 32}`}
                      strokeDashoffset={`${2 * Math.PI * 32 * (1 - result.verdictScore / 100)}`} />
                  </svg>
                  <span className={cn('absolute inset-0 flex items-center justify-center text-lg font-bold', resultColor)}>{percentage(result.verdictScore)}</span>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-xs text-air-sup-blue">{isAi ? 'AI' : 'Human'} model score</p>
                  <p className="text-red-400">AI: {percentage(result.overallScore)}</p>
                  <p className="text-emerald-400">Human: {percentage(result.humanScore)}</p>
                </div>
              </div>
              <p className="text-xs text-air-sup-blue">Checked {result.coverage.checkedPassages} of {result.coverage.totalPassages} passages ({result.coverage.checkedTokens.toLocaleString()} of {result.coverage.totalTokens.toLocaleString()} tokens).</p>
              <p className="text-xs text-ucla-blue">These are model class scores, not a measured accuracy rate or the percentage of words written by AI.</p>
            </div>
            {(isAi || platformClues.length > 0) && <div className="glass-card rounded-2xl p-5 space-y-2">
              <h3 className="text-sm font-semibold text-foreground">AI platform</h3>
              <p data-source-platform className="text-base font-semibold text-air-sup-blue">{(result.platformGuess?.family === 'other_ai' ? 'Other AI platform' : result.platformGuess?.label)
                ?? (platformClues.length === 1 ? `${platformClues[0].platform} (text claim)`
                  : platformClues.length > 1 ? 'Multiple source claims' : 'Platform estimate unavailable')}</p>
              <p className="text-xs text-ucla-blue">{result.platformGuess
                ? result.platformGuess.family === 'other_ai'
                  ? 'The model favors another AI family. It cannot identify the exact platform.'
                  : 'Estimated source family, not verified origin. The exact app cannot be confirmed from text alone.'
                : platformClues.length ? 'Based only on a source claim in the text, which can be copied or forged.'
                  : 'The AI/Human result is complete, but the source-family model could not run. Try again on a desktop browser.'}</p>
            </div>}
            <details className="glass-card rounded-2xl p-4 text-xs text-ucla-blue space-y-2">
              <summary className="font-medium text-foreground cursor-pointer">About these estimates</summary>
              <ul className="space-y-1 list-disc list-inside">{result.limitations.map(item => <li key={item}>{item}</li>)}</ul>
            </details>
          </>}
        </div>
      </div>
    </div>
  );
}
