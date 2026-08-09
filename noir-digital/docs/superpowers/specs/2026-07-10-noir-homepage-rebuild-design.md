# NOIR.digital Homepage Reconstruction

Date: 2026-07-10
Status: Approved design, awaiting written-spec review

## 1. Objective

Rebuild the current NOIR.digital homepage as an independent, maintainable Next.js project while preserving the visible content, composition, motion language, 3D atmosphere, responsive behavior, and interactions of the current local site.

The result must not depend on the mirrored `index.html`, compiled Next.js chunks, or runtime patches from the existing replay. It must be editable from typed source files and verifiable against deterministic visual references.

## 2. Scope

Included:

- Homepage only.
- Desktop, tablet, and mobile layouts.
- Fixed header, mobile menu, hero, trust strip, selected work, principles story, and contact footer.
- Theme, sound, pointer coordinates, keyboard shortcuts, smooth navigation, and reduced-motion behavior.
- Rebuilt Three.js/React Three Fiber scenes using the existing local models and textures.
- Existing HAOQI project content, contact details, social links, and project names preserved temporarily.
- Existing NOIR Portuguese hero and service copy preserved.
- Production build, accessibility checks, interaction tests, and screenshot-diff verification.

Excluded:

- Rebuilding project-detail pages.
- CMS, editor, authentication, passcode routes, analytics, payments, or a database.
- Reproducing the original compiled implementation internally when a simpler source implementation produces the same visible behavior.
- Reusing the original minified bundles.

Project cards that previously referenced internal HAOQI routes will temporarily link to their equivalent absolute `https://haoqi.design/...` pages. External project and social links retain their current destinations.

## 3. Sources of Truth

Visual and behavioral contract, in priority order:

1. Current local NOIR homepage with `?effects=on`.
2. Browser captures at 1280x720, 1440x900, 768x1024, and 390x844.
3. Live `https://haoqi.design/` behavior for interactions and responsive intent.
4. Existing `DESIGN.md` and `public/custom-dark.css` for NOIR tokens and layout overrides.
5. Existing local assets under `public/fonts`, `public/model`, `public/sticker_img`, `public/work`, and `public/bgm.mp3`.

Dynamic values are made deterministic during visual tests: fixed clock, weather, pointer position, random seed, and animation progress.

## 4. Technical Architecture

The new project lives at `C:\Users\Carlos\Documents\site\noir-digital`.

Core stack:

- Next.js 16 App Router.
- React 19.
- TypeScript with strict flags, including `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`.
- React Three Fiber and Three.js for 3D scenes.
- Lenis for smooth scrolling.
- Motion for interface transitions and menu choreography.
- CSS Modules plus global design tokens.
- Vitest and Testing Library for deterministic logic and component tests.
- Playwright for browser interactions and screenshot comparisons.

Source boundaries:

```text
app/
  layout.tsx
  page.tsx
  globals.css
components/
  header/
  hero/
  trust/
  work/
  principles/
  contact/
  controls/
features/
  audio/
  scroll/
  theme/
  pointer/
scene/
  SiteCanvas.tsx
  HeroModel.tsx
  ContactModel.tsx
  StickerField.tsx
  PointerModel.tsx
data/
  content.ts
  projects.ts
styles/
  tokens.css
  layout.css
public/
  fonts/
  model/
  stickers/
  work/
  audio/
tests/
  visual/
  interaction/
```

Each source file owns one clear responsibility and stays below 250 non-blank, non-comment lines unless it is a pure typed data table.

## 5. Visual System

### Thesis

An editorial technical grid interrupted by dimensional graphite typography and playful physical stickers. The surface feels precise and architectural, while the 3D objects add physical character and controlled disorder.

### Palette

- `--noir-black: #030303`
- `--noir-graphite: #0b0d0e`
- `--noir-carbon: #151719`
- `--noir-warm-white: #f4f4f0`
- `--noir-paper: #f3fbf9`
- `--noir-soft-gray: #a8adb2`
- Spectral sticker accents: red, orange, yellow, green, cyan, blue, and violet from the existing NOIR palette.

### Typography

- TikTok Sans for display and body copy.
- Geist Mono for interface metadata where it matches the current surface.
- Departure Mono for pixel-like labels and controls.
- Fonts are self-hosted, preloaded where appropriate, and loaded before visual-test screenshots.

### Layout

- Twelve-column technical grid on desktop.
- Fixed header with brand on the left and controls centered.
- Hero fills the first viewport.
- Selected work uses a sticky left statement and asymmetric image grid on desktop.
- Mobile reduces to two primary columns, removes desktop-only supporting copy, and keeps the headline dominant.
- Grid lines, crosshair intersections, and dotted focus/active states encode structure rather than decoration.

## 6. Homepage Composition

### Header

- `NOIR.digital` brand mark.
- Desktop controls: Work, Contact, Theme, Sound.
- Clock/weather and pointer coordinates.
- Mobile uses an accessible menu button with the same two-line visual treatment as the reference.
- Mobile overlay contains Home, Work, Contact, Theme, and Sound.

### Hero

- Desktop supporting columns: Design/Technology/Positioning, commercial statement, and descriptive paragraph.
- Main headline: “A estrutura digital / para sua empresa / crescer”.
- Responsive 3D `NOIR` model positioned behind and through the headline.
- Stickers and pointer model use deterministic responsive anchors.

### Trust Strip

- “Empresas que confiam”.
- Six current placeholders preserved.
- Two columns on small screens, three from 640px, six from 1024px.

