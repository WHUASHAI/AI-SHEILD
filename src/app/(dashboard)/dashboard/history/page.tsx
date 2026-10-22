'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Clock,
  Info,
  Sparkles,
  Trash2,
  Plus,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RecentScansTable } from '@/components/dashboard/recent-scans-table';
import { useRecentScans } from '@/lib/use-recent-scans';

export default function HistoryPage() {
  const { scans, isGuest, clearScans, maxScans, isClient } = useRecentScans();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleClear = () => {
    clearScans();
    setShowClearConfirm(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-azure/20 to-air-sup-blue/20 border border-cyan-azure/30 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6 text-cyan-azure" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Scan History</h1>
            <p className="text-sm text-air-sup-blue mt-0.5">
              {isGuest
                ? 'Temporary session history for this visit.'
                : `Account history (up to ${maxScans} recent scans).`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {scans.length > 0 && (
            <>
              {showClearConfirm ? (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleClear}
                    className="text-xs h-9 bg-red-600/80 hover:bg-red-600"
                  >
                    Confirm Clear
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowClearConfirm(false)}
                    className="text-xs h-9 text-air-sup-blue hover:text-white"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowClearConfirm(true)}
                  className="text-xs h-9 border-cyan-azure/20 text-air-sup-blue hover:text-white hover:bg-white/5"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5 text-red-400" />
                  Clear History
                </Button>
              )}
            </>
          )}

          <Button
            size="sm"
            asChild
            className="text-xs h-9 bg-gradient-to-r from-cyan-azure to-air-sup-blue hover:from-cyan-azure-dark hover:to-cyan-azure text-white border-0 shadow-palette-md px-4"
          >
            <Link href="/dashboard/new-scan">
              <Plus className="w-4 h-4 mr-1.5" />
              New Scan
            </Link>
          </Button>
        </div>
      </div>

      {/* Guest vs Account Notice Banner */}
      {isClient && (
        <div
          className={`rounded-2xl p-4 border transition-all ${
            isGuest
              ? 'bg-amber-500/10 border-amber-500/20 text-amber-200'
              : 'bg-cyan-azure/10 border-cyan-azure/25 text-air-sup-blue'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              {isGuest ? (
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-cyan-azure shrink-0 mt-0.5" />
              )}
              <div className="text-xs leading-relaxed">
                {isGuest ? (
                  <>
                    <strong className="text-amber-300 font-semibold">Guest Mode Active: </strong>
                    Your latest {maxScans} scans stay available during this visit. Refreshing or closing the page clears guest history.
                  </>
                ) : (
                  <>
                    <strong className="text-white font-semibold">Account History Active: </strong>
                    Your latest <strong>{scans.length} / {maxScans}</strong> scans are saved in this browser and remain after refresh or reopening with the same Google account.
                  </>
                )}
              </div>
            </div>

            {isGuest && (
              <Button
                size="sm"
                variant="outline"
                asChild
                className="shrink-0 h-8 text-xs border-amber-400/40 text-amber-300 hover:bg-amber-400/15"
              >
                <Link href="/sign-in">
                  Sign In to Keep Scans
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Scans Content */}
      {isClient && scans.length > 0 ? (
        <div className="space-y-4">
          <RecentScansTable scans={scans} />
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-12 text-center space-y-4 border border-cyan-azure/15">
          <div className="w-14 h-14 rounded-2xl bg-cyan-azure/10 border border-cyan-azure/20 flex items-center justify-center mx-auto text-cyan-azure">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">No History Yet</h3>
            <p className="text-sm text-air-sup-blue/70 mt-1 max-w-md mx-auto">
              Run your first AI detection scan to see your detailed verdict, confidence score, and forensic report card here.
            </p>
          </div>
          <div className="pt-2">
            <Button
              asChild
              className="bg-gradient-to-r from-cyan-azure to-air-sup-blue hover:from-cyan-azure-dark hover:to-cyan-azure text-white border-0 shadow-palette-md px-6"
            >
              <Link href="/dashboard/new-scan">
                <Sparkles className="w-4 h-4 mr-2" />
                Run Your First Scan
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
