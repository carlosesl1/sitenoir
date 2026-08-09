# NOIR.digital Design System

Status: migrated homepage and optimized production-asset contract
Last updated: 2026-07-14

## 0. Research Log

- Approved product specification: `docs/superpowers/specs/2026-07-10-noir-homepage-rebuild-design.md`; this is the decision authority for scope, content, architecture, accessibility, and acceptance criteria.
- Local NOIR runtime reference: `C:\Users\Carlos\Documents\site` with `?effects=on`, its root `DESIGN.md`, `public/custom-dark.css`, local fonts, models, stickers, work imagery, audio, and browser captures at 1280x720, 1440x900, 768x1024, and 390x844.
- Live behavior reference: `https://haoqi.design/`; preserve its interaction grammar and responsive intent. For the Hero optical surface, the authorized local source replay is the implementation contract: shader equations, render-pass order, FBO scales, material controls, and pointer coupling are ported into typed project modules while NOIR content remains independent.
- Reference priority: local NOIR runtime, approved captures, live HAOQI behavior, local design overrides, then local source assets. Dynamic values are fixed during visual verification.
- Embedded reference route: a concrete local/live reference already exists, so no alternate brand system, Lazyweb search, or Imagen concept generation was used. This foundation extracts the approved reference instead of inventing a greenfield direction.
- Visual thesis: an editorial technical grid interrupted by dimensional graphite typography and physical sticker color. The signature is tension between exact hairline geometry and tactile 3D material.
- Content plan: the production homepage contains hero, trust, selected work/services, principles story, and contact; `/showcase` remains the primitive reference surface.
- Interaction thesis: controls communicate through dotted focus, precise border shifts, and shallow physical press; scroll and 3D motion explain depth and reading order while reduced-motion users receive immediate equivalents.

## 1. Atmosphere & Identity

NOIR.digital feels like a precision instrument built from graphite, paper, and calibrated light: architectural rather than ornamental, restrained until the spectral sticker ramp or a dimensional object breaks the grid. Its signature is a twelve-column technical frame crossed by dimensional 3D material. The homepage applies that system across its complete editorial story, while `/showcase` preserves the primitive reference surface. The one aesthetic risk is deliberate contrast between severe editorial geometry and playful physical accents; other decoration stays quiet.

This system serves three named personas:

- **Desktop mouse user**: scans large editorial type, reads spatial hierarchy, and expects immediate hover and pressed feedback.
- **Mobile touch user**: needs a two-column-derived composition, 44px minimum targets, clear stacking, and no hover-only meaning.
- **Keyboard / reduced-motion user**: needs logical landmark order, persistent dotted focus, complete content without animation, and no continuous parallax or scroll choreography.

## 2. Color

### Palette

All runtime color values originate in `styles/tokens.css`. Components may only consume the semantic tokens listed here.

| Role | Token | Exact value | Usage |
|---|---|---:|---|
| Ink / deepest dark | `--color-noir-black` | `#030303` | Dark canvas, dark ink, light-theme selection |
| Graphite surface | `--color-noir-graphite` | `#0b0d0e` | Elevated dark panels |
| Carbon surface | `--color-noir-carbon` | `#151719` | Dimensional dark face and active surface |
| Warm white | `--color-noir-warm-white` | `#f4f4f0` | Primary dark-theme text and light canvas |
| Paper | `--color-noir-paper` | `#f3fbf9` | Cool paper specimen and future editorial media field |
| Light elevated | `--color-noir-light-elevated` | `#e8e8e2` | Raised light-theme surface |
| Soft gray | `--color-noir-soft-gray` | `#a8adb2` | Secondary labels and border source |
| Optical dark background | `--color-optical-dark-background` | `#030303` | Noir black optical field |
| Optical dark vignette | `--color-optical-dark-vignette` | `#a8adb2` | Cool gray pointer light |
| Optical dark output | `--color-optical-dark-output` | `#dde0e4` | Pale gray optical tint |
| Optical light background | `--color-optical-light-background` | `#ffead6` | Original light optical field |
| Optical light vignette | `--color-optical-light-vignette` | `#6196ff` | Original light optical shadow |
| Optical light output | `--color-optical-light-output` | `#acffb9` | Original light optical tint |
| Pointer trail | `--color-pointer-stain` | `#c0fe04` | Pixel trail shown over the solid dither state |
| Flare tail, dark | `--color-flare-tail-dark` | `#1600ff` | Source lens-flare tail in dark mode |
| Flare tail, light | `--color-flare-tail-light` | `#ffa300` | Source lens-flare tail in light mode |
| Spectral red | `--color-spectral-red` | `#f2383a` | Selection and sticker accent only |
| Spectral orange | `--color-spectral-orange` | `#ff8a2a` | Sticker ramp only |
| Spectral yellow | `--color-spectral-yellow` | `#f7d94a` | Sticker ramp only |
| Spectral green | `--color-spectral-green` | `#55d86a` | Sticker ramp and code sample only |
| Spectral cyan | `--color-spectral-cyan` | `#22d6d6` | Sticker ramp and code sample only |
| Spectral blue | `--color-spectral-blue` | `#2f80ff` | Sticker ramp and code sample only |
| Spectral violet | `--color-spectral-violet` | `#a855f7` | Sticker ramp and signature path only |

