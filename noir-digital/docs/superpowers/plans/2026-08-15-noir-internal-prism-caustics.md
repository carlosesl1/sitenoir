# NOIR Internal Prism Caustics Implementation Plan

> **For agentic workers:** Execute directly by default. Use subagents only for independent bounded lanes that satisfy the global harness policy. Steps use checkbox (\`- [ ]\`) syntax for tracking.

**Goal:** Replace the edge-only prism experiment at /glass-prism-test with dark transparent glass, white rims and localized RGB caustics inside the NOIR faces, without changing the production home.

**Architecture:** The isolated route retains its model, camera and black backdrop. MeshPhysicalMaterial becomes the neutral dark-glass base. A second mesh with the same geometry renders a planar local-space shader overlay; it generates nine warped monochrome caustic lobes, samples them three times along one shared diagonal, then assigns the approved RGB palette. The existing rim mesh renders last. No FBO, post-process, pointer light, new package or home file is used.

**Tech Stack:** Next.js 16, React 19, React Three Fiber 9, Three.js 0.185, GLSL ShaderMaterial, MeshPhysicalMaterial, Vitest, Biome, TypeScript, Playwright CLI.

---

## File map

| File | Responsibility |
| --- | --- |
| scene/physical-prism-caustics-config.ts | Immutable lobe layout, palette, bounded constants and responsive intensity. |
| scene/physical-prism-caustics-config.test.ts | Configuration/source-boundary tests. |
| scene/physical-prism-caustics-shaders.ts | Local-space vertex shader and warped caustic fragment shader. |
| scene/PhysicalPrismCausticsOverlay.tsx | Owns overlay uniforms, geometry bounds and reduced-motion time updates. |
| scene/PhysicalPrismGlassAsset.tsx | Composes base glass → caustics → rim. |
| scene/physical-prism-environment.ts | Delete; belongs only to the rejected cubemap-refraction experiment. |
| scene/physical-prism-test-config.ts | Retains the glass-base and responsive scene-frame values. |

## Task 1: Define the optical art-direction contract

**Files:**

- Create: scene/physical-prism-caustics-config.ts
- Create: scene/physical-prism-caustics-config.test.ts

- [ ] **Step 1: Write the failing configuration test**

~~~ts
import { describe, expect, it } from "vitest";

import {
  PHYSICAL_PRISM_CAUSTICS_CONFIG,
  resolvePhysicalPrismCausticsIntensity,
} from "@/scene/physical-prism-caustics-config";

describe("physical prism caustic art direction", () => {
  it("uses nine irregular lobes on one coherent optical direction", () => {
    expect(PHYSICAL_PRISM_CAUSTICS_CONFIG.lobes).toHaveLength(9);
    expect(PHYSICAL_PRISM_CAUSTICS_CONFIG.lightAngle).toBeCloseTo(0.61, 2);
    for (const lobe of PHYSICAL_PRISM_CAUSTICS_CONFIG.lobes) {
      expect(lobe.angleOffset).toBeGreaterThanOrEqual(-0.0524);
      expect(lobe.angleOffset).toBeLessThanOrEqual(0.0524);
      expect(lobe.radius[0]).toBeGreaterThan(0);
      expect(lobe.radius[1]).toBeGreaterThan(0);
      expect(lobe.strength).toBeGreaterThan(0);
    }
  });

  it("uses the approved palette without broad white centres", () => {
    expect(PHYSICAL_PRISM_CAUSTICS_CONFIG.palette).toEqual({
      blue: "#03357C",
      green: "#21D344",
      red: "#d23012",
      yellow: "#FCE609",
    });
    expect(PHYSICAL_PRISM_CAUSTICS_CONFIG.whiteCoreStrength).toBeLessThanOrEqual(0.08);
  });

  it("keeps the field visible but softer on mobile", () => {
    expect(resolvePhysicalPrismCausticsIntensity(1440)).toBe(0.88);
    expect(resolvePhysicalPrismCausticsIntensity(390)).toBe(0.68);
  });
});
~~~

- [ ] **Step 2: Prove the test is red**

Run:

~~~powershell
npx vitest run scene/physical-prism-caustics-config.test.ts --maxWorkers=4 --reporter=verbose
~~~

Expected: module-resolution failure for the new configuration module.

- [ ] **Step 3: Add the configuration**

~~~ts
export interface PhysicalPrismCausticLobe {
  readonly angleOffset: number;
  readonly center: readonly [number, number];
  readonly radius: readonly [number, number];
  readonly seed: number;
  readonly softness: number;
  readonly strength: number;
}

export const PHYSICAL_PRISM_CAUSTICS_CONFIG = {
  desktopIntensity: 0.88,
  driftSpeed: 0.014,
  lightAngle: 0.61,
  mobileBreakpoint: 768,
  mobileIntensity: 0.68,
  palette: { blue: "#03357C", green: "#21D344", red: "#d23012", yellow: "#FCE609" },
  separation: 0.022,
  surfaceOpacity: 0.92,
  whiteCoreStrength: 0.06,
  lobes: [
    { angleOffset: -0.03, center: [0.09, 0.62], radius: [0.11, 0.055], seed: 0.11, softness: 0.78, strength: 0.78 },
    { angleOffset: 0.01, center: [0.21, 0.39], radius: [0.08, 0.035], seed: 0.23, softness: 0.83, strength: 0.46 },
    { angleOffset: -0.02, center: [0.34, 0.59], radius: [0.13, 0.062], seed: 0.37, softness: 0.72, strength: 0.86 },
    { angleOffset: 0.03, center: [0.46, 0.32], radius: [0.09, 0.04], seed: 0.43, softness: 0.86, strength: 0.48 },
    { angleOffset: 0, center: [0.5, 0.73], radius: [0.14, 0.058], seed: 0.58, softness: 0.75, strength: 0.82 },
    { angleOffset: -0.04, center: [0.62, 0.49], radius: [0.1, 0.046], seed: 0.67, softness: 0.81, strength: 0.62 },
    { angleOffset: 0.02, center: [0.71, 0.68], radius: [0.12, 0.052], seed: 0.74, softness: 0.74, strength: 0.76 },
    { angleOffset: -0.01, center: [0.82, 0.42], radius: [0.08, 0.036], seed: 0.86, softness: 0.88, strength: 0.43 },
    { angleOffset: 0.04, center: [0.93, 0.62], radius: [0.1, 0.044], seed: 0.97, softness: 0.8, strength: 0.66 },
  ] satisfies readonly PhysicalPrismCausticLobe[],
} as const;

export function resolvePhysicalPrismCausticsIntensity(viewportWidth: number): number {
  return viewportWidth < PHYSICAL_PRISM_CAUSTICS_CONFIG.mobileBreakpoint
    ? PHYSICAL_PRISM_CAUSTICS_CONFIG.mobileIntensity
    : PHYSICAL_PRISM_CAUSTICS_CONFIG.desktopIntensity;
}
~~~

- [ ] **Step 4: Run green test and format**

~~~powershell
npx vitest run scene/physical-prism-caustics-config.test.ts --maxWorkers=4 --reporter=verbose
npx biome check scene/physical-prism-caustics-config.ts scene/physical-prism-caustics-config.test.ts
~~~

Expected: three passing tests and no Biome findings.

- [ ] **Step 5: Commit**

~~~powershell
git add -- scene/physical-prism-caustics-config.ts scene/physical-prism-caustics-config.test.ts
git commit -m "feat(hero): define internal prism caustics"
~~~

## Task 2: Create the local-space caustic shader

**Files:**

- Create: scene/physical-prism-caustics-shaders.ts
- Modify: scene/physical-prism-caustics-config.test.ts

- [ ] **Step 1: Add the failing shader-boundary test**

~~~ts
it("keeps caustics local, bounded and independent from pointer/FBO input", () => {
  const source = readFileSync(join(process.cwd(), "scene/physical-prism-caustics-shaders.ts"), "utf8");
  expect(source).toContain("uPlanarMin");
  expect(source).toContain("uPlanarSize");
  expect(source).toContain("causticField");
  expect(source).toContain("uTime");
  expect(source).not.toContain("uPointer");
  expect(source).not.toContain("WebGLRenderTarget");
});
~~~

- [ ] **Step 2: Prove the test is red**

~~~powershell
npx vitest run scene/physical-prism-caustics-config.test.ts --maxWorkers=4 --reporter=verbose
~~~

Expected: shader module is missing.

- [ ] **Step 3: Implement the shaders**

The vertex shader must anchor the pattern in local XY coordinates:

~~~glsl
uniform vec2 uPlanarMin;
uniform vec2 uPlanarSize;
varying vec2 vPlanarUv;
varying vec3 vViewDirection;
varying vec3 vViewNormal;

void main() {
  vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
  vPlanarUv = (position.xy - uPlanarMin) / max(uPlanarSize, vec2(0.0001));
  vViewDirection = normalize(-viewPosition.xyz);
  vViewNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * viewPosition;
}
~~~

The fragment shader must expose these helpers:

~~~glsl
float hash21(vec2 point);
float valueNoise(vec2 point);
float warpedEllipse(vec2 uv, vec2 center, vec2 radius, float angle, float seed, float softness);
float causticField(vec2 uv);
vec3 prismPalette(float spectralPosition);
~~~

Compile the nine config lobes into causticField. It must remain scalar/monochrome; final colour takes three shifted samples along uLightDirection, maps them to red/yellow/green/blue, clamps overlap, gates output by dot(vViewNormal, vViewDirection), and writes alpha under uSurfaceOpacity. It must not create a white field core or a screen-space band.

- [ ] **Step 4: Run green test and format**

~~~powershell
npx vitest run scene/physical-prism-caustics-config.test.ts --maxWorkers=4 --reporter=verbose
npx biome check scene/physical-prism-caustics-shaders.ts scene/physical-prism-caustics-config.test.ts
~~~

- [ ] **Step 5: Commit**

~~~powershell
git add -- scene/physical-prism-caustics-shaders.ts scene/physical-prism-caustics-config.test.ts
git commit -m "feat(hero): add procedural internal prism shader"
~~~

## Task 3: Mount one transparent caustic overlay

**Files:**

- Create: scene/PhysicalPrismCausticsOverlay.tsx
- Modify: scene/physical-prism-caustics-config.test.ts

- [ ] **Step 1: Add the failing component boundary test**

~~~ts
it("mounts a single reduced-motion-aware overlay", () => {
  const source = readFileSync(join(process.cwd(), "scene/PhysicalPrismCausticsOverlay.tsx"), "utf8");
  expect(source).toContain("useReducedMotion");
  expect(source).toContain("useFrame");
  expect(source).toContain("depthWrite={false}");
  expect(source).toContain("renderOrder={2}");
  expect(source).not.toContain("useHeroRefraction");
  expect(source).not.toContain("uPointer");
});
~~~

- [ ] **Step 2: Prove the test is red**

~~~powershell
npx vitest run scene/physical-prism-caustics-config.test.ts --maxWorkers=4 --reporter=verbose
~~~

Expected: overlay file is missing.

- [ ] **Step 3: Implement PhysicalPrismCausticsOverlay**

~~~tsx
interface PhysicalPrismCausticsOverlayProps {
  readonly geometry: BufferGeometry;
}

export function PhysicalPrismCausticsOverlay({ geometry }: PhysicalPrismCausticsOverlayProps) {
  // Compute geometry.boundingBox once.
  // Supply uPlanarMin/uPlanarSize, lobe constants, palette and uTime.
  // Update only uTime and responsive intensity in useFrame.
  // Return a renderOrder={2} mesh with transparent ShaderMaterial.
}
~~~

Use NormalBlending, depthTest, depthWrite={false}, transparent, toneMapped={false} and polygon offset. Place it above the base (render order 1) and below the existing rim (render order 3). Dispose only the shader material; the parent remains the geometry owner. When reduced motion is on, leave uTime at zero.

- [ ] **Step 4: Run focused verification**

~~~powershell
npx vitest run scene/physical-prism-caustics-config.test.ts --maxWorkers=4 --reporter=verbose
npx biome check scene/PhysicalPrismCausticsOverlay.tsx scene/physical-prism-caustics-shaders.ts
npm run typecheck
~~~

- [ ] **Step 5: Commit**

~~~powershell
git add -- scene/PhysicalPrismCausticsOverlay.tsx scene/physical-prism-caustics-config.test.ts
git commit -m "feat(hero): mount internal caustic overlay"
~~~

## Task 4: Compose the isolated hybrid scene

**Files:**

- Modify: scene/PhysicalPrismGlassAsset.tsx
- Modify: scene/physical-prism-test-config.ts
- Modify: scene/physical-prism-test-config.test.ts
- Delete: scene/physical-prism-environment.ts

- [ ] **Step 1: Replace the current source-boundary assertion first**

~~~ts
it("uses the isolated hybrid stack rather than cubemap-only refraction", () => {
  const source = readFileSync(join(process.cwd(), "scene/PhysicalPrismGlassAsset.tsx"), "utf8");
  expect(source).toContain("meshPhysicalMaterial");
  expect(source).toContain("PhysicalPrismCausticsOverlay");
  expect(source).toContain("createHeroCanvasUiEnvironment");
  expect(source).not.toContain("MeshRefractionMaterial");
  expect(source).not.toContain("createPhysicalPrismEnvironment");
  expect(source).not.toContain("hero-canvas-ui-spectral-source");
});
~~~

- [ ] **Step 2: Prove the test is red**

~~~powershell
npx vitest run scene/physical-prism-test-config.test.ts --maxWorkers=4 --reporter=verbose
~~~

Expected: the old MeshRefractionMaterial source fails the assertions.

- [ ] **Step 3: Compose base, caustics and rim**

Replace the cubemap material with a neutral PMREM environment and this layer order:

~~~tsx
<mesh geometry={geometry} renderOrder={1}>
  <meshPhysicalMaterial
    clearcoat={1}
    clearcoatRoughness={0.035}
    color="#0a0c10"
    envMap={environment.texture}
    envMapIntensity={0.42}
    ior={1.58}
    metalness={0}
    opacity={1}
    roughness={0.075}
    thickness={3.6 / sceneScale}
    transmission={0.82}
  />
</mesh>
<PhysicalPrismCausticsOverlay geometry={geometry} />
<mesh geometry={geometry} renderOrder={3}>{/* unchanged rim material */}</mesh>
~~~

Use createHeroCanvasUiEnvironment(gl) and dispose it with the model. Delete physical-prism-environment.ts. Retain the isolated route/camera, idle motion and black background. Do not import HeroRefractionBuffer, production spectral sources or a pointer module.

- [ ] **Step 4: Run focused tests and static checks**

~~~powershell
npx vitest run app/glass-prism-test/page.test.tsx scene/physical-prism-test-config.test.ts scene/physical-prism-caustics-config.test.ts --maxWorkers=4 --reporter=verbose
npx biome check app/glass-prism-test/page.tsx components/glass-prism-test/PhysicalPrismTest.tsx scene/PhysicalPrismGlassAsset.tsx scene/PhysicalPrismCausticsOverlay.tsx scene/physical-prism-caustics-config.ts scene/physical-prism-caustics-shaders.ts scene/physical-prism-test-config.ts
npm run typecheck
~~~

- [ ] **Step 5: Commit**

~~~powershell
git add -- scene/PhysicalPrismGlassAsset.tsx scene/physical-prism-test-config.ts scene/physical-prism-test-config.test.ts scene/physical-prism-environment.ts
git commit -m "feat(hero): compose isolated internal prism caustics"
~~~

## Task 5: Validate visual result and isolate scope

**Files:**

- Modify only if visual evidence requires it: scene/physical-prism-caustics-config.ts

- [ ] **Step 1: Build the production output**

~~~powershell
npm run build
~~~

Expected: /glass-prism-test appears in the static route list.

- [ ] **Step 2: Capture desktop evidence**

Open http://127.0.0.1:3010/glass-prism-test at 1440 × 900 and save output/playwright/internal-prism-desktop.png. Verify dark/translucent glass, white rims, at least six irregular RGB regions inside the NOIR silhouette and one coherent up-right optical direction. Reject broad white centres and four repeated bands.

- [ ] **Step 3: Capture mobile evidence**

At 390 × 844, save output/playwright/internal-prism-mobile.png. Verify the model is wholly inside the viewport, the caustics remain visible but softer, and the canvas is not blank.

- [ ] **Step 4: Make at most one configuration-only visual tuning pass**

Allowed changes: lobe centres/radii/strength/softness, separation, surfaceOpacity, lightAngle and desktop/mobile intensity. Do not change shader, material stack, camera or any production-home file in this pass.

After tuning, run:

~~~powershell
npx vitest run scene/physical-prism-caustics-config.test.ts --maxWorkers=4 --reporter=verbose
npm run build
~~~

- [ ] **Step 5: Prove scope and commit tuning if any**

~~~powershell
git diff --name-only origin/main...HEAD
git status --short --branch
~~~

Expected: no changes to app/page.tsx, scene/HeroModel.tsx, scene/SiteCanvas.tsx, scene/HeroRefractionBuffer.tsx or scene/hero-canvas-ui-spectral-source*.

If Task 5 changed the configuration:

~~~powershell
git add -- scene/physical-prism-caustics-config.ts
git commit -m "fix(hero): tune isolated internal prism caustics"
~~~

## Final verification

- [ ] Run this once after the final code change:

~~~powershell
npx vitest run app/glass-prism-test/page.test.tsx scene/physical-prism-test-config.test.ts scene/physical-prism-caustics-config.test.ts --maxWorkers=4 --reporter=verbose
npx biome check app/glass-prism-test/page.tsx app/glass-prism-test/page.test.tsx components/glass-prism-test/PhysicalPrismTest.tsx components/glass-prism-test/PhysicalPrismTest.module.css scene/PhysicalPrismGlassAsset.tsx scene/PhysicalPrismCausticsOverlay.tsx scene/physical-prism-caustics-config.ts scene/physical-prism-caustics-config.test.ts scene/physical-prism-caustics-shaders.ts scene/physical-prism-test-config.ts scene/physical-prism-test-config.test.ts
npm run typecheck
npm run build
~~~

- [ ] Report the localhost route, desktop/mobile visual result, commits and any known mismatch with the reference. Do not publish, merge or integrate the home without a separate request.

