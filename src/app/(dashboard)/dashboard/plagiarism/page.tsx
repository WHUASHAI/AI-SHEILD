'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookCopy, ScanSearch, Upload, Globe, FileText, AlertTriangle,
  CheckCircle2, XCircle, Info, ChevronDown, ChevronUp,
  ExternalLink, Download, BarChart3, Zap, RefreshCw,
  ClipboardPaste, Layers, Hash, Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Source {
  id: string;
  title: string;
  url: string;
  domain: string;
  similarity: number;
  matchedWords: number;
  matchType: 'exact' | 'paraphrase' | 'structural';
  snippet: string;
  publishedDate: string;
}

interface SentenceRow {
  sentence: string;
  similarityScore: number;
  flag: 'high' | 'medium' | 'low';
  matchedSource: string | null;
}

interface ScanResult {
  scanId: string;
  status: string;
  mode: string;
  analyzedAt: string;
  overallSimilarity: number;
  verdict: string;
  verdictColor: string;
  stats: { wordCount: number; sentenceCount: number; charactersCount: number; uniqueWords: number };
  sources: Source[];
  totalSourcesChecked: number;
  sentenceBreakdown: SentenceRow[];
  matchTypeBreakdown: { exact: number; paraphrase: number; structural: number };
}

type ScanMode = 'standard' | 'deep' | 'academic';
type InputMode = 'text' | 'url' | 'file';

// ─── Sub-components ──────────────────────────────────────────────────────────

