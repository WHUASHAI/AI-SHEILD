import { FaceDetector, FilesetResolver } from '@mediapipe/tasks-vision';
import type { MediaPixels } from './local-media-detector';

export async function addFaceCrops(frames: MediaPixels[], progress: (text: string) => void, signal: AbortSignal) {
  progress('Locating faces for the free deepfake backup...');
  const files = await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.3/wasm');
  const detector = await FaceDetector.createFromOptions(files, {
    baseOptions: { modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite', delegate: 'CPU' },
    runningMode: 'IMAGE', minDetectionConfidence: .5,
  });
  try {
    for (const frame of frames) {
      if (signal.aborted) throw new Error('Analysis cancelled.');
      const canvas = document.createElement('canvas'); canvas.width = frame.width; canvas.height = frame.height;
      const context = canvas.getContext('2d'); if (!context) throw new Error('Face pixels could not be read.');
      context.putImageData(new ImageData(new Uint8ClampedArray(frame.data), frame.width, frame.height), 0, 0);
      frame.faces = [];
      for (const face of detector.detect(canvas).detections.slice(0, 5)) {
        const box = face.boundingBox; if (!box || box.width < 24 || box.height < 24) continue;
        const padding = Math.max(box.width, box.height) * .15;
        const x = Math.max(0, Math.floor(box.originX - padding)); const y = Math.max(0, Math.floor(box.originY - padding));
        const width = Math.min(frame.width - x, Math.ceil(box.width + 2 * padding));
        const height = Math.min(frame.height - y, Math.ceil(box.height + 2 * padding));
        if (width < 24 || height < 24) continue;
        const pixels = context.getImageData(x, y, width, height);
        frame.faces.push({data: new Uint8Array(pixels.data.buffer), width, height, timestamp: frame.timestamp});
      }
    }
  } finally { detector.close(); }
}
