'use client';

import { useState, useEffect, useCallback, useRef, useSyncExternalStore } from 'react';
import { getSession } from 'next-auth/react';
import type { Scan } from '@/components/dashboard/recent-scans-table';
import { createScanHistoryStore, EMPTY_SCANS, MAX_RECENT_SCANS } from './scan-history-store';
import { isGuestBrowser } from './guest-mode';

function browserStorage() {
  try { return typeof window === 'undefined' ? undefined : window.localStorage; }
  catch { return undefined; }
}

// One client module instance survives Next.js navigation, but not a full refresh.
const historyStore = createScanHistoryStore(browserStorage());

async function resolveOwner(): Promise<string | null> {
  if (isGuestBrowser(document.cookie)) return null;
  const session = await getSession();
  return session?.user?.id || session?.user?.email || null;
}

export function useRecentScans() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const identity = useRef<Promise<string | null> | null>(null);

  useEffect(() => {
    let mounted = true;
    // The old guest storage survived refresh. Never restore it into the new page-only history.
    try { sessionStorage.removeItem('aishield_guest_scans'); } catch { /* Storage is optional. */ }
    identity.current = resolveOwner().catch(() => null);
    void identity.current.then(owner => {
      if (mounted) { setUserId(owner); setIsClient(true); }
    });
    return () => { mounted = false; };
  }, []);

  const scans = useSyncExternalStore(
    historyStore.subscribe,
    () => isClient ? historyStore.read(userId) : EMPTY_SCANS,
    () => EMPTY_SCANS,
  );

  const addScan = useCallback(async (newScan: Omit<Scan, 'id' | 'date' | 'status'>) => {
    // Wait for identity so a fast result cannot be saved under the wrong account.
    const owner = await (identity.current ?? resolveOwner().catch(() => null));
    historyStore.add(owner, {
      ...newScan,
      id: crypto.randomUUID(),
      date: new Date().toLocaleString(),
      status: 'completed',
    });
  }, []);

  const clearScans = useCallback(async () => {
    const owner = await (identity.current ?? resolveOwner().catch(() => null));
    historyStore.clear(owner);
  }, []);

  return { scans, addScan, clearScans, isGuest: userId === null, isClient, maxScans: MAX_RECENT_SCANS };
}
