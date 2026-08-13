'use client';

import React, { useState, useCallback } from 'react';
import {
  Video, ShieldCheck, Zap, Info, AlertTriangle, CheckCircle2,
  XCircle, BarChart3, Upload, Link as LinkIcon, Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FileDropzone } from '@/components/detection/file-dropzone';
import { cn } from '@/lib/utils';

interface VideoScanResult {
  scanId:       string;
  status:       string;
  provider:     string;
  result:       'ai_generated' | 'ai_enhanced' | 'human' | 'deepfake' | 'inconclusive';
  label:        string;
  confidence:   number;
  overallScore: number;
  breakdown: {
    avgAiGeneratedScore:    number;
    avgDeepfakeScore:       number;
    totalFramesAnalyzed:    number;
    aiSuspiciousFrames:     number;
    deepfakeSuspiciousFrames: number;
  };
  signals:   Array<{ name: string; score: number; description: string }>;
  timeline:  Array<{ timestamp: number; aiScore: number; deepfakeScore: number }>;
  limitations: string[];
  disclaimer:  string;
}

const RESULT_CONFIG = {
  ai_generated:  { icon: XCircle,       color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/20' },
  ai_enhanced:   { icon: AlertTriangle, color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20' },
  human:         { icon: CheckCircle2,  color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  deepfake:      { icon: XCircle,       color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/20' },
  inconclusive:  { icon: AlertTriangle, color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20' },
};

type InputMode = 'upload' | 'url';

import { useRecentScans } from '@/lib/use-recent-scans';

export default function VideoDetectorPage() {
  const [mode,    setMode]    = useState<InputMode>('upload');
  const [loading, setLoading] = useState(false);
  const [files,   setFiles]   = useState<File[]>([]);
  const [url,     setUrl]     = useState('');
  const [result,  setResult]  = useState<VideoScanResult | null>(null);
  const [error,   setError]   = useState<string | null>(null);
  const [hint,    setHint]    = useState<string | null>(null);
  const { addScan } = useRecentScans();

  const reset = () => { setResult(null); setError(null); setHint(null); };

  const handleScan = useCallback(async () => {
    const isUpload = mode === 'upload';
    if (isUpload && files.length === 0) return;
    if (!isUpload && !url.trim()) return;

    setLoading(true);
    reset();

    try {
      let res: Response;

      if (isUpload) {
        const formData = new FormData();
        formData.append('file', files[0]);
        res = await fetch('/api/scan/video', { method: 'POST', body: formData });
      } else {
        res = await fetch('/api/scan/video', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ url: url.trim() }),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Analysis failed. Please try again.');
        if (data.hint) setHint(data.hint);
        return;
      }
      setResult(data as VideoScanResult);
      addScan({
        name: isUpload ? files[0].name : url.trim().substring(0, 30) + '...',
        type: 'video',
        result: data.label,
        confidence: data.confidence,
      });
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [mode, files, url, addScan]);

  const canRun   = mode === 'upload' ? files.length > 0 : url.trim().length > 0;
  const config   = result ? (RESULT_CONFIG[result.result] ?? RESULT_CONFIG.inconclusive) : null;
  const Icon     = config?.icon ?? Zap;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-azure/20 to-air-sup-blue/20 border border-cyan-azure/30 flex items-center justify-center">
          <Video className="w-6 h-6 text-cyan-azure" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Video Analysis</h1>
          <p className="text-sm text-air-sup-blue mt-0.5">
            Powered by Sightengine — frame-by-frame AI &amp; deepfake detection.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
        {/* Left: Input */}
        <div className="xl:col-span-3 space-y-6">
          <div className="glass-card rounded-2xl p-6 space-y-5">

            {/* Mode tabs */}
            <div className="flex rounded-xl overflow-hidden border border-white/10 bg-space-cadet-dark/40 p-1 gap-1">
              <button
                onClick={() => { setMode('upload'); reset(); }}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200',
                  mode === 'upload'
                    ? 'bg-cyan-azure text-white shadow-palette-md'
                    : 'text-air-sup-blue hover:text-foreground hover:bg-white/5',
                )}
              >
                <Upload className="w-4 h-4" />
                Upload File
              </button>
              <button
                onClick={() => { setMode('url'); reset(); }}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200',
                  mode === 'url'
                    ? 'bg-cyan-azure text-white shadow-palette-md'
                    : 'text-air-sup-blue hover:text-foreground hover:bg-white/5',
                )}
              >
                <LinkIcon className="w-4 h-4" />
                Paste URL
              </button>
            </div>

            {/* Upload mode */}
            {mode === 'upload' && (
              <FileDropzone
                onFilesAccepted={(f) => { setFiles(f); reset(); }}
                acceptedTypes={{
                  'video/mp4':       ['.mp4'],
                  'video/quicktime': ['.mov'],
                  'video/webm':      ['.webm'],
                  'video/x-msvideo': ['.avi'],
                  'video/x-matroska': ['.mkv'],
                }}
                maxSize={200 * 1024 * 1024}
              />
            )}

            {/* URL mode */}
            {mode === 'url' && (
              <div className="space-y-3">
                <div className="relative flex items-center">
                  <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-air-sup-blue/50 pointer-events-none" />
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => { setUrl(e.target.value); reset(); }}
                    placeholder="https://example.com/video.mp4"
                    className={cn(
                      'w-full pl-10 pr-24 py-3 rounded-xl text-sm text-foreground placeholder-air-sup-blue/40',
                      'bg-space-cadet-dark/60 border border-white/10 outline-none',
                      'focus:border-cyan-azure/50 focus:ring-2 focus:ring-cyan-azure/10 transition-all',
                    )}
                  />
                  <button
                    onClick={async () => {
                      try {
                        const text = await navigator.clipboard.readText();
                        setUrl(text);
                        reset();
                      } catch (err) {
                        console.error('Clipboard permission denied');
                      }
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 text-air-sup-blue hover:text-white rounded-lg transition-colors"
                  >
                    Paste
                  </button>
                </div>
                <p className="text-xs text-air-sup-blue/60 leading-relaxed">
                  Paste a direct link to a public video file (MP4, WebM, MOV). The URL must be publicly accessible — no login or authentication required. Supports HLS streams (<code className="text-cyan-azure/70">.m3u8</code>).
                </p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex flex-col gap-1 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
                {hint && (
                  <p className="text-xs text-amber-400/80 pl-7 mt-1">{hint}</p>
                )}
              </div>
            )}

            <Button
              onClick={handleScan}
              disabled={loading || !canRun}
              suppressHydrationWarning
              className="w-full h-12 bg-gradient-to-r from-cyan-azure to-air-sup-blue hover:from-cyan-azure-dark hover:to-cyan-azure text-white font-semibold text-base shadow-palette-glow disabled:opacity-50 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing frames...
                </>
              ) : (
                <>
                  Run AI Analysis
                  <ShieldCheck className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>

            {loading && (
              <p className="text-xs text-center text-ucla-blue animate-pulse">
                {mode === 'url'
                  ? 'Fetching and analyzing video via URL — this may take a moment...'
                  : 'Uploading and analyzing video frames — this may take a moment for longer videos...'}
              </p>
            )}
          </div>

          {/* Frame timeline */}
          {result && result.timeline.length > 0 && (
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm">
                <BarChart3 className="w-4 h-4 text-cyan-azure" /> Frame-by-Frame Timeline
              </h3>
              <div className="flex items-end gap-0.5 h-16">
                {result.timeline.map((frame, i) => {
                  const maxScore = Math.max(frame.aiScore, frame.deepfakeScore);
                  return (
                    <div
                      key={i}
                      title={`${frame.timestamp.toFixed(1)}s — AI: ${frame.aiScore}%, Deepfake: ${frame.deepfakeScore}%`}
                      className={cn(
                        'flex-1 rounded-sm transition-all',
                        maxScore >= 70 ? 'bg-red-400/80' : maxScore >= 40 ? 'bg-amber-400/80' : 'bg-emerald-400/80',
                      )}
                      style={{ height: `${Math.max(4, maxScore)}%` }}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between text-xs text-ucla-blue">
                <span>Start</span>
                <span>{result.breakdown.totalFramesAnalyzed} frames analyzed</span>
                <span>End</span>
              </div>
            </div>
          )}

          {/* Signals */}
          {result && (
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <h3 className="font-semibold text-foreground text-sm">Detection Signals</h3>
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
                        signal.score > 0.6 ? 'bg-red-400' : signal.score > 0.35 ? 'bg-amber-400' : 'bg-emerald-400',
                      )}
                      style={{ width: `${Math.round(signal.score * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-ucla-blue">{signal.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Result */}
        <div className="xl:col-span-2 space-y-4">
          {!result ? (
            <>
              <div className="glass-card rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                <Zap className="w-12 h-12 text-cyan-azure mb-4" />
                <h3 className="text-lg font-semibold text-foreground">Awaiting Input</h3>
                <p className="text-sm text-air-sup-blue mt-2">
                  Upload a video file or paste a public URL to run AI and deepfake detection.
                </p>
              </div>

              <div className="glass-card rounded-2xl p-6 space-y-5">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Info className="w-4 h-4 text-cyan-azure" /> How It Works
                </h3>
                <p className="text-xs text-ucla-blue leading-relaxed">
                  Sightengine analyzes temporal frames, motion consistency, and facial artifacts to detect
                  AI generation (Sora, Runway, Pika, Kling) and deepfake manipulation in real-time.
                </p>
                <div className="flex flex-col gap-1.5 text-xs text-air-sup-blue/70">
                  <p>📁 <span className="font-medium">File upload:</span> MP4, MOV, WebM, AVI, MKV (max 200 MB)</p>
                  <p>🔗 <span className="font-medium">URL:</span> Direct public video links or HLS streams</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className={cn('glass-card rounded-2xl p-6 border', config?.bg)}>
                <div className="flex items-center gap-3 mb-4">
                  <Icon className={cn('w-8 h-8', config?.color)} />
                  <div>
                    <p className="text-xs text-air-sup-blue">Detection Result</p>
                    <h3 className={cn('text-lg font-bold', config?.color)}>{result.label}</h3>
                  </div>
                </div>

                {/* Confidence ring */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative w-20 h-20">
                    <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                      <circle cx="40" cy="40" r="32" fill="none" stroke="currentColor" strokeWidth="6" className="text-space-cadet-dark/40" />
                      <circle
                        cx="40" cy="40" r="32" fill="none" strokeWidth="6" strokeLinecap="round"
                        className={config?.color} stroke="currentColor"
                        strokeDasharray={`${2 * Math.PI * 32}`}
                        strokeDashoffset={`${2 * Math.PI * 32 * (1 - result.overallScore / 100)}`}
                        style={{ transition: 'stroke-dashoffset 1s ease' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={cn('text-lg font-bold', config?.color)}>{result.overallScore}%</span>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs text-air-sup-blue">
                    <p><span className="text-foreground font-medium">AI Generated:</span> {result.breakdown.avgAiGeneratedScore}%</p>
                    <p><span className="text-foreground font-medium">Deepfake:</span> {result.breakdown.avgDeepfakeScore}%</p>
                    <p><span className="text-foreground font-medium">Frames:</span> {result.breakdown.totalFramesAnalyzed}</p>
                    <p><span className="text-foreground font-medium">Flagged:</span> {result.breakdown.aiSuspiciousFrames}</p>
                  </div>
                </div>

                <p className="text-xs text-air-sup-blue">Provider: {result.provider} · {result.scanId}</p>
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