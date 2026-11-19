# Detection providers and honest results

These changes extend the persistent-history implementation and the 17 November 2026 switch to on-device text detection. Local source changes do not update the live deployment by themselves.

## What sightengine.ts does

`src/lib/sightengine.ts` is the server API client. It sends requests to `https://api.sightengine.com/1.0` using `SIGHTENGINE_API_USER` and `SIGHTENGINE_API_SECRET` from Vercel. The endpoint is in source; secret values are intentionally not. The file handles image URLs, image uploads, video uploads, video URLs, and response interpretation. It does not host or train the detector models.

Text detection requires no API key. Sampled plagiarism web searches use `SERP_API_KEY`; the other external detector keys remain server-only. Guest and account usage shares the website owner's external provider allowance.

The Text page uses a free experimental [on-device model](local-text-detector.md), Fakespot RoBERTa. It downloads a real model and runs locally. Its paid provider option and outbound integration have been removed; the old POST endpoint returns HTTP 410. Local scores are not sent to History or platform counters.

## Corrected behavior

- Local scan/history origin checks now use the same resolver as Guest entry. A development page opened on `localhost:3000` can submit scans even if `AUTH_URL` uses `localhost:3001`. Production remains restricted to its configured HTTPS origin, and cross-origin requests still fail before detection.

- Deepfake response parsing corrected on 20 November 2026: Sightengine returns an image/frame score in `type.deepfake`, not a per-face `faces` array. The Deepfake, Image, and Video routes now consume and validate that documented field. Valid video scores no longer become a false "No faces detected across video frames" error. Primary face counts are unknown, not zero; low scores do not establish that a face was detected or that the media is authentic. The unsupported derived lip-sync metric has been removed. See [deepfake fix validation](deepfake-fix-validation.md).

- Text analysis accepts at least 50 readable English words, up to 50,000 characters. Every token-bounded passage is checked automatically; the scan-depth selector has been removed. The two successful verdicts are Likely AI-Generated and Likely Human-Created, with AI/Human model percentages. The user requested removal of the low-confidence banner; a brief accuracy note and expandable limitations remain. Unsupported inputs and failures do not become invented verdicts.
- Removed deterministic/random text verdicts, randomly chosen generator names, invented burstiness/perplexity signals, fabricated plagiarism scores, and the extra plagiarism search from the Text route. The Plagiarism page remains the separate web-match tool.
- The text detector cannot verify which generator wrote the text. A separate free trained source-family classifier estimates ChatGPT/OpenAI, Claude/Anthropic, Gemini/Google, or Other AI from likely-AI text. DeepSeek is not a separately trained class. These are labelled guesses, not verified origin; explicit text claims remain separate evidence and sourceModel stays null. A secondary-model failure preserves the real AI/Human result without inventing a brand. Plagiarism remains a separate tool.
- External provider HTTP 429 and recognized quota errors return a safe `PROVIDER_LIMIT_REACHED` response. Authentication/configuration failures, temporary failures, and malformed responses remain distinct. Raw upstream errors and credential-bearing URLs are not echoed.
- Browser submissions do not automatically retry after transport failure and reject overlapping submissions from the same mounted detector. A new intentional click remains a new operation. Existing completion receipts prevent recounting a completed operation.
- Deepfake frame analysis stops on provider failure rather than spending more calls after a known outage/quota failure. If an optional deepfake check fails after a successful image generation check, the response explicitly warns that only generation was assessed; face/deepfake values show Not checked.
- Plagiarism displays the actual count of sampled searches and describes its exact-web-match scope. It does not claim to inspect millions of sources, private academic indexes, paraphrasing, or structural similarity. Its percentage is a sample match rate, not a full-document plagiarism measure.
- If SerpApi reaches its quota, the dashboard compares passages on the device. One anonymous English Wikipedia search uses up to three six-word phrases, or five in deep mode. The browser compares the returned excerpts and four bundled texts. If the lookup fails or times out, the bundled comparison completes on its own. Word overlap counts each submitted word once across sources. An optional pasted reference stays in the tab. A zero means no matching passage in the checked material. [MediaWiki search API](https://www.mediawiki.org/wiki/API:Search)
- Sightengine, SerpApi, and Wikipedia have independent cooldowns. A completed on-device check stays on its page and does not create a History entry or increment website statistics.
- Image, Video, and Deepfake keep the usual analysis layout when the browser takes over. Progress describes model loading, face detection, and frame analysis. The page omits quota and backup-switch announcements. Completed results identify the provider as On-device vision analysis and retain their actual coverage and storage limitations.

These changes do not add credits, reset provider quotas, or bypass provider limits. They also do not implement distributed abuse prevention or a per-user billing system. The selected models and three-frame sampling are preserved, so baseline successful image/video model-operation costs are unchanged.

## Validation and live test limit

Exactly one live detection request was authorized and submitted on 22 October 2026: a one-sentence plagiarism scan returned HTTP 200 with one match on `www.whoi.edu` and a 100% sample match rate. No automatic retry occurred. This does not verify every provider, account balance, overall accuracy, or the undeployed corrections.

Subsequent provider/error/retry checks use local fixtures only. Do not run additional live scans without fresh user authorization.

Provider references checked during implementation:

- [Fakespot RoBERTa text model](https://huggingface.co/fakespot-ai/roberta-base-ai-text-detection-v1)
- [Sightengine operation accounting](https://sightengine.com/faq/what-is-an-operation)
- [SerpApi status and error codes](https://serpapi.com/api-status-and-error-codes)
