# NOIR Symbol Entry Preloader Implementation Plan

> **For agentic workers:** Execute directly by default. Use subagents only for independent bounded lanes that satisfy the global harness policy. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the home entry progress bar with the approved 118 px, six-front NOIR symbol animation while preserving the site's font/scene gates and dotted hero reveal.

**Architecture:** A pure timeline module converts elapsed milliseconds into deterministic symbol beats. A focused client SVG component owns one animation-frame loop and signals completion at 2,600 ms; `EntryPreloader` remains the readiness and page-release boundary.

**Tech Stack:** Next.js 16, React 19, TypeScript 5.9, SVG geometry APIs, CSS Modules, Motion reduced-motion preference, Vitest, Playwright 1.61, Biome 2.5.

---

## File structure

- Create `components/preloader/noir-symbol-preloader-timeline.ts`: six-front layout, timing constants, easing, and pure frame state.
- Create `components/preloader/noir-symbol-preloader-timeline.test.ts`: deterministic score contracts.
- Create `components/preloader/NoirSymbolPreloaderMark.tsx`: canonical SVG layers, renderer, fallback, and completion callback.
- Create `components/preloader/NoirSymbolPreloaderMark.module.css`: 118 px frame, monochrome layers, bloom, waiting state, and reduced motion.
- Create `components/preloader/NoirSymbolPreloaderMark.test.tsx`: artwork, fronts, completion, fallback, and cleanup tests.
- Modify `components/preloader/EntryPreloader.tsx`: replace the progress bar with the symbol completion gate.
- Modify `components/preloader/EntryPreloader.module.css`: center and fade the mark during the existing reveal.
- Modify `components/preloader/EntryPreloader.test.tsx`: prove readiness/symbol synchronization.
- Modify `components/preloader/entry-preloader-state.ts`: replace obsolete bar smoothing with one combined gate predicate.
- Modify `components/preloader/entry-preloader.test.ts`: test the combined gate.
- Modify `tests/interaction/entry-scene-sync.spec.ts`: production size, artwork, theme, and release checks.

The standalone prototype, hero, scene boot, route transition, and `EntryRevealCanvas` remain unchanged.

### Task 1: Lock the compressed deterministic score

**Files:**
- Create: `components/preloader/noir-symbol-preloader-timeline.test.ts`
- Create: `components/preloader/noir-symbol-preloader-timeline.ts`

- [ ] **Step 1: Write the failing score tests**

```ts
import { describe, expect, it } from "vitest";
import {
  NOIR_SYMBOL_DURATION_MS,
  NOIR_SYMBOL_FRONTS,
  resolveNoirSymbolFrame,
} from "@/components/preloader/noir-symbol-preloader-timeline";

describe("NOIR symbol preloader timeline", () => {
  it("uses the six approved origins", () => {
    expect(NOIR_SYMBOL_FRONTS.map((front) => front.name)).toEqual([
      "upper-right", "inner-lower", "lower-right", "top", "upper-left", "lower-left",
    ]);
  });

  it("completes the accelerated sequence at exactly 2600ms", () => {
    expect(NOIR_SYMBOL_DURATION_MS).toBe(2_600);
    expect(resolveNoirSymbolFrame(0).phase).toBe("void");
    expect(resolveNoirSymbolFrame(300).phase).toBe("pulse");
    expect(resolveNoirSymbolFrame(760).phase).toBe("flight");
    expect(resolveNoirSymbolFrame(1_400).phase).toBe("draw");
    expect(resolveNoirSymbolFrame(2_080).phase).toBe("ignite");
    expect(resolveNoirSymbolFrame(2_600)).toMatchObject({
      phase: "complete", complete: true, drawProgress: 1, fillOpacity: 1,
    });
  });

  it("is deterministic", () => {
    expect(resolveNoirSymbolFrame(1_640)).toEqual(resolveNoirSymbolFrame(1_640));
  });
});
```

- [ ] **Step 2: Run the test and verify the module is missing**

Run: `npm test -- components/preloader/noir-symbol-preloader-timeline.test.ts`

Expected: FAIL with an unresolved timeline-module import.

- [ ] **Step 3: Implement the score and exact front map**

