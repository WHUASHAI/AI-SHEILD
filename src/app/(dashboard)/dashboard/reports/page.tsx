"use client";

import React, { useState } from "react";
import { Search, ExternalLink, Download, FileJson, Share2, StickyNote, Tag, Trash2, ShieldAlert, FileText, Image as ImageIcon, Video, Link as LinkIcon, X, Copy, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

type Report = {
  id: string;
  title: string;
  type: "Text" | "Image" | "Video" | "URL";
  result: "Likely Human" | "Likely AI-Generated" | "Likely AI-Edited" | "Likely AI-Enhanced" | "Mixed" | "Inconclusive";
  confidence: number;
  date: string;
  tags: string[];
  shared: boolean;
  shareExpiry?: string;
  notes?: string;
};

const MOCK_REPORTS: Report[] = Array.from({ length: 10 }, (_, i) => ({
  id: `rep-${i}`,
  title: `AI Shield Analysis ${i + 1}`,
  type: ["Text", "Image", "Video", "URL"][i % 4] as any,
  result: ["Likely Human", "Likely AI-Generated", "Likely AI-Edited", "Mixed", "Inconclusive"][i % 5] as any,
  confidence: Math.floor(Math.random() * 40) + 60,
  date: new Date(Date.now() - Math.floor(Math.random() * 5000000000)).toISOString().split('T')[0],
  tags: i % 3 === 0 ? ["important", "review"] : i % 2 === 0 ? ["client-a"] : [],
  shared: i % 4 === 0,
  shareExpiry: i % 4 === 0 ? "2024-12-31" : undefined,
}));

export default function ReportsPage() {
  const [reports, setReports] = useState(MOCK_REPORTS);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [shareModalOpen, setShareModalOpen] = useState<string | null>(null);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Text": return <FileText className="w-4 h-4" />;
      case "Image": return <ImageIcon className="w-4 h-4" />;
      case "Video": return <Video className="w-4 h-4" />;
      case "URL": return <LinkIcon className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getResultColor = (result: string) => {
    if (result.includes("Human")) return "bg-green-500/10 text-green-500 border-green-500/20";
    if (result.includes("AI")) return "bg-red-500/10 text-red-500 border-red-500/20";
    if (result === "Mixed") return "bg-purple-500/10 text-purple-500 border-purple-500/20";
    return "bg-gray-500/10 text-gray-400 border-gray-500/20";
  };

  return (
    <div className="p-6 min-h-screen bg-[#0a0f1e] text-gray-100 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Reports Library</h1>
          <p className="text-gray-400 mt-1 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            AI Shield provides a probability-based analysis. Results may contain false positives or false negatives.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-gray-900/50 p-4 border border-gray-800 rounded-lg">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search reports..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-md text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          />
        </div>
        <div className="flex bg-gray-800/50 border border-gray-700 rounded-md p-1">
          {["All", "Shared", "Tagged", "Recent"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-1.5 rounded-sm text-sm font-medium transition-colors",
                filter === f ? "bg-gray-700 text-white" : "text-gray-400 hover:text-gray-200"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <div key={report.id} className="flex flex-col bg-gray-900/40 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-all shadow-sm">
            <div className="p-5 flex-1 space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2 bg-gray-800/80 px-2.5 py-1 rounded-md">
                  <span className="text-cyan-400">{getTypeIcon(report.type)}</span>
                  <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">{report.type}</span>
                </div>
                {report.shared ? (
                  <span className="flex items-center gap-1.5 text-xs font-medium text-cyan-400 bg-cyan-900/20 px-2 py-1 rounded-full border border-cyan-800/30">
                    <Share2 className="w-3 h-3" /> Shared
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-800/50 px-2 py-1 rounded-full border border-gray-700/50">
                    Private
                  </span>
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-gray-100 truncate" title={report.title}>{report.title}</h3>
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
                  <Calendar className="w-4 h-4" />
                  {report.date}
                </div>
              </div>

              <div className="space-y-3 bg-gray-950/50 p-3 rounded-lg border border-gray-800/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Analysis Result</span>
                  <span className={cn("inline-flex items-center px-2 py-1 rounded text-xs font-semibold border", getResultColor(report.result))}>
                    {report.result}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Confidence</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-500" style={{ width: `${report.confidence}%` }} />
                    </div>
                    <span className="text-sm font-semibold text-gray-200">{report.confidence}%</span>
                  </div>
                </div>
              </div>

              {report.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {report.tags.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-gray-800 text-gray-300 border border-gray-700">
                      <Tag className="w-3 h-3 text-gray-500" />
                      {tag}
                      <button className="hover:text-red-400 transition-colors"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                  <button className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700 border border-gray-700 border-dashed transition-colors">
                    +
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-5 border-t border-gray-800 bg-gray-900/80 divide-x divide-gray-800">
              <button className="flex flex-col items-center justify-center py-3 gap-1 text-gray-400 hover:text-cyan-400 hover:bg-gray-800 transition-colors group" title="Open Report">
                <ExternalLink className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                <span className="text-[10px] font-medium">Open</span>
              </button>
              <button className="flex flex-col items-center justify-center py-3 gap-1 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors" title="Download PDF">
                <Download className="w-4 h-4" />
                <span className="text-[10px] font-medium">PDF</span>
              </button>
              <button className="flex flex-col items-center justify-center py-3 gap-1 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors" title="Export JSON">
                <FileJson className="w-4 h-4" />
                <span className="text-[10px] font-medium">JSON</span>
              </button>
              <button 
                onClick={() => setShareModalOpen(report.id)}
                className="flex flex-col items-center justify-center py-3 gap-1 text-gray-400 hover:text-cyan-400 hover:bg-gray-800 transition-colors" title="Share"
              >
                <Share2 className="w-4 h-4" />
                <span className="text-[10px] font-medium">Share</span>
              </button>
              <button className="flex flex-col items-center justify-center py-3 gap-1 text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-colors" title="Delete">
                <Trash2 className="w-4 h-4" />
                <span className="text-[10px] font-medium">Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {shareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in duration-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <h2 className="text-lg font-semibold text-white">Share Report</h2>
              <button onClick={() => setShareModalOpen(null)} className="p-1 text-gray-400 hover:text-white rounded-md hover:bg-gray-800 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg text-amber-500/90 text-sm">
                <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                <p>Anyone with this link can view this report and its analysis results. Ensure no sensitive information is exposed.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Secure Link</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    readOnly 
                    value={`https://originscan.ai/report/shr_${Math.random().toString(36).substring(2, 15)}`}
                    className="flex-1 bg-gray-950 border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-400 font-mono focus:outline-none"
                  />
                  <button className="flex items-center justify-center px-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-md text-gray-300 transition-colors">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Expiration (Optional)</label>
                <input 
                  type="date" 
                  className="w-full bg-gray-950 border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 border-t border-gray-800 bg-gray-900/50">
              <button className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors">
                Disable Link
              </button>
              <button 
                onClick={() => setShareModalOpen(null)}
                className="px-4 py-2 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-500 rounded-md transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
