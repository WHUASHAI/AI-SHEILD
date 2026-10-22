import type { Scan } from '@/components/dashboard/recent-scans-table';

export const MAX_RECENT_SCANS = 20;
export const EMPTY_SCANS: Scan[] = [];
const USER_STORAGE_PREFIX = 'aishield_user_scans_';
type HistoryStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export function createScanHistoryStore(storage?: HistoryStorage) {
  // This instance belongs to one loaded document, so guest data disappears on reload.
  let guestScans: Scan[] = EMPTY_SCANS;
  const accounts = new Map<string, Scan[]>();
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach(listener => listener());

  function read(owner: string | null): Scan[] {
    if (!owner) return guestScans;
    if (!accounts.has(owner)) {
      let scans: Scan[] = EMPTY_SCANS;
      try {
        const parsed: unknown = JSON.parse(storage?.getItem(`${USER_STORAGE_PREFIX}${owner}`) ?? '[]');
        if (Array.isArray(parsed)) {
          scans = parsed.filter((scan): scan is Scan => Boolean(scan) && typeof scan.id === 'string'
            && typeof scan.name === 'string' && typeof scan.result === 'string').slice(0, MAX_RECENT_SCANS);
        }
      } catch { /* Invalid or unavailable browser storage starts with empty history. */ }
      accounts.set(owner, scans);
    }
    return accounts.get(owner)!;
  }

  return {
    read,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    add(owner: string | null, scan: Scan) {
      const updated = [scan, ...read(owner)].slice(0, MAX_RECENT_SCANS);
      if (owner) {
        accounts.set(owner, updated);
        try { storage?.setItem(`${USER_STORAGE_PREFIX}${owner}`, JSON.stringify(updated)); } catch { /* Keep in-memory history if storage is unavailable. */ }
      } else {
        guestScans = updated;
      }
      notify();
    },
    clear(owner: string | null) {
      if (owner) {
        accounts.set(owner, EMPTY_SCANS);
        try { storage?.removeItem(`${USER_STORAGE_PREFIX}${owner}`); } catch { /* Clear the current document even if storage is unavailable. */ }
      } else {
        guestScans = EMPTY_SCANS;
      }
      notify();
    },
  };
}
