import { env, pipeline, type TextClassificationPipeline } from '@huggingface/transformers';
import { francAll } from 'franc';
import { cleanLocalText, LOCAL_TEXT_MODEL, LOCAL_TEXT_REVISION, localTextResult, readLocalAiScore,
  selectTextPassages, validateLocalText, localTextWords, findPlatformMentions, findPlatformClues, LocalTextInputError,
  type LocalTextDepth } from '../lib/local-text-detector';
import { estimateSourceFamily } from './source-family-model';

env.allowLocalModels = false;
env.useBrowserCache = true;
// Works without cross-origin isolation / SharedArrayBuffer on the deployed site.
env.backends.onnx.wasm!.numThreads = 1;
let classifier: Promise<TextClassificationPipeline> | null = null;
let busy = false;

self.addEventListener('message', async (event: MessageEvent<{ id: string; text: string; depth?: LocalTextDepth }>) => {
  const { id, text, depth = 'thorough' } = event.data;
  if (busy) { self.postMessage({ id, type: 'error', message: 'A scan is already running.' }); return; }
  busy = true;
  const progress = (message: string) => self.postMessage({ id, type: 'progress', message });
  try {
    const cleaned = cleanLocalText(validateLocalText(text));
    const words = localTextWords(cleaned);
    if (!['quick', 'thorough'].includes(depth)) throw new LocalTextInputError('Choose a valid scan depth.');
    const candidates = francAll(cleaned, { minLength: 80 });
    const detectedLanguage = candidates[0]?.[0] ?? 'und';
    // Short, ordinary English can rank Scots first. Accept a near-tied English
    // runner-up in that specific case, retaining an explicit reliability warning.
    const languageUncertain = detectedLanguage === 'sco' && candidates[1]?.[0] === 'eng' && candidates[1][1] >= 0.95;
    const language = languageUncertain ? 'eng' : detectedLanguage;
    const unique = new Set(words.map(word => word.toLowerCase())).size;
    if (language !== 'eng') throw new LocalTextInputError('Unable to analyze: this detector supports English prose only. No authorship verdict was generated.');
    if (unique < 8 || unique / words.length < 0.02) throw new LocalTextInputError('Unable to analyze: the input is too repetitive for a useful prediction.');
    progress('Loading the local model. The first download is about 499 MB; keep this tab open.');
    if (!classifier) {
      classifier = pipeline<'text-classification'>('text-classification', LOCAL_TEXT_MODEL, {
        revision: LOCAL_TEXT_REVISION, dtype: 'fp32', device: 'wasm',
        progress_callback: (event: { status: string; file?: string; progress?: number }) => {
          if (event.status === 'progress' && event.file?.endsWith('.onnx')) {
            progress(`Downloading detector: ${Math.round(event.progress ?? 0)}%. First scan only if browser caching is available.`);
          }
        },
      }) as Promise<TextClassificationPipeline>;
      classifier.catch(() => { classifier = null; });
    }
    const detector = await classifier;
    const tokens = detector.tokenizer.encode(cleaned, { add_special_tokens: false });
    const selected = selectTextPassages(tokens, depth);
    const passages = [];
    for (const passage of selected.passages) {
      progress(`Checking passage ${passages.length + 1} of ${selected.passages.length} on this device...`);
      const excerpt = detector.tokenizer.decode(passage.tokens, { skip_special_tokens: true });
      const output = await detector(excerpt, { top_k: 2 });
      passages.push({ index: passage.index, tokens: passage.tokens.length, score: readLocalAiScore(output), excerpt });
    }
    const result = localTextResult({ wordCount: words.length, language, languageUncertain,
      platformMentions: findPlatformMentions(text), platformClues: findPlatformClues(text),
      passages, totalPassages: selected.totalPassages, totalTokens: tokens.length });
    if (result.result === 'Likely AI-Generated') {
      try { result.platformGuess = await estimateSourceFamily(cleaned, progress); }
      catch (error) {
        if (process.env.NODE_ENV === 'development') console.warn('Source-family estimation did not complete.', error);
        result.platformGuessUnavailable = true;
      }
    }
    self.postMessage({ id, type: 'result', result });
  } catch (error) {
    self.postMessage({ id, type: 'error', message: error instanceof LocalTextInputError ? error.message : 'The local detector could not run. Check the download connection and available memory, or try a desktop browser. No verdict was generated.' });
  } finally { busy = false; }
});
