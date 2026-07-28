'use client';

import { 
  Activity, 
  ArrowRight,
  Plus
} from 'lucide-react';
import { RecentScansTable, Scan } from '@/components/dashboard/recent-scans-table';
import { EmptyState } from '@/components/dashboard/empty-state';
import Link from 'next/link';
import { useState } from 'react';

const MOCK_SCANS: Scan[] = [
  { id: '1', name: 'essay_final_v2.pdf', type: 'text', result: 'Likely AI-generated', confidence: 92, date: '2 hrs ago', status: 'completed' },
  { id: '2', name: 'profile_pic.jpg', type: 'image', result: 'Likely human-created', confidence: 15, date: '4 hrs ago', status: 'completed' },
  { id: '3', name: 'interview_clip.mp4', type: 'video', result: 'Mixed or partially synthetic', confidence: 65, date: '1 day ago', status: 'completed' },
  { id: '4', name: 'article_draft.docx', type: 'text', result: 'Likely AI-edited', confidence: 45, date: '2 days ago', status: 'completed' },
  { id: '5', name: 'unknown_source.png', type: 'image', result: 'Inconclusive', confidence: 50, date: '2 days ago', status: 'completed' },
];

export default function DashboardPage() {
  const [hasScans] = useState(true); // Toggle to false to see empty state

  if (!hasScans) {
    return (
      <div className="max-w-4xl mx-auto mt-12">
        <EmptyState 
          icon={<Activity className="w-8 h-8" />}
          title="Welcome to AI Sheild"
          description="You haven't run any content scans yet. Start by scanning text, images, or videos to detect AI generation."
          action={{ label: "Start Your First Scan", href: "/dashboard/new-scan" }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Scans</h1>
          <p className="text-gray-400 text-sm mt-1">Manage and view your content analysis results.</p>
        </div>
        <Link 
          href="/dashboard/new-scan"
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded-md transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Scan
        </Link>
      </div>

      {/* Recent Scans Table */}
      <div className="bg-[#111827] border border-[#1f2937] rounded-xl overflow-hidden flex flex-col">
        <div className="p-5 border-b border-[#1f2937] flex items-center justify-between">
          <h3 className="text-lg font-medium text-white">Recent Scans</h3>
          <Link href="/dashboard/history" className="text-sm text-[#06b6d4] hover:text-[#0891b2] flex items-center gap-1 transition-colors">
            View all history <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <RecentScansTable scans={MOCK_SCANS} />
      </div>
    </div>
  );
}
