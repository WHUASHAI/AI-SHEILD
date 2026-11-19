# Elucid AI project index

Indexed from local source on 20 November 2026. This describes the checked-out application, not verified live deployment behavior. No external detector requests, database connections, or deployment changes were made. Credentials and cookie contents were not inspected.

## Purpose

Elucid AI is a web application for screening digital content for possible AI generation, facial manipulation, and copied text. A public website leads visitors into a dashboard through Google sign-in or an explicit Guest choice. Its five current tools are **Text, Image, Video, Deepfake, and Plagiarism**.

The application integrates pretrained models and external services. This is not a model-training repository. Scores are estimates and can be wrong; they do not establish authorship, authenticity, or original ownership.

## The five tools

### 1. Text detection

- **Question:** Does this writing resemble AI-generated or human-written English?
- **Input:** At least 50 readable words, up to 50,000 characters. Language and extreme-repetition checks can reject unsuitable input.
- **Implementation:** Fakespot RoBERTa runs in a browser Web Worker through Hugging Face Transformers and ONNX/WASM. The page checks every token-bounded passage and combines the scores. A separate model can estimate OpenAI, Anthropic, Google, or Other AI source families for likely-AI results.
- **Downloads:** The default primary model is approximately 499 MB. A compact int8 export is selected when the browser reports device memory of 4 GB or less. Source-family estimation requires another model download.
- **Output:** Likely AI-Generated or Likely Human-Created, complementary model scores, passage coverage, and excerpts. Generator-family labels are guesses, not verified attribution.
- **Limits:** English prose only; download, memory, and accuracy constraints apply. Local results are not saved to History or counted in platform statistics. The old paid `POST /api/scan/text` integration is retired and returns HTTP 410 after its access check.
- **Entry points:** `src/app/(dashboard)/dashboard/text/page.tsx`, `src/lib/local-text-detector.ts`, `src/lib/local-text-client.ts`, `src/workers/local-text.worker.ts`, `src/workers/compact-text-model.ts`, `src/workers/source-family-model.ts`.

### 2. Image detection

- **Question:** Does this picture show signs of AI generation or manipulation?
- **Input:** Uploaded images; the page accepts up to 50 MB. The server route also supports image URLs.
- **Implementation:** Sightengine supplies generation scores and an additional face/deepfake check. Some score combinations receive an enhanced/edited label. An eligible provider outage or quota response switches the browser to a pretrained local image classifier.
- **Output:** Verdict, scores, signal summaries, and available face information. The backup provides a narrower image-classification result without the primary route's face check.
- **Limits:** Compression, unfamiliar generators, artwork, and edits can cause mistakes. The enhanced label is a score-based heuristic, not proof of a particular editing operation. Local backup results stay on the page and are not saved or counted.
- **Entry points:** `src/app/(dashboard)/dashboard/image/page.tsx`, `src/app/api/scan/image/route.ts`, `src/lib/sightengine.ts`, `src/workers/local-media.worker.ts`.

### 3. Video analysis

- **Question:** Do sampled pictures from a video show AI generation or face manipulation?
- **Input:** Uploaded video or public video URL. Current upload/extraction code limits files to 200 MB.
- **Implementation:** For uploads, the browser extracts three frames distributed through the video and sends them to Sightengine image analysis. The URL route uses Sightengine video analysis. The local backup classifies three sampled frames and detected face crops.
- **Output:** Aggregate generation/deepfake scores and a sampled-frame timeline.
- **Limits:** Three frames provide sparse coverage and can miss short manipulations. Uploaded-frame analysis does not assess audio. The local backup does not assess lip-sync or motion between frames. URL backup requires a downloadable video that the browser has permission to read.
- **Entry points:** `src/app/(dashboard)/dashboard/video/page.tsx`, `src/app/api/scan/video/route.ts`, `src/lib/browser-media-backup.ts`, `src/workers/local-media.worker.ts`.

### 4. Deepfake detection

