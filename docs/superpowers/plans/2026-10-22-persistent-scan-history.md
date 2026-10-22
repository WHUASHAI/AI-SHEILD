# Persistent Scan History Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Save private guest and account scan history in the existing Neon database, with persistent account access and accurate shared statistics.

**Architecture:** Resolve trusted account or guest ownership on the server. Persist canonical scan snapshots, completion receipts, and daily counter increments transactionally. Expose owner-scoped history APIs and replace browser-only history with paginated database reads.

**Tech Stack:** Next.js 16.2.12, React 19, Auth.js, Prisma 7, PostgreSQL/Neon, Node test runner.

**Spec:** docs/superpowers/specs/2026-10-22-persistent-scan-history.md

## Global Constraints

- Preserve existing uncommitted work. Do not commit unrelated changes or discard existing changes.
- Existing Neon ai-shield-db is connected in Vercel. User reports public schema has zero tables. Local database access is not configured; never print secrets.
- Signed-in history has no automatic expiry or 20-record storage cap. Display 20 records per page.
- Guest history remains separate on sign-in. Private guest cookie lasts 365 days and renews on use; cookie loss loses access, not database rows.
- No raw input, upload bytes, signed URLs, or credentials in persisted snapshots.
- Read the relevant installed Next.js guides before Next.js code changes.
- Do not modify production database or deploy until the concrete migration and deployment changes are reviewable.
- Use existing test conventions; run failing tests before implementing each behavioral unit.

## Review Focus

- Provider-prefixed session subjects must map to real User records; test credentials mapping, verified Google provisioning, and email collisions in Task 2.
- Two requests completing concurrently must not double-count; test concurrent replay and deleted-history replay in Task 3.
- Equal timestamps and new scans arriving between pages must not skip older records; test cursor boundaries in Task 4.
- Guest-mode flags and forged identity inputs must not expose another owner's data; test identity and route isolation in Tasks 2 and 4.
- Database failures must not masquerade as empty/saved history; test transactional rollback, unsaved completion, and UI errors in Tasks 3, 5, and 6.

## Task 1: Establish dependencies, framework guidance, and baseline

**Files:** package.json, package-lock.json, AGENTS.md, prisma.config.ts, installed node_modules/next/dist/docs.

**Interfaces:** Produces a usable local compiler/framework and recorded baseline failures; no application interface changes.

- [ ] Inspect git status and lockfile; preserve the current checkout's existing changes. Determine whether dependency installation requires network approval.
- [ ] Install from the existing lockfile with `npm ci`; investigate lockfile failures before changing versions. Run Prisma generation using the installed toolchain.
- [ ] Locate and read installed Next.js routing, asynchronous cookies/params, route handlers, and client data-fetching guides. Read React and targeted frontend testing skills before their tasks.
- [ ] Run `npm test`, `npm run lint`, `npx tsc --noEmit`, and `npm run build`; record baseline failures without claiming success for unavailable checks.

## Task 2: Establish private scan ownership

**Files:** Create src/lib/scan-owner.ts and tests/scan-owner.test.mjs. Modify src/lib/auth-db.ts, src/lib/auth.ts, src/lib/provider-verification.ts, src/app/api/guest/route.ts, src/lib/guest-mode.ts as needed without weakening existing verification.

**Interfaces:** Export `type ScanOwner = { kind: 'user'; id: string } | { kind: 'guest'; id: string }`. Export `resolveScanOwner(): Promise<ScanOwner>` using server auth/cookies; guest IDs returned here are hashes, never bearer tokens. Export pure token validation/hash helpers for tests. Represent unavailable identity services distinctly from unauthenticated access.

- [ ] Add failing tests for credentials provider-subject mapping, stable Google Account lookup, trusted Google provisioning, email collision rejection, malformed token rejection, and inability of the public guest flag alone to select an existing owner.
- [ ] Run `node --test tests/scan-owner.test.mjs`; confirm the new assertions fail for missing behavior.
- [ ] Resolve credentials users by their verified database ID and Google users by unique provider/providerAccountId. Create Google User/Account records transactionally from verified sign-in information; reject implicit email linking. Store stable mapping in the trusted token without accepting browser claims.
- [ ] Issue a 32-byte random guest token when guest mode is entered, preserving an existing valid token. Use a separate HttpOnly cookie, SameSite=Lax, Secure in production, path /, maxAge 31536000; renew on guest use. Hash tokens with SHA-256 for ownership. Never use the guest-mode flag as a private identity.
- [ ] Run identity tests and existing auth tests; resolve regressions before continuing.