### Semantic ramps

| Token | Dark surface | Light surface | Meaning |
|---|---|---|---|
| `--surface-primary` | black | warm white | Page or specimen canvas |
| `--surface-elevated` | graphite | light elevated | Raised control and panel |
| `--surface-active` | carbon | paper | Pressed or selected control |
| Fullscreen dither color | `#0F1111` | `#FBFAF4` | Shared WebGL overlay that replaces section-owned surfaces during scroll |
| `--text-primary` | warm white at 96% | black at 96% | Headings and body |
| `--text-secondary` | soft gray at 68% | carbon at 68% | Metadata and explanations |
| `--text-disabled` | soft gray at 36% | carbon at 38% | Disabled controls only |
| `--border-default` | soft gray at 16% | black at 14% | Hairlines and guides |
| `--border-strong` | soft gray at 44% | black at 48% | Hover and focus emphasis |
| `--focus-color` | warm white | black | Dotted keyboard focus |
| `--selection-background` | spectral red | black | Selected text |
| `--selection-foreground` | black | warm white | Selected text foreground |

Rules:

- Spectral colors are reserved for physical stickers, selection, and explicitly documented code syntax. They never become generic CTA fills.
- Both light and dark surfaces must meet WCAG 2.2 AA contrast for text and controls.
- No raw color literal may appear outside `styles/tokens.css`; extend this section before adding a color.

## 3. Typography

### Families

- `--font-display`: TikTok Sans, self-hosted as a versioned WOFF2 subset; display and body.
- `--font-interface`: Geist Mono, self-hosted as a versioned WOFF2 subset; metadata and technical explanation.
- `--font-pixel`: Departure Mono, self-hosted as a versioned WOFF2 subset; controls, labels, and compact coordinates.

Three families are accepted because each already exists in the reference and has a non-overlapping role: editorial voice, technical data, and pixel control language. Fallbacks are `Arial, sans-serif` for display and `Courier New, monospace` for the mono roles.

`styles/fonts.css` registers the three versioned WOFF2 subsets with `font-display: swap`; TikTok Sans exposes `wght=400-700`, `wdth=100-120`, and `opsz=12-36`, Geist Mono exposes `wght=400-650`, and Departure Mono remains the regular 400 face. Authoring sources live outside `public/` in `asset-sources/fonts/` and are regenerated through `npm run assets:optimize`.

### Scale

| Level | Token | Size | Weight | Line height | Tracking | Usage |
|---|---|---:|---:|---:|---:|---|
| Display XL | `--type-display-xl` | `clamp(3rem, 8vw, 7rem)` | 700 | 0.88 | -0.045em | Homepage hero |
| Display | `--type-display` | `clamp(2.5rem, 6vw, 5rem)` | 700 | 0.92 | -0.035em | Showcase title and homepage section statements |
| Heading | `--type-heading` | `clamp(1.75rem, 3vw, 3rem)` | 650 | 1 | -0.025em | Specimen headings |
| Body large | `--type-body-large` | `1.125rem` | 450 | 1.5 | -0.01em | Lead copy |
| Body | `--type-body` | `1rem` | 450 | 1.55 | 0 | Default copy |
| Label | `--type-label` | `0.75rem` | 500 | 1.2 | 0.08em | Controls and specimen labels |
| Micro | `--type-micro` | `0.6875rem` | 500 | 1.25 | 0.06em | Grid coordinates only |

