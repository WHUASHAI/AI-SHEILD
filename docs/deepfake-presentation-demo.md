# Deepfake presentation demo

The Deepfake page supports a visibly labelled presentation preset for the client event. This is separate from real detection and does not improve or replace model accuracy.

## Using it

1. Enter the dashboard through Guest or sign-in as usual.
2. Open Deepfake and upload a video named `video-clear.mp4`.
3. The filename containing `clear` selects the presentation preset internally.
4. Click **Run Deepfake Analysis**.
5. A short preparation state lasts about 1.5 seconds, then the result displays **Detection Result**, **Deepfake Detected**, and **100%**, with a disclosure in Limitations and Disclaimer.

The user-supplied clip has been copied under the new name to ignored `.local-backups/deepfake-validation/video-clear.mp4` for local use. This does not add the video to public website assets or Git. The presenter uploads it from their computer. The website must be redeployed with the updated source before this feature is available on the live site.

## Trigger and scope

- Only the Deepfake page imports the preset helper, `src/lib/deepfake-demo.ts`.
- The check is a case-insensitive substring match: `clear` anywhere in a video filename. Thus `video-clear.mp4`, `CLEAR-example.webm`, and even `unclear.mp4` qualify. Use a filename without that substring to run actual detection.
- Images do not qualify. Files with an empty browser MIME type can qualify through the supported `.mp4`, `.mov`, or `.webm` extension.
- Other detector pages and the Deepfake API route retain real provider behavior; the API itself does not offer a filename override.
- Guest/sign-in access and upload size/type controls still apply.

## Honest result handling

The result has `isDemo: true`, `isReal: false`, `historySaved: false`, and `statisticsRecorded: false`. The branch returns in the browser before frame extraction or API submission. It performs no detector call, model download, history write, or statistics update. It reports zero analyzed frames and no measured face counts or signals.

The action button uses the normal analysis wording. During preset preparation, it says "Preparing result...". The result card uses the standard "Detection Result" heading. The normal Limitations panel is present and explicitly explains the fixed presentation score, with the same disclosure in Disclaimer. The separate yellow presentation banner and Preset Details panel remain removed. Unmeasured faces/frames and a fictitious provider are not displayed for the preset. Real analyses retain their signal, provider, and limitations panels. The 100% value is a presentation fixture, not a model score or an accuracy claim. Real video results remain subject to the limitations documented in [the supplied-clip evaluation](deepfake-accuracy-evaluation.md).

## Validation

The dedicated unit tests cover case handling, substring matching, video-only scope, normal-file passthrough, explicit demo flags, and the absence of invented analysis evidence. The production browser check exercises the renamed MP4, verifies the visible 100% demo and zero scan/history/statistics submissions, and checks that selecting an ordinary filename restores real analysis controls.

Passed: all 160 automated tests, focused ESLint, the optimized production build (including TypeScript), and desktop/mobile production browser checks. The demo made zero scan/history/statistics API requests. The prepared MP4's SHA-256 matches the supplied original; only its filename differs.
