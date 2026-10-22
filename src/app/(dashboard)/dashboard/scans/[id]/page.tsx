'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { HistoryItem } from '@/lib/history-types';
import { DisclaimerBanner } from '@/components/detection/disclaimer-banner';

type SavedScan = HistoryItem & {snapshot: Record<string,unknown> | null};
function label(key:string) {return key.replace(/([a-z])([A-Z])/g,'$1 $2').replace(/^./,c=>c.toUpperCase());}
export default function ScanResultPage() {
  const {id} = useParams<{id:string}>();
  return <SavedScanResult key={id} id={id}/>;
}
function SavedScanResult({id}:{id:string}) {
  const router=useRouter();
  const [scan,setScan]=useState<SavedScan|null>(null);
  const [error,setError]=useState<string|null>(null);
  const [loading,setLoading]=useState(true);
  const [confirm,setConfirm]=useState(false);
  const [deleting,setDeleting]=useState(false);
  const [attempt,setAttempt]=useState(0);
  useEffect(()=>{
    const controller=new AbortController();
    void fetch('/api/history/'+encodeURIComponent(id),{cache:'no-store',signal:controller.signal}).then(async response=>{
      const data=await response.json();if(!response.ok)throw Error(data.error??'Could not load this result.');
      if(!controller.signal.aborted)setScan(data);
    }).catch(error=>{if(!controller.signal.aborted)setError(error.message);}).finally(()=>{if(!controller.signal.aborted)setLoading(false);});
    return()=>controller.abort();
  },[id,attempt]);
  async function remove() {
    setDeleting(true);setError(null);
    try {const response=await fetch('/api/history/'+encodeURIComponent(id),{method:'DELETE'});const data=await response.json();if(!response.ok)throw Error(data.error??'Delete failed.');window.dispatchEvent(new Event('aishield-history-changed'));router.push('/dashboard/history');}
    catch(error){setError(error instanceof Error?error.message:'Delete failed.');setDeleting(false);}
  }
  const snapshot=scan?.snapshot;
  const signals=Array.isArray(snapshot?.signals)?snapshot.signals as Array<{name:string;score:number}>:[];
  const breakdown=snapshot?.breakdown??snapshot?.stats;
  return <div className="space-y-6 pb-12">
    <Link href="/dashboard/history" className="text-cyan-azure">Back to History</Link>
    {loading && <p role="status">Loading saved analysis...</p>}
    {error && <div role="alert" className="rounded-xl border border-amber-500/30 p-4 text-amber-200">{error} <button className="underline ml-3" onClick={()=>{setLoading(true);setScan(null);setError(null);setAttempt(n=>n+1);}}>Try again</button></div>}
    {scan && <>
      {typeof snapshot?.providerWarning==='string' && <p role="status" className="rounded-xl border border-amber-500/30 p-4 text-amber-200">{snapshot.providerWarning}</p>}
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <div className="flex flex-wrap justify-between gap-4"><div><h1 className="text-2xl font-bold">{scan.name}</h1><p className="text-sm text-air-sup-blue mt-2">{label(scan.module)} - {new Date(scan.date).toLocaleString()}</p></div>
          <div className="text-right"><h2 className="text-xl font-semibold">{scan.result}</h2><p className="text-air-sup-blue">{scan.module==='plagiarism'?'Similarity':'Score'}: {scan.confidence}%</p></div></div>
        <div className="flex flex-wrap gap-4 text-sm"><Link href="/dashboard/new-scan" className="text-cyan-azure">Start a new analysis</Link>
          {confirm?<><span>Delete this saved result?</span><button disabled={deleting} className="text-red-400" onClick={()=>void remove()}>{deleting?'Deleting...':'Confirm delete'}</button><button disabled={deleting} onClick={()=>setConfirm(false)}>Cancel</button></>:<button onClick={()=>setConfirm(true)} className="text-red-400">Delete result</button>}</div>
      </div>
      {signals.length>0 && <section className="glass-card rounded-2xl p-6 space-y-3"><h2 className="font-semibold">Detection signals</h2>{signals.map((signal,index)=><div key={index} className="flex justify-between gap-4 text-sm"><span>{signal.name}</span><span>{Number.isFinite(signal.score)?Math.round(signal.score*100)+'%':'?'}</span></div>)}</section>}
      {breakdown && typeof breakdown==='object' ? <section className="glass-card rounded-2xl p-6 space-y-3"><h2 className="font-semibold">Analysis details</h2>{Object.entries(breakdown).filter(([,value])=>['number','string','boolean'].includes(typeof value)).map(([key,value])=><div key={key} className="flex justify-between gap-4 text-sm"><span>{label(key)}</span><span>{snapshot?.deepfakeAnalyzed===false && ['deepfakeScore','facesDetected'].includes(key)?'Not checked':String(value)}</span></div>)}</section>:null}
      {Array.isArray(snapshot?.limitations) && <section className="glass-card rounded-2xl p-6"><h2 className="font-semibold mb-3">Limitations</h2><ul className="list-disc pl-5 space-y-2 text-sm text-air-sup-blue">{snapshot.limitations.map((value,index)=><li key={index}>{String(value)}</li>)}</ul></section>}
      <p className="text-sm text-air-sup-blue">Uploaded files and submitted text are not retained in this report. Supply the input again to run a new analysis.</p>
      <DisclaimerBanner/>
    </>}
  </div>;
}