Supporting tokens: `--weight-body: 450`, `--weight-label: 500`, `--weight-heading: 650`, `--weight-display: 700`; `--leading-solid: 1`, `--leading-display: 0.92`, `--leading-heading: 1`, `--leading-body: 1.55`, `--leading-label: 1.2`; `--tracking-tight: -0.025em`, `--tracking-display: -0.035em`, `--tracking-heading: -0.025em`, and `--tracking-label: 0.08em`.

Task 2 production aliases preserve the homepage contract without replacing the foundation scale: `--display-xl: clamp(3.75rem, 5.1vw, 5rem)`, `--body: 1rem`, and `--mono: 0.875rem`; at widths up to 1023px, `--display-xl` becomes `clamp(2.25rem, 10vw, 3.25rem)`.

Rules:

- Display and body copy use TikTok Sans; interface metadata uses Geist Mono; actionable compact labels use Departure Mono.
- Body text never drops below 16px. The 12px and 11px sizes are reserved for short uppercase metadata, never paragraph content.
- Headings use `clamp()` and balanced wrapping; product copy must not rely on forced line breaks below the tablet breakpoint.

## 4. Spacing & Layout

### Four-pixel spacing scale

| Token | Value | Usage |
|---|---:|---|
| `--space-0` | `0` | Reset only |
| `--space-1` | `4px` | Dotted detail and micro offset |
| `--space-2` | `8px` | Tight inline gap |
| `--space-3` | `12px` | Compact control padding |
| `--space-4` | `16px` | Standard mobile gutter and group gap |
| `--space-5` | `20px` | Control horizontal padding |
| `--space-6` | `24px` | Panel inset and grid gutter |
| `--space-8` | `32px` | Specimen separation |
| `--space-10` | `40px` | Comfortable section inset |
| `--space-12` | `48px` | Major subsection gap |
| `--space-16` | `64px` | Page rhythm |
| `--space-20` | `80px` | Large vertical break |
| `--space-24` | `96px` | Desktop section boundary |

### Structural tokens

- Hairline: `--stroke-hairline: 1px`.
- Page frame: `--page-inline: 56px`; `--page-block: 24px`; at widths up to 1023px these become `16px` and `20px`.
- Responsive grid: `--grid-columns: 12` desktop, `6` tablet, `2` mobile; `--grid-gutter: 24px` desktop and `16px` below desktop.
- Inherited guide line: `--line: color-mix(in srgb, currentColor 13%, transparent)`.
- Dotted focus offset: `--focus-offset: 4px`.
- Minimum interactive size: `--control-min-size: 44px`.
- Control specimen width: `--control-min-width: 192px`.
- Grid-guide minimum height: `--guide-min-height: 192px`.
- Showcase introduction minimum height: `--intro-min-height: 320px`.
- Content maximum: `--content-max: 1440px`.
- Text measures: `--measure-display: 16ch`; `--measure-body: 60ch`.
- Radius: `--radius-none: 0`; `--radius-control: 2px` only where the dimensional control face requires it.
- Layer order: `--layer-plate: 0`; `--layer-face: 1` within an isolated control stacking context.

### Grid and breakpoints

- Desktop: twelve equal columns, 24px gutters, 32px outer margin, max content width 1440px.
- Tablet: six equal columns, 16px gutters, 16px outer margin.
- Mobile: two primary columns derived from the same grid, 16px gutter and outer margin.
- Breakpoints: mobile `<640px`; tablet `640px-1023px`; desktop `>=1024px`; wide `>=1280px`; max-grid `>=1536px`.
- Showcase behavior: one specimen column on mobile, two at tablet, twelve-column placement at desktop. Homepage sections use the same responsive grid contract.

Rules:

- All margin, padding, and gap values use the spacing tokens above; do not use arbitrary spacing.
- One-pixel values are structural strokes, not spacing.
- Asymmetry is permitted only when it expresses the approved sticky-statement/work-grid composition or the primitive showcase hierarchy.
- Runtime assets under `/assets/v1/` use `Cache-Control: public, max-age=31536000, immutable`; source assets never ship from `public/`. Stable favicon, model, and work-media URLs keep `must-revalidate` caching.

## 5. Components

### BrandMark

