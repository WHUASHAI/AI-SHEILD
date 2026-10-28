# Elucid AI logo assets

The active logo is the circular optical lens with a small four-point diamond in the center, restored at the user's request. Cyan, azure, and lavender sit against midnight navy. The Elucid AI wordmark remains live text beside the symbol.

## Assets

- `public/brand/elucid-ai-lens-master.png`: original generated logo PNG.
- `public/brand/elucid-ai-lens.png`: optimized 512px website and social-preview logo.
- `public/brand/favicon-v2-16.png` and `favicon-v2-32.png`: browser-tab icons.
- `public/brand/apple-touch-icon-v2.png`: 180px home-screen icon.
- `src/app/favicon.ico`: 16px, 32px, and 48px icons in one ICO file.
- `src/app/icon.jpg`: file-based Next.js app icon using the new mark.

`src/components/shared/logo.tsx` supplies the mark and wordmark to navigation, the footer, dashboard sidebar, account screens, shared reports, and the landing-page call to action. Verification emails and the standalone `index.html` use the same PNG. Root metadata supplies the icons and social-preview image.

The old `public/logo-icon.jpg` and `public/favicon-shield.jpg` URLs contain the new logo as compatibility aliases. Existing links to these URLs still resolve to the new identity.

## Creation

Created with the built-in image-generation tool. The selected prompt requested a circular optical-aperture emblem of two interlocking crescent ribbons surrounding a small four-point light symbol, with cyan/azure/lavender gradients on solid midnight navy. The saved design is restored without regenerating it. PNG resizing and RGBA ICO packaging preserve the selected artwork.

Alternate designs remain in the brand folder for reference. Active consumers use the restored lens assets and matching versioned favicon filenames.

The same assets and integration are maintained in the root checkout.