function SimilarityMeter({ value }: { value: number }) {
  const isOriginal = value < 10;
  const displayValue = isOriginal ? (100 - value) : value;

  const color =
    value >= 60 ? '#ef4444' : value >= 30 ? '#f59e0b' : value >= 10 ? '#4E7AB1' : '#10b981';
  const label =
    value >= 60 ? 'High Risk' : value >= 30 ? 'Moderate' : value >= 10 ? 'Low Risk' : 'Original';

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(78,122,177,0.15)" strokeWidth="10" />
          <motion.circle
            cx="60" cy="60" r="50" fill="none"
            stroke={color} strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 50}`}
            initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 50 * (1 - displayValue / 100) }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-foreground">{displayValue}%</span>
          <span className="text-xs font-medium mt-0.5" style={{ color }}>{label}</span>
        </div>
      </div>
    </div>
  );
}

function SourceCard({ source, index }: { source: Source; index: number }) {
  const [open, setOpen] = useState(false);

  const badgeStyles = {
    exact:      'bg-red-500/10 text-red-400 border border-red-500/20',
    paraphrase: 'bg-pink-lavender/10 text-pink-lavender border border-pink-lavender/20',
    structural: 'bg-air-sup-blue/10 text-air-sup-blue border border-air-sup-blue/20',
  };

  const barColor =
    source.similarity >= 20 ? '#ef4444' : source.similarity >= 10 ? '#f59e0b' : '#4E7AB1';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="glass-card rounded-xl overflow-hidden"
    >
      <div
        className="flex items-center gap-4 p-4 cursor-pointer hover:bg-cyan-azure/5 transition-colors"
        onClick={() => setOpen(!open)}
      >
        {/* Rank */}
        <div className="w-7 h-7 rounded-full bg-space-cadet-dark border border-cyan-azure/20 flex items-center justify-center text-xs font-bold text-air-sup-blue shrink-0">
          {index + 1}
        </div>

        {/* Source info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-sm font-semibold text-foreground truncate">{source.title}</span>
            <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium shrink-0', badgeStyles[source.matchType])}>
              {source.matchType}
            </span>
          </div>
          <span className="text-xs text-ucla-blue">{source.domain}</span>
        </div>

        {/* Similarity */}
        <div className="text-right shrink-0">
          <div className="text-lg font-black" style={{ color: barColor }}>{source.similarity}%</div>
          <div className="text-xs text-air-sup-blue">{source.matchedWords} words</div>
        </div>

        {/* Progress bar */}
        <div className="hidden sm:block w-24">
          <div className="h-1.5 bg-space-cadet-dark rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: barColor }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(source.similarity * 2, 100)}%` }}
              transition={{ duration: 0.8, delay: index * 0.07 + 0.3 }}
            />
          </div>
        </div>

        {open ? <ChevronUp className="w-4 h-4 text-air-sup-blue shrink-0" /> : <ChevronDown className="w-4 h-4 text-air-sup-blue shrink-0" />}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-cyan-azure/10 pt-3">
              <p className="text-sm text-air-sup-blue leading-relaxed italic mb-3">
                &ldquo;{source.snippet}&rdquo;
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs text-ucla-blue">Published: {source.publishedDate}</span>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-cyan-azure hover:text-pink-lavender transition-colors"
                >
                  View Source <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SentenceBreakdown({ rows }: { rows: SentenceRow[] }) {
  const flagColors = {
    high:   'bg-red-500/10 border-red-500/20 text-red-400',
    medium: 'bg-amber-400/10 border-amber-400/20 text-amber-400',
    low:    'bg-cyan-azure/10 border-cyan-azure/20 text-air-sup-blue',
  };
  const dotColors = { high: 'bg-red-500', medium: 'bg-amber-400', low: 'bg-cyan-azure' };

  return (
    <div className="space-y-2">
      {rows.map((row, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.04 }}
          className={cn('flex items-start gap-3 p-3 rounded-lg border', flagColors[row.flag])}
        >
          <div className={cn('w-2 h-2 rounded-full mt-1.5 shrink-0', dotColors[row.flag])} />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground leading-relaxed">{row.sentence}</p>
            {row.matchedSource && (
              <span className="text-xs text-ucla-blue mt-1 block">Matched: {row.matchedSource}</span>
            )}
          </div>
          <span className="text-xs font-bold shrink-0 mt-0.5">
            {Math.round(row.similarityScore * 100)}%
          </span>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PlagiarismDetectorPage() {
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [scanMode, setScanMode]   = useState<ScanMode>('standard');
  const [text, setText]           = useState('');
  const [url, setUrl]             = useState('');
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState<ScanResult | null>(null);
  const [error, setError]         = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'sources' | 'sentences' | 'breakdown'>('sources');
  const [fileName, setFileName]   = useState<string | null>(null);
  const fileRef                   = useRef<HTMLInputElement>(null);
  const resultRef                 = useRef<HTMLDivElement>(null);

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const charCount = text.length;

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => setText(ev.target?.result as string ?? '');
    reader.readAsText(file);
  }, []);

  const handleScan = async () => {
    const content = inputMode === 'url' ? url : text;
    if (!content.trim() || content.trim().length < 20) {
      setError('Please enter at least 20 characters to scan.');
      return;
    }
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const res = await fetch('/api/scan/plagiarism', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputMode === 'url' ? `[URL analysis] ${url}` : text,
          sourceUrl: inputMode === 'url' ? url : '',
          mode: scanMode,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Scan failed');
      }
      const data: ScanResult = await res.json();
      setResult(data);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setText('');
    setUrl('');
    setResult(null);
    setError(null);
    setFileName(null);
  };

  const handlePaste = async () => {
    try {
      const t = await navigator.clipboard.readText();
      setText(t);
    } catch { /* ignore */ }
  };

  const scanModes: { value: ScanMode; label: string; desc: string; icon: React.ElementType }[] = [
    { value: 'standard', label: 'Standard',  desc: '5M sources, fast',       icon: Zap },
    { value: 'deep',     label: 'Deep Scan', desc: '12.5M sources, thorough', icon: Layers },
    { value: 'academic', label: 'Academic',  desc: '8M papers & journals',    icon: BookCopy },
  ];

  const verdictIcon = result
    ? result.overallSimilarity >= 60
      ? XCircle
      : result.overallSimilarity >= 30
      ? AlertTriangle
      : result.overallSimilarity >= 10
      ? Info
      : CheckCircle2
    : null;

  const verdictBg = result
    ? result.overallSimilarity >= 60
      ? 'from-red-500/10 to-transparent border-red-500/25'
      : result.overallSimilarity >= 30
      ? 'from-amber-400/10 to-transparent border-amber-400/25'
      : result.overallSimilarity >= 10
      ? 'from-cyan-azure/10 to-transparent border-cyan-azure/25'
      : 'from-emerald-500/10 to-transparent border-emerald-500/25'
    : '';

  return (
    <div className="space-y-8 pb-12">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-lavender/20 to-cyan-azure/20 border border-pink-lavender/30 flex items-center justify-center">
            <BookCopy className="w-6 h-6 text-pink-lavender" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              Plagiarism Detector
            </h1>
            <p className="text-sm text-air-sup-blue mt-0.5">
              Scan text, URLs, or documents for plagiarism.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">

        {/* ── LEFT: Input Panel ── */}
        <div className="xl:col-span-3 space-y-6">

          {/* Input mode tabs */}
          <div className="glass-card rounded-2xl p-6 space-y-5">
            <div className="flex gap-1 p-1 rounded-xl bg-space-cadet-dark border border-cyan-azure/15">
              {([
                { value: 'text', label: 'Paste Text', icon: FileText },
                { value: 'url',  label: 'From URL',   icon: Globe },
                { value: 'file', label: 'Upload File', icon: Upload },
              ] as { value: InputMode; label: string; icon: React.ElementType }[]).map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => { setInputMode(tab.value); setError(null); }}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200',
                    inputMode === tab.value
                      ? 'bg-cyan-azure text-white shadow-palette-md'
                      : 'text-air-sup-blue hover:text-foreground hover:bg-cyan-azure/10'
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Text input */}
            <AnimatePresence mode="wait">
              {inputMode === 'text' && (
                <motion.div key="text" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div className="relative">
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Paste your text here to check for plagiarism… (minimum 20 characters)"
                      rows={12}
                      className="w-full bg-space-cadet-dark/60 border border-cyan-azure/20 rounded-xl p-4 text-sm text-foreground placeholder:text-ucla-blue focus:outline-none focus:border-cyan-azure/50 focus:ring-1 focus:ring-cyan-azure/25 resize-none transition-all"
                    />
                    <div className="absolute bottom-3 right-3 flex items-center gap-2">
                      <button
                        onClick={handlePaste}
                        className="flex items-center gap-1.5 text-xs text-ucla-blue hover:text-cyan-azure transition-colors bg-space-cadet-dark/80 px-2 py-1 rounded-lg border border-cyan-azure/15"
                      >
                        <ClipboardPaste className="w-3.5 h-3.5" /> Paste
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2 px-1">
                    <span className="text-xs text-ucla-blue">{wordCount} words · {charCount} chars</span>
                    <span className={cn('text-xs', charCount < 20 ? 'text-amber-400' : 'text-emerald-400')}>
                      {charCount < 20 ? `${20 - charCount} more chars needed` : '✓ Ready to scan'}
                    </span>
                  </div>
                </motion.div>
              )}

              {inputMode === 'url' && (
                <motion.div key="url" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ucla-blue" />
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com/article-to-check"
                      className="w-full bg-space-cadet-dark/60 border border-cyan-azure/20 rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-ucla-blue focus:outline-none focus:border-cyan-azure/50 focus:ring-1 focus:ring-cyan-azure/25 transition-all"
                    />
                  </div>
                  <p className="text-xs text-ucla-blue px-1">We'll extract the main content from the URL and scan it for plagiarism.</p>
                </motion.div>
              )}

              {inputMode === 'file' && (
                <motion.div key="file" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div
                    className="border-2 border-dashed border-cyan-azure/25 rounded-xl p-10 text-center cursor-pointer hover:border-cyan-azure/50 hover:bg-cyan-azure/3 transition-all"
                    onClick={() => fileRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file) { setFileName(file.name); const r = new FileReader(); r.onload = ev => setText(ev.target?.result as string ?? ''); r.readAsText(file); }
                    }}
                  >
                    <Upload className="w-10 h-10 text-cyan-azure/50 mx-auto mb-3" />
                    {fileName ? (
                      <>
                        <p className="text-sm font-medium text-foreground">{fileName}</p>
                        <p className="text-xs text-air-sup-blue mt-1">{wordCount} words loaded</p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-air-sup-blue">Drop a .txt, .doc, or .pdf file here</p>
                        <p className="text-xs text-ucla-blue mt-1">or click to browse</p>
                      </>
                    )}
                    <input ref={fileRef} type="file" className="hidden" accept=".txt,.doc,.docx,.pdf" onChange={handleFileChange} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Scan Mode selector */}
          <div className="glass-card rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <ScanSearch className="w-4 h-4 text-cyan-azure" /> Scan Depth
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {scanModes.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setScanMode(m.value)}
                  className={cn(
                    'flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all duration-200',
                    scanMode === m.value
                      ? 'bg-cyan-azure/15 border-cyan-azure/40 text-foreground'
                      : 'bg-transparent border-cyan-azure/15 text-air-sup-blue hover:border-cyan-azure/30 hover:bg-cyan-azure/5'
                  )}
                >
                  <m.icon className={cn('w-5 h-5', scanMode === m.value ? 'text-cyan-azure' : 'text-air-sup-blue')} />
                  <span className="text-xs font-semibold">{m.label}</span>
                  <span className="text-xs text-ucla-blue">{m.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleScan}
              disabled={loading || (inputMode === 'text' && text.length < 20) || (inputMode === 'url' && !url.trim())}
              className="flex-1 h-12 bg-gradient-to-r from-cyan-azure to-air-sup-blue hover:from-cyan-azure-dark hover:to-cyan-azure text-white font-semibold text-base shadow-palette-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <><RefreshCw className="w-5 h-5 mr-2 animate-spin" /> Scanning…</>
              ) : (
                <><ScanSearch className="w-5 h-5 mr-2" /> Check Plagiarism</>
              )}
            </Button>
            {(text || url || result) && (
              <Button
                onClick={handleClear}
                variant="outline"
                className="h-12 px-5 border-cyan-azure/25 text-air-sup-blue hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-colors"
              >
                <XCircle className="w-4 h-4" />
              </Button>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm">
              <XCircle className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}
        </div>

        {/* ── RIGHT: Quick Stats Panel ── */}
        <div className="xl:col-span-2 space-y-4">

          {/* Scanning animation */}
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-card rounded-2xl p-8 flex flex-col items-center gap-5"
              >
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 rounded-full border-4 border-cyan-azure/20" />
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-t-cyan-azure border-r-pink-lavender border-transparent"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Shield className="w-8 h-8 text-cyan-azure" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-foreground">Scanning Sources…</p>
                  <p className="text-sm text-air-sup-blue mt-1">
                    Checking against {scanMode === 'deep' ? '12.5M' : scanMode === 'academic' ? '8M' : '5M'} sources
                  </p>
                </div>
                {[
                  'Indexing content…',
                  'Cross-referencing databases…',
                  'Analyzing sentence structure…',
                  'Generating report…',
                ].map((step, i) => (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0.4] }}
                    transition={{ delay: i * 0.4, duration: 1.2, repeat: Infinity }}
                    className="flex items-center gap-2 text-xs text-air-sup-blue"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-azure animate-pulse" />
                    {step}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Idle state guide */}
          {!loading && !result && (
            <div className="glass-card rounded-2xl p-6 space-y-5">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Info className="w-4 h-4 text-cyan-azure" /> How It Works
              </h3>
              {[
                { icon: FileText,    color: 'text-cyan-azure',    label: '1. Input Content',      desc: 'Paste text, enter a URL, or upload a file.' },
                { icon: ScanSearch,  color: 'text-air-sup-blue',  label: '2. Choose Scan Depth',  desc: 'Standard, Deep, or Academic databases.' },
                { icon: BarChart3,   color: 'text-pink-lavender', label: '3. Get Detailed Report', desc: 'See similarity scores, matched sources & sentence breakdown.' },
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={cn('w-8 h-8 rounded-lg bg-space-cadet-dark border border-cyan-azure/15 flex items-center justify-center shrink-0', step.color)}>
                    <step.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{step.label}</p>
                    <p className="text-xs text-air-sup-blue mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
              <div className="pt-4 border-t border-cyan-azure/10">
                <p className="text-xs text-ucla-blue leading-relaxed">
                  Supports academic papers, blog posts, web articles, essays, and more. Detects exact matches, paraphrasing, and structural similarities.
                </p>
              </div>
            </div>
          )}

          {/* Similarity meter (results) */}
          {result && !loading && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

              {/* Verdict card */}
              <div className={cn('glass-card rounded-2xl p-6 bg-gradient-to-br border', verdictBg)}>
                <div className="flex flex-col items-center gap-4">
                  <SimilarityMeter value={result.overallSimilarity} />
                  <div className="text-center">
                    {verdictIcon && React.createElement(verdictIcon, {
                      className: cn('w-6 h-6 mx-auto mb-2',
                        result.overallSimilarity >= 60 ? 'text-red-400' :
                        result.overallSimilarity >= 30 ? 'text-amber-400' :
                        result.overallSimilarity >= 10 ? 'text-cyan-azure' : 'text-emerald-400'
                      )
                    })}
                    <p className="font-bold text-foreground">{result.verdict}</p>
                    <p className="text-xs text-air-sup-blue mt-1">
                      {result.totalSourcesChecked.toLocaleString()} sources checked
                    </p>
                  </div>
                </div>
              </div>

              {/* Text stats */}
              <div className="glass-card rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Hash className="w-4 h-4 text-air-sup-blue" /> Text Statistics
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Words',        value: result.stats.wordCount.toLocaleString() },
                    { label: 'Sentences',    value: result.stats.sentenceCount },
                    { label: 'Characters',   value: result.stats.charactersCount.toLocaleString() },
                    { label: 'Unique Words', value: result.stats.uniqueWords.toLocaleString() },
                  ].map((s) => (
                    <div key={s.label} className="bg-space-cadet-dark/60 rounded-xl p-3 text-center border border-cyan-azure/10">
                      <p className="text-lg font-bold text-foreground">{s.value}</p>
                      <p className="text-xs text-air-sup-blue">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Match type breakdown */}
              <div className="glass-card rounded-2xl p-5 space-y-3">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-pink-lavender" /> Match Breakdown
                </h3>
                {[
                  { label: 'Exact Matches',    value: result.matchTypeBreakdown.exact,      color: '#ef4444' },
                  { label: 'Paraphrasing',     value: result.matchTypeBreakdown.paraphrase, color: '#CEB5D4' },
                  { label: 'Structural',       value: result.matchTypeBreakdown.structural,  color: '#7D9FC0' },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-air-sup-blue">{item.label}</span>
                      <span className="font-semibold text-foreground">{item.value}%</span>
                    </div>
                    <div className="h-1.5 bg-space-cadet-dark rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: item.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(item.value * 2, 100)}%` }}
                        transition={{ duration: 0.8 }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <Button className="w-full bg-space-cadet-dark border border-cyan-azure/25 text-air-sup-blue hover:bg-cyan-azure/10 hover:text-pink-lavender transition-colors">
                <Download className="w-4 h-4 mr-2" /> Export PDF Report
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      {/* ── Results: Sources + Sentence Breakdown ── */}
      <AnimatePresence>
        {result && !loading && (
          <motion.div
            ref={resultRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Tab bar */}
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="flex border-b border-cyan-azure/15">
                {([
                  { key: 'sources',   label: 'Matched Sources',     count: result.sources.length },
                  { key: 'sentences', label: 'Sentence Analysis',   count: result.sentenceBreakdown.length },
                  { key: 'breakdown', label: 'Similarity Overview',  count: null },
                ] as { key: typeof activeTab; label: string; count: number | null }[]).map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={cn(
                      'flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors border-b-2',
                      activeTab === tab.key
                        ? 'border-cyan-azure text-cyan-azure bg-cyan-azure/5'
                        : 'border-transparent text-air-sup-blue hover:text-foreground hover:bg-cyan-azure/3'
                    )}
                  >
                    {tab.label}
                    {tab.count !== null && (
                      <span className={cn('text-xs px-1.5 py-0.5 rounded-full font-bold',
                        activeTab === tab.key ? 'bg-cyan-azure/20 text-cyan-azure' : 'bg-space-cadet-dark text-ucla-blue'
                      )}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="p-6">
                <AnimatePresence mode="wait">

                  {/* Sources tab */}
                  {activeTab === 'sources' && (
                    <motion.div key="sources" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                      {result.sources.length > 0 ? (
                        result.sources.map((src, i) => <SourceCard key={src.id} source={src} index={i} />)
                      ) : (
                        <div className="text-center py-12 text-air-sup-blue">
                          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                          <p className="font-semibold text-foreground">No Matches Found</p>
                          <p className="text-sm mt-1">Your content appears to be original.</p>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Sentences tab */}
                  {activeTab === 'sentences' && (
                    <motion.div key="sentences" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <div className="flex items-center gap-4 mb-4 flex-wrap">
                        {[
                          { color: 'bg-red-500',    label: 'High similarity' },
                          { color: 'bg-amber-400',  label: 'Moderate' },
                          { color: 'bg-cyan-azure', label: 'Low / Original' },
                        ].map((l) => (
                          <div key={l.label} className="flex items-center gap-2 text-xs text-air-sup-blue">
                            <div className={cn('w-2.5 h-2.5 rounded-full', l.color)} />
                            {l.label}
                          </div>
                        ))}
                      </div>
                      <SentenceBreakdown rows={result.sentenceBreakdown} />
                    </motion.div>
                  )}

                  {/* Overview tab */}
                  {activeTab === 'breakdown' && (
                    <motion.div key="breakdown" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                          { label: 'Overall Similarity', value: `${result.overallSimilarity}%`, sub: result.verdict,         color: result.overallSimilarity >= 60 ? 'text-red-400' : result.overallSimilarity >= 30 ? 'text-amber-400' : 'text-emerald-400' },
                          { label: 'Scan Mode',          value: result.mode.charAt(0).toUpperCase() + result.mode.slice(1), sub: `${result.totalSourcesChecked.toLocaleString()} sources`, color: 'text-cyan-azure' },
                          { label: 'Sources Found',      value: result.sources.length,           sub: 'matched sources',     color: 'text-pink-lavender' },
                        ].map((stat) => (
                          <div key={stat.label} className="bg-space-cadet-dark/60 border border-cyan-azure/10 rounded-xl p-5 text-center">
                            <p className={cn('text-2xl font-black', stat.color)}>{stat.value}</p>
                            <p className="text-sm font-semibold text-foreground mt-1">{stat.label}</p>
                            <p className="text-xs text-air-sup-blue mt-0.5">{stat.sub}</p>
                          </div>
                        ))}
                      </div>
                      <div className="bg-space-cadet-dark/40 border border-cyan-azure/10 rounded-xl p-5">
                        <p className="text-xs text-ucla-blue leading-relaxed">
                          <span className="text-air-sup-blue font-medium">Scan ID:</span> {result.scanId} ·{' '}
                          <span className="text-air-sup-blue font-medium">Analyzed:</span>{' '}
                          {new Date(result.analyzedAt).toLocaleString()}
                        </p>
                      </div>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
