import type { LocalTextDepth, LocalTextResult } from './local-text-detector';

type Task = { text: string; depth: LocalTextDepth; compact: boolean; id: string; resolve: (result: LocalTextResult) => void; reject: (error: Error) => void };
// Worker failures must release ONNX's failed initialization state before retry.
export function createLocalTextClient(factory: () => Worker, progress: (message: string) => void, timeoutMs = 300000) {
  let worker: Worker | null = null, task: Task | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const release = () => {
    clearTimeout(timer);
    if (worker) { worker.onmessage = null; worker.onerror = null; worker.terminate(); worker = null; }
  };
  const fail = (message: string, recoverable: boolean) => {
    if (!task) return;
    release();
    if (recoverable && !task.compact) {
      task.compact = true;
      progress('Retrying with a smaller on-device detector...');
      launch();
    } else {
      const failed = task; task = null; progress(''); failed.reject(new Error(message));
    }
  };
  const launch = () => {
    if (!task) return;
    try {
      if (!worker) {
        worker = factory();
        worker.onmessage = event => {
          if (!task || event.data.id !== task.id) return;
          if (event.data.type === 'progress') { progress(event.data.message); return; }
          if (event.data.type === 'result') {
            const completed = task; task = null; clearTimeout(timer); progress(''); completed.resolve(event.data.result);
          } else fail(event.data.message ?? 'Local analysis could not complete. Please retry.', event.data.recoverable === true);
        };
        worker.onerror = () => fail('The detector could not start. Reload the page and try a current desktop browser.', true);
      }
      task.id = crypto.randomUUID();
      timer = setTimeout(() => fail('The detector download or analysis timed out. Check your internet connection and retry.', true), timeoutMs);
      worker.postMessage({ id: task.id, text: task.text, depth: task.depth, compact: task.compact });
    } catch { fail('The detector could not start. Reload the page and try again.', true); }
  };
  return {
    analyze(text: string, depth: LocalTextDepth, compact = false): Promise<LocalTextResult> {
      if (task) return Promise.reject(new Error('A scan is already running.'));
      // A reused worker may contain a previous compact model, so each request
      // explicitly tells it which model is needed.
      return new Promise((resolve, reject) => { task = { text, depth, compact, id: '', resolve, reject }; launch(); });
    },
    cancel() {
      release(); const cancelled = task; task = null; progress(''); cancelled?.reject(new Error('Local analysis cancelled.'));
    },
  };
}
