'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DisclaimerBanner } from '@/components/detection/disclaimer-banner';
import { FileDropzone } from '@/components/detection/file-dropzone';
import { ProcessingStages, ProcessingStage } from '@/components/detection/processing-stages';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { FileText, Image as ImageIcon, Video, Link as LinkIcon, Layers, ShieldCheck } from 'lucide-react';

export default function NewScanPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [stage, setStage] = useState<ProcessingStage>('queued');
  const [textToScan, setTextToScan] = useState('');
  const [urlToScan, setUrlToScan] = useState('');
  const [filesToScan, setFilesToScan] = useState<File[]>([]);
  const [activeTab, setActiveTab] = useState('text');
  const router = useRouter();
  
  const handleScan = async () => {
    setIsProcessing(true);
    setStage('analyzing');
    
    try {
      if (activeTab === 'text') {
        const response = await fetch('/api/scan/text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: textToScan }),
        });
        if (!response.ok) throw new Error('Scan failed');
        const result = await response.json();
        router.push(`/report/${result.scanId}`);
      } else if (activeTab === 'image') {
        if (filesToScan.length === 0) throw new Error('No image selected');
        const formData = new FormData();
        formData.append('image', filesToScan[0]);
        const response = await fetch('/api/scan/image', {
          method: 'POST',
          body: formData,
        });
        if (!response.ok) throw new Error('Scan failed');
        const result = await response.json();
        router.push(`/report/${result.scanId}`);
      } else if (activeTab === 'url') {
        const response = await fetch('/api/scan/url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: urlToScan }),
        });
        if (!response.ok) throw new Error('Scan failed');
        const result = await response.json();
        router.push(`/report/${result.scanId}`);
      } else {
        throw new Error('Not implemented');
      }
    } catch (error) {
      console.error(error);
      setIsProcessing(false);
      setStage('queued');
    }
  };

  return (
    <div className="container max-w-5xl py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">New Analysis Scan</h1>
        <p className="text-slate-400">Select the type of content you want to analyze for AI generation or modification.</p>
      </div>

      <DisclaimerBanner />

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <Tabs defaultValue="text" onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start p-0 h-auto bg-slate-950 border-b border-slate-800 rounded-none overflow-x-auto">
            <TabsTrigger value="text" className="px-6 py-4 data-[state=active]:bg-slate-900 data-[state=active]:border-b-2 data-[state=active]:border-cyan-500 rounded-none">
              <FileText className="w-4 h-4 mr-2" /> Text
            </TabsTrigger>
            <TabsTrigger value="image" className="px-6 py-4 data-[state=active]:bg-slate-900 data-[state=active]:border-b-2 data-[state=active]:border-cyan-500 rounded-none">
              <ImageIcon className="w-4 h-4 mr-2" /> Image
            </TabsTrigger>
            <TabsTrigger value="video" className="px-6 py-4 data-[state=active]:bg-slate-900 data-[state=active]:border-b-2 data-[state=active]:border-cyan-500 rounded-none">
              <Video className="w-4 h-4 mr-2" /> Video
            </TabsTrigger>
            <TabsTrigger value="url" className="px-6 py-4 data-[state=active]:bg-slate-900 data-[state=active]:border-b-2 data-[state=active]:border-cyan-500 rounded-none">
              <LinkIcon className="w-4 h-4 mr-2" /> URL
            </TabsTrigger>
            <TabsTrigger value="batch" className="px-6 py-4 data-[state=active]:bg-slate-900 data-[state=active]:border-b-2 data-[state=active]:border-cyan-500 rounded-none">
              <Layers className="w-4 h-4 mr-2" /> Batch Upload
            </TabsTrigger>
          </TabsList>

          <div className="p-6">
            {!isProcessing ? (
              <div className="space-y-6">
                <TabsContent value="text" className="mt-0 space-y-4">
                  <Textarea 
                    value={textToScan}
                    onChange={(e) => setTextToScan(e.target.value)}
                    placeholder="Paste your text here to analyze for AI generation..." 
                    className="min-h-[400px] resize-none bg-slate-950 border-slate-700"
                  />
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>{textToScan.length} characters</span>
                    <select className="bg-transparent border-none outline-none cursor-pointer">
                      <option>Auto-detect Language</option>
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                    </select>
                  </div>
                </TabsContent>

                <TabsContent value="image" className="mt-0 space-y-4">
                  <FileDropzone 
                    onFilesAccepted={(files) => setFilesToScan(files)}
                    acceptedTypes={{ 'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.heic'] }}
                    maxSize={50 * 1024 * 1024}
                  />
                  <p className="text-xs text-slate-500 text-center">Accepted: JPG, PNG, WEBP, HEIC (Max 50MB)</p>
                </TabsContent>

                <TabsContent value="video" className="mt-0 space-y-4">
                  <FileDropzone 
                    onFilesAccepted={(files) => setFilesToScan(files)}
                    acceptedTypes={{ 'video/*': ['.mp4', '.mov', '.webm', '.avi'] }}
                    maxSize={2 * 1024 * 1024 * 1024}
                  />
                  <p className="text-xs text-slate-500 text-center">Accepted: MP4, MOV, WEBM, AVI (Max 2GB, 30 mins). Note: Processed on server via background jobs.</p>
                </TabsContent>

                <TabsContent value="url" className="mt-0 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Content URL</label>
                    <Input 
                      value={urlToScan}
                      onChange={(e) => setUrlToScan(e.target.value)}
                      placeholder="https://example.com/article" 
                      className="bg-slate-950 border-slate-700 h-12" 
                    />
                    <p className="text-xs text-slate-500">Supports webpage URLs, direct image URLs, and video URLs.</p>
                  </div>
                </TabsContent>

                <TabsContent value="batch" className="mt-0 space-y-4">
                  <FileDropzone 
                    onFilesAccepted={(files) => setFilesToScan(files)}
                    multiple={true}
                    maxFiles={50}
                    maxSize={500 * 1024 * 1024} // 500MB total
                  />
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>0/50 files</span>
                    <span>Total size: 0 MB / 500 MB</span>
                  </div>
                </TabsContent>

                <div className="pt-6 border-t border-slate-800 space-y-6">
                  <Button 
                    onClick={handleScan}
                    className="w-full h-12 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-lg transition-all"
                  >
                    <ShieldCheck className="w-5 h-5 mr-2" />
                    Run Analysis
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 space-y-10 min-h-[400px]">
                <ProcessingStages currentStage={stage} className="w-full max-w-md" />
              </div>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
}
