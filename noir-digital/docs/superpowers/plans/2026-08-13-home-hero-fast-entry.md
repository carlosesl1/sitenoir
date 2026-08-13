# NOIR Home Hero Fast Entry Implementation Plan

> **For agentic workers:** Execute directly by default. Use subagents only for independent bounded lanes that satisfy the global harness policy. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the home hero text visible and remove the entry overlay roughly twice as fast without changing the approved hero composition or glass rendering.

**Architecture:** Keep `EntryPreloader` as the orchestration boundary, but remove 3D scene readiness from the HTML reveal gate. Compress the existing deterministic symbol choreography and dotted reveal timings; keep the canvas booting in parallel and retain the existing progressive secondary-scene loader.

**Tech Stack:** Next.js 16, React 19, TypeScript, Vitest, Testing Library, Three.js/R3F, T3 collaborative browser

---

## File map

- Modify `components/preloader/noir-symbol-preloader-timeline.ts`: faster deterministic symbol beat boundaries.
- Modify `components/preloader/noir-symbol-preloader-timeline.test.ts`: timeline boundary proof.
- Modify `components/preloader/entry-preloader-state.ts`: HTML-ready gates without WebGL readiness.
- Modify `components/preloader/entry-preloader.test.ts`: gate contract proof.
- Modify `components/preloader/EntryPreloader.tsx`: faster reveal timings and removal of scene coupling.
- Modify `components/preloader/EntryPreloader.test.tsx`: component timing, slow-scene, reduced-motion, and route-transition proof.

### Task 1: Compress the symbol choreography

**Files:**
- Modify: `components/preloader/noir-symbol-preloader-timeline.test.ts`
- Modify: `components/preloader/noir-symbol-preloader-timeline.ts`

- [ ] **Step 1: Write the failing boundary test**

Change the duration assertion and phase samples to the approved 1,400 ms sequence:

```ts
expect(NOIR_SYMBOL_DURATION_MS).toBe(1_400);
expect(resolveNoirSymbolFrame(0).phase).toBe("void");
expect(resolveNoirSymbolFrame(160).phase).toBe("pulse");
expect(resolveNoirSymbolFrame(420).phase).toBe("flight");
expect(resolveNoirSymbolFrame(760).phase).toBe("draw");
expect(resolveNoirSymbolFrame(1_140).phase).toBe("ignite");
expect(resolveNoirSymbolFrame(1_400)).toMatchObject({
  phase: "complete",
  complete: true,
  drawProgress: 1,
  fillOpacity: 1,
});
```

- [ ] **Step 2: Run the focused test and verify failure**

Run:

```powershell
npx vitest run components/preloader/noir-symbol-preloader-timeline.test.ts
```

Expected: failure because production still reports 2,600 ms and old beat boundaries.

- [ ] **Step 3: Implement the compressed beat boundaries**

Use these deterministic constants while retaining the existing easing and six origins:

```ts
export const NOIR_SYMBOL_DURATION_MS = 1_400;

const PULSE_START_MS = 50;
const PULSE_END_MS = 270;
const FLIGHT_START_MS = 270;
const FLIGHT_STAGGER_MS = 18;
const FLIGHT_DURATION_MS = 225;
const DRAW_START_MS = 580;
const DRAW_END_MS = 1_055;
const IGNITION_START_MS = 1_055;
const IGNITION_END_MS = 1_240;
const FILL_START_MS = 1_150;
const FILL_END_MS = 1_340;
```

- [ ] **Step 4: Run the focused test and verify pass**

Run the same Vitest command. Expected: all symbol timeline tests pass.

### Task 2: Decouple usable HTML from WebGL readiness

**Files:**
- Modify: `components/preloader/entry-preloader.test.ts`
- Modify: `components/preloader/entry-preloader-state.ts`

- [ ] **Step 1: Write the new gate contract test**

Remove `sceneReady` from the ready fixture and required-key loop. Add an explicit assertion that the gate is satisfied by document, fonts, symbol, and reveal readiness only:

```ts
const ready = {
  documentReady: true,
  fontsReady: true,
  symbolReady: true,
  revealReady: true,
  reducedMotion: false,
};

expect(canRevealEntry(ready)).toBe(true);
```

For reduced motion, assert that document and fonts remain required while symbol and reveal are skipped.

