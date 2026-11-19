# Deepfake response fix — 20 November 2026

## Problem and change

Uploading a video with visible faces consistently produced HTTP 400 and "No faces detected across video frames." The Deepfake route required a `faces` array from Sightengine, but its [documented response](https://sightengine.com/docs/deepfake-detection) contains `type.deepfake`, an image/frame-level score. The application ignored valid results and inferred that no faces were present. Image and Video routes had the same incorrect score assumption.

All three routes now use a shared validator for the documented score. Deepfake video analysis keeps the highest unrounded score across the same three uploaded samples and returns their actual timestamps. Zero is a valid model score. Missing, malformed, or out-of-range scores fail explicitly, without a partial verdict; quota failures stop remaining paid frame requests and remain eligible for the existing local backup.

The primary provider does not return individual face counts, so the interface displays "Not reported by provider." The unsupported derived lip-sync metric was removed. A low score is labelled "Lower Deepfake Signals," not proof of authenticity or evidence of detected faces. Local backup still requires detected face crops and returns an inconclusive result when none are found.

No dependency, environment variable, database schema, provider model selection, or sampling-count changes are required for this fix.

## Regression coverage

`tests/deepfake-provider.test.mjs` executes the real route and provider client with controlled HTTP responses matching the official schema. Before the fix, it reproduced the false no-face error. Coverage includes:

- Uploaded video frames with valid scores and no `faces` array.
- Valid zero/low scores, image upload, and image URL analysis.
- Highest-score aggregation, real sample timestamps, and the unrounded 0.5 decision boundary.
- Missing/invalid scores and legacy-only face data producing errors rather than fabricated verdicts.
- Quota failure on a later frame stopping subsequent provider calls.
- Authentication, invalid frame uploads/counts, and invalid/missing timestamps rejecting before external requests.

`tests/scan-statistics-routes.test.mjs` now uses the official schema and checks Deepfake, Image, and Video completion accounting, plus high deepfake scores with low generation scores and no face arrays.

## Browser verification

The production build was served locally over HTTPS with controlled Sightengine responses and database access disabled. The browser recorded a short WebM from the repository's interview portrait asset, uploaded that actual video through the Deepfake page, and exercised real browser decoding, frame extraction, multipart submission, production route handling, and result rendering.

- High-score response: HTTP 200, Deepfake Detected, 93%, three sampled frames, actual positive timestamps.
- Low-score response: HTTP 200, Lower Deepfake Signals, 2%; no false no-face error.
- The two intentional analyses made exactly six controlled provider requests, one per frame, with nonempty JPEG uploads.
- Desktop and 390-pixel mobile rendering checked; no browser runtime errors or horizontal overflow.
- Database-unavailable behavior preserved the analysis and displayed the explicit unsaved notice.

Local browser fixtures and screenshots are in ignored `.local-backups/deepfake-validation/`; they are validation artifacts, not application runtime dependencies.

## Release boundary

Final local checks passed: all 158 tests, focused ESLint on changed source/tests, TypeScript (standalone and production build), all 12 public navigation destinations, and the optimized production build after the origin correction below. The production browser check above also passed. The initial restricted build could not fetch Google Fonts; its network-enabled retries completed successfully.

Run `npm test`, focused ESLint, and `npm run build` before pushing. GitHub Actions already runs the tests and production build. A build needs access to Google Fonts, as before this fix.

This validates response handling and the application flow, not the detector's accuracy on a particular real-world video. No paid live detector calls, production database connections, Git push, or deployment were performed. After the normal GitHub/Vercel deployment, reload the Deepfake page and resubmit a previously failing video to confirm the deployed service and current provider allowance. Sparse three-frame sampling and model limitations still apply.

## Follow-up: local origin mismatch

The subsequent screenshot showed a separate HTTP 403, "Open this action from AI-SHIELD," before the detector was called. The active development site uses `http://localhost:3000`, while local `AUTH_URL` points to `http://localhost:3001`. Guest entry already follows the incoming loopback host/port during development; scan/history mutations were still comparing against the fixed OAuth origin.

`src/lib/history-response.ts` now uses the same origin resolver as guest entry. During development, a same-origin localhost/127.0.0.1/IPv6-loopback request uses its actual host and port. Production retains the configured HTTPS origin. Missing origins, hostile origins/ports, forged non-loopback hosts, and forwarded-host spoofing remain rejected. OAuth callback configuration is unchanged.

The new `tests/history-http.test.mjs` regressions first reproduced the failure and now pass. A smoke check against the user's existing development server confirmed guest entry succeeds, same-origin deepfake requests pass origin/session checks, and cross-origin requests return 403. That smoke check intentionally stops at operation-key validation before any database or paid provider request.

After the origin change, the production browser flow was rerun successfully: real video decoding and three-frame uploads, controlled high/low provider scores, desktop/mobile rendering, zero runtime errors, and explicit rejection of an external-origin request before provider calls. An isolated development-browser run was stopped after its initial compilation stalled; development behavior is verified by the running-server smoke check and environment-specific regression tests, rather than by claiming that isolated run passed.
