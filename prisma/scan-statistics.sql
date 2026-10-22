-- Additive setup: no changes to account tables or personal scan history.
CREATE TABLE IF NOT EXISTS "ScanStatisticsDay" (
  "day" DATE PRIMARY KEY,
  "totalScans" INTEGER NOT NULL DEFAULT 0 CHECK ("totalScans" >= 0),
  "aiDetected" INTEGER NOT NULL DEFAULT 0 CHECK ("aiDetected" >= 0),
  "humanVerified" INTEGER NOT NULL DEFAULT 0 CHECK ("humanVerified" >= 0),
  CHECK ("aiDetected" + "humanVerified" <= "totalScans")
);

-- Backend connections write these counters; do not grant browser/anonymous table writes.
ALTER TABLE "ScanStatisticsDay" ENABLE ROW LEVEL SECURITY;
