'use client';

import { useEffect, useState } from 'react';
import type { PlatformStatistics } from './platform-statistics';

export function usePlatformStatistics() {
  const [statistics, setStatistics] = useState<PlatformStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let mounted = true;
    let pending = false;
    const controller = new AbortController();
    async function refresh() {
      if (pending) return;
      pending = true;
      setLoading(true);
      try {
        const response = await fetch('/api/statistics', { cache: 'no-store', signal: controller.signal });
        if (!response.ok) throw new Error('Statistics unavailable');
        const result: PlatformStatistics = await response.json();
        if (mounted) { setStatistics(result); setError(''); }
      } catch {
        if (mounted) { setStatistics(null); setError('Website-wide statistics are temporarily unavailable.'); }
      } finally {
        pending = false;
        if (mounted) setLoading(false);
      }
    }
    void refresh();
    const onFocus = () => { void refresh(); };
    const interval = window.setInterval(onFocus, 30000);
    window.addEventListener('focus', onFocus);
    return () => { mounted = false; controller.abort(); window.clearInterval(interval); window.removeEventListener('focus', onFocus); };
  }, [attempt]);

  return { statistics, loading, error, retry: () => setAttempt(value => value + 1) };
}
