"use client";

import React from "react";
import { Search, FilterX } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScanFiltersProps {
  search: string;
  setSearch: (val: string) => void;
}

export default function ScanFilters({ search, setSearch }: ScanFiltersProps) {
  return (
    <div className="flex flex-col gap-4 bg-gray-900/50 border border-gray-800 rounded-lg p-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search by name..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-md text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
          />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <select className="bg-gray-800/50 border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-cyan-500 min-w-[130px]">
            <option value="">Content Type (All)</option>
            <option value="text">Text</option>
            <option value="image">Image</option>
            <option value="video">Video</option>
            <option value="url">URL</option>
          </select>
          
          <select className="bg-gray-800/50 border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-cyan-500 min-w-[130px]">
            <option value="">Result (All)</option>
            <option value="human">Likely Human</option>
            <option value="ai">Likely AI-Generated</option>
            <option value="edited">Likely AI-Edited</option>
            <option value="enhanced">Likely AI-Enhanced</option>
            <option value="mixed">Mixed</option>
            <option value="inconclusive">Inconclusive</option>
          </select>
          
          <select className="bg-gray-800/50 border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-cyan-500 min-w-[130px]">
            <option value="">Date (All Time)</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="custom">Custom Range</option>
          </select>
          
          <select className="bg-gray-800/50 border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-cyan-500 min-w-[130px]">
            <option value="">Status (All)</option>
            <option value="completed">Completed</option>
            <option value="processing">Processing</option>
            <option value="failed">Failed</option>
          </select>

          <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-md transition-colors whitespace-nowrap">
            <FilterX className="w-4 h-4" />
            Clear
          </button>
        </div>
      </div>
      
      <div className="flex items-center gap-4 border-t border-gray-800 pt-3 mt-1">
        <span className="text-sm text-gray-400">Confidence Range:</span>
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <span className="text-xs text-gray-500 w-8 text-right">0%</span>
          <input type="range" min="0" max="100" defaultValue="50" className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
          <span className="text-xs text-gray-500 w-8">100%</span>
        </div>
        
        <div className="ml-auto flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-medium border border-cyan-500/30">
            3
          </span>
          <span className="text-sm text-gray-400">active filters</span>
        </div>
      </div>
    </div>
  );
}
