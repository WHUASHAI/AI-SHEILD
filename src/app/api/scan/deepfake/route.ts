import { providerFailure } from '@/lib/provider-response';
import { NextRequest, NextResponse } from 'next/server';
import { requireSessionResponse } from '@/lib/require-session';
import { withScanHistory } from '@/lib/with-scan-history';
import { checkImageFile, checkImageUrl, interpretDeepfakeScore, readDeepfakeScore } from '@/lib/sightengine';

export const runtime = 'nodejs';
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

async function analyze(req: NextRequest) {
  const unauthorized = await requireSessionResponse();
  if (unauthorized) return unauthorized;
  try {
    let deepfakeScore: number;
    let isVideo = false;
    const timeline: Array<{ timestamp: number; deepfakeScore: number }> = [];

    if (req.headers.get('content-type')?.includes('multipart/form-data')) {
      const form = await req.formData();
      isVideo = form.get('isFrames') === 'true';
      if (isVideo) {
        const frames = [...form.entries()].filter(([key]) => key.startsWith('frame_'));
        if (!frames.length || frames.length > 8 || frames.some(([key, value]) =>
          !/^frame_\d+$/.test(key) || !(value instanceof File) || !value.size || !value.type.startsWith('image/'))) {
          return NextResponse.json({ error: 'Provide between one and eight decoded image frames.' }, { status: 400 });
        }
        const samples = frames.map(([key, value]) => ({
          file: value as File,
          timestamp: form.has(`timestamp_${key.slice(6)}`) ? Number(form.get(`timestamp_${key.slice(6)}`)) : NaN,
        }));
        if (samples.some(sample => !Number.isFinite(sample.timestamp) || sample.timestamp < 0)) {
          return NextResponse.json({ error: 'Video frame timestamps must be valid seconds.' }, { status: 400 });
        }
        let highestScore = 0;
        for (const sample of samples) {
          // Each successful call returns type.deepfake, even without a faces array.
          // Fail immediately on unusable output/quota errors, preserving local fallback.
          const score = readDeepfakeScore(await checkImageFile(sample.file, 'deepfake'));
          highestScore = Math.max(highestScore, score);
          timeline.push({ timestamp: sample.timestamp, deepfakeScore: Math.round(score * 100) });
        }
        // Preserve the highest-frame decision without rounding before classification.
        deepfakeScore = highestScore;
      } else {
        const file = form.get('file');
        if (!(file instanceof File) || !file.size || !file.type.startsWith('image/')) {
          return NextResponse.json({ error: 'Provide an image, or upload a video through the frame-extraction page.' }, { status: 400 });
        }
        deepfakeScore = readDeepfakeScore(await checkImageFile(file, 'deepfake'));
      }
    } else {
      let body: { url?: unknown };
      try { body = await req.json(); }
      catch { return NextResponse.json({ error: 'Provide a JSON body with an image URL.' }, { status: 400 }); }
      if (!body || typeof body.url !== 'string' || !/^https?:\/\//i.test(body.url)) {
        return NextResponse.json({ error: 'Provide a public HTTP or HTTPS image URL.' }, { status: 400 });
      }
      deepfakeScore = readDeepfakeScore(await checkImageUrl(body.url, 'deepfake'));
    }

    const verdict = interpretDeepfakeScore(deepfakeScore);
    const finalScore = Math.round(deepfakeScore * 100);
    return NextResponse.json({
      isReal: true,
      scanId: `deepfake_${Date.now()}`,
      status: 'completed',
      provider: 'Sightengine',
      result: verdict.result,
      label: verdict.result === 'deepfake' ? verdict.label : 'Lower Deepfake Signals',
      confidence: finalScore,
      overallScore: finalScore,
      deepfakeAnalyzed: true,
      isVideo,
      breakdown: {
        deepfakeScore: finalScore,
        // Sightengine supplies a frame-level score, not a face count or boxes.
        facesDetected: null,
        ...(isVideo && { totalFramesAnalyzed: timeline.length }),
      },
      faces: [],
      ...(isVideo && { timeline }),
      signals: [{
        name: 'Visual Deepfake Score',
        score: deepfakeScore,
        description: isVideo
          ? `Highest deepfake model score across ${timeline.length} sampled video frames`
          : 'Deepfake model score for the image; individual face counts are not supplied',
      }],
      limitations: [
        'Low-resolution media and small, obscured, or distant faces can reduce detection reliability.',
        'The provider reports an image/frame score, not individual face counts. A low score does not prove authenticity or confirm that a face was detected.',
        'Audio, lip-sync, identity, and motion between sampled frames are not analyzed.',
        ...(isVideo ? [`Only ${timeline.length} frames were sampled. Manipulation between those frames may be missed.`] : []),
      ],
      disclaimer: 'Elucid AI provides a model estimate, not proof of authenticity. Review alongside the original media and other evidence.',
      modelVersion: 'sightengine-deepfake-v1.0',
    });
  } catch (error) {
    return providerFailure(error, 'Deepfake detection is temporarily unavailable. Please try later.');
  }
}

export const POST = withScanHistory('deepfake', analyze);