```ts
export const NOIR_SYMBOL_DURATION_MS = 2_600;

export const NOIR_SYMBOL_FRONTS = [
  { name: "upper-right", contour: 0, seed: 0, end: 0.1344, x: 141.536, y: 58.991 },
  { name: "inner-lower", contour: 0, seed: 0.1344, end: 0.2575, x: 98.819, y: 152.065 },
  { name: "lower-right", contour: 0, seed: 0.2575, end: 0.4665, x: 163.843, y: 135.461 },
  { name: "top", contour: 0, seed: 0.4665, end: 0.554, x: 82.061, y: 0.001 },
  { name: "upper-left", contour: 0, seed: 0.554, end: 1, x: 17.485, y: 38.829 },
  { name: "lower-left", contour: 1, seed: 0, end: 1, x: 22.336, y: 145.566 },
] as const;

export type NoirSymbolPhase =
  | "void" | "pulse" | "flight" | "draw" | "ignite" | "settle" | "complete";

export interface NoirSymbolFrame {
  readonly phase: NoirSymbolPhase;
  readonly complete: boolean;
  readonly heartOpacity: number;
  readonly flightProgress: readonly number[];
  readonly drawProgress: number;
  readonly ignitionProgress: number;
  readonly fillOpacity: number;
}
```

Use exact boundaries: pulse `100–500`, six flights from `500` with `32 ms` stagger and `420 ms` duration, draw `1080–1960`, ignition `1960–2300`, fill `2140–2480`, settle through `2600`. Port the prototype's numerical cubic-Bézier solver and draw/sweep coefficients; clamp every output to `0–1` and force draw/fill to `1` at completion.

- [ ] **Step 4: Run the score tests and commit**

```powershell
npm test -- components/preloader/noir-symbol-preloader-timeline.test.ts
git add -- components/preloader/noir-symbol-preloader-timeline.ts components/preloader/noir-symbol-preloader-timeline.test.ts
git diff --cached --check
git commit -m "test: lock NOIR entry symbol score"
```

Expected: focused score tests pass.

### Task 2: Build the 118 px SVG mark

**Files:**
- Create: `components/preloader/NoirSymbolPreloaderMark.tsx`
- Create: `components/preloader/NoirSymbolPreloaderMark.module.css`
- Create: `components/preloader/NoirSymbolPreloaderMark.test.tsx`
- Reference only: `public/brand/noir-symbol.svg`
- Reference only: `prototypes/noir-symbol-stroke-study.html`

- [ ] **Step 1: Write failing component tests**

```tsx
import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NoirSymbolPreloaderMark } from "@/components/preloader/NoirSymbolPreloaderMark";

describe("NoirSymbolPreloaderMark", () => {
  beforeEach(() => {
    Object.defineProperties(SVGElement.prototype, {
      getTotalLength: { configurable: true, value: vi.fn(() => 800) },
      getPointAtLength: {
        configurable: true,
        value: vi.fn((at: number) => ({ x: at / 8, y: at / 10 }) as DOMPoint),
      },
    });
  });
  afterEach(() => {
    cleanup();
    Reflect.deleteProperty(SVGElement.prototype, "getTotalLength");
    Reflect.deleteProperty(SVGElement.prototype, "getPointAtLength");
    vi.restoreAllMocks();
  });

  it("renders canonical art and six active fronts", () => {
    const view = render(<NoirSymbolPreloaderMark reducedMotion={false} onComplete={vi.fn()} />);
    expect(view.container.querySelectorAll("[data-symbol-source]")).toHaveLength(2);
    expect(view.container.querySelectorAll("[data-symbol-emissary]")).toHaveLength(6);
    expect(view.container.querySelectorAll("[data-symbol-tip]")).toHaveLength(6);
    expect(view.getByTestId("noir-symbol-preloader")).toHaveAttribute("viewBox", "0 0 164 186");
  });

  it("finishes immediately for reduced motion", () => {
    const onComplete = vi.fn();
    const view = render(<NoirSymbolPreloaderMark reducedMotion onComplete={onComplete} />);
    expect(view.getByTestId("noir-symbol-preloader")).toHaveAttribute(
      "data-symbol-phase", "complete",
    );
    expect(onComplete).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run the test and confirm the component is missing**

Run: `npm test -- components/preloader/NoirSymbolPreloaderMark.test.tsx`

Expected: FAIL with an unresolved component import.

- [ ] **Step 3: Render canonical, measurable SVG layers**

Export a `NOIR_SYMBOL_PATHS` tuple containing the two unmodified `d` strings from `public/brand/noir-symbol.svg`. Render one hidden measurement path per contour, two ghost paths, one draw/chase/glow copy per front, two full flash paths, six emissary cores/halos/trails, six tips with five trail dots each, a heart, and two final fill paths.

The public component contract is:

```tsx
type NoirSymbolPreloaderMarkProps = {
  readonly onComplete: () => void;
  readonly reducedMotion: boolean;
};

