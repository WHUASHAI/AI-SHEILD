'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ShieldCheck, Zap, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FileDropzone } from '@/components/detection/file-dropzone';
import { cn } from '@/lib/utils';

export default function EnhancementDetectorPage() {
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const handleScan = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-azure/20 to-air-sup-blue/20 border border-cyan-azure/30 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-cyan-azure" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Enhancement Detector</h1>
          <p className="text-sm text-air-sup-blue mt-0.5">Detect AI-applied enhancements and upscaling.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
        <div className="xl:col-span-3 space-y-6">
          <div className="glass-card rounded-2xl p-6 space-y-5">
            <FileDropzone
              onFilesAccepted={(files) => setFiles(files)}
              acceptedTypes={{ 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] }}
              maxSize={50 * 1024 * 1024}
            />
            
            <Button
              onClick={handleScan}
              disabled={loading || files.length === 0}
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
                <p className="text-sm text-air-sup-blue mt-2">Upload an image and run analysis to see AI detection results here.</p>
            </div>
            
            <div className="glass-card rounded-2xl p-6 space-y-5">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Info className="w-4 h-4 text-cyan-azure" /> How It Works
              </h3>
              <p className="text-xs text-ucla-blue leading-relaxed">
                Upload your image, and our AI models will analyze for upscaling artifacts, unnatural texture enhancements, and synthetic detail generation.
              </p>
            </div>
        </div>
      </div>
    </div>
  );
}