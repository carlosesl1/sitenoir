# NOIR.digital Homepage Reconstruction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an independent, typed, production-ready Next.js homepage that matches the current NOIR.digital surface and interactions at the approved desktop, tablet, and mobile reference viewports.

**Architecture:** A Next.js App Router shell owns semantic content and server metadata. Focused client features own theme, audio, smooth scroll, pointer state, and the fixed React Three Fiber canvas. Static typed data drives the homepage; deterministic browser fixtures freeze dynamic values for visual comparison.

**Tech Stack:** Next.js 16.2.10, React 19.2.7, TypeScript 5.9.3, Three.js 0.185.1, React Three Fiber 9.6.1, Drei 10.7.7, Lenis 1.3.25, Motion 12.42.2, Vitest 4.1.10, Playwright 1.61.1, Biome 2.5.3, npm.

---

## Execution Notes

- Work only under `C:\Users\Carlos\Documents\site\noir-digital`.
- The existing mirror is read-only reference material.
- Bun is unavailable on this host, so this plan uses npm.
- Do not import any file under the old `public/_next` directory.
- Commit steps execute only if the user explicitly authorizes Git commits. Without authorization, record the same atomic boundary in the plan checkbox and continue with an unstaged worktree.
- Before frontend implementation, load the frontend design, perfection, image-to-code/reference-fidelity, designpowers, TypeScript, TDD, and visual-QA instructions required by the repository router.

## Locked File Map

```text
noir-digital/
  app/
    api/weather/route.ts
    globals.css
    layout.tsx
    page.tsx
  components/
    contact/ContactFooter.module.css
    contact/ContactFooter.tsx
    controls/PointerCoordinates.tsx
    controls/SoundButton.tsx
    controls/ThemeButton.tsx
    header/Header.module.css
    header/MobileMenu.tsx
    header/SiteHeader.tsx
    hero/Hero.module.css
    hero/Hero.tsx
    principles/PrinciplesStory.module.css
    principles/PrinciplesStory.tsx
    trust/TrustStrip.module.css
    trust/TrustStrip.tsx
    work/ProjectCard.tsx
    work/SelectedWork.module.css
    work/SelectedWork.tsx
  data/content.ts
  data/projects.ts
  features/audio/AudioProvider.tsx
  features/audio/audio-state.test.ts
  features/audio/audio-state.ts
  features/pointer/pointer-store.ts
  features/scroll/ScrollProvider.tsx
  features/scroll/scroll-targets.test.ts
  features/scroll/scroll-targets.ts
  features/theme/ThemeProvider.tsx
  features/theme/theme-state.test.ts
  features/theme/theme-state.ts
  features/shortcuts/shortcuts.test.ts
  features/shortcuts/shortcuts.ts
  scene/ContactModel.tsx
  scene/HeroModel.tsx
  scene/PointerModel.tsx
  scene/SiteCanvas.tsx
  scene/StickerField.tsx
  styles/layout.css
  styles/tokens.css
  tests/interaction/home.spec.ts
  tests/visual/home.visual.spec.ts
  tests/visual/visual-fixture.ts
  vitest.setup.ts
  DESIGN.md
  biome.json
  next.config.ts
  package.json
  playwright.config.ts
  tsconfig.json
  vitest.config.ts
```

### Task 1: Scaffold the strict Next.js toolchain

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `biome.json`
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Create: `playwright.config.ts`
- Create: `app/layout.tsx`
- Create: `app/page.tsx`

- [ ] **Step 1: Create the package manifest**

Use this exact script/dependency contract:

```json
{
  "name": "noir-digital",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --hostname 127.0.0.1",
    "build": "next build",
    "start": "next start --hostname 127.0.0.1",
    "typecheck": "tsc --noEmit",
    "check": "biome check .",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test tests/interaction",
    "test:visual": "playwright test tests/visual",
    "doctor": "react-doctor ."
  },
  "dependencies": {
    "@react-three/drei": "10.7.7",
    "@react-three/fiber": "9.6.1",
    "lenis": "1.3.25",
    "motion": "12.42.2",
    "next": "16.2.10",
    "react": "19.2.7",
    "react-dom": "19.2.7",
    "three": "0.185.1"
  },
  "devDependencies": {
    "@biomejs/biome": "2.5.3",
    "@playwright/test": "1.61.1",
    "@testing-library/jest-dom": "6.9.1",
    "@testing-library/react": "16.3.2",
    "@types/node": "26.1.1",
    "@types/react": "19.2.17",
    "@types/react-dom": "19.2.3",
    "@types/three": "0.185.1",
    "jsdom": "29.1.1",
    "react-doctor": "0.7.3",
    "react-grab": "0.1.48",
    "react-scan": "0.5.7",
    "typescript": "5.9.3",
    "vitest": "4.1.10"
  }
}
```

