import type { HistoryItem, HistoryPage } from './history-types';
type State = {scans:HistoryItem[]; nextCursor:string|null; isGuest:boolean; loading:boolean; error:string|null};
export function createHistoryClient(fetcher: typeof fetch = fetch) {
  let state: State = {scans:[],nextCursor:null,isGuest:true,loading:true,error:null};
  let version = 0;
  const listeners = new Set<()=>void>();
  const set = (patch:Partial<State>)=>{state={...state,...patch};listeners.forEach(fn=>fn());};
  async function readResponse(response: Response) {
    const data = await response.json();
    if(!response.ok) throw new Error(data.error??'History request failed.');
    return data;
  }
  async function load(append=false) {
    if(append && (!state.nextCursor || state.loading)) return;
    const requestVersion = ++version;
    const cursor = append?state.nextCursor:null;
    set({loading:true,error:null,...(!append?{scans:[],nextCursor:null}:{})});
    try {
      const data:HistoryPage = await readResponse(await fetcher('/api/history'+(cursor?'?cursor='+encodeURIComponent(cursor):''),{cache:'no-store'}));
      if(requestVersion!==version) return;
      const prior = append?state.scans:[];
      const known = new Set(prior.map(scan=>scan.id));
      set({scans:[...prior,...data.items.filter(scan=>!known.has(scan.id))],isGuest:data.isGuest,nextCursor:data.nextCursor,loading:false});
    } catch(error) {
      if(requestVersion===version) set({loading:false,error:error instanceof Error?error.message:'Could not load history.'});
    }
  }
  async function remove(id?:string) {
    const requestVersion = version;
    try {
      await readResponse(await fetcher('/api/history'+(id?'/'+encodeURIComponent(id):''),{method:'DELETE'}));
      if(requestVersion!==version)return;
      set({scans:id?state.scans.filter(scan=>scan.id!==id):[],...(!id?{nextCursor:null}:{}),error:null});
    } catch(error) {
      if(requestVersion===version)set({error:error instanceof Error?error.message:'Could not delete history.'});
      throw error;
    }
  }
  return {read:()=>state,subscribe:(fn:()=>void)=>{listeners.add(fn);return()=>{listeners.delete(fn);};},
    refresh:()=>load(),loadMore:()=>load(true),deleteScan:(id:string)=>remove(id),clearScans:()=>remove()};
}
