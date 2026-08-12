'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Layers, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FileDropzone } from '@/components/detection/file-dropzone';

export default function BatchScannerPage() {
  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-azure/20 to-air-sup-blue/20 border border-cyan-azure/30 flex items-center justify-center">
          <Layers className="w-6 h-6 text-cyan-azure" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Batch Scanner</h1>
          <p className="text-sm text-air-sup-blue mt-0.5">Upload multiple files for simultaneous AI analysis.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
        <div className="xl:col-span-3">
          <div className="glass-card rounded-2xl p-6 space-y-5">
            <FileDropzone multiple />
            <Button
              className="w-full h-12 bg-gradient-to-r from-cyan-azure to-air-sup-blue hover:from-cyan-azure-dark hover:to-cyan-azure text-white font-semibold text-base shadow-palette-glow transition-all"
            >
              Run Batch Analysis
              <ShieldCheck className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        <div className="xl:col-span-2">
            <div className="glass-card rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                <Zap className="w-12 h-12 text-cyan-azure mb-4" />
                <h3 className="text-lg font-semibold text-foreground">Awaiting Input</h3>
                <p className="text-sm text-air-sup-blue mt-2">Upload multiple files and run batch analysis to see AI detection results here.</p>
            </div>
        </div>
      </div>
    </div>
  );
}