- [ ] **Step 2: Install dependencies and verify resolution**

Run:

```bash
npm install
npm ls next react react-dom three @react-three/fiber lenis motion
```

Expected: exit code 0 and the exact pinned versions above.

- [ ] **Step 3: Add strict TypeScript and framework configuration**

`tsconfig.json` must include:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": false,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitReturns": true,
    "verbatimModuleSyntax": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

`next.config.ts` must export `reactStrictMode: true`, image formats `image/avif` and `image/webp`, and `Cache-Control: public, max-age=0, must-revalidate` for stable public names under `/model`, `/stickers`, `/work`, `/fonts`, and `/audio`. These paths must not be marked immutable unless a later task moves them to content-hashed filenames.

- [ ] **Step 4: Add test and browser configuration**

Configure Vitest with `environment: "jsdom"`, `setupFiles: ["./vitest.setup.ts"]`, and coverage exclusions for Next-generated declarations. Configure Playwright with Chromium, `baseURL: "http://127.0.0.1:3000"`, screenshot `only-on-failure`, trace `retain-on-failure`, and a web server command `npm run dev -- --port 3000`.

- [ ] **Step 5: Add the minimal semantic app shell and run the red/green smoke cycle**

Create a server layout with `lang="pt-BR"`, metadata title `HAOQI©2026`, and description `Digital Product Designer & Builder © 2026`. Create `app/page.tsx` with `<main id="main-content">NOIR.digital</main>`.

Run:

```bash
npm run typecheck
npm run check
npm run build
```

Expected: all commands exit 0.

- [ ] **Step 6: Create the atomic checkpoint**

If Git commits are authorized:

```bash
git add noir-digital/package.json noir-digital/package-lock.json noir-digital/tsconfig.json noir-digital/next.config.ts noir-digital/biome.json noir-digital/vitest.config.ts noir-digital/vitest.setup.ts noir-digital/playwright.config.ts noir-digital/app
git commit -m "scaffold NOIR homepage source project"
```

### Task 2: Lock the design system and production asset set

**Files:**
- Create: `DESIGN.md`
- Create: `styles/tokens.css`
- Create: `styles/layout.css`
- Create: `tests/asset-manifest.test.ts`
- Copy: selected files into `public/fonts`, `public/model`, `public/stickers`, `public/work`, `public/audio`

- [ ] **Step 1: Write the asset-manifest test first**

The test must assert existence, non-zero size, and the expected binary signature (or valid parsed JSON for glTF) for:

```ts
const requiredAssets = [
  "fonts/TikTokSans.ttf",
  "fonts/GeistMono[wght].ttf",
  "fonts/DepartureMono-Regular.otf",
  "model/hello.glb",
  "model/cursor.glb",
  "model/cnt.gltf",
  "audio/bgm.mp3",
  ...Array.from({ length: 11 }, (_, index) =>
    `stickers/s_${String(index + 1).padStart(2, "0")}.png`,
  ),
  "stickers/noir-face.png",
] as const;
```

This first test covers only shared fonts, models, audio, and stickers. It validates binary signatures for TTF, OTF, GLB, MP3, and PNG assets and parses the JSON glTF; Task 3 adds project-image existence assertions after the typed project table exists.

- [ ] **Step 2: Run the test and prove it is red**

Run `npm test -- tests/asset-manifest.test.ts`.

Expected: FAIL because `public/fonts/TikTokSans.ttf` does not exist yet.

- [ ] **Step 3: Copy only active assets**

Copy the three fonts, `hello.glb`, `cursor.glb`, `cnt.gltf`, `bgm.mp3`, `s_01.png` through `s_11.png`, `noir-face.png`, and the 21 files under the old `public/work`. Do not copy intermediate `hello.*.gltf`, backup models, `m3.png`, old Next chunks, or evidence artifacts.

- [ ] **Step 4: Write the design contract and token files**

`DESIGN.md` must reproduce the approved spec’s visual thesis, palette, typography, spacing, grid, breakpoints, primitives, motion rules, accessibility constraints, and accepted temporary debt. `tokens.css` must define the exact palette from the spec plus:

```css
:root {
  --page-inline: 56px;
  --page-block: 24px;
  --grid-columns: 12;
  --line: color-mix(in srgb, currentColor 13%, transparent);
  --display-xl: clamp(3.75rem, 5.1vw, 5rem);
  --body: 1rem;
  --mono: 0.875rem;
  --ease-noir: cubic-bezier(0.66, 0, 0.01, 1);
}

@media (max-width: 1023px) {
  :root {
    --page-inline: 16px;
    --page-block: 20px;
    --display-xl: clamp(2.25rem, 10vw, 3.25rem);
  }
}
```

`layout.css` must provide `.technicalGrid`, `.gridCross`, `.screenSection`, `.visuallyHidden`, and reduced-motion rules without component-specific styling. Under `prefers-reduced-motion: reduce`, animation/transition delays and durations are zeroed with `!important`, animation iteration is capped at one, and scrolling is immediate. Future JavaScript motion initialization must independently check the matching media query before starting.

Keep the approved TTF/OTF font files in this task. WOFF2 conversion is a future performance task and must not add unverified generated binaries to this asset set.

- [ ] **Step 5: Run the asset test and static checks**

Run:

```bash
npm test -- tests/asset-manifest.test.ts
npm run check
```

Expected: PASS and zero Biome diagnostics.

- [ ] **Step 6: Create the atomic checkpoint**

If authorized, commit only `DESIGN.md`, token/layout CSS, asset test, and production assets with message `add NOIR design contract and assets`.

### Task 3: Create typed homepage content and project data

**Files:**
- Create: `data/content.ts`
- Create: `data/projects.ts`
- Create: `data/projects.test.ts`

- [ ] **Step 1: Write failing project-data tests**

Assert ten visible projects, unique slugs, absolute `https://` destinations, existing image pairs, and preserved ordering:

```ts
expect(projects.map((project) => project.slug)).toEqual([
  "reunimos",
  "inspire-mono",
  "wasm-design-utils",
  "vectorsymbols",
  "darkside",
  "adrive",
  "shore-icon",
  "teambition",
  "fof-see-hear-touch",
  "fof-design-system",
]);
```

Resolve each `image` and `hoverImage` path under `public/` and assert both files exist with non-zero size. This covers all 21 approved work images without coupling Task 2 to a data module that does not yet exist.

- [ ] **Step 2: Run the focused test and verify the missing-module failure**

Run `npm test -- data/projects.test.ts`.

Expected: FAIL because `data/projects.ts` is absent.

- [ ] **Step 3: Implement the readonly project model**

Define:

```ts
export type ProjectKind = "Coding Project" | "Project" | "Event";

export interface Project {
  readonly slug: string;
  readonly title: string;
  readonly year: string;
  readonly kind: ProjectKind;
  readonly href: `https://${string}`;
  readonly image: `/work/${string}.png`;
  readonly hoverImage: `/work/${string}.png`;
  readonly external: boolean;
}
```

Populate the ten projects with the existing file pairs and official HAOQI/Figma/Friends of Figma destinations. Export the array with `as const satisfies readonly Project[]`.

- [ ] **Step 4: Implement the homepage copy contract**

`content.ts` exports readonly hero labels, headline lines, description lines, six client placeholders, service heading, four principle stages, contact headline, e-mail, and social destinations. Preserve current punctuation and casing exactly.

- [ ] **Step 5: Run tests and typecheck**

Run `npm test -- data/projects.test.ts && npm run typecheck`.

Expected: PASS.

- [ ] **Step 6: Create the atomic checkpoint**

If authorized, commit the data files and test with message `model NOIR homepage content`.

### Task 4: Build state machines for theme, sound, shortcuts, and scroll targets

**Files:**
- Create: `features/theme/theme-state.ts`
- Create: `features/theme/theme-state.test.ts`
- Create: `features/audio/audio-state.ts`
- Create: `features/audio/audio-state.test.ts`
- Create: `features/shortcuts/shortcuts.ts`
- Create: `features/shortcuts/shortcuts.test.ts`
- Create: `features/scroll/scroll-targets.ts`
- Create: `features/scroll/scroll-targets.test.ts`

- [ ] **Step 1: Write the complete failing state tests**

Required assertions:

```ts
expect(nextTheme("system")).toBe("light");
expect(nextTheme("light")).toBe("dark");
expect(nextTheme("dark")).toBe("system");
expect(toggleSound("on")).toBe("off");
expect(toggleSound("off")).toBe("on");
expect(resolveShortcut("l")).toEqual({ type: "theme", value: "light" });
expect(resolveShortcut("d")).toEqual({ type: "theme", value: "dark" });
expect(resolveShortcut("a")).toEqual({ type: "theme", value: "system" });
expect(resolveShortcut("s")).toEqual({ type: "sound-toggle" });
expect(resolveShortcut("t")).toEqual({ type: "scroll", target: "home" });
expect(resolveShortcut("b")).toEqual({ type: "scroll", target: "contact" });
expect(sectionSelector("work")).toBe("#selected-work");
expect(sectionSelector("contact")).toBe("#contact");
```

- [ ] **Step 2: Run all four files and verify red failures**

Run `npm test -- features/theme features/audio features/shortcuts features/scroll`.

Expected: FAIL with missing modules/exports.

- [ ] **Step 3: Implement exhaustive pure state functions**

Use these shared contracts and exhaustive `switch` statements with `assertNever(value: never): never`. Do not read browser globals from pure state modules.

```ts
export type ThemeMode = "system" | "light" | "dark";
export type SoundState = "on" | "off";
export type SectionTarget = "home" | "work" | "contact";