- **Structure**: an accessible home link containing the visible `NOIR.digital` wordmark and a compact `Foundation / 00` descriptor.
- **Variants**: dark-surface and light-surface via inherited semantic theme tokens.
- **Spacing**: `--space-1`, `--space-2`, `--space-3`.
- **States**: default; hover strengthens the dotted underline; active translates the face by `--space-1`; focus-visible draws the dotted focus outline. There is no disabled brand link.
- **Accessibility**: meaningful link text, minimum 44px target, no color-only state.
- **Motion**: micro transform/opacity transition only; removed under reduced motion.

### NoirControl

- **Structure**: shared visual primitive rendered as either native `<button>` or semantic `<a>`; a stationary back plate plus a dedicated inner face containing the label and optional short meta text.
- **Variants**: primary, quiet, link; dark-surface and light-surface through theme inheritance.
- **Spacing**: min height `--control-min-size`, inline padding `--space-5`, block padding `--space-3`, inner gap `--space-2`.
- **States**: default; hover raises only the front face and strengthens its border; focus-visible shows a dotted outline; active moves only the face until it meets the stationary plate; disabled uses disabled text/border, removes the plate, and preserves legibility. Reduced motion keeps the face stationary and uses an immediate active background plus strong border. Loading, success, error, and empty are not applicable to this stateless foundation control and must be specified before a future behavior uses them.
- **Accessibility**: native semantics, descriptive labels, disabled uses the native attribute, anchor has a real destination, touch target >=44px.
- **Motion**: 120ms transform/opacity/color transition with the standard easing; no animation in reduced motion.

### GridGuide

- **Structure**: non-interactive guide with vertical line, horizontal line, crosshair intersection, and coordinate label; `aria-hidden="true"`.
- **Variants**: line, cross, framed field; both theme surfaces.
- **Spacing**: label offset `--space-2`; guide placement follows grid columns.
- **States**: static only. No hover or animation because it is not interactive.
- **Accessibility**: excluded from the accessibility tree; never conveys content by itself.
- **Motion**: none.

### TypographySample

- **Structure**: semantic heading or paragraph with a visible role label and font metadata.
- **Variants**: display, body, interface mono, pixel label; both theme surfaces.
- **Spacing**: `--space-2`, `--space-3`, `--space-4`.
- **States**: static only.
- **Accessibility**: semantic reading order, no decorative letter splitting, sufficient contrast, content remains legible at 200% zoom.
- **Motion**: none.

### PrimitiveShowcase

- **Structure**: `<main>` with an introductory header followed by labelled `section` specimens for brand, controls, grid, and typography. Theme surfaces are explicit sections labelled `Dark surface` and `Light surface`.
- **Variants**: mobile, tablet, desktop responsive arrangements.
- **Spacing**: only Section 4 tokens.
- **States**: renders default controls, visible instructions for hover/focus/active behavior, and a native disabled control on both surfaces. It does not synthesize permanent fake hover/focus states; browser QA drives the real states.
- **Accessibility**: one page heading, meaningful section headings, native controls, clear keyboard instructions, no product navigation masquerading as the homepage.
- **Motion**: only primitive state feedback, disabled by reduced motion.

### ServicesStickyStack

- **Structure**: a four-column desktop rail contains the service eyebrow and statement while the eight-column project grid supplies the section height and scroll progression.
- **Typography**: the desktop statement uses TikTok Sans at `clamp(2.5rem, 3.75vw, 4rem)`, weight `560`, line height `0.98`, and tracking `-0.055em`.
- **Responsive behavior**: from 768px upward, the statement remains sticky at the header-safe inset for the full height of the project rail; below 768px, it returns to normal document flow above the cards.
- **Motion**: the statement itself does not animate or track scroll. Only the project cards move with the document and retain their existing edge-curl response.

### Reusable layout utilities

- `.technicalGrid`: responsive 12/6/2-column grid driven by `--grid-columns` and `--grid-gutter`.
- `.gridCross`: inherited-color structural crosshair driven by `--line`; decorative unless paired with separate semantic content.
- `.screenSection`: viewport-height section frame driven by `--page-inline` and `--page-block`.
- `FullscreenDither`: fixed 4 px WebGL dot field. Its radius follows the scroll position: transparent while the hero fills the viewport, fully covering the shared canvas when the hero bottom reaches 25% of the viewport, then fading within the final viewport of the services section and reaching zero at its end.
- `.visuallyHidden`: accessible visually-hidden content utility that remains available to assistive technology.
- Global reduced-motion rules make scrolling immediate and collapse animation/transition durations without hiding content.

## 6. Motion & Interaction

