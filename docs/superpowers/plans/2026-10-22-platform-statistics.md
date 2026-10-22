# Website-wide scan statistics and History navigation

Objective: replace demo overview numbers with shared counts across Google and guest scans, and replace Reports with History immediately before Settings.

1. Add a PostgreSQL table of daily anonymous counters (UTC day, total, AI, likely-human). Use an atomic upsert so simultaneous scans do not overwrite each other. Keep browser history independent.
2. Add a pure statistics service and tests for verdict classification, exclusion of demo results, UTC month/year boundaries, seven daily activity values, empty data, and account-independent increments.
3. Connect successful text/image/video/deepfake/plagiarism server responses to the counter. Do not count failed provider calls, URL demos, or text mock fallbacks. Plagiarism affects total only. Do not upload personal history or raw content into these counters.
4. Add a read-only statistics endpoint and overview fetch with loading/error/empty states, refresh on focus/interval, real percentages, and real activity bars. Never replace a database outage with demo totals or invented zeroes.
5. Replace sidebar Reports with History before Settings. Preserve the existing 20-item guest/Google histories.
6. Document DATABASE_URL and additive SQL setup. Run targeted regression tests, the full test command, available syntax checks, and build. Report unavailable database/browser/build validation explicitly.

Dependencies: real website-wide collection requires a PostgreSQL DATABASE_URL in Vercel and the counters table. Existing local source has no configured database and no installed project dependencies. No hosted database or deployment credentials are available to this session.
