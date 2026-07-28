'use client';

import { 
  FileText, 
  Image as ImageIcon, 
  Video, 
  ExternalLink, 
  RefreshCw, 
  Trash2,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type ScanResultStatus = 'Likely human-created' | 'Likely AI-generated' | 'Likely AI-edited' | 'Likely AI-enhanced' | 'Mixed or partially synthetic' | 'Inconclusive';
export type ScanType = 'text' | 'image' | 'video';

export interface Scan {
  id: string;
  name: string;
  type: ScanType;
  result: ScanResultStatus;
  confidence: number;
  date: string;
  status: 'completed' | 'processing' | 'failed';
}

interface RecentScansTableProps {
  scans: Scan[];
}

export function RecentScansTable({ scans }: RecentScansTableProps) {
  const getResultBadge = (result: ScanResultStatus) => {
    switch (result) {
      case 'Likely human-created':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{result}</span>;
      case 'Likely AI-generated':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">{result}</span>;
      case 'Likely AI-edited':
      case 'Likely AI-enhanced':
      case 'Mixed or partially synthetic':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">{result}</span>;
      case 'Inconclusive':
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-500/10 text-gray-400 border border-gray-500/20">{result}</span>;
    }
  };

  const getTypeIcon = (type: ScanType) => {
    switch (type) {
      case 'text': return <FileText className="w-4 h-4 text-blue-400" />;
      case 'image': return <ImageIcon className="w-4 h-4 text-purple-400" />;
      case 'video': return <Video className="w-4 h-4 text-pink-400" />;
    }
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-gray-400 uppercase bg-[#0a0f1e] border-b border-[#1f2937]">
          <tr>
            <th className="px-4 py-3 font-medium flex items-center gap-1 cursor-pointer hover:text-gray-300">
              Name <ChevronDown className="w-3 h-3" />
            </th>
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 font-medium">Result</th>
            <th className="px-4 py-3 font-medium hidden md:table-cell">Confidence</th>
            <th className="px-4 py-3 font-medium hidden sm:table-cell">Date</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1f2937]">
          {scans.map((scan) => (
            <tr key={scan.id} className="bg-[#111827] hover:bg-[#1f2937]/50 transition-colors">
              <td className="px-4 py-3 font-medium text-white truncate max-w-[150px] sm:max-w-[200px]">
                {scan.name}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2 capitalize text-gray-300">
                  {getTypeIcon(scan.type)}
                  <span className="hidden sm:inline">{scan.type}</span>
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {getResultBadge(scan.result)}
              </td>
              <td className="px-4 py-3 text-gray-300 hidden md:table-cell">
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-[#1f2937] rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full",
                        scan.confidence > 80 ? "bg-rose-500" : scan.confidence > 50 ? "bg-amber-500" : "bg-emerald-500"
                      )}
                      style={{ width: `${scan.confidence}%` }}
                    />
                  </div>
                  <span className="text-xs">{scan.confidence}%</span>
                </div>
              </td>
              <td className="px-4 py-3 text-gray-400 text-xs hidden sm:table-cell">
                {scan.date}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button className="p-1.5 text-gray-400 hover:text-white hover:bg-[#1f2937] rounded-md transition-colors" title="Open Report">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 text-gray-400 hover:text-white hover:bg-[#1f2937] rounded-md transition-colors" title="Rescan">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-[#1f2937] rounded-md transition-colors" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
