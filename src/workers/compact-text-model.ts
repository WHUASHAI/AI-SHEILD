import { AutoModelForSequenceClassification, AutoTokenizer, TextClassificationPipeline } from '@huggingface/transformers';
import { LOCAL_TEXT_MODEL, LOCAL_TEXT_REVISION } from '../lib/local-text-detector';

// Same Fakespot checkpoint, independently exported to int8 (~125 MB).
export const COMPACT_TEXT_MODEL = 'backuplan/superprompts-ai-detector';
export const COMPACT_TEXT_REVISION = '04edfa6e698a83d1d49f74f125268c704002bcef';
export async function loadCompactTextModel(progress: (message: string) => void) {
  const [tokenizer, model] = await Promise.all([
    // Reuse the pinned, complete tokenizer from the original browser export.
    AutoTokenizer.from_pretrained(LOCAL_TEXT_MODEL, { revision: LOCAL_TEXT_REVISION }),
    AutoModelForSequenceClassification.from_pretrained(COMPACT_TEXT_MODEL, {
      revision: COMPACT_TEXT_REVISION, subfolder: '', model_file_name: 'model',
      // The filename has no suffix; the actual ONNX graph is int8, not fp32.
      dtype: 'fp32', device: 'wasm',
      progress_callback: (event: { status: string; file?: string; progress?: number }) => {
        if (event.status === 'progress' && event.file?.endsWith('.onnx')) progress(`Preparing smaller detector: ${Math.round(event.progress ?? 0)}%...`);
      },
    }),
  ]);
  const labels = (model.config as unknown as { id2label?: Record<string, string> }).id2label;
  if (labels?.['0'] !== 'Human' || labels?.['1'] !== 'AI') {
    await model.dispose(); throw new Error('Unexpected compact detector labels.');
  }
  return new TextClassificationPipeline({ task: 'text-classification', model, tokenizer });
}
