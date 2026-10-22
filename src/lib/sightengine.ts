/**
 * src/lib/sightengine.ts
 * Sightengine API client for AI-generated image, video, and deepfake detection.
 * Docs: https://sightengine.com/docs
 */

const SE_API_USER   = process.env.SIGHTENGINE_API_USER!;
const SE_API_SECRET = process.env.SIGHTENGINE_API_SECRET!;
const SE_BASE       = 'https://api.sightengine.com/1.0';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SightengineImageResponse {
  status: 'success' | 'failure';
  request: { id: string; timestamp: number; operations: number };
  /**
   * Returned by the `ai-generated` model:
   * - ai_generated: probability the image was fully AI-created
   * - photo:        probability it is a real camera photograph
   * - illustration: probability it is a human-made illustration/graphic
   */
  type?: {
    ai_generated:  number;
    photo:         number;
    illustration:  number;
    other:         number;
  };
  /** Per-face deepfake scores — returned by the `deepfake` model */
  faces?: Array<{
    id:               number;
    deepfake:         number;
    face_attributes?: Record<string, unknown>;
    position?:        { x: number; y: number; width: number; height: number };
  }>;
  error?: { type: string; message: string };
}

export interface SightengineVideoResponse {
  status:  'success' | 'failure';
  request: { id: string; timestamp: number; operations: number };
  /** Per-frame analysis data */
  data?: {
    frames: Array<{
      info:  { ts: number };
      type?: { ai_generated: number; photo: number };
      faces?: Array<{ id: number; deepfake: number }>;
    }>;
  };
  error?: { type: string; message: string };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Buffer a File/Blob into memory so it can be reliably appended to FormData
 * and streamed to external APIs from a Next.js server route.
 */
async function fileToBlob(file: File | Blob): Promise<Blob> {
  const buffer = await file.arrayBuffer();
  return new Blob([buffer], { type: file.type });
}

// ─── Image check (URL) ────────────────────────────────────────────────────────

/**
 * Checks a publicly accessible image URL.
 * @param imageUrl  Publicly reachable image URL
 * @param models    Comma-separated Sightengine model list
 */
export async function checkImageUrl(
  imageUrl: string,
  models:   string = 'genai',
): Promise<SightengineImageResponse> {
  const params = new URLSearchParams({
    url:        imageUrl,
    models,
    api_user:   SE_API_USER,
    api_secret: SE_API_SECRET,
  });

  const res = await fetch(`${SE_BASE}/check.json?${params.toString()}`, {
    method: 'GET',
    next:   { revalidate: 0 },
  });

  if (!res.ok) {
    throw new Error(`Sightengine HTTP ${res.status}: ${await res.text()}`);
  }

  return res.json() as Promise<SightengineImageResponse>;
}

// ─── Image check (file upload) ────────────────────────────────────────────────

/**
 * Uploads a File/Blob to Sightengine for analysis.
 * Buffers the file into memory first to ensure reliable serialization from
 * a Next.js server route handler (req.formData() returns a lazy stream).
 * @param file    File object (from FormData)
 * @param models  Comma-separated model list
 */
export async function checkImageFile(
  file:   File | Blob,
  models: string = 'genai',
): Promise<SightengineImageResponse> {
  // ⚠️ Critical: buffer file content before re-uploading from a server route
  const blob = await fileToBlob(file);

  const form = new FormData();
  form.append('media',      blob, file instanceof File ? file.name : 'image');
  form.append('models',     models);
  form.append('api_user',   SE_API_USER);
  form.append('api_secret', SE_API_SECRET);

  const res = await fetch(`${SE_BASE}/check.json`, {
    method: 'POST',
    body:   form,
  });

  if (!res.ok) {
    throw new Error(`Sightengine HTTP ${res.status}: ${await res.text()}`);
  }

  return res.json() as Promise<SightengineImageResponse>;
}

// ─── Video check (file upload — synchronous) ──────────────────────────────────

/**
 * Sends a video file to Sightengine's synchronous video endpoint.
 * Best for clips under ~1 minute. Buffers content before upload.
 * @param file    File object (from FormData)
 * @param models  Comma-separated model list
 */
export async function checkVideoFile(
  file:   File | Blob,
  models: string = 'genai,deepfake',
): Promise<SightengineVideoResponse> {
  // ⚠️ Critical: buffer file content before re-uploading from a server route
  const blob = await fileToBlob(file);

  const form = new FormData();
  form.append('media',      blob, file instanceof File ? file.name : 'video.mp4');
  form.append('models',     models);
  form.append('api_user',   SE_API_USER);
  form.append('api_secret', SE_API_SECRET);

  const res = await fetch(`${SE_BASE}/video/check-sync.json`, {
    method: 'POST',
    body:   form,
  });

  if (!res.ok) {
    throw new Error(`Sightengine HTTP ${res.status}: ${await res.text()}`);
  }

  return res.json() as Promise<SightengineVideoResponse>;
}

// ─── Video check (stream URL) ─────────────────────────────────────────────────

/**
 * Analyzes a publicly accessible video URL (stream URL) via Sightengine.
 * Supports direct MP4 links, HLS (.m3u8), and other public video URLs.
 * @param videoUrl  Publicly reachable video URL
 * @param models    Comma-separated model list
 */
export async function checkVideoUrl(
  videoUrl: string,
  models:   string = 'genai,deepfake',
): Promise<SightengineVideoResponse> {
  const form = new URLSearchParams({
    stream_url: videoUrl,
    models,
    api_user:   SE_API_USER,
    api_secret: SE_API_SECRET,
  });

  const res = await fetch(`${SE_BASE}/video/check-sync.json`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    form.toString(),
  });

