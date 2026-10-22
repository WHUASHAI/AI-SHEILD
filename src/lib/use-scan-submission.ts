'use client';
import { useCallback, useRef, useState } from 'react';

export function useScanSubmission() {
  const [historyNotice,setHistoryNotice] = useState<string|null>(null);
  const inFlight=useRef(false);
  const submitScan = useCallback(async (url:string,init:RequestInit)=>{
    if(inFlight.current)throw new Error('A scan is already running.');
    inFlight.current=true;
    try {
    setHistoryNotice(null);
    const headers = new Headers(init.headers);
    headers.set('Idempotency-Key',crypto.randomUUID());
    const options = {...init,headers};
    const response=await fetch(url,options);
    if(response.ok) {
      const result = await response.clone().json();
      const notice=result.isDemo?'Demonstration result. It is not saved or included in website statistics.'
        :result.historySaved?(result.replayed?'Loaded your saved result. Submitted text and source excerpts are not retained.':'Saved to your private History.')
        :'Analysis completed, but the result could not be saved. Keep this page open if you need it.';
      setHistoryNotice(notice+(result.providerWarning?' '+result.providerWarning:''));
      if(result.historySaved)window.dispatchEvent(new Event('aishield-history-changed'));
    }
    return response;
    } finally {inFlight.current=false;}
  },[]);
  return {submitScan,historyNotice};
}
