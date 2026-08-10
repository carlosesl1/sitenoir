# Canvas UI Screen-Space Dispersion Implementation Plan

> **For agentic workers:** Execute directly by default. Use subagents only for independent bounded lanes that satisfy the global harness policy. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the rejected additive RGB overlay with neutral transparent glass whose localized spectrum comes from wavelength-dependent refraction of the real hero background.

**Architecture:** `HeroCanvasUiGlassAsset` will render one mesh with Drei's `MeshTransmissionMaterial`. The material will consume the existing `HeroRefractionBuffer` texture through `useHeroRefraction()`, so its per-channel IOR sampling refracts the real background without another full-scene capture. The old spectrum shader, material, config, layer factory, and tests will be deleted.

**Tech Stack:** Next.js 16, React 19, React Three Fiber 9, Three.js 0.185, `@react-three/drei` 10.7.8, TypeScript, Vitest, Biome, Webpack production build

---

## File structure

- Modify `package.json`: add the exact compatible Drei runtime dependency.
- Modify `package-lock.json`: lock Drei and its transitive dependencies.
- Modify `scene/hero-canvas-ui-glass-config.ts`: own only the neutral transmission and chromatic-aberration tuning plus scale-corrected thickness.
- Modify `scene/hero-canvas-ui-glass-config.test.ts`: verify the optical bounds and thickness calculation.
- Create `scene/hero-canvas-ui-glass.test.ts`: verify the component's single-material/external-buffer contract and the complete removal of the rejected overlay.
- Modify `scene/HeroCanvasUiGlassAsset.tsx`: mount one `MeshTransmissionMaterial`, pass the shared refraction texture, and preserve the existing PMREM environment and geometry lifecycle.
- Delete `scene/hero-canvas-ui-spectrum-config.ts`: remove rejected additive-spectrum tuning.
- Delete `scene/hero-canvas-ui-spectrum-shaders.ts`: remove rejected procedural RGB shader.
- Delete `scene/hero-canvas-ui-spectrum-material.ts`: remove rejected additive material factory.
- Delete `scene/hero-canvas-ui-spectrum-layers.ts`: remove rejected two-mesh layer factory.
- Delete `scene/hero-canvas-ui-spectrum.test.ts`: replace obsolete overlay assertions with the new material contract.

No change is planned for `HeroGlassAsset`, `HeroRefractionBuffer`, `HeroModel`, the GLB, layout, motion, stickers, or the default variant.

### Task 1: Define the neutral optical tuning contract

**Files:**
- Modify: `scene/hero-canvas-ui-glass-config.test.ts`
- Modify: `scene/hero-canvas-ui-glass-config.ts`

- [ ] **Step 1: Write the failing configuration tests**

Replace `scene/hero-canvas-ui-glass-config.test.ts` with:

```ts
import { describe, expect, it } from "vitest";

import {
  HERO_CANVAS_UI_GLASS_CONFIG,
  resolveHeroCanvasUiThickness,
} from "@/scene/hero-canvas-ui-glass-config";

describe("Canvas UI hero glass configuration", () => {
  it("keeps the glass neutral while bounding chromatic refraction", () => {
    expect(HERO_CANVAS_UI_GLASS_CONFIG).toMatchObject({
      anisotropicBlur: 0.04,
      backside: false,
      chromaticAberration: 0.055,
      clearcoat: 0.5,
      clearcoatRoughness: 0.06,
      dispersion: 1.5,
      environmentBlur: 0.04,
      environmentIntensity: 1,
      highlight: "#066aff",
      ior: 1.58,
      roughness: 0.08,
      samples: 6,
      thickness: 4,
      transmission: 1,
    });
    expect(HERO_CANVAS_UI_GLASS_CONFIG.chromaticAberration).toBeGreaterThanOrEqual(0.04);
    expect(HERO_CANVAS_UI_GLASS_CONFIG.chromaticAberration).toBeLessThanOrEqual(0.07);
    expect(HERO_CANVAS_UI_GLASS_CONFIG.ior).toBeGreaterThanOrEqual(1.5);
    expect(HERO_CANVAS_UI_GLASS_CONFIG.ior).toBeLessThanOrEqual(1.65);
    expect(HERO_CANVAS_UI_GLASS_CONFIG.roughness).toBeLessThanOrEqual(0.12);
    expect(HERO_CANVAS_UI_GLASS_CONFIG.samples).toBeLessThanOrEqual(6);
  });

  it("keeps optical thickness stable after the parent scene scale", () => {
    expect(resolveHeroCanvasUiThickness(2)).toBe(2);
    expect(resolveHeroCanvasUiThickness(0.5)).toBe(8);
    expect(resolveHeroCanvasUiThickness(-2)).toBe(2);
    expect(resolveHeroCanvasUiThickness(0)).toBe(40_000);
  });
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```powershell
npm test -- scene/hero-canvas-ui-glass-config.test.ts
```

Expected: FAIL because `anisotropicBlur`, `backside`, `chromaticAberration`, `samples`, and `resolveHeroCanvasUiThickness` do not exist, while the old `dispersion` field still exists.

- [ ] **Step 3: Implement the minimal tuning contract**

Replace `scene/hero-canvas-ui-glass-config.ts` with:

```ts
export const HERO_CANVAS_UI_GLASS_CONFIG = {
  anisotropicBlur: 0.04,
  backside: false,
  chromaticAberration: 0.055,
  clearcoat: 0.5,
  clearcoatRoughness: 0.06,
  dispersion: 1.5,
  environmentBlur: 0.04,
  environmentIntensity: 1,
  highlight: "#066aff",
  ior: 1.58,
  roughness: 0.08,
  samples: 6,
  thickness: 4,
  transmission: 1,
} as const;

