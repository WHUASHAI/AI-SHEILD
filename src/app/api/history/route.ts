import { resolveScanOwner } from '@/lib/scan-owner';
import { listScanHistory, deleteScanHistory } from '@/lib/scan-history-repository';
import { privateJson, historyFailure, requireHistoryOrigin } from '@/lib/history-response';
export const runtime = 'nodejs';
export async function GET(request: Request) {
  try {
    const owner = await resolveScanOwner();
    const cursor = new URL(request.url).searchParams.get('cursor') || undefined;
    return privateJson({...await listScanHistory(owner,cursor),isGuest:owner.kind==='guest'});
  } catch(error) {return historyFailure(error);}
}
export async function DELETE(request: Request) {
  try {
    requireHistoryOrigin(request);
    return privateJson({deleted:await deleteScanHistory(await resolveScanOwner())});
  } catch(error) {return historyFailure(error);}
}
