# Canvas UI Glass Comparison Implementation Plan

> **For agentic workers:** Execute directly by default. Use subagents only for independent bounded lanes that satisfy the global harness policy. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local `/glass-test` A/B page that compares the existing NOIR hero shader with a Canvas UI-inspired physical glass material in the real homepage scene.

**Architecture:** Resolve an opt-in `?glass=canvas-ui` variant in the existing scene boot path, propagate it to `HeroModel`, and swap only the hero asset material. Render the unchanged and experimental home in equal fixed logical viewports inside a noindex comparison route.

**Tech Stack:** Next.js 16 App Router, React 19, React Three Fiber 9, Three.js 0.185, Vitest, Testing Library, CSS Modules, Biome, TypeScript.

---

### Task 1: Resolve and propagate the opt-in glass variant

**Files:**
- Create: `scene/hero-glass-variant.ts`
- Create: `scene/hero-glass-variant.test.ts`
- Modify: `scene/LazySiteCanvas.tsx`
- Modify: `scene/LazySiteCanvas.test.tsx`
- Modify: `scene/SiteCanvas.tsx`
- Modify: `scene/HeroModel.tsx`

- [ ] **Step 1: Write the failing resolver tests**

```ts
import { describe, expect, it } from "vitest";

import { resolveHeroGlassVariant } from "@/scene/hero-glass-variant";

describe("hero glass variant", () => {
  it("selects Canvas UI only for the exact opt-in value", () => {
    expect(resolveHeroGlassVariant("?glass=canvas-ui")).toBe("canvas-ui");
  });

  it("preserves the current shader for missing or unknown values", () => {
    expect(resolveHeroGlassVariant("")).toBe("current");
    expect(resolveHeroGlassVariant("?glass=physical")).toBe("current");
    expect(resolveHeroGlassVariant("?glass=CANVAS-UI")).toBe("current");
  });
});
```

- [ ] **Step 2: Run the resolver test and verify RED**

Run: `npx vitest run scene/hero-glass-variant.test.ts --maxWorkers=4`

Expected: FAIL because `scene/hero-glass-variant.ts` does not exist.

- [ ] **Step 3: Implement the minimal resolver**

```ts
export type HeroGlassVariant = "current" | "canvas-ui";

export function resolveHeroGlassVariant(search: string): HeroGlassVariant {
  return new URLSearchParams(search).get("glass") === "canvas-ui" ? "canvas-ui" : "current";
}
```

- [ ] **Step 4: Run the resolver test and verify GREEN**

Run: `npx vitest run scene/hero-glass-variant.test.ts --maxWorkers=4`

Expected: 1 file and 2 tests pass.

- [ ] **Step 5: Add a failing propagation test to `LazySiteCanvas.test.tsx`**

Change the mocked scene component so it exposes its received variant:

```tsx
vi.mock("@/scene/SiteCanvas", () => {
  siteCanvasModuleProbe.loaded();
  return {
    SiteCanvas: ({ heroGlassVariant }: { heroGlassVariant: string }) => (
      <div data-testid="mock-site-canvas" data-hero-glass-variant={heroGlassVariant} />
    ),
  };
});
```

Add:

```tsx
it("passes the opt-in Canvas UI variant to the deferred scene", async () => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
    getExtension: vi.fn(),
  } as unknown as RenderingContext);
  window.history.replaceState({}, "", "/?glass=canvas-ui");

  const view = render(<LazySiteCanvas preloadDuringEntry />);

  await vi.waitFor(() =>
    expect(view.getByTestId("mock-site-canvas")).toHaveAttribute(
      "data-hero-glass-variant",
      "canvas-ui",
    ),
  );
});
```

- [ ] **Step 6: Run the propagation test and verify RED**

Run: `npx vitest run scene/LazySiteCanvas.test.tsx --maxWorkers=4`

Expected: FAIL because `LazySiteCanvas` does not pass `heroGlassVariant`.

