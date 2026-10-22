# Deploy persistent history to AI-SHIELD

The production target is the existing Vercel AI-SHIELD project and its connected Neon `ai-shield-db`. DATABASE_URL is already configured through that integration. Do not create a second database or put its connection string in chat or client code.

## 1. Initialize the empty Neon database

The user verified zero tables in the public schema. Open Neon SQL Editor on the branch/database attached to Vercel Production.

Copy the entire contents of [prisma/persistent-history.sql](../prisma/persistent-history.sql), including BEGIN and COMMIT, into the editor and run it once. This creates all 17 tables in the checked-in Prisma schema, including User, Account, Scan, ScanCompletion, and ScanStatisticsDay. It creates no sample accounts or scans.

The script checks that public has no existing base tables and stops if it finds any. Do not remove this guard or run a database reset. If it stops, inspect the actual schema and prepare an additive migration. If Neon reports an aborted transaction, run ROLLBACK before further queries. Do not also run scan-statistics.sql; its table is included here.

Verify with this read-only query:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

Expected: 17 tables, including the five named above. Then verify new history fields:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'Scan'
  AND column_name IN ('userId', 'guestSessionId', 'resultSnapshot', 'createdAt');
```

If Preview uses a different Neon branch, initialize its empty schema too. If both environments share one branch, the tables already exist after the first run; do not rerun the bootstrap there.

## 2. Deploy the reviewed implementation

Publish the feature branch through the project's normal Git/Vercel workflow. Do not deploy the old source and assume connecting DATABASE_URL enables history. The new code must be deployed after schema setup.

Keep DATABASE_URL as a server-only secret. Retain AUTH_SECRET, Google OAuth credentials and callback configuration, and detector provider keys. The connection string is read by the existing server Prisma adapter. Installation regenerates Prisma Client; requests do not create tables automatically.

See [detection provider behavior](detection-provider-behavior.md) for text-model limitations, explicit quota errors, and the one-live-test restriction. These code changes do not add provider credits or increase their allowances.

Check the Vercel deployment's build logs for success. No history can be reconstructed from earlier browser-only usage; this starts collecting real records after deployment. Existing registration routes outside this feature still report pending setup; this change does not implement account registration or password recovery. Configured verified Google sign-in provisions the database identity needed by history.

## 3. Validate on the live website

1. Choose Guest from the website. Old guest visits must enter Guest again to receive the new private cookie.
2. Complete a real provider-backed scan. Confirm the result says it was saved, then open History and View the result.
3. Refresh and reopen the browser. Guest history should remain in that browser while its cookies remain available. A different browser should not receive those results.
4. Sign in with Google and complete another real scan. Confirm account history is separate from guest history.
5. Sign out, close the website, return, and sign into the same account. Confirm its saved result remains. Repeat on another device with the same account.
6. Once there are more than 20 results, use Load next 20 results to reach older records.
7. Delete one result, then clear history if desired. Other users' records must remain private and unaffected. Shared totals must not decrease.
8. Open /api/statistics and Overview. Each newly recorded analysis contributes once. Plagiarism and inconclusive results affect total only. Demos and failed provider calls do not count.

Useful read-only checks, without exposing private content:

```sql
SELECT COUNT(*) AS saved_scans FROM "Scan";
SELECT COUNT(*) AS completion_receipts FROM "ScanCompletion";
SELECT COALESCE(SUM("totalScans"), 0) AS recorded_scans
FROM "ScanStatisticsDay";
```

Receipts and totals may exceed current history rows after deletion. This is expected.

## Behavior and limits

- Account results have no automatic expiry or 20-record storage cap. Twenty is the page size.
- Guest mode and its private cookie last 365 days. Private-cookie expiry renews with use. Cookie loss removes access; it does not erase the database rows. Guests have no cross-device recovery or automatic transfer on sign-in.
- Only allowlisted analysis summaries are stored. Uploaded files, submitted text, source snippets, and signed source URLs are not retained. Display names use the detector type rather than submitted text.
- Replays use the same operation key and cannot count twice, including after history deletion. Simultaneous in-flight retries may still invoke the external detector more than once; database completions are deduplicated.
- A transaction saves history, a completion receipt, and counters together. During a database outage, an otherwise completed analysis shows an explicit unsaved notice. Do not assume it was stored or automatically rerun a paid detector to repair storage.
- Browser-only historical records are not imported as verified results or added to shared totals.

## Validation boundary

Local verification covers the application tests, production build, TypeScript, focused lint, a disposable embedded PostgreSQL engine, and desktop/mobile browser interaction with controlled history API responses. SQL-engine checks exercise the actual emitted persistence SQL and transactional rollback through a test adapter, not Prisma's network connection to Neon. Browser checks exercise actual guest cookie issuance and database-unavailable responses, with fixtures for rendered history/account flows and plagiarism replays.

No production migration, Vercel deployment, real provider billing, Neon connection, independent multi-connection lock contention, or cross-device live account history has been verified in this workspace. Complete the live checks above after migration and deployment.
