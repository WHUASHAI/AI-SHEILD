# Execution ledger: 2026-10-22-persistent-scan-history.md

Design and implementation plan approved by user. Inline execution selected.

## Pre-flight

- Task 2 ScanOwner is consumed by persistence and APIs; no interface conflict.
- Task 3 canonical snapshot is consumed by detector routes and result UI; DTOs must stay independent of React.
- Task 4 HistoryItem is consumed by Task 6; represent server timestamps as ISO strings.
- Task 5 must replace, not supplement, existing recordPlatformScan calls.
- Neon ai-shield-db connected to Vercel, public schema empty per user's SQL result. No local connection available.
- User delegated workspace choice. Created feat/persistent-scan-history in .worktrees/persistent-history and copied the existing uncommitted statistics work. Original checkout preserved.

## Task 1: complete

- Node v24.21.0 available.
- PowerShell blocks npm.ps1; use npm.cmd without changing execution policy.
- Sandbox npm ci failed EACCES downloading packages. Interrupted that process and retried npm.cmd ci with requested network escalation. Download now progressing.
- Initial test run while dependencies absent fails due to missing packages; baseline-tests.log records output. Rerun when installation completes.
- npm ci completed: 615 packages; Prisma client generated. Some dependency lifecycle scripts blocked by npm policy, but client generation and build work.
- Read installed Next.js route-handler, cookies, dynamic params, and fetching guides.
- npm test: 71/71 passing.
- Baseline lint: 69 errors, 156 warnings; existing code, before application changes.
- TypeScript baseline finished without reported TS errors.
- Sandbox Turbopack build failed reading parent directory; escalated baseline build completed successfully.
- Task 1 complete; feature work continues in isolated branch.

## Tasks 2–6: complete

- Identity/token, account mapping, snapshots, cursor, persistence, history APIs, caller wrappers, and client state regression tests watched fail before implementation and pass afterward.
- Private guest cookie and persistent mode cookie; stable verified provider mapping, no automatic email linking.
- History, independent receipts, and daily counters persist transactionally with advisory locking.
- Five detector routes connected; demos/failures excluded, storage outages explicitly unsaved.
- Owner-filtered no-store history APIs; origin checks on mutations; pagination and deletion.
- Replaced browser storage; retired obsolete store/tests; History and actual saved-result details connected; all detector callers show persistence status.
- Statistics and history share the existing Prisma pool.

## Task 7: local verification complete; live setup pending

- 92 tests pass; TypeScript has no errors; focused new-code/tests lint passes; Prisma validates.
- Final production build passed after all code changes.
- Disposable PGlite PostgreSQL engine: bootstrap creates 17 tables; actual persistence SQL verified for replay, conflicts, deletion receipts, rollback, owner constraint, and nonempty-schema guard. Five queued concurrent completions count once; independent server contention remains unverified.
- Playwright/Chrome against local server: actual guest cookie issuance and actual database-unavailable response verified. Controlled API fixtures cover desktop/mobile history, reload, 25-item pagination, detail, failed and successful delete, clear-all empty state, signed-in messaging, and plagiarism replay. No page runtime errors.
- Browser plugin unavailable. Temporary QA dependencies installed separately in .local-qa; not product dependencies.
- Fresh reviewer found one Important plagiarism replay field omission. Reproduced with failing test, fixed allowlist, verified real caller render using replay fixture. Follow-up review found no outstanding Critical/Important findings.
- Full application lint excluding temporary QA tools: 34 errors and 69 warnings remain in existing code. Focused new-code/tests lint clean. git diff --check clean.
- SQL and deployment instructions prepared in docs/persistent-history-setup.md; no remote migration or deployment performed.

## Rulings

- Ruling: use a full guarded bootstrap for the user-confirmed empty database rather than ALTER-only migration — existing application tables are also absent — if the database changed meanwhile, guard stops the script.
- Ruling: use native PowerShell/Node orchestration and this tracked ledger instead of bash helper scripts — Windows host — manual progress bookkeeping.
- Ruling: local embedded PostgreSQL and controlled browser fixtures supplement unavailable Neon credentials — protects secrets and production — live connection, true multi-connection contention, and cross-device production checks remain pending.

## Remaining

- Save reviewed local feature commit, then user handoff for Neon SQL execution and Vercel deployment. No application code copied over the original checkout and no remote writes. Live readiness remains contingent on those external steps.

## Authorized detection correction extension

- User authorized removing fabricated text results and improving provider-limit handling. This is bounded to existing detector paths; details in docs/detection-provider-behavior.md.
- One and only one authorized live detection submission completed: plagiarism, one sentence, HTTP 200, one source at whoi.edu. Marker and sanitized result are in temporary .local-qa. No more live scans permitted without fresh authorization.
- Replaced text mock/fallback and fake generator attribution with real classifier responses or explicit errors. Updated HF router; no new credential variables.
- Provider errors classified safely, plagiarism limit errors preserved, automatic browser retry removed, overlapping detector submissions blocked, deepfake frames stop on first provider failure, optional image check failures disclosed.
- Removed invented plagiarism index-size/coverage claims and report actual sampled search counts.
- Failing tests reproduced text fabrication, repeat submission, non-JSON quota handling and lost plagiarism quota status before fixes. 25 focused provider/route/submission tests pass.
- Final extension verification: 106 tests pass; TypeScript and Prisma pass; focused new-code/test lint clean; production build passes. Full lint retains 29 existing errors and 65 warnings.
- Browser recheck with local fixtures: text quota response shown after exactly one request, no fabricated verdict; history and plagiarism replay flows still pass without runtime errors.
- Final review found no outstanding issues after two RED-to-GREEN fixes: primary image validation before the optional paid request, and explicit saved-report warnings/Not checked values.
- Disposable PostgreSQL engine recheck passes. No further live detector submissions. Feature-branch changes remain local until migration/deployment handoff.
