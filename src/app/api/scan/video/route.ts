import { NextRequest, NextResponse } from 'next/server';

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

// Seeded random generator for deterministic mock results
function seededRandom(seed: number) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

function generateMockVideoAnalysis(fileName: string, fileSize: number) {
  const seed = fileName.length + fileSize;
  const isAI = seededRandom(seed) > 0.5;
  const baseScore = isAI ? 0.65 + seededRandom(seed + 1) * 0.3 : 0.05 + seededRandom(seed + 1) * 0.3;
  const deepfakeBase = isAI ? seededRandom(seed + 2) * 0.4 : seededRandom(seed + 2) * 0.1;
  
  const frameCount = 30 + Math.floor(seededRandom(seed + 3) * 60);
  const timeline = [];
  
  let aiSuspicious = 0;
  let deepfakeSuspicious = 0;

  for (let i = 0; i < frameCount; i++) {
    const aiVariance = (seededRandom(seed + i) - 0.5) * 0.2;
    const dfVariance = (seededRandom(seed + i + 100) - 0.5) * 0.1;
    
    const frameAi = Math.max(0, Math.min(1, baseScore + aiVariance));
    const frameDf = Math.max(0, Math.min(1, deepfakeBase + dfVariance));
    
    if (frameAi > 0.5) aiSuspicious++;
    if (frameDf > 0.5) deepfakeSuspicious++;

    timeline.push({
      timestamp: parseFloat((i * 0.5).toFixed(2)),
      aiScore: Math.round(frameAi * 100),
      deepfakeScore: Math.round(frameDf * 100)
    });
  }

  const avgAi = timeline.reduce((acc, f) => acc + f.aiScore, 0) / frameCount / 100;
  const avgDf = timeline.reduce((acc, f) => acc + f.deepfakeScore, 0) / frameCount / 100;
  
  let result = 'human';
  let label = 'Likely Authentic';
  let confidence = Math.round((1 - avgAi) * 100);
  
  if (avgAi > 0.7) {
    result = 'ai_generated';
    label = 'AI Generated Video';
    confidence = Math.round(avgAi * 100);
  } else if (avgAi > 0.4) {
    result = 'ai_edited';
    label = 'Suspicious/AI Edited';
    confidence = Math.round(avgAi * 100);
  }

  return {
    scanId: `vid_mock_${Date.now()}`,
    status: 'completed',
    provider: 'Intelligent Mock Generator',
    result,
    label,
    confidence,
    overallScore: confidence,
    breakdown: {
      avgAiGeneratedScore: Math.round(avgAi * 100),
      avgDeepfakeScore: Math.round(avgDf * 100),
      totalFramesAnalyzed: frameCount,
      aiSuspiciousFrames: aiSuspicious,
      deepfakeSuspiciousFrames: deepfakeSuspicious,
    },
    signals: [
      {
        name: 'Temporal Consistency',
        score: avgAi,
        description: 'Analysis of motion and temporal coherence across frames',
      },
      {
        name: 'Frame-by-Frame Artifacts',
        score: avgAi * 0.9,
        description: 'Detection of synthetic generation artifacts in individual frames',
      },
      {
        name: 'Deepfake Suspicion',
        score: avgDf,
        description: 'Face manipulation probability across video timeline',
      },
    ],
    timeline,
    limitations: [
      'This is a deterministic mock generator used for demonstration purposes.',
      'A real API subscription is required to process actual video files.',
    ],
    disclaimer: 'Running in Mock Mode. No actual analysis performed.',
    modelVersion: 'mock-video-v2.0',
  };
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') ?? '';
    
    // Artificial delay to simulate video processing
    await new Promise((resolve) => setTimeout(resolve, 3500));

    if (contentType.includes('application/json')) {
      let body: { url?: string };
      try {
        body = await req.json() as { url?: string };
      } catch {
        return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
      }

      if (!body.url) {
        return NextResponse.json({ error: 'Provide a video URL.' }, { status: 400 });
      }
      
      const mockResult = generateMockVideoAnalysis(body.url, body.url.length * 1024);
      return NextResponse.json(mockResult);
      
    } else if (contentType.includes('multipart/form-data')) {
      const form = await req.formData();
      const file = form.get('file');

      if (!file || !(file instanceof File)) {
        return NextResponse.json({ error: 'No video file provided.' }, { status: 400 });
      }

      const mimeType = file.type.toLowerCase();
      if (!ALLOWED_VIDEO_MIMES.includes(mimeType)) {
        return NextResponse.json(
          {
            error: `❌ Wrong file type (${file.type || 'unknown'}). This detector only accepts video files.`,
          },
          { status: 400 },
        );
      }

      const mockResult = generateMockVideoAnalysis(file.name, file.size);
      return NextResponse.json(mockResult);
      
    } else {
      return NextResponse.json(
        { error: 'Send a multipart file upload or a JSON body with { "url": "..." }.' },
        { status: 400 },
      );
    }

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[video-scan] Unexpected error:', message);
    return NextResponse.json(
      { error: `Video analysis failed: ${message}` },
      { status: 500 },
    );
  }
}
