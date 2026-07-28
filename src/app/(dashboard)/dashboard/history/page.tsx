"use client";

import React, { useState } from "react";
import { Download, Share2, Trash2, FolderOpen, Pencil, RefreshCw, LayoutGrid, List, Search, FilterX, ChevronLeft, ChevronRight, FileText, Image as ImageIcon, Video, Link as LinkIcon, File } from "lucide-react";
import { cn } from "@/lib/utils";
import ScanFilters from "@/components/history/scan-filters";
import RenameDialog from "@/components/history/rename-dialog";

type ContentType = "Text" | "Image" | "Video" | "URL";
type ResultType = "Likely Human" | "Likely AI-Generated" | "Likely AI-Edited" | "Likely AI-Enhanced" | "Mixed" | "Inconclusive";
type StatusType = "Completed" | "Processing" | "Failed";

interface ScanRecord {
  id: string;
  name: string;
  type: ContentType;
  result: ResultType;
  confidence: number;
  date: string;
  status: StatusType;
}

const MOCK_DATA: ScanRecord[] = Array.from({ length: 20 }, (_, i) => {
  const types: ContentType[] = ["Text", "Image", "Video", "URL"];
  const results: ResultType[] = ["Likely Human", "Likely AI-Generated", "Likely AI-Edited", "Likely AI-Enhanced", "Mixed", "Inconclusive"];
  const statuses: StatusType[] = ["Completed", "Processing", "Failed", "Completed", "Completed"];
  
  return {
    id: `scan-${i + 1}`,
    name: `Analysis Document ${i + 1}`,
    type: types[i % 4],
    result: results[i % 6],
    confidence: Math.floor(Math.random() * 40) + 60,
    date: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString().split('T')[0],
    status: statuses[i % 5],
  };
});

