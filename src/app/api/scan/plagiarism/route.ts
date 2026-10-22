import { NextRequest, NextResponse } from 'next/server';
import { requireSessionResponse } from '@/lib/require-session';
import { z } from 'zod';
import { ProviderError, readProviderJson } from '@/lib/provider-error';
import { providerFailure } from '@/lib/provider-response';
import { withScanHistory } from '@/lib/with-scan-history';

export const runtime    = 'nodejs';
export const maxDuration = 60;
export const dynamic    = 'force-dynamic';

const PlagiarismScanSchema = z.object({
  text: z.string().min(20, 'Text must be at least 20 characters').max(50000, 'Text too long'),
  mode: z.enum(['standard', 'deep', 'academic']).optional().default('standard'),
});

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function sentenceCount(text: string): number {
  return text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
}

/** 
 * Splits text into sentences and selects up to `maxSentences` random ones 
 * that are long enough to be unique (e.g. > 40 characters)
 */
function pickSentencesToCheck(text: string, maxSentences: number): string[] {
  const allSentences = text.split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 40 && s.split(/\s+/).length > 5);
  
  // Shuffle array
  for (let i = allSentences.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allSentences[i], allSentences[j]] = [allSentences[j], allSentences[i]];
  }

  return allSentences.slice(0, maxSentences);
}

async function searchSerpApi(sentence:string):Promise<{url:string;title:string;snippet:string}|null> {
  const key=process.env.SERP_API_KEY;
  if(!key)throw new ProviderError('Plagiarism search is not configured. Contact the website owner.',503,'PROVIDER_CONFIGURATION_ERROR');
  const params=new URLSearchParams({q:'"'+sentence+'"',api_key:key});
  const response=await fetch('https://serpapi.com/search.json?'+params.toString(),{headers:{Accept:'application/json'}});
  const data=await readProviderJson<{organic_results?:Array<{link:string;title:string;snippet:string}>}>(response,'SerpApi');
  const match=data.organic_results?.[0];
  return match?{url:match.link,title:match.title,snippet:match.snippet}:null;
}

async function analyze(req: NextRequest) {
  const unauthorized = await requireSessionResponse();
  if (unauthorized) return unauthorized;
  try {
    const body = await req.json();
    const validated = PlagiarismScanSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ error: 'Invalid request', details: validated.error.errors }, { status: 400 });
    }

    if (!process.env.SERP_API_KEY) {
      return NextResponse.json({ error: 'Plagiarism search is not configured. Contact the website owner.', code:'PROVIDER_CONFIGURATION_ERROR' }, { status: 503 });
    }

    const { text, mode = 'standard' } = validated.data;
    const wc = wordCount(text);
    const sc = sentenceCount(text);

    // Number of sentences to sample based on mode
    const numSamples = mode === 'deep' ? 5 : 3;
    const sentencesToCheck = pickSentencesToCheck(text, numSamples);
    
    if (sentencesToCheck.length === 0) {
      return NextResponse.json({ error: 'Text does not contain enough substantial sentences to scan.' }, { status: 400 });
    }

    const sources: Array<{id:string;title:string;url:string;domain:string;similarity:number;matchedWords:number;matchType:'exact';snippet:string;publishedDate:string}> = [];
    const sentenceBreakdown: Array<{sentence:string;similarityScore:number;flag:'high'|'low';matchedSource:string|null}> = [];
    let matchesFound = 0;

    // We check the sampled sentences against SerpApi (Google Search)
    for (const sentence of sentencesToCheck) {
      const match = await searchSerpApi(sentence);
      
      if (match) {
        matchesFound++;
        
        // Extract domain
        let domain = '';
        try {
          domain = new URL(match.url).hostname;
        } catch {
          domain = match.url;
        }

        // Avoid adding duplicate sources
        if (!sources.find(s => s.url === match.url)) {
          sources.push({
            id: `src_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            title: match.title || domain,
            url: match.url,
            domain: domain,
            similarity: 100, // Exact match
            matchedWords: sentence.split(/\s+/).length,
            matchType: 'exact',
            snippet: match.snippet || sentence,
            publishedDate: 'Unknown',
          });
        }
        
        sentenceBreakdown.push({
          sentence: sentence,
          similarityScore: 1.0,
          flag: 'high',
          matchedSource: domain,
        });
      } else {
        sentenceBreakdown.push({
          sentence: sentence,
          similarityScore: 0.0,
          flag: 'low',
          matchedSource: null,
        });
      }
    }

    // Calculate percentage based on samples
    const totalSimilarity = Math.round((matchesFound / sentencesToCheck.length) * 100);

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
      isReal: true,
      scanId: `plag_${Date.now()}`,
      status: 'completed',
      mode,
      analyzedAt: new Date().toISOString(),
      overallSimilarity: totalSimilarity,
      verdict,
      verdictColor,
      stats: {
        wordCount: wc,
        sentenceCount: sc,
        charactersCount: text.length,
        uniqueWords: new Set(text.toLowerCase().split(/\s+/)).size,
      },
      sources,
      totalSourcesChecked: sentencesToCheck.length, // Actual sampled search requests, not a claimed index size
      sentenceBreakdown,
      matchTypeBreakdown: {
        exact: sources.length > 0 ? totalSimilarity : 0,
        paraphrase: 0,
        structural: 0,
      },
      limitations:['This checks sampled sentences for web matches; the percentage is a sample match rate, not full-document plagiarism coverage.','Paraphrasing, structural similarity, and private academic databases are not assessed.'],
      _apiNote: 'Sampled exact-match web searches through SerpApi.',
    });
  } catch (error) {
    return providerFailure(error, 'Plagiarism search is temporarily unavailable. No originality verdict was generated.');
  }
}

export const POST = withScanHistory('plagiarism', analyze);
