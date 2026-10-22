import { createHash } from 'node:crypto';
import type { Prisma } from '@prisma/client';
import { getAuthDatabase } from './auth-db';
import { ownerFilter, resultSnapshot, HistoryError, type ScanOwner } from './history-core';
import { classifyScanResult } from './platform-statistics';

export type CompletedScanInput = {
  owner: ScanOwner; operationKey: string; requestFingerprint: string;
  module: string; displayName: string; response: Record<string, unknown>; isReal: boolean;
};
function receiptId(owner: ScanOwner, key: string) {
  ownerFilter(owner);
  return createHash('sha256').update(JSON.stringify([owner.kind,owner.id,key])).digest('hex');
}
export async function findCompletedScan(owner: ScanOwner, key: string, fingerprint: string) {
  const db = getAuthDatabase();
  const receipt = await db.scanCompletion.findUnique({where:{id:receiptId(owner,key)}});
  if (!receipt) return null;
  if (receipt.requestFingerprint !== fingerprint) throw new HistoryError('This operation key was already used for different input. Start a new scan.',409);
  const scan = await db.scan.findFirst({where:{id:receipt.scanId,...ownerFilter(owner)}});
  if (!scan) throw new HistoryError('This scan was deleted. Start a new scan to analyze again.',410);
  return {scanId:scan.id, snapshot:scan.resultSnapshot, replayed:true};
}
export async function completeScan(input: CompletedScanInput) {
  if (!input.isReal) return null;
  const id = receiptId(input.owner,input.operationKey);
  const db = getAuthDatabase();
  return db.$transaction(async tx => {
    // Serialize the same operation across concurrent server instances.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${id}, 0))`;
    const receipt = await tx.scanCompletion.findUnique({where:{id}});
    if (receipt) {
      if (receipt.requestFingerprint !== input.requestFingerprint) throw new HistoryError('Operation key conflicts with a previous scan.',409);
      const scan = await tx.scan.findFirst({where:{id:receipt.scanId,...ownerFilter(input.owner)}});
      if (!scan) throw new HistoryError('This scan was deleted. Start a new scan.',410);
      return {scanId:scan.id,snapshot:scan.resultSnapshot,replayed:true};
    }
    const snapshot = resultSnapshot(input.response);
    const score = Number(input.response.confidence ?? input.response.overallSimilarity ?? 0);
    const verdict = String(input.response.label ?? input.response.result ?? input.response.verdict ?? 'Inconclusive');
    const scan = await tx.scan.create({data:{
      ...ownerFilter(input.owner),contentName:input.displayName.slice(0,200),
      contentType:['image','deepfake'].includes(input.module)?'image':input.module==='video'?'video':'text',
      modules:[input.module],status:'completed',result:verdict,
      confidenceScore:Number.isFinite(score)?Math.min(100,Math.max(0,score)):0,
      resultSnapshot:snapshot as Prisma.InputJsonValue,completedAt:new Date(),
    }});
    await tx.scanCompletion.create({data:{id,requestFingerprint:input.requestFingerprint,scanId:scan.id}});
    const day = new Date().toISOString().slice(0,10);
    const category = classifyScanResult(input.module==='plagiarism'?'inconclusive':input.response.result);
    await tx.$executeRaw`
      INSERT INTO "ScanStatisticsDay" ("day", "totalScans", "aiDetected", "humanVerified")
      VALUES (${day}::date, 1, ${category==='ai'?1:0}, ${category==='human'?1:0})
      ON CONFLICT ("day") DO UPDATE SET
        "totalScans" = "ScanStatisticsDay"."totalScans" + 1,
        "aiDetected" = "ScanStatisticsDay"."aiDetected" + EXCLUDED."aiDetected",
        "humanVerified" = "ScanStatisticsDay"."humanVerified" + EXCLUDED."humanVerified"
    `;
    return {scanId:scan.id,snapshot:scan.resultSnapshot,replayed:false};
  },{timeout:10000});
}
