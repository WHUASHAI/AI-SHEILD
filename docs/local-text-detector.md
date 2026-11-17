# Temporary on-device text detection

The Text Analysis page uses free, experimental on-device models. The paid provider selector and integration have been removed. The legacy text POST endpoint returns HTTP 410 without making external calls or saving a scan. No made-up/random scores, fixed generator guesses, or plagiarism results are used.

## Model and requirements

- Original: [Fakespot RoBERTa](https://huggingface.co/fakespot-ai/roberta-base-ai-text-detection-v1), Apache-2.0, trained to classify English AI/human writing.
- Browser conversion: [Lynote ONNX mirror](https://huggingface.co/Lynote/fakespot-ai-roberta-base-ai-text-detection-v1-browser), Apache-2.0, pinned revision `75d794c69eecf566e98aa7717327aed159f21f21`.
- Runtime: `@huggingface/transformers` 3.8.1 (Apache-2.0), CPU/WASM in a Web Worker, one thread; no WebGPU or cross-origin isolation required.
- Primary AI/Human weights are FP32 `onnx/model.onnx`, **498,861,222 bytes**. The technical download/API description was removed from the introduction at the user's request. Tokenizer/runtime files require additional downloads. This is unsuitable for some low-memory phones. There is no promise of unlimited hardware capacity or speed.
- AI results additionally use [Mike0307's five-class source-family model](https://huggingface.co/Mike0307/ai-text-detector-zh-en), MIT, pinned revision `dacee250b0f45b2aaed394bb20ca36da34f1f2e3`. Its int8 graph is 851,458 bytes plus 195,373,056 bytes of external weights. This extra model increases browser memory use and initial loading time.
- Model/runtime files download from Hugging Face/CDN; inference runs on the visitor's device. Browser caching is requested but may be unavailable, evicted, or cleared. The app itself still requires its normal network connection. Do not advertise complete offline availability.

## Interpretation

The page and worker use the same cleanup and word counting. The minimum is **50 readable words**, with a 50,000-character maximum and no minimum character count. Fifty-word passages below the old 300-character limit are accepted. The worker checks English language identification and extreme repetition. A regression example of simple 50-word English ranked Scots first with English a very close runner-up; that specific near-tie is accepted with an explicit language-reliability warning. These are input suitability checks, not evidence of AI authorship. Unsupported or unusable inputs return an error with no invented verdict or score.

The tokenizer splits readable text into at most 384-token passages. The page automatically checks every passage; the scan-depth selector has been removed. The underlying sampling helper remains available internally but is not used by the page. The UI reports actual passage/token coverage and offers expandable passage excerpts with their model scores. All passages are classified individually, then token-weighted. Model output must contain finite AI/Human scores that sum to approximately one. The mean is a **model score**, not a calibrated authorship probability, fraction of AI-written words, or accuracy measure.

A mean at least 0.5 produces **Likely AI-Generated**; a lower score produces **Likely Human-Created**, as requested. The page shows complementary AI and Human percentages, rounded to one decimal place; the circular score follows the selected label. At the user's request the Low confidence banner has been removed. Reliability metadata remains internal, a brief accuracy note stays beside the score, and input/coverage limitations are available under expandable About these estimates. Removing warnings and lowering the minimum do not improve model accuracy. Human and AI writing can both be misclassified, particularly edited text and unfamiliar domains.

The binary detector does not itself identify source platforms. For likely AI results, a separate trained XLM-RoBERTa classifier estimates the source family from text patterns, even without platform names. Its labels are human, openai, anthropic, google, and other_ai. Among the AI families, the token-weighted highest score across up to three 254-token windows becomes **ChatGPT / OpenAI**, **Claude / Anthropic**, **Gemini / Google**, or **Other AI family**. No fabricated brand percentages are displayed. This is a model-based family guess, not verified provenance, exact model identity, or a reliable attribution guarantee. DeepSeek is not a separate class and must not be substituted for other_ai.

The source model uses its original tokenizer, then remaps ids through the author's little-endian `id_map.bin` before inference against the trimmed vocabulary. BOS/EOS bound each window to 256 tokens. Five logits are checked for validity and passed through stable softmax. The int8 graph has a custom filename and external weights; the `fp32` loader option selects the unsuffixed filename and does not change the graph's actual int8 quantization. Source-family guesses use raw class outputs. The author's optional binary fusion calibration is not applied because the existing Fakespot detector continues to own the AI/Human score. Author-reported benchmark accuracy must not be claimed for this combined implementation.

Explicit self-identifications and generation credits remain available as separate, unverified source claims; they do not determine the model-family guess or alter AI/Human scores. `sourceModel` stays null because no origin is verified. If the secondary model fails, the real primary result remains usable; a source claim may be shown as such, otherwise platform estimation is unavailable. No guessed brand is invented to conceal a failed model.

## Privacy and history

Text and local scores are not posted to a detection or history endpoint. Results exist in this page's memory and are discarded on navigation/reload. Local results do not update History or global statistics: a browser-provided prediction cannot be independently verified by the existing server. The removed provider key is not required or read by the application.

## Event check

1. Start the app, open `/dashboard/text`, and run analysis. Every passage is checked automatically.
2. On the event laptop, submit at least 50 words of English prose and let the initial download finish. Keep the tab open.
3. Test representative human and AI passages, borderline/mixed input, non-English input, and a second scan. Check actual latency and memory on the intended browser.
4. Use the passage coverage and expandable limitations when interpreting results. A likely label or an unverified platform guess is not proof of authorship.
5. This change covers **text only**. Image, video, deepfake, and plagiarism routes keep their existing providers. Source changes do not publish the live website automatically.

## Initial validation on 17 November 2026 (before the binary-label change)

- All 126 automated tests passed (eight cover local input suitability, sampling bounds/coverage, score validation, uncertainty, pipeline reuse, and failure behavior). TypeScript, focused ESLint, public navigation checks, and the production build passed.
- Actual Chrome/WASM inference worked through the Next.js page, with no paid text scan requests or page/worker runtime errors. Initial download plus inference took about 60 seconds on the first run; a second scan using the loaded model took about two seconds. Times vary with device and connection. Later browser sessions could read cached weights, but the app does not guarantee persistent caching.
- Two assistant-written test passages returned likely AI. A public-domain Alice's Adventures in Wonderland excerpt returned **inconclusive** (71 AI model score); a short input returned inconclusive without a score. These checks establish that the runtime and conservative output handling work, **not** a reliable accuracy rate. Do not change thresholds just to force a preferred result on these samples.
- Local private QA artifacts are under `.local-backups/local-detector-qa/` and are excluded from Git.

The Alice excerpt above is a concrete false-positive risk with binary output: its approximately 71 AI score now gives likely AI with Low confidence. This is a display-policy change, not a new or improved model prediction. Do not present the binary labels as forensic proof or tune thresholds just to force preferred outcomes on a small set of samples.

## Final verification after removing the paid provider

- All 123 current tests passed. The retired provider tests were replaced with no-outbound-call/no-statistics tests and expanded local-model coverage. TypeScript, focused ESLint, public navigation checks, and the final production build passed.
- Actual Chrome tests completed a 50-word/218-character inference, rejected 49 words in the UI, and classified the exact 618-character passage from the user's screenshot. That passage returned Likely Human-Created with AI 1.2 / Human 98.8 model scores and a short-context warning. This is a single-example runtime check, not an accuracy benchmark.
- Literal platform mentions were displayed as unverified; no generator identity was inferred. There were zero paid text scan requests and zero page/worker runtime errors.
- The active source contains no old provider option, old 100-word requirement, or Mixed or Inconclusive result. Its key was removed from the local environment and template. The live website still requires a separate deployment.

## Banner removal and platform-clue update

At the user's request the confidence banner was removed, while AI/Human scores, the 50-word minimum, and a brief accuracy note remain. Unsupported input still produces an error instead of a guessed authorship verdict. Source guesses require explicit self-identification or a generation credit and are displayed as unverified with their triggering text. Generic prose, brand mentions, negations, and questions do not justify assigning a platform. Claims do not change model scores, and verified sourceModel remains null.

All 126 current tests, TypeScript, focused ESLint, and the production build passed. Real Chrome tests verified the absent banner, unchanged 50-word inference, the screenshot regression, and explicit ChatGPT/DeepSeek clues. Ordinary mentions did not become source guesses. Zero paid text requests or page/worker runtime errors were observed. These checks establish functionality, not generator-attribution accuracy.

## Trained source-family estimator validation

The technical API/download introduction was removed at the user's request. A separate trained family classifier now runs on likely-AI inputs, rather than requiring platform names in the text. All 131 current tests, TypeScript, focused ESLint, and the final production build passed. Real Chrome tests loaded the pinned int8 graph, external weights, original tokenizer, and vocabulary id map; no paid scan requests or page/worker errors occurred.

The exact reading paragraph from the screenshot received a model-family guess of **Other AI family**. Another assistant-written sample received **ChatGPT / OpenAI**. Both lacked explicit source names. These are observations of the implemented runtime, not evidence of correct attribution. No source guess was changed to force a preferred brand. Exact DeepSeek attribution is outside this model's classes. Its source classification is conditional on the primary detector selecting AI and may be wrong even when the binary verdict is correct.

## Ranked platforms and directory

The user-facing heading is now **AI platform**, without the word guess. It retains the distinction between an estimated model family and verified origin. All four AI families are displayed in descending token-weighted score order. Scores are normalized across the four AI categories, conditional on comparing AI sources; they do not include the human class and are not calibrated app-origin probabilities. The overall AI/Human detector scores remain separate.

`src/lib/ai-platforms.ts` contains a reference directory of 22 major platforms, with first-party links checked on 17 November 2026. It is explicitly non-exhaustive. ChatGPT/OpenAI, Claude/Anthropic, and Gemini/Google have family-level support. The other 19 products are marked Not scored individually and have no fabricated detection scores. Multi-provider products such as Copilot, Perplexity, and Poe must not be assigned a unique underlying model just from their product name. Adding names to the directory does not add model classes or training coverage.

Validation: all 132 tests, TypeScript, focused ESLint, and the production build passed. Real Chrome checks verified four ranked score rows, 22 directory entries, no percentages on unsupported entries, no old guess heading, and preserved 50-word inference. Zero paid scan requests or page/worker runtime errors were observed.

## Closest named platform presentation

The AI platform panel now highlights the highest-scoring named family (OpenAI/ChatGPT, Anthropic/Claude, or Google/Gemini) as Closest named platform match. This is a conditional comparison among the named families, not a replacement for the overall classifier result. If Other AI scores higher, that stronger overall result is stated immediately below and remains first in the full ranking. The named family's original relative score is retained; it is not increased by re-normalizing after removing Other AI. Zero-evidence named families and failed source estimates do not receive an invented brand. The underlying detector, model weights, raw predictions, and unsupported-platform coverage have not changed.

Validation: all 133 tests, TypeScript, focused ESLint, and the production build passed. A browser presentation test used a labelled fixture based on the prior reading result (Other AI 64.3, OpenAI 35.6, Google 0.1, Anthropic 0). It verified ChatGPT/OpenAI as the closest named heading while retaining Other AI first in the overall ranking, its original higher score, and the explanatory text. This was a UI check, not a new model-inference or attribution-accuracy test.

## Firefox hydration fix

The reported React hydration error was reproduced in Firefox 160 after a scan and reload. Firefox restored the previous enabled button and textarea value before hydration, while the initial React state expected empty text and a disabled button. The error showed `disabled={true}` versus `disabled={null}`. The text input, run button, and cancel button now opt out of form-state restoration with `autoComplete="off"`; the run button also has an explicit button type. The shared Button accepts this Firefox attribute without changing defaults elsewhere. No hydration warning is suppressed. See the [Mozilla restoration issue](https://bugzilla.mozilla.org/show_bug.cgi?id=1847798).

Validation: all 134 tests, TypeScript, focused ESLint, and the production build passed. The new server-render regression covers stable initial control markup. An isolated real Firefox test reproduced the original mismatch, then completed three scan/reload cycles after the fix with no hydration warnings or browser console errors. This browser test uses a worker-result fixture to isolate form restoration; it does not measure inference or source-attribution accuracy. Private browser reports remain under `.local-backups/local-detector-qa/firefox-hydration/`.

## Single platform result (current presentation)

The AI platform directory and ranked model-family matches have been removed, along with the unused directory module and closest-named-family helper. The AI platform card displays only the winning source estimate and a brief explanation that origin is unverified. It now follows the overall classifier winner rather than highlighting a lower-scoring named family: OpenAI, Anthropic, Google, or Other AI. Other AI is displayed as **Other AI platform** without inventing a specific brand. Explicit source claims remain labelled as claims when the classifier is unavailable; they never replace a model result. AI/Human scores and the Firefox hydration fix are preserved.

This is a presentation and result-selection correction, not a model-accuracy improvement. The existing classifier has no separate DeepSeek, Grok, or other app classes and cannot accurately identify every paragraph generator. Family estimates do not prove which app produced a paragraph.

Validation: all 133 current tests, TypeScript, and focused ESLint passed. Browser UI checks used labelled worker fixtures for OpenAI, Google, Anthropic, and Other AI to confirm one matching platform result, no directory or ranking, and no runtime exceptions. These checks test presentation, not attribution accuracy; the previous source-model inference checks remain described above.

## Known Gemini 3.1 Pro attribution failure

The user supplied a 74-word creative paragraph beginning "The morning sun crested the horizon" and identified its generator as Gemini 3.1 Pro. On 17 November 2026 the exact paragraph was tested with real inference, without fixture worker results or paid detection calls:

| Test | Output | Interpretation |
| --- | --- | --- |
| Current application, real Chrome/WASM, pinned int8 source graph | Claude / Anthropic, 73.4 relative AI-family score; Google 19.8 | Reproduces the reported wrong source. Primary Fakespot still selects likely AI. |
| Same pinned int8 source graph, native Node CPU | Gemini / Google, 86.4 relative AI-family score | Backend-dependent prediction; this one correct result is not evidence of general accuracy. |
| Original fp32 source graph at the same pinned revision, native Node CPU | Claude / Anthropic, 98.8 relative AI-family score | Full precision also misattributes the example; increased precision is not a demonstrated fix. |
| `tildahh/modernbert-base-llm-author-attribution`, revision `2fae85b3bfb15f6d51b4a8fbae8d0a8884d02ad0`, q8, native Node CPU | Human, 99.996 class score | The alternative fails this creative-writing example and was not adopted. |

These values are model scores, not accuracy measurements or verified origin probabilities. Native/browser comparisons differ in execution backend, and the fp32 comparison also differs in precision. Do not attribute all differences to a specific kernel without further investigation. The [current source model author](https://huggingface.co/Mike0307/ai-text-detector-zh-en#limitations) warns that attribution degrades on newer generator versions. The [alternative model author](https://huggingface.co/tildahh/modernbert-base-llm-author-attribution#limitations) limits its evaluated use to short Q&A responses from four specific models, rather than general creative prose.

No replacement or label override was applied. The exact user sample and real outputs are stored privately under `.local-backups/local-detector-qa/attribution-comparison/`; the actual browser output is `.local-backups/local-detector-qa/gemini-browser-result.json`. The comparison helper can rerun the original source module against Node CPU with a local model cache, and the browser helper has a real-worker Gemini regression mode. These are diagnostic records, not passing accuracy tests. A future source-model change needs evaluation on multiple independently labelled Gemini, Claude, OpenAI, other-AI, and human samples before claiming an improvement; matching this one paragraph is insufficient.
