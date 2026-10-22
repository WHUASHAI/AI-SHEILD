'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Clock, Plus } from 'lucide-react';
import { RecentScansTable } from '@/components/dashboard/recent-scans-table';
import { useRecentScans } from '@/lib/use-recent-scans';

export default function HistoryPage() {
  const {scans,isGuest,loading,error,nextCursor,loadMore,refresh,deleteScan,clearScans} = useRecentScans();
  const [confirm,setConfirm] = useState(false);
  const [deleting,setDeleting] = useState(false);
  async function clear() {
    setDeleting(true);
    try {await clearScans();setConfirm(false);} catch {/* The hook displays the failure. */}
    finally {setDeleting(false);}
  }
  return <div className="space-y-6 pb-12">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div><h1 className="text-2xl font-bold flex items-center gap-3"><Clock />Scan History</h1>
        <p className="text-sm text-air-sup-blue mt-2">Your saved analyses, 20 results per page.</p></div>
      <Link href="/dashboard/new-scan" className="inline-flex items-center gap-2 rounded-xl bg-cyan-azure/20 px-4 py-2"><Plus size={16}/>New Scan</Link>
    </div>
    {!loading && !error && <p className="glass-card rounded-xl p-4 text-sm text-air-sup-blue">{isGuest
      ? 'Guest results are saved for this browser. Clearing its guest cookie removes access. Guest history stays separate when you sign in.'
      : 'Your history is saved to your account across visits and devices. Results remain until you delete them.'}</p>}
    {error && <div role="alert" className="rounded-xl border border-amber-500/30 p-4 text-amber-200">{error} <button onClick={()=>void refresh()} className="underline ml-3">Try again</button></div>}
    {scans.length>0 && <>
      <div className="flex flex-wrap justify-between items-center gap-3 text-sm">
        <span>{scans.length} results loaded</span>
        {confirm?<div className="flex gap-3"><span>Delete all your saved results?</span><button disabled={deleting} onClick={()=>void clear()} className="text-red-400">{deleting?'Deleting...':'Confirm delete all'}</button><button disabled={deleting} onClick={()=>setConfirm(false)}>Cancel</button></div>
          :<button onClick={()=>setConfirm(true)} className="text-red-400">Clear History</button>}
      </div>
      <div className="glass-card rounded-2xl overflow-hidden"><RecentScansTable scans={scans} onDelete={deleteScan}/></div>
    </>}
    {loading && <p role="status" className="p-8 text-center text-air-sup-blue">Loading history...</p>}
    {!loading && !error && scans.length===0 && <div className="glass-card rounded-2xl p-12 text-center"><h2 className="text-lg font-semibold">No History Yet</h2><p className="text-air-sup-blue mt-2">Complete a real analysis to save your first result.</p></div>}
    {nextCursor && <button disabled={loading} onClick={()=>void loadMore()} className="rounded-xl border border-cyan-azure/30 px-5 py-3 disabled:opacity-50">Load next 20 results</button>}
  </div>;
}
