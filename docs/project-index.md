# AI SHIELD project index

Indexed from the local source on 15 October 2026. This describes the code that is present, rather than treating every feature mentioned in older documentation as implemented.

## What this project does

AI SHIELD is a web application for checking text, images, videos, faces, and plagiarism for signs of AI generation or manipulation. It has a public marketing site, a dashboard with scanning tools, account screens, and server API routes. Detection results are probabilistic.

The repository contains 26 page components, 12 API route handlers, and 63 component files under `src/`. Route groups such as `(public)` and `(auth)` organize layouts without appearing in URLs.

## Technology

| Area | Current implementation |
| --- | --- |
| Framework | Next.js 16.2.12, App Router |
| UI | React 19.2.4, TypeScript |
| Styling | Tailwind CSS 4, custom navy/blue/lavender theme |
| Components | Local shadcn-style primitives using Radix UI |
| Forms | React Hook Form, Zod |
| Animation/charts | Framer Motion, Recharts |
| Upload UI | React Dropzone |
| Database design | Prisma 7, PostgreSQL schema; scan persistence disabled, separate lazy account lookup for verified password sign-in |
| Authentication | Auth.js 5 with verified encrypted JWT sessions, Google/Facebook OAuth, WhatsApp through Twilio Verify, verified existing password accounts; credentials/database still require setup |

Before changing Next.js behavior, follow `AGENTS.md` and read the relevant installed documentation in `node_modules/next/dist/docs/`.

## Folder and root-file map

| Path | Purpose |
| --- | --- |
| `src/app/` | Pages, layouts, global styles, and API handlers |
| `src/components/ui/` | Reusable buttons, fields, dialogs, tables, tabs, and other primitives |
| `src/components/shared/` | Public navigation, logo, and disclaimer |
| `src/components/landing/` | Home-page sections, including the hero, features, FAQ, and scanning calls to action |
| `src/components/dashboard/` | Dashboard header, sidebar, statistics, recent scans, and notifications |
| `src/components/auth/` | Three provider sign-in buttons, searchable calling-code selector, safe callback errors, and password-strength UI |
| `src/components/detection/` | Upload dropzone, processing stages, verdict ring, signals, metadata, and evidence views |
| `src/components/history/` | Scan filters and renaming dialog |
| `src/components/api/` | API documentation code block |
| `src/lib/` | Auth.js configuration, provider verification/readiness, password hashing/authentication, dedicated account lookup, session checks/cookie proof, WhatsApp verification, disabled scan database client, API helpers, sample data, local scan history, and utilities |
| `src/proxy.ts` | Next.js 16 session checks on dashboard/private APIs and account routes |
| `src/types/index.ts` | Shared scan/report types and platform configuration |
| `prisma/schema.prisma` | Database model definitions |
| `prisma.config.ts` | Prisma CLI configuration |
| `public/` | Static logos, favicon, and SVG assets |
| `client_discussion/project_overview.md` | Plain-language feature overview for client discussions |
| `docs/project-index.md` | This source-based project map |
| `docs/authentication-setup.md` | Provider registration, credentials, callback URLs, WhatsApp setup, and live-testing requirements |
| `scripts/check-auth.mjs` | Reports auth readiness without exposing secrets |
| `tests/` | Node tests for provider setup, safe redirects, Auth.js session-key enforcement, trusted public origins, WhatsApp verification/challenges, and throttling |
| `README.md`, `GEMINI.md` | Earlier setup and architecture references; some claims differ from the current code |
| `AGENTS.md`, `CLAUDE.md` | Agent guidance; `CLAUDE.md` points to `AGENTS.md` |
| `package.json`, `package-lock.json` | npm scripts and dependency versions |
| `next.config.ts`, `tsconfig.json`, `eslint.config.mjs` | Framework, TypeScript, and lint settings |
| `postcss.config.mjs`, `tailwind.config.ts` | Styling configuration; CSS theme tokens are defined in `src/app/globals.css` |
| `.env.example`, `.env.local` | Environment configuration; do not publish secrets |
| `index.html` | Separate standalone HTML version; it is not the Next.js `/` route |
| `src/app/page.tsx.bak` | Backup source file; not an active page |
| `next_crash*.log` | Existing diagnostic logs |
| `BACKUP-INV/` | Inventory document and photo backup, separate from application code |
| `git` | Existing root file, not the `.git/` repository directory |
| `.git/`, `node_modules/`, `.next/` | Git metadata, installed dependencies, and generated Next.js output |

