'use client';

import React from 'react';
import { Clock, Info } from 'lucide-react';

export default function HistoryPage() {
  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-azure/20 to-air-sup-blue/20 border border-cyan-azure/30 flex items-center justify-center">
          <Clock className="w-6 h-6 text-cyan-azure" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Scan History</h1>
          <p className="text-sm text-air-sup-blue mt-0.5">View your past AI detection analysis reports.</p>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-12 text-center">
          <Info className="w-12 h-12 text-air-sup-blue mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground">No History Yet</h3>
          <p className="text-sm text-air-sup-blue mt-2">Run your first AI analysis to see it appear here.</p>
      </div>
    </div>
  );
}