## Task 3: Persist completed scans and counters atomically

**Files:** Modify prisma/schema.prisma, src/lib/statistics-db.ts, src/lib/scan-statistics.ts. Create src/lib/scan-persistence.ts, src/lib/scan-result-snapshot.ts, tests/scan-persistence.test.mjs, prisma/persistent-history.sql.

**Interfaces:** `CompletedScanInput` contains owner, operationKey, requestFingerprint, module (text/image/video/deepfake/plagiarism), displayName, snapshot, result, confidence, isReal. Export `completeScan(input: CompletedScanInput): Promise<{ scanId: string; replayed: boolean }>` and `findCompletedScan(owner: ScanOwner, operationKey: string, requestFingerprint: string)` returning missing, saved snapshot, or deleted receipt. Use explicit conflict errors for reused keys with different fingerprints and expired/deleted results. Snapshot types are JSON-compatible and contain allowlisted analysis fields only.

- [ ] Add failing tests for exactly-one-owner validation, snapshot redaction, concurrent completions, conflicting key reuse, deleted-history replay, transaction rollback, demo exclusion, and one video counter increment.
- [ ] Run `node --test tests/scan-persistence.test.mjs`; confirm expected failures.
- [ ] Add Scan snapshot and owner/date indexes. Add a completion receipt with unique owner scope/operation key, fingerprint, completion time, and optional scan reference that survives deletion. Put ownership constraints in SQL. Keep owner values server-derived.
- [ ] Use one shared Prisma connection module for history and statistics transaction operations. Persist receipt, Scan, and existing daily upsert in one transaction; handle uniqueness races by reading the winning receipt. Avoid retaining snapshot content in receipts.
- [ ] Generate full bootstrap SQL for the confirmed empty database from the final Prisma schema, including existing account tables, relations, indexes, and statistics. Include migration instructions for empty databases and explicitly reject using a reset against existing data. Do not execute remotely.
- [ ] Run persistence/statistics tests and `npx prisma validate`; verify generated SQL against the model and SQL ownership constraints.

## Task 4: Add private history APIs

**Files:** Create src/lib/scan-history-repository.ts, src/app/api/history/route.ts, src/app/api/history/[id]/route.ts, tests/scan-history-api.test.mjs. Modify src/lib/guest-mode.ts if route allowlists require it.

**Interfaces:** `HistoryItem` contains id, name, type, module, result, confidence, ISO createdAt, completed status. `listScanHistory(owner, cursor?): Promise<{ items: HistoryItem[]; nextCursor: string | null }>` returns 20 records newest first. Detail returns HistoryItem plus snapshot. Delete functions always require ScanOwner.

- [ ] Add failing tests for account/guest isolation, anonymous access denial, forged IDs, invalid cursor, equal timestamps, 21+ records, item deletion, clear-all ownership, missing records, and database failures.
- [ ] Run `node --test tests/scan-history-api.test.mjs`; verify failures.
- [ ] Implement GET /api/history with bounded validated createdAt/id cursor; GET /api/history/[id] with owner filter; DELETE for item and all-owner history. Return 404 for unowned details, 401 for missing identity, 400 for invalid input, 503 for database outages. Set Cache-Control private, no-store.
- [ ] Require trusted Origin for destructive requests; preserve completion receipts and counters on deletion. Permit guest history routes through middleware while retaining endpoint ownership checks.
- [ ] Run API and authentication-routing tests.

## Task 5: Integrate all detector routes and callers

**Files:** Modify src/app/api/scan/{text,image,video,deepfake,plagiarism}/route.ts, associated dashboard detector page.tsx files, tests/scan-statistics-routes.test.mjs. Create src/lib/scan-operation.ts and tests/scan-history-routes.test.mjs.

**Interfaces:** Browser sends an Idempotency-Key UUID per deliberate scan, reused for retries of identical input. Server fingerprints actual validated input plus detector options using a hash without storing raw input. Successful real response includes persistent scanId, historySaved:true, statisticsRecorded:true. Unsaved provider completion includes historySaved:false, statisticsRecorded:false and no invented persistent ID. Demo responses remain labeled and excluded.

