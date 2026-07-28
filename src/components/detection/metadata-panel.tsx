'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, Info, CheckCircle } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export interface MetadataField {
  key: string;
  label: string;
  value: string | null;
  status: 'normal' | 'suspicious' | 'missing';
  description?: string;
}

interface MetadataPanelProps {
  fields: MetadataField[];
  className?: string;
}

export function MetadataPanel({ fields, className }: MetadataPanelProps) {
  const missingCount = fields.filter(f => f.status === 'missing').length;
  const suspiciousCount = fields.filter(f => f.status === 'suspicious').length;

  return (
    <div className={cn("bg-slate-900 border border-slate-800 rounded-xl overflow-hidden", className)}>
      <div className="p-4 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
        <h3 className="font-semibold text-slate-200">File Metadata</h3>
        <div className="flex space-x-3 text-xs">
          {suspiciousCount > 0 && (
            <span className="text-amber-500 flex items-center"><AlertTriangle className="w-3 h-3 mr-1" /> {suspiciousCount} Suspicious</span>
          )}
          {missingCount > 0 && (
            <span className="text-slate-400 flex items-center"><Info className="w-3 h-3 mr-1" /> {missingCount} Missing</span>
          )}
        </div>
      </div>
      
      <div className="p-2">
        <Accordion type="single" collapsible className="w-full">
          {fields.map((field, index) => (
            <AccordionItem value={`item-${index}`} key={index} className="border-slate-800">
              <AccordionTrigger className="px-4 py-3 hover:bg-slate-800/50 rounded-md transition-colors text-sm hover:no-underline">
                <div className="flex justify-between items-center w-full pr-4">
                  <span className="font-medium text-slate-300">{field.label}</span>
                  <div className="flex items-center">
                    {field.status === 'missing' && <span className="text-slate-500 italic">Not available</span>}
                    {field.status === 'normal' && <span className="text-slate-300 truncate max-w-[200px]">{field.value}</span>}
                    {field.status === 'suspicious' && <span className="text-amber-400 font-medium truncate max-w-[200px]">{field.value}</span>}
                    
                    {field.status === 'suspicious' && <AlertTriangle className="w-4 h-4 ml-2 text-amber-500" />}
                    {field.status === 'missing' && <Info className="w-4 h-4 ml-2 text-slate-500" />}
                    {field.status === 'normal' && <CheckCircle className="w-4 h-4 ml-2 text-emerald-500/50" />}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-1">
                <div className="bg-slate-950 rounded p-3 text-sm text-slate-400 border border-slate-800">
                  <div className="mb-2 font-mono text-xs text-slate-500">Key: {field.key}</div>
                  {field.description || (
                    field.status === 'missing' 
                      ? 'This metadata field was stripped or never present. Frequent stripping is common on social media but can also indicate intentional obfuscation.' 
                      : field.status === 'suspicious'
                        ? 'This value is atypical and may indicate manipulation or use of synthetic generation tools.'
                        : 'Standard metadata value.'
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
      
      <div className="p-4 bg-slate-950 border-t border-slate-800 text-xs text-slate-500 italic">
        Note: Metadata can be easily manipulated or stripped. Absence of metadata is not definitive proof of AI generation.
      </div>
    </div>
  );
}
