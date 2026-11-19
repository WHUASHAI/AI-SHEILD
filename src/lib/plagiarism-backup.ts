import { checkLocalPlagiarism, sampledSearchPhrases, type PlagiarismReference } from './local-plagiarism';
import { createProviderCooldown } from './detector-fallback';

type WikiHit = { pageid?: number; title?: string; snippet?: string };
const wikipediaCooldown = createProviderCooldown();

function snippetParagraphs(html: string) {
  // MediaWiki wraps hits in highlighting tags. Never render its HTML or
  // join words separated by an omission into a new matching phrase.
  return html.replace(/<[^>]+>/g, '')
    .replace(/&quot;/g, '"').replace(/&#039;|&apos;/g, "'").replace(/&amp;/g, '&')
    .split(/…|&hellip;|\.{3}/).map(part => part.trim()).filter(Boolean);
}

export async function runPlagiarismBackup(text: string, mode: string, signal: AbortSignal) {
  const local = checkLocalPlagiarism(text);
  const samples = sampledSearchPhrases(text, mode === 'deep' ? 5 : 3);
  const additional: PlagiarismReference[] = [];
  let searchedWikipedia = false;
  if (samples.length && !signal.aborted && !wikipediaCooldown.blocked()) {
    const query = new URLSearchParams({
      action: 'query', list: 'search', srnamespace: '0', srprop: 'snippet', srlimit: '10',
      srsearch: samples.map(phrase => '"' + phrase + '"').join(' OR '), format: 'json', origin: '*',
    });
    try {
      const response = await fetch('https://en.wikipedia.org/w/api.php?' + query, {
        credentials: 'omit', referrerPolicy: 'no-referrer',
        signal: AbortSignal.any([signal, AbortSignal.timeout(6000)]),
      });
      if (response.status === 429 || response.status >= 500) wikipediaCooldown.remember(response);
      if (response.ok) {
        const data = await response.json();
        if (!data?.error && Array.isArray(data?.query?.search)) {
          searchedWikipedia = true;
          for (const hit of data.query.search as WikiHit[]) {
            if (!hit || !Number.isSafeInteger(hit.pageid) || typeof hit.title !== 'string' || typeof hit.snippet !== 'string') continue;
            const paragraphs = snippetParagraphs(hit.snippet);
            if (paragraphs.length) additional.push({
              title: hit.title, url: 'https://en.wikipedia.org/?curid=' + hit.pageid, paragraphs,
            });
          }
        }
      }
    } catch {
      // A secondary outage still permits a completed local reference check.
    }
  }
  signal.throwIfAborted();
  return {
    mode: 'local-backup' as const, additional, searchedWikipedia,
    report: additional.length ? checkLocalPlagiarism(text, '', additional) : local,
  };
}

export type PlagiarismBackup = Awaited<ReturnType<typeof runPlagiarismBackup>>;
