export type MediaKind = 'image' | 'video' | 'deepfake';
export const MEDIA_MODELS = {
  image: { id: 'onnx-community/ai-image-detection-ONNX', revision: 'e3cfe99f2841930a040a6281682c10c989965603', positive: 'FAKE', negative: 'REAL' },
  deepfake: { id: 'onnx-community/Deep-Fake-Detector-v2-Model-ONNX', revision: '4ea3d66dfb1bedca29727c6a0c6fa061d5f3f9c9', positive: 'Deepfake', negative: 'Realism' },
} as const;
export const MAX_MEDIA_FRAMES = 8;
export interface MediaPixels { data: Uint8Array; width: number; height: number; timestamp: number; faces?: MediaPixels[] }
export interface MediaPrediction { timestamp: number; ai?: number; deepfake?: number; faceCount?: number }

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
    if (kind !== 'image' && (!Number.isInteger(frame.faceCount) || frame.faceCount! < 0 || frame.faceCount! > 5)) throw new Error('Face coverage is missing.');
    const required = [...(kind !== 'deepfake' ? [frame.ai] : []), ...(kind !== 'image' && frame.faceCount! > 0 ? [frame.deepfake] : [])];
    if (required.some(score => typeof score !== 'number' || !Number.isFinite(score) || score < 0 || score > 1)) {
      throw new Error('A media frame has no usable model score.');
    }
  }
  const ai = frames.reduce((sum, frame) => sum + (frame.ai ?? 0), 0) / frames.length;
  const faceFrames = kind === 'image' ? [] : frames.filter(frame => (frame.faceCount ?? 0) > 0);
  const deepfake = faceFrames.reduce((sum, frame) => sum + frame.deepfake!, 0) / (faceFrames.length || 1);
  const noFace = kind === 'deepfake' && !faceFrames.length;
  const result = noFace ? 'inconclusive' : kind !== 'image' && deepfake >= .5 ? 'deepfake' : kind !== 'deepfake' && ai >= .5 ? 'ai_generated' : 'human';
  const score = result === 'deepfake' ? deepfake : result === 'ai_generated' ? ai : 1 - (kind === 'deepfake' ? deepfake : Math.max(ai, deepfake));
  const models = kind === 'video' ? [MEDIA_MODELS.image, MEDIA_MODELS.deepfake] : [MEDIA_MODELS[kind]];
  return {
    status: 'completed', mode: 'local-backup', provider: 'On-device backup (ViT)',
    historySaved: false, statisticsRecorded: false, isVideo, result,
    label: noFace ? 'No Clear Faces Detected' : result === 'deepfake' ? 'Likely Deepfake' : result === 'ai_generated' ? 'Likely AI-Generated' : kind === 'deepfake' ? 'Lower Deepfake Signals' : 'Likely Human-Created',
    confidence: noFace ? null : percent(score), overallScore: noFace ? null : percent(score), deepfakeAnalyzed: faceFrames.length > 0,
    breakdown: {
      aiGenerated: kind === 'deepfake' ? null : percent(ai), photo: null, illustration: null, isEnhanced: false,
      facesDetected: kind === 'image' ? null : frames.reduce((sum, frame) => sum + frame.faceCount!, 0), deepfakeScore: faceFrames.length ? percent(deepfake) : null,
      avgAiGeneratedScore: percent(ai), avgDeepfakeScore: faceFrames.length ? percent(deepfake) : null, totalFramesAnalyzed: frames.length,
      aiSuspiciousFrames: frames.filter(frame => (frame.ai ?? 0) >= .5).length,
      deepfakeSuspiciousFrames: frames.filter(frame => (frame.deepfake ?? 0) >= .5).length,
    },
    faces: [],
    signals: [
      ...(kind !== 'deepfake' ? [{ name: 'AI image model score', score: ai, description: isVideo ? 'Mean AI class score across the sampled frames.' : 'AI class score from the local image classifier.' }] : []),
      ...(faceFrames.length ? [{ name: 'Visual deepfake model score', score: deepfake, description: 'Mean of the highest face-crop score in each frame with a detected face; no audio or identity analysis.' }] : []),
    ],
    timeline: frames.map(frame => ({ timestamp: frame.timestamp, aiScore: percent(frame.ai ?? 0), deepfakeScore: frame.deepfake === undefined ? null : percent(frame.deepfake) })),
    limitations: [
      'Experimental backup: class scores are not accuracy rates or proof of authenticity. New generators and edited or compressed media can be misclassified.',
      ...(kind !== 'deepfake' ? ['The image model was trained on CIFAKE; modern generators, artwork, and unfamiliar images may differ from its training data.'] : []),
      ...(kind !== 'image' ? ['Face detection checks up to five clear face regions per sampled frame. Face counts are crops checked, not unique people. Audio, lip-sync, identity, and faces the detector missed are not analyzed.'] : []),
      ...(noFace ? ['No clear faces were detected, so no deepfake score or authenticity verdict was generated.'] : []),
      ...(isVideo ? [`Only ${frames.length} frames were sampled. Unchecked moments and temporal manipulation may be missed.`] : []),
      'Local backup results stay on this page and are not saved to History or counted in website statistics.',
    ],
    disclaimer: 'An on-device model estimate. Review alongside the original media and other evidence.',
    modelVersion: models.map(model => `${model.id}@${model.revision}:q8`).join('; ') + (kind === 'image' ? '' : '; MediaPipe-1.2.3:BlazeFace-short-range-v1'),
  };
}