### Selected Work

- Sticky service statement on desktop.
- Ten visible project cards with existing names, years, types, and imagery.
- First card spans the available work column; later cards form an asymmetric two-column rhythm.
- Images use stable aspect ratios, responsive sizing, meaningful alt text, and hover asset swaps.

### Principles Story

- Scroll-driven stages for positioning, design, principles, and technology.
- Word/letter reveals follow the current reading order.
- Motion is progress-based and deterministic rather than timer-dependent.
- Reduced motion presents the same content without staged transforms.

### Contact

- “Let’s Create Something Extraordinary”.
- Existing e-mail and social links.
- Contact GLTF scene, stickers, and pointer-aware parallax.

## 7. State and Data Flow

- Static content and projects are typed readonly data modules.
- Theme supports `system`, `light`, and `dark`; it persists to `localStorage.theme` and observes `prefers-color-scheme`.
- Sound persists to `localStorage.sound`. Audio starts only after a permitted user interaction and exposes an accurate pressed state.
- Pointer coordinates use a single external store consumed by DOM labels and the 3D canvas.
- Scroll progress is derived from Lenis and section measurements, then exposed as normalized values to the principles story and canvas.
- Keyboard shortcuts mirror the current interface with an accessibility-safe modifier: `Alt+L`, `Alt+D`, `Alt+A`, `Alt+S`, `Alt+T`, and `Alt+B`.
- Weather is fetched server-side only when a restricted environment key is configured. The UI uses a deterministic fallback when unavailable; no secret is shipped to the client.

## 8. 3D and Motion

- One fixed React Three Fiber canvas spans the viewport.
- Existing GLB/GLTF assets are copied into the new project and loaded through typed scene components.
- Materials use graphite physical surfaces, white bevel highlights, restrained refraction, and no uncontrolled spectral tint.
- Stickers are textured planes/sprites with responsive transforms.
- Project imagery remains semantic DOM media; the canvas is reserved for genuinely dimensional elements.
- Device pixel ratio is capped, heavy assets are loaded progressively, and geometries/materials are reused.
- Animation uses transforms, opacity, shader uniforms, and camera parameters only.
- WebGL resources, listeners, Lenis instances, and animation frames are disposed on unmount.

## 9. Accessibility and Failure Behavior

- Semantic `header`, `nav`, `main`, sections, headings, and `footer`.
- All controls are native buttons or links with accessible names.
- Visible keyboard focus matches the dotted NOIR language.
- Mobile menu traps focus, closes with Escape, and restores focus to its trigger.
- Theme and sound states are announced accurately.
- Canvas is decorative and hidden from the accessibility tree; equivalent textual content remains in the DOM.
- Missing images retain layout and show a neutral NOIR placeholder without instructional text.
- A WebGL initialization failure leaves the complete DOM experience usable.
- Reduced motion disables scroll choreography and continuous parallax without hiding content.

## 10. Performance and SEO

- No original Next.js chunks are copied.
- Only active production assets are included.
- Images are converted to appropriate WebP/AVIF derivatives while preserving originals when necessary for fidelity.
- Heavy 3D scenes are lazy-loaded after critical text and layout.
- Fonts, hero-critical assets, and layout dimensions are declared to avoid shifts.
- Metadata initially preserves the approved current HAOQI title/description while the visible NOIR content remains unchanged.
- Canonical, Open Graph, robots, and sitemap configuration are structurally supported but point only to the deployed domain once it is known.

## 11. Testing Strategy

Test-first boundaries:

- Theme state transitions and persistence.
- Sound state transitions and persistence.
- Keyboard shortcut mapping.
- Project-link normalization.
- Scroll target resolution.
- Reduced-motion selection.

Browser verification:

- Home, Work, Contact, light, dark, mobile menu open, and reduced-motion states.
- Viewports: 390x844, 768x1024, 1280x720, and 1440x900.
- No horizontal overflow, text clipping, overlapping controls, missing assets, page errors, or failed same-origin requests.
- Deterministic screenshots compare against the approved references.
- Dynamic values and animation time are fixed during screenshots.

Quality gates:

- TypeScript typecheck passes.
- Lint passes.
- Unit/component tests pass.
- Production build passes.
- Playwright interaction tests pass.
- Visual comparison passes within a maximum two-percent differing-pixel ratio during early calibration and one percent for final approved states. Any localized high-contrast mismatch is reviewed even if the global ratio passes.

## 12. Acceptance Criteria

The homepage is complete when:

1. It runs independently after the old mirror is unavailable.
2. Every visible section and approved interaction matches the current site at the four reference viewports.
3. Home, Work, Contact, theme, sound, mobile menu, keyboard shortcuts, and reduced motion work in a real browser.
4. The 3D hero and contact scenes retain the dimensional NOIR character and responsive composition of the references.
5. The page remains understandable and usable if WebGL, audio, weather, or motion is unavailable.
6. No minified application bundle from the original site is imported or patched.
7. The project has typed source modules, documented tokens, focused components, and repeatable automated verification.

## 13. Accepted Temporary Debt

- HAOQI contact information, project content, metadata, and social destinations remain until the user supplies final NOIR content.
- Project-detail pages are not implemented; project cards point to their original live destinations.
- Client logos remain the six current placeholders.
- Exact per-frame WebGL pixels can vary across GPUs outside deterministic Chromium tests; composition, materials, motion intent, and fixed-test frames remain the enforced contract.
