import type { Scan } from '@prisma/client';
import { getAuthDatabase } from './auth-db';
import { ownerFilter, encodeHistoryCursor, decodeHistoryCursor, type ScanOwner } from './history-core';
import type { HistoryItem } from './history-types';

function item(row: Scan): HistoryItem {
  return {id:row.id,name:row.contentName,type:row.contentType==='video'?'video':row.contentType==='image'?'image':'text',
    module:row.modules[0]??row.contentType,result:row.result??'Inconclusive',confidence:row.confidenceScore??0,
    date:row.createdAt.toISOString(),status:row.status==='completed'?'completed':row.status==='failed'?'failed':'processing'};
}
export async function listScanHistory(owner: ScanOwner, cursor?: string) {
  const position = cursor ? decodeHistoryCursor(cursor) : null;
  const rows = await getAuthDatabase().scan.findMany({where:{...ownerFilter(owner),...(position?{OR:[
    {createdAt:{lt:position.createdAt}}, {createdAt:position.createdAt,id:{lt:position.id}},
  ]}:{})},orderBy:[{createdAt:'desc'},{id:'desc'}],take:21});
  const page = rows.slice(0,20);
  return {items:page.map(item),nextCursor:rows.length>20?encodeHistoryCursor(page[page.length-1]):null};
}
export async function getScanHistory(owner: ScanOwner,id: string) {
  const row = await getAuthDatabase().scan.findFirst({where:{id,...ownerFilter(owner)}});
  return row?{...item(row),snapshot:row.resultSnapshot}:null;
}
export async function deleteScanHistory(owner: ScanOwner,id?: string) {
  const result = await getAuthDatabase().scan.deleteMany({where:{...ownerFilter(owner),...(id?{id}:{})}});
  return result.count;
}
