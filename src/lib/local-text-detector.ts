import type { SourceFamilyGuess } from './source-family';
// The primary model and browser conversion are Apache-2.0. See docs/local-text-detector.md.
export const LOCAL_TEXT_MODEL = 'Lynote/fakespot-ai-roberta-base-ai-text-detection-v1-browser';
export const LOCAL_TEXT_REVISION = '75d794c69eecf566e98aa7717327aed159f21f21';
export const LOCAL_TEXT_DOWNLOAD_MB = 499;
export const MIN_LOCAL_TEXT_WORDS = 50;
export const MAX_LOCAL_TEXT_CHARACTERS = 50000;
export type LocalTextDepth = 'thorough' | 'quick';
const TOKENS_PER_PASSAGE = 384;
const MAX_PASSAGES = 8;

export class LocalTextInputError extends Error {}

export interface PlatformClue {
  platform: string;
  kind: 'self-identification' | 'source-credit';
  excerpt: string;
}

export interface LocalTextResult {
  status: 'completed';
  mode: 'local';
  provider: string;
  result: 'Likely AI-Generated' | 'Likely Human-Created';
  overallScore: number;
  humanScore: number;
  verdictScore: number;
  sourceModel: null;
  platformMentions: string[];
  platformClues: PlatformClue[];
  platformGuess?: SourceFamilyGuess;
  platformGuessUnavailable?: boolean;
  lowConfidence: boolean;
  language: string;
  wordCount: number;
  signals: Array<{ name: string; score: number; description: string }>;
  limitations: string[];
  disclaimer: string;
  modelVersion: string;
  passages: Array<{ index: number; score: number; tokens: number; excerpt: string }>;
  coverage: { checkedPassages: number; totalPassages: number; checkedTokens: number; totalTokens: number };
}

export function validateLocalText(value: unknown): string {
  if (typeof value !== 'string' || value.trim().length > MAX_LOCAL_TEXT_CHARACTERS
    || localTextWordCount(value) < MIN_LOCAL_TEXT_WORDS) {
    throw new LocalTextInputError(`Enter at least ${MIN_LOCAL_TEXT_WORDS} readable words, up to 50,000 characters.`);
  }
  return value.trim();
}

export function localTextWords(cleaned: string): string[] {
  return cleaned.match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu) ?? [];
}

export function localTextWordCount(text: string): number {
  return localTextWords(cleanLocalText(text)).length;
}

// These are literal mentions, never verified attribution or evidence of AI authorship.
export function findPlatformMentions(text: string): string[] {
  return ['ChatGPT', 'OpenAI', 'Claude', 'Anthropic', 'Gemini', 'Copilot', 'DeepSeek',
    'Grok', 'Perplexity', 'Meta AI', 'Mistral', 'Qwen'].filter(name =>
    new RegExp(`\\b${name.replace(' ', '\\s+')}\\b`, 'i').test(text));
}

