# Website-wide statistics

Shared counters now save in the same transaction as private scan history and completion receipts. Follow [persistent history setup](persistent-history-setup.md) for the empty Neon database. The complete bootstrap includes ScanStatisticsDay; do not run the separate counters SQL as well.

Overview reads GET /api/statistics. Real recorded text, image, video, deepfake, and plagiarism completions contribute to shared totals across guests and accounts. Plagiarism and inconclusive verdicts affect total only. Demos and failed provider calls do not count. Deleting personal history does not decrement totals. UTC days define activity and calendar-month counts.

An unconfigured or unavailable database returns 503, not fabricated totals. Analysis may still complete with historySaved:false and statisticsRecorded:false. Counting starts after database setup and deployment; old browser histories are not backfilled. See the setup guide for validation boundaries and production checks.
