'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface VerdictRingProps {
  score: number; // 0 to 100
  type: 'ai' | 'human' | 'mixed' | 'inconclusive';
  label: string;
  className?: string;
  size?: number;
  strokeWidth?: number;
}

export function VerdictRing({ 
  score, 
  type, 
  label, 
  className, 
  size = 200, 
  strokeWidth = 12 
}: VerdictRingProps) {
  const [offset, setOffset] = useState(0);
  
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  useEffect(() => {
    // Animate to score
    const targetOffset = circumference - (score / 100) * circumference;
    // initial state is full circumference (0%)
    setOffset(circumference);
    
    const timeout = setTimeout(() => {
      setOffset(targetOffset);
    }, 100);
    
    return () => clearTimeout(timeout);
  }, [score, circumference]);

  const getColor = () => {
    switch(type) {
      case 'ai': return 'stroke-red-500 text-red-500';
      case 'human': return 'stroke-emerald-500 text-emerald-500';
      case 'mixed': return 'stroke-amber-500 text-amber-500';
      case 'inconclusive': return 'stroke-slate-400 text-slate-400';
      default: return 'stroke-cyan-500 text-cyan-500';
    }
  };

  return (
    <div className={cn("relative flex flex-col items-center justify-center", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background ring */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-800"
          />
          {/* Progress ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={cn("transition-all duration-1000 ease-out", getColor().split(' ')[0])}
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-white tracking-tighter">
            {score}<span className="text-xl text-slate-400">%</span>
          </span>
          <span className={cn("text-xs font-semibold uppercase tracking-wider mt-1", getColor().split(' ')[1])}>
            {type}
          </span>
        </div>
      </div>
      
      {label && (
        <div className="mt-4 text-center font-medium text-slate-300">
          {label}
        </div>
      )}
    </div>
  );
}