- [ ] **Step 7: Propagate the typed variant through the scene**

In `LazySiteCanvas.tsx`, add state, resolve it from the existing URL read, and pass it to the deferred scene:

```tsx
import {
  resolveHeroGlassVariant,
  type HeroGlassVariant,
} from "@/scene/hero-glass-variant";

const [heroGlassVariant, setHeroGlassVariant] = useState<HeroGlassVariant>("current");

const search = window.location.search;
const effectsParameter = new URLSearchParams(search).get("effects");
setHeroGlassVariant(resolveHeroGlassVariant(search));

<DeferredSiteCanvas
  ambientOnly={ambientOnly}
  heroGlassVariant={heroGlassVariant}
  quality={quality}
/>
```

In `SiteCanvas.tsx`, add `heroGlassVariant: HeroGlassVariant` to `SiteCanvas` and `HeroSceneContent`, then pass it to `HeroModel`:

```tsx
<HeroModel
  heroGlassVariant={heroGlassVariant}
  layout={heroLayout}
  reducedMotion={reducedMotion}
  scrollProgress={scrollProgress}
/>
```

In `HeroModel.tsx`, accept the prop and select the component while keeping the group transform unchanged:

```tsx
const GlassAsset =
  heroGlassVariant === "canvas-ui" ? HeroCanvasUiGlassAsset : HeroGlassAsset;

<GlassAsset reducedMotion={reducedMotion} sceneScale={layout.scale} />
```

Keep both asset components compatible with that shared call by accepting the same required props:

```ts
interface HeroGlassAssetProps {
  readonly reducedMotion: boolean;
  readonly sceneScale: number;
}
```

`HeroGlassAsset` continues using `reducedMotion` and ignores `sceneScale`. `HeroCanvasUiGlassAsset` uses `sceneScale` and ignores `reducedMotion`.

- [ ] **Step 8: Run focused variant tests**

Run: `npx vitest run scene/hero-glass-variant.test.ts scene/LazySiteCanvas.test.tsx --maxWorkers=4`

Expected: both files pass.

- [ ] **Step 9: Commit the variant path**

```powershell
git add -- scene/hero-glass-variant.ts scene/hero-glass-variant.test.ts scene/LazySiteCanvas.tsx scene/LazySiteCanvas.test.tsx scene/SiteCanvas.tsx scene/HeroModel.tsx scene/HeroGlassAsset.tsx
git commit -m "feat(hero): add opt-in glass variant"
```

### Task 2: Build the Canvas UI-inspired physical glass asset

**Files:**
- Create: `scene/hero-model-geometry.ts`
- Create: `scene/hero-model-geometry.test.ts`
- Create: `scene/hero-canvas-ui-glass-config.ts`
- Create: `scene/hero-canvas-ui-glass-config.test.ts`
- Create: `scene/HeroCanvasUiGlassAsset.tsx`
- Modify: `scene/HeroGlassAsset.tsx`

- [ ] **Step 1: Write failing shared-geometry and configuration tests**

```ts
import { Box3, BoxGeometry, Group, Mesh, Vector3 } from "three";
import { expect, it } from "vitest";

import { createHeroModelGeometry } from "@/scene/hero-model-geometry";

it("merges, centers, and normalizes model geometry inputs", () => {
  const root = new Group();
  const left = new Mesh(new BoxGeometry(1, 1, 1));
  const right = new Mesh(new BoxGeometry(1, 1, 1));
  left.position.x = -2;
  right.position.x = 2;
  root.add(left, right);

  const geometry = createHeroModelGeometry(root);
  const bounds = new Box3().setFromBufferAttribute(geometry.getAttribute("position"));
  const center = bounds.getCenter(new Vector3());

  expect(center.length()).toBeLessThan(0.000001);
  expect(geometry.getAttribute("normal")).toBeDefined();
  geometry.dispose();
});
```

