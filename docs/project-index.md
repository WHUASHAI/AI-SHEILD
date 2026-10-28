# Elucid AI project index

Indexed from local source on 21 October 2026. This map describes implementation, not deployment readiness. External services and runtime behavior were not tested during indexing.

Repository layout corrected on 22 October 2026: the active project is at the workspace root. The duplicate nested checkout was archived under `.local-backups/`; its old Git link still needs removal from a normal terminal because this session cannot write the outer Git index. See `docs/repository-layout.md`.

## Purpose and current state

Elucid AI is a web application for screening text, images, videos, and faces for possible AI generation or manipulation, plus checking text for online plagiarism matches. It combines a public site, dashboard, account screens, and server API routes. It calls external detection services rather than hosting a trained detection model.

The checkout contains 25 page components, 16 API route handlers, and 63 component files. It is a partially implemented application: real provider integrations coexist with synthetic results, browser-only personal history, database-backed aggregate counters, and unfinished account/report services. Detection scores do not prove content origin.

## Technology

Next.js 16.2.12 App Router, React 19.2.4, TypeScript, Tailwind CSS 4, Radix/shadcn-style components, Framer Motion, Recharts, React Dropzone, React Hook Form, and Zod. Auth.js 5 handles sessions/providers. Prisma 7 defines a PostgreSQL schema.

## Source map

| Path | Responsibility |
| --- | --- |
| `src/app/(public)/` | Landing page, about, how-it-works, limitations |
| `src/app/(auth)/` | Sign-in, password step, sign-up, recovery, email verification |
| `src/app/(dashboard)/` | Dashboard layout and scanning, history, reports, settings, API-key, admin, help screens |
| `src/app/api/scan/` | Text, image, video, deepfake, plagiarism, URL handlers |
| `src/app/api/auth/` | Auth.js, password sign-in, signup/recovery placeholders, email verification |
| `src/app/api/report/[id]/` | Report persistence placeholder |
| `src/app/report/[token]/` | Public shared report demonstration |
| `src/components/` | UI primitives and landing, dashboard, detection, auth, history components |
| `src/lib/sightengine.ts` | External image/video/deepfake API client and score interpretation |
| `src/lib/auth.ts`, `auth-settings.ts` | Provider registration, JWT sessions, redirects, conditional access checks |
| `src/lib/auth-db.ts`, `password-auth.ts` | Existing stored password-account lookup, verification, attempt limits |
| `src/lib/email-verification.ts` | Signed email tokens, confirmation cookies, Resend integration |
| `src/lib/require-session.ts`, `src/proxy.ts` | Conditional private-route checks and request proxy |
| `src/lib/use-recent-scans.ts`, `history-client.ts`, `scan-history-repository.ts` | Private database history for accounts and guests; 20 results per page, no storage cap |
| `src/lib/guest-mode.ts`, `guest-access.ts`, `src/app/api/guest/` | Explicit public guest-mode selection and scanning access; separate from authentication |
| `src/lib/db.ts` | Disabled scan database client |
| `src/lib/platform-statistics.ts`, `statistics-db.ts`, `scan-statistics.ts` | Shared anonymous UTC daily counters and server-side recording of real scan completions |
| `src/lib/use-platform-statistics.ts`, `src/app/api/statistics/` | Website-wide overview totals and activity; refresh every 30 seconds and on focus |
| `src/types/index.ts` | Shared scan/report types and configuration |
| `prisma/schema.prisma` | User, account, session, verification, scan, signal, metadata, report, batch, API-key/activity, workspace/member, audit, notification models |
| `tests/` | Seven Node test files focused on authentication and verification |
| `scripts/check-auth.mjs` | Authentication configuration readiness checker |
| `docs/authentication-setup.md` | Setup reference; verify against source because older documentation can differ |
| `client_discussion/project_overview.md` | Client-facing feature discussion |
| `public/` | Static branding and assets |
| `index.html`, `src/app/page.tsx.bak` | Standalone HTML and inactive source backup |
| `BACKUP-INV/` | Separate inventory/document/photo backup, outside the application flow |

Route groups in parentheses organize layouts without appearing in URLs. Agent guidance is in `AGENTS.md`; it requires consulting installed Next.js documentation before code changes.

## Detection implementation