- **Question:** Do visible faces show signs of synthetic alteration or face swapping?
- **Input:** Images or videos containing clear faces. The page permits uploads up to 200 MB; videos use three extracted frames.
- **Implementation:** Sightengine supplies `type.deepfake`, an image/frame-level score. The sampled-video route takes the highest unrounded frame score and preserves sample timestamps. The browser backup uses MediaPipe face detection and a separate visual deepfake classifier, checking up to five face crops per frame.
- **Output:** Visual model scores and a likely-deepfake/lower-signal verdict. Sightengine does not supply individual face counts; these display as not reported. Local backup with no detected faces yields an inconclusive/no-clear-faces result.
- **Limits:** Neither path analyzes audio, lip-sync, identity, or motion between sampled frames. A low primary score does not confirm face detection or authenticity. Missing/malformed provider scores are errors, not no-face or authentic results. See [deepfake fix validation](deepfake-fix-validation.md).
- **Entry points:** `src/app/(dashboard)/dashboard/deepfake/page.tsx`, `src/app/api/scan/deepfake/route.ts`, `src/lib/local-face-crops.ts`, `src/lib/local-media-detector.ts`.
- **Presentation preset:** Videos with `clear` in the filename can show an explicitly labelled 100% demo on this page. It bypasses analysis and is excluded from History/statistics. This is not a model result. See [presentation demo instructions](deepfake-presentation-demo.md).

### 5. Plagiarism check

- **Question:** Do sampled sentences match text already indexed on the public web?
- **Input:** Text between 20 and 50,000 characters, containing substantial sentences suitable for searching.
- **Implementation:** The server randomly selects up to three qualifying sentences in standard/academic mode or five in deep mode. It submits quoted searches through SerpApi and uses the first organic result as a match for each sentence.
- **Automatic backup.** When SerpApi reaches its quota or becomes unavailable, the browser checks exact six-word passages. It searches English Wikipedia for up to three phrases (five in deep mode) and compares returned excerpts plus four bundled reference texts. If Wikipedia is unavailable, the bundled comparison still runs. A reader can add their own reference on the result page. The backup reports the fraction of submitted words covered by matching passages and lists the sources checked.
- **Output:** Matching source links, sampled-sentence results, and the percentage of searched sentences with matches.
- **Limits:** This is a sample match rate, not the fraction of the entire document that is plagiarized. Private academic collections, paraphrasing, structural similarity, and unindexed pages are not assessed. A match does not establish which site published first. AI text detection and plagiarism are separate questions: human writing can be copied, and AI writing can have no exact web matches.
- **Entry points:** `src/app/(dashboard)/dashboard/plagiarism/page.tsx`, `src/app/api/scan/plagiarism/route.ts`, `src/lib/plagiarism-backup.ts`, `src/lib/local-plagiarism.ts`.

## Folder map

Counts are a snapshot of local files, excluding dependency/build/backup folders from the application counts.

| Path | Contents and responsibility |
| --- | --- |
| `src/app/` | 54 files, including 27 page components and 18 API route handlers; public pages, authentication, dashboard, and server endpoints |
| `src/components/` | 71 reusable UI, landing, dashboard, detection, authentication, and history components |
| `src/lib/` | 46 files for providers, detection and reference matching, authentication, submission, history, statistics, and the explicit Deepfake demo |
| `src/workers/` | 4 files for browser text/media inference and model loading; not a Redis processing queue |
| `prisma/` | Database schema and three SQL setup scripts; users, scans, completion receipts, counters, and other planned entities |
| `public/` | 30 static assets, including branding and preview imagery |
| `tests/` | 32 Node test files plus a loader helper covering auth, providers, local inference, reference matching, the presentation preset, history, statistics, and deployment checks |
| `scripts/` | Authentication readiness, deployment configuration, and public-link checks |
| `docs/` | Setup references, model/provider behavior, architecture, and dated plans/specifications |
| `client_discussion/` | Plain-language feature discussion; some limits and capability descriptions are outdated |
| `.github/workflows/` | Automated repository checks |
| `.local-backups/` | Archived material outside the active application flow |
| `node_modules/` | Installed dependencies and the Next.js guides required by `AGENTS.md` before code changes |
| `.next/` | Generated Next.js build/development output |
| `index.html`, `src/app/page.tsx.bak` | Standalone HTML and inactive source backup; active homepage is `src/app/(public)/page.tsx` |
| Root configuration | Package scripts, TypeScript, Next.js, Tailwind, ESLint, Prisma, and environment configuration |

## Architecture and user flow

