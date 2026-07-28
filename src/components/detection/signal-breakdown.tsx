'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, HelpCircle } from 'lucide-react';

export interface SignalBreakdownItem {
  name: string;
  description: string;
  score: number; // 0 to 100
  confidence: 'Low' | 'Medium' | 'High';
  impact: 'low' | 'medium' | 'high';
  isAnomaly: boolean;
}

interface SignalBreakdownProps {
  signals: SignalBreakdownItem[];
  className?: string;
}

export function SignalBreakdown({ signals, className }: SignalBreakdownProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {signals.map((signal, index) => (
        <div key={index} className="bg-slate-950 border border-slate-800 rounded-lg p-4 transition-colors hover:border-slate-700">
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="flex items-center space-x-2">
                {signal.isAnomaly ? (
                  <AlertCircle className={cn("w-4 h-4", signal.impact === 'high' ? "text-red-500" : "text-amber-500")} />
                ) : (
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                )}
                <h4 className="font-medium text-slate-200">{signal.name}</h4>
              </div>
              <p className="text-sm text-slate-400 mt-1">{signal.description}</p>
            </div>
            <div className="text-right ml-4">
              <div className={cn("text-lg font-bold font-mono", signal.isAnomaly ? "text-red-400" : "text-emerald-400")}>
                {signal.score}%
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {signal.confidence} Conf.
              </div>
            </div>
          </div>
          
          <div className="mt-3">
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  signal.isAnomaly ? (signal.impact === 'high' ? 'bg-red-500' : 'bg-amber-500') : 'bg-emerald-500'
                )}
                style={{ width: `${signal.score}%` }} 
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
