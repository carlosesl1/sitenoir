# AI Services ASCII Wave — Design Specification

**Status:** Approved for implementation
**Date:** 2026-07-29
**Surface:** Noir Digital homepage
**Reference:** `C:\Users\Carlos\Downloads\ChatGPT Image 29 de jul. de 2026, 14_24_49.png`

## 1. Objective

Add a complete AI-services section to the Noir Digital homepage between `SelectedWork` and
`PrinciplesStory`. The section must translate the attached reference into the existing Noir design
system while preserving the homepage's current service cards, cursor story, scrolling behavior, and
performance characteristics.

The section will:

- introduce Noir's applied-AI offer;
- use a resolution-independent, static ASCII wave as its primary visual;
- distribute six interactive service markers across the wave;
- disclose a short service description on click or keyboard activation;
- remain usable and visually intentional from 320 CSS pixels through wide desktop displays;
- add no continuous animation loop, canvas, WebGL scene, or scroll listener.

## 2. Approved Visual Direction

### Visual thesis

A dense, technical signal field emerges from Noir black: a white-to-blue ASCII wave carries precise
service coordinates while editorial copy anchors the left side. The atmosphere should feel like an
operational system being mapped, not a generic AI dashboard.

### Existing tokens

No parallel palette or type system will be introduced.

- Background: `--color-noir-black` (`#030303`)
- Primary copy: `--color-noir-warm-white` (`#f4f4f0`)
- Secondary copy: `--color-noir-soft-gray` (`#a8adb2`)
- Active marker and wave accent: `--color-spectral-blue` (`#2f80ff`)
- Subtle optical accent: `--color-noir-optical-blue` (`#bfdff3`)
- Display type: `--font-display` (TikTok Sans)
- Interface type: `--font-interface` (Geist Mono)
- Compact marker labels: `--font-pixel` (Departure Mono)

The existing technical grid may continue through the section as a low-contrast CSS background. The
ASCII wave is the only high-density visual device. Generic glass cards, broad blurs, ornamental
gradients, and additional ambient effects are out of scope.

### Copy

Eyebrow:

> INTELIGÊNCIA APLICADA

Heading:

> IA para transformar operação em vantagem real

Body:

> Soluções de IA que aumentam a eficiência, reduzem custos e criam vantagem competitiva. Do
> diagnóstico à execução, com foco em resultado.

CTA:

> Falar com especialista

The CTA reuses `NoirControl` and links to `mailto:contato@noirdigital.com.br`.

## 3. Page Placement and Transition

`app/page.tsx` will render the homepage in this order:

1. `Hero`
2. `TrustStrip`
3. `SelectedWork`
4. `AiServicesSection`
5. `PrinciplesStory`
6. `ContactFooter`

`AiServicesSection` owns no sticky or pinned scroll sequence. It occupies at least one viewport on
desktop and returns to natural document flow on smaller screens. Its solid black ending provides a
stable visual handoff to `PrinciplesStory`.

`PrinciplesStory` already derives its progress from its own measured section rectangle. Inserting the
new sibling must not alter its internal progress thresholds. The existing animated cursor begins only
when `PrinciplesStory` begins.

A static, faceted blue cursor silhouette may be included inside the decorative vector wave to echo the
reference. It is part of the external SVG asset, not a second 3D model or interactive pointer. No
continuity claim is made between that still silhouette and the live cursor scene.

## 4. Resolution-Independent ASCII Wave

### Asset contract

The wave will be an external SVG image, not inline SVG and not a raster asset:

- `/assets/v1/ai-services/ascii-wave-desktop.svg`
- `/assets/v1/ai-services/ascii-wave-mobile.svg`

The component will select the appropriate composition with `<picture>`. Both assets use a `viewBox`,
have explicit intrinsic dimensions, remain sharp at arbitrary zoom or device-pixel ratio, and are
decorative with empty alternative text and `aria-hidden="true"`.

### Generation

