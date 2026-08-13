'use client';

import React, { useState, useCallback } from 'react';
import { ImageIcon, ShieldCheck, Zap, Info, Sparkles, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FileDropzone } from '@/components/detection/file-dropzone';
import { cn } from '@/lib/utils';

interface ScanResult {
  scanId: string;
  status: string;
  provider: string;
  result: 'ai_generated' | 'ai_enhanced' | 'human' | 'deepfake' | 'inconclusive';
  label: string;
  confidence: number;
  overallScore: number;
  breakdown: {
    aiGenerated: number;
    photo: number;
    illustration: number;
    facesDetected: number;
    deepfakeScore: number;
    isEnhanced: boolean;
  };
  signals: Array<{ name: string; score: number; description: string }>;
  faces: Array<{ id: number; deepfakeScore: number; verdict: string }>;
  limitations: string[];
  disclaimer: string;
}

const RESULT_CONFIG = {
  ai_generated: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', badge: 'AI-Generated' },
  ai_enhanced: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', badge: 'Possibly Enhanced / Edited' },
  human: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', badge: 'Human-Created' },
  deepfake: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', badge: 'Deepfake Detected' },
  inconclusive: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', badge: 'Inconclusive' },
};

import { useRecentScans } from '@/lib/use-recent-scans';

export default function ImageDetectorPage() {
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { addScan } = useRecentScans();

  const handleScan = useCallback(async () => {
    if (files.length === 0) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', files[0]);

      const res = await fetch('/api/scan/image', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Analysis failed. Please try again.');
        return;
      }

      setResult(data as ScanResult);
      addScan({
        name: files[0].name,
        type: 'image',
        result: data.label,
        confidence: data.confidence,
      });
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [files, addScan]);

  const config = result ? (RESULT_CONFIG[result.result] ?? RESULT_CONFIG.inconclusive) : null;
  const Icon = config?.icon ?? Zap;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-azure/20 to-air-sup-blue/20 border border-cyan-azure/30 flex items-center justify-center">
          <ImageIcon className="w-6 h-6 text-cyan-azure" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Image & Enhancement Analysis</h1>
          <p className="text-sm text-air-sup-blue mt-0.5">
            Powered by Sightengine — real AI generation & deepfake detection.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
        {/* Left: Upload */}
        <div className="xl:col-span-3 space-y-6">
          <div className="glass-card rounded-2xl p-6 space-y-5">
            <FileDropzone
              onFilesAccepted={(f) => { setFiles(f); setResult(null); setError(null); }}
              acceptedTypes={{ 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] }}
              maxSize={50 * 1024 * 1024}
            />

            {error && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              onClick={handleScan}
              disabled={loading || files.length === 0}
              suppressHydrationWarning
              className="w-full h-12 bg-gradient-to-r from-cyan-azure to-air-sup-blue hover:from-cyan-azure-dark hover:to-cyan-azure text-white font-semibold text-base shadow-palette-glow disabled:opacity-50 transition-all"
            >
              {loading ? 'Analyzing with Sightengine...' : 'Run Comprehensive Analysis'}
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

              {/* Per-face breakdown */}
              {result.faces.length > 0 && (
                <div className="pt-2 border-t border-cyan-azure/10 space-y-2">
                  <p className="text-xs font-medium text-foreground">{result.faces.length} Face(s) Detected</p>
                  {result.faces.map((face) => (
                    <div key={face.id} className="flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-space-cadet-dark/40">
                      <span className="text-air-sup-blue">Face #{face.id + 1}</span>
                      <span className={cn(
                        'font-medium',
                        face.deepfakeScore >= 50 ? 'text-red-400' : 'text-emerald-400'
                      )}>
                        {face.verdict} — {face.deepfakeScore}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
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
                  Upload an image and run analysis to see real AI detection results here.
                </p>
              </div>

              <div className="glass-card rounded-2xl p-6 space-y-5">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Info className="w-4 h-4 text-cyan-azure" /> How It Works
                </h3>
                <p className="text-xs text-ucla-blue leading-relaxed">
                  Upload your image and our AI models will analyze for GAN artifacts, Stable Diffusion patterns,
                  DALL-E signatures, Midjourney textures, and deepfake facial manipulations — all in real time via Sightengine.
                </p>
                <div className="flex items-center gap-2 text-xs text-cyan-azure font-medium">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Live Sightengine Detection Enabled</span>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Main verdict card */}
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
                        className={config?.color}
                        stroke="currentColor"
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
                    <p><span className="text-foreground font-medium">AI Score:</span> {result.breakdown.aiGenerated}%</p>
                  <p><span className="text-foreground font-medium">Photo:</span> {result.breakdown.photo}%</p>
                  {result.breakdown.illustration > 5 && (
                    <p><span className="text-foreground font-medium">Illustration:</span> {result.breakdown.illustration}%</p>
                  )}
                  {result.breakdown.isEnhanced && (
                    <p className="text-amber-400 font-semibold text-xs">⚡ Enhancement / Edit Detected</p>
                  )}
                  <p><span className="text-foreground font-medium">Deepfake:</span> {result.breakdown.deepfakeScore}%</p>
                    <p><span className="text-foreground font-medium">Faces:</span> {result.breakdown.facesDetected}</p>
                  </div>
                </div>

                <p className="text-xs text-air-sup-blue">Provider: {result.provider} · ID: {result.scanId}</p>
              </div>

              {/* Disclaimer */}
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