import { createHash } from 'node:crypto';
import type { NextRequest } from 'next/server';
import { resolveScanOwner } from './scan-owner';
import { completeScan, findCompletedScan } from './scan-persistence';
import { HistoryError } from './history-core';
import { privateJson, historyFailure, requireHistoryOrigin } from './history-response';

async function fingerprint(request: Request, module: string) {
  const hash = createHash('sha256').update(module);
  if (request.headers.get('content-type')?.includes('multipart/form-data')) {
    const form = await request.clone().formData();
    const entries = [...form.entries()].sort(([a],[b])=>a.localeCompare(b));
    for (const [key,value] of entries) {
      hash.update(JSON.stringify([key,typeof value==='string'?'string':'file']));
      hash.update(typeof value==='string'?JSON.stringify(value):createHash('sha256').update(Buffer.from(await value.arrayBuffer())).digest('hex'));
    }
  } else {
    const body = await request.clone().json();
    // Canonicalize object keys, preserving array order.
    const stable = (value: unknown): unknown => Array.isArray(value)?value.map(stable):value && typeof value==='object'
      ?Object.fromEntries(Object.entries(value).sort(([a],[b])=>a.localeCompare(b)).map(([key,v])=>[key,stable(v)])):value;
    hash.update(JSON.stringify(stable(body)));
  }
  return hash.digest('hex');
}
export function withScanHistory(module: string, analyze: (request: NextRequest)=>Promise<Response>) {
  return async function POST(request: NextRequest): Promise<Response> {
    try {
      requireHistoryOrigin(request);
      const owner = await resolveScanOwner();
      const operationKey = request.headers.get('Idempotency-Key')??'';
      if (!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(operationKey)) {
        throw new HistoryError('A valid scan operation key is required. Reload the page and try again.',400);
      }
      let requestFingerprint: string;
      try { requestFingerprint = await fingerprint(request,module); }
      catch { throw new HistoryError('Invalid scan input.',400); }
      try {
        const existing = await findCompletedScan(owner,operationKey,requestFingerprint);
        if (existing) return privateJson({sources:[],sentenceBreakdown:[],faces:[],...existing.snapshot as object,
          scanId:existing.scanId,historySaved:true,statisticsRecorded:true,isReal:true,replayed:true});
      } catch(error) {
        if (error instanceof HistoryError) throw error;
        // Analysis can still run during a history outage, with explicit unsaved status.
      }
      const response = await analyze(request);
      if (!response.ok) return response;
      const data = await response.json();
      const isReal = data.isReal === true;
      if (!isReal) return privateJson({...data,scanId:undefined,isDemo:true,historySaved:false,statisticsRecorded:false});
      try {
        const saved = await completeScan({owner,operationKey,requestFingerprint,module,
          displayName:`${module.charAt(0).toUpperCase()+module.slice(1)} analysis`,response:data,isReal});
        return privateJson({...data,...(saved!.replayed ? {sources:[],sentenceBreakdown:[],faces:[],...saved!.snapshot as object} : {}),scanId:saved!.scanId,historySaved:true,statisticsRecorded:true});
      } catch(error) {
        if (error instanceof HistoryError) throw error;
        return privateJson({...data,scanId:undefined,historySaved:false,statisticsRecorded:false,
          historyWarning:'Analysis completed, but saving failed. This result will not appear in History.'});
      }
    } catch(error) { return historyFailure(error); }
  };
}