| Token | Value | Usage |
|---|---:|---|
| `--duration-micro` | `120ms` | Control hover, focus, press |
| `--duration-standard` | `240ms` | Future panel or menu transition |
| `--duration-emphasis` | `480ms` | Future meaningful entrance only |
| `--ease-standard` | `cubic-bezier(0.16, 1, 0.3, 1)` | Precise deceleration |
| `--ease-noir` | `cubic-bezier(0.66, 0, 0.01, 1)` | Approved homepage choreography curve |

Rules:

- Animate only transform, opacity, and where necessary color/filter for direct state feedback. Never animate layout dimensions or offsets.
- Hover must always correspond to an actionable element. Touch and keyboard receive equivalent feedback.
- Hero pointer response is a coordinated optical system, not object-following decoration: normalized pointer UV drives the background distortion center and a damped orbital key light; the hero model itself keeps its authored pose.
- The NOIR hero model uses screenshot-calibrated scales `9.7 / 17.8 / 25.5` for mobile, tablet, and desktop. The cursor copies the source transforms: scale `0.1`, position `[6.6, -5.6, -3]` below 1024 px and `[11.6, -4.2, -3]` on desktop. It keeps the GLB's authored diagonal orientation (`0°` local Z rotation); pointer movement may float it vertically but must not add object-level roll. During hero exit, scroll progress rotates it from `0°` to `720°` around Y conjugated by a `45°` Z-axis tilt, producing the source's vertical/diagonal tumble instead of a horizontal global-Y spin.
- NOIR and cursor exit motion begins at global scroll progress `0`, with no dead-zone offset. Their established completion points remain `0.095` and `0.09`, respectively, so immediate response does not shorten the visible choreography.
- The hero headline uses the local TikTok Sans variable font at `wght=700` and expanded `wdth=120`, matching the source's horizontally stretched letterforms rather than simulating width with a CSS transform. Its source-responsive scale is `7.2svw` below 1024 px, `5.4vw` at 1024–1279 px, `5vw` at 1280–1535 px, and `4.4vw` from 1536 px upward, with no desktop pixel cap.
- The header wordmark uses the same TikTok Sans `wght=700 / wdth=120` treatment with neutral tracking, keeping its letter proportions aligned with the hero typography.
- The hero background uses the source-replay pass order `vignette -> swirl -> sine -> shatter/Voronoi -> bokeh` at a 0.3 resolution scale, with source smoothing `0.1` while inside and `0.05` when leaving. These values are part of the reference-fidelity contract.
- The optical equations match the reference while the dark palette remains Noir: dark `#030303 / #a8adb2 / #dde0e4` at mix `0.86` and edge `-0.06`; light keeps `#ffead6 / #6196ff / #acffb9` at mix `0.65` and edge `-0.16`.
- Pointer coupling follows the original pass wiring: vignette, swirl and sine share the damped pointer center; shatter remains centered; bokeh keeps its lower fixed origin while sampling the pointer. Compact/reduced-motion modes use the fixed off-screen source `(0.5, -0.1)`.
- The final Hero frame uses the source six-ray lens-flare pass at 0.5 resolution, two-frame cadence, threshold `0.99`, intensity `0.7`, gate `0.88`, hotspot power `32`, and width-relative streak scale `8`. Pointer-driven fluid displacement composites with this flare and must never suppress its purple illumination.
- The Hero-to-services transition is one shared state machine. The solid state enters at `0.90` and exits below `0.82`; the refractive state enters at `0.985` and exits below `0.965`; optical passes freeze at `0.98` while their last texture remains under the dither.
- Optical rendering slows from every frame to every second frame above `0.50` and every fourth frame above `0.75`; compact viewports render every third frame.
- Stickers are physical particles rather than fixed decoration: twelve atlas-backed faces fall, rotate, drift in wind, recycle, react to short pointer clicks on desktop, reject drags and text selection, and freeze with the refractive state.
- Pointer activity runs the original 160px fluid solver: curl, vorticity/splat, divergence, four pressure iterations, gradient subtraction and advection. Its four chromatic samples create the visible spectral stain; it stops after 600ms idle, in compact/reduced-motion modes, and in the solid state.
- The solid dither state replaces fluid distortion with the original 16px, 14-cell lime pointer trail (`#c0fe04`).
- Work media keeps its DOM images as the reliable fallback and mirrors the original shader in an overscanned transparent canvas while scrolling. Each horizontal image strip uses the original screen-space profile `1 - sqrt(1 - centeredY²)` and the `0...0.06` velocity-driven curl strength; the strip bounds and its pixels expand together, curving the card silhouette outward near the viewport edges while remaining flat at its center.
- Native scrollbar chrome is hidden like the original `no-scrollbar` Lenis wrapper. A fixed custom rail reproduces the visible overlay indicator with a proportional thumb, track seeking and pointer dragging; Lenis remains the single scroll controller with `lerp: 0.1` and an external animation frame.
- Entry loading uses the original centered `140px × 6px` progress bar, then a `0.8s` radial dotted reveal from the viewport center. Reduced motion resolves immediately.
- Scroll choreography is progress-based, deterministic, and sourced from measured section geometry rather than whole-page percentage thresholds.
- Under `prefers-reduced-motion: reduce`, all transitions become immediate; future continuous parallax, smooth scrolling, and staged reveals are disabled while complete content remains visible.
- JavaScript motion and smooth-scroll initializers must query `window.matchMedia("(prefers-reduced-motion: reduce)")` and remain disabled when it matches; CSS is the final safety net, not the only preference check.

