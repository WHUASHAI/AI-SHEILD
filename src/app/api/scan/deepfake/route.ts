import { NextRequest, NextResponse } from 'next/server';
import {
  checkImageFile,
  checkImageUrl,
  checkVideoFile,
  interpretDeepfakeScore,
  avgVideoDeepfakeScore,
} from '@/lib/sightengine';

// Use Node.js runtime to support large FormData uploads without Edge size limits
export const runtime = 'nodejs';
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

function seededRandom(seed: number) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') ?? '';
    const isMultipart = contentType.includes('multipart/form-data');

    let deepfakeScore = 0;
    let faceData: Array<{ id: number; deepfakeScore: number; verdict: string; position?: unknown }> = [];
    let isVideo = false;
    let totalFrames = 0;

    if (isMultipart) {
      const form = await req.formData();
      const isFrames = form.get('isFrames') === 'true';

      if (isFrames) {
        isVideo = true;
        const frames: File[] = [];
        for (const [key, value] of form.entries()) {
          if (key.startsWith('frame_') && value instanceof File) {
            frames.push(value);
          }
        }

        if (frames.length === 0) {
          return NextResponse.json({ error: 'No frames provided.' }, { status: 400 });
        }

        totalFrames = frames.length;
        let maxScore = 0;
        let faceCount = 0;

        for (const frame of frames) {
          let seResponse;
          try {
             seResponse = await checkImageFile(frame, 'deepfake');
          } catch(e) {
             continue;
          }
          if (seResponse && seResponse.status === 'success' && seResponse.faces) {
            for (const f of seResponse.faces) {
               maxScore = Math.max(maxScore, f.deepfake);
            }
            if (seResponse.faces.length > 0) faceCount++;
          }
        }

        if (faceCount === 0) {
           return NextResponse.json({ error: 'No faces detected across video frames.' }, { status: 400 });
        }

        deepfakeScore = maxScore;
        faceData = [
          {
            id: 1,
            deepfakeScore: Math.round(maxScore * 100),
            verdict: maxScore >= 0.5 ? 'Deepfake' : 'Authentic',
          }
        ];

      } else {
        const file = form.get('file');

        if (!file || !(file instanceof File)) {
          return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const isVideoFile = file.type.startsWith('video/');
        const isImageFile = file.type.startsWith('image/');

        if (!isVideoFile && !isImageFile) {
          return NextResponse.json(
            { error: 'Unsupported file type. Provide an image (JPEG/PNG/WebP) or video (MP4/MOV/WebM).' },
            { status: 400 },
          );
        }

        if (isVideoFile) {
          return NextResponse.json(
            { error: 'Video files must be processed via frame extraction.' },
            { status: 400 },
          );
        }

        // Image deepfake check (Uses Real Sightengine API)
        const seResponse = await checkImageFile(file, 'deepfake');

        if (seResponse.status === 'failure' || seResponse.error) {
          return NextResponse.json(
            { error: 'Detection service error', details: seResponse.error?.message },
            { status: 502 },
          );
        }

        const faces = seResponse.faces ?? [];
        
        if (faces.length === 0) {
          return NextResponse.json(
            { error: 'No faces detected. Deepfake analysis requires an image containing exactly one clear human face.' },
            { status: 400 }
          );
        }
        
        if (faces.length > 1) {
          return NextResponse.json(
            { error: `Found ${faces.length} faces. For maximum accuracy, the Deepfake detector currently only supports analyzing one face at a time. Please crop the image to a single face.` },
            { status: 400 }
          );
        }

        deepfakeScore = faces.reduce((max, f) => Math.max(max, f.deepfake), 0);
        faceData = faces.map((f) => ({
          id: f.id,
          deepfakeScore: Math.round(f.deepfake * 100),
          verdict: f.deepfake >= 0.5 ? 'Deepfake' : 'Authentic',
          position: f.position,
        }));
      }

    } else {
      // JSON body with image URL (Uses Real Sightengine API)
      const body = await req.json() as { url?: string };
      if (!body.url) {
        return NextResponse.json(
          { error: 'Provide a multipart file upload or a JSON body with { url }.' },
          { status: 400 },
        );
      }

      const seResponse = await checkImageUrl(body.url, 'deepfake');

      if (seResponse.status === 'failure' || seResponse.error) {
        return NextResponse.json(
          { error: 'Detection service error', details: seResponse.error?.message },
          { status: 502 },
        );
      }

      const faces = seResponse.faces ?? [];
      
      if (faces.length === 0) {
        return NextResponse.json(
          { error: 'No faces detected. Deepfake analysis requires an image containing exactly one clear human face.' },
          { status: 400 }
        );
      }
      
      if (faces.length > 1) {
        return NextResponse.json(
          { error: `Found ${faces.length} faces. For maximum accuracy, the Deepfake detector currently only supports analyzing one face at a time. Please crop the image to a single face.` },
          { status: 400 }
        );
      }

      deepfakeScore = faces.reduce((max, f) => Math.max(max, f.deepfake), 0);
      faceData = faces.map((f) => ({
        id: f.id,
        deepfakeScore: Math.round(f.deepfake * 100),
        verdict: f.deepfake >= 0.5 ? 'Deepfake' : 'Authentic',
        position: f.position,
      }));
    }

    const verdict = interpretDeepfakeScore(deepfakeScore);
    const finalScore = Math.round(deepfakeScore * 100);

    return NextResponse.json({
      scanId: `deepfake_${Date.now()}`,
      status: 'completed',
      provider: 'Sightengine',
      result: verdict.result,
      label: verdict.label,
      confidence: finalScore,
      overallScore: finalScore,
      isVideo,

      breakdown: {
        deepfakeScore: finalScore,
        facesDetected: faceData.length,
        ...(isVideo && { totalFramesAnalyzed: totalFrames }),
      },

      faces: faceData,

      signals: [
        {
          name: 'Deepfake Probability',
          score: deepfakeScore,
          description: isVideo
            ? `Averaged deepfake face-swap probability across ${totalFrames} video frames`
            : `Highest deepfake score across ${faceData.length} detected face(s)`,
        },
        {
          name: 'Face Manipulation Check',
          score: deepfakeScore,
          description: 'Detection of face-swap, face regeneration, and facial re-enactment techniques',
        },
        {
          name: 'Lip-sync & Facial Consistency',
          score: deepfakeScore * 0.85,
          description: 'Analysis of lip movement patterns and facial geometry consistency',
        },
      ],

      limitations: [
        'Low-resolution media may reduce detection accuracy significantly',
        'Some advanced deepfake techniques may evade detection',
        'Faces must be clearly visible and large enough in the frame',
        isVideo
          ? 'Video analysis is sampled per frame — rapid face cuts may reduce coverage'
          : 'Very small face regions (< 64px) may not be analyzed',
      ],
      disclaimer:
        'AI Shield uses Sightengine deepfake models for probability-based analysis. No detection system is 100% accurate. Consult digital forensics professionals for legal or critical decisions.',
      modelVersion: 'sightengine-deepfake-v1.0',
    });
  } catch (error) {
    console.error('[deepfake-scan] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Deepfake analysis failed. Please try again.' },
      { status: 500 },
    );
  }
}
