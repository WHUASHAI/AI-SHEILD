import { NextRequest, NextResponse } from 'next/server';
import {
  checkVideoFile,
  checkVideoUrl,
  interpretAiScore,
  interpretDeepfakeScore,
  avgVideoAiScore,
  avgVideoDeepfakeScore,
} from '@/lib/sightengine';

export const runtime    = 'nodejs';
export const maxDuration = 60;
export const dynamic    = 'force-dynamic';

const ALLOWED_VIDEO_MIMES = [
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'video/x-msvideo',
  'video/x-matroska',
  'video/ogg',
  'video/3gpp',
  'video/mpeg',
];

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') ?? '';

    // ── Validate credentials exist ──
    if (!process.env.SIGHTENGINE_API_USER || !process.env.SIGHTENGINE_API_SECRET) {
      console.error('[video-scan] Missing Sightengine credentials');
      return NextResponse.json(
        { error: 'Detection service is not configured. Contact support.' },
        { status: 503 },
      );
    }

    let seResponse;

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

      seResponse = await checkVideoUrl(urlToTest, 'genai,deepfake');
    } else if (contentType.includes('multipart/form-data')) {
      const form = await req.formData();
      const file = form.get('file');

      if (!file || !(file instanceof File)) {
        return NextResponse.json({ error: 'No video file provided. Add a "file" field.' }, { status: 400 });
      }

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

      seResponse = await checkVideoFile(file, 'genai,deepfake');
    } else {
      return NextResponse.json(
        { error: 'Send a multipart file upload or a JSON body with { "url": "..." }.' },
        { status: 400 },
      );
    }

    if (seResponse.status === 'failure' || seResponse.error) {
      const detail = seResponse.error?.message ?? 'Unknown Sightengine error';
      console.error('[video-scan] Sightengine error:', detail);
      return NextResponse.json(
        { error: `Detection service error: ${detail}` },
        { status: 502 },
      );
    }

    const frames = seResponse.data?.frames ?? [];
    const frameCount = frames.length;

    let aiSuspicious = 0;
    let deepfakeSuspicious = 0;

    const timeline = frames.map((frame) => {
      const ts = frame.info.ts;
      const aiScoreRaw = frame.type?.ai_generated ?? 0;
      let dfScoreRaw = 0;
      if (frame.faces && frame.faces.length > 0) {
        dfScoreRaw = Math.max(...frame.faces.map(f => f.deepfake));
      }

      if (aiScoreRaw > 0.5) aiSuspicious++;
      if (dfScoreRaw > 0.5) deepfakeSuspicious++;

      return {
        timestamp: ts,
        aiScore: Math.round(aiScoreRaw * 100),
        deepfakeScore: Math.round(dfScoreRaw * 100),
      };
    });

    const avgAiRaw = avgVideoAiScore(seResponse);
    const avgDeepfakeRaw = avgVideoDeepfakeScore(seResponse);

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
      finalScore = Math.round((1 - avgAiRaw) * 100);
    }
    const finalLabel = isDeepfakeResult ? deepfake.label : ai.label;

    return NextResponse.json({
      scanId:       `vid_${Date.now()}`,
      status:       'completed',
      provider:     'Sightengine',
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
          description: `${aiSuspicious} of ${frameCount} frames flagged as highly suspicious`,
        },
      ],

      timeline,

      limitations: [
        'Video compression significantly reduces detection accuracy',
        'Social media re-encoding may mask synthetic artifacts',
        'Analysis is sampled per frame — rapid cuts may reduce coverage',
        'Very short clips provide limited evidence',
      ],
      disclaimer: 'AI Shield uses Sightengine probability models. Results may contain false positives or negatives.',
      modelVersion: 'sightengine-video-v1.0',
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[video-scan] Unexpected error:', message);
    return NextResponse.json(
      { error: `Video analysis failed: ${message}` },
      { status: 500 },
    );
  }
}
