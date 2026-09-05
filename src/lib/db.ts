import { PrismaClient } from '@prisma/client';
// Removed PrismaPg

function createPrismaClient() {
  return new PrismaClient({ log: ['error'] });
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