- [ ] **Step 2: Run the gate test and verify failure**

Run:

```powershell
npx vitest run components/preloader/entry-preloader.test.ts
```

Expected: TypeScript/runtime contract mismatch because `sceneReady` is still required.

- [ ] **Step 3: Remove the scene field from the reveal gate**

Implement the focused state shape:

```ts
export interface EntryGateState {
  readonly documentReady: boolean;
  readonly fontsReady: boolean;
  readonly symbolReady: boolean;
  readonly revealReady: boolean;
  readonly reducedMotion: boolean;
}

export function canRevealEntry(state: EntryGateState): boolean {
  return (
    state.documentReady &&
    state.fontsReady &&
    (state.reducedMotion || state.symbolReady) &&
    (state.reducedMotion || state.revealReady)
  );
}
```

- [ ] **Step 4: Run the gate test and verify pass**

Run the same Vitest command. Expected: all gate tests pass.

### Task 3: Speed up the entry orchestrator

**Files:**
- Modify: `components/preloader/EntryPreloader.test.tsx`
- Modify: `components/preloader/EntryPreloader.tsx`

- [ ] **Step 1: Update component tests before implementation**

Change the normal-motion expectations to an 80 ms delay, 520 ms reveal, and text at 160 ms into that reveal. Replace the old slow-scene hold tests with a proof that `window.__NOIR_READY__ = false` does not block completion after symbol, fonts, and reveal runtime are ready:

```ts
window.__NOIR_READY__ = false;
const view = render(<EntryPreloader />);
act(() => symbolControl.complete?.());

await act(async () => vi.advanceTimersByTimeAsync(20));
await act(async () => vi.advanceTimersByTimeAsync(80));
await act(async () => vi.advanceTimersByTimeAsync(520));

expect(view.container.firstChild).toBeNull();
expect(document.documentElement.dataset["entryReady"]).toBe("true");
```

Retain coverage for symbol readiness, reveal-runtime readiness, reduced motion, route transitions, and overflow cleanup.

- [ ] **Step 2: Run the component test and verify failure**

Run:

```powershell
npx vitest run components/preloader/EntryPreloader.test.tsx
```

Expected: timing assertions fail and a pending scene still keeps the overlay mounted.

- [ ] **Step 3: Implement the faster orchestration**

Set:

```ts
const REVEAL_DELAY_MS = 80;
const REVEAL_DURATION_MS = 520;
const TEXT_REVEAL_LEAD_MS = 360;
```

Remove the scene-ready state, `NOIR_SCENE_SETTLED_EVENT` import/listener, and `sceneReady` argument from `canRevealEntry`. Do not change the canvas boot path, route-transition path, reduced-motion behavior, or dataset names.

- [ ] **Step 4: Run all preloader tests**

Run:

```powershell
npx vitest run components/preloader
```

Expected: all preloader tests pass with no unhandled timers.

### Task 4: Integration verification and timing comparison

**Files:**
- Verify only; no production file expected.

- [ ] **Step 1: Run static quality gates**

Run:

```powershell
git diff --check
npm run check
npm run typecheck
npm run build
```

Expected: all commands exit successfully; existing non-fatal Three.js warnings may still appear only in the browser.

- [ ] **Step 2: Measure desktop production-local entry**

Serve `out` on a local port, navigate at 1280×800, and record `first-contentful-paint`, `window.__NOIR_READY__`, `data-symbol-complete`, `data-entry-text-ready`, and `data-entry-ready` from the same Performance API probe used for the baseline.

Expected targets:

```text
scene ready: independent, normally near 1.0 s locally
symbol complete: near 1.6 s or earlier including boot overhead
hero text ready: under 1.9 s
entry ready: under 2.2 s
```

- [ ] **Step 3: Verify responsive and visual behavior**

Inspect desktop 1280×800 and mobile 390×844. Confirm the NOIR mark retains every beat, the dotted reveal remains intact, text stays contained, the canvas occupies its stable layer, and late WebGL cannot block scrolling or HTML visibility.

- [ ] **Step 4: Inspect the final diff and commit the implementation**

Run:

```powershell
git status --short
git diff -- components/preloader
git diff --check
git add -- components/preloader
git commit -m "perf(hero): reveal home entry sooner"
```

Expected: only the six planned preloader files are included in the implementation commit.