export type ShortcutAction =
  | { readonly type: "theme"; readonly value: ThemeMode }
  | { readonly type: "sound-toggle" }
  | { readonly type: "scroll"; readonly target: SectionTarget }
  | { readonly type: "none" };
```

- [ ] **Step 4: Run tests and prove green state behavior**

Run the same focused test command.

Expected: all state tests PASS.

- [ ] **Step 5: Create the atomic checkpoint**

If authorized, commit the state modules/tests with message `add deterministic homepage state machines`.

### Task 5: Implement providers and the pointer store

**Files:**
- Create: `features/theme/ThemeProvider.tsx`
- Create: `features/audio/AudioProvider.tsx`
- Create: `features/scroll/ScrollProvider.tsx`
- Create: `features/pointer/pointer-store.ts`
- Create: `features/providers.test.tsx`

- [ ] **Step 1: Write provider integration tests**

Render test consumers and assert:

- initial theme resolves from `localStorage.theme`;
- changing theme updates the root class and storage;
- sound remains paused before user interaction;
- sound toggle writes only `localStorage.sound`;
- pointer store snapshots update from normalized client coordinates;
- reduced-motion mode disables Lenis initialization.

- [ ] **Step 2: Run tests and verify provider imports fail**

Run `npm test -- features/providers.test.tsx`.

Expected: FAIL before provider files exist.

- [ ] **Step 3: Implement the providers**

Each provider exports a typed hook that throws a named error when used outside its context. `AudioProvider` owns one `HTMLAudioElement`, sets `loop = true` and `volume = 0.35`, and catches rejected `play()` promises by returning to the off state. `ScrollProvider` owns and disposes one Lenis instance and exposes `scrollTo(target: SectionTarget)`.

- [ ] **Step 4: Implement a `useSyncExternalStore` pointer store**

The snapshot type is:

```ts
export interface PointerSnapshot {
  readonly clientX: number;
  readonly clientY: number;
  readonly normalizedX: number;
  readonly normalizedY: number;
}
```

One passive `pointermove` listener updates the immutable snapshot. The store exposes `subscribe`, `getSnapshot`, and `getServerSnapshot`.

- [ ] **Step 5: Run tests, typecheck, and React Doctor**

Run:

```bash
npm test -- features/providers.test.tsx
npm run typecheck
npm run doctor
```

Expected: tests/typecheck PASS and React Doctor reports no blocking errors.

- [ ] **Step 6: Create the atomic checkpoint**

If authorized, commit provider/store files with message `add NOIR interaction providers`.

### Task 6: Implement the grid shell, header, controls, and mobile menu

**Files:**
- Create: `components/header/SiteHeader.tsx`
- Create: `components/header/MobileMenu.tsx`
- Create: `components/header/Header.module.css`
- Create: `components/controls/ThemeButton.tsx`
- Create: `components/controls/SoundButton.tsx`
- Create: `components/controls/PointerCoordinates.tsx`
- Create: `components/header/SiteHeader.test.tsx`

- [ ] **Step 1: Write accessible header tests**

Assert brand link, Work, Contact, Theme, and Sound names; theme/sound pressed state; mobile menu trigger `aria-expanded`; Escape close behavior; focus restoration; and Work/Contact calling the typed scroll targets.

- [ ] **Step 2: Run the test and verify red failure**

Run `npm test -- components/header/SiteHeader.test.tsx`.

Expected: FAIL because `SiteHeader` is missing.

- [ ] **Step 3: Implement semantic controls and header composition**

Use a `<header>`, `<nav aria-label="Principal">`, native buttons, and the exact text labels. The mobile trigger remains visually two horizontal lines but has `aria-label="Abrir menu"`. The overlay uses Motion only for opacity/transform and closes after navigation.

- [ ] **Step 4: Implement reference geometry**

Desktop header uses `position: fixed`, `inset: 0 0 auto`, 12-column grid, 56px horizontal padding, and 24px top rhythm. Mobile uses 16px horizontal padding and hides desktop controls below 1024px. Focus/active states use a 2px dotted border without layout shift.

- [ ] **Step 5: Run focused tests and browser smoke**

Run `npm test -- components/header/SiteHeader.test.tsx && npm run typecheck`.

Expected: PASS.

- [ ] **Step 6: Create the atomic checkpoint**

If authorized, commit header/control files with message `build responsive NOIR navigation`.

### Task 7: Build the pixel-locked hero and responsive first viewport

**Files:**
- Create: `components/hero/Hero.tsx`
- Create: `components/hero/Hero.module.css`
- Create: `components/hero/Hero.test.tsx`

- [ ] **Step 1: Write semantic and content tests**

Assert one `<h1>`, exact headline lines, desktop supporting labels, description, and a stable `data-scene-anchor="hero"` element. Assert decorative labels are hidden at a mocked 390px layout through CSS class contracts rather than JavaScript branching.

- [ ] **Step 2: Run the focused test and verify red state**

Run `npm test -- components/hero/Hero.test.tsx`.

Expected: FAIL because the component is missing.

- [ ] **Step 3: Implement the semantic hero**

Use CSS grid areas for `disciplines`, `promise`, `description`, and `headline`. Keep the 3D layer outside the component; expose only stable scene anchors and DOM copy.

- [ ] **Step 4: Implement desktop and mobile geometry**

At 1280x720, align the top content baseline near 110px, the primary grid split near 240px, and the headline start near 444px. At 390x844, place the headline near 74px with three lines, the 3D-model anchor in the second viewport band, and the description near 624px. Use `clamp()` and container-relative units; no viewport-specific JavaScript.

- [ ] **Step 5: Run tests and capture the first DOM-only screenshots**

Run the component test and a temporary Playwright screenshot with the canvas disabled using `?effects=off`.

Expected: text/grid geometry is within 8px of reference anchors before 3D work begins.

- [ ] **Step 6: Create the atomic checkpoint**

If authorized, commit hero files with message `build responsive NOIR hero layout`.

### Task 8: Build trust and selected-work sections

**Files:**
- Create: `components/trust/TrustStrip.tsx`
- Create: `components/trust/TrustStrip.module.css`
- Create: `components/work/ProjectCard.tsx`
- Create: `components/work/SelectedWork.tsx`
- Create: `components/work/SelectedWork.module.css`
- Create: `components/work/SelectedWork.test.tsx`

- [ ] **Step 1: Write failing work-section tests**

Assert six client slots, one `#selected-work` region, ten project links in data order, descriptive alt text, external rel attributes, and separate normal/hover image sources.

