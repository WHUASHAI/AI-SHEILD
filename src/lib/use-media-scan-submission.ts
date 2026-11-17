'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useScanSubmission } from './use-scan-submission';
import { submitWithMediaBackup } from './media-fallback';
import type { MediaKind } from './local-media-detector';

export function useMediaScanSubmission(kind: MediaKind) {
  const { submitScan: submitPrimary, historyNotice: primaryNotice } = useScanSubmission();
  const [backupNotice, setBackupNotice] = useState<string | null>(null);
  const [backupProgress, setBackupProgress] = useState('');
  const active = useRef<AbortController | null>(null);
  useEffect(() => () => active.current?.abort(), []);
  const cancelBackup = useCallback(() => active.current?.abort(), []);
  const submitScan = useCallback(async (url: string, init: RequestInit) => {
    if (active.current) throw new Error('A scan is already running.');
    const controller = new AbortController(); active.current = controller;
    setBackupNotice(null); setBackupProgress('');
    try {
      return await submitWithMediaBackup(
        () => submitPrimary(url, { ...init, signal: controller.signal }),
        async () => {
          const { runMediaBackup } = await import('./browser-media-backup');
          const result = await runMediaBackup(kind, init, setBackupProgress, controller.signal);
          return { ...result, scanId: `local_${crypto.randomUUID()}` };
        }, undefined,
        () => {
          setBackupNotice('The online check is unavailable. Free on-device backup is active. Local results stay on this page and are not saved to History or included in website statistics.');
          setBackupProgress('Preparing free on-device backup...');
        },
      );
    } finally { active.current = null; setBackupProgress(''); }
  }, [kind, submitPrimary]);
  return { submitScan, historyNotice: backupNotice ?? primaryNotice, backupProgress, cancelBackup };
}
