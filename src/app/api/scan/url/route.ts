import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const UrlScanSchema = z.object({
  url: z.string().url(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = UrlScanSchema.safeParse(body);
    
    if (!validated.success) {
      return NextResponse.json({ error: 'Invalid URL', details: validated.error.errors }, { status: 400 });
    }
    
    // Mock result - replace with real ML service later
    const confidence = Math.floor(Math.random() * 100);
    const isAi = confidence > 50;
    
    const mockResult = {
      scanId: `scan_${Date.now()}`,
      status: 'completed',
      result: isAi ? 'Likely AI-Generated' : 'Likely Human-Created',
      confidence: confidence,
      overallScore: confidence,
      signals: [
        { name: 'Domain Reputation', score: Math.random(), description: 'Domain is well-established' },
        { name: 'Content Consistency', score: Math.random(), description: 'Content matches site historical patterns' },
      ],
      limitations: ['URL scanning is in beta'],
      disclaimer: 'AI Sheild provides a probability-based analysis.',
    };
    
    return NextResponse.json(mockResult);
  } catch (error) {
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
