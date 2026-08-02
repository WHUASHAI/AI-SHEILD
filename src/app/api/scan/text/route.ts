import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { franc } from 'franc';

const TextScanSchema = z.object({
  text: z.string().min(10).max(50000),
  // language: z.string().optional().default('en'), // Removed as we detect it now
  options: z.object({
    analyzePassages: z.boolean().optional().default(true),
  }).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = TextScanSchema.safeParse(body);
    
    if (!validated.success) {
      return NextResponse.json({ error: 'Invalid request', details: validated.error.errors }, { status: 400 });
    }
    
    const { text } = validated.data;
    
    // Detect language using franc
    const detectedLanguage = franc(text, { minLength: 3 });
    const language = detectedLanguage === 'und' ? 'en' : detectedLanguage;

    // Mock result - replace with real ML service later
    const confidence = Math.floor(Math.random() * 100);
    const isAi = confidence > 50;
    
    const mockResult = {
      scanId: `scan_${Date.now()}`,
      language: language,
      status: 'completed',
      result: isAi ? 'Likely AI-Generated' : 'Likely Human-Created',
      confidence: confidence,
      overallScore: confidence,
      signals: [
        { name: 'Sentence Uniformity', score: Math.random(), description: 'Analysis of sentence structure variation' },
        { name: 'Statistical Patterns', score: Math.random(), description: 'Analysis of token probability distribution' },
      ],
      limitations: [
        'Results are probabilistic and may not be correct',
      ],
      disclaimer: 'AI Shield provides a probability-based analysis. Results may contain false positives or false negatives.',
      modelVersion: '1.0.0',
      wordCount: text.split(/\s+/).length,
    };
    
    return NextResponse.json(mockResult);
  } catch (error) {
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
