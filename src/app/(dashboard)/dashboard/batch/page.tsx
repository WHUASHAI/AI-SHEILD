"use client";

import React, { useState } from "react";
import { Upload, X, File, AlertTriangle, ShieldAlert, CheckCircle2, Play, RefreshCw, Trash2, Download } from "lucide-react";
import { cn } from "@/lib/utils";

type FileItem = {
  id: string;
  name: string;
  size: string;
  type: string;
  status: "queued" | "uploading" | "processing" | "completed" | "failed";
  progress: number;
};

export default function BatchScannerPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [batchName, setBatchName] = useState("");
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    // mock file addition
    setFiles([
      ...files,
      {
        id: Math.random().toString(),
        name: "dataset_sample.txt",
        size: "1.2 MB",
        type: "text/plain",
        status: "queued",
        progress: 0
      }
    ]);
  };

  return (
    <div className="p-6 min-h-screen bg-[#0a0f1e] text-gray-100 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Batch Scanner</h1>
        <p className="text-gray-400">Analyze multiple files simultaneously. Max 50 files or 500MB per batch.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Batch Name</label>
              <input 
                type="text" 
                placeholder="e.g., Marketing Assets Q3" 
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
                className="w-full bg-gray-950 border border-gray-700 rounded-md px-4 py-2.5 text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Detection Modules</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  "AI Generation Detection",
                  "Deepfake Detection",
                  "Enhancement Detection",
                  "Metadata Analysis"
                ].map((module, i) => (
                  <label key={module} className="flex items-center gap-3 p-3 bg-gray-950/50 border border-gray-800 rounded-lg cursor-pointer hover:border-gray-700 transition-colors">
                    <input type="checkbox" defaultChecked={i === 0 || i === 3} className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-gray-900" />
                    <span className="text-sm text-gray-300">{module}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Upload Files</label>
              <div 
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="border-2 border-dashed border-gray-700 hover:border-cyan-500/50 rounded-xl p-8 bg-gray-950/30 transition-colors flex flex-col items-center justify-center text-center cursor-pointer"
              >
                <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center mb-4 text-cyan-400">
                  <Upload className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-gray-200 mb-1">Click or drag files here</h3>
                <p className="text-sm text-gray-500 mb-4">Supports TXT, PDF, DOCX, JPG, PNG, MP4</p>
                <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-sm font-medium text-white rounded-md transition-colors">
                  Select Files
                </button>
              </div>
            </div>

            {files.length > 0 && (
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-gray-300">{files.length} files selected</span>
                  <button className="text-red-400 hover:text-red-300">Clear all</button>
                </div>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                  {files.map((file) => (
                    <div key={file.id} className="flex items-center gap-4 bg-gray-950 border border-gray-800 p-3 rounded-lg">
                      <File className="w-5 h-5 text-gray-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-sm font-medium text-gray-200 truncate pr-4">{file.name}</p>
                          <span className="text-xs text-gray-500 shrink-0">{file.size}</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-500 w-0" />
                        </div>
                      </div>
                      <button className="p-1 text-gray-500 hover:text-red-400 rounded-md transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-gray-800 flex justify-end">
              <button 
                disabled={files.length === 0}
                className="flex items-center gap-2 px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:hover:bg-cyan-600 text-white font-medium rounded-md transition-colors shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              >
                <Play className="w-4 h-4" />
                Start Batch Scan
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-xl">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-amber-500 mb-3">
              <ShieldAlert className="w-4 h-4" /> Fair-Use Limits
            </h3>
            <ul className="space-y-2 text-sm text-amber-500/80">
              <li className="flex items-center gap-2"><span className="w-1 h-1 bg-amber-500 rounded-full" /> Max 50 files per batch</li>
              <li className="flex items-center gap-2"><span className="w-1 h-1 bg-amber-500 rounded-full" /> Max 500MB total size</li>
              <li className="flex items-center gap-2"><span className="w-1 h-1 bg-amber-500 rounded-full" /> Max 30-min per video</li>
              <li className="flex items-center gap-2"><span className="w-1 h-1 bg-amber-500 rounded-full" /> Max 3 concurrent jobs</li>
            </ul>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
            <h3 className="text-base font-semibold text-gray-200 mb-4">Recent Batches</h3>
            
            <div className="space-y-4">
              <div className="bg-gray-950 border border-gray-800 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-medium text-gray-200">Marketing Assets Q3</h4>
                    <p className="text-xs text-gray-500 mt-0.5">ID: btc_9x8c...4m</p>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                    Completed
                  </span>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>24/24 files</span>
                  <span>•</span>
                  <span>Oct 12, 2023</span>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <button className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-xs font-medium text-gray-200 rounded-md transition-colors">
                    <Download className="w-3.5 h-3.5" /> Report
                  </button>
                  <button className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 hover:text-red-400 text-gray-400 rounded-md transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="bg-gray-950 border border-gray-800 rounded-lg p-4 space-y-3 relative overflow-hidden">
                <div className="absolute top-0 left-0 h-1 bg-cyan-500 w-2/3" />
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-medium text-gray-200">User Uploads Dump</h4>
                    <p className="text-xs text-gray-500 mt-0.5">ID: btc_7y2b...9k</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <RefreshCw className="w-3 h-3 animate-spin" /> Processing
                  </span>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>32/50 files</span>
                  <span>•</span>
                  <span>Started 2m ago</span>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <button className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-xs font-medium text-gray-200 rounded-md transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
