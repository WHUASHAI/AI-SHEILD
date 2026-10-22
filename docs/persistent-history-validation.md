# Persistent history verification

Implementation target: live AI-SHIELD on Vercel with the connected Neon database. Verification below is local except for one explicitly authorized plagiarism request. No production migrations or deployments have been performed.

| Check | Result |
| --- | --- |
| Application regression suite | 106 tests passed, including provider errors, honest text results, no automatic retry, and saved-report warnings |
| TypeScript | No errors |
| Prisma schema | Valid |
| Production build | Passed; final rerun recorded in execution ledger |
| Focused lint for new history code and tests | Passed |
| Repository lint | 29 existing errors and 65 warnings remain, excluding temporary QA tools; not a clean lint baseline |
| Bootstrap SQL | Created all 17 tables in disposable embedded PostgreSQL |
| Persistence transaction | Actual emitted SQL tested through an adapter: save, replay, conflict, deletion receipt, concurrent queued completions, and rollback |
| SQL constraints | Ownerless scans rejected; nonempty-schema rerun rejected |
| Browser guest entry | Actual endpoint issues private HttpOnly cookie with persistent expiry |
| Browser outage | Actual history endpoint returns 503 without a configured database |
| Browser rendered flows | Controlled API results: guest reload, 25 results across pages, details, failed/successful deletion, clear-all empty state, signed-in messaging, and plagiarism replay |
| Browser runtime errors | None in successful desktop/mobile interaction run |
| Browser provider-limit handling | Local text fixture shows HTTP 429 as an error after one submission, without a fabricated verdict |
| Single authorized live detector test | One-sentence plagiarism request returned HTTP 200 and one source match at whoi.edu; no retry or further live scan |
| Production Neon connection and migration | Pending user SQL execution |
| Live Vercel deployment and real-account/device checks | Pending deployment |

Browser plugin was not available. Playwright used installed Chrome headlessly against http://127.0.0.1:3001, with desktop 1365×900 and mobile 390×844 viewports. The existing table scrolls horizontally on narrow screens. Local development could not fetch Google fonts under sandbox network restrictions and used fallback fonts; metadataBase warnings are pre-existing.

A fresh review found a missing numeric source-count field in saved plagiarism responses. A failing regression test reproduced it; the field is now allowlisted, and the real plagiarism page rendered a replay fixture successfully. No outstanding Critical/Important issue was reported in the reviewed code.

A subsequent provider review also checked text mock removal, error mapping, stop-on-failure behavior and optional-check disclosure. Two review improvements were reproduced and fixed: invalid primary image payloads no longer trigger an extra model call, and saved reports disclose unavailable deepfake checks. Review reported no outstanding findings.

The SQL engine run does not prove independent multi-connection contention or Prisma's network connection to Neon. Browser fixtures do not prove remote account persistence. Follow [live setup and acceptance steps](persistent-history-setup.md) before claiming production persistence.
