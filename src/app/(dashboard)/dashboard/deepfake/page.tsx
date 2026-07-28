'use client';

import React from 'react';
import { DisclaimerBanner } from '@/components/detection/disclaimer-banner';
import { ScanFace, UserX, UserCheck, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DeepfakeDetectorPage() {
  return (
    <div className="container max-w-6xl py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center">
          <ScanFace className="w-8 h-8 mr-3 text-cyan-500" /> Deepfake Detection
        </h1>
        <p className="text-slate-400">Specialized biometric and facial manipulation analysis.</p>
      </div>

      <DisclaimerBanner />

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center justify-center p-8 bg-slate-950 rounded-xl border border-slate-800 shadow-inner">
            <div className="relative w-48 h-48 mb-6">
              {/* Fake Ring Chart */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#1e293b" strokeWidth="8" />
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#ef4444" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset="45" className="transition-all duration-1000 ease-out" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-white">82%</span>
                <span className="text-sm text-red-400 font-medium">Deepfake Likelihood</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-slate-300">
               <UserX className="w-5 h-5 text-red-500" />
               <span className="font-medium">Face Swap Detected</span>
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            <h3 className="text-xl font-semibold border-b border-slate-800 pb-2">Biometric Analysis Breakdown</h3>
            
            <div className="space-y-4">
              {[
                { name: 'Facial Landmark Stability', score: 88, desc: 'Unnatural micro-movements detected around eyes and mouth.', status: 'fail' },
                { name: 'Skin Texture Consistency', score: 75, desc: 'Over-smoothed regions adjacent to high-noise areas.', status: 'fail' },
                { name: 'Eye/Blink Pattern', score: 40, desc: 'Blink rate is within normal human parameters.', status: 'pass' },
                { name: 'Lighting/Shadow Geometry', score: 82, desc: 'Specular highlights on eyes do not match environmental lighting.', status: 'fail' },
              ].map((metric, i) => (
                <div key={i} className="flex flex-col p-4 bg-slate-950 rounded-lg border border-slate-800">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      {metric.status === 'fail' ? <AlertTriangle className="w-4 h-4 text-red-500" /> : <UserCheck className="w-4 h-4 text-emerald-500" />}
                      <span className="font-medium text-slate-200">{metric.name}</span>
                    </div>
                    <span className={`font-mono text-sm ${metric.status === 'fail' ? 'text-red-400' : 'text-emerald-400'}`}>{metric.score}% Anomaly</span>
                  </div>
                  <p className="text-sm text-slate-400 mb-3">{metric.desc}</p>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${metric.status === 'fail' ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${metric.score}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center p-4 bg-slate-800/30 text-slate-300 rounded-lg text-sm">
              <ScanFace className="w-5 h-5 mr-3 text-cyan-500" />
              Privacy Notice: This analysis maps generic facial landmarks. No personal identification or facial recognition against databases is performed.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
