-- Apply only to an existing database that already contains the Prisma User table.
-- This adds password storage without marking any account as verified.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "passwordHash" TEXT;