```ts
import { describe, expect, it } from "vitest";

import { HERO_CANVAS_UI_GLASS_CONFIG } from "@/scene/hero-canvas-ui-glass-config";

describe("Canvas UI hero glass configuration", () => {
  it("starts from the approved physical glass values", () => {
    expect(HERO_CANVAS_UI_GLASS_CONFIG).toMatchObject({
      clearcoat: 0.5,
      clearcoatRoughness: 0.06,
      dispersion: 1.5,
      environmentIntensity: 1,
      highlight: "#066aff",
      ior: 1.75,
      roughness: 0.25,
      thickness: 4,
      transmission: 1,
    });
  });
});
```

- [ ] **Step 2: Run both tests and verify RED**

Run: `npx vitest run scene/hero-model-geometry.test.ts scene/hero-canvas-ui-glass-config.test.ts --maxWorkers=4`

Expected: FAIL because both modules are absent.

- [ ] **Step 3: Extract the current geometry preparation**

```ts
import { BufferGeometry, type Object3D } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

export function createHeroModelGeometry(source: Object3D): BufferGeometry {
  source.updateMatrixWorld(true);
  const parts: BufferGeometry[] = [];
  source.traverse((object) => {
    if (!("isMesh" in object) || object.isMesh !== true || !("geometry" in object)) return;
    const geometry = object.geometry;
    if (!(geometry instanceof BufferGeometry)) return;
    const part = geometry.clone();
    part.applyMatrix4(object.matrixWorld);
    parts.push(part);
  });
  const combined = mergeGeometries(parts, false) ?? parts[0] ?? new BufferGeometry();
  for (const part of parts) if (part !== combined) part.dispose();
  combined.center();
  combined.computeBoundingBox();
  combined.computeVertexNormals();
  return combined;
}
```

Replace the duplicated geometry `useMemo` body in `HeroGlassAsset.tsx` with `createHeroModelGeometry(source.scene)`.

- [ ] **Step 4: Add the frozen experiment configuration**

```ts
export const HERO_CANVAS_UI_GLASS_CONFIG = {
  clearcoat: 0.5,
  clearcoatRoughness: 0.06,
  dispersion: 1.5,
  environmentIntensity: 1,
  highlight: "#066aff",
  ior: 1.75,
  roughness: 0.25,
  thickness: 4,
  transmission: 1,
} as const;
```

- [ ] **Step 5: Run both tests and verify GREEN**

Run: `npx vitest run scene/hero-model-geometry.test.ts scene/hero-canvas-ui-glass-config.test.ts --maxWorkers=4`

Expected: 2 files and 2 tests pass.

- [ ] **Step 6: Implement `HeroCanvasUiGlassAsset`**

Create a component that uses the shared geometry, a local RoomEnvironment-derived PMREM, and the approved material values:

```tsx
"use client";

import { useLoader, useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import {
  Color,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  PMREMGenerator,
  RingGeometry,
  type WebGLRenderTarget,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import { HERO_CANVAS_UI_GLASS_CONFIG as config } from "@/scene/hero-canvas-ui-glass-config";
import { HERO_MODEL_SOURCE } from "@/scene/critical-hero-preload";
import { HERO_GLASS_CONFIG } from "@/scene/hero-glass-config";
import { createHeroModelGeometry } from "@/scene/hero-model-geometry";

interface HeroCanvasUiGlassAssetProps {
  readonly reducedMotion: boolean;
  readonly sceneScale: number;
}

export function HeroCanvasUiGlassAsset({ sceneScale }: HeroCanvasUiGlassAssetProps) {
  const source = useLoader(GLTFLoader, HERO_MODEL_SOURCE);
  const gl = useThree((state) => state.gl);
  const meshRef = useRef<Mesh>(null);
  const geometry = useMemo(() => createHeroModelGeometry(source.scene), [source.scene]);
  const environment = useMemo<WebGLRenderTarget>(() => {
    const room = new RoomEnvironment();
    const ringMaterial = new MeshBasicMaterial({
      color: new Color(config.highlight).multiplyScalar(15),
      side: DoubleSide,
      toneMapped: false,
    });
    const ring = new Mesh(new RingGeometry(0.5, 1, 64), ringMaterial);
    ring.position.set(2, 3, -2);
    ring.scale.setScalar(10);
    ring.lookAt(0, 0, 0);
    room.add(ring);
    const pmrem = new PMREMGenerator(gl);
    const target = pmrem.fromScene(room, 0.6, 0.1, 1000);
    room.dispose();
    pmrem.dispose();
    return target;
  }, [gl]);
  const material = useMemo(
    () =>
      new MeshPhysicalMaterial({
        clearcoat: config.clearcoat,
        clearcoatRoughness: config.clearcoatRoughness,
        color: 0xffffff,
        dispersion: config.dispersion,
        envMap: environment.texture,
        envMapIntensity: config.environmentIntensity,
        ior: config.ior,
        metalness: 0,
        roughness: config.roughness,
        thickness: config.thickness / Math.max(sceneScale, 0.0001),
        transmission: config.transmission,
      }),
    [environment.texture, sceneScale],
  );

  useLayoutEffect(() => {
    meshRef.current?.layers.set(HERO_GLASS_CONFIG.renderLayer);
  }, []);
  useLayoutEffect(() => () => geometry.dispose(), [geometry]);
  useLayoutEffect(() => () => material.dispose(), [material]);
  useLayoutEffect(() => () => environment.dispose(), [environment]);

  return <mesh ref={meshRef} geometry={geometry} material={material} />;
}
```

- [ ] **Step 7: Run focused scene checks**

Run: `npx vitest run scene/hero-model-geometry.test.ts scene/hero-canvas-ui-glass-config.test.ts scene/critical-hero-preload.test.ts scene/hero-glass-shaders.test.ts --maxWorkers=4`

Expected: all focused files pass.

- [ ] **Step 8: Commit the physical asset**

```powershell
git add -- scene/hero-model-geometry.ts scene/hero-model-geometry.test.ts scene/hero-canvas-ui-glass-config.ts scene/hero-canvas-ui-glass-config.test.ts scene/HeroCanvasUiGlassAsset.tsx scene/HeroGlassAsset.tsx
git commit -m "feat(hero): add Canvas UI physical glass experiment"
```

### Task 3: Add the noindex side-by-side comparison route

**Files:**
- Create: `components/glass-test/glass-comparison.ts`
- Create: `components/glass-test/glass-comparison.test.ts`
- Create: `components/glass-test/GlassComparison.tsx`
- Create: `components/glass-test/GlassComparison.module.css`
- Create: `app/glass-test/page.tsx`
- Create: `app/glass-test/page.test.tsx`

- [ ] **Step 1: Write failing frame-geometry tests**

```ts
import { describe, expect, it } from "vitest";

import {
  COMPARISON_VIEWPORT,
  comparisonFrameScale,
} from "@/components/glass-test/glass-comparison";

describe("glass comparison framing", () => {
  it("uses one desktop logical viewport for both homes", () => {
    expect(COMPARISON_VIEWPORT).toEqual({ width: 1440, height: 900 });
  });

  it("fits the logical viewport without enlarging it", () => {
    expect(comparisonFrameScale(720)).toBe(0.5);
    expect(comparisonFrameScale(1800)).toBe(1);
    expect(comparisonFrameScale(0)).toBe(0);
  });
});
```

- [ ] **Step 2: Run the helper test and verify RED**

Run: `npx vitest run components/glass-test/glass-comparison.test.ts --maxWorkers=4`

Expected: FAIL because the helper module does not exist.

- [ ] **Step 3: Implement the fixed viewport helper**

```ts
export const COMPARISON_VIEWPORT = { width: 1440, height: 900 } as const;

export function comparisonFrameScale(availableWidth: number): number {
  return Math.min(1, Math.max(0, availableWidth) / COMPARISON_VIEWPORT.width);
}
```