- [ ] **Step 2: Run focused test and verify failure**

Run `npm test -- components/work/SelectedWork.test.tsx`.

Expected: FAIL before components exist.

- [ ] **Step 3: Implement trust and project components**

Use semantic sections/articles and `next/image` with explicit responsive `sizes`. Each `ProjectCard` renders its primary image and hover image in the same stable aspect-ratio slot; CSS transitions only opacity and transform.

- [ ] **Step 4: Implement asymmetric responsive layout**

Desktop: sticky statement spans four columns, work grid spans eight; first card spans all eight, remaining cards alternate four-column widths with vertical offsets matching the reference. Mobile: statement stacks first and project cards use two equal columns with the first card spanning both.

- [ ] **Step 5: Run tests, typecheck, and browser interaction smoke**

Hover the first three cards in Chromium and verify source swaps without layout movement. Expected: all tests pass and measured card rectangles remain stable.

- [ ] **Step 6: Create the atomic checkpoint**

If authorized, commit trust/work files with message `build trust and selected work sections`.

### Task 9: Build the scroll-driven principles story

**Files:**
- Create: `components/principles/PrinciplesStory.tsx`
- Create: `components/principles/PrinciplesStory.module.css`
- Create: `components/principles/principles-progress.ts`
- Create: `components/principles/principles-progress.test.ts`