  if (!res.ok) {
    throw new Error(`Sightengine HTTP ${res.status}: ${await res.text()}`);
  }

  return res.json() as Promise<SightengineVideoResponse>;
}

// ─── Score interpreters ───────────────────────────────────────────────────────

/** Converts a Sightengine ai_generated score (0–1) into a verdict. */
export function interpretAiScore(score: number): {
  score:  number;
  result: 'ai_generated' | 'ai_enhanced' | 'human';
  label:  string;
} {
  const pct = Math.round(score * 100);
  if (pct >= 70) return { score: pct, result: 'ai_generated', label: 'Likely AI-Generated' };
  if (pct >= 40) return { score: pct, result: 'ai_enhanced',  label: 'Possibly AI-Enhanced' };
  return          { score: pct, result: 'human',        label: 'Likely Human-Created' };
}

/** Converts a Sightengine deepfake face score (0–1) into a verdict. */
export function interpretDeepfakeScore(score: number): {
  score:  number;
  result: 'deepfake' | 'human';
  label:  string;
} {
  const pct = Math.round(score * 100);
  if (pct >= 50) return { score: pct, result: 'deepfake', label: 'Deepfake Detected' };
  return          { score: pct, result: 'human',    label: 'Likely Authentic' };
}

/** Averages AI-generated scores across all frames in a video response. */
export function avgVideoAiScore(response: SightengineVideoResponse): number {
  const frames = response.data?.frames ?? [];
  const scores = frames.map((f) => f.type?.ai_generated ?? 0);
  if (scores.length === 0) return 0;
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

/** Averages deepfake scores across all detected faces across all video frames. */
export function avgVideoDeepfakeScore(response: SightengineVideoResponse): number {
  const frames    = response.data?.frames ?? [];
  const allScores: number[] = [];
  for (const frame of frames) {
    for (const face of frame.faces ?? []) {
      allScores.push(face.deepfake);
    }
  }
  if (allScores.length === 0) return 0;
  return allScores.reduce((a, b) => a + b, 0) / allScores.length;
}
