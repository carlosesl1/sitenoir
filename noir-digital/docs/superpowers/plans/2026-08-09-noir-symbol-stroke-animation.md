# NOIR Symbol Stroke Animation Implementation Plan

> **For agentic workers:** Execute directly by default. Use subagents only for independent bounded lanes that satisfy the global harness policy. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone, dependency-free HTML study that reproduces only the supplied reference's opening creation act with the canonical two-path NOIR symbol.

**Architecture:** Keep the canonical paths inline in one SVG and generate the reference's visual stack as SVG layers. A deterministic score drives heart, emissaries, contour dashes, glow, ignition, rest, and reverse replay; `?probe` freezes the clock for Playwright beat verification.

**Tech Stack:** HTML5, CSS custom properties, SVG geometry APIs, vanilla JavaScript, Playwright 1.61, Biome 2.5.

---

## File structure

- Create `prototypes/noir-symbol-stroke-study.html`: canonical artwork, tokens, SVG layers, animation clock, replay, reduced motion, accessibility, fallback, and probe hook.
- Create `tests/interaction/noir-symbol-stroke-study.spec.ts`: local-file and HTTP contracts, beat checks, replay, themes, reduced motion, responsive bounds, and page-error collection.

No Next.js component, route, package dependency, public brand asset, or production preloader changes.

### Task 1: Lock the canonical artwork and standalone contract

**Files:**
- Create: `tests/interaction/noir-symbol-stroke-study.spec.ts`
- Create: `prototypes/noir-symbol-stroke-study.html`
- Reference only: `public/brand/noir-symbol.svg`

- [ ] **Step 1: Write the failing source-contract test**

Create the test harness with a built-in HTTP server so the same file is checked by `file:` and `http:` without adding dependencies:

```ts
import { createServer, type Server } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { expect, test } from "@playwright/test";

const root = resolve(import.meta.dirname, "../..");
const prototypePath = resolve(root, "prototypes/noir-symbol-stroke-study.html");
const sourcePath = resolve(root, "public/brand/noir-symbol.svg");
const pathsFrom = (source: string) =>
  Array.from(source.matchAll(/<path\s+d="([^"]+)"/g), (match) => match[1]);

let server: Server;
let httpURL = "";

test.beforeAll(async () => {
  server = createServer(async (request, response) => {
    if (!request.url?.startsWith("/noir-symbol-stroke-study.html")) {
      response.writeHead(404).end();
      return;
    }
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(await readFile(prototypePath));
  });
  await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Prototype server failed");
  httpURL = `http://127.0.0.1:${address.port}/noir-symbol-stroke-study.html`;
});

test.afterAll(async () => {
  await new Promise<void>((done, reject) =>
    server.close((error) => (error ? reject(error) : done())),
  );
});

test("embeds the canonical NOIR symbol without visible copy", async ({ page }) => {
  const fileURL = pathToFileURL(prototypePath);
  fileURL.search = "?probe";
  await page.goto(fileURL.href);
  await expect(page.locator("main[role=button]")).toHaveAttribute(
    "aria-label",
    "Ícone da NOIR sendo desenhado. Ative para reproduzir novamente.",
  );
  await expect(page.locator("svg")).toHaveAttribute("viewBox", "0 0 164 186");
  expect(await page.locator("[data-source-path]").evaluateAll((items) =>
    items.map((item) => item.getAttribute("d")),
  )).toEqual(pathsFrom(await readFile(sourcePath, "utf8")));
  await expect(page.locator("body")).toHaveText("");
});

test("loads over HTTP without page errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`${httpURL}?probe`);
  await expect(page.locator("[data-source-path]")).toHaveCount(2);
  expect(errors).toEqual([]);
});
```

- [ ] **Step 2: Run the test and verify it fails because the prototype is absent**

```powershell
$env:PLAYWRIGHT_BASE_URL = "http://127.0.0.1:1"
npx playwright test tests/interaction/noir-symbol-stroke-study.spec.ts --config=playwright.config.ts --project=desktop-chromium
Remove-Item Env:PLAYWRIGHT_BASE_URL
```

Expected: FAIL with `ENOENT` for `prototypes/noir-symbol-stroke-study.html`.

- [ ] **Step 3: Create the minimal standalone shell**

Create a complete `pt-BR` HTML document with `meta viewport`, title, monochrome tokens, centered `main.stage`, and an SVG with `viewBox="0 0 164 186"`. Copy both canonical `d` values verbatim from `public/brand/noir-symbol.svg` into two paths marked `data-source-path`; inline them so direct local-file loading works.

Use `main.stage#stage[role="button"][tabindex="0"]` with the exact accessible label from Step 1. Its child SVG uses `viewBox="0 0 164 186"`, `role="img"`, and `aria-label="Ícone da NOIR"`; its `g#source` contains the two exact source paths in source order, with only `data-source-path` added. Use `width:min(74vmin,620px)`, `aspect-ratio:164/186`, `overflow:hidden`, a central radial halo, vignette, and visible `:focus-visible` outline. There must be no visible text node.

