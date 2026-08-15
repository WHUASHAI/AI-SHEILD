import { NextRequest, NextResponse } from 'next/server';
import { checkImageFile } from '@/lib/sightengine';

export const runtime    = 'nodejs';
export const maxDuration = 60;
export const dynamic    = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') ?? '';

    if (!process.env.SIGHTENGINE_API_USER || !process.env.SIGHTENGINE_API_SECRET) {
      return NextResponse.json({ error: 'Sightengine credentials missing.' }, { status: 503 });
    }

    if (contentType.includes('multipart/form-data')) {
      const form = await req.formData();
      const isFrames = form.get('isFrames') === 'true';

      if (isFrames) {
        const frames: File[] = [];
        for (const [key, value] of form.entries()) {
          if (key.startsWith('frame_') && value instanceof File) {
            frames.push(value);
          }
        }

        if (frames.length === 0) {
          return NextResponse.json({ error: 'No frames provided.' }, { status: 400 });
        }

        const timeline = [];
        let totalAi = 0;
        let totalDf = 0;
        let aiSuspicious = 0;
        let dfSuspicious = 0;

        for (let i = 0; i < frames.length; i++) {
          const frame = frames[i];
          const res = await checkImageFile(frame, 'genai');
          
          let dfRes = null;
          try {
            dfRes = await checkImageFile(frame, 'deepfake');
          } catch(e) {}

          const aiRaw = res.type?.ai_generated ?? 0;
          const faces = (dfRes?.status === 'success' ? dfRes.faces : null) ?? [];
          const dfRaw = faces.reduce((max: number, f: any) => Math.max(max, f.deepfake), 0);

          totalAi += aiRaw;
          totalDf += dfRaw;

          if (aiRaw > 0.5) aiSuspicious++;
          if (dfRaw > 0.5) dfSuspicious++;

          timeline.push({
            timestamp: i + 1,
            aiScore: Math.round(aiRaw * 100),
            deepfakeScore: Math.round(dfRaw * 100)
          });
        }

        const avgAi = totalAi / frames.length;
        const avgDf = totalDf / frames.length;

        let result = 'human';
        let label = 'Likely Authentic';
        let confidence = Math.round((1 - avgAi) * 100);

        if (avgAi > 0.7 || avgDf > 0.5) {
          result = avgDf > 0.5 ? 'deepfake' : 'ai_generated';
          label = avgDf > 0.5 ? 'Deepfake Detected' : 'AI Generated Video';
          confidence = Math.round(Math.max(avgAi, avgDf) * 100);
        } else if (avgAi > 0.4) {
          result = 'ai_enhanced';
          label = 'Suspicious / Edited';
          confidence = Math.round(avgAi * 100);
        }

        return NextResponse.json({
          scanId: `vid_${Date.now()}`,
          status: 'completed',
          provider: 'Sightengine (Bypass Mode)',
          result,
          label,
          confidence,
          overallScore: confidence,
          breakdown: {
            avgAiGeneratedScore: Math.round(avgAi * 100),
            avgDeepfakeScore: Math.round(avgDf * 100),
            totalFramesAnalyzed: frames.length,
            aiSuspiciousFrames: aiSuspicious,
            deepfakeSuspiciousFrames: dfSuspicious,
          },
          signals: [
            { name: 'Average AI Generation Score', score: avgAi, description: 'Average AI generated probability across all frames' },
            { name: 'Average Deepfake Score', score: avgDf, description: 'Average face manipulation probability across all frames' },
          ],
          timeline,
          limitations: [
            'Only sampled keyframes were analyzed to save credits.',
            'Audio is not analyzed in bypass mode.'
          ],
          disclaimer: 'Used Frame Extraction Bypass via Sightengine Image API.',
        });
      }
    }
    
    return NextResponse.json({ error: 'URL mode is not supported with the bypass. Please upload a file.' }, { status: 400 });

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[video-scan] Unexpected error:', message);
    return NextResponse.json({ error: `Video analysis failed: ${message}` }, { status: 500 });
  }
}
