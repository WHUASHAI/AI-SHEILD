'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { DisclaimerBanner } from '@/components/detection/disclaimer-banner';
import { FileDropzone } from '@/components/detection/file-dropzone';
import { ProcessingStages, ProcessingStage } from '@/components/detection/processing-stages';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  FileText, Image as ImageIcon, Video, Link as LinkIcon,
  Layers, ShieldCheck, AlertCircle, Zap, BookCopy,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const TABS = [
  { id: 'text',  label: 'Text',         icon: FileText,  desc: 'Paste or type text to analyze for AI writing patterns.' },
  { id: 'image', label: 'Image',        icon: ImageIcon, desc: 'Upload an image to check for AI generation or editing.' },
  { id: 'video', label: 'Video',        icon: Video,     desc: 'Detect deepfakes and AI manipulation in video files.' },
  { id: 'url',   label: 'URL',          icon: LinkIcon,  desc: 'Enter a web URL to scan its content automatically.' },
  { id: 'plagiarism', label: 'Plagiarism', icon: BookCopy, desc: 'Check text for plagiarism against a vast database.' },
  { id: 'batch', label: 'Batch Upload', icon: Layers,    desc: 'Upload multiple files for simultaneous analysis.' },
];

export default function NewScanPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scanType = searchParams.get('type');

  // Filter tabs if a specific type is requested
  const visibleTabs = scanType 
    ? TABS.filter(t => t.id === scanType)
    : TABS;

  const [isProcessing, setIsProcessing] = useState(false);
  const [stage, setStage] = useState<ProcessingStage>('queued');
  const [textToScan, setTextToScan] = useState('');
  const [urlToScan, setUrlToScan] = useState('');
  const [filesToScan, setFilesToScan] = useState<File[]>([]);
  const [activeTab, setActiveTab] = useState(visibleTabs[0]?.id || 'text');

  useEffect(() => {
    if (scanType) {
      setActiveTab(scanType);
    }
  }, [scanType]);

  // ... (rest of component, ensure it uses visibleTabs)
  // Inside Tab bar map:
  // {visibleTabs.map((tab) => { ...

  const wordCount  = textToScan.trim().split(/\s+/).filter(Boolean).length;
  const charCount  = textToScan.length;
  const activeInfo = TABS.find(t => t.id === activeTab)!;

  const handleScan = async () => {
    setIsProcessing(true);
    setStage('analyzing');
    try {
      if (activeTab === 'text') {
        const res = await fetch('/api/scan/text', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: textToScan }),
        });
        if (!res.ok) throw new Error('Scan failed');
        const data = await res.json();
        router.push(`/report/${data.scanId}`);
      } else if (activeTab === 'image') {
        if (!filesToScan.length) throw new Error('No image selected');
        const fd = new FormData();
        fd.append('image', filesToScan[0]);
        const res = await fetch('/api/scan/image', { method: 'POST', body: fd });
        if (!res.ok) throw new Error('Scan failed');
        const data = await res.json();
        router.push(`/report/${data.scanId}`);
      } else if (activeTab === 'url') {
        const res = await fetch('/api/scan/url', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: urlToScan }),
        });
        if (!res.ok) throw new Error('Scan failed');
        const data = await res.json();
        router.push(`/report/${data.scanId}`);
      } else if (activeTab === 'plagiarism') {
        router.push('/dashboard/plagiarism');
      } else {
        throw new Error('Not implemented');
      }
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
      setStage('queued');
    }
  };

  const canScan = activeTab === 'text'
    ? textToScan.trim().length > 50
    : activeTab === 'url'
      ? urlToScan.trim().length > 5
      : filesToScan.length > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl" style={{ background: 'rgba(78,122,177,0.15)', border: '1px solid rgba(78,122,177,0.3)' }}>
            <ShieldCheck className="w-5 h-5 text-cyan-azure" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">New Analysis Scan</h1>
            <p className="text-sm text-air-sup-blue/70 mt-0.5">Select content type and provide the content to analyze.</p>
          </div>
        </div>
      </motion.div>

      <DisclaimerBanner />

      {/* Main scan card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(78,122,177,0.18)' }}
      >
        {/* Tab bar */}
        <div className="flex overflow-x-auto" style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(78,122,177,0.12)' }}>
          {visibleTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'relative flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-all duration-200 shrink-0',
                  isActive ? 'text-foreground' : 'text-air-sup-blue/60 hover:text-air-sup-blue hover:bg-white/5'
                )}
              >
                <tab.icon className={cn('w-4 h-4', isActive ? 'text-cyan-azure' : '')} />
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="tabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full"
                    style={{ background: 'linear-gradient(90deg, #4E7AB1, #CEB5D4)' }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab description */}
        <div className="px-6 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(78,122,177,0.08)', background: 'rgba(78,122,177,0.04)' }}>
          <AlertCircle className="w-3.5 h-3.5 text-air-sup-blue/50 shrink-0" />
          <p className="text-xs text-air-sup-blue/60">{activeInfo.desc}</p>
        </div>

        {/* Content area */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {!isProcessing ? (
              <motion.div
                key="input"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                {activeTab === 'text' && (
                  <div className="space-y-2">
                    <Textarea
                      value={textToScan}
                      onChange={(e) => setTextToScan(e.target.value)}
                      placeholder="Paste or type your text here... (minimum 50 characters)"
                      className="min-h-[320px] resize-none text-sm leading-relaxed transition-all"
                      style={{
                        background: 'rgba(0,0,0,0.25)',
                        border: '1px solid rgba(78,122,177,0.2)',
                        color: 'var(--foreground)',
                        borderRadius: '12px',
                      }}
                    />
                    <div className="flex items-center justify-between text-xs text-air-sup-blue/50">
                      <span>{wordCount} words · {charCount} characters</span>
                      <select className="bg-transparent border-none outline-none cursor-pointer text-air-sup-blue/50 hover:text-air-sup-blue transition-colors">
                        <option>Auto-detect Language</option>
                        <option>English</option>
                        <option>Spanish</option>
                        <option>French</option>
                      </select>
                    </div>
                  </div>
                )}

                {activeTab === 'image' && (
                  <div className="space-y-3">
                    <FileDropzone
                      onFilesAccepted={(files) => setFilesToScan(files)}
                      acceptedTypes={{ 'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.heic'] }}
                      maxSize={50 * 1024 * 1024}
                    />
                    <p className="text-xs text-air-sup-blue/50 text-center">Accepted: JPG, PNG, WEBP, HEIC · Max 50MB</p>
                  </div>
                )}

                {activeTab === 'video' && (
                  <div className="space-y-3">
                    <FileDropzone
                      onFilesAccepted={(files) => setFilesToScan(files)}
                      acceptedTypes={{ 'video/*': ['.mp4', '.mov', '.webm', '.avi'] }}
                      maxSize={2 * 1024 * 1024 * 1024}
                    />
                    <p className="text-xs text-air-sup-blue/50 text-center">Accepted: MP4, MOV, WEBM, AVI · Max 2GB</p>
                  </div>
                )}

                {activeTab === 'url' && (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-air-sup-blue/80">Content URL</label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-air-sup-blue/40 pointer-events-none" />
                      <Input
                        value={urlToScan}
                        onChange={(e) => setUrlToScan(e.target.value)}
                        placeholder="https://example.com/article"
                        className="pl-10 h-12"
                        style={{
                          background: 'rgba(0,0,0,0.25)',
                          border: '1px solid rgba(78,122,177,0.2)',
                          borderRadius: '12px',
                          color: 'var(--foreground)',
                        }}
                      />
                    </div>
                    <p className="text-xs text-air-sup-blue/50">Supports webpage URLs, direct image URLs, and video URLs.</p>
                  </div>
                )}

                {activeTab === 'batch' && (
                  <div className="space-y-3">
                    <FileDropzone
                      onFilesAccepted={(files) => setFilesToScan(files)}
                      multiple
                      maxFiles={50}
                      maxSize={500 * 1024 * 1024}
                    />
                    <div className="flex justify-between text-xs text-air-sup-blue/50">
                      <span>{filesToScan.length}/50 files</span>
                      <span>Total: {(filesToScan.reduce((a, f) => a + f.size, 0) / 1024 / 1024).toFixed(1)} MB / 500 MB</span>
                    </div>
                  </div>
                )}

                {/* Scan button */}
                <div className="pt-4" style={{ borderTop: '1px solid rgba(78,122,177,0.1)' }}>
                  <button
                    onClick={handleScan}
                    disabled={!canScan}
                    className="group relative w-full h-13 flex items-center justify-center gap-2.5 rounded-xl text-base font-semibold text-white transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed overflow-hidden"
                    style={{
                      background: canScan
                        ? 'linear-gradient(135deg, #4E7AB1 0%, #7D9FC0 60%, #CEB5D4 100%)'
                        : 'rgba(78,122,177,0.3)',
                      boxShadow: canScan ? '0 4px 24px rgba(78,122,177,0.4)' : 'none',
                      paddingTop: '0.75rem',
                      paddingBottom: '0.75rem',
                    }}
                  >
                    {/* Shimmer sweep */}
                    {canScan && (
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)' }} />
                    )}
                    <ShieldCheck className="w-5 h-5 shrink-0" />
                    Run AI Analysis
                    <Zap className="w-4 h-4 shrink-0 opacity-70" />
                  </button>
                  {!canScan && (
                    <p className="text-center text-xs text-air-sup-blue/40 mt-2">
                      {activeTab === 'text' ? 'Add at least 50 characters to enable scan' : 'Add content above to enable scan'}
                    </p>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="processing"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-16 space-y-8 min-h-[320px]"
              >
                {/* Animated shield pulse */}
                <div className="relative">
                  <div className="absolute -inset-8 rounded-full animate-orb-pulse"
                    style={{ background: 'radial-gradient(circle, rgba(78,122,177,0.2) 0%, transparent 70%)' }} />
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(78,122,177,0.15)', border: '1px solid rgba(78,122,177,0.35)', boxShadow: '0 0 40px rgba(78,122,177,0.2)' }}>
                    <ShieldCheck className="w-10 h-10 text-cyan-azure animate-pulse" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-foreground mb-1">Analyzing Content...</p>
                  <p className="text-sm text-air-sup-blue/60">Our AI models are processing your submission.</p>
                </div>
                <ProcessingStages currentStage={stage} className="w-full max-w-sm" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Info chips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex flex-wrap gap-3 justify-center"
      >
        {['Results in ~2 seconds', 'Privacy-first processing', '97% accuracy', 'No data stored permanently'].map((t) => (
          <span key={t} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs text-air-sup-blue/60"
            style={{ background: 'rgba(78,122,177,0.07)', border: '1px solid rgba(78,122,177,0.15)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-azure/60" />
            {t}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