- [ ] **Step 1: Write progress-mapping tests**

Define four stages and assert deterministic boundaries:

```ts
expect(resolvePrincipleStage(0)).toBe("positioning");
expect(resolvePrincipleStage(0.26)).toBe("design");
expect(resolvePrincipleStage(0.51)).toBe("principles");
expect(resolvePrincipleStage(0.76)).toBe("technology");
expect(resolvePrincipleStage(1)).toBe("technology");
```

Also test clamping below zero/above one.

- [ ] **Step 2: Run the test and verify red state**

Run `npm test -- components/principles/principles-progress.test.ts`.

Expected: FAIL before implementation.

- [ ] **Step 3: Implement exhaustive progress mapping**

Return a typed stage plus local stage progress. Avoid timers; derive all reveals from normalized scroll progress.

- [ ] **Step 4: Implement the eight-viewport story**

Render all textual stages in the DOM. Animate only transforms and opacity. Use `aria-hidden` only for duplicated animated glyph layers, never for the readable text. In reduced motion, render stages sequentially as normal content with no sticky choreography.

- [ ] **Step 5: Drive and inspect all four stages in Playwright**

Scroll the actual Lenis container to 0%, 33%, 66%, and 100% of the story. Expected: correct stage labels and no overlapping readable text.

- [ ] **Step 6: Create the atomic checkpoint**

If authorized, commit principles files with message `build deterministic principles story`.

### Task 10: Rebuild the fixed 3D scene from source

**Files:**
- Create: `scene/SiteCanvas.tsx`
- Create: `scene/HeroModel.tsx`
- Create: `scene/ContactModel.tsx`
- Create: `scene/PointerModel.tsx`
- Create: `scene/StickerField.tsx`
- Create: `scene/scene-layout.ts`
- Create: `scene/scene-layout.test.ts`

- [ ] **Step 1: Write deterministic scene-layout tests**

Test viewport families `mobile`, `tablet`, and `desktop`; assert stable transforms for hero model, contact model, pointer model, and eleven stickers. Test that each sticker has a unique id, texture, position, rotation, and scale.

- [ ] **Step 2: Run the layout test and verify red state**

Run `npm test -- scene/scene-layout.test.ts`.

Expected: FAIL before the scene layout module exists.

- [ ] **Step 3: Implement typed responsive scene layouts**

Define immutable layout tables keyed by `type ViewportFamily = "mobile" | "tablet" | "desktop"` and the four principle stages. Derive family from canvas width only; do not read `window` in the pure module.

- [ ] **Step 4: Implement one fixed canvas and model components**

`SiteCanvas` uses one `<Canvas>` with capped DPR `[1, 1.5]`, alpha, high-performance preference, and demand rendering when reduced motion is active. Clone loaded scenes before material replacement. Apply graphite `MeshPhysicalMaterial` instances with restrained roughness/metalness, white bevel highlights, and environment intensity matching the reference.

- [ ] **Step 5: Implement stickers and pointer response**

Use textured planes with alpha, shared geometries, and deterministic transforms. Pointer movement affects camera/model rotation through damped normalized values. Scroll progress drives hero exit, project-field transition, principles presence, and contact entry.

- [ ] **Step 6: Verify cleanup and WebGL fallback**

Unmount/remount the page in a Playwright component harness. Expected: no duplicate canvases/listeners, no context-loss errors, and semantic DOM remains visible when WebGL is disabled.

- [ ] **Step 7: Create the atomic checkpoint**

If authorized, commit scene files with message `rebuild NOIR WebGL scene from source`.

### Task 11: Build the contact scene and complete homepage composition

**Files:**
- Create: `components/contact/ContactFooter.tsx`
- Create: `components/contact/ContactFooter.module.css`
- Create: `components/contact/ContactFooter.test.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Write the contact test**

Assert `#contact`, exact four-line headline, mailto destination, Twitter/X, Figma, GitHub, and the `data-scene-anchor="contact"` marker.

- [ ] **Step 2: Run focused test and verify red state**

