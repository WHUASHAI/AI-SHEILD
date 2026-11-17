import { env, pipeline, RawImage, type ImageClassificationPipeline } from '@huggingface/transformers';
import { MEDIA_MODELS, MAX_MEDIA_FRAMES, readMediaScore, localMediaResult, type MediaKind, type MediaPixels, type MediaPrediction } from '../lib/local-media-detector';

env.allowLocalModels = false;
env.useBrowserCache = true;
env.backends.onnx.wasm!.numThreads = 1;
const models: Partial<Record<'image' | 'deepfake', Promise<ImageClassificationPipeline>>> = {};
let busy = false;
self.addEventListener('message', async (event: MessageEvent<{ id: string; kind: MediaKind; isVideo: boolean; frames: MediaPixels[] }>) => {
  const { id, kind, frames, isVideo } = event.data;
  if (busy) { self.postMessage({ id, type: 'error', message: 'A backup analysis is already running.' }); return; }
  busy = true;
  const progress = (message: string) => self.postMessage({ id, type: 'progress', message });
  try {
    if (!['image', 'video', 'deepfake'].includes(kind) || !frames?.length || frames.length > MAX_MEDIA_FRAMES) throw new Error('Invalid media input.');
    const required: Array<'image' | 'deepfake'> = kind === 'video' ? ['image', 'deepfake'] : [kind];
    const predictions: MediaPrediction[] = [];
    for (const [index, frame] of frames.entries()) {
      if (!Number.isInteger(frame.width) || !Number.isInteger(frame.height) || frame.width < 1 || frame.height < 1
        || frame.width > 1024 || frame.height > 1024 || frame.data.length !== frame.width * frame.height * 4) throw new Error('Invalid image pixels.');
      const image = new RawImage(frame.data, frame.width, frame.height, 4).rgb();
      const prediction: MediaPrediction = { timestamp: frame.timestamp };
      for (const modelKind of required) {
        const config = MEDIA_MODELS[modelKind];
        if (!models[modelKind]) {
          progress(`Preparing free ${modelKind} backup. The first use downloads its model...`);
          models[modelKind] = pipeline<'image-classification'>('image-classification', config.id, {
            revision: config.revision, dtype: 'q8', device: 'wasm',
            progress_callback: (status: { status: string; file?: string; progress?: number }) => {
              if (status.status === 'progress' && status.file?.endsWith('.onnx')) progress(`Preparing ${modelKind} backup: ${Math.round(status.progress ?? 0)}%...`);
            },
          }) as Promise<ImageClassificationPipeline>;
          models[modelKind]!.catch(() => { delete models[modelKind]; });
        }
        const classifier = await models[modelKind]!;
        progress(`Checking ${isVideo ? 'sampled frame' : 'image'} ${index + 1} of ${frames.length} with the ${modelKind} backup...`);
        const score = readMediaScore(await classifier(image, { top_k: 2 }), modelKind);
        if (modelKind === 'image') prediction.ai = score; else prediction.deepfake = score;
      }
      predictions.push(prediction);
    }
    self.postMessage({ id, type: 'result', result: localMediaResult(kind, predictions, isVideo) });
  } catch {
    self.postMessage({ id, type: 'error', message: 'The free backup could not analyze this media. Check the model download connection and available memory, or use a current desktop browser. No verdict was generated.' });
  } finally { busy = false; }
});
