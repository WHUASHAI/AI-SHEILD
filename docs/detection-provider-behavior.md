# Detection providers and honest results

These changes extend the approved persistent-history implementation after the user reported fabricated text results and exhausted detector allowances. They do not add environment-variable requirements or alter the live deployment by themselves.

## What sightengine.ts does

`src/lib/sightengine.ts` is the server API client. It sends requests to `https://api.sightengine.com/1.0` using `SIGHTENGINE_API_USER` and `SIGHTENGINE_API_SECRET` from Vercel. The endpoint is in source; secret values are intentionally not. The file handles image URLs, image uploads, video uploads, video URLs, and response interpretation. It does not host or train the detector models.

The other providers remain `HUGGINGFACE_API_KEY` for text and `SERP_API_KEY` for sampled plagiarism web searches. Users do not enter these keys. Guest and account usage shares the website owner's provider allowance.

## Corrected behavior

- Text analysis uses the documented Hugging Face router and the existing RoBERTa detector model. It accepts only actual, valid Real/Fake probability responses. Missing keys, unavailable models, malformed results, and exhausted credits return an error, without a verdict or counter increment.
- Removed deterministic/random text verdicts, randomly chosen generator names, invented burstiness/perplexity signals, fabricated plagiarism scores, and the extra plagiarism search from the Text route. The Plagiarism page remains the separate web-match tool.
- The configured text model was trained on English GPT-2 outputs. It cannot reliably attribute text to ChatGPT, Claude, Gemini, or other modern generators. The result shows this limitation and discloses when only the first 2,000 characters were analyzed.
- Provider HTTP 402/429 and recognized quota errors return a safe `PROVIDER_LIMIT_REACHED` response. Authentication/configuration failures, temporary failures, and malformed responses remain distinct. Raw upstream errors and credential-bearing URLs are not echoed.
- Browser submissions do not automatically retry after transport failure and reject overlapping submissions from the same mounted detector. A new intentional click remains a new operation. Existing completion receipts prevent recounting a completed operation.
- Deepfake frame analysis stops on provider failure rather than spending more calls after a known outage/quota failure. If an optional deepfake check fails after a successful image generation check, the response explicitly warns that only generation was assessed; face/deepfake values show Not checked.
- Plagiarism displays the actual count of sampled searches and describes its exact-web-match scope. It does not claim to inspect millions of sources, private academic indexes, paraphrasing, or structural similarity. Its percentage is a sample match rate, not a full-document plagiarism measure.

These changes do not add credits, reset provider quotas, or bypass provider limits. They also do not implement distributed abuse prevention or a per-user billing system. The selected models and three-frame sampling are preserved, so baseline successful image/video model-operation costs are unchanged.

## Validation and live test limit

Exactly one live detection request was authorized and submitted on 22 October 2026: a one-sentence plagiarism scan returned HTTP 200 with one match on `www.whoi.edu` and a 100% sample match rate. No automatic retry occurred. This does not verify every provider, account balance, overall accuracy, or the undeployed corrections.

Subsequent provider/error/retry checks use local fixtures only. Do not run additional live scans without fresh user authorization.

Provider references checked during implementation:

- [Hugging Face text classification API](https://huggingface.co/docs/inference-providers/tasks/text-classification)
- [HF Inference router](https://huggingface.co/docs/inference-providers/providers/hf-inference)
- [Configured detector model and limitations](https://huggingface.co/openai-community/roberta-base-openai-detector)
- [Sightengine operation accounting](https://sightengine.com/faq/what-is-an-operation)
- [SerpApi status and error codes](https://serpapi.com/api-status-and-error-codes)