Run `npm test -- components/contact/ContactFooter.test.tsx`.

Expected: FAIL before component exists.

- [ ] **Step 3: Implement contact and full page order**

Compose `SiteHeader`, `Hero`, `TrustStrip`, `SelectedWork`, `PrinciplesStory`, and `ContactFooter` inside `<main>`, followed by the decorative `SiteCanvas`. Keep all readable content outside the canvas.

- [ ] **Step 4: Match contact geometry**

At desktop, center the heavy CTA across the middle grid while e-mail and social links sit along the lower baseline. At mobile, preserve readable wrapping, 44px minimum interactive targets, and a non-overlapping bottom progress control.

- [ ] **Step 5: Run full unit suite and build**

Run `npm test && npm run typecheck && npm run build`.

Expected: all commands exit 0.

- [ ] **Step 6: Create the atomic checkpoint**

If authorized, commit contact/page integration with message `compose complete NOIR homepage`.

### Task 12: Add weather boundary, dynamic fixtures, and production metadata

**Files:**
- Create: `app/api/weather/route.ts`
- Create: `features/weather/weather.ts`
- Create: `features/weather/weather.test.ts`
- Modify: `app/layout.tsx`
- Create: `public/robots.txt`
- Create: `app/sitemap.ts`

- [ ] **Step 1: Write weather parsing tests**

Test valid QWeather success payload to `{ temperature: 32, location: "CN" }`, malformed payload to the deterministic fallback, and network error to the same fallback. The client-facing result contains no provider key.

- [ ] **Step 2: Run weather tests and verify red state**

Run `npm test -- features/weather/weather.test.ts`.

Expected: FAIL before weather module exists.

- [ ] **Step 3: Implement server-only weather parsing and route**

Read `QWEATHER_API_KEY` only inside the route. Apply an abort timeout, `cache: "no-store"`, and fallback `{ temperature: 32, location: "CN" }`. Never serialize the key or upstream URL into client code.

- [ ] **Step 4: Add deterministic visual-test mode**

When `NEXT_PUBLIC_VISUAL_TEST_MODE === "1"`, render clock `00:00`, temperature `32°C`, pointer `0640 X 0360 Y`, seeded sticker transforms, and paused animation progress controlled by a test query parameter.

- [ ] **Step 5: Finish metadata structure**

Preserve approved current title/description. Add viewport/theme-color metadata, local icons, robots, and sitemap. Canonical/OG absolute URLs are emitted only when `NEXT_PUBLIC_SITE_URL` is a valid HTTPS URL.

- [ ] **Step 6: Run boundary tests and build**

Run `npm test -- features/weather && npm run build`.

Expected: PASS with no secret in `.next/static` when searched with `rg "QWEATHER_API_KEY" .next/static`.

- [ ] **Step 7: Create the atomic checkpoint**

If authorized, commit weather/metadata files with message `secure dynamic homepage boundaries`.

### Task 13: Add browser interaction and accessibility coverage

**Files:**
- Create: `tests/interaction/home.spec.ts`
- Modify: `playwright.config.ts`

- [ ] **Step 1: Write interaction tests before fixes**

Cover:

- Work scrolls to `#selected-work`.
- Contact scrolls to `#contact`.
- Theme cycles system/light/dark and survives reload.
- Sound toggles and persists `off`.
- Mobile menu opens, traps focus, closes with Escape, and restores focus.
- Shortcuts L/D/A/S/T/B dispatch correct behavior.
- Reduced motion exposes every section without staged hiding.
- Tab order reaches all controls and project links.
- No page errors, failed same-origin requests, horizontal overflow, or duplicate canvases.

- [ ] **Step 2: Run tests and record real failures**

Run `npm run test:e2e`.

Expected: any discovered behavioral mismatch fails with a specific locator/assertion rather than a timeout-only failure.

- [ ] **Step 3: Fix only observed interaction defects**

Make the smallest source change per failing assertion. Re-run the focused test after each change.

- [ ] **Step 4: Run the complete interaction suite**

Expected: all interaction tests PASS at desktop and mobile projects.

- [ ] **Step 5: Create the atomic checkpoint**

If authorized, commit interaction tests/fixes with message `verify NOIR homepage interactions`.

### Task 14: Calibrate reference-fidelity visual tests

