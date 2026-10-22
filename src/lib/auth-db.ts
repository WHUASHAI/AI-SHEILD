import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { getPasswordDatabaseUrl } from './auth-settings';

const authGlobal = globalThis as unknown as { authDatabase?: PrismaClient };
let productionDatabase: PrismaClient | undefined;

function getAuthDatabase() {
  const connectionString = getPasswordDatabaseUrl();
  if (!connectionString) throw new Error('Account database is not configured.');
  const existing = process.env.NODE_ENV === 'production' ? productionDatabase : authGlobal.authDatabase;
  if (existing) return existing;
  const database = new PrismaClient({
    adapter: new PrismaPg({ connectionString, connectionTimeoutMillis: 3000, query_timeout: 3000, max: 5 }),
    log: [],
  });
  if (process.env.NODE_ENV === 'production') productionDatabase = database;
  else authGlobal.authDatabase = database;
  return database;
}

export async function findPasswordAccount(email: string) {
  return getAuthDatabase().user.findUnique({
    where: { email }, select: { id: true, name: true, email: true, emailVerified: true, passwordHash: true },
  });
}
