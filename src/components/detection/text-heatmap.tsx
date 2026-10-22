'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface HeatmapAnnotation {
  id: string;
  start: number;
  end: number;
  score: number; // 0 to 1, where 1 is highest AI likelihood
  signalName: string;
}

interface TextHeatmapProps {
  text: string;
  annotations: HeatmapAnnotation[];
  className?: string;
}

export function TextHeatmap({ text, annotations, className }: TextHeatmapProps) {
  // Simple implementation: sort annotations, assuming no overlaps for this demo
  const sortedAnnotations = [...annotations].sort((a, b) => a.start - b.start);
  
  const getSegmentColor = (score: number) => {
    if (score > 0.8) return 'bg-red-500/20 text-red-100 hover:bg-red-500/40';
    if (score > 0.5) return 'bg-amber-500/20 text-amber-100 hover:bg-amber-500/40';
    if (score > 0.2) return 'bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/40';
    return 'bg-slate-500/20 text-slate-100 hover:bg-slate-500/40';
  };

  const getLegendColor = (score: number) => {
    if (score > 0.8) return 'bg-red-500';
    if (score > 0.5) return 'bg-amber-500';
    if (score > 0.2) return 'bg-emerald-500';
    return 'bg-slate-500';
  };

  const renderSegments = () => {
    let lastIndex = 0;
    const segments = [];

    sortedAnnotations.forEach((anno, i) => {
      // Add unannotated text before this annotation
      if (anno.start > lastIndex) {
        segments.push(
          <span key={`text-${i}`} className="text-slate-300">
            {text.substring(lastIndex, anno.start)}
          </span>
        );
      }

      // Add annotated text
      segments.push(
        <TooltipProvider key={`anno-${anno.id}`}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className={cn('transition-colors cursor-help rounded-sm px-0.5', getSegmentColor(anno.score))}>
                {text.substring(anno.start, anno.end)}
              </span>
            </TooltipTrigger>
            <TooltipContent className="bg-slate-800 border-slate-700">
              <p className="font-semibold">{anno.signalName}</p>
              <p className="text-xs text-slate-300">AI Likelihood: {(anno.score * 100).toFixed(0)}%</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      lastIndex = anno.end;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      segments.push(
        <span key="text-end" className="text-slate-300">
          {text.substring(lastIndex)}
        </span>
      );
    }

    return segments;
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-emerald-500/40 border border-emerald-500"></div> Low AI Likelihood</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-amber-500/40 border border-amber-500"></div> Moderate</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-red-500/40 border border-red-500"></div> High AI Likelihood</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-slate-500/40 border border-slate-500"></div> Inconclusive</div>
      </div>
      
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl leading-relaxed whitespace-pre-wrap font-serif text-lg">
        {renderSegments()}
      </div>

      <p className="text-xs text-slate-500 italic text-center">
        Highlighted text does not definitively indicate AI generation. Colors represent pattern matching likelihoods based on statistical models.
      </p>
    </div>
  );
}