// Parse explicit source claims only. This is not a generator-classification model.
// Names, generic writing style, and AI scores cannot establish platform identity.
export function findPlatformClues(text: string): PlatformClue[] {
  const normalized = text.replace(/[’‘]/g, "'");
  const clues: PlatformClue[] = [];
  for (const platform of findPlatformMentions(normalized)) {
    const name = platform.replace(' ', '\\s+');
    const rules: Array<{ kind: PlatformClue['kind']; expression: RegExp }> = [
      { kind: 'self-identification', expression: new RegExp(`\\b(?:I\\s+am|I'm|my\\s+name\\s+is)\\s+${name}\\b(?=\\s*[,.;:!?]|\\s+(?:an?\\s+)?(?:AI|assistant|language\\s+model)\\b|$)`, 'gi') },
      { kind: 'self-identification', expression: new RegExp(`\\b(?:I\\s+am|I'm)\\s+(?:an?\\s+)?(?:AI\\s+)?(?:assistant|language\\s+model)[^.!?\\n]{0,80}?\\b(?:created|developed|trained)\\s+by\\s+${name}\\b`, 'gi') },
      { kind: 'source-credit', expression: new RegExp(`\\b(?:generated|written|produced)\\s+(?:by|using|with)\\s+${name}\\b`, 'gi') },
    ];
    for (const rule of rules) {
      for (const match of normalized.matchAll(rule.expression)) {
        const start = match.index!;
        const before = normalized.slice(Math.max(0, start - 80), start);
        // Do not turn negations or questions into source claims.
        if (/(?:\bnot|\bnever|\bisn't|\bwasn't|\baren't|\bweren't|\bdidn't)\s+(?:\w+\s+){0,3}$/i.test(before)) continue;
        const after = normalized.slice(start + match[0].length);
        if (/^[^.!?\n]*\?/.test(after)) continue;
        const hasNegatedIdentity = /^\b(?:I\s+am|I'm)\s+not\b/i.test(match[0]);
        if (hasNegatedIdentity) continue;
        clues.push({ platform, kind: rule.kind, excerpt: match[0].slice(0, 180) });
        break;
      }
      if (clues.some(clue => clue.platform === platform)) break;
    }
  }
  return clues;
}

// Port of the upstream Fakespot clean_text/clean_markdown preprocessing.
export function cleanLocalText(text: string): string {
  const entities: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
  return text.replace(/```[\s\S]*?```/g, '').replace(/`[^`]*`/g, '')
    .replace(/!\[.*?\]\(.*?\)/g, '').replace(/\[([^\]]+)\]\(.*?\)/g, '$1')
    .replace(/(\*\*|__)(.*?)\1/g, '$2').replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/#+ /g, '').replace(/^>.*$/gm, '')
    .replace(/^(\s*[-*+]|\d+\.)\s+/gm, '').replace(/^\s*[-*_]{3,}\s*$/gm, '')
    .replace(/\|.*?\|/g, '').replace(/<.*?>/g, '')
    .replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (entity, key: string) => {
      if (!key.startsWith('#')) return entities[key.toLowerCase()] ?? entity;
      const point = key[1].toLowerCase() === 'x' ? parseInt(key.slice(2), 16) : parseInt(key.slice(1), 10);
      return point > 0 && point <= 0x10ffff && !(point >= 0xd800 && point <= 0xdfff) ? String.fromCodePoint(point) : entity;
    })
    .replace(/\^M/g, ' ').replace(/\s+/g, ' ').replace(/ ,/g, ',').trim();
}

export function selectTextPassages(tokens: number[], depth: LocalTextDepth = 'thorough') {
  if (!tokens.length) throw new Error('No readable text remains after preprocessing.');
  const totalPassages = Math.ceil(tokens.length / TOKENS_PER_PASSAGE);
  const length = Math.ceil(tokens.length / totalPassages);
  const count = depth === 'quick' ? Math.min(totalPassages, MAX_PASSAGES) : totalPassages;
  return {
    totalPassages,
    passages: Array.from({ length: count }, (_, i) => {
      const index = count === 1 ? 0 : Math.round(i * (totalPassages - 1) / (count - 1));
      return { index, tokens: tokens.slice(index * length, Math.min((index + 1) * length, tokens.length)) };
    }),
  };
}

export function readLocalAiScore(output: unknown): number {
  if (!Array.isArray(output) || output.length !== 2) throw new Error('The local model returned an invalid prediction.');
  const predictions = output as Array<{ label?: unknown; score?: unknown }>;
  const ai = predictions.find(item => item.label === 'AI');
  const human = predictions.find(item => item.label === 'Human');
  if (typeof ai?.score !== 'number' || typeof human?.score !== 'number'
    || !Number.isFinite(ai.score) || !Number.isFinite(human.score)
    || ai.score < 0 || ai.score > 1 || human.score < 0 || human.score > 1
    || Math.abs(ai.score + human.score - 1) > 0.01) {
    throw new Error('The local model returned unexpected labels or scores.');
  }
  return ai.score;
}

export function localTextResult(input: { wordCount: number; language: string; platformMentions?: string[]; platformClues?: PlatformClue[];
  languageUncertain?: boolean;
  passages?: Array<{ index: number; score: number; tokens: number; excerpt?: string }>; totalPassages?: number; totalTokens?: number }): LocalTextResult {
  const passages = input.passages ?? [];
  if (!passages.length || input.wordCount < MIN_LOCAL_TEXT_WORDS || input.language !== 'eng'
    || passages.some(p => !Number.isFinite(p.score) || p.score < 0 || p.score > 1 || !Number.isFinite(p.tokens) || p.tokens <= 0)) {
    throw new Error('Invalid local passage scores.');
  }
  const checkedTokens = passages.reduce((sum, p) => sum + p.tokens, 0);
  const average = passages.reduce((sum, p) => sum + p.score * p.tokens, 0) / checkedTokens;
  const disagreement = passages.some(p => p.score <= 0.2) && passages.some(p => p.score >= 0.8);
  const uncertain = input.languageUncertain === true || disagreement || input.wordCount < 100 || (average > 0.2 && average < 0.8);
  const sampled = passages.length < (input.totalPassages ?? 0);
  const overallScore = Math.round(average * 1000) / 10;
  const humanScore = Math.round((100 - overallScore) * 10) / 10;
  return {
    status: 'completed', mode: 'local', provider: 'Fakespot on-device',
    result: average >= 0.5 ? 'Likely AI-Generated' : 'Likely Human-Created',
    overallScore, humanScore, verdictScore: average >= 0.5 ? overallScore : humanScore,
    sourceModel: null, platformMentions: input.platformMentions ?? [], platformClues: input.platformClues ?? [],
    lowConfidence: uncertain || sampled, language: input.language, wordCount: input.wordCount,
    signals: passages.map(p => ({ name: `Passage ${p.index + 1}`, score: p.score,
      description: `AI class score for ${p.tokens} tokens. A score is a model estimate, not proof of authorship.` })),
    passages: passages.map(p => ({ ...p, excerpt: (p.excerpt ?? '').slice(0, 320) })),
    coverage: { checkedPassages: passages.length, totalPassages: input.totalPassages ?? 0,
      checkedTokens, totalTokens: input.totalTokens ?? 0 },
    modelVersion: `${LOCAL_TEXT_MODEL}@${LOCAL_TEXT_REVISION}`,
    limitations: [
      ...(input.languageUncertain ? ['The automatic language check was ambiguous. This model supports English only; review its prediction with extra care.'] : []),
      ...(input.wordCount < 100 ? ['Short passage: the model has less context, so treat its prediction with extra care.'] : []),
      ...(average > 0.2 && average < 0.8 ? ['The model has weak separation between its AI and human predictions. The label follows the higher score.'] : []),
      ...(disagreement ? ['Passages disagree. This may reflect mixed writing or model error.'] : []),
      ...(sampled ? [`Only ${passages.length} of ${input.totalPassages} passages were sampled across the document. Unchecked passages may differ.`] : []),
      'Experimental English-only detector. Human, edited AI, and unfamiliar writing can be misclassified.',
      'AI model scores are not calibrated authorship probabilities or percentages of AI-written words.',
      'This model cannot identify the generator or check plagiarism.',
    ],
    disclaimer: 'Use this estimate alongside your own review. It cannot establish who wrote the text.',
  };
}