`scripts/generate-ai-wave.mjs` will deterministically generate both SVGs. It will:

- sample a bounded mathematical wave surface;
- map density and depth to a small ASCII vocabulary such as `.`, `:`, `+`, `0`, `1`, `/`, and `\`;
- convert each glyph to simple vector stroke/path geometry;
- concatenate glyph commands into a small number of tone-grouped `<path>` elements;
- use white, optical blue, and spectral blue groups with restrained opacity;
- include no scripts, filters, embedded raster images, external font dependencies, or animation;
- produce stable output from fixed constants so generated assets are reproducible.

The SVG files remain external so the page DOM receives one image element rather than one element per
glyph. The generated paths preserve the ASCII appearance without depending on runtime text rendering.

### Performance limits

- No runtime wave generation.
- No `requestAnimationFrame`, interval, WebGL, canvas, or pointer tracking.
- Target: each SVG under 300 KB uncompressed and under 120 KB transferred with normal HTTP
  compression. If visual fidelity and the target conflict, path density must be reduced before adding
  runtime rendering.
- Load below the fold with `loading="lazy"` and `decoding="async"`.
- Reserve the image's aspect ratio before download to avoid layout shift.
- Serve from the existing immutable `/assets/v1/` cache path.

## 5. Content and Components

### Data

`data/ai-services.ts` will export a typed, readonly list:

| ID | Label | Description |
| --- | --- | --- |
| `custom-software` | Software sob medida | Sistemas e ferramentas construídos para o fluxo real da sua operação. |
| `process-automation` | Automação de processos | Integrações que eliminam tarefas repetitivas e reduzem gargalos. |
| `agents-copilots` | Agentes e copilotos | Assistentes com contexto do negócio para apoiar equipes e decisões. |
| `ai-implementation` | Implantação de IA | Diagnóstico, priorização e implantação segura de casos de uso. |
| `smart-integrations` | Integrações inteligentes | Conectamos dados, sistemas e modelos sem romper sua operação atual. |
| `operational-optimization` | Otimização operacional | Monitoramento e melhoria contínua para ampliar produtividade e margem. |

Content and visual coordinates remain separate. Marker coordinates belong to the section stylesheet,
keyed by `data-ai-service`, so copy changes do not silently alter layout.

### Component boundary

- `AiServicesSection.tsx`: section semantics, copy, CTA, selected-service state, and disclosure
  behavior.
- `AiServicesSection.module.css`: responsive layout, marker coordinates, visual states, and
  reduced-motion treatment.
- `ai-services.ts`: service content and IDs.
- `ascii-wave-*.svg`: generated decorative assets.

The component is a client component because it owns disclosure state. The data and SVG generation
remain framework-independent.

## 6. Marker Interaction

Each marker is a native `<button type="button">` with:

- a minimum 44-by-44-pixel hit target;
- a visible bracket/plus treatment derived from the reference;
- `aria-expanded`;
- `aria-controls` pointing to its description;
- a visible `:focus-visible` state;
- identical click, touch, and keyboard behavior.

Behavior:

1. Initial state has no service expanded.
2. Activating a marker opens its description.
3. Activating the selected marker again closes it.
4. Activating another marker switches the open description.
5. `Escape` closes the active description and returns focus to its marker.
6. A pointer press outside the active marker/detail closes it.
7. Only one description may be open at a time.

The global key and pointer listeners exist only while a description is open and are removed on close
and unmount.

On desktop, the description is positioned beside its marker without changing section geometry. On
mobile, the selected description is rendered in a reserved detail region below the wave so it cannot
overflow the viewport or cover other touch targets. The reserved region prevents layout shift when
selection changes.

Descriptions are real DOM text and remain comprehensible if the decorative SVG does not load.

## 7. Responsive Layout

### Desktop (`>= 1024px`)

- Minimum section height: the larger of `100svh` and a readable fixed minimum.
- Twelve-column Noir grid.
- Copy occupies roughly columns 1–5.
- The wave spans the full section and is strongest across columns 5–12.
- A localized dark scrim is allowed behind copy only when required for contrast.
- Six markers use percentage coordinates over the wave.
- Descriptions open beside markers and remain within the section bounds.

### Tablet (`768px–1023px`)

- Six-column grid.
- Copy keeps a clear reading column above or beside the wave according to available aspect ratio.
- Marker positions use a dedicated tablet coordinate set when desktop coordinates would collide.
- Labels never shrink below the compact interface scale and targets remain 44 pixels.

### Mobile (`< 768px`)

- Natural vertical flow with 16-pixel page gutters.
- Copy and CTA appear before the visual.
- The mobile SVG uses a portrait `viewBox`; desktop cropping is not reused.
- Marker labels remain distributed over the wave, but positions use the mobile composition.
- The description appears in the reserved region below the wave.
- The section must reflow at 320 CSS pixels and 200% zoom without horizontal scrolling.

## 8. Motion and Accessibility

The wave and cursor silhouette are static.

Allowed transitions:

- marker label opacity/color;
- small marker `transform`;
- description opacity/transform.

No layout property is animated. Under `prefers-reduced-motion: reduce`, disclosure state changes are
immediate.

Accessibility requirements:

- `<section aria-labelledby="ai-services-heading">`;
- one semantic level-two heading;
- no content encoded only in the decorative asset;
- contrast meeting WCAG 2.2 AA for body copy and controls;
- visible focus, keyboard activation, Escape behavior, and touch parity;
- marker labels remain readable without hover;
- decorative grid, wave, and cursor silhouette are excluded from the accessibility tree.

## 9. Verification

### Automated

- Component tests verify heading, CTA, all six markers, initial closed state, single-open invariant,
  toggle behavior, Escape behavior, outside close, `aria-expanded`, and `aria-controls`.
- Page-order test verifies `AiServicesSection` is between `SelectedWork` and `PrinciplesStory`.
- Asset tests verify both SVGs exist, contain `viewBox`, contain no `<script>`, `<animate>`, `<image>`,
  or embedded data URI, and stay within the approved byte ceiling.
- Source/CSS checks verify no canvas, WebGL, RAF, interval, scroll listener, or inline SVG is introduced
  by the section.
- Focused Vitest suite, typecheck, Biome check, and production build pass after the final change.

### Browser

Verify the live homepage at:

- 1440×900 desktop;
- 1024×768 tablet;
- 390×844 mobile;
- 320×640 narrow mobile;
- reduced-motion mode;
- keyboard-only interaction;
- 200% zoom/reflow.

Inspect:

- placement immediately after the last Google service card;
- clean handoff into the existing cursor story;
- text containment and marker/detail collisions;
- CTA and marker focus states;
- initial, selected, switched, and closed detail states;
- absence of horizontal overflow;
- SVG sharpness at zoom;
- console errors/warnings.

Performance comparison uses the pre-change 1280×720 baseline:

- page initially had 12 canvases;
- the new section must not increase canvas count;
- the new section must add zero continuously running CSS animations;
- the new section must add zero offscreen RAF/canvas loops;
- image dimensions and section geometry must remain stable before and after SVG load.

## 10. Acceptance Criteria

The work is complete only when:

1. the section appears between `SelectedWork` and `PrinciplesStory`;
2. its composition clearly reflects the approved reference without copying baked-in reference text;
3. the ASCII wave stays sharp at high DPR and browser zoom;
4. all six points are usable by mouse, touch, and keyboard;
5. descriptions disclose without overflow or layout instability;
6. desktop, tablet, and mobile compositions are intentional rather than one cropped layout;
7. the existing cursor story still begins and progresses correctly;
8. reduced motion and asset-failure fallbacks preserve all content;
9. the section adds no continuous animation or rendering loop;
10. focused tests, typecheck, Biome, build, and browser verification support the completion claim.
