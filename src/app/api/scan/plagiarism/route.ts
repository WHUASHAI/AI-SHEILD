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

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/** Generate realistic-looking mock matched sources deterministically */
function generateMockSources(text: string, mode: string) {
  const seed = hashString(text);
  
  // Intelligent mock heuristic: if the text is quite long (likely copy-pasted from Wikipedia)
  // or contains encyclopedic structures like "is a", force it to be flagged as Wikipedia plagiarism.
  const isWikipediaLike = text.length > 250 || /is a|was a|refers to/i.test(text.substring(0, 50));
  const isHighPlagiarism = isWikipediaLike || (seed % 100) > 60; 
  const deepMultiplier = mode === 'deep' ? 1.3 : mode === 'academic' ? 1.15 : 1;

  const sources = [];
  
  if (isHighPlagiarism) {
    // If it triggered the intelligent heuristic, try to guess the subject from the first few words
    const subject = text.trim().split(/\s+/).slice(0, 3).join('_').replace(/[^a-zA-Z_]/g, '');
    const wikiUrl = isWikipediaLike ? `https://en.wikipedia.org/wiki/${subject || 'Article'}` : 'https://en.wikipedia.org/wiki/Artificial_intelligence';
    const wikiTitle = isWikipediaLike ? `Wikipedia – ${subject.replace(/_/g, ' ') || 'Article'}` : 'Wikipedia – Artificial Intelligence';

    sources.push(
      {
        id: `src_${seed % 1000}`,
        title: wikiTitle,
        url: wikiUrl,
        domain: 'en.wikipedia.org',
        similarity: Math.min(Math.floor((75 + (seed % 20)) * deepMultiplier), 100),
        matchedWords: Math.floor(text.split(/\s+/).length * 0.8),
        matchType: 'exact' as const,
        snippet: text.substring(0, 150) + '...',
        publishedDate: '2024-01-15',
      },
      {
        id: `src_${(seed + 1) % 1000}`,
        title: 'MIT Technology Review – Analysis',
        url: 'https://www.technologyreview.com/analysis',
        domain: 'technologyreview.com',
        similarity: Math.min(Math.floor((25 + (seed % 15)) * deepMultiplier), 100),
        matchedWords: 29 + (seed % 20),
        matchType: 'paraphrase' as const,
        snippet: text.length > 200 ? text.substring(100, 250) + '...' : text.substring(0, 50) + '...',
        publishedDate: '2023-11-08',
      }
    );
  } else if ((seed % 100) > 30) {
    // Medium plagiarism
    sources.push({
      id: `src_${seed % 1000}`,
      title: 'Stanford Encyclopedia of Philosophy',
      url: 'https://plato.stanford.edu/entries/artificial-intelligence/',
      domain: 'plato.stanford.edu',
      similarity: Math.min(Math.floor((15 + (seed % 15)) * deepMultiplier), 100),
      matchedWords: 14 + (seed % 10),
      matchType: 'paraphrase' as const,
      snippet: text.substring(0, 100) + '...',
      publishedDate: '2023-09-20',
    });
  }

  // Add random structural match for academic/deep modes
  if (mode !== 'standard' && (seed % 2 === 0)) {
    sources.push({
      id: `src_${(seed + 2) % 1000}`,
      title: 'ResearchGate – Algorithmic Bias in ML Systems',
      url: 'https://www.researchgate.net/publication/12345678',
      domain: 'researchgate.net',
      similarity: Math.min(Math.floor((8 + (seed % 10)) * deepMultiplier), 100),
      matchedWords: 8 + (seed % 5),
      matchType: 'structural' as const,
      snippet: text.substring(0, 80) + '...',
      publishedDate: '2023-07-12',
    });
  }

  return sources;
}

/** Produce a per-sentence breakdown with similarity scores deterministically */
function generateSentenceAnalysis(text: string) {
  const seed = hashString(text);
  const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 10);
  
  return sentences.slice(0, 12).map((sentence, i) => {
    const score = ((seed + i * 17) % 100) / 100;
    // Boost score if it's a "plagiarized" document based on seed
    const finalScore = ((seed % 100) > 60) ? Math.min(1, score + 0.3) : score * 0.5;

    return {
      sentence: sentence.trim().slice(0, 140),
      similarityScore: finalScore,
      flag: finalScore > 0.6 ? ('high' as const) : finalScore > 0.3 ? ('medium' as const) : ('low' as const),
      matchedSource: finalScore > 0.6 ? 'en.wikipedia.org' : finalScore > 0.3 ? 'technologyreview.com' : null,
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
