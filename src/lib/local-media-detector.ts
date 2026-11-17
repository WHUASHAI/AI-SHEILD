export type MediaKind = 'image' | 'video' | 'deepfake';
export const MEDIA_MODELS = {
  image: { id: 'onnx-community/ai-image-detection-ONNX', revision: 'e3cfe99f2841930a040a6281682c10c989965603', positive: 'FAKE', negative: 'REAL' },
  deepfake: { id: 'onnx-community/Deep-Fake-Detector-v2-Model-ONNX', revision: '4ea3d66dfb1bedca29727c6a0c6fa061d5f3f9c9', positive: 'Deepfake', negative: 'Realism' },
} as const;
export const MAX_MEDIA_FRAMES = 8;
export interface MediaPixels { data: Uint8Array; width: number; height: number; timestamp: number }
export interface MediaPrediction { timestamp: number; ai?: number; deepfake?: number }

export function readMediaScore(output: unknown, kind: 'image' | 'deepfake'): number {
  const labels = MEDIA_MODELS[kind];
  if (!Array.isArray(output) || output.length !== 2) throw new Error('The backup model returned an incomplete prediction.');
  const positive = output.find(item => item?.label === labels.positive)?.score;
  const negative = output.find(item => item?.label === labels.negative)?.score;
  if (![positive, negative].every(score => typeof score === 'number' && Number.isFinite(score) && score >= 0 && score <= 1)
    || Math.abs(positive + negative - 1) > .01) throw new Error('The backup model returned invalid scores.');
  return positive;
}

const percent = (value: number) => Math.round(value * 1000) / 10;
export function localMediaResult(kind: MediaKind, frames: MediaPrediction[], isVideo: boolean) {
  if (!['image', 'video', 'deepfake'].includes(kind) || !frames.length || frames.length > MAX_MEDIA_FRAMES
    || (!isVideo && frames.length !== 1) || (kind === 'video' && !isVideo)) throw new Error('Invalid backup coverage.');
  for (const frame of frames) {
    if (!Number.isFinite(frame.timestamp) || frame.timestamp < 0) throw new Error('Invalid frame timestamp.');
    const required = kind === 'video' ? [frame.ai, frame.deepfake] : [kind === 'image' ? frame.ai : frame.deepfake];
    if (required.some(score => typeof score !== 'number' || !Number.isFinite(score) || score < 0 || score > 1)) {
      throw new Error('A media frame has no usable model score.');
    }
  }
  const ai = frames.reduce((sum, frame) => sum + (frame.ai ?? 0), 0) / frames.length;
  const deepfake = frames.reduce((sum, frame) => sum + (frame.deepfake ?? 0), 0) / frames.length;
  const result = kind !== 'image' && deepfake >= .5 ? 'deepfake' : kind !== 'deepfake' && ai >= .5 ? 'ai_generated' : 'human';
  const score = result === 'deepfake' ? deepfake : result === 'ai_generated' ? ai : 1 - (kind === 'deepfake' ? deepfake : Math.max(ai, deepfake));
  const models = kind === 'video' ? [MEDIA_MODELS.image, MEDIA_MODELS.deepfake] : [MEDIA_MODELS[kind]];
  return {
    status: 'completed', mode: 'local-backup', provider: 'On-device backup (ViT)',
    historySaved: false, statisticsRecorded: false, isVideo, result,
    label: result === 'deepfake' ? 'Likely Deepfake' : result === 'ai_generated' ? 'Likely AI-Generated' : kind === 'deepfake' ? 'Lower Deepfake Signals' : 'Likely Human-Created',
    confidence: percent(score), overallScore: percent(score), deepfakeAnalyzed: kind !== 'image',
    breakdown: {
      aiGenerated: kind === 'deepfake' ? null : percent(ai), photo: null, illustration: null, isEnhanced: false,
      facesDetected: null, deepfakeScore: kind === 'image' ? null : percent(deepfake),
      avgAiGeneratedScore: percent(ai), avgDeepfakeScore: percent(deepfake), totalFramesAnalyzed: frames.length,
      aiSuspiciousFrames: frames.filter(frame => (frame.ai ?? 0) >= .5).length,
      deepfakeSuspiciousFrames: frames.filter(frame => (frame.deepfake ?? 0) >= .5).length,
    },
    faces: [],
    signals: [
      ...(kind !== 'deepfake' ? [{ name: 'AI image model score', score: ai, description: isVideo ? 'Mean AI class score across the sampled frames.' : 'AI class score from the local image classifier.' }] : []),
      ...(kind !== 'image' ? [{ name: 'Visual deepfake model score', score: deepfake, description: 'Image classifier trained on real and synthetic faces; no face localization or audio analysis.' }] : []),
    ],
    timeline: frames.map(frame => ({ timestamp: frame.timestamp, aiScore: percent(frame.ai ?? 0), deepfakeScore: percent(frame.deepfake ?? 0) })),
    limitations: [
      'Experimental backup: class scores are not accuracy rates or proof of authenticity. New generators and edited or compressed media can be misclassified.',
      ...(kind !== 'deepfake' ? ['The image model was trained on CIFAKE; modern generators, artwork, and unfamiliar images may differ from its training data.'] : []),
      ...(kind !== 'image' ? ['The deepfake model works best on clear portraits. It does not locate or count faces, verify identity, or check audio or lip-sync.'] : []),
      ...(isVideo ? [`Only ${frames.length} frames were sampled. Unchecked moments and temporal manipulation may be missed.`] : []),
      'Local backup results stay on this page and are not saved to History or counted in website statistics.',
    ],
    disclaimer: 'An on-device model estimate. Review alongside the original media and other evidence.',
    modelVersion: models.map(model => `${model.id}@${model.revision}:q8`).join('; '),
  };
}
