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

    // ── Deterministic Mock Generator ──
    // Uses text hashing to return identical realistic results for the same text
    function hashString(str: string): number {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
      }
      return Math.abs(hash);
    }
    
    // Simulate real AI analysis delay based on text length
    const delay = Math.min(2500, 500 + text.length / 10);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    const seed = hashString(text);
    const aiProbability = ((seed % 90) + 10); // Between 10 and 99
    const isAi = aiProbability > 50;
    
    // The confidence of the WINNING result. 
    // If AI is 28%, it's 72% Human.
    const confidence = isAi ? aiProbability : (100 - aiProbability);
    
    const uniformityScore = isAi ? 0.7 + ((seed % 30) / 100) : 0.1 + ((seed % 40) / 100);
    const statisticalScore = isAi ? 0.65 + ((seed % 35) / 100) : 0.05 + ((seed % 45) / 100);
    
    // Deterministically pick an AI source model if it's flagged as AI
    const models = ['ChatGPT (GPT-4)', 'Claude 3 Opus', 'Google Gemini Pro', 'Llama 3', 'ChatGPT (GPT-3.5)'];
    const sourceModel = isAi ? models[seed % models.length] : null;

    const mockResult = {
      scanId: `scan_txt_${seed}`,
      language: language,
      status: 'completed',
      result: isAi ? 'Likely AI-Generated' : 'Likely Human-Created',
      sourceModel: sourceModel,
      confidence: confidence,
      overallScore: confidence,
      aiProbabilityScore: aiProbability,
      signals: [
        { name: 'Sentence Uniformity', score: Math.min(0.99, uniformityScore), description: 'Analysis of sentence structure variation (Burstiness)' },
        { name: 'Statistical Patterns', score: Math.min(0.99, statisticalScore), description: 'Analysis of token probability distribution (Perplexity)' },
      ],
      limitations: [
        'Results are probabilistic and may not be correct',
        'Shorter texts (< 100 words) have lower accuracy',
        'Text mixed with human edits may lower the AI score'
      ],
      disclaimer: 'AI Shield provides a probability-based analysis using deterministic mocks on the Free Tier. Results may contain false positives or false negatives.',
      modelVersion: 'mock-text-v1.0',
      wordCount: text.split(/\s+/).length,
    };
    
    return NextResponse.json(mockResult);
  } catch (error) {
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
