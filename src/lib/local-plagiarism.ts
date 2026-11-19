import references from './plagiarism-references.json';

const phraseLength = 6;
export const plagiarismTextLimit = 50_000;
export type PlagiarismReference = { title: string; url: string; paragraphs: string[] };

function tokenize(text: string) {
  return Array.from(text.matchAll(/[\p{L}\p{N}][\p{L}\p{M}\p{N}]*/gu), match => ({
    word: match[0].normalize('NFKC').toLowerCase(),
    start: match.index,
    end: match.index + match[0].length,
  }));
}

function phrases(words: string[]) {
  return words.slice(phraseLength - 1).map((_, i) => words.slice(i, i + phraseLength).join(' '));
}

function indexReference(paragraphs: string[]) {
  return new Set(paragraphs.flatMap(text => phrases(tokenize(text).map(token => token.word))));
}

// Build the bundled index once, on the first local comparison in this tab.
function indexLibrary() {
  return references.map(({ title, url, paragraphs }) => ({ title, url, index: indexReference(paragraphs) }));
}
let library: ReturnType<typeof indexLibrary> | undefined;

export function checkLocalPlagiarism(text: string, reference = '', additional: PlagiarismReference[] = []) {
  if (text.trim().length < 20 || text.length > plagiarismTextLimit || reference.length > plagiarismTextLimit) {
    throw new Error('Use 20 to 50,000 characters of text and up to 50,000 characters of reference material.');
  }
  if (text.includes('\u0000') || text.startsWith('%PDF-') || text.startsWith('PK\u0003\u0004')) {
    throw new Error('Paste the document text or upload a plain-text file for the on-device comparison.');
  }
  const tokens = tokenize(text);
  if (tokens.length < phraseLength) throw new Error('The on-device comparison needs at least six words.');
  library ??= indexLibrary();
  const sources = library.concat(additional.map(({ title, url, paragraphs }) => ({
    title, url, index: indexReference(paragraphs),
  })));
  if (reference.trim()) {
    const index = indexReference([reference]);
    if (!index.size) throw new Error('Include at least six words in the comparison source.');
    sources.push({ title: 'Your comparison source', url: '', index });
  }
  const submitted = phrases(tokens.map(token => token.word));
  const covered = new Uint8Array(tokens.length);
  const matches = [];
  for (const source of sources) {
    let matchedWords = 0;
    let coveredUntil = 0;
    let excerpt = '';
    for (const [i, phrase] of submitted.entries()) {
      if (!source.index.has(phrase)) continue;
      const end = i + phraseLength;
      matchedWords += end - Math.max(i, coveredUntil);
      covered.fill(1, i, end);
      coveredUntil = end;
      if (!excerpt) excerpt = text.slice(tokens[i].start, tokens[end - 1].end);
    }
    if (matchedWords) matches.push({ title: source.title, url: source.url, matchedWords, excerpt });
  }
  const matchedWords = covered.reduce((total, word) => total + word, 0);
  return {
    mode: 'local-backup' as const, historySaved: false, statisticsRecorded: false,
    wordCount: tokens.length, matchedWords, overlap: Math.round(1000 * matchedWords / tokens.length) / 10,
    matches: matches.sort((a, b) => b.matchedWords - a.matchedWords),
    sourcesChecked: sources.map(({ title, url }) => ({ title, url })),
  };
}

export function sampledSearchPhrases(text: string, limit: number) {
  const words = tokenize(text).map(token => token.word);
  const count = Math.min(limit, Math.floor(words.length / phraseLength));
  const samples = new Set<string>();
  for (let i = 0; i < count; i++) {
    const start = count === 1 ? 0 : Math.round(i * (words.length - phraseLength) / (count - 1));
    const phrase = words.slice(start, start + phraseLength).join(' ');
    if (phrase.length <= 120) samples.add(phrase);
  }
  return [...samples];
}
