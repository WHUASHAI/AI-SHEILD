'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { ZoomIn, ZoomOut, Maximize, MousePointer2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageEvidenceViewerProps {
  imageUrl: string;
  heatmapUrl?: string;
  className?: string;
}

export function ImageEvidenceViewer({ imageUrl, heatmapUrl, className }: ImageEvidenceViewerProps) {
  const [tab, setTab] = useState<'original' | 'heatmap' | 'split'>('original');
  const [zoom, setZoom] = useState(1);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => setZoom(1);

  return (
    <div className={cn("bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col", className)}>
      <div className="flex items-center justify-between p-3 border-b border-slate-800 bg-slate-950">
        <div className="flex space-x-1 bg-slate-900 rounded-lg p-1 border border-slate-800">
          <button
            onClick={() => setTab('original')}
            className={cn("px-3 py-1.5 text-xs font-medium rounded-md transition-colors", tab === 'original' ? "bg-slate-700 text-white" : "text-slate-400 hover:text-slate-200")}
          >
            Original
          </button>
          <button
            onClick={() => setTab('heatmap')}
            className={cn("px-3 py-1.5 text-xs font-medium rounded-md transition-colors", tab === 'heatmap' ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-slate-200")}
          >
            Heatmap Analysis
          </button>
          <button
            onClick={() => setTab('split')}
            className={cn("px-3 py-1.5 text-xs font-medium rounded-md transition-colors", tab === 'split' ? "bg-slate-700 text-white" : "text-slate-400 hover:text-slate-200")}
          >
            Side-by-Side
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={handleZoomOut} className="h-8 w-8 text-slate-400 hover:text-white"><ZoomOut className="w-4 h-4" /></Button>
          <span className="text-xs font-mono text-slate-400 w-12 text-center">{Math.round(zoom * 100)}%</span>
          <Button variant="ghost" size="icon" onClick={handleZoomIn} className="h-8 w-8 text-slate-400 hover:text-white"><ZoomIn className="w-4 h-4" /></Button>
          <Button variant="ghost" size="icon" onClick={handleResetZoom} className="h-8 w-8 text-slate-400 hover:text-white"><Maximize className="w-4 h-4" /></Button>
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden bg-[#0a0f1e] min-h-[400px] flex items-center justify-center cursor-move">
        <div 
          className="relative transition-transform duration-200 ease-out flex items-center justify-center w-full h-full"
          style={{ transform: `scale(${zoom})` }}
        >
          {tab === 'original' && (
            <img src={imageUrl} alt="Original" className="max-w-full max-h-full object-contain pointer-events-none" />
          )}
          
          {tab === 'heatmap' && (
            <div className="relative max-w-full max-h-full">
              <img src={imageUrl} alt="Base" className="max-w-full max-h-full object-contain pointer-events-none" />
              {/* Simulated Heatmap Overlay */}
              <div className="absolute inset-0 bg-gradient-radial from-red-500/40 via-transparent to-transparent mix-blend-overlay pointer-events-none" />
              {/* Simulated Bounding Box */}
              <div className="absolute top-[30%] left-[40%] w-[20%] h-[30%] border-2 border-red-500 bg-red-500/10" />
            </div>
          )}

          {tab === 'split' && (
            <div className="flex w-full h-full">
              <div className="w-1/2 h-full border-r border-slate-700 relative overflow-hidden flex items-center justify-end pr-2">
                 <img src={imageUrl} alt="Left" className="max-h-full object-contain" />
              </div>
              <div className="w-1/2 h-full relative overflow-hidden flex items-center justify-start pl-2">
                 <div className="relative max-h-full">
                    <img src={imageUrl} alt="Right" className="max-h-full object-contain" />
                    <div className="absolute inset-0 bg-gradient-radial from-red-500/40 via-transparent to-transparent mix-blend-overlay pointer-events-none" />
                 </div>
              </div>
            </div>
          )}
        </div>
        <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur border border-slate-700 rounded p-2 flex items-center space-x-2 text-xs text-slate-300">
          <MousePointer2 className="w-3 h-3" />
          <span>Drag to pan</span>
        </div>
        
        {tab === 'heatmap' && (
          <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur border border-slate-700 rounded p-2 flex flex-col space-y-1 text-xs">
             <div className="text-slate-400 mb-1 font-semibold">Artifact Intensity</div>
             <div className="flex items-center space-x-2">
               <div className="w-3 h-3 rounded-full bg-red-500" /> <span>High Anomaly</span>
             </div>
             <div className="flex items-center space-x-2">
               <div className="w-3 h-3 rounded-full bg-amber-500" /> <span>Moderate</span>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
