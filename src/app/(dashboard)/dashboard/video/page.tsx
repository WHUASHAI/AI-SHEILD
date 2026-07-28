'use client';

import React from 'react';
import { DisclaimerBanner } from '@/components/detection/disclaimer-banner';
import { Video, ShieldAlert, Cpu, Activity, Clock, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function VideoDetectorPage() {
  return (
    <div className="container max-w-6xl py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center">
          <Video className="w-8 h-8 mr-3 text-cyan-500" /> Video Analysis
        </h1>
        <p className="text-slate-400">Frame-by-frame analysis for deepfakes, synthetic generation, and temporal inconsistencies.</p>
      </div>

      <DisclaimerBanner />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-black rounded-xl aspect-video border border-slate-800 overflow-hidden relative flex items-center justify-center">
             <Film className="w-16 h-16 text-slate-700" />
             <div className="absolute bottom-4 left-4 right-4 bg-slate-900/80 backdrop-blur p-4 rounded-lg border border-slate-700">
               <div className="flex justify-between items-center mb-2">
                 <span className="text-sm font-medium text-white">Timeline Analysis</span>
                 <span className="text-xs text-amber-400">3 Suspicious regions detected</span>
               </div>
               <div className="relative h-8 bg-slate-800 rounded overflow-hidden flex items-center px-1">
                 {/* Timeline track */}
                 <div className="absolute inset-0 bg-slate-800" />
                 {/* Anomalies */}
                 <div className="absolute h-full w-[10%] left-[20%] bg-red-500/40 border-x border-red-500 cursor-pointer hover:bg-red-500/60 transition-colors" title="0:12 - 0:18" />
                 <div className="absolute h-full w-[5%] left-[55%] bg-amber-500/40 border-x border-amber-500 cursor-pointer hover:bg-amber-500/60 transition-colors" title="0:45 - 0:50" />
                 <div className="absolute h-full w-[15%] left-[80%] bg-red-500/40 border-x border-red-500 cursor-pointer hover:bg-red-500/60 transition-colors" title="1:12 - 1:24" />
                 {/* Playhead */}
                 <div className="absolute top-0 bottom-0 w-0.5 bg-cyan-500 left-[30%]" />
               </div>
               <div className="flex justify-between text-xs text-slate-500 mt-1">
                 <span>0:00</span>
                 <span>1:30</span>
               </div>
             </div>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center"><Activity className="w-5 h-5 mr-2 text-slate-400" /> Temporal Inconsistencies</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Lip Sync Jitter', time: '0:12 - 0:18', score: 89 },
                { name: 'Unnatural Blinking', time: '1:12 - 1:24', score: 94 },
              ].map((item, i) => (
                <div key={i} className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium text-slate-200">{item.name}</div>
                    <div className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded flex items-center"><Clock className="w-3 h-3 mr-1" /> {item.time}</div>
                  </div>
                  <div className="flex items-center justify-between text-xs mt-3">
                    <span className="text-slate-500">Anomaly Score</span>
                    <span className="text-red-400 font-mono">{item.score}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full" style={{ width: `${item.score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />
            <h2 className="text-xl font-semibold mb-6">Analysis Results</h2>
            
            <div className="flex flex-col items-center justify-center py-6 mb-6 bg-slate-950 rounded-xl border border-slate-800">
              <ShieldAlert className="w-12 h-12 text-red-500 mb-3" />
              <div className="text-2xl font-bold text-white mb-1">Likely Deepfake</div>
              <div className="text-sm text-slate-400">Confidence: 91%</div>
            </div>

            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="flex items-center text-slate-300"><Cpu className="w-4 h-4 mr-2 text-red-500" /> AI Modification Probability</span>
                  <span className="font-bold text-red-400">91%</span>
                </div>
                <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: '91%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="text-sm text-slate-400 bg-slate-950 p-4 rounded border border-slate-800">
              <span className="text-cyan-400 font-medium block mb-1">Server-side Processing Note</span>
              Video analysis requires extensive computational resources. Results shown are cached from a previous background job.
            </div>
          </div>

          <Button className="w-full bg-slate-800 hover:bg-slate-700 text-white border border-slate-700">
            View Full Frame Inspector
          </Button>
        </div>
      </div>
    </div>
  );
}
