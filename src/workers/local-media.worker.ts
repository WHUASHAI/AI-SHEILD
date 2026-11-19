import { env, pipeline, RawImage, type ImageClassificationPipeline } from '@huggingface/transformers';
import { MEDIA_MODELS, MAX_MEDIA_FRAMES, readMediaScore, localMediaResult, type MediaKind, type MediaPixels, type MediaPrediction } from '../lib/local-media-detector';

env.allowLocalModels = false;
env.useBrowserCache = true;
env.backends.onnx.wasm!.numThreads = 1;
const models: Partial<Record<'image' | 'deepfake', Promise<ImageClassificationPipeline>>> = {};
let busy = false;
self.addEventListener('message', async (event: MessageEvent<{ id: string; kind: MediaKind; isVideo: boolean; frames: MediaPixels[] }>) => {
  const { id, kind, frames, isVideo } = event.data;
  if (busy) { self.postMessage({ id, type: 'error', message: 'An analysis is already running.' }); return; }
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
      const prediction: MediaPrediction = { timestamp: frame.timestamp, faceCount: frame.faces?.length };
      for (const modelKind of required) {
        if (modelKind === 'deepfake' && (!Array.isArray(frame.faces) || frame.faces.length > 5)) throw new Error('Missing face detection.');
        if (modelKind === 'deepfake' && !frame.faces!.length) continue;
        const config = MEDIA_MODELS[modelKind];
        if (!models[modelKind]) {
          progress(`Loading the ${modelKind} model. The first scan may need a download.`);
          models[modelKind] = pipeline<'image-classification'>('image-classification', config.id, {
            revision: config.revision, dtype: 'q8', device: 'wasm',
            progress_callback: (status: { status: string; file?: string; progress?: number }) => {
              if (status.status === 'progress' && status.file?.endsWith('.onnx')) progress(`Downloading the ${modelKind} model (${Math.round(status.progress ?? 0)}%)…`);
            },
          }) as Promise<ImageClassificationPipeline>;
          models[modelKind]!.catch(() => { delete models[modelKind]; });
        }
        const classifier = await models[modelKind]!;
        progress(isVideo ? `Analyzing frame ${index + 1} of ${frames.length}…` : 'Analyzing image…');
        const inputs = modelKind === 'image' ? [image] : frame.faces!.map(face => {
          if (face.width < 1 || face.height < 1 || face.width > 1024 || face.height > 1024 || face.data.length !== face.width * face.height * 4) throw new Error('Invalid face crop.');
          return new RawImage(face.data, face.width, face.height, 4).rgb();
        });
        const scores: number[] = [];
        for (const input of inputs) scores.push(readMediaScore(await classifier(input, { top_k: 2 }), modelKind));
        const score = Math.max(...scores);
        if (modelKind === 'image') prediction.ai = score; else prediction.deepfake = score;
      }
      predictions.push(prediction);
    }
    self.postMessage({ id, type: 'result', result: localMediaResult(kind, predictions, isVideo) });
  } catch {
    self.postMessage({ id, type: 'error', message: 'The model could not analyze this file. Check your internet connection and available memory, then try again.' });
  } finally { busy = false; }
});
