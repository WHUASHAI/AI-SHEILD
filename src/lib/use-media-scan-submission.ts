'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useScanSubmission } from './use-scan-submission';
import { sightengineCooldown, submitWithDetectorBackup } from './detector-fallback';
import type { MediaKind } from './local-media-detector';

export function useMediaScanSubmission(kind: MediaKind) {
  const { submitScan: submitPrimary, historyNotice } = useScanSubmission();
  const [backupProgress, setBackupProgress] = useState('');
  const active = useRef<AbortController | null>(null);
  useEffect(() => () => active.current?.abort(), []);
  const cancelBackup = useCallback(() => active.current?.abort(), []);
  const submitScan = useCallback(async (url: string, init: RequestInit) => {
    if (active.current) throw new Error('A scan is already running.');
    const controller = new AbortController(); active.current = controller;
    setBackupProgress('');
    try {
      return await submitWithDetectorBackup(
        () => submitPrimary(url, { ...init, signal: controller.signal }),
        async () => {
          const { runMediaBackup } = await import('./browser-media-backup');
          const result = await runMediaBackup(kind, init, setBackupProgress, controller.signal);
          return { ...result, scanId: `local_${crypto.randomUUID()}` };
        }, sightengineCooldown,
        () => setBackupProgress('Preparing analysis…'),
      );
    } finally { active.current = null; setBackupProgress(''); }
  }, [kind, submitPrimary]);
  return { submitScan, historyNotice, backupProgress, cancelBackup };
}
