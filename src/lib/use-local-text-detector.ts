'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { type LocalTextDepth, validateLocalText } from './local-text-detector';
import { createLocalTextClient } from './local-text-client';

export function useLocalTextDetector() {
  const client = useRef<ReturnType<typeof createLocalTextClient> | null>(null);
  const [progress, setProgress] = useState('');
  const stop = useCallback(() => client.current?.cancel(), []);
  useEffect(() => stop, [stop]);
  const analyzeLocal = useCallback((input: string, depth: LocalTextDepth = 'thorough') => {
    const text = validateLocalText(input);
    if (typeof Worker === 'undefined') return Promise.reject(new Error('This browser does not support local analysis. Try a current desktop browser.'));
    if (!client.current) client.current = createLocalTextClient(
      () => new Worker(new URL('../workers/local-text.worker.ts', import.meta.url), { type: 'module' }), setProgress,
    );
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    setProgress('Preparing on-device analysis...');
    return client.current.analyze(text, depth, typeof memory === 'number' && memory <= 4);
  }, []);
  return { analyzeLocal, localProgress: progress, cancelLocal: stop };
}