**Files:**
- Create: `tests/visual/visual-fixture.ts`
- Create: `tests/visual/home.visual.spec.ts`
- Create: approved baseline screenshots under `tests/visual/home.visual.spec.ts-snapshots/`

- [ ] **Step 1: Implement a deterministic visual fixture**

The fixture waits for `document.fonts.ready`, model loading completion, zero pending images, and an exposed `window.__NOIR_READY__ === true`. It sets fixed clock/weather/pointer/seed and scene progress before each screenshot.

- [ ] **Step 2: Write visual cases**

Capture:

- 1280x720 home, work, contact, light, dark.
- 1440x900 home and work.
- 768x1024 home and work.
- 390x844 home, mobile-menu-open, work, contact.
- 390x844 reduced-motion home and contact.

Use `animations: "disabled"`, `scale: "css"`, and an initial `maxDiffPixelRatio: 0.02`.

- [ ] **Step 3: Run reference-fidelity comparison and inspect every diff**

Run `npm run test:visual` and open the HTML report. Expected during calibration: failures identify geometry, typography, color, or scene mismatches.

- [ ] **Step 4: Iterate one visual mismatch category at a time**

Fix in this order: viewport/grid geometry, typography, content wrapping, DOM imagery, 3D transforms/materials, motion state, polish. After each fix, re-run only the affected viewport/state.

- [ ] **Step 5: Tighten final threshold**

Set `maxDiffPixelRatio: 0.01` after every approved state passes at 0.02. Review any localized high-contrast mismatch even below threshold.

- [ ] **Step 6: Create the atomic checkpoint**

If authorized, commit visual tests/baselines and calibration fixes with message `match NOIR homepage visual references`.

### Task 15: Run final performance, runtime-debugging, and review gates

**Files:**
- Modify only files implicated by measured failures
- Create: `docs/verification/2026-07-10-homepage-verification.md`

- [ ] **Step 1: Build and run the production server**

Run:

```bash
npm run check
npm run typecheck
npm test
npm run build
npm run start -- --port 3000
```

Expected: all static gates pass and production server responds 200.

- [ ] **Step 2: Run React and browser performance audits**

Run React Doctor, React Scan render inspection, and the frontend perfection workflow in real Chromium at mobile and desktop presets. Record bundle transfer, LCP, CLS, INP, accessibility, SEO, and best-practice evidence.

- [ ] **Step 3: Run the mandatory runtime debugging audit**

Record three hypotheses with runtime evidence:

1. WebGL context/material feedback errors under theme and viewport changes.
2. Duplicate listeners/animation loops after navigation, reload, and menu use.
3. Layout shift or font/image/model race during cold load.

Each hypothesis must have observed console/network/performance evidence and a pass/fail conclusion.

- [ ] **Step 4: Run visual QA dual-oracle gate**

Inspect 375/390, 768, 1280, and 1440 widths; Home, Work, Contact, menu, light/dark, reduced motion; and compare fresh screenshots against both the current local NOIR reference and live HAOQI interaction intent.

- [ ] **Step 5: Run post-implementation review**

Invoke the repository `review-work` workflow. Resolve all high-confidence blocking findings and re-run affected verification.

- [ ] **Step 6: Write the verification ledger**

Record exact commands, exit codes, browser viewports, screenshot paths, visual-diff ratios, performance results, runtime hypotheses/evidence, unresolved accepted debt, and confirmation that no original minified bundle is imported.

- [ ] **Step 7: Create the final atomic checkpoint**

If authorized, commit verification evidence and final measured fixes with message `verify pixel-perfect NOIR homepage`.

## Plan Self-Review Matrix

| Spec requirement | Implementation task |
|---|---|
| Independent Next.js source project | Task 1 |
| Design tokens and selected assets | Task 2 |
| Preserved content/projects | Task 3 |
| Theme, sound, shortcuts, scroll state | Tasks 4-5 |
| Header and mobile menu | Task 6 |
| Responsive hero | Task 7 |
| Trust and selected work | Task 8 |
| Principles scrollytelling | Task 9 |
| 3D canvas, models, stickers, pointer | Task 10 |
| Contact and complete page | Task 11 |
| Weather/security/metadata | Task 12 |
| Accessibility and interaction behavior | Task 13 |
| Pixel-perfect screenshots | Task 14 |
| Performance, runtime QA, final review | Task 15 |

The plan contains no deferred product functionality. The only explicit non-goals remain project-detail pages, CMS/auth/database/analytics, and final replacement of preserved HAOQI content.
