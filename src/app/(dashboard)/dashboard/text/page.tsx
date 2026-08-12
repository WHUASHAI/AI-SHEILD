'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, ShieldCheck, Zap, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export default function TextDetectorPage() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const charCount = text.length;

  const handleScan = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
  };

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
              placeholder="Paste your text here to analyze..."
              rows={12}
              className="w-full bg-space-cadet-dark/60 border border-cyan-azure/20 rounded-xl p-4 text-sm text-foreground placeholder:text-ucla-blue focus:outline-none focus:border-cyan-azure/50 focus:ring-1 focus:ring-cyan-azure/25 resize-none transition-all"
            />
            <div className="flex items-center justify-between mt-2 px-1 text-xs text-ucla-blue">
              <span>{wordCount} words · {charCount} chars</span>
            </div>
            
            <Button
              onClick={handleScan}
              disabled={loading || text.length < 50}
              className="w-full h-12 bg-gradient-to-r from-cyan-azure to-air-sup-blue hover:from-cyan-azure-dark hover:to-cyan-azure text-white font-semibold text-base shadow-palette-glow disabled:opacity-50 transition-all"
            >
              {loading ? 'Analyzing...' : 'Run AI Analysis'}
              <ShieldCheck className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        <div className="xl:col-span-2 space-y-4">
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
        </div>
      </div>
    </div>
  );
}