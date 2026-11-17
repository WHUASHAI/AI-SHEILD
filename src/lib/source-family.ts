// MIT-licensed five-class source-family model; this is an estimate, not provenance.
export const SOURCE_FAMILY_MODEL = 'Mike0307/ai-text-detector-zh-en';
export const SOURCE_FAMILY_REVISION = 'dacee250b0f45b2aaed394bb20ca36da34f1f2e3';
export const SOURCE_LABELS = ['human', 'openai', 'anthropic', 'google', 'other_ai'] as const;
export type AiSourceFamily = 'openai' | 'anthropic' | 'google' | 'other_ai';
const FAMILY_NAMES: Record<AiSourceFamily, string> = {
  openai: 'ChatGPT / OpenAI', anthropic: 'Claude / Anthropic', google: 'Gemini / Google', other_ai: 'Other AI family',
};
export interface SourceFamilyGuess {
  family: AiSourceFamily;
  label: string;
  method: 'trained-model-family';
  analyzedPassages: number;
  totalPassages: number;
  model: string;
  candidates: Array<{ family: AiSourceFamily; label: string; score: number }>;
}

export function sourceWindows(tokens: number[]) {
  if (!tokens.length) throw new Error('No source-model tokens.');
  const total = Math.ceil(tokens.length / 254); // 256-token context, including BOS/EOS.
  const length = Math.ceil(tokens.length / total);
  const count = Math.min(total, 3);
  return { total, windows: Array.from({ length: count }, (_, i) => {
    const index = count === 1 ? 0 : Math.round(i * (total - 1) / (count - 1));
    return tokens.slice(index * length, Math.min((index + 1) * length, tokens.length));
  }) };
}

export function remapSourceIds(tokens: number[], idMap: Int32Array): BigInt64Array {
  return BigInt64Array.from(tokens, id => {
    if (!Number.isInteger(id) || id < 0 || id >= idMap.length) throw new Error('Invalid source tokenizer id.');
    const mapped = idMap[id];
    if (!Number.isInteger(mapped) || mapped < 0 || mapped >= 141877) throw new Error('Invalid source vocabulary map.');
    return BigInt(mapped);
  });
}

export function sourceProbabilities(logits: number[]): number[] {
  if (logits.length !== SOURCE_LABELS.length || logits.some(value => !Number.isFinite(value))) throw new Error('Invalid source-model logits.');
  const peak = Math.max(...logits);
  const values = logits.map(value => Math.exp(value - peak));
  const sum = values.reduce((a, b) => a + b, 0);
  return values.map(value => value / sum);
}

export function summarizeSourceFamily(predictions: Array<{ probabilities: number[]; tokens: number }>, totalPassages: number): SourceFamilyGuess {
  if (!predictions.length) throw new Error('No source predictions.');
  const summed = Array(5).fill(0) as number[];
  for (const prediction of predictions) {
    if (prediction.probabilities.length !== 5 || !Number.isFinite(prediction.tokens) || prediction.tokens <= 0
      || prediction.probabilities.some(value => !Number.isFinite(value) || value < 0 || value > 1)
      || Math.abs(prediction.probabilities.reduce((a, b) => a + b, 0) - 1) > .01) throw new Error('Invalid source predictions.');
    prediction.probabilities.forEach((value, index) => { summed[index] += value * prediction.tokens; });
  }
  // The primary detector already selected AI. Compare AI families, not the human class.
  let winner = 1;
  for (let i = 2; i < 5; i++) if (summed[i] > summed[winner]) winner = i;
  if (summed.slice(1).every(score => score === 0)) throw new Error('No AI family evidence.');
  const family = SOURCE_LABELS[winner] as SourceFamilyGuess['family'];
  const totalAi = summed.slice(1).reduce((a, b) => a + b, 0);
  const candidates = (SOURCE_LABELS.slice(1) as AiSourceFamily[]).map((entry, index) => ({
    family: entry, label: FAMILY_NAMES[entry], score: summed[index + 1] / totalAi,
  })).sort((a, b) => b.score - a.score);
  return { family, label: FAMILY_NAMES[family], candidates,
    method: 'trained-model-family', analyzedPassages: predictions.length, totalPassages,
    model: `${SOURCE_FAMILY_MODEL}@${SOURCE_FAMILY_REVISION}` };
}