- [ ] **Step 4: Run the contract test and commit the passing shell**

Expected: 2 passed.

```powershell
git add -- prototypes/noir-symbol-stroke-study.html tests/interaction/noir-symbol-stroke-study.spec.ts
git diff --cached --check
git commit -m "test: lock NOIR stroke study artwork"
```

### Task 2: Build the exact first-act layers and deterministic score

**Files:**
- Modify: `prototypes/noir-symbol-stroke-study.html`
- Modify: `tests/interaction/noir-symbol-stroke-study.spec.ts`

- [ ] **Step 1: Add failing deterministic-beat and layer tests**

Add a `ProbeState` type and declare `window.__probe` with `at`, `state`, and `rewind`. Assert these beats: `0.25=void`, `0.90=heart`, `1.60=flight`, `2.80=draw`, `5.70=ignite`, `6.40=rest`; call `at(2.80)` twice and require identical state. Require two paths in each `ghost`, `chase`, `glow`, `flash`, and `main` group, two emissaries, and four pen tips.

```ts
type ProbeState = {
  phase: "void" | "heart" | "flight" | "draw" | "ignite" | "rest" | "rewind";
  time: number;
  contours: Array<{ progress: number; mainOpacity: number; tipOpacity: number }>;
  heartOpacity: number;
  fillOpacity: number;
  scale: number;
};

declare global {
  interface Window {
    __probe?: {
      at(time: number): ProbeState;
      state(): ProbeState;
      rewind(localTime: number, baseTime?: number): ProbeState;
    };
  }
}

test("renders every approved beat deterministically", async ({ page }) => {
  await page.goto(`${httpURL}?probe`);
  const at = (time: number) => page.evaluate((value) => window.__probe?.at(value), time);
  expect(await at(0.25)).toMatchObject({ phase: "void", heartOpacity: 0, fillOpacity: 0 });
  expect((await at(0.9))?.heartOpacity).toBeGreaterThan(0);
  expect(await at(1.6)).toMatchObject({ phase: "flight" });
  expect((await at(2.8))?.contours.some((item) => item.progress > 0)).toBe(true);
  expect(await at(5.7)).toMatchObject({ phase: "ignite" });
  expect(await at(6.4)).toMatchObject({ phase: "rest" });
  expect(await at(2.8)).toEqual(await at(2.8));
});
```

- [ ] **Step 2: Run the focused test and confirm `window.__probe` is missing**

Use the Task 1 test command. Expected: source contracts pass; beat/layer tests fail.

- [ ] **Step 3: Generate the reference layer architecture from the two canonical paths**

Hide the source group only after successful geometry measurement. Build the following configuration and cast records:

```js
const CFG = {
  heart: { appearT0: 0.5, appearDur: 0.7, burst: 1.35 },
  flight: { dur: 0.6, stagger: 0.05, swing: 2.4 },
  draw: { firstT0: 2.2, stagger: 0.35, finalAt: 5.15, chaseLag: 0.07 },
  ignite: { t0: 5.35, dur: 0.9, sigma: 0.55 },
  cam: { from: 1.13, t0: 0.8, dur: 1.9 },
  fillOpacity: 0.045,
  rewind: { each: 0.42, stagger: 0.05, tail: 0.22 },
};

const layerNames = ["ghost", "chase", "glow", "flash", "main", "tips"];
const groups = Object.fromEntries(layerNames.map((name) => [
  name,
  make("g", { "data-layer": name }, rig),
]));

const SOURCE_D = Array.from(document.querySelectorAll("[data-source-path]"), (path) =>
  path.getAttribute("d"),
);
if (SOURCE_D.some((d) => !d)) throw new Error("Canonical source path missing");

const cast = SOURCE_D.map((d, index) => {
  const ghost = make("path", { d }, groups.ghost);
  const length = ghost.getTotalLength();
  if (!Number.isFinite(length) || length <= 0) throw new Error(`Invalid contour ${index}`);
  return {
    index, d, length, ghost,
    t0: CFG.draw.firstT0 + index * CFG.draw.stagger,
    duration: CFG.draw.finalAt - (CFG.draw.firstT0 + index * CFG.draw.stagger),
    chase: make("path", { d }, groups.chase),
    glow: make("path", { d }, groups.glow),
    flash: make("path", { d }, groups.flash),
    main: make("path", { d }, groups.main),
    tips: [0, 1].map(() => make("circle", { r: "0.88", "data-pen-tip": "" }, groups.tips)),
  };
});
```

