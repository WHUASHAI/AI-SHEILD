'use client';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { createHistoryClient } from './history-client';

export function useRecentScans() {
  const [client] = useState(()=>createHistoryClient());
  const state = useSyncExternalStore(client.subscribe,client.read,client.read);
  useEffect(()=>{
    void client.refresh();
    const refresh = ()=>{void client.refresh();};
    window.addEventListener('focus',refresh);
    window.addEventListener('aishield-history-changed',refresh);
    const channel = typeof BroadcastChannel==='undefined'?null:new BroadcastChannel('next-auth');
    if(channel)channel.onmessage=refresh;
    return()=>{window.removeEventListener('focus',refresh);window.removeEventListener('aishield-history-changed',refresh);channel?.close();};
  },[client]);
  return {...state,refresh:client.refresh,loadMore:client.loadMore,deleteScan:client.deleteScan,clearScans:client.clearScans,
    isClient:!state.loading,maxScans:20};
}