The installed stack is Next.js 16.2.12, React 19.2.4, TypeScript, Tailwind CSS 4, Radix UI, Framer Motion, Recharts, Auth.js 5, and Prisma 7 with PostgreSQL. Browser inference uses Hugging Face Transformers and ONNX/WASM; MediaPipe finds faces for local checks. Node 24 is specified in `package.json`.

Typical flow:

1. Visit the public site and choose Start Scanning.
2. Choose Google or Guest and enter the dashboard.
3. Select a tool and provide content.
4. Run local text inference, a media scan with automatic on-device backup, or a web plagiarism search with automatic reference comparison.
5. View results. Successful primary analyses attempt to save a private summary and update shared counters. On-device results stay on the page.

Relevant connections:

- **Google/password authentication:** `src/lib/auth.ts`, `auth-settings.ts`, `auth-db.ts`, and auth routes. Password sign-in supports existing verified database accounts.
- **External media:** `src/lib/sightengine.ts`; server-only `SIGHTENGINE_API_USER` and `SIGHTENGINE_API_SECRET` configuration.
- **Plagiarism search.** SerpApi uses the server-side `SERP_API_KEY`. The browser backup uses public Wikipedia search and bundled references without an API key.
- **Local models:** Downloads from Hugging Face/CDN; inference executes on the visitor's device. This does not guarantee fully offline operation.
- **History:** `with-scan-history.ts`, `scan-persistence.ts`, `scan-history-repository.ts`, `src/app/api/history/`, and `src/lib/auth-db.ts`.
- **Shared statistics:** `src/app/api/statistics/`, `platform-statistics.ts`, and `statistics-db.ts`.

## Current implementation versus older claims

- **The five tools include Plagiarism.** Enhancement is not a separate dashboard page. The older README feature list differs from current navigation and homepage tools.
- **Persistent history is implemented in source.** Account and guest ownership are separate. Twenty is a page size, not a storage cap. Successful external results save an allowlisted summary, completion receipt, and statistics transactionally; this history implementation does not retain submitted text or uploaded media. A storage outage produces an unsaved notice. Live database/schema availability was not checked.
- **The disabled legacy `src/lib/db.ts` does not disable current history.** Active history uses the Prisma client in `src/lib/auth-db.ts`. Older descriptions of browser-only history are obsolete.
- **Local results stay on the scan page.** Text and media run trained models. The plagiarism backup measures overlap with the sources it checked. History and platform statistics exclude these results.
- **Signup and forgot-password remain unfinished.** Their APIs return HTTP 501 setup placeholders. Google and existing verified password-account sign-in have separate implementations.
- **Reports remain partial.** `GET /api/report/[id]` returns a setup placeholder, Reports is an empty screen, and public `/report/[token]` uses demonstration data. Saved history has its own result-viewing route.
- **Generic URL scanning is a demo.** `POST /api/scan/url` validates syntax and generates random scores without analyzing the destination. This differs from the real video-URL path inside `POST /api/scan/video`.
- **Several README promises exceed current implementation.** Separate batch/team/enhancement pages, Redis/BullMQ processing, and a complete public developer API were not found. API-key UI does not establish a working backend service.
- **Older limits differ.** Client discussion mentions 2 GB videos and a 30-minute cap; current extraction enforces 200 MB and does not establish that duration cap. Claims of independent lip-sync analysis also exceed the inspected code.

## Entry points and development

Start with the five tool pages, their routes, and `src/components/dashboard/sidebar.tsx` to understand current scope. Related references:

- [Local text detector](local-text-detector.md)
- [Provider behavior](detection-provider-behavior.md)
- [Authentication setup](authentication-setup.md)
- [Persistent history setup](persistent-history-setup.md)
- [Persistent history validation](persistent-history-validation.md)
- [Repository layout history](repository-layout.md)

Compare these historical documents with current source, particularly newer compact text and local media backup implementations.

Run from `C:\Users\IT PC_2\Desktop\ELUCID-AI`:

```powershell
npm.cmd run dev
npm.cmd test
npm.cmd run lint
npm.cmd run auth:check
npm.cmd run check:deployment
npm.cmd run build
```

Indexing inspected local structure and source only. Tests, build, browser behavior, model downloads, provider credentials/credits, production schema, and live deployment were not validated in this pass.