Each closed contour grows from two ends, matching the reference's `both` mode. Add one heart, one emissary per contour, three continuous emissary-tail paths, five decaying pen-trail dots per tip, and three deterministic embers per tip. Wrap initialization in `try/catch`; failure keeps the canonical filled source visible, sets `data-fallback="true"`, logs one concise diagnostic, and does not start the film.

- [ ] **Step 4: Port the reference timing curves and implement the pure render pass**

Port `clamp01`, `lerp`, `smooth`, `gauss`, deterministic `h1`, the numerical cubic-Bézier solver, and the original `drawEase`, `sweepEase`, and `settleEase` coefficients. Define:

```js
function phaseAt(t) {
  if (t < 0.5) return "void";
  if (t < 1.35) return "heart";
  if (t < 2.2) return "flight";
  if (t < 5.35) return "draw";
  if (t < 6.25) return "ignite";
  return "rest";
}

function progressAt(contour, t) {
  return drawEase(clamp01((t - contour.t0) / contour.duration));
}

function twoEndedDash(contour, progress) {
  const half = (contour.length * progress) / 2;
  return `${half} ${Math.max(0, contour.length - 2 * half)} ${half} ${contour.length * 4}`;
}
```

`render(t, dt)` must update the opening 113%→100% dolly, heart, curved emissary flight, ghost wake, dash progress, chase lag, bloom, both tips, trails, embers, clockwise ignition windows, completion pulse, and restrained fill. Use main width `0.62`, ghost `0.28`, chase/bloom `1.86`, round joins/caps, and one SVG Gaussian blur.

- [ ] **Step 5: Add the probe hook and ordinary animation loop**

With `?probe`, do not start the live loop. Define `let lastState = null` and expose `at(t)`, `state()`, and `rewind(rt,base)`; each updates `lastState` and returns a structured clone of values actually applied. Without `?probe`, never define `window.__probe` and start `requestAnimationFrame(frame)`.

- [ ] **Step 6: Run focused tests and commit**

Expected: 4 passing tests and no page errors.

```powershell
git add -- prototypes/noir-symbol-stroke-study.html tests/interaction/noir-symbol-stroke-study.spec.ts
git diff --cached --check
git commit -m "feat: animate NOIR symbol creation act"
```

### Task 3: Add replay, themes, reduced motion, and pause behavior

**Files:**
- Modify: `prototypes/noir-symbol-stroke-study.html`
- Modify: `tests/interaction/noir-symbol-stroke-study.spec.ts`

- [ ] **Step 1: Add failing behavior tests**

Test primary click, `Enter`, and `Space` from the probed rest state. Each activation must switch the reported phase to `rewind`, and `rewind(0.2,6.4)` must report at least one contour below full progress. Add reduced-motion coverage that requires a complete static symbol, and theme coverage for system light plus explicit dark/light overrides.

```ts
test("unravels before pointer and keyboard replay", async ({ page }) => {
  await page.goto(`${httpURL}?probe`);
  for (const input of ["pointer", "Enter", "Space"] as const) {
    await page.evaluate(() => window.__probe?.at(6.4));
    if (input === "pointer") await page.locator("main").click();
    else await page.locator("main").press(input);
    await expect.poll(() => page.evaluate(() => window.__probe?.state().phase)).toBe("rewind");
    expect((await page.evaluate(() => window.__probe?.rewind(0.2, 6.4)))
      ?.contours.some((item) => item.progress < 1)).toBe(true);
  }
});

test("uses a complete static mark for reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`${httpURL}?probe`);
  const state = await page.evaluate(() => window.__probe?.state());
  expect(state).toMatchObject({ phase: "rest" });
  expect(state?.contours.every((item) => item.progress === 1)).toBe(true);
});

test("supports system and explicit themes", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto(`${httpURL}?probe`);
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).colorScheme)).toBe("light");
  await page.evaluate(() => document.documentElement.setAttribute("data-theme", "dark"));
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).colorScheme)).toBe("dark");
  await page.evaluate(() => document.documentElement.setAttribute("data-theme", "light"));
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).colorScheme)).toBe("light");
});
```

- [ ] **Step 2: Run the test and verify only the new behavior contracts fail**

Use the Task 1 command. Expected: artwork and score tests pass; replay, reduced-motion, and theme tests fail.

- [ ] **Step 3: Implement captured-state reverse replay**

Do not hard-reset. Capture current contour progress, ghost opacity, fill opacity, and dolly scale; retract the last contour first with the reference's stagger, then restart from the void.