- [ ] **Step 4: Run the helper test and verify GREEN**

Run: `npx vitest run components/glass-test/glass-comparison.test.ts --maxWorkers=4`

Expected: 1 file and 2 tests pass.

- [ ] **Step 5: Write the failing route test**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import GlassTestPage, { metadata } from "@/app/glass-test/page";

describe("glass test route", () => {
  it("is excluded from indexing", () => {
    expect(metadata).toMatchObject({ robots: { follow: false, index: false } });
  });

  it("renders the current and Canvas UI home targets", () => {
    render(<GlassTestPage />);
    expect(screen.getByTitle("NOIR atual")).toHaveAttribute("src", "/?effects=full");
    expect(screen.getByTitle("NOIR Canvas UI")).toHaveAttribute(
      "src",
      "/?effects=full&glass=canvas-ui",
    );
    expect(screen.getByText("ATUAL")).toBeInTheDocument();
    expect(screen.getByText("CANVAS UI")).toBeInTheDocument();
  });
});
```

- [ ] **Step 6: Run the route test and verify RED**

Run: `npx vitest run app/glass-test/page.test.tsx --maxWorkers=4`

Expected: FAIL because the route does not exist.

- [ ] **Step 7: Implement the responsive comparison component and route**

Create `GlassComparison.tsx`:

```tsx
"use client";

import { type CSSProperties, useEffect, useRef, useState } from "react";

import {
  COMPARISON_VIEWPORT,
  comparisonFrameScale,
} from "@/components/glass-test/glass-comparison";

import styles from "./GlassComparison.module.css";

const FRAMES = [
  { label: "ATUAL", src: "/?effects=full", title: "NOIR atual" },
  {
    label: "CANVAS UI",
    src: "/?effects=full&glass=canvas-ui",
    title: "NOIR Canvas UI",
  },
] as const;