export function resolveHeroCanvasUiThickness(sceneScale: number): number {
  return HERO_CANVAS_UI_GLASS_CONFIG.thickness / Math.max(Math.abs(sceneScale), 0.0001);
}
```

- [ ] **Step 4: Run the focused test and verify GREEN**

Run:

```powershell
npm test -- scene/hero-canvas-ui-glass-config.test.ts
```

Then run:

```powershell
npm run typecheck
```

Expected: 2 tests pass and TypeScript exits 0. The temporary `dispersion` compatibility field keeps the still-mounted physical material valid until Task 2 replaces it atomically.

- [ ] **Step 5: Commit the optical contract**

Run:

```powershell
git add -- scene/hero-canvas-ui-glass-config.ts scene/hero-canvas-ui-glass-config.test.ts
git diff --cached --check
git commit -m "test(hero): define neutral Canvas UI dispersion"
```

Expected: one commit containing only the config and its focused test.

### Task 2: Replace the additive overlay with one externally buffered transmission material

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `scene/hero-canvas-ui-glass-config.ts`
- Create: `scene/hero-canvas-ui-glass.test.ts`
- Modify: `scene/HeroCanvasUiGlassAsset.tsx`
- Delete: `scene/hero-canvas-ui-spectrum-config.ts`
- Delete: `scene/hero-canvas-ui-spectrum-shaders.ts`
- Delete: `scene/hero-canvas-ui-spectrum-material.ts`
- Delete: `scene/hero-canvas-ui-spectrum-layers.ts`
- Delete: `scene/hero-canvas-ui-spectrum.test.ts`

- [ ] **Step 1: Write the failing source and cleanup contract test**

Create `scene/hero-canvas-ui-glass.test.ts`:

```ts
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const componentPath = join(process.cwd(), "scene/HeroCanvasUiGlassAsset.tsx");
const configPath = join(process.cwd(), "scene/hero-canvas-ui-glass-config.ts");
const rejectedOverlayPaths = [
  "scene/hero-canvas-ui-spectrum-config.ts",
  "scene/hero-canvas-ui-spectrum-shaders.ts",
  "scene/hero-canvas-ui-spectrum-material.ts",
  "scene/hero-canvas-ui-spectrum-layers.ts",
  "scene/hero-canvas-ui-spectrum.test.ts",
];

describe("Canvas UI hero glass integration", () => {
  it("uses one transmission material with the existing refraction buffer", () => {
    const source = readFileSync(componentPath, "utf8");
    const configSource = readFileSync(configPath, "utf8");

    expect(source).toContain('import { MeshTransmissionMaterial } from "@react-three/drei";');
    expect(source).toContain('import { useHeroRefraction } from "@/scene/HeroRefractionBuffer";');
    expect(source).toContain("const { texture } = useHeroRefraction();");
    expect(source).toContain("buffer={texture}");
    expect(source.match(/<mesh\b/g)).toHaveLength(1);
    expect(source.match(/<MeshTransmissionMaterial\b/g)).toHaveLength(1);
    expect(source).not.toContain("createHeroCanvasUiSpectrum");
    expect(configSource).not.toContain("dispersion:");
  });

  it("declares the compatible Drei version as a runtime dependency", () => {
    const packageJson = JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf8"));

    expect(packageJson.dependencies["@react-three/drei"]).toBe("10.7.8");
  });

  it("removes every rejected additive-spectrum module", () => {
    for (const relativePath of rejectedOverlayPaths) {
      expect(existsSync(join(process.cwd(), relativePath)), relativePath).toBe(false);
    }
  });
});
```

- [ ] **Step 2: Run the new test and verify RED**

Run:

```powershell
npm test -- scene/hero-canvas-ui-glass.test.ts
```

Expected: 3 tests fail because the component still imports the additive overlay, Drei is absent, and all rejected files still exist.

- [ ] **Step 3: Install the exact compatible Drei dependency**

Run:

```powershell
npm install --save-exact @react-three/drei@10.7.8
```

Expected: `package.json` contains `"@react-three/drei": "10.7.8"`, `package-lock.json` is updated, and npm reports no unresolved peer conflict with React 19, R3F 9, or Three.js 0.185.

- [ ] **Step 4: Replace the Canvas UI asset with the single-material implementation**

Replace `scene/HeroCanvasUiGlassAsset.tsx` with:

```tsx
"use client";

