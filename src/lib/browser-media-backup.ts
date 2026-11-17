import { MAX_MEDIA_FRAMES, type MediaKind, type MediaPixels, type localMediaResult } from './local-media-detector';

const MAX_VIDEO_BYTES = 200 * 1024 * 1024;
function checkAbort(signal?: AbortSignal) { if (signal?.aborted) throw new Error('Analysis cancelled.'); }
function waitForMedia(video: HTMLVideoElement, event: string, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const finish = (error?: Error) => {
      clearTimeout(timer); video.removeEventListener(event, ready); video.removeEventListener('error', failed);
      signal?.removeEventListener('abort', aborted);
      if (error) reject(error); else resolve();
    };
    const ready = () => finish();
    const failed = () => finish(new Error('This browser cannot decode the video. Try an MP4 or WebM file.'));
    const aborted = () => finish(new Error('Analysis cancelled.'));
    const timer = setTimeout(() => finish(new Error('Video decoding timed out. Try a shorter MP4 file.')), 15000);
    video.addEventListener(event, ready, { once: true }); video.addEventListener('error', failed, { once: true });
    signal?.addEventListener('abort', aborted, { once: true });
    if (signal?.aborted) aborted();
  });
}

// Shared by primary uploads and local fallback. Preserve real sample times and
// always release the decoder/object URL, including failed or cancelled seeks.
export async function extractMediaFrames(file: Blob, count = 3, signal?: AbortSignal): Promise<Array<{ file: File; timestamp: number }>> {
  checkAbort(signal);
  if (!Number.isInteger(count) || count < 1 || count > MAX_MEDIA_FRAMES || !file.size || file.size > MAX_VIDEO_BYTES) throw new Error('Upload a video up to 200 MB.');
  const video = document.createElement('video');
  const objectUrl = URL.createObjectURL(file);
  video.muted = true; video.playsInline = true; video.preload = 'auto';
  try {
    const metadata = waitForMedia(video, 'loadedmetadata', signal);
    video.src = objectUrl; video.load(); await metadata;
    if (!Number.isFinite(video.duration) || video.duration <= 0 || !video.videoWidth || !video.videoHeight) {
      throw new Error('The backup needs a finite, decodable video file. Upload an MP4 or WebM file instead of a live stream.');
    }
    const canvas = document.createElement('canvas');
    const scale = Math.min(1, 1024 / Math.max(video.videoWidth, video.videoHeight));
    canvas.width = Math.max(1, Math.round(video.videoWidth * scale)); canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
    const context = canvas.getContext('2d'); if (!context) throw new Error('Video frames cannot be read in this browser.');
    const frames = [];
    for (let index = 0; index < count; index++) {
      checkAbort(signal);
      const timestamp = video.duration * (index + 1) / (count + 1);
      const seeked = waitForMedia(video, 'seeked', signal); video.currentTime = timestamp; await seeked;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', .9));
      if (!blob) throw new Error('A video frame could not be decoded.');
      frames.push({ file: new File([blob], `frame_${index}.jpg`, { type: 'image/jpeg' }), timestamp });
    }
    return frames;
  } finally { video.pause(); video.removeAttribute('src'); video.load(); URL.revokeObjectURL(objectUrl); }
}

async function remoteVideo(url: string, signal: AbortSignal): Promise<Blob> {
  try {
    const parsed = new URL(url);
    if (!['https:', 'http:'].includes(parsed.protocol)) throw new Error('Invalid video URL.');
    const response = await fetch(parsed.href, { credentials: 'omit', signal: AbortSignal.any([signal, AbortSignal.timeout(60000)]) });
    if (!response.ok || Number(response.headers.get('content-length')) > MAX_VIDEO_BYTES || !response.body) throw new Error('Video unavailable.');
    const reader = response.body.getReader(); const chunks: Uint8Array<ArrayBuffer>[] = []; let bytes = 0;
    try {
      while (true) {
        const next = await reader.read(); if (next.done) break;
        bytes += next.value.byteLength; if (bytes > MAX_VIDEO_BYTES) throw new Error('Video too large.');
        chunks.push(next.value);
      }
    } finally { await reader.cancel().catch(() => {}); }
    return new Blob(chunks, { type: response.headers.get('content-type') ?? 'video/mp4' });
  } catch {
    checkAbort(signal);
    throw new Error('The online provider is unavailable and the backup cannot read this video URL. Download the video and upload it here (up to 200 MB).');
  }
}