- [ ] Add failing route tests for all five detectors: real completion, failed provider, demo fallback, duplicate key, conflicting input, database outage, guest owner, and single video count.
- [ ] Run `node --test tests/scan-history-routes.test.mjs tests/scan-statistics-routes.test.mjs`; confirm failures.
- [ ] Resolve owner and validate operation key before paid calls. Return existing results for completed retries; reject deleted receipt/conflicting reuse without calling the provider. Retain transactional deduplication for overlapping requests; do not imply exactly-once provider billing for concurrent in-flight calls.
- [ ] Normalize allowlisted result snapshots for all detectors, preserving result details without raw text/passages or source URLs that expose submitted content. Replace separate recordPlatformScan calls with completeScan.
- [ ] Update callers to send operation keys and input display names with bounded validation. Refresh history after successful save; show an explicit unsaved result warning if storage fails. Preserve current immediate analysis output.
- [ ] Run detector integration tests plus existing counter tests; confirm exactly one history row and increment per recorded operation.

## Task 6: Replace browser-only history and static result details

**Files:** Modify src/lib/use-recent-scans.ts, src/components/dashboard/recent-scans-table.tsx, src/app/(dashboard)/dashboard/{page.tsx,history/page.tsx,scans/[id]/page.tsx}. Retire or clearly isolate src/lib/scan-history-store.ts and its obsolete tests. Create tests/database-history-ui.test.mjs using existing frontend test tooling where available.

**Interfaces:** History hook returns scans, loading, error, nextCursor, loadMore, refresh, deleteScan(id), clearScans, isGuest. Keep server DTOs independent of UI imports. Recent overview requests only the first page; History can load additional pages.

- [ ] Add failing checks for returning signed-in users, guest reload persistence, pagination beyond 20, loading versus empty versus failure, failed deletion retaining the row, and state invalidation on identity change.
- [ ] Run the focused tests and verify failures.
- [ ] Replace localStorage/memory reads with no-store history requests. Guard against stale responses on account switches/unmount; clear private client state when ownership changes. Do not migrate unverified browser records or increment statistics from them.
- [ ] Connect View and Delete actions. Replace the hardcoded result page with owned saved data and loading/not-found/error states using the installed framework's params convention. Remove inactive Share/PDF/Rescan actions or implement only supported actions; rescan requires new input.
- [ ] Show 20 per page and accurate guest/account persistence copy. Await successful deletes before dismissing confirmation or clearing the visible rows. Format server ISO timestamps locally and sort dates using actual timestamps.
- [ ] Run component checks and browser tests for guest reload, account return visits, pagination, detail viewing, and deletions; record any browser validation unavailable in this environment.

## Task 7: Verify and deliver Neon setup SQL

**Files:** Create docs/persistent-history-setup.md. Update docs/platform-statistics-setup.md and docs/project-index.md. Review prisma/persistent-history.sql.

**Interfaces:** Setup guide provides the exact reviewed empty-database bootstrap SQL, expected verification queries, environment names, rollback boundaries, and production acceptance checks. No secrets in files or output.

- [ ] Run `npm test`, `npm run lint`, `npx tsc --noEmit`, `npm run build`, and `npx prisma validate`. Fix introduced failures; report pre-existing failures separately.
- [ ] Validate bootstrap SQL on a disposable PostgreSQL database if available, including real transactions, concurrent duplicate completion, deletion receipts, and isolation. Otherwise explicitly mark SQL execution unverified.
- [ ] Review complete diff against the approved spec, auth boundaries, and existing statistics work. Review SQL for destructive statements and credentials.
- [ ] Give the user the exact SQL file and ordered Neon SQL Editor instructions. Ask them to run the concrete reviewed migration only after local work is reviewable; do not request secrets in chat.
- [ ] Provide read-only table/column verification queries and expected names, followed by Vercel deployment instructions. Production connection alone is not evidence of a functioning schema.
- [ ] After deployment, verify actual guest save/reload, signed-in save/return/device access, isolation, pagination, and counter behavior. Mark checks pending if live access is unavailable; do not claim deployment or persistence before evidence.

## Self-review

The tasks cover account identity, guest identity, additive schema and empty-database bootstrap, transactional counting, replay receipts, all detector routes, private APIs, persistent UI, privacy, and deployment verification. Each Review Focus item has tests in its owning task. Production credentials and remote migrations remain outside local test claims.