export function NoirSymbolPreloaderMark(props: NoirSymbolPreloaderMarkProps) {
  return (
    <svg
      aria-hidden="true"
      className={styles["mark"]}
      data-symbol-phase={props.reducedMotion ? "complete" : "void"}
      data-testid="noir-symbol-preloader"
      viewBox="0 0 164 186"
    >
      <g data-symbol-layer="ghost" />
      <g data-symbol-layer="draw" />
      <g data-symbol-layer="bloom" />
      <g data-symbol-layer="tips" />
      <g data-symbol-layer="fill" />
    </svg>
  );
}
```

- [ ] **Step 4: Implement one-shot rendering and fallback**

In `useLayoutEffect`, measure both contour paths, then call `resolveNoirSymbolFrame(performance.now() - startTime)` on each frame. Update only SVG attributes/styles. For each front, grow the normalized segment from `seed` to `end`, position the tip with `getPointAtLength`, place five trailing dots behind it, and fly the emissary along a precomputed 48-point spiral from `(82, 93)` to `(x, y)`. Drive a localized 13% flash window from `ignitionProgress` and the final fill from `fillOpacity`.

Stop scheduling at 2,600 ms, leave `data-symbol-phase="complete"`, and call `onComplete` once. On measurement/render failure, hide animated layers, show fill opacity `1`, set `data-symbol-fallback="true"`, and call `onComplete` once. Cancel the frame on unmount.

- [ ] **Step 5: Add exact visual CSS**

```css
.mark { --symbol-ink: #fff; display: block; width: 118px; height: auto; overflow: visible; }
:global([data-theme="light"]) .mark { --symbol-ink: #030303; }
.ghost { fill: none; stroke: var(--symbol-ink); stroke-width: 0.28; opacity: 0.075; }
.main { fill: none; stroke: var(--symbol-ink); stroke-width: 0.62; }
.chase { fill: none; stroke: var(--symbol-ink); stroke-width: 1.86; opacity: 0.14; }
.glow { fill: none; stroke: var(--symbol-ink); stroke-width: 1.86; opacity: 0.1; }
.fill { fill: var(--symbol-ink); stroke: none; opacity: 0; }
.waitingBloom { animation: symbol-wait 1.4s ease-in-out infinite alternate; }
@keyframes symbol-wait { from { opacity: 0.28; } to { opacity: 0.42; } }
@media (prefers-reduced-motion: reduce) {
  .waitingBloom { animation: none; opacity: 0.28; }
}
```

The solid fill stays outside `.waitingBloom`, so the completed mark never dims.

- [ ] **Step 6: Complete lifecycle tests and commit**

Drive captured frame callbacks to 2,600 ms and require one completion call. Make `getTotalLength` throw and require static fallback plus completion. Unmount during draw and require `cancelAnimationFrame`.

```powershell
npm test -- components/preloader/NoirSymbolPreloaderMark.test.tsx components/preloader/noir-symbol-preloader-timeline.test.ts
npx biome check components/preloader/NoirSymbolPreloaderMark.tsx components/preloader/NoirSymbolPreloaderMark.test.tsx components/preloader/noir-symbol-preloader-timeline.ts components/preloader/noir-symbol-preloader-timeline.test.ts
git add -- components/preloader/NoirSymbolPreloaderMark.tsx components/preloader/NoirSymbolPreloaderMark.module.css components/preloader/NoirSymbolPreloaderMark.test.tsx
git diff --cached --check
git commit -m "feat: build NOIR symbol preloader mark"
```

Expected: focused component/timeline tests and Biome pass.

### Task 3: Replace the progress bar without changing readiness

**Files:**
- Modify: `components/preloader/EntryPreloader.tsx`
- Modify: `components/preloader/EntryPreloader.module.css`
- Modify: `components/preloader/EntryPreloader.test.tsx`
- Modify: `components/preloader/entry-preloader-state.ts`
- Modify: `components/preloader/entry-preloader.test.ts`

- [ ] **Step 1: Replace bar-progress tests with gate tests**

```ts
import { describe, expect, it } from "vitest";
import { canRevealEntry } from "@/components/preloader/entry-preloader-state";

const ready = {
  documentReady: true, fontsReady: true, sceneReady: true,
  symbolReady: true, revealReady: true, reducedMotion: false,
};

describe("entry preloader gates", () => {
  it("requires every normal-motion gate", () => {
    expect(canRevealEntry(ready)).toBe(true);
    for (const key of ["documentReady", "fontsReady", "sceneReady", "symbolReady", "revealReady"] as const) {
      expect(canRevealEntry({ ...ready, [key]: false })).toBe(false);
    }
  });
  it("skips animated gates for reduced motion", () => {
    expect(canRevealEntry({ ...ready, symbolReady: false, revealReady: false, reducedMotion: true })).toBe(true);
  });
});
```

- [ ] **Step 2: Run the gate test and verify failure**

Run: `npm test -- components/preloader/entry-preloader.test.ts`

Expected: FAIL because `canRevealEntry` is absent.

- [ ] **Step 3: Implement the gate and remove obsolete smoothing**

```ts
export interface EntryGateState {
  readonly documentReady: boolean;
  readonly fontsReady: boolean;
  readonly sceneReady: boolean;
  readonly symbolReady: boolean;
  readonly revealReady: boolean;
  readonly reducedMotion: boolean;
}

export function canRevealEntry(state: EntryGateState): boolean {
  return state.documentReady && state.fontsReady && state.sceneReady &&
    (state.reducedMotion || state.symbolReady) &&
    (state.reducedMotion || state.revealReady);
}
```

Delete the progress target/rate functions and confirm with `rg` that no imports remain.

- [ ] **Step 4: Add a controllable symbol mock to orchestration tests**

```tsx
const symbolControl = vi.hoisted(() => ({ complete: null as (() => void) | null }));
vi.mock("@/components/preloader/NoirSymbolPreloaderMark", () => ({
  NoirSymbolPreloaderMark: ({ onComplete }: { onComplete: () => void }) => {
    symbolControl.complete = onComplete;
    return <svg data-testid="mock-symbol-preloader" />;
  },
}));
```

Add cases proving that scene readiness alone does not reveal before symbol completion, symbol completion alone does not release an unready scene, both gates preserve the 250 ms delay/500 ms text lead/800 ms reveal, reduced motion has no 2,600 ms delay, and route transitions do not replay.

- [ ] **Step 5: Integrate the mark and pure gate**

Remove `displayedProgressRef`, `progressValueRef`, `useMemo`, and the progress animation effect. Add:

```tsx
const [symbolReady, setSymbolReady] = useState(reducedMotion);
const markSymbolReady = useCallback(() => setSymbolReady(true), []);
const entryCanReveal = canRevealEntry({
  documentReady, fontsReady, sceneReady, symbolReady, revealReady, reducedMotion,
});
```

Gate the existing reveal timer on `entryCanReveal`, and replace the progress markup with:

```tsx
<div className={styles["markWrap"]}>
  <NoirSymbolPreloaderMark onComplete={markSymbolReady} reducedMotion={reducedMotion} />
</div>
```

Keep all existing font loads, scene listener, dataset mutations, route bypass, reveal canvas, and hero timing.

- [ ] **Step 6: Replace progress CSS with the centered slot**

```css
.markWrap {
  position: absolute; top: 50%; left: 50%; z-index: 2;
  display: grid; width: 118px; place-items: center;
  transform: translate(-50%, -50%);
  opacity: 1;
  transition: opacity 250ms var(--ease-standard);
}
.revealing .surface,
.revealing .markWrap { opacity: 0; }
```

Delete `.progressWrap`, `.progressTrack`, `.progressValue`, and their media override.

- [ ] **Step 7: Run focused integration tests and commit**

```powershell
npm test -- components/preloader/entry-preloader.test.ts components/preloader/EntryPreloader.test.tsx components/preloader/NoirSymbolPreloaderMark.test.tsx
npx biome check components/preloader/EntryPreloader.tsx components/preloader/EntryPreloader.test.tsx components/preloader/entry-preloader-state.ts components/preloader/entry-preloader.test.ts
git add -- components/preloader/EntryPreloader.tsx components/preloader/EntryPreloader.module.css components/preloader/EntryPreloader.test.tsx components/preloader/entry-preloader-state.ts components/preloader/entry-preloader.test.ts
git diff --cached --check
git commit -m "feat: use NOIR symbol as entry preloader"
```

Expected: focused preloader tests pass with only intended paths staged.

### Task 4: Prove production synchronization and visual quality

**Files:**
- Modify: `tests/interaction/entry-scene-sync.spec.ts`
- Modify only if evidence finds a defect: files from Tasks 1–3

- [ ] **Step 1: Extend browser contracts**

For each dark/light case, require the symbol before scene release:

```ts
const symbol = page.locator('[data-testid="noir-symbol-preloader"]');
await expect(symbol).toBeAttached();
await expect(symbol).toHaveCSS("width", "118px");
await expect(symbol.locator("[data-symbol-source]")).toHaveCount(2);
await expect(symbol.locator("[data-symbol-emissary]")).toHaveCount(6);
await expect(symbol.locator("[data-symbol-tip]")).toHaveCount(6);
```

Retain the existing compiled-frame and five-second release checks. Add a dark-theme hold case that delays the critical hero model long enough for the 2,600 ms sequence to finish, then inspect the final fill before allowing the request to continue:

```ts
test("holds a solid white mark while the critical scene is delayed", async ({ page }) => {
  await page.route("**/assets/v1/model/hello-*.glb", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 4_500));
    await route.continue();
  });
  await page.addInitScript(() => localStorage.setItem("theme", "dark"));
  await page.goto("/?effects=full", { waitUntil: "domcontentloaded" });
  const symbol = page.locator('[data-testid="noir-symbol-preloader"]');
  await expect(symbol).toHaveAttribute("data-symbol-phase", "complete", { timeout: 4_000 });
  const fill = symbol.locator('[data-symbol-layer="fill"]');
  await expect(fill).toHaveCSS("opacity", "1");
  await expect(fill.locator("path").first()).toHaveCSS("fill", "rgb(255, 255, 255)");
});
```

- [ ] **Step 2: Run unit, type, and build proofs**

```powershell
npm test -- components/preloader
npm run typecheck
npm run build
```

Expected: preloader tests pass, TypeScript reports no errors, and Next.js completes the production build.

- [ ] **Step 3: Run both Playwright projects**

Run: `npx playwright test tests/interaction/entry-scene-sync.spec.ts --config=playwright.config.ts`

Expected: dark/light synchronization passes in desktop and mobile Chromium.

- [ ] **Step 4: Inspect and record the real first load**

At `1280×720` and `390×844`, verify 118 px centering, no copy/bar, six flights/fronts, exact canonical geometry, pure-white dark final state, slow-scene hold without replay, continuous dotted/hero reveal, reduced motion, no overflow/scroll leak/layout shift/console error/failed request. Record one desktop cycle and capture mobile draw/final states.

- [ ] **Step 5: Run final hygiene and inspect scope**

```powershell
npx biome check components/preloader tests/interaction/entry-scene-sync.spec.ts
git diff --check
git status --short
git diff -- components/preloader tests/interaction/entry-scene-sync.spec.ts
```

Expected: no diagnostics or whitespace errors. Preserve every unrelated contact/footer/document change in the dirty worktree.

- [ ] **Step 6: Commit the browser contract and any evidence-driven corrections**

Always stage `tests/interaction/entry-scene-sync.spec.ts`. If visual inspection required corrections, stage only the affected preloader paths alongside it. Inspect the cached diff and commit:

```powershell
git add -- tests/interaction/entry-scene-sync.spec.ts
git diff --cached --check
git commit -m "test: verify NOIR entry preloader"
```

If corrections were needed, include their exact paths in `git add` and use `fix: polish NOIR entry preloader` instead.