function ComparisonFrame({ label, src, title }: (typeof FRAMES)[number]) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof ResizeObserver === "undefined") return;
    const update = (width: number) => setScale(comparisonFrameScale(width));
    update(container.getBoundingClientRect().width);
    const observer = new ResizeObserver(([entry]) => {
      if (entry) update(entry.contentRect.width);
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const viewportStyle = {
    height: COMPARISON_VIEWPORT.height * scale,
  } satisfies CSSProperties;
  const frameStyle = {
    height: COMPARISON_VIEWPORT.height,
    transform: `scale(${scale})`,
    width: COMPARISON_VIEWPORT.width,
  } satisfies CSSProperties;

  return (
    <article className={styles["panel"]}>
      <header className={styles["label"]}>{label}</header>
      <div ref={containerRef} className={styles["viewport"]} style={viewportStyle}>
        {loadState === "ready" ? null : (
          <p className={styles["status"]} role={loadState === "error" ? "alert" : "status"}>
            {loadState === "error" ? "Não foi possível carregar esta versão." : "Carregando…"}
          </p>
        )}
        <iframe
          className={styles["frame"]}
          height={COMPARISON_VIEWPORT.height}
          loading="eager"
          onError={() => setLoadState("error")}
          onLoad={() => setLoadState("ready")}
          src={src}
          style={frameStyle}
          title={title}
          width={COMPARISON_VIEWPORT.width}
        />
      </div>
    </article>
  );
}

export function GlassComparison() {
  return (
    <main className={styles["comparison"]} id="main-content">
      {FRAMES.map((frame) => (
        <ComparisonFrame key={frame.label} {...frame} />
      ))}
    </main>
  );
}
```

Create `GlassComparison.module.css`:

```css
.comparison {
  display: grid;
  min-height: 100dvh;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1px;
  padding: 1px;
  background: #3a3a3a;
}

.panel {
  min-width: 0;
  background: #000;
}

.label {
  position: relative;
  z-index: 2;
  display: flex;
  min-height: 32px;
  align-items: center;
  padding: 0 12px;
  border-bottom: 1px solid #3a3a3a;
  color: #f4f4f0;
  font-family: var(--font-pixel);
  font-size: 11px;
  letter-spacing: 0.08em;
}

.viewport {
  position: relative;
  width: 100%;
  overflow: hidden;
  background: #000;
}

.frame {
  position: absolute;
  inset: 0 auto auto 0;
  display: block;
  border: 0;
  transform-origin: top left;
}

.status {
  position: absolute;
  inset: 0;
  display: grid;
  margin: 0;
  place-items: center;
  color: #a8a8a8;
  font-family: var(--font-pixel);
  font-size: 11px;
}

@media (max-width: 899px) {
  .comparison {
    grid-template-columns: minmax(0, 1fr);
  }
}
```

`app/glass-test/page.tsx` will export:

```tsx
import type { Metadata } from "next";

import { GlassComparison } from "@/components/glass-test/GlassComparison";

export const metadata: Metadata = {
  title: "Glass Test | NOIR DIGITAL",
  robots: { follow: false, index: false },
};

export default function GlassTestPage() {
  return <GlassComparison />;
}
```

- [ ] **Step 8: Run the route tests and verify GREEN**

Run: `npx vitest run app/glass-test/page.test.tsx components/glass-test/glass-comparison.test.ts --maxWorkers=4`

Expected: both files pass.

- [ ] **Step 9: Commit the laboratory route**

```powershell
git add -- app/glass-test/page.tsx app/glass-test/page.test.tsx components/glass-test/GlassComparison.tsx components/glass-test/GlassComparison.module.css components/glass-test/glass-comparison.ts components/glass-test/glass-comparison.test.ts
git commit -m "feat(hero): add glass comparison laboratory"
```

### Task 4: Integration and browser verification

**Files:**
- Modify only if verification exposes a reproducible defect in the files above.

- [ ] **Step 1: Run the coherent focused suite**

Run:

```powershell
npx vitest run scene/hero-glass-variant.test.ts scene/LazySiteCanvas.test.tsx scene/hero-model-geometry.test.ts scene/hero-canvas-ui-glass-config.test.ts scene/critical-hero-preload.test.ts scene/hero-glass-shaders.test.ts components/glass-test/glass-comparison.test.ts app/glass-test/page.test.tsx --maxWorkers=4
```

Expected: every listed file passes with no failed tests.

- [ ] **Step 2: Run static verification**

Run:

```powershell
npm run typecheck
npx biome check scene/hero-glass-variant.ts scene/hero-glass-variant.test.ts scene/LazySiteCanvas.tsx scene/LazySiteCanvas.test.tsx scene/SiteCanvas.tsx scene/HeroModel.tsx scene/HeroGlassAsset.tsx scene/HeroCanvasUiGlassAsset.tsx scene/hero-model-geometry.ts scene/hero-model-geometry.test.ts scene/hero-canvas-ui-glass-config.ts scene/hero-canvas-ui-glass-config.test.ts components/glass-test/GlassComparison.tsx components/glass-test/GlassComparison.module.css components/glass-test/glass-comparison.ts components/glass-test/glass-comparison.test.ts app/glass-test/page.tsx app/glass-test/page.test.tsx
npm run build
git diff --check
```

Expected: all commands exit `0`.

- [ ] **Step 3: Verify the browser comparison**

Start the worktree with `npm run dev -- --webpack`, open `http://127.0.0.1:3000/glass-test`, and verify:

- both panels reach the loaded home;
- the left panel keeps the existing shader;
- the right panel uses transparent physical glass;
- model geometry, framing, background and motion align;
- no console or WebGL errors occur;
- the narrow layout stacks without horizontal overflow.

- [ ] **Step 4: Inspect the final branch state**

Run:

```powershell
git status --short --branch
git log -6 --oneline --decorate
```

Expected: a clean `codex/noir-prismatic-glass` worktree with only local commits and no push, merge, or deployment.
