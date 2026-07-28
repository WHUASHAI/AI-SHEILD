import React from "react";
import { ShieldAlert, Download, Share2, FileText, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

// This is a simplified public version for unauthenticated viewing
export default async function PublicReportPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  
  // Generate randomized result for demonstration since no DB is connected
  const seed = token.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const confidence = seed % 100;
  const isAi = confidence > 50;

  // Mock data for the shared report
  const report = {
    id: token,
    title: "Content Analysis Report",
    type: "Analysis",
    result: isAi ? "Likely AI-Generated" : "Likely Human-Created",
    confidence: confidence,
    date: new Date().toISOString().split('T')[0],
    text: "Sample analyzed content snippet...",
    disclaimer: "AI Sheild provides a probability-based analysis. Results may contain false positives or false negatives."
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-gray-100 font-sans">
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-cyan-600 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-white">AI Sheild</span>
          </div>
          <span className="text-xs font-medium text-gray-400 bg-gray-800 px-3 py-1.5 rounded-full border border-gray-700">
            Shared Report
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-500/90 leading-relaxed">
            <strong>Disclaimer:</strong> {report.disclaimer} This report should not be treated as definitive proof.
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-xl">
          <div className="p-6 md:p-8 border-b border-gray-800">
            <div className="flex items-center gap-2 text-cyan-400 mb-4">
              <FileText className="w-5 h-5" />
              <span className="text-sm font-semibold uppercase tracking-wider">{report.type} Analysis</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{report.title}</h1>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              Analyzed on {report.date}
            </div>
          </div>

          <div className="p-6 md:p-8 bg-gray-950 flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">Overall Assessment</h3>
                <div className="inline-flex items-center px-4 py-2 rounded-lg font-bold text-lg bg-red-500/10 text-red-500 border border-red-500/30">
                  {report.result}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">AI Probability Score</h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500" style={{ width: `${report.confidence}%` }} />
                  </div>
                  <span className="text-2xl font-bold text-gray-200">{report.confidence}%</span>
                </div>
              </div>
            </div>

            <div className="w-full md:w-px bg-gray-800" />

            <div className="flex-1 space-y-4">
              <h3 className="text-sm font-medium text-gray-400">Analyzed Content Snippet</h3>
              <div className="bg-gray-900 border border-gray-800 p-4 rounded-lg text-sm text-gray-300 italic">
                "{report.text}"
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-center gap-4 pt-8">
          <a href="/dashboard/new-scan" className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700">
            Back to Scan
          </a>
          <a href="/" className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            Analyze New Content
          </a>
        </div>
      </main>
    </div>
  );
}
