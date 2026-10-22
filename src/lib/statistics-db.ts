import { getAuthDatabase as database } from './auth-db';
import type { DailyScanCounts, StatisticsRepository } from './platform-statistics';

export const statisticsRepository: StatisticsRepository = {
  async increment(day, category) {
    const utcDay = day.toISOString().slice(0, 10);
    // One parameterized statement preserves concurrent completions without a read/write race.
    await database().$executeRaw`
      INSERT INTO "ScanStatisticsDay" ("day", "totalScans", "aiDetected", "humanVerified")
      VALUES (${utcDay}::date, 1, ${category === 'ai' ? 1 : 0}, ${category === 'human' ? 1 : 0})
      ON CONFLICT ("day") DO UPDATE SET
        "totalScans" = "ScanStatisticsDay"."totalScans" + 1,
        "aiDetected" = "ScanStatisticsDay"."aiDetected" + EXCLUDED."aiDetected",
        "humanVerified" = "ScanStatisticsDay"."humanVerified" + EXCLUDED."humanVerified"
    `;
  },
  async readDays(through) {
    const utcDay = through.toISOString().slice(0, 10);
    return database().$queryRaw<DailyScanCounts[]>`
      SELECT "day", "totalScans", "aiDetected", "humanVerified"
      FROM "ScanStatisticsDay" WHERE "day" <= ${utcDay}::date ORDER BY "day"
    `;
  },
};
