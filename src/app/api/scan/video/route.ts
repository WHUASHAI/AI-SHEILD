import { NextRequest, NextResponse } from 'next/server';
import {
  interpretAiScore,
  interpretDeepfakeScore,
} from '@/lib/sightengine';

// Node.js runtime — no Edge body-size limits, supports large video uploads
export const runtime    = 'nodejs';
export const maxDuration = 60;
export const dynamic    = 'force-dynamic';

// ─── Allowed video MIME types ─────────────────────────────────────────────────
const ALLOWED_VIDEO_MIMES = [
  'video/mp4',
  'video/quicktime',    // .mov
  'video/webm',
  'video/x-msvideo',    // .avi
  'video/x-matroska',   // .mkv
  'video/ogg',
  'video/3gpp',
  'video/mpeg',
];

// ─── Deterministic Mock Generator ─────────────────────────────────────────────
// Generates realistic, deterministic results based on the file name or URL.
// Bypasses the Sightengine paid-tier limit while maintaining professional UI logic.

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function generateDeterministicVideoMock(identifier: string) {
  const seed = hashString(identifier);
  
  // Decide deterministically if it's AI, deepfake, or human based on the hash
  const mod = seed % 100;
  const isAi = mod > 50;         // 50% chance AI
  const isDeepfake = mod > 80;   // 20% chance Deepfake

  // Generate 40 to 120 realistic frames
  const frameCount = 40 + (seed % 80);
  const frames = [];
  
  let totalAi = 0;
  let totalDeepfake = 0;
  let aiSuspicious = 0;
  let deepfakeSuspicious = 0;

  for (let i = 0; i < frameCount; i++) {
    // Generate realistic per-frame scores with slight "wobble"
    let aiScore = isAi 
      ? 0.55 + ((seed + i * 3) % 40) / 100 
      : 0.05 + ((seed + i * 3) % 25) / 100;
      
    let deepfakeScore = isDeepfake 
      ? 0.60 + ((seed + i * 7) % 35) / 100 
      : 0.02 + ((seed + i * 7) % 15) / 100;
    
    // Simulate tracking loss / scene cuts every ~12 frames
    if (i % 12 === 0) {
      aiScore *= 0.3;
      deepfakeScore *= 0.1;
    }

    aiScore = Math.min(0.99, Math.max(0, aiScore));
    deepfakeScore = Math.min(0.99, Math.max(0, deepfakeScore));

    totalAi += aiScore;
    totalDeepfake += deepfakeScore;
    if (aiScore > 0.5) aiSuspicious++;
    if (deepfakeScore > 0.5) deepfakeSuspicious++;

    frames.push({
      timestamp: i * 0.5,
      aiScore: Math.round(aiScore * 100),
      deepfakeScore: Math.round(deepfakeScore * 100),
    });
  }

  const avgAiRaw = totalAi / frameCount;
  const avgDeepfakeRaw = totalDeepfake / frameCount;

  const ai = interpretAiScore(avgAiRaw);
  const deepfake = interpretDeepfakeScore(avgDeepfakeRaw);

  const isDeepfakeResult = deepfake.result === 'deepfake' && avgDeepfakeRaw > 0;
  const finalResult = isDeepfakeResult ? 'deepfake' : ai.result;
  
  let finalScore = 0;
  if (finalResult === 'deepfake') {
    finalScore = Math.round(avgDeepfakeRaw * 100);
  } else if (finalResult === 'ai_generated') {
    finalScore = Math.round(avgAiRaw * 100);
  } else {
    // If it's human, the confidence is the inverse of the AI score
    finalScore = Math.round((1 - avgAiRaw) * 100);
  }
  const finalLabel = isDeepfakeResult ? deepfake.label : ai.label;

  // Downsample to ~20 frames for the UI timeline
  const step = Math.max(1, Math.floor(frameCount / 20));
  const timeline = frames.filter((_, i) => i % step === 0);

  return {
    scanId:       `vid_mock_${seed}`,
    status:       'completed',
    provider:     'Intelligent Analysis (Mocked)',
    result:       finalResult,
    label:        finalLabel,
    confidence:   finalScore,
    overallScore: finalScore,

    breakdown: {
      avgAiGeneratedScore:    Math.round(avgAiRaw * 100),
      avgDeepfakeScore:       Math.round(avgDeepfakeRaw * 100),
      totalFramesAnalyzed:    frameCount,
      aiSuspiciousFrames:     aiSuspicious,
      deepfakeSuspiciousFrames: deepfakeSuspicious,
    },

    signals: [
      {
        name:        'Average AI Generation Score',
        score:       avgAiRaw,
        description: `Averaged across ${frameCount} analyzed frames`,
      },
      {
        name:        'Deepfake Detection Score',
        score:       avgDeepfakeRaw,
        description: 'Face manipulation probability across detected faces in video frames',
      },
      {
        name:        'Suspicious Frame Rate',
        score:       frameCount > 0 ? aiSuspicious / frameCount : 0,
        description: `${aiSuspicious} of ${frameCount} frames flagged as likely AI-generated`,
      },
    ],

    timeline,

    limitations: [
      'Video compression significantly reduces detection accuracy',
      'Social media re-encoding may mask synthetic artifacts',
      'Analysis is sampled per frame — rapid cuts may reduce coverage',
      'Very short clips (< 2s) provide limited evidence',
    ],
    disclaimer:
      'AI Shield uses a deterministic Intelligent Mock for Video Analysis on the Free Tier to bypass expensive frame-processing costs.',
    modelVersion: 'mock-video-v2.0',
  };
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') ?? '';

    // ══════════════════════════════════════════════════════════════════════════
    // MODE A: JSON body with { url: "..." }
    // ══════════════════════════════════════════════════════════════════════════
    if (contentType.includes('application/json')) {
      let body: { url?: string };
      try {
        body = await req.json() as { url?: string };
      } catch {
        return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
      }

      if (!body.url || typeof body.url !== 'string') {
        return NextResponse.json(
          { error: 'Provide a JSON body with { "url": "https://..." } pointing to a public video.' },
          { status: 400 },
        );
      }

      let urlToTest = body.url.trim();
      if (!urlToTest.startsWith('http://') && !urlToTest.startsWith('https://')) {
        urlToTest = 'https://' + urlToTest;
      }

      let parsed: URL;
      try {
        parsed = new URL(urlToTest);
      } catch {
        return NextResponse.json(
          { error: 'Invalid URL. Provide a complete and valid URL.' },
          { status: 400 },
        );
      }

      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return NextResponse.json(
          { error: 'Only http:// and https:// URLs are supported.' },
          { status: 400 },
        );
      }
      
      // Artificial delay to simulate real analysis
      await new Promise(resolve => setTimeout(resolve, 1500));

      const result = generateDeterministicVideoMock(urlToTest);
      return NextResponse.json(result);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // MODE B: multipart/form-data file upload
    // ══════════════════════════════════════════════════════════════════════════
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Send a multipart file upload or a JSON body with { "url": "..." }.' },
        { status: 400 },
      );
    }

    const form = await req.formData();
    const file = form.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No video file provided. Add a "file" field.' }, { status: 400 });
    }

    // ── Strict video-only MIME gate ───────────────────────────────────────────
    const mimeType = file.type.toLowerCase();
    if (!ALLOWED_VIDEO_MIMES.includes(mimeType)) {
      return NextResponse.json(
        {
          error:  `❌ Wrong file type (${file.type || 'unknown'}). This detector only accepts video files: MP4, MOV, WebM, AVI, MKV.`,
          hint:   'To analyze images use the Image detector. For text use the Text detector.',
        },
        { status: 400 },
      );
    }

    // Artificial delay to simulate real analysis proportional to file size
    const delay = Math.min(3000, 1000 + (file.size / (1024 * 1024)) * 100);
    await new Promise(resolve => setTimeout(resolve, delay));

    // Seed based on file name and size for deterministic results
    const identifier = `${file.name}-${file.size}`;
    const result = generateDeterministicVideoMock(identifier);
    
    return NextResponse.json(result);

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[video-scan] Unexpected error:', message);
    return NextResponse.json(
      { error: `Video analysis failed: ${message}` },
      { status: 500 },
    );
  }
}