import { MeshTransmissionMaterial } from "@react-three/drei";
import { useLoader, useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo } from "react";
import {
  Color,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  PMREMGenerator,
  RingGeometry,
  type WebGLRenderTarget,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import { HERO_MODEL_SOURCE } from "@/scene/critical-hero-preload";
import { useHeroRefraction } from "@/scene/HeroRefractionBuffer";
import {
  HERO_CANVAS_UI_GLASS_CONFIG as config,
  resolveHeroCanvasUiThickness,
} from "@/scene/hero-canvas-ui-glass-config";
import { HERO_GLASS_CONFIG } from "@/scene/hero-glass-config";
import { createHeroModelGeometry } from "@/scene/hero-model-geometry";

interface HeroCanvasUiGlassAssetProps {
  readonly reducedMotion: boolean;
  readonly sceneScale: number;
}

export function HeroCanvasUiGlassAsset({ sceneScale }: HeroCanvasUiGlassAssetProps) {
  const source = useLoader(GLTFLoader, HERO_MODEL_SOURCE);
  const gl = useThree((state) => state.gl);
  const { texture } = useHeroRefraction();
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
    const target = pmrem.fromScene(room, config.environmentBlur, 0.1, 1000);
    room.dispose();
    pmrem.dispose();
    return target;
  }, [gl]);

  useLayoutEffect(() => () => geometry.dispose(), [geometry]);
  useLayoutEffect(() => () => environment.dispose(), [environment]);

  return (
    <mesh
      geometry={geometry}
      onUpdate={(mesh) => mesh.layers.set(HERO_GLASS_CONFIG.renderLayer)}
    >
      <MeshTransmissionMaterial
        anisotropicBlur={config.anisotropicBlur}
        backside={config.backside}
        buffer={texture}
        chromaticAberration={config.chromaticAberration}
        clearcoat={config.clearcoat}
        clearcoatRoughness={config.clearcoatRoughness}
        color="#ffffff"
        envMap={environment.texture}
        envMapIntensity={config.environmentIntensity}
        ior={config.ior}
        roughness={config.roughness}
        samples={config.samples}
        thickness={resolveHeroCanvasUiThickness(sceneScale)}
        transmission={config.transmission}
      />
    </mesh>
  );
}
```

- [ ] **Step 5: Remove the temporary physical dispersion field and rejected overlay**

Remove the compatibility-only field from `scene/hero-canvas-ui-glass-config.ts`:

```diff
-  dispersion: 1.5,
```

Delete these files with one `apply_patch` operation:

```text
scene/hero-canvas-ui-spectrum-config.ts
scene/hero-canvas-ui-spectrum-shaders.ts
scene/hero-canvas-ui-spectrum-material.ts
scene/hero-canvas-ui-spectrum-layers.ts
scene/hero-canvas-ui-spectrum.test.ts
```

Expected: `rg -n "hero-canvas-ui-spectrum|createHeroCanvasUiSpectrum|dispersion:" scene` returns no matches.

- [ ] **Step 6: Run the material contract tests and verify GREEN**

Run:

```powershell
npm test -- scene/hero-canvas-ui-glass-config.test.ts scene/hero-canvas-ui-glass.test.ts scene/hero-glass-variant.test.ts app/glass-test/page.test.tsx scene/LazySiteCanvas.test.tsx
```

Expected: all focused tests pass; no test imports the deleted overlay modules.

- [ ] **Step 7: Verify types before committing**

Run:

```powershell
npm run typecheck
```

Expected: TypeScript exits 0 with the installed Drei 10.7.8 declarations.

- [ ] **Step 8: Commit the material replacement**

Run:

```powershell
git add -- package.json package-lock.json scene/HeroCanvasUiGlassAsset.tsx scene/hero-canvas-ui-glass-config.ts scene/hero-canvas-ui-glass.test.ts scene/hero-canvas-ui-spectrum-config.ts scene/hero-canvas-ui-spectrum-shaders.ts scene/hero-canvas-ui-spectrum-material.ts scene/hero-canvas-ui-spectrum-layers.ts scene/hero-canvas-ui-spectrum.test.ts
git diff --cached --check
git commit -m "feat(hero): use natural Canvas UI dispersion"
```

Expected: one commit containing the dependency, one-material component, new contract test, and all overlay deletions.

### Task 3: Calibrate the natural spectrum in the comparison route

**Files:**
- Modify only if visual evidence requires it: `scene/hero-canvas-ui-glass-config.ts`
- Test after tuning: `scene/hero-canvas-ui-glass-config.test.ts`

- [ ] **Step 1: Open the isolated comparison and Canvas UI home**

Keep the existing localhost server running and inspect these URLs with the collaborative preview, beginning with its status/open flow:

```text
http://127.0.0.1:3000/glass-test
http://127.0.0.1:3000/?effects=full&glass=canvas-ui
```

Capture one desktop screenshot of `/glass-test` and one mobile screenshot of the Canvas UI home. Confirm the **ATUAL** iframe remains unchanged before judging the new panel.

- [ ] **Step 2: Evaluate against the rejection-specific visual checks**

The result passes only when all statements are true:

```text
1. Front faces are neutral and the background remains visible.
2. There is no persistent pink or purple fill.
3. There is no uniform RGB outline around every edge.
4. Color appears locally where contrasting background details bend through the glass.
5. White highlights and bevel depth remain legible.
6. Motion changes the refracted spectrum without an autonomous color animation.
```

- [ ] **Step 3: Apply at most one controlled tuning change per observed defect**

Use only these bounded replacements in `HERO_CANVAS_UI_GLASS_CONFIG`, then update the exact expectation in its test:

```ts
// If color is too strong or reads as a colored border:
chromaticAberration: 0.04,

