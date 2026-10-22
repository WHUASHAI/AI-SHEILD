'use client';

import React, { useState } from 'react';
import { DisclaimerBanner } from '@/components/detection/disclaimer-banner';
import { 
  Download, FileJson, Copy, Share2, RefreshCw, Trash2, 
  CheckCircle2, FileText, Calendar, Hash, ShieldAlert, AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ScanResultPage({ params }: { params: { id: string } }) {
  const [showShareModal, setShowShareModal] = useState(false);
  const scanId = params.id || 'SCAN-98234-XYZ';

  return (
    <div className="container max-w-6xl py-8 space-y-8">
      {/* Header Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
        <div className="space-y-4 flex-1">
          <div className="flex items-center space-x-3">
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded text-xs font-medium flex items-center">
              <CheckCircle2 className="w-3 h-3 mr-1" /> Analysis Complete
            </span>
            <span className="text-slate-500 text-sm flex items-center"><Calendar className="w-3 h-3 mr-1" /> Oct 24, 2023 14:30 UTC</span>
          </div>
          
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Q3_Earnings_Report_Draft.pdf</h1>
            <div className="flex items-center text-sm text-slate-400 space-x-4">
              <span className="flex items-center"><FileText className="w-4 h-4 mr-1" /> Text Document</span>
              <span className="flex items-center" title="SHA-256 Hash"><Hash className="w-4 h-4 mr-1" /> a8f9c2...9b4e <Copy className="w-3 h-3 ml-1 cursor-pointer hover:text-white" /></span>
              <span>Model v2.4.1</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Button variant="outline" size="sm" className="bg-slate-950 border-slate-800 hover:bg-slate-800 text-slate-300">
              <Download className="w-4 h-4 mr-2" /> PDF Report
            </Button>
            <Button variant="outline" size="sm" className="bg-slate-950 border-slate-800 hover:bg-slate-800 text-slate-300">
              <FileJson className="w-4 h-4 mr-2" /> JSON
            </Button>
            <Button variant="outline" size="sm" className="bg-slate-950 border-slate-800 hover:bg-slate-800 text-slate-300" onClick={() => setShowShareModal(true)}>
              <Share2 className="w-4 h-4 mr-2" /> Share
            </Button>
            <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-400/10 ml-auto">
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </Button>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center p-6 bg-slate-950 rounded-xl border border-slate-800 min-w-[240px]">
          <ShieldAlert className="w-10 h-10 text-red-500 mb-2" />
          <div className="text-2xl font-bold text-white text-center">Likely AI-Generated</div>
          <div className="text-sm text-slate-400 mt-1">High Confidence (89%)</div>
        </div>
      </div>

      <DisclaimerBanner />

      {/* Report Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <Tabs defaultValue="assessment" className="w-full">
          <TabsList className="w-full justify-start p-0 h-auto bg-slate-950 border-b border-slate-800 rounded-none overflow-x-auto">
            <TabsTrigger value="assessment" className="px-6 py-4 data-[state=active]:bg-slate-900 data-[state=active]:border-b-2 data-[state=active]:border-cyan-500 rounded-none">Overall Assessment</TabsTrigger>
            <TabsTrigger value="signals" className="px-6 py-4 data-[state=active]:bg-slate-900 data-[state=active]:border-b-2 data-[state=active]:border-cyan-500 rounded-none">Detected Signals</TabsTrigger>
            <TabsTrigger value="details" className="px-6 py-4 data-[state=active]:bg-slate-900 data-[state=active]:border-b-2 data-[state=active]:border-cyan-500 rounded-none">Evidence Details</TabsTrigger>
          </TabsList>

          <div className="p-6 md:p-8">
            <TabsContent value="assessment" className="mt-0 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold border-b border-slate-800 pb-2">Probability Breakdown</h3>
                  
                  <div className="space-y-5">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-300">AI Generated</span>
                        <span className="font-bold text-red-400">89%</span>
                      </div>
                      <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 rounded-full" style={{ width: '89%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-300">Human Written</span>
                        <span className="font-bold text-emerald-400">11%</span>
                      </div>
                      <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '11%' }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-lg font-semibold border-b border-slate-800 pb-2">Recommended Next Steps</h3>
                  <ul className="space-y-3 text-sm text-slate-300">
                    <li className="flex items-start"><div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 mr-2 flex-shrink-0" /> Review heavily flagged passages (pages 2-4) for factual accuracy, as LLMs may hallucinate details.</li>
                    <li className="flex items-start"><div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 mr-2 flex-shrink-0" /> Check references and citations, as these are commonly fabricated by AI models.</li>
                    <li className="flex items-start"><div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 mr-2 flex-shrink-0" /> Request the author to provide rough drafts or version history to verify human authorship.</li>
                  </ul>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-lg p-5">
                <h4 className="font-medium text-amber-500 flex items-center mb-2"><AlertTriangle className="w-4 h-4 mr-2" /> Known Limitations for this Scan</h4>
                <p className="text-sm text-slate-400">Document was converted from PDF to text, which may introduce formatting artifacts that slightly lower confidence scores. Technical domain text (finance) naturally exhibits lower perplexity which can increase false positive rates by ~3%.</p>
              </div>
            </TabsContent>
            
            <TabsContent value="signals" className="mt-0">
               <p className="text-slate-400">Signal breakdown will be displayed here.</p>
            </TabsContent>
            
            <TabsContent value="details" className="mt-0">
               <p className="text-slate-400">Detailed evidence map will be displayed here.</p>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Basic Share Modal placeholder logic */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold mb-4">Share Secure Report</h3>
            <p className="text-sm text-slate-400 mb-4">Create a read-only link to share this specific analysis result.</p>
            <div className="flex items-center space-x-2 mb-6">
              <input type="text" value={`https://originscan.ai/shared/${scanId}`} readOnly className="flex-1 bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-300" />
              <Button size="icon" className="bg-cyan-600 hover:bg-cyan-500"><Copy className="w-4 h-4" /></Button>
            </div>
            <div className="flex justify-end">
              <Button variant="ghost" onClick={() => setShowShareModal(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
