import { getPasswordDatabaseUrl } from './auth-settings';
import { createPlatformStatistics } from './platform-statistics';

async function service() {
  if (!getPasswordDatabaseUrl()) throw new Error('Statistics database is unavailable.');
  const { statisticsRepository } = await import('./statistics-db');
  return createPlatformStatistics(statisticsRepository);
}

export async function recordPlatformScan(scan: { result?: unknown; isReal: boolean }): Promise<boolean> {
  if (!scan.isReal || !getPasswordDatabaseUrl()) return false;
  try { return await (await service()).record(scan); }
  catch {
    // Statistics outages must not discard a completed analysis or expose database details.
    console.warn('[statistics] Could not record a completed scan.');
    return false;
  }
}

export async function readPlatformStatistics() { return (await service()).read(); }