## 7. Depth & Surface

Strategy: **mixed border + dimensional 3D**.

- Editorial DOM surfaces use one-pixel hairlines, tonal shifts, and no generic card shadows.
- Interactive controls use a two-layer construction: a border-defined front face plus a shallow offset back plate. The face moves only to communicate hover or press.
- The Hero lettering uses the copied screen-space refraction material and a half-resolution scene FBO: spectral IOR `1.15/1.16/1.18/1.22/1.22/1.22`, refraction power `0.72`, chromatic aberration `0.14`, three samples, silver-blue tint `#f4f4f0 -> #dde8ff`, Fresnel, and source-derived tone controls. Other scene assets may retain physical graphite materials.
- The hero key light follows the source orbit (base vector `4, 9`, radius preserved, angular damping `6`) so highlights travel across the dimensional lettering as the pointer moves.
- Spectral glow is limited to approved sticker/signature accents. It may not tint broad surfaces or replace structural contrast.
- Generic glass cards, large blur panels, soft SaaS shadows, and ungrounded gradients are prohibited.

## 8. Accessibility Constraints & Accepted Debt

### Constraints

- Target WCAG 2.2 AA: 4.5:1 body contrast, 3:1 large text and graphical controls, visible focus on every interactive element, semantic landmarks, and logical heading order.
- All interactive targets are at least 44x44px and usable by mouse, touch, and keyboard.
- The primitive showcase and production homepage must remain usable at 200% zoom without horizontal scrolling at 320 CSS px where reflow applies.
- `prefers-reduced-motion` disables non-essential motion and provides an immediate equivalent state.
- Decorative grids and production canvases are hidden from assistive technology; equivalent content remains semantic DOM text.
- Light and dark surfaces are both first-class. Focus, disabled, hover, and pressed states cannot rely on color alone.

### Accepted debt

| ID | Item | Location | Affected users | Why accepted | Owner / Exit |
|---|---|---|---|---|---|
| `DEBT-001` | HAOQI contact details, project content, metadata, social destinations, and project links are temporary. | Homepage content/data modules | All users may encounter transitional brand content. | Approved spec preserves source content until final NOIR copy is supplied. | Product owner supplies final NOIR content; replace and re-run content/visual QA. |
| `DEBT-002` | Project detail pages are not part of this rebuild. | Selected-work links | Users leave the NOIR site for project details. | Explicitly out of scope. | Implement detail routes only under a later approved scope. |
| `DEBT-003` | Six client logos remain placeholders. | Trust strip | Users receive reduced trust context. | Final logo assets are not yet supplied. | Product owner supplies licensed logos and alt text. |

No accessibility debt is accepted in the migrated homepage. Temporary content debt must never be mistaken for permission to weaken semantics, contrast, keyboard access, or reduced-motion behavior.

### Resolved debt

| ID | Resolution | Evidence |
|---|---|---|
| `DEBT-004` | Resolved on 2026-07-14: the three approved self-hosted fonts are subset to WOFF2, declared, and loaded from the versioned production bundle. | `tests/asset-manifest.test.ts` passes 12/12 with recomputed byte counts and SHA-256 values; declarations expose TikTok Sans 400-700, Geist Mono 400-650, and Departure Mono 400. |
