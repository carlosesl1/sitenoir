# Case redesign results

Verified on 2026-07-29 against the production build at
`http://127.0.0.1:3100`.

## Decision

Keep the editorial V2.

The three categories now have distinct composition systems while preserving the
NOIR shell, typography, spacing, navigation, dark canvas, utility metadata, and
commercial ending. Each case uses three authored chapters rather than repeating
the same template by obligation.

| Case | Category identity | Media fit | Copy | Mobile | Decision |
| --- | --- | --- | --- | --- | --- |
| Together Site | Pass | Pass | Pass | Pass | Keep |
| Madeireira Fortaleza | Pass | Pass | Pass | Pass | Keep |
| JR Express | Pass | Pass | Pass | Pass | Keep |
| Strong | Pass | Pass | Pass | Pass | Keep |
| Together Motion | Pass | Pass | Pass | Pass | Keep |
| ECOX Hostel Cabanas | Pass | Pass | Pass | Pass | Keep |
| Chapada Backpackers | Pass | Pass | Pass | Pass | Keep |
| Contábil Sudoeste | Pass | Pass | Pass | Pass | Keep |
| Posto Ipiranga | Pass | Pass | Pass | Pass | Keep |

## Visual review

- **Sites:** asymmetric interface compositions, project decisions, and
  desktop/mobile proof. Real client interfaces remain legible and are not
  cropped into a shared arbitrary ratio.
- **Videos:** campaign-led first fold, real controllable videos, portrait rhythm,
  and a dedicated production-credit block. Strong is the principal video case
  and opens with all three products as a single campaign.
- **Dolomon:** the shared production credit now uses his real optimized portrait
  in Strong, Together Motion, and ECOX, with the same crop on desktop and mobile.
- **Google:** search-to-decision journey, real Google captures, explicit
  discovery/verification/action logic, and a client-specific accent.
- **Chapada Backpackers:** the incorrect generated backpack artwork is gone.
  The hero now combines a Chapada landscape with the real business profile.
- **Mobile:** all media stacks in authored order, video controls remain usable,
  CTA cards reflow, and no horizontal overflow was detected across the nine
  routes.
- **Typography:** editorial headings use semibold (`600`) rather than bold
  weights.
- **Hero containment:** Site and Google titles now use a bounded editorial scale
  and a wider copy track. Painted text stays inside its own column instead of
  crossing over the hero media; video titles keep their full-width composition
  with a safe long-word fallback.

## Hybrid image system

- Nine background-only editorial images were generated with GPT Images through
  ChatGPT, one per case.
- Real screenshots and real video frames were composited afterwards by the
  local Sharp pipeline.
- Eight hero assets are `2400 × 1500`; Together Motion is `2400 × 1350` to
  preserve the motion case's source composition.
- Final optimized assets are under `public/cases-v2/<slug>/hero.webp`.
- Authoring sources and local Windows paths do not appear in generated HTML.

## Evidence

- Before screenshots: `output/playwright/cases-before/`
- After screenshots: `output/playwright/cases-after/`
- Desktop first-fold comparison:
  - `output/case-redesign/cases-before-desktop-fold.png`
  - `output/case-redesign/cases-after-desktop-fold.png`
- Full-page review sheets:
  - `output/case-redesign/cases-after-desktop.png`
  - `output/case-redesign/cases-after-mobile.png`
- Hero review: `output/case-redesign/hero-contact-sheet.png`
- Generated-background review:
  `output/case-redesign/background-contact-sheet.png`

## Verification

- `npm run build`: passed; all nine case routes were statically generated.
- Production heading-containment E2E: passed across all nine routes at `390`,
  `768`, `900`, `1024`, `1280`, `1366`, `1440`, `1536`, and `1920` pixels
  (`81` case/viewport combinations).
- Full case-page E2E against the active local server:
  `25 passed`, with the duplicate mobile-project execution of the
  multi-viewport test intentionally skipped.
- Dolomon portrait E2E: `2 passed` across desktop and mobile Chromium, covering
  all three video cases.
- Focused unit/component/data/asset verification:
  `27 passed` across eight files.
- Generated HTML:
  nine files, all with `data-case-layout`, the expected V2 hero, no
  `asset-sources` path, and no local `C:\Users\Carlos` path.
- V1 fallback hashes still match the recorded baseline:
  - `CaseStudyArticle.tsx`:
    `25B0A555CC3D9711C8C700D15D87FEC081F50E518F6B5A65E2EE1AFCD524C159`
  - `CaseStudyArticle.module.css`:
    `945B24B9E511717FBEF614D0EC60E026E796C40D62DDD5BD62C79870A4BF01ED`
  - `case-studies.ts`:
    `0F1D7059F92CD2252DD450AE2F9EC4AB36CDDDBF13A1882218AA6A72DDFC9C46`

The existing `metadataBase` build warning remains unchanged and is outside this
case-page redesign.

## Fallback

The prior presentation remains unchanged in:

- `components/services/CaseStudyArticle.tsx`
- `components/services/CaseStudyArticle.module.css`
- `data/case-studies.ts`

To restore V1, switch only the V2 imports and render in
`app/services/[slug]/page.tsx` back to the original case data and
`CaseStudyArticle`.
