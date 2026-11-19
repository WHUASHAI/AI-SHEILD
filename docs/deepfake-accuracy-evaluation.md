# Supplied Morgan Freeman clip: detection evaluation

Evaluated locally on 20 November 2026 after the user reported a 22% Lower Deepfake Signals result. This investigation did not change application scores, thresholds, or detector selection.

## Reference and input

The supplied file is `C:\Users\IT PC_2\Downloads\This is not Morgan Freeman - A Deepfake Singularity.mp4`, 3,984,367 bytes, 1280 by 720 pixels, approximately 63.546576 seconds. Its imagery/title match the [Diep Nep creator publication](https://www.youtube.com/watch?v=oxXpB9pSETo), which explicitly credits the deepfake to Bob de Jong and the voice imitation to Boet Schouwink. This source attribution is separate from a detector's output and is not a cryptographic provenance check of the downloaded file.

## Exact application extraction and live scores

The existing `extractMediaFrames` implementation was transpiled and executed unchanged in Chrome on a File/Blob containing the supplied video. It extracted:

| Sample time | Sightengine raw `type.deepfake` | Displayed model score |
| --- | --- | --- |
| 15.886644 seconds | 0.06 | 6% |
| 31.773288 seconds | 0.03 | 3% |
| 47.659932 seconds | 0.001 | 0.1% before integer display rounding |

The route's maximum aggregation would therefore produce 6% in this run. This differs from the user's prior 22% report, but both are negative classifications of a reference deepfake. The last sampled frame is in the black closing section. The first two contain the subject speaking.

There were three successful live API requests for this exact extraction, five provider operations each. A separate earlier comparison of an introductory full frame and a manual face crop returned 0.02 for both, consuming ten operations. Total investigation usage: five image requests, 25 operations. No automatic retries, production history writes, or website deployment were performed.

The [provider documentation](https://sightengine.com/docs/deepfake-detection) defines this output as a model score for visual facial manipulation. It is not a measured accuracy rate, a percentage of altered pixels, or independently verified provenance.

## Independent local model

The application's existing pinned `onnx-community/Deep-Fake-Detector-v2-Model-ONNX` revision `4ea3d66dfb1bedca29727c6a0c6fa061d5f3f9c9` was downloaded and evaluated locally using its q8 export. No inference credits were needed and no input frames were uploaded for these local runs.

For full frames at approximately 15.89, 31.77, and 47.66 seconds, its Deepfake class scores were 0.897417, 0.867586, and 0.598942. The last frame is black, so its positive score is not evidence of a manipulated face. A manually cropped face from the middle frame produced only 0.150930. These diagnostic inputs differ from the production fallback's automatically detected face crops and do not establish that fallback's result on this clip.

This is not a validated replacement: results change substantially with framing, and a non-face closing frame receives a positive class score. Taking whichever model returns the highest number would conceal disagreement and can increase false positives. The model author's reported validation metrics on its [model card](https://huggingface.co/prithivMLmods/Deep-Fake-Detector-v2-Model) are not the accuracy of this application on the user's videos.

## Corrected investigation hypothesis

An initial diagnostic HTTP stream without range support exposed a transient 4.84-second duration and repeated introductory frames. Reading the complete file as a Blob, as the application already does, yields the correct duration. The exact application extraction confirms full-length sampling. The transient diagnostic duration must not be described as a confirmed application bug; no speculative duration/sampling patch was shipped.

## Conclusion and release implication

The live provider misses this reference deepfake. Request/response fixes and successful build tests do not solve model generalization. No evaluated configuration justifies a 100% model result on this clip. Filename-based rules, hardcoded overrides, rescaling scores to match an expected answer, or cherry-picking a model result would not improve accuracy.

A client demonstration can accurately identify this as a creator-disclosed deepfake while showing the actual detector score and its miss. A promise of consistently high detection requires selecting and evaluating a better detector against both manipulated and authentic reference clips, including this failure case. A single known-positive clip cannot establish calibration or an overall accuracy rate.

Local frames, contact sheets, raw score summaries, model cache, and diagnostic scripts remain under ignored `.local-backups/deepfake-validation/`. The supplied video and extracted frames were not added to public assets or Git.