## Pages and URLs

| URLs | Source group / purpose |
| --- | --- |
| `/` | `(public)/page.tsx`, composed from the landing components |
| `/about`, `/how-it-works`, `/limitations` | Public information pages |
| `/sign-in`, `/sign-up` | Account entry screens |
| `/sign-in/password` | Password step after a valid email is entered |
| `/sign-in/whatsapp` | Phone number and WhatsApp verification-code sign-in |
| `/forgot-password`, `/reset-password`, `/verify-email` | Account recovery and verification screens |
| `/dashboard` | Overview with statistics, quick tools, and recent scans |
| `/dashboard/new-scan` | Scan entry screen |
| `/dashboard/text`, `/dashboard/image`, `/dashboard/video` | Content scanning tools |
| `/dashboard/deepfake`, `/dashboard/plagiarism` | Specialized scanning tools |
| `/dashboard/history`, `/dashboard/reports` | Scan history and reports |
| `/dashboard/scans/[id]` | Individual scan details |
| `/dashboard/api-keys`, `/dashboard/settings` | Developer and account interfaces |
| `/dashboard/admin`, `/dashboard/help` | Administration and help interfaces |
| `/report/[token]` | Shared public report screen |

Some existing links reference routes without page implementations: `/use-cases`, `/resources`, `/dashboard/enhancement`, `/terms`, and `/privacy`. Older documents also describe batch/team features that do not have matching pages in this checkout.

## Server APIs and integrations

| API | Current behavior |
| --- | --- |
| `GET/POST /api/auth/[...nextauth]` | Auth.js provider discovery, OAuth callbacks, CSRF, sessions, sign-in, and sign-out |
| `POST /api/auth/whatsapp/request` | Validates a same-origin request, throttles sends, starts Twilio Verify, and sets a signed short-lived challenge |
| `POST /api/auth/sign-in` | Same-origin email/password authentication for verified stored accounts; requires a freshly issued session before reporting success, returns HTTP 503 when the account database is unconfigured |
| `POST /api/auth/sign-up` | Account creation placeholder |
| `POST /api/auth/forgot-password` | Password recovery placeholder |
| `POST /api/scan/text` | Hugging Face integration, language detection, and optional search analysis; includes fallback/sample behavior |
| `POST /api/scan/image` | Sightengine image analysis |
| `POST /api/scan/video` | Sightengine video analysis |
| `POST /api/scan/deepfake` | Sightengine face/deepfake analysis |
| `POST /api/scan/plagiarism` | SerpAPI search integration |
| `POST /api/scan/url` | Validates a URL and returns randomized sample results |
| `GET /api/report/[id]` | Returns a database-not-configured placeholder |

`src/lib/sightengine.ts` centralizes Sightengine requests. Scan integrations need their environment variables: `SIGHTENGINE_API_USER`, `SIGHTENGINE_API_SECRET`, `HUGGINGFACE_API_KEY`, and `SERP_API_KEY` (text also checks `SERPAPI_API_KEY`). The existence of an integration does not prove that the external service is configured or reachable.

## Storage and database

`src/lib/use-recent-scans.ts` stores up to 10 recent scans in the browser's `localStorage` under `aishield_recent_scans`. The overview uses sample scans when there is no local history, and its statistics/activity chart are sample data.

