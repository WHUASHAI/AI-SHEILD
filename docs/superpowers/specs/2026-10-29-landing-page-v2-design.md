# Elucid AI Landing Page 2.0

## Intent and direction

Replace the homepage with an editorial, photography-led landing page using the existing navy, blue, slate, and lavender palette. The user delegated visual direction and requested a polished redesign with Start Scanning retained. Existing dashboard, detector, authentication, and history behavior remain the integration boundaries.

The selected direction uses oversized sans-serif headings with lavender italic-serif accents, generous spacing, fine rules, and a contact sheet of illustrative media. A dense dashboard hero and a neon technology illustration were considered; the editorial direction provides a clearer contrast with the existing application while preserving its colors.

## Visual specification

- Background: `#07111e`, with restrained navy light `#0b1e3a` and `#102B53`.
- Text: `#f0f4fa`; supporting blue `#7D9FC0`; borders from `#50698D`; lavender `#CEB5D4`.
- Typography: existing Inter/Geist sans; Georgia italic for selected heading phrases. No additional font download.
- Content width: 1280px, with responsive 24px/48px page gutters.
- Hero: “See beyond / the surface.”, a short product description, Start Scanning, Explore the tools, and three illustrative media panels.
- Middle: five interactive detection previews and an open three-step workflow.
- Finish: probability/context explanation, four native FAQ disclosures, a large scanning call to action, and a compact homepage footer without social icons.
- Retain the exact existing circular logo with its central diamond. Generated concept logos are references, not replacement identity assets.
- Preview photographs are generated illustrative media. Display no invented detector scores, fabricated metrics, customer logos, or testimonials.
- The video preview is explicitly a sample frame; it does not imitate a working video player.

## Integration and interaction

Every Start Scanning button uses the existing `ScanChoiceDialog` and Google/Guest entry flow. Tool buttons change an explanatory preview without making detector calls. Explore the tools scrolls to the real section. FAQs use native keyboard-operable disclosures. Public navigation retains the existing shared destination configuration and pre-build link check.

The homepage composition uses an isolated CSS module. The existing footer selects a compact variant on `/`; other routes retain their current footer. Mirror the completed landing assets/components into the existing persistent-history checkout without replacing its detector/history implementation.

## Accepted follow-up

The user selected this redesign as the actual homepage and requested Text Detection as the initial preview. Both its hero card and interactive preview display a real sample passage, with illustrative highlights and no generated detection scores. Text containers grow with their content on narrow screens.

The user also expanded the visual scope to sign-in and the dashboard. Carry the same deep navy (`#07111e`), readable blue supporting text (`#9ab4d2`), and lavender primary actions (`#ceb5d4`) through authentication steps, dashboard surfaces, navigation selection, and scanning buttons. Preserve authentication, detector, history, and result semantics; retain existing error/success colors.

## Opening-section correction

The user's latest clarification supersedes the original hero composition: make “One place. More perspective.” the opening section and the page's H1. Remove the preceding “See beyond the surface” hero and its contact sheet. Keep the five tool buttons, default Text Detection, and the existing downstream process, context, FAQ, closing CTA, and footer.

Use distinct examples for different tasks: Text Detection retains the café passage; plagiarism presents two fictional urban-gardening passages with matching phrases highlighted, using a two-column comparison that stacks on mobile. Image detection retains the woman's portrait; deepfake detection uses a separately generated interview portrait of a fictional man, saved as `public/landing-v2/deepfake-interview.webp`. Video retains the coastal sample frame. All examples remain explicitly illustrative.

Exactly two Start Scanning buttons remain on the homepage: one in the opening tool section and one in the closing section immediately before the footer. Preserve their existing Google/Guest dialog behavior and the shared navy/lavender palette.

## References and verification

Coordinated hero, tools/process, and closing-section concepts are saved under `docs/design/landing-v2/`. Production photographs live under `public/landing-v2/` as optimized WebP files.

Check desktop, mobile, keyboard focus, all five tool selections, all scanning entry buttons, FAQ expansion, reduced motion, missing images, overflow, navigation, and browser runtime errors. Compare the final browser screenshots with the concepts. Run TypeScript, targeted lint, existing tests, and public-link checks. Browser plugin is unavailable; use the existing Playwright installation for visual QA.
