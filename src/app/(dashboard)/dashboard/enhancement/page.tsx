'use client';

import React from 'react';
import { DisclaimerBanner } from '@/components/detection/disclaimer-banner';
import { Sparkles, Wand2, RefreshCcw, Eraser, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function EnhancementDetectorPage() {
  const categories = [
    { name: 'AI Upscaling / Super Resolution', icon: RefreshCcw, probability: 95, confidence: 'High', desc: 'Resolution increased using neural networks, adding hallucinated details not present in original.', technical: 'High-frequency detail regeneration typical of ESRGAN or Real-ESRGAN architectures.' },
    { name: 'Generative Fill / Inpainting', icon: Eraser, probability: 12, confidence: 'Low', desc: 'Replaced or removed objects using AI content generation.', technical: 'Latent diffusion noise patterns detected in masked regions.' },
    { name: 'Face Restoration', icon: Sparkles, probability: 88, confidence: 'High', desc: 'Facial features synthetically enhanced or reconstructed.', technical: 'CodeFormer or GFPGAN artifact signatures in facial bounding boxes.' },
    { name: 'AI Denoising', icon: Wand2, probability: 45, confidence: 'Medium', desc: 'Noise removed using AI algorithms, often resulting in plastic-like textures.', technical: 'Non-linear noise reduction exceeding traditional spatial filters.' }
  ];

  return (
    <div className="container max-w-6xl py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center">
          <Wand2 className="w-8 h-8 mr-3 text-cyan-500" /> AI Enhancement Detection
        </h1>
        <p className="text-slate-400">Detect if an authentic image was upscaled, restored, or modified using AI tools.</p>
      </div>

      <DisclaimerBanner />

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
         <div className="mb-8 p-6 bg-slate-950 rounded-xl border border-slate-800 text-center">
            <h2 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">Overall Classification</h2>
            <div className="text-3xl font-bold text-amber-500 mb-2">AI-Enhanced Original</div>
            <p className="text-slate-400 max-w-2xl mx-auto">This content appears to be originally captured by a camera but has undergone significant processing using AI-based enhancement tools (e.g., AI upscaling, face restoration).</p>
         </div>

         <div className="space-y-6">
            <h3 className="text-xl font-semibold">Enhancement Categories</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categories.map((cat, i) => (
                <div key={i} className="bg-slate-950 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                        <cat.icon className="w-5 h-5 text-cyan-500" />
                      </div>
                      <h4 className="font-medium text-slate-200">{cat.name}</h4>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${cat.probability > 70 ? 'text-amber-500' : cat.probability > 30 ? 'text-yellow-500' : 'text-slate-500'}`}>
                        {cat.probability}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mb-4">
                    <div 
                      className={`h-full rounded-full ${cat.probability > 70 ? 'bg-amber-500' : cat.probability > 30 ? 'bg-yellow-500' : 'bg-slate-500'}`} 
                      style={{ width: `${cat.probability}%` }} 
                    />
                  </div>

                  <p className="text-sm text-slate-400 mb-3">{cat.desc}</p>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="inline-flex items-center text-xs text-slate-500 cursor-help hover:text-slate-300">
                          <Info className="w-3 h-3 mr-1" /> Technical Details
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="bg-slate-800 border-slate-700 max-w-xs">
                        <p>{cat.technical}</p>
                        <p className="mt-2 text-slate-400 border-t border-slate-700 pt-2">Confidence Level: {cat.confidence}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              ))}
            </div>
         </div>
      </div>
    </div>
  );
}
