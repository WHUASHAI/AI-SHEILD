export type ScanCategory = 'ai' | 'human' | 'other';
export type DailyScanCounts = { day: Date; totalScans: number; aiDetected: number; humanVerified: number };
export type PlatformStatistics = {
  totalScans: number; aiDetected: number; humanVerified: number; scansThisMonth: number; scansThisWeek: number;
  activity: Array<{ date: string; scans: number }>;
  scope: 'all-users'; timeZone: 'UTC'; updatedAt: string;
};
export type StatisticsRepository = {
  increment(day: Date, category: ScanCategory): Promise<void>;
  readDays(through: Date): Promise<DailyScanCounts[]>;
};

export function classifyScanResult(result: unknown): ScanCategory {
  if (typeof result !== 'string') return 'other';
  const normalized = result.trim().toLowerCase();
  if (['ai_generated', 'ai_edited', 'ai_enhanced', 'deepfake', 'likely ai-generated', 'likely ai-edited', 'likely ai-enhanced'].includes(normalized)) return 'ai';
  return ['human', 'likely human-created'].includes(normalized) ? 'human' : 'other';
}

export function summarizeStatistics(days: DailyScanCounts[], now = new Date()): PlatformStatistics {
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const activity = Array.from({ length: 7 }, (_, index) => ({
    date: new Date(today.getTime() - (6 - index) * 86400000).toISOString().slice(0, 10), scans: 0,
  }));
  const activityByDate = new Map(activity.map(day => [day.date, day]));
  let totalScans = 0, aiDetected = 0, humanVerified = 0, scansThisMonth = 0;
  for (const day of days) {
    if (day.day > today) continue;
    totalScans += day.totalScans;
    aiDetected += day.aiDetected;
    humanVerified += day.humanVerified;
    if (day.day >= monthStart) scansThisMonth += day.totalScans;
    const activityDay = activityByDate.get(day.day.toISOString().slice(0, 10));
    if (activityDay) activityDay.scans += day.totalScans;
  }
  return { totalScans, aiDetected, humanVerified, scansThisMonth,
    scansThisWeek: activity.reduce((sum, day) => sum + day.scans, 0), activity,
    scope: 'all-users', timeZone: 'UTC', updatedAt: now.toISOString() };
}

export function createPlatformStatistics(repository: StatisticsRepository, clock = () => new Date()) {
  return {
    async record(scan: { result?: unknown; isReal: boolean }) {
      if (!scan.isReal) return false;
      const now = clock();
      const day = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
      await repository.increment(day, classifyScanResult(scan.result));
      return true;
    },
    async read() {
      const now = clock();
      const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
      return summarizeStatistics(await repository.readDays(today), now);
    },
  };
}
