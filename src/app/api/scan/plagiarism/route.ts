import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const PlagiarismScanSchema = z.object({
  text: z.string().min(20, 'Text must be at least 20 characters').max(50000, 'Text too long'),
  sourceUrl: z.string().url().optional().or(z.literal('')),
  mode: z.enum(['standard', 'deep', 'academic']).optional().default('standard'),
});

// ─────────────────────────────────────────────────────────────────────────────
// Utility helpers
// ─────────────────────────────────────────────────────────────────────────────

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function sentenceCount(text: string): number {
  return text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
}

/** Generate realistic-looking mock matched sources */
function generateMockSources(text: string, mode: string) {
  const deepMultiplier = mode === 'deep' ? 1.3 : mode === 'academic' ? 1.15 : 1;

  const sources = [
    {
      id: 'src_001',
      title: 'Wikipedia – Artificial Intelligence',
      url: 'https://en.wikipedia.org/wiki/Artificial_intelligence',
      domain: 'en.wikipedia.org',
      similarity: Math.min(Math.floor(31 * deepMultiplier), 100),
      matchedWords: 47,
      matchType: 'paraphrase' as const,
      snippet:
        'Artificial intelligence (AI) is the intelligence demonstrated by machines, as opposed to the natural intelligence displayed by animals including humans.',
      publishedDate: '2024-01-15',
    },
    {
      id: 'src_002',
      title: 'MIT Technology Review – The Future of AI',
      url: 'https://www.technologyreview.com/ai-future',
      domain: 'technologyreview.com',
      similarity: Math.min(Math.floor(18 * deepMultiplier), 100),
      matchedWords: 29,
      matchType: 'exact' as const,
      snippet:
        'AI systems have rapidly moved from science fiction to everyday reality, transforming industries from healthcare to finance.',
      publishedDate: '2023-11-08',
    },
    {
      id: 'src_003',
      title: 'Stanford Encyclopedia of Philosophy',
      url: 'https://plato.stanford.edu/entries/artificial-intelligence/',
      domain: 'plato.stanford.edu',
      similarity: Math.min(Math.floor(9 * deepMultiplier), 100),
      matchedWords: 14,
      matchType: 'paraphrase' as const,
      snippet:
        'Questions about ethical implications of autonomous systems have become central to modern philosophy of mind and technology.',
      publishedDate: '2023-09-20',
    },
    {
      id: 'src_004',
      title: 'Harvard Business Review – AI in the Workplace',
      url: 'https://hbr.org/ai-workplace',
      domain: 'hbr.org',
      similarity: Math.min(Math.floor(7 * deepMultiplier), 100),
      matchedWords: 11,
      matchType: 'structural' as const,
      snippet:
        'Organizations must carefully manage the transition to AI-powered workflows to avoid widening the digital divide.',
      publishedDate: '2024-02-29',
    },
  ];

  // For 'deep' or 'academic' mode, add extra sources
  if (mode !== 'standard') {
    sources.push({
      id: 'src_005',
      title: 'ResearchGate – Algorithmic Bias in ML Systems',
      url: 'https://www.researchgate.net/publication/12345678',
      domain: 'researchgate.net',
      similarity: Math.min(Math.floor(5 * deepMultiplier), 100),
      matchedWords: 8,
      matchType: 'paraphrase' as const,
      snippet:
        'Systematic biases embedded in training data propagate through learned models, producing disparate outcomes across demographic groups.',
      publishedDate: '2023-07-12',
    });
  }

  return sources;
}

/** Produce a per-sentence breakdown with similarity scores */
function generateSentenceAnalysis(text: string) {
  const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 10);
  return sentences.slice(0, 12).map((sentence, i) => {
    const base = [0.82, 0.12, 0.45, 0.05, 0.67, 0.28, 0.91, 0.14, 0.53, 0.07, 0.39, 0.22];
    const score = base[i % base.length];
    return {
      sentence: sentence.trim().slice(0, 140),
      similarityScore: score,
      flag: score > 0.6 ? ('high' as const) : score > 0.3 ? ('medium' as const) : ('low' as const),
      matchedSource: score > 0.6 ? 'en.wikipedia.org' : score > 0.3 ? 'technologyreview.com' : null,
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Route Handler
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = PlagiarismScanSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validated.error.errors },
        { status: 400 }
      );
    }

    const { text, mode = 'standard' } = validated.data;

    // Simulate slight processing latency signal
    const wc = wordCount(text);
    const sc = sentenceCount(text);

    const sources = generateMockSources(text, mode);
    const sentenceBreakdown = generateSentenceAnalysis(text);

    // Aggregate overall similarity (sum capped at 85 for realism)
    const totalSimilarity = Math.min(
      sources.reduce((acc, s) => acc + s.similarity, 0),
      85
    );

    const verdict =
      totalSimilarity >= 60
        ? 'High Plagiarism Risk'
        : totalSimilarity >= 30
        ? 'Moderate Plagiarism Risk'
        : totalSimilarity >= 10
        ? 'Low Plagiarism Risk'
        : 'Likely Original';

    const verdictColor =
      totalSimilarity >= 60
        ? 'red'
        : totalSimilarity >= 30
        ? 'amber'
        : totalSimilarity >= 10
        ? 'blue'
        : 'green';

    return NextResponse.json({
      scanId: `plag_${Date.now()}`,
      status: 'completed',
      mode,
      analyzedAt: new Date().toISOString(),

      // Overall metrics
      overallSimilarity: totalSimilarity,
      verdict,
      verdictColor,

      // Text stats
      stats: {
        wordCount: wc,
        sentenceCount: sc,
        charactersCount: text.length,
        uniqueWords: new Set(text.toLowerCase().split(/\s+/)).size,
      },

      // Matched sources
      sources,
      totalSourcesChecked: mode === 'deep' ? 12_500_000 : mode === 'academic' ? 8_000_000 : 5_000_000,

      // Per-sentence breakdown
      sentenceBreakdown,

      // Breakdown by match type
      matchTypeBreakdown: {
        exact: sources.filter(s => s.matchType === 'exact').reduce((a, s) => a + s.similarity, 0),
        paraphrase: sources.filter(s => s.matchType === 'paraphrase').reduce((a, s) => a + s.similarity, 0),
        structural: sources.filter(s => s.matchType === 'structural').reduce((a, s) => a + s.similarity, 0),
      },

      // Ready-to-swap API hint
      _apiNote:
        'This is a demo result. Replace POST /api/scan/plagiarism with your preferred API (Copyleaks, iThenticate, Turnitin, PlagScan, etc.) to get live results.',
    });
  } catch (error) {
    console.error('[plagiarism-scan] error:', error);
    return NextResponse.json({ error: 'Plagiarism analysis failed. Please try again.' }, { status: 500 });
  }
}
