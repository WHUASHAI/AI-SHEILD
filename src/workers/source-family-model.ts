import { AutoModelForSequenceClassification, AutoTokenizer, Tensor } from '@huggingface/transformers';
import { SOURCE_FAMILY_MODEL, SOURCE_FAMILY_REVISION, SOURCE_LABELS, remapSourceIds,
  sourceProbabilities, sourceWindows, summarizeSourceFamily } from '../lib/source-family';

async function loadIdMap(): Promise<Int32Array> {
  const url = `https://huggingface.co/${SOURCE_FAMILY_MODEL}/resolve/${SOURCE_FAMILY_REVISION}/id_map.bin`;
  let cache: Cache | undefined;
  try { if (typeof caches !== 'undefined') cache = await caches.open('elucid-source-model-v1'); } catch { /* Storage can be unavailable. */ }
  let response = await cache?.match(url);
  if (!response) {
    response = await fetch(url, { signal: AbortSignal.timeout(60000) });
    if (!response.ok) throw new Error('Could not load source vocabulary map.');
    try { await cache?.put(url, response.clone()); } catch { /* Inference does not require caching. */ }
  }
  const buffer = await response.arrayBuffer();
  if (buffer.byteLength !== 250002 * 4) throw new Error('Unexpected source vocabulary map size.');
  const view = new DataView(buffer);
  return Int32Array.from({ length: buffer.byteLength / 4 }, (_, index) => view.getInt32(index * 4, true));
}

async function loadModel(progress: (message: string) => void) {
  const options = { revision: SOURCE_FAMILY_REVISION };
  const [tokenizer, model, idMap] = await Promise.all([
    AutoTokenizer.from_pretrained(SOURCE_FAMILY_MODEL, options),
    AutoModelForSequenceClassification.from_pretrained(SOURCE_FAMILY_MODEL, {
      ...options, device: 'wasm',
      // fp32 selects the unsuffixed custom filename; the graph itself is int8.
      dtype: 'fp32', model_file_name: 'model_int8_ext', use_external_data_format: true,
      progress_callback: (event: { status: string; file?: string; progress?: number }) => {
        if (event.status === 'progress' && event.file?.endsWith('onnx_data')) {
          progress(`Preparing platform estimation: ${Math.round(event.progress ?? 0)}%...`);
        }
      },
    }),
    loadIdMap(),
  ]);
  const labels = (model.config as unknown as { id2label: Record<string, string> }).id2label;
  if (!SOURCE_LABELS.every((label, index) => labels?.[String(index)] === label)) {
    await model.dispose();
    throw new Error('Unexpected source-family labels.');
  }
  return { tokenizer, model, idMap };
}

let loaded: ReturnType<typeof loadModel> | null = null;

export async function estimateSourceFamily(text: string, progress: (message: string) => void) {
  progress('Estimating the AI model family...');
  if (!loaded) {
    loaded = loadModel(progress);
    loaded.catch(() => { loaded = null; });
  }
  const { tokenizer, model, idMap } = await loaded;
  const selected = sourceWindows(tokenizer.encode(text, { add_special_tokens: false }));
  const predictions = [];
  for (const window of selected.windows) {
    progress(`Estimating platform from passage ${predictions.length + 1} of ${selected.windows.length}...`);
    const ids = remapSourceIds([tokenizer.bos_token_id, ...window, tokenizer.eos_token_id], idMap);
    const input = new Tensor('int64', ids, [1, ids.length]);
    const mask = new Tensor('int64', new BigInt64Array(ids.length).fill(BigInt(1)), [1, ids.length]);
    let logits: Tensor | undefined;
    try {
      const output = await model({ input_ids: input, attention_mask: mask });
      logits = output.logits;
      const probabilities = sourceProbabilities(Array.from(logits!.data, value => Number(value)));
      predictions.push({ probabilities, tokens: window.length });
    } finally {
      input.dispose(); mask.dispose(); logits?.dispose();
    }
  }
  return summarizeSourceFamily(predictions, selected.total);
}
