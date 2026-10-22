'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSession } from 'next-auth/react';
import { Scan } from '@/components/dashboard/recent-scans-table';

const GUEST_STORAGE_KEY = 'aishield_guest_scans';
const USER_STORAGE_PREFIX = 'aishield_user_scans_';
const MAX_USER_SCANS = 20;

export function useRecentScans() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isGuest, setIsGuest] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    let mounted = true;

    async function init() {
      try {
        const session = await getSession();
        if (!mounted) return;

        const currentUserId = session?.user?.id || session?.user?.email || null;
        setUserId(currentUserId);

        if (currentUserId) {
          setIsGuest(false);
          const userKey = `${USER_STORAGE_PREFIX}${currentUserId}`;

          // Check if there are guest scans to migrate into the permanent account
          let guestScans: Scan[] = [];
          try {
            const rawGuest = sessionStorage.getItem(GUEST_STORAGE_KEY);
            if (rawGuest) {
              const parsed = JSON.parse(rawGuest);
              if (Array.isArray(parsed)) {
                guestScans = parsed;
              }
            }
          } catch (err) {
            console.error('[useRecentScans] Failed reading guest scans for migration:', err);
          }

          // Read existing account scans
          let userScans: Scan[] = [];
          try {
            const rawUser = localStorage.getItem(userKey);
            if (rawUser) {
              const parsed = JSON.parse(rawUser);
              if (Array.isArray(parsed)) {
                userScans = parsed;
              }
            }
          } catch (err) {
            console.error('[useRecentScans] Failed reading user scans:', err);
          }

          // If guest scans exist, migrate them into the user account (FIFO max 20)
          if (guestScans.length > 0) {
            const existingIds = new Set(userScans.map((s) => s.id));
            const newFromGuest = guestScans.filter((s) => !existingIds.has(s.id));
            const merged = [...newFromGuest, ...userScans].slice(0, MAX_USER_SCANS);

            try {
              localStorage.setItem(userKey, JSON.stringify(merged));
              sessionStorage.removeItem(GUEST_STORAGE_KEY);
            } catch (err) {
              console.error('[useRecentScans] Failed saving migrated scans:', err);
            }

            setScans(merged);
          } else {
            setScans(userScans.slice(0, MAX_USER_SCANS));
          }
        } else {
          // Guest mode: read from sessionStorage (cleared when browser/tab is closed)
          setIsGuest(true);
          try {
            const rawGuest = sessionStorage.getItem(GUEST_STORAGE_KEY);
            if (rawGuest) {
              const parsed = JSON.parse(rawGuest);
              if (Array.isArray(parsed)) {
                setScans(parsed);
              }
            } else {
              setScans([]);
            }
          } catch (err) {
            console.error('[useRecentScans] Failed reading guest scans:', err);
            setScans([]);
          }
        }
      } catch (err) {
        console.error('[useRecentScans] Failed checking session for recent scans:', err);
        setIsGuest(true);
      }
    }

    void init();

    return () => {
      mounted = false;
    };
  }, []);

  const addScan = useCallback(
    (newScan: Omit<Scan, 'id' | 'date' | 'status'>) => {
      const scan: Scan = {
        ...newScan,
        id: Math.random().toString(36).substring(2, 9),
        date: 'Just now',
        status: 'completed',
      };

      setScans((prev) => {
        if (userId) {
          // Logged-in user: Max 20 scans in localStorage (FIFO queue: 21st scan drops oldest)
          const updated = [scan, ...prev].slice(0, MAX_USER_SCANS);
          try {
            localStorage.setItem(`${USER_STORAGE_PREFIX}${userId}`, JSON.stringify(updated));
          } catch (err) {
            console.error('[useRecentScans] Failed to save user scan:', err);
          }
          return updated;
        } else {
          // Guest user: Stored in sessionStorage as long as the user doesn't exit the site
          const updated = [scan, ...prev];
          try {
            sessionStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(updated));
          } catch (err) {
            console.error('[useRecentScans] Failed to save guest scan:', err);
          }
          return updated;
        }
      });
    },
    [userId]
  );

  const clearScans = useCallback(() => {
    setScans([]);
    if (userId) {
      try {
        localStorage.removeItem(`${USER_STORAGE_PREFIX}${userId}`);
      } catch (err) {
        console.error('[useRecentScans] Failed to clear user scans:', err);
      }
    } else {
      try {
        sessionStorage.removeItem(GUEST_STORAGE_KEY);
      } catch (err) {
        console.error('[useRecentScans] Failed to clear guest scans:', err);
      }
    }
  }, [userId]);

  return {
    scans: isClient ? scans : [],
    addScan,
    clearScans,
    isGuest,
    isClient,
    maxScans: MAX_USER_SCANS,
  };
}