async function imagePixels(file: File, timestamp: number, signal: AbortSignal): Promise<MediaPixels> {
  checkAbort(signal);
  let bitmap: ImageBitmap;
  try { bitmap = await createImageBitmap(file); }
  catch { throw new Error('This image cannot be decoded for backup analysis. Use a JPEG, PNG, or WebP image.'); }
  try {
    if (!bitmap.width || !bitmap.height || bitmap.width * bitmap.height > 40000000) throw new Error('The image is too large to analyze safely. Resize it to under 40 megapixels.');
    const scale = Math.min(1, 1024 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale)); canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext('2d'); if (!context) throw new Error('Image pixels are unavailable in this browser.');
    context.fillStyle = '#ffffff'; context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height); checkAbort(signal);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
    return { data: new Uint8Array(pixels.data.buffer), width: canvas.width, height: canvas.height, timestamp };
  } finally { bitmap.close(); }
}

export async function runMediaBackup(kind: MediaKind, init: RequestInit, progress: (message: string) => void, signal: AbortSignal): Promise<ReturnType<typeof localMediaResult>> {
  checkAbort(signal);
  let isVideo = kind === 'video';
  let files: Array<{ file: File; timestamp: number }> = [];
  if (init.body instanceof FormData) {
    const form = init.body;
    isVideo = form.get('isFrames') === 'true';
    if (isVideo) {
      files = [...form.entries()].filter(([key, value]) => /^frame_\d+$/.test(key) && value instanceof File)
        .sort(([a], [b]) => Number(a.slice(6)) - Number(b.slice(6)))
        .map(([key, value], index) => ({ file: value as File, timestamp: Number(form.get(`timestamp_${key.slice(6)}`) ?? index + 1) }));
    } else {
      const file = form.get('file'); if (file instanceof File) files = [{ file, timestamp: 0 }];
    }
  } else if (kind === 'video' && typeof init.body === 'string') {
    const body = JSON.parse(init.body);
    progress('Reading video for the free backup...');
    files = await extractMediaFrames(await remoteVideo(String(body.url ?? ''), signal), 3, signal);
  }
  if (!files.length || files.length > MAX_MEDIA_FRAMES || (!isVideo && files[0].file.size > 20 * 1024 * 1024)) throw new Error('No usable media was supplied to the backup.');
  const frames: MediaPixels[] = [];
  for (const item of files) frames.push(await imagePixels(item.file, item.timestamp, signal));
  checkAbort(signal);
  return new Promise((resolve, reject) => {
    let worker: Worker;
    try { worker = new Worker(new URL('../workers/local-media.worker.ts', import.meta.url), { type: 'module' }); }
    catch { reject(new Error('The free backup needs a browser that supports Web Workers.')); return; }
    const finish = (error?: Error, result?: ReturnType<typeof localMediaResult>) => {
      clearTimeout(timer); signal.removeEventListener('abort', abort); worker.terminate();
      if (error) reject(error); else if (result) resolve(result); else reject(new Error('The backup returned no result.'));
    };
    const abort = () => finish(new Error('Analysis cancelled.'));
    const timer = setTimeout(() => finish(new Error('The backup timed out. Check your connection and try again.')), 300000);
    signal.addEventListener('abort', abort, { once: true });
    const id = crypto.randomUUID();
    worker.onmessage = event => {
      if (event.data.id !== id) return;
      if (event.data.type === 'progress') progress(event.data.message);
      else if (event.data.type === 'result') finish(undefined, event.data.result);
      else finish(new Error(event.data.message ?? 'The backup could not run. No verdict was generated.'));
    };
    worker.onerror = () => finish(new Error('The backup worker could not run. Try a current desktop browser.'));
    try { worker.postMessage({ id, kind, isVideo, frames }, frames.map(frame => frame.data.buffer)); }
    catch { finish(new Error('The backup could not read the image pixels.')); }
  });
}
