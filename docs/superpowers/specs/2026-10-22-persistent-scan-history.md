# Persistent scan history design

## Intended outcome

Use the existing PostgreSQL database configured by DATABASE_URL in Vercel for private scan history and shared statistics. Signed-in users retain history after closing the website and returning days or weeks later, including on another device. No automatic account-history expiry or 20-record storage cap. Display 20 records per page.

Guests also have database-backed history. Guest history stays separate from account history on sign-in. It is accessible only through the same browser's private guest-session cookie; clearing cookies loses access. Proposed cookie lifetime: 365 days, renewed on use. This is an access lifetime, not automatic database deletion.

## Current implementation and constraints

- prisma/schema.prisma already defines User, Account, Scan, ScanSignal, and ScanMetadata. Scan has optional userId and guestSessionId.
- src/lib/use-recent-scans.ts and scan-history-store.ts currently keep account history in localStorage and guests in memory, capped at 20. They are not database-backed.
- Session token subjects use provider-prefixed identities. Resolve these to actual database users before inserting Scan.userId; never accept an owner from request data.
- The existing aishield_guest_mode cookie is a public mode flag and must never authorize history access.
- Uncommitted statistics work already exists. Preserve it and integrate with it rather than overwrite it.
- No local DATABASE_URL, installed Next.js package, or Vercel connection has been verified. A Vercel environment setting is not automatically available to local commands. Do not print credentials.
- Read relevant node_modules/next/dist/docs guides before writing Next.js code, as required by AGENTS.md.

## Identity and access

Resolve credentials sessions to their existing User and Google sessions through the verified provider identity in Account. Provision a Google database account only from trusted authentication data. Do not silently merge separate accounts based on email; require an explicit linking flow if a collision exists.

Create a separate random guest bearer token in an HttpOnly, SameSite=Lax cookie, Secure in production. Persist only its cryptographic hash as the guest ownership reference. Set it when entering guest mode; never issue it from an arbitrary caller-provided identity. Preserve the existing explicit guest-mode selection behavior.

Every list, detail, individual-delete, and clear-history query includes the resolved owner. Return 404 for inaccessible scan IDs. Private responses use no-store caching. Mutations require trusted same-origin requests. No client endpoint accepts arbitrary scan results for trusted persistence or statistical counting.

## Persistence and statistics

Persist successful server detector responses for text, image, video, deepfake, and plagiarism. Store a canonical result snapshot containing the fields needed to reopen the analysis, plus detector module, display name, UTC timestamps, status, verdict, and scores. Keep raw submitted text, uploaded bytes, signed URLs, secrets, and provider credentials out of the snapshot. Review provider response fields before storage.

Use the existing Scan model with additive fields for a JSON result snapshot and a unique completion key, plus owner/date indexes. Enforce exactly one owner on new history records. Inspect deployed schema before generating or applying an additive migration; do not assume the checked-in Prisma schema matches production.

The browser generates an operation key for each deliberate scan, retained across retries. Scope its uniqueness to the resolved owner. Same key and same request reuse the completed response; conflicting reuse is rejected. Repeated completions must not add history or counters twice, including after deletion. Retain a minimal completion receipt independent of deletable history for this purpose, without retaining the result content.

Save history, completion receipt, and the existing atomic daily statistics increment in one database transaction. Do not call the old separate counter increment as well. A video counts once. Provider failures create no completed history or counts. Demo results are explicitly labeled, excluded from shared counters, and not persisted as real analyses.

If persistence fails after analysis, return the result with an explicit unsaved indication; the UI must not claim history was saved. A failed transaction must not leave a partial counter increment. Do not automatically repeat paid provider calls in an attempt to repair storage.

## History interface

Replace browser persistence with authenticated server history reads. GET /api/history returns newest-first records using a stable createdAt/id cursor, 20 per page. GET /api/history/[id] returns the owned canonical result. DELETE on the item removes only that result; DELETE /api/history clears all results for that owner. Neither deletion decrements aggregate statistics or removes completion receipts.

Update the overview's recent scans, History page, and result page to use persisted server IDs and snapshots. Provide loading, empty, load-error, save-error, and deletion-error states. Make View and Delete work. Do not present Rescan as functional unless the user can supply the original input again, since uploads are not retained.

Account history copy explains persistent account storage. Guest copy explains browser-cookie access. Remove claims that refresh clears guest history and that account storage stops at 20 scans. Never automatically trust or upload old localStorage history as verified provider results or use it to backfill global statistics.

## Implementation sequence

1. Restore a usable local dependency environment; read the installed Next.js guides and inspect schema/migration tooling. Run baseline checks and keep existing failures distinct.
2. Implement and test database account mapping and private guest ownership, including Google/credentials identity and account collision cases.
3. Add reviewed, additive history fields/indexes and minimal completion receipts; implement owner-scoped history repository and transactional statistics integration.
4. Connect all five scan routes to persistence with operation keys and canonical snapshots; remove duplicate counter writes. Update callers to use returned scan IDs and saved/unsaved status.
5. Add private list/detail/delete APIs with cursor pagination, ownership enforcement, origin checks, and no-store responses.
6. Replace local history hooks, connect overview/History/result pages, implement pagination and deletion, and correct persistence copy.
7. Run regression tests, lint, type/build checks, browser flows, and live database checks where access is available. Document any checks that cannot run.
8. Review the concrete SQL migration and deploy using the existing Vercel database configuration. Validate a guest scan and a signed-in scan in production, return visits, account isolation, and one-time statistics increments.

## Acceptance checks

- Signed-in history survives sign-out, browser restart, and a simulated week-later visit, and is returned to the same account on another device.
- More than 20 stored scans remain accessible through pagination, including equal timestamps.
- Guests survive refresh/restart while their cookie remains valid; separate browsers and guest/account identities cannot read each other's results.
- Forged public guest flags, owner IDs, and scan IDs grant no access.
- Google session subjects resolve to real database users without invalid foreign keys or email-based account takeover.
- Concurrent duplicate completions count once; retry after history deletion does not recount; a new deliberate scan counts again.
- Clearing history leaves website-wide totals intact.
- Provider failures, demos, database outages, and failed deletes produce accurate states without fabricated saved history or counters.

## Review boundary

This design records the agreed direction and proposed implementation details. No application code or production database is changed by this document. Review this written design before producing the detailed execution plan, per the brainstorming skill's architectural workflow.
