type DemoFile = Pick<File, 'name' | 'type'>;

/** Explicit presentation fixture used only by the Deepfake page. */
export function isDeepfakeDemoFile(file?: DemoFile): boolean {
  if (!file || !file.name.toLowerCase().includes('clear')) return false;
  return file.type.toLowerCase().startsWith('video/')
    || (!file.type && /\.(mp4|mov|webm)$/i.test(file.name));
}

export function createDeepfakeDemoResult(file?: DemoFile) {
  if (!isDeepfakeDemoFile(file)) return null;
  return {
    scanId: 'preset',
    status: 'completed',
    mode: 'presentation-demo',
    provider: 'Presentation preset',
    isDemo: true,
    isReal: false,
    historySaved: false,
    statisticsRecorded: false,
    result: 'deepfake' as const,
    label: 'Deepfake Detected',
    confidence: 100,
    overallScore: 100,
    isVideo: true,
    breakdown: { deepfakeScore: 100, facesDetected: null, totalFramesAnalyzed: 0 },
    faces: [],
    signals: [],
    limitations: [
      'The 100% value is a presentation preset, not a measured detection result.',
      'This illustrative result is excluded from saved scans and website statistics.',
    ],
    disclaimer: '100% is a preset value, not a measured probability or an accuracy claim.',
  };
}
