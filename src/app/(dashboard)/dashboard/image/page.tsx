'use client';

import React from 'react';
import { DisclaimerBanner } from '@/components/detection/disclaimer-banner';
import { ImageEvidenceViewer } from '@/components/detection/image-evidence-viewer';
import { Image as ImageIcon, ShieldAlert, AlertTriangle, FileSearch, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ImageDetectorPage() {
  const placeholderImageUrl = "https://images.unsplash.com/photo-1698774780521-137651a2d480?w=800&auto=format&fit=crop&q=60"; // Placeholder

  return (
    <div className="container max-w-6xl py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center">
          <ImageIcon className="w-8 h-8 mr-3 text-cyan-500" /> Image Forensics
        </h1>
        <p className="text-slate-400">Analyze images for AI generation, manipulation, and synthetic elements.</p>
      </div>

      <DisclaimerBanner />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <ImageEvidenceViewer imageUrl={placeholderImageUrl} className="h-[600px]" />
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center"><Layers className="w-5 h-5 mr-2 text-slate-400" /> Suspicious Regions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { area: 'Background texture', reason: 'High frequency noise patterns atypical of camera sensors', confidence: 92 },
                { area: 'Lighting inconsistency', reason: 'Shadow trajectory mismatch across elements', confidence: 78 },
              ].map((item, i) => (
                <div key={i} className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                  <div className="font-medium text-slate-200 mb-1">{item.area}</div>
                  <div className="text-sm text-slate-400 mb-3">{item.reason}</div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Anomaly Score</span>
                    <span className="text-red-400 font-mono">{item.confidence}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full" style={{ width: `${item.confidence}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-amber-500" />
            <h2 className="text-xl font-semibold mb-6">Analysis Results</h2>
            
            <div className="flex flex-col items-center justify-center py-6 mb-6 bg-slate-950 rounded-xl border border-slate-800">
              <ShieldAlert className="w-12 h-12 text-amber-500 mb-3" />
              <div className="text-2xl font-bold text-white mb-1">Likely AI-Edited</div>
              <div className="text-sm text-slate-400">Confidence: 84%</div>
            </div>

            <div className="space-y-4">
              {[
                { label: 'Fully AI Generated', score: 15, color: 'bg-red-500', textColor: 'text-red-400' },
                { label: 'AI Enhanced/Edited', score: 84, color: 'bg-amber-500', textColor: 'text-amber-400' },
                { label: 'Traditional Editing', score: 45, color: 'bg-blue-500', textColor: 'text-blue-400' },
                { label: 'Original/Human', score: 5, color: 'bg-emerald-500', textColor: 'text-emerald-400' },
              ].map((bar, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-slate-300">{bar.label}</span>
                    <span className={`font-bold ${bar.textColor}`}>{bar.score}%</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${bar.color} rounded-full`} style={{ width: `${bar.score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
             <h3 className="font-semibold mb-4 flex items-center"><FileSearch className="w-5 h-5 mr-2 text-slate-400" /> Metadata Analysis</h3>
             <div className="space-y-3">
               <div className="flex justify-between items-center py-2 border-b border-slate-800">
                 <span className="text-sm text-slate-400">Software</span>
                 <span className="text-sm font-medium text-amber-400 flex items-center">Adobe Photoshop 24.0 <AlertTriangle className="w-3 h-3 ml-1" /></span>
               </div>
               <div className="flex justify-between items-center py-2 border-b border-slate-800">
                 <span className="text-sm text-slate-400">Camera</span>
                 <span className="text-sm font-medium text-slate-500 italic">Stripped</span>
               </div>
               <div className="flex justify-between items-center py-2">
                 <span className="text-sm text-slate-400">C2PA Signature</span>
                 <span className="text-sm font-medium text-red-400 flex items-center">Missing <AlertTriangle className="w-3 h-3 ml-1" /></span>
               </div>
             </div>
          </div>

          <Button className="w-full bg-slate-800 hover:bg-slate-700 text-white border border-slate-700">
            Download Forensic Report
          </Button>
        </div>
      </div>
    </div>
  );
}
