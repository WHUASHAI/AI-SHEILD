'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { type LocalTextDepth, type LocalTextResult, validateLocalText } from './local-text-detector';

type Pending = { id: string; resolve: (result: LocalTextResult) => void; reject: (error: Error) => void };

export function useLocalTextDetector() {
  const worker = useRef<Worker | null>(null);
  const pending = useRef<Pending | null>(null);
  const [progress, setProgress] = useState('');
  const stop = useCallback(() => {
    worker.current?.terminate();
    worker.current = null;
    pending.current?.reject(new Error('Local analysis cancelled.'));
    pending.current = null;
  }, []);
  useEffect(() => stop, [stop]);

  const analyzeLocal = useCallback((input: string, depth: LocalTextDepth = 'thorough'): Promise<LocalTextResult> => {
    const text = validateLocalText(input);
    if (pending.current) return Promise.reject(new Error('A scan is already running.'));
    if (typeof Worker === 'undefined') return Promise.reject(new Error('This browser does not support local analysis. Try a current desktop browser.'));
    setProgress('Preparing on-device analysis...');
    return new Promise((resolve, reject) => {
      try {
        if (!worker.current) {
          worker.current = new Worker(new URL('../workers/local-text.worker.ts', import.meta.url), { type: 'module' });
          worker.current.onmessage = event => {
            if (!pending.current || event.data.id !== pending.current.id) return;
            if (event.data.type === 'progress') { setProgress(event.data.message); return; }
            const task = pending.current;
            pending.current = null;
            setProgress('');
            if (event.data.type === 'result') task.resolve(event.data.result);
            else task.reject(new Error(event.data.message ?? 'Local analysis failed.'));
          };
          worker.current.onerror = () => {
            pending.current?.reject(new Error('The local detector could not start. Try a current desktop browser.'));
            pending.current = null;
            worker.current?.terminate();
            worker.current = null;
            setProgress('');
          };
        }
        const id = crypto.randomUUID();
        pending.current = { id, resolve, reject };
        worker.current.postMessage({ id, text, depth });
      } catch {
        pending.current = null;
        reject(new Error('The local detector could not start. Try a current desktop browser.'));
      }
    });
  }, []);
  return { analyzeLocal, localProgress: progress, cancelLocal: stop };
}