export default function HistoryPage() {
  const [view, setView] = useState<"table" | "card">("table");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [renameId, setRenameId] = useState<string | null>(null);

  const getTypeIcon = (type: ContentType) => {
    switch (type) {
      case "Text": return <FileText className="w-4 h-4" />;
      case "Image": return <ImageIcon className="w-4 h-4" />;
      case "Video": return <Video className="w-4 h-4" />;
      case "URL": return <LinkIcon className="w-4 h-4" />;
      default: return <File className="w-4 h-4" />;
    }
  };

  const getResultColor = (result: ResultType) => {
    switch (result) {
      case "Likely Human": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "Likely AI-Generated": return "bg-red-500/10 text-red-500 border-red-500/20";
      case "Likely AI-Edited": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "Likely AI-Enhanced": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "Mixed": return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      default: return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === MOCK_DATA.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(MOCK_DATA.map(d => d.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen bg-[#0a0f1e] text-gray-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Scan History</h1>
          <p className="text-gray-400 mt-1">
            AI Sheild provides a probability-based analysis. Results may contain false positives or false negatives and should not be treated as definitive proof.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-md transition-colors text-sm font-medium">
            <Download className="w-4 h-4" />
            Export All
          </button>
          <div className="flex bg-gray-900 border border-gray-800 rounded-md p-1">
            <button
              onClick={() => setView("table")}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-sm text-sm font-medium transition-colors",
                view === "table" ? "bg-gray-800 text-white" : "text-gray-400 hover:text-gray-200"
              )}
            >
              <List className="w-4 h-4" />
              Table
            </button>
            <button
              onClick={() => setView("card")}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-sm text-sm font-medium transition-colors",
                view === "card" ? "bg-gray-800 text-white" : "text-gray-400 hover:text-gray-200"
              )}
            >
              <LayoutGrid className="w-4 h-4" />
              Card
            </button>
          </div>
        </div>
      </div>

      <ScanFilters search={search} setSearch={setSearch} />

      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between bg-cyan-900/20 border border-cyan-800/30 rounded-lg p-3 px-4">
          <span className="text-sm font-medium text-cyan-400">{selectedIds.size} items selected</span>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-300 hover:text-white transition-colors">
              <Download className="w-4 h-4" /> Export Selected
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-400 hover:text-red-300 transition-colors">
              <Trash2 className="w-4 h-4" /> Delete Selected
            </button>
            <button 
              onClick={() => setSelectedIds(new Set())}
              className="text-sm text-gray-400 hover:text-gray-200 underline underline-offset-4"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {view === "table" ? (
        <div className="border border-gray-800 rounded-lg overflow-hidden bg-gray-900/50">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-400 uppercase bg-gray-800/50 border-b border-gray-800">
              <tr>
                <th className="px-4 py-3 w-12">
                  <input type="checkbox" className="rounded border-gray-700 bg-gray-800" checked={selectedIds.size === MOCK_DATA.length} onChange={toggleSelectAll} />
                </th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Result</th>
                <th className="px-4 py-3 font-medium">Confidence</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {MOCK_DATA.map((item) => (
                <tr key={item.id} className="hover:bg-gray-800/30 transition-colors group">
                  <td className="px-4 py-3">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-700 bg-gray-800"
                      checked={selectedIds.has(item.id)}
                      onChange={() => toggleSelect(item.id)}
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-200">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">{getTypeIcon(item.type)}</span>
                      {item.name}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-800 text-gray-300 border border-gray-700">
                      {item.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border", getResultColor(item.result))}>
                      {item.result}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-500" style={{ width: `${item.confidence}%` }} />
                      </div>
                      <span className="text-gray-400 text-xs">{item.confidence}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{item.date}</td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                      item.status === "Completed" ? "text-green-400" : item.status === "Processing" ? "text-amber-400" : "text-red-400"
                    )}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 text-gray-400 hover:text-cyan-400 hover:bg-gray-800 rounded-md transition-colors" title="Open Report">
                        <FolderOpen className="w-4 h-4" />
                      </button>
                      <button onClick={() => setRenameId(item.id)} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors" title="Rename">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors" title="Rescan">
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors" title="Export">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors" title="Share">
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-md transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {MOCK_DATA.map((item) => (
            <div key={item.id} className="flex flex-col bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden hover:border-gray-700 transition-colors">
              <div className="p-4 flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-gray-800 rounded-md text-cyan-400">
                      {getTypeIcon(item.type)}
                    </div>
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{item.type}</span>
                  </div>
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-700 bg-gray-800 mt-1"
                    checked={selectedIds.has(item.id)}
                    onChange={() => toggleSelect(item.id)}
                  />
                </div>
                <h3 className="text-base font-semibold text-gray-200 mb-2 truncate">{item.name}</h3>
                <div className="flex flex-col gap-2 mb-4">
                  <span className={cn("inline-flex items-center px-2 py-1 rounded text-xs font-medium border w-fit", getResultColor(item.result))}>
                    {item.result}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">Confidence:</span>
                    <span className="text-sm font-semibold text-gray-200">{item.confidence}%</span>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <span>{item.date}</span>
                    <span className={cn(
                      item.status === "Completed" ? "text-green-400" : item.status === "Processing" ? "text-amber-400" : "text-red-400"
                    )}>{item.status}</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 border-t border-gray-800 bg-gray-900/80 divide-x divide-gray-800">
                <button className="flex items-center justify-center py-2.5 text-gray-400 hover:text-cyan-400 hover:bg-gray-800 transition-colors" title="Open Report">
                  <FolderOpen className="w-4 h-4" />
                </button>
                <button className="flex items-center justify-center py-2.5 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors" title="Share">
                  <Share2 className="w-4 h-4" />
                </button>
                <button className="flex items-center justify-center py-2.5 text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-colors" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between py-4 text-sm text-gray-400">
        <div>
          Showing <span className="font-medium text-white">1</span> to <span className="font-medium text-white">20</span> of <span className="font-medium text-white">245</span> results
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select className="bg-gray-900 border border-gray-800 rounded px-2 py-1 outline-none text-white focus:border-cyan-500">
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-1 rounded hover:bg-gray-800 text-gray-500 hover:text-white disabled:opacity-50" disabled>
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button className="w-8 h-8 rounded bg-gray-800 text-white font-medium flex items-center justify-center">1</button>
            <button className="w-8 h-8 rounded hover:bg-gray-800 text-gray-400 font-medium flex items-center justify-center">2</button>
            <button className="w-8 h-8 rounded hover:bg-gray-800 text-gray-400 font-medium flex items-center justify-center">3</button>
            <span className="px-1">...</span>
            <button className="w-8 h-8 rounded hover:bg-gray-800 text-gray-400 font-medium flex items-center justify-center">13</button>
            <button className="p-1 rounded hover:bg-gray-800 text-gray-400 hover:text-white">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {renameId && (
        <RenameDialog 
          isOpen={!!renameId} 
          onClose={() => setRenameId(null)} 
          initialName={MOCK_DATA.find(d => d.id === renameId)?.name || ""}
          onRename={(newName) => {
            console.log("Renamed to", newName);
            setRenameId(null);
          }}
        />
      )}
    </div>
  );
}