| Feature / endpoint | Actual behavior |
| --- | --- |
| Text: `POST /api/scan/text` | Detects language with franc. Attempts Hugging Face RoBERTa inference on the first 2,000 characters. Missing/failed inference falls back to scores derived from a text hash and a synthetic model attribution. Optional SerpAPI search has mock matches when its key is absent. Some search scores are randomized. |
| Image: `POST /api/scan/image` | Calls Sightengine for generation and face-manipulation scores; requires provider credentials. Returns verdict, signals, and face data. |
| Video: `POST /api/scan/video` | URL analysis through Sightengine, or uploaded sampled frames through its image API. The video page samples three frames in the browser. Uploaded-frame mode does not analyze audio. |
| Deepfake: `POST /api/scan/deepfake` | Calls Sightengine for faces in images or sampled video frames. Video verdict uses the maximum detected face score. Some displayed signals are derived from that score rather than separate measurements. |
| Plagiarism: `POST /api/scan/plagiarism` | Samples sentences and queries SerpAPI for quoted web matches; requires `SERP_API_KEY`. Coverage is limited to searched/indexed text. |
| URL: `POST /api/scan/url` | Validates URL syntax and returns randomized demo scores; it does not analyze the destination content. |

Provider environment names include `SIGHTENGINE_API_USER`, `SIGHTENGINE_API_SECRET`, `HUGGINGFACE_API_KEY`, and `SERP_API_KEY`; text also accepts `SERPAPI_API_KEY`. Integration code is not evidence that credentials, accounts, or remote endpoints currently work.

## Accounts and access

Google OAuth and existing verified password-account sign-in are wired through Auth.js. Facebook has been removed from provider registration, UI, and accepted sessions. Google credentials accept either `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` or `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`, with the Auth.js naming family taking priority. Provider availability depends on a valid `AUTH_SECRET` and complete matching credentials. No WhatsApp page/request API is present in this checkout, despite older documentation describing one.

Scanning and recent history require either a real session or an explicit landing-dialog Guest choice. The guest flag is not Google authentication and does not grant access to private reports/account tools. The former `REQUIRE_AUTH` flag cannot silently open access. Visiting `/sign-in` stays on the sign-in page even with an existing session; Continue with Google clears guest mode and opens Google account selection. The desktop/mobile header has only Sign In. Landing-page Start Scanning buttons open Google and Guest choices.

Signup and forgot-password APIs return HTTP 501 placeholders. Email-send/check/verify routes exist, including a Resend email integration (`RESEND_API_KEY`). A verification link can update an existing database user when configured and set a confirmation cookie; this is separate from account creation.

Auth.js requires a configured signing secret and no longer uses a hardcoded fallback. The separate legacy email-verification helper still contains fallback behavior requiring review before relying on that enrollment flow. See `docs/authentication-setup.md` for Google/Vercel setup and deployment checks.

## Persistence and demonstration data

Scan persistence is disabled in `src/lib/db.ts`. Password-account lookup uses a separate database path, so disabling scan persistence does not by itself disable password lookup.

Guests keep at most 20 scans in one shared in-memory store for the loaded document. Client navigation preserves them; a full refresh or closing the page clears them. Old guest sessionStorage data is removed and never restored. Signed-in users keep at most 20 recent scans in `localStorage` under `aishield_user_scans_<userId>`, preserved on refresh and reopening in the same browser. Guest and account histories remain separate. This does not provide server-side or cross-device history.

Overview statistics and seven-day activity use shared PostgreSQL daily counters across Google and guest users, recorded only by successful server-side detector integrations. Demo/failed results are excluded; missing database setup shows unavailable, not demo totals. These counters do not save personal history or raw content. Setup is documented in `docs/platform-statistics-setup.md`; earlier browser-only scans cannot be reconstructed globally. The sidebar now links History immediately before Settings instead of Reports. API-key creation remains local component state without a matching backend. `GET /api/report/[id]` returns a database-setup placeholder, and public `/report/[token]` builds a demo result from the token.

README claims about storage, Redis/BullMQ workers, batch/team tools, enhancement pages, and a hosted developer API should be treated as intended capabilities unless a matching implementation is established. No corresponding workers directory or batch/team/enhancement pages were found.

## Main user flow

Public site -> landing Start Scanning dialog -> choose Google or Guest -> dashboard -> choose scanning tool -> submit content -> provider analysis or demo fallback -> results -> recent history (guest memory or per-account browser storage).

## Development commands

Run from the repository root, `C:\Users\Admin_IT PC1\Desktop\AI-SHIELD`:

```powershell
npm.cmd run dev
npm.cmd run lint
npm.cmd test
npm.cmd run auth:check
.\node_modules\.bin\tsc.cmd --noEmit --incremental false
npm.cmd run build
```

The development script binds to `localhost`. Guest entry also accepts same-origin requests through loopback addresses during development, while production retains its configured origin checks. Installation runs `prisma generate`. Database and provider setup are separate from installing dependencies.

This indexing pass inspected source and file counts only; it did not run tests, build, start the application, connect to the database, or submit content to external providers.

Persistent history deployment: [setup guide](persistent-history-setup.md). Empty Neon bootstrap: `prisma/persistent-history.sql`.