```js
let mode = "run";
let t0 = performance.now();
let rewindT0 = 0;
let rewindFrom = cast.map(() => 0);
const rewindTotal = CFG.rewind.each + (cast.length - 1) * CFG.rewind.stagger + CFG.rewind.tail;

function replay() {
  if (reduceMotion.matches || mode === "rewind") return;
  const time = probeHold ? lastState?.time ?? 0 : (performance.now() - t0) / 1000;
  if (time < CFG.draw.firstT0 + 0.2) return;
  rewindFrom = cast.map((contour) => progressAt(contour, time));
  rewindT0 = performance.now();
  mode = "rewind";
  lastState = renderRewind(0, time, 1 / 60);
}
```

Bind primary `pointerdown` plus unmodified `Enter`/`Space` to the focusable stage. Ignore replay during reduced motion or an active rewind.

- [ ] **Step 4: Implement theme tokens, reduced motion, and visibility pause**

Copy the reference dark/light tokens, correcting the malformed media syntax to `@media (prefers-color-scheme: light)`. Place `:root[data-theme="dark"]` and `:root[data-theme="light"]` after the media query so explicit choice wins.

`renderStatic(t)` applies completed dashes, final fill, hidden heart/emissaries/tips, and only a slow bloom breath. The initial probe state must be static when `matchMedia("(prefers-reduced-motion: reduce)")` matches.

On `visibilitychange`, capture the hidden timestamp and add the away duration to both `t0` and `rewindT0` when visible again.

- [ ] **Step 5: Run behavior tests, Biome, and commit**

```powershell
$env:PLAYWRIGHT_BASE_URL = "http://127.0.0.1:1"
npx playwright test tests/interaction/noir-symbol-stroke-study.spec.ts --config=playwright.config.ts --project=desktop-chromium
Remove-Item Env:PLAYWRIGHT_BASE_URL
npx biome check tests/interaction/noir-symbol-stroke-study.spec.ts
git add -- prototypes/noir-symbol-stroke-study.html tests/interaction/noir-symbol-stroke-study.spec.ts
git diff --cached --check
git commit -m "feat: finish NOIR stroke study controls"
```

Expected: all focused tests pass and Biome reports no diagnostics.

### Task 4: Prove responsive framing and visual fidelity

**Files:**
- Modify if evidence finds a defect: `prototypes/noir-symbol-stroke-study.html`
- Modify if a missing contract is found: `tests/interaction/noir-symbol-stroke-study.spec.ts`

- [ ] **Step 1: Add responsive geometry coverage**

```ts
test("keeps the full symbol inside mobile and desktop viewports", async ({ page }) => {
  await page.goto(`${httpURL}?probe`);
  await page.evaluate(() => window.__probe?.at(6.4));
  for (const viewport of [
    { width: 320, height: 568 },
    { width: 390, height: 844 },
    { width: 1280, height: 720 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    const box = await page.locator("svg").boundingBox();
    expect(box).not.toBeNull();
    expect(box?.x).toBeGreaterThanOrEqual(0);
    expect(box?.y).toBeGreaterThanOrEqual(0);
    expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(viewport.width);
    expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(viewport.height);
  }
});
```

- [ ] **Step 2: Run both Playwright projects as the integration proof**

```powershell
$env:PLAYWRIGHT_BASE_URL = "http://127.0.0.1:1"
npx playwright test tests/interaction/noir-symbol-stroke-study.spec.ts --config=playwright.config.ts
Remove-Item Env:PLAYWRIGHT_BASE_URL
```

Expected: every test passes in `desktop-chromium` and `mobile-chromium`.

- [ ] **Step 3: Inspect all approved beats in the collaborative browser**

Serve the repository with `python -m http.server 4173 --bind 127.0.0.1 --directory .`. Open `http://127.0.0.1:4173/prototypes/noir-symbol-stroke-study.html?probe` and call `window.__probe.at()` at `0.25`, `0.90`, `1.60`, `2.80`, `5.70`, and `6.40` seconds.

Verify respectively: void; centered heart plus opening dolly; two spiral emissaries; official contours actively drawing with tips/trails/bloom; clockwise ignition sweep; exact canonical geometry with restrained final fill and no text. Repeat at `390×844`, then load without `?probe`, observe a full cycle, click, and confirm reverse unravel before restart.

- [ ] **Step 4: Run hygiene checks and inspect the exact diff**

```powershell
npx biome check tests/interaction/noir-symbol-stroke-study.spec.ts
git diff --check
git status --short
git diff -- prototypes/noir-symbol-stroke-study.html tests/interaction/noir-symbol-stroke-study.spec.ts
```

Expected: no diagnostics or whitespace errors, and no unrelated path in the implementation diff. Preserve every pre-existing dirty-worktree change.

- [ ] **Step 5: Commit only evidence-driven corrections**

If visual inspection required a correction, stage only the two implementation paths, inspect the cached diff, and commit with `fix: polish NOIR stroke study timing`. If no correction was required, do not create an empty commit.
