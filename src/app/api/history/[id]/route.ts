import { resolveScanOwner } from '@/lib/scan-owner';
import { getScanHistory, deleteScanHistory } from '@/lib/scan-history-repository';
import { privateJson, historyFailure, requireHistoryOrigin } from '@/lib/history-response';
export const runtime = 'nodejs';
type Context = {params:Promise<{id:string}>};
export async function GET(_request: Request,context: Context) {
  try {
    const {id} = await context.params;
    const scan = await getScanHistory(await resolveScanOwner(),id);
    return scan?privateJson(scan):privateJson({error:'Scan not found.'},404);
  } catch(error) {return historyFailure(error);}
}
export async function DELETE(request: Request,context: Context) {
  try {
    requireHistoryOrigin(request);
    const {id} = await context.params;
    const count = await deleteScanHistory(await resolveScanOwner(),id);
    return count?privateJson({deleted:count}):privateJson({error:'Scan not found.'},404);
  } catch(error) {return historyFailure(error);}
}
