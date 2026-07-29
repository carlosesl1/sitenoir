# Case redesign baseline

Recorded on 2026-07-29 before the category editorial V2 route switch.

## Rollback boundary

The current case presentation remains available in:

- `components/services/CaseStudyArticle.tsx`
- `components/services/CaseStudyArticle.module.css`
- `data/case-studies.ts`

The V2 implementation is isolated under new `case-v2`, `case-studies-v2`, and
`public/cases-v2` paths. Reverting the dynamic route import and render in
`app/services/[slug]/page.tsx` restores the current presentation without
removing V2 files.

## Baseline hashes

```text
CaseStudyArticle.tsx        25B0A555CC3D9711C8C700D15D87FEC081F50E518F6B5A65E2EE1AFCD524C159
CaseStudyArticle.module.css 945B24B9E511717FBEF614D0EC60E026E796C40D62DDD5BD62C79870A4BF01ED
case-studies.ts             0F1D7059F92CD2252DD450AE2F9EC4AB36CDDDBF13A1882218AA6A72DDFC9C46
```

## Visual evidence

Desktop and mobile screenshots are stored in
`output/playwright/cases-before/`.

Coverage:

- 9 case routes
- 1440 × 1000 desktop viewport
- 390 × 844 mobile viewport
- 18 full-page screenshots total

## Baseline verification

- `npm run build`: passed
- Next.js generated all 9 static case routes
- Existing `metadataBase` warning remains unchanged
