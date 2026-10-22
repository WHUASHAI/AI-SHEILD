import { createHash, randomBytes } from 'node:crypto';

export type ScanOwner = { kind: 'user' | 'guest'; id: string };
export class HistoryError extends Error {
  status: number;
  constructor(message: string, status: number) { super(message); this.status = status; }
}
export function newGuestToken() { return randomBytes(32).toString('hex'); }
export function guestTokenHash(token: string | undefined) {
  return token && /^[a-f0-9]{64}$/.test(token) ? createHash('sha256').update(token).digest('hex') : null;
}
export function ownerFilter(owner: ScanOwner) {
  if (!owner.id || !['user', 'guest'].includes(owner.kind)) throw new HistoryError('Invalid scan owner.', 401);
  return owner.kind === 'user' ? { userId: owner.id, guestSessionId: null } : { userId: null, guestSessionId: owner.id };
}
export function parseVerifiedSubject(subject: string) {
  const separator = subject.indexOf(':');
  const provider = subject.slice(0, separator);
  const id = subject.slice(separator + 1);
  if (separator < 0 || !id || !['google', 'credentials'].includes(provider)) throw new HistoryError('Sign in again.', 401);
  return { provider, id };
}
export function resultSnapshot(value: Record<string, unknown>): Record<string, unknown> {
  const keys = ['status', 'provider', 'result', 'label', 'verdict', 'confidence', 'overallScore',
    'overallSimilarity', 'aiProbabilityScore', 'plagiarismScore', 'language', 'sourceModel', 'wordCount',
    'breakdown', 'matchTypeBreakdown', 'stats', 'timeline', 'limitations', 'disclaimer', 'modelVersion', 'mode', 'analyzedAt',
    'totalSourcesChecked', 'verdictColor', 'isVideo', 'isPlagiarized', 'providerWarning', 'deepfakeAnalyzed'];
  const result: Record<string, unknown> = {};
  for (const key of keys) if (value[key] !== undefined) result[key] = value[key];
  if (Array.isArray(value.signals)) result.signals = value.signals.map(signal => ({
    name: String(signal.name).slice(0, 120), score: Number(signal.score),
  }));
  return JSON.parse(JSON.stringify(result));
}
export function encodeHistoryCursor(row: { id: string; createdAt: Date }) {
  return Buffer.from(JSON.stringify([row.createdAt.toISOString(), row.id])).toString('base64url');
}
export function decodeHistoryCursor(cursor: string) {
  try {
    if (cursor.length > 1024) throw new Error();
    const [date, id] = JSON.parse(Buffer.from(cursor, 'base64url').toString());
    const createdAt = new Date(date);
    if (typeof id !== 'string' || !id || id.length > 128 || typeof date !== 'string' || !Number.isFinite(createdAt.getTime())) throw new Error();
    return { createdAt, id };
  } catch { throw new HistoryError('Invalid history cursor.', 400); }
}
