# Landing Page 2.0 Implementation Plan

> **For agentic workers:** Use inline execution with `superpowers:executing-plans` for this existing checkout. Preserve all pre-existing work.

**Goal:** Deliver an editorial homepage redesign with Text Detection selected first, readable sample prose, and consistent navy/lavender styling across sign-in and the dashboard. Retain the circular logo, navigation, and Start Scanning flow.

**Architecture:** A server-rendered homepage composes static hero/process/trust/FAQ sections and a client-side tool preview. A small scanning-button component integrates the existing dialog. Scoped CSS handles homepage composition and shared application surfaces; semantic theme tokens carry the palette into authentication and dashboard controls.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, CSS Modules, existing Radix dialog, Lucide, native disclosures, Next Image.

**Spec:** `docs/superpowers/specs/2026-10-29-landing-page-v2-design.md`

## Global constraints

- Existing circular logo and color palette stay canonical.
- Start Scanning opens the existing Google/Guest dialog; no new detector calls from previews.
- Illustrative media must be labeled and contain no fabricated scores.
- All public navigation must continue passing `check:links`.
- Respect reduced motion, narrow viewports, and keyboard access.

## Tasks

- [x] Generate coordinated section concepts and standalone portrait/landscape assets.
- [x] Export optimized media and save design references.
- [x] Implement the server-rendered homepage, shared CTA, and scoped visual system.
- [x] Implement five interactive detection previews and the compact homepage footer.
- [x] Keep this design as `/`, select Text Detection first, and replace placeholder lines with sample prose.
- [x] Extend the navy/lavender palette to authentication and dashboard surfaces and primary actions.
- [x] Verify browser rendering, responsive layouts, scanning entry, FAQs, tool switching, and visual fidelity.
- [x] Mirror the change to the existing persistent-history checkout and run its checks.
- [x] Run TypeScript, targeted lint, existing tests, and public-link checks; record actual results.

## Verification completed

- Root: 71 tests passed. Persistent-history checkout: 106 tests passed. TypeScript and targeted ESLint checks passed in both.
- Both public-navigation checks passed for all 12 destinations.
- Existing Playwright and Chrome tested `http://localhost:3000` at 1440px, 390px, and 320px, including default Text Detection, readable unclipped sample content, all five tool selections, scanning dialogs, focus restoration, FAQ disclosures, navigation, and reduced motion.
- Sign-in email continuation reached the password step; authentication and dashboard backgrounds/buttons matched the navy/lavender tokens. Actual guest entry reached the dashboard. Active Text navigation and mobile dashboard menu were exercised.
- Browser run reported no runtime errors, console warnings/errors, or failed HTTP resources. Auth session lookups were stubbed to an unauthenticated response; real OAuth, credential submission, and paid detector execution were outside this visual QA.
- Fixed findings: decorative scan motion now stops within five seconds; text preview grows to fit its passage on narrow screens.

## Opening-section correction

- [x] Promote the existing “One place. More perspective.” section to the opening hero and H1; remove the earlier hero/contact sheet and unused styles.
- [x] Keep exactly two scanning buttons: the opening section and the closing section before the footer.
- [x] Add a unique generated interview image for deepfake detection and a distinct two-passage plagiarism example; preserve Text Detection as the default.
- [x] Mirror these UI files and the optimized 48.6 KB WebP asset to the persistent-history checkout.
- [x] Verify TypeScript, targeted ESLint, and all 12 public destinations in both checkouts. Browser checks cover all five selections, distinct image URLs and text, exactly two working scanning dialogs, guest dashboard entry, responsive text fit, and reduced motion.

### Visual comparison

Reference: `docs/design/landing-v2/02-tools-process.png`. Chrome screenshots inspected with `view_image` against this reference. The latest user correction intentionally promotes this section to the hero, selects text first, removes the earlier hero, and separates the deepfake/plagiarism examples.

| Point | Result |
| --- | --- |
| Hierarchy and copy | Preserved “One place. More perspective.” and five numbered choices; promoted heading to H1. |
| Typography | Retained large sans-serif heading, lavender Georgia italic phrase, and deliberate control sizes. |
| Palette | Retained navy background, lavender actions/selection, and blue supporting text. |
| Layout and framing | Retained open two-column layout, fine row dividers, and rounded illustrative media frame; stacked cleanly on mobile. |
| Assets and samples | Deepfake now uses a separate male interview image; plagiarism compares two distinct passages. No invented detection scores. |
| CTA and behavior | Exactly two scanning buttons open the existing Google/Guest dialog and restore focus on dismissal. |

Latest visual run passed at 1440px desktop, the reference's native 1487 × 1058 dimensions, and 390px/320px mobile. It had no runtime errors, console warnings/errors, or failed resources. Real OAuth and paid detector execution were not part of this visual check.