`src/lib/db.ts` explicitly disables the scan database client. `src/lib/auth-db.ts` separately reads existing password accounts when a real PostgreSQL connection is configured. The Prisma `User` model now includes an optional salted `passwordHash`; password sign-in requires it and a trusted `emailVerified` timestamp. The current placeholder database hostname does not resolve. No database tables or users were created. The schema also defines OAuth accounts, sessions, verification tokens, scans, signals, metadata, reports, batches, API keys/activity, workspaces/members, audit logs, and notifications. Schema definitions alone do not enable persistence.

## Start Scanning and sign-in

The public desktop/mobile navigation and home-page scanning calls to action link to `/sign-in`. Once authenticated, the dashboard header starts a scan at `/dashboard/new-scan` and offers sign-out. The sign-in page has an always-visible email field and a Continue button, followed by Google (including Gmail accounts), WhatsApp, and Facebook as full-width provider buttons. A valid email advances to `/sign-in/password`, which has only a password input and displays “Choose an account to continue to your dashboard.” below it, followed by the provider buttons. A Change email link returns to the first step. The email is carried in tab-scoped session storage through `src/lib/use-sign-in-email.ts`; passwords are sent only in the sign-in POST request and are not stored in browser storage or URLs. Direct entry to the password route without a valid stored email returns to `/sign-in`.

Google and Facebook buttons initiate Auth.js OAuth when their credentials are configured. Facebook profile fetching verifies a provider-issued ID and handles missing email/photo safely. WhatsApp opens `/sign-in/whatsapp`, with a searchable dropdown to the left of the national-number input containing 245 country/territory calling-code entries and defaulting to Philippines (+63). The phone library normalizes local prefixes and detects countries when full international numbers are pasted. A confirmed code send opens the OTP step, and only a real approved Twilio verification followed by a confirmed Auth.js session can enter the dashboard. Missing credentials and provider failures show safe messages. The same social component is also used on `/sign-up`. No login is simulated.

Auth.js and verification/session handling are implemented; Google/Facebook application credentials and a configured Twilio WhatsApp service/sender must still be supplied. See `docs/authentication-setup.md`. The password button now authenticates existing verified accounts through Auth.js and confirms a session before entering the dashboard. Unknown/unverified accounts and wrong passwords are rejected; typed emails alone never establish a session. Google requires a verified email claim, Facebook requires a matching provider ID, and WhatsApp requires the approved code. Sessions without the new server-issued verification marker are rejected.

New password-account registration, verification-email delivery, and password recovery still need a real enrollment service. The verification page no longer pretends that an email was sent or resent. Existing sample/admin data does not grant login access.

Direct dashboard URLs now require a real session, and scan/private report APIs return HTTP 401 without one. The proxy and actual dashboard/API handlers independently check sessions. Database-backed persistence and cross-provider account linking are not enabled.

## Local development

Run these from the repository root:

```powershell
npm.cmd run dev
npm.cmd run lint
npm.cmd test
npm.cmd run auth:check
.\node_modules\.bin\tsc.cmd --noEmit --incremental false
npm.cmd run build
```

The dev script binds to `127.0.0.1`, normally on port 3000. The `.cmd` suffix avoids PowerShell's restriction on npm's `.ps1` launcher in this environment. `postinstall` runs `prisma generate`.

The committed Node test runner covers authentication configuration and WhatsApp verification; no Playwright browser-test configuration is committed. The initial pre-change repository lint check reported 36 errors and 77 warnings. Validate touched files separately and distinguish existing lint problems from new regressions. Native TypeScript test/check scripts require Node 22.18+ or Node 24.

## Installed-plugin use for this change

The Superpowers skills guided discovery and verification. Build Web Apps supplied React and rendered-UI testing guidance. Superdesign's CLI preflight succeeded, but its account was not authenticated; no external canvas design was generated. The Browser plugin was not available in this session.
