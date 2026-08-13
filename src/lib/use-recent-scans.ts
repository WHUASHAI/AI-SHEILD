'use client';

import { useState, useEffect } from 'react';
import { Scan } from '@/components/dashboard/recent-scans-table';

const STORAGE_KEY = 'aishield_recent_scans';

export function useRecentScans() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setScans(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Failed to load recent scans', err);
    }
  }, []);

  const addScan = (newScan: Omit<Scan, 'id' | 'date' | 'status'>) => {
    const scan: Scan = {
      ...newScan,
      id: Math.random().toString(36).substring(2, 9),
      date: 'Just now',
      status: 'completed',
    };

    setScans((prev) => {
      const updated = [scan, ...prev].slice(0, 10); // Keep last 10
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to save scan', err);
      }
      return updated;
    });
  };

  return { scans: isClient ? scans : [], addScan };
}
