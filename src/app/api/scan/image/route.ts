import { NextRequest, NextResponse } from 'next/server';
import {
  checkImageFile,
  checkImageUrl,
  interpretAiScore,
  interpretDeepfakeScore,
} from '@/lib/sightengine';

// Node.js runtime — no Edge body-size limits, supports large multipart uploads
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') ?? '';

    // ── Validate credentials exist ────────────────────────────────────────────
    if (!process.env.SIGHTENGINE_API_USER || !process.env.SIGHTENGINE_API_SECRET) {
      console.error('[image-scan] Missing Sightengine credentials in environment');
      return NextResponse.json(
        { error: 'Detection service is not configured. Contact support.' },
        { status: 503 },
      );
    }

    let aiResponse;
    let deepfakeResponse;

    // ── Handle multipart file upload ──────────────────────────────────────────
    if (contentType.includes('multipart/form-data')) {
      const form = await req.formData();
      const file = form.get('file');

      if (!file || !(file instanceof File)) {
        return NextResponse.json(
          { error: 'No file attached. Send a multipart form with a "file" field.' },
          { status: 400 },
        );
      }

      const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/gif', 'image/bmp'];
      if (!allowed.includes(file.type.toLowerCase())) {
        return NextResponse.json(
          { error: `Unsupported type: ${file.type || 'unknown'}. Upload a JPEG, PNG, WebP, HEIC, BMP, or GIF image.` },
          { status: 400 },
        );
      }

      // Step 1: Always run genai — works on every image type
      aiResponse = await checkImageFile(file, 'genai');

      // Step 2: Try deepfake separately — only succeeds when faces are detected
      // Gracefully swallow errors (e.g. no faces found)
      try {
        deepfakeResponse = await checkImageFile(file, 'deepfake');
      } catch {
        // No faces — deepfake model not applicable; we still have the genai result
        deepfakeResponse = null;
      }

    // ── Handle JSON with image URL ────────────────────────────────────────────
    } else {
      let body: { url?: string };
      try {
        body = await req.json() as { url?: string };
      } catch {
        return NextResponse.json(
          { error: 'Send a multipart/form-data file upload or JSON body with { "url": "..." }.' },
          { status: 400 },
        );
      }

      if (!body.url) {
        return NextResponse.json(
          { error: 'Provide a JSON body with { "url": "..." } pointing to a public image URL.' },
          { status: 400 },
        );
      }

      aiResponse = await checkImageUrl(body.url, 'genai');

      try {
        deepfakeResponse = await checkImageUrl(body.url, 'deepfake');
      } catch {
        deepfakeResponse = null;
      }
    }

    // ── Check for Sightengine-level failure on the primary (ai-generated) call ─
    if (aiResponse.status === 'failure' || aiResponse.error) {
      const detail = aiResponse.error?.message ?? 'Unknown Sightengine error';
      console.error('[image-scan] Sightengine ai-generated error:', detail);
      return NextResponse.json(
        { error: `Detection service error: ${detail}` },
        { status: 502 },
      );
    }

    // ── AI generation & enhancement scores ───────────────────────────────────
    const aiRaw          = aiResponse.type?.ai_generated  ?? 0;
    const photoRaw       = aiResponse.type?.photo         ?? 0;
    const illustrationRaw = aiResponse.type?.illustration ?? 0;

    // Enhancement heuristic: real photo (photo > 30%) but ai score slightly elevated (15–69%)
    // This allows it to catch light filters, face tuning, and color grading.
    const isEnhanced = photoRaw > 0.3 && aiRaw >= 0.15 && aiRaw < 0.7;

    const ai = interpretAiScore(aiRaw);
    const finalAiResult = isEnhanced ? 'ai_enhanced' : ai.result;
    const finalAiLabel  = isEnhanced ? 'Likely Enhanced / Edited' : ai.label;

    // ── Deepfake scores (from separate call, may be null) ──────────────────────
    const faces = (deepfakeResponse?.status === 'success' ? deepfakeResponse.faces : null) ?? [];
    const highestDeepfakeRaw = faces.reduce((max, f) => Math.max(max, f.deepfake), 0);
    const deepfake = interpretDeepfakeScore(highestDeepfakeRaw);

    // ── Dominant verdict ───────────────────────────────────────────────────────
    const hasFaces  = faces.length > 0;
    const isDeepfake = hasFaces && deepfake.result === 'deepfake';
    const finalResult = isDeepfake ? 'deepfake' : finalAiResult;
    
    let finalScore = 0;
    if (finalResult === 'deepfake') {
      finalScore = Math.round(highestDeepfakeRaw * 100);
    } else if (finalResult === 'ai_generated') {
      finalScore = Math.round(aiRaw * 100);
    } else {
      // If it's human or enhanced, the "confidence" in that verdict is the inverse of the AI score
      // Or we can use the max of photo and illustration. Let's use the inverse of AI score to be consistent.
      finalScore = Math.round((1 - aiRaw) * 100);
    }
    const finalLabel  = isDeepfake ? deepfake.label : finalAiLabel;

    // ── Signals ───────────────────────────────────────────────────────────────
    const signals = [
      {
        name: 'AI Generation Score',
        score: aiRaw,
        description: 'Probability the image was fully created by a generative AI model (Stable Diffusion, DALL-E, Midjourney, Flux, GAN, etc.)',
      },
      {
        name: 'Real Photo Score',
        score: photoRaw,
        description: 'Probability the image is a real photograph captured by a camera',
      },
    ];

    if (illustrationRaw > 0.1) {
      signals.push({
        name: 'Illustration / Artwork',
        score: illustrationRaw,
        description: 'Probability the image is a human-made illustration, graphic, or drawing',
      });
    }

    if (isEnhanced) {
      signals.push({
        name: 'Enhancement / Edit Pattern',
        score: aiRaw,
        description: 'Real photograph showing signs of post-processing, heavy filters, or digital edits.',
      });
    }

    if (hasFaces) {
      signals.push({
        name: 'Deepfake Face Score',
        score: highestDeepfakeRaw,
        description: `${faces.length} face(s) scanned — highest deepfake manipulation probability`,
      });
    }

    return NextResponse.json({
      scanId: `img_${Date.now()}`,
      status: 'completed',
      provider: 'Sightengine',
      result: finalResult,
      label: finalLabel,
      confidence: finalScore,
      overallScore: finalScore,

      breakdown: {
        aiGenerated:   Math.round(aiRaw * 100),
        photo:         Math.round(photoRaw * 100),
        illustration:  Math.round(illustrationRaw * 100),
        facesDetected: faces.length,
        deepfakeScore: Math.round(highestDeepfakeRaw * 100),
        isEnhanced,
      },

      signals,
      faces: faces.map((f) => ({
        id: f.id,
        deepfakeScore: Math.round(f.deepfake * 100),
        verdict: f.deepfake >= 0.5 ? 'Deepfake' : 'Authentic',
        position: f.position,
      })),

      limitations: [
        'Heavy JPEG compression can mask AI generation artifacts',
        'Minor AI enhancements on real photos may score lower than expected',
        'Very small images (under 256px) reduce accuracy significantly',
        'Illustration-style AI art may occasionally score lower',
      ],
      disclaimer:
        'AI Shield uses Sightengine probability models. Results may contain false positives or negatives. Always apply human judgment for critical decisions.',
      modelVersion: 'sightengine-v1.0',
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[image-scan] Unexpected error:', message);
    return NextResponse.json(
      { error: `Image analysis failed: ${message}` },
      { status: 500 },
    );
  }
}