// If the glass is neutral but the localized split is imperceptible:
chromaticAberration: 0.07,

// If faces are gray or frosted instead of clear:
roughness: 0.05,

// If highlights look noisy while transparency is already correct:
anisotropicBlur: 0.06,
```

Do not add tint, emissive color, outline, additive blending, a second mesh, or another framebuffer. Reload both viewports after each single change and retain only evidence-backed adjustments.

- [ ] **Step 4: Re-run the focused tests after the final tuning value**

Run:

```powershell
npm test -- scene/hero-canvas-ui-glass-config.test.ts scene/hero-canvas-ui-glass.test.ts
```

Expected: 5 tests pass with the exact final values.

- [ ] **Step 5: Commit visual tuning only if values changed**

If Step 3 changed the initial configuration, run:

```powershell
git add -- scene/hero-canvas-ui-glass-config.ts scene/hero-canvas-ui-glass-config.test.ts
git diff --cached --check
git commit -m "fix(hero): tune natural Canvas UI dispersion"
```

Expected: a small config-and-test-only commit. If the initial values pass all visual checks, skip this commit.

### Task 4: Run final integration proof and preserve branch isolation

**Files:**
- Verify: all changed files
- Restore only if generated tooling changes it: `next-env.d.ts`

- [ ] **Step 1: Run the focused regression suite**

Run:

```powershell
npm test -- scene/hero-canvas-ui-glass-config.test.ts scene/hero-canvas-ui-glass.test.ts scene/hero-glass-variant.test.ts app/glass-test/page.test.tsx scene/LazySiteCanvas.test.tsx scene/hero-model-geometry.test.ts
```

Expected: all selected tests pass.

- [ ] **Step 2: Run static checks**

Run:

```powershell
npm run typecheck
npx biome check package.json scene/HeroCanvasUiGlassAsset.tsx scene/hero-canvas-ui-glass-config.ts scene/hero-canvas-ui-glass-config.test.ts scene/hero-canvas-ui-glass.test.ts
```

Expected: both commands exit 0 without changing production files.

- [ ] **Step 3: Run the production build**

Run:

```powershell
npm run build -- --webpack
```

Expected: Next.js production build exits 0 and includes `/glass-test` and `/` in the route output.

- [ ] **Step 4: Normalize the generated Next.js route reference if necessary**

If `git diff -- next-env.d.ts` shows `.next/dev/types/routes.d.ts`, restore the tracked production form with `apply_patch`:

```ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />
import "./.next/types/routes.d.ts";

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.
```

Expected: `next-env.d.ts` has no final diff.

- [ ] **Step 5: Inspect the final branch state**

Run:

```powershell
git status --short --branch
git diff --check
git log -4 --oneline
```

Expected: the worktree is clean, the current branch is `codex/noir-prismatic-glass`, the new config/material commits are present, and no push, merge, deployment, or production cache action has occurred.
