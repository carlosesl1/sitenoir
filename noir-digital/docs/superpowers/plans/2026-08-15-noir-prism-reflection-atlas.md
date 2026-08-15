# NOIR Reflection Atlas Implementation Plan

> **For agentic workers:** Execute directly by default. Use subagents only for independent bounded lanes that satisfy the global harness policy. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the isolated procedural prism caustics with one compact, alpha-masked WebP reflection atlas that reads as art-directed internal glass reflections.

**Architecture:** The existing `PhysicalPrismGlassAsset` remains a three-layer composition: dark physical glass, one texture-backed overlay and the existing white rim. `PhysicalPrismReflectionAtlas` owns local XY bounds, texture configuration and the overlay material; its fragment shader samples one atlas image and rejects low-luminance or low-saturation residual pixels. The production home is not imported or modified.

**Tech Stack:** Next.js 16, React 19, React Three Fiber 9, Three.js 0.185, GLSL `ShaderMaterial`, WebP alpha texture, Vitest, Biome, TypeScript and Playwright CLI.

---

## File map

| File | Responsibility |
| --- | --- |
| `public/assets/v1/textures/noir-prism-reflections-atlas-v1.webp` | 75,628-byte alpha atlas containing nine art-directed RGB reflections. |
| `scene/physical-prism-reflection-atlas-config.ts` | Asset URL, masking thresholds and responsive overlay opacity. |
| `scene/physical-prism-reflection-atlas-config.test.ts` | Asset/configuration and source-boundary checks. |
| `scene/physical-prism-reflection-atlas-shaders.ts` | Local planar UV vertex shader and alpha/luminance/saturation fragment shader. |
| `scene/PhysicalPrismReflectionAtlas.tsx` | Loads/configures the texture and mounts the render-order-two overlay. |
| `scene/PhysicalPrismGlassAsset.tsx` | Replaces the procedural overlay import with the atlas overlay. |
| `scene/physical-prism-test-config.test.ts` | Asserts the isolated hybrid stack uses the atlas, not procedural caustics. |
| `scene/PhysicalPrismCausticsOverlay.tsx` | Delete; superseded experimental overlay. |
| `scene/physical-prism-caustics-config.ts` | Delete; lobe map is no longer consumed. |
| `scene/physical-prism-caustics-config.test.ts` | Delete; procedural contract is no longer relevant. |
| `scene/physical-prism-caustics-shaders.ts` | Delete; the lobe shader is no longer used. |

## Task 1: Define and prove the reflection-atlas contract

**Files:**

- Create: `scene/physical-prism-reflection-atlas-config.ts`
- Create: `scene/physical-prism-reflection-atlas-config.test.ts`
- Add: `public/assets/v1/textures/noir-prism-reflections-atlas-v1.webp`

- [ ] **Step 1: Write the failing test**

```ts
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  PHYSICAL_PRISM_REFLECTION_ATLAS_CONFIG,
  resolvePhysicalPrismReflectionAtlasOpacity,
} from "@/scene/physical-prism-reflection-atlas-config";

describe("physical prism reflection atlas", () => {
  it("uses one compact local WebP asset", () => {
    const relativeAsset = PHYSICAL_PRISM_REFLECTION_ATLAS_CONFIG.assetUrl.replace(/^\//, "");
    const asset = join(process.cwd(), "public", relativeAsset.replace(/^assets\//, "assets/"));

    expect(PHYSICAL_PRISM_REFLECTION_ATLAS_CONFIG.assetUrl).toBe(
      "/assets/v1/textures/noir-prism-reflections-atlas-v1.webp",
    );
    expect(existsSync(asset)).toBe(true);
    expect(statSync(asset).size).toBeLessThan(100_000);
  });

  it("keeps saturated reflections visible and softer on mobile", () => {
    expect(PHYSICAL_PRISM_REFLECTION_ATLAS_CONFIG.luminanceStart).toBeLessThan(
      PHYSICAL_PRISM_REFLECTION_ATLAS_CONFIG.luminanceEnd,
    );
    expect(PHYSICAL_PRISM_REFLECTION_ATLAS_CONFIG.saturationStart).toBeLessThan(
      PHYSICAL_PRISM_REFLECTION_ATLAS_CONFIG.saturationEnd,
    );
    expect(resolvePhysicalPrismReflectionAtlasOpacity(1440)).toBe(0.76);
    expect(resolvePhysicalPrismReflectionAtlasOpacity(390)).toBe(0.6);
  });
});
```

- [ ] **Step 2: Run the test red**

Run:

```powershell
npx vitest run scene/physical-prism-reflection-atlas-config.test.ts --maxWorkers=4 --reporter=verbose
```

Expected: module-resolution error for `physical-prism-reflection-atlas-config`.

- [ ] **Step 3: Add the immutable asset configuration**

```ts
export const PHYSICAL_PRISM_REFLECTION_ATLAS_CONFIG = {
  assetUrl: "/assets/v1/textures/noir-prism-reflections-atlas-v1.webp",
  desktopOpacity: 0.76,
  luminanceEnd: 0.22,
  luminanceStart: 0.045,
  mobileBreakpoint: 768,
  mobileOpacity: 0.6,
  saturationEnd: 0.16,
  saturationStart: 0.025,
} as const;

export function resolvePhysicalPrismReflectionAtlasOpacity(viewportWidth: number): number {
  return viewportWidth < PHYSICAL_PRISM_REFLECTION_ATLAS_CONFIG.mobileBreakpoint
    ? PHYSICAL_PRISM_REFLECTION_ATLAS_CONFIG.mobileOpacity
    : PHYSICAL_PRISM_REFLECTION_ATLAS_CONFIG.desktopOpacity;
}
```

- [ ] **Step 4: Run the contract green**

Run:

```powershell
npx vitest run scene/physical-prism-reflection-atlas-config.test.ts --maxWorkers=4 --reporter=verbose
npx biome check scene/physical-prism-reflection-atlas-config.ts scene/physical-prism-reflection-atlas-config.test.ts
```

Expected: two passing tests and no Biome findings.

- [ ] **Step 5: Commit**

```powershell
git add -- public/assets/v1/textures/noir-prism-reflections-atlas-v1.webp scene/physical-prism-reflection-atlas-config.ts scene/physical-prism-reflection-atlas-config.test.ts
git commit -m "feat(hero): add isolated reflection atlas asset"
```

## Task 2: Render the atlas only inside the glass faces

**Files:**

- Create: `scene/physical-prism-reflection-atlas-shaders.ts`
- Create: `scene/PhysicalPrismReflectionAtlas.tsx`
- Modify: `scene/physical-prism-reflection-atlas-config.test.ts`

- [ ] **Step 1: Extend the test with source boundaries**

```ts
it("uses one local texture overlay without procedural lobes or pointer input", () => {
  const component = readFileSync(
    join(process.cwd(), "scene/PhysicalPrismReflectionAtlas.tsx"),
    "utf8",
  );
  const shader = readFileSync(
    join(process.cwd(), "scene/physical-prism-reflection-atlas-shaders.ts"),
    "utf8",
  );

  expect(component).toContain("TextureLoader");
  expect(component).toContain("depthWrite={false}");
  expect(component).toContain("renderOrder={2}");
  expect(component).not.toContain("useFrame");
  expect(shader).toContain("uReflectionMap");
  expect(shader).toContain("saturation");
  expect(shader).not.toContain("causticField");
  expect(shader).not.toContain("uPointer");
  expect(shader).not.toContain("WebGLRenderTarget");
});
```

Add these imports above the existing test imports:

```ts
import { readFileSync } from "node:fs";
```

- [ ] **Step 2: Run the test red**

Run:

```powershell
npx vitest run scene/physical-prism-reflection-atlas-config.test.ts --maxWorkers=4 --reporter=verbose
```

Expected: missing overlay source file.

- [ ] **Step 3: Add local-space shaders**

```ts
export const PHYSICAL_PRISM_REFLECTION_ATLAS_VERTEX_SHADER = /* glsl */ `
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
`;

export const PHYSICAL_PRISM_REFLECTION_ATLAS_FRAGMENT_SHADER = /* glsl */ `
uniform sampler2D uReflectionMap;
uniform float uLuminanceEnd;
uniform float uLuminanceStart;
uniform float uOpacity;
uniform float uSaturationEnd;
uniform float uSaturationStart;
varying vec2 vPlanarUv;
varying vec3 vViewDirection;
varying vec3 vViewNormal;

void main() {
  vec4 sampled = texture2D(uReflectionMap, vPlanarUv);
  float luminance = dot(sampled.rgb, vec3(0.2126, 0.7152, 0.0722));
  float saturation = max(max(sampled.r, sampled.g), sampled.b) - min(min(sampled.r, sampled.g), sampled.b);
  float coloredLight = smoothstep(uLuminanceStart, uLuminanceEnd, luminance);
  float chroma = smoothstep(uSaturationStart, uSaturationEnd, saturation);
  float facing = smoothstep(0.16, 0.88, max(dot(normalize(vViewNormal), normalize(vViewDirection)), 0.0));
  float alpha = sampled.a * coloredLight * chroma * facing * uOpacity;

  if (alpha < 0.003) discard;
  gl_FragColor = vec4(clamp(sampled.rgb, 0.0, 1.0), alpha);
}
`;
```

- [ ] **Step 4: Add the texture-backed component**

```tsx
"use client";

import { useLoader, useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo } from "react";
import {
  type BufferGeometry,
  NormalBlending,
  SRGBColorSpace,
  type Texture,
  TextureLoader,
  Vector2,
} from "three";

import {
  PHYSICAL_PRISM_REFLECTION_ATLAS_CONFIG as config,
  resolvePhysicalPrismReflectionAtlasOpacity,
} from "@/scene/physical-prism-reflection-atlas-config";
import {
  PHYSICAL_PRISM_REFLECTION_ATLAS_FRAGMENT_SHADER,
  PHYSICAL_PRISM_REFLECTION_ATLAS_VERTEX_SHADER,
} from "@/scene/physical-prism-reflection-atlas-shaders";

function createReflectionAtlasUniforms(geometry: BufferGeometry, texture: Texture) {
  geometry.computeBoundingBox();
  const bounds = geometry.boundingBox;
  if (!bounds) throw new Error("Physical prism geometry requires a bounding box");

  return {
    uLuminanceEnd: { value: config.luminanceEnd },
    uLuminanceStart: { value: config.luminanceStart },
    uOpacity: { value: Number(config.desktopOpacity) },
    uPlanarMin: { value: new Vector2(bounds.min.x, bounds.min.y) },
    uPlanarSize: { value: new Vector2(Math.max(bounds.max.x - bounds.min.x, 0.0001), Math.max(bounds.max.y - bounds.min.y, 0.0001)) },
    uReflectionMap: { value: texture },
    uSaturationEnd: { value: config.saturationEnd },
    uSaturationStart: { value: config.saturationStart },
  };
}

export function PhysicalPrismReflectionAtlas({ geometry }: { readonly geometry: BufferGeometry }) {
  const gl = useThree((state) => state.gl);
  const width = useThree((state) => state.size.width);
  const texture = useLoader(TextureLoader, config.assetUrl);
  const uniforms = useMemo(() => createReflectionAtlasUniforms(geometry, texture), [geometry, texture]);

  useLayoutEffect(() => {
    texture.anisotropy = gl.capabilities.getMaxAnisotropy();
    texture.colorSpace = SRGBColorSpace;
    texture.needsUpdate = true;
    return () => texture.dispose();
  }, [gl, texture]);

  useLayoutEffect(() => {
    uniforms.uOpacity.value = resolvePhysicalPrismReflectionAtlasOpacity(width);
  }, [uniforms, width]);

  return (
    <mesh geometry={geometry} renderOrder={2}>
      <shaderMaterial
        blending={NormalBlending}
        depthTest
        depthWrite={false}
        fragmentShader={PHYSICAL_PRISM_REFLECTION_ATLAS_FRAGMENT_SHADER}
        polygonOffset
        polygonOffsetFactor={-1}
        polygonOffsetUnits={-1}
        toneMapped={false}
        transparent
        uniforms={uniforms}
        vertexShader={PHYSICAL_PRISM_REFLECTION_ATLAS_VERTEX_SHADER}
      />
    </mesh>
  );
}
```

`createReflectionAtlasUniforms` computes `geometry.boundingBox`, creates the planar bounds, and returns every map, threshold and opacity uniform consumed by the shaders. The `TextureLoader` is the only loader and the parent remains the geometry owner.

- [ ] **Step 5: Run focused checks and commit**

Run:

```powershell
npx vitest run scene/physical-prism-reflection-atlas-config.test.ts --maxWorkers=4 --reporter=verbose
npx biome check scene/PhysicalPrismReflectionAtlas.tsx scene/physical-prism-reflection-atlas-shaders.ts scene/physical-prism-reflection-atlas-config.test.ts
npm run typecheck
git add -- scene/PhysicalPrismReflectionAtlas.tsx scene/physical-prism-reflection-atlas-shaders.ts scene/physical-prism-reflection-atlas-config.test.ts
git commit -m "feat(hero): render isolated reflection atlas"
```

Expected: all tests, Biome and TypeScript pass.

## Task 3: Replace the experimental procedural layer and validate

**Files:**

- Modify: `scene/PhysicalPrismGlassAsset.tsx`
- Modify: `scene/physical-prism-test-config.test.ts`
- Delete: `scene/PhysicalPrismCausticsOverlay.tsx`
- Delete: `scene/physical-prism-caustics-config.ts`
- Delete: `scene/physical-prism-caustics-config.test.ts`
- Delete: `scene/physical-prism-caustics-shaders.ts`
- Delete: `tmp/imagegen/noir-prism-reflections-atlas-v1-source.png`

- [ ] **Step 1: Replace the source-boundary assertion**

```ts
expect(source).toContain("PhysicalPrismReflectionAtlas");
expect(source).not.toContain("PhysicalPrismCausticsOverlay");
expect(source).not.toContain("MeshRefractionMaterial");
expect(source).not.toContain("hero-canvas-ui-spectral-source");
expect(source).not.toContain("uPointer");
```

- [ ] **Step 2: Run the test red**

Run:

```powershell
npx vitest run scene/physical-prism-test-config.test.ts --maxWorkers=4 --reporter=verbose
```

Expected: the old procedural component import fails the new source assertion.

- [ ] **Step 3: Replace the atlas component in the isolated asset**

```tsx
import { PhysicalPrismReflectionAtlas } from "@/scene/PhysicalPrismReflectionAtlas";

// Keep the existing physical base mesh at render order 1.
<PhysicalPrismReflectionAtlas geometry={geometry} />
// Keep the existing rim mesh at render order 3.
```

Remove the old `PhysicalPrismCausticsOverlay` import and delete all four procedural-lobe files. Remove only the generated intermediate source file under `tmp/imagegen`; retain the WebP source asset in `public/assets/v1/textures`.

- [ ] **Step 4: Run complete verification**

Run:

```powershell
npx vitest run app/glass-prism-test/page.test.tsx scene/physical-prism-test-config.test.ts scene/physical-prism-reflection-atlas-config.test.ts --maxWorkers=4 --reporter=verbose
npx biome check app/glass-prism-test/page.tsx app/glass-prism-test/page.test.tsx components/glass-prism-test/PhysicalPrismTest.tsx components/glass-prism-test/PhysicalPrismTest.module.css scene/PhysicalPrismGlassAsset.tsx scene/PhysicalPrismReflectionAtlas.tsx scene/physical-prism-reflection-atlas-config.ts scene/physical-prism-reflection-atlas-config.test.ts scene/physical-prism-reflection-atlas-shaders.ts scene/physical-prism-test-config.ts scene/physical-prism-test-config.test.ts
npm run typecheck
npm run build
```

Expected: route build output exists and all checks pass.

- [ ] **Step 5: Capture desktop and mobile validation**

```powershell
npx --yes --package @playwright/cli playwright-cli -s=prism-atlas open http://127.0.0.1:3010/glass-prism-test
npx --yes --package @playwright/cli playwright-cli -s=prism-atlas resize 1440 900
npx --yes --package @playwright/cli playwright-cli -s=prism-atlas screenshot --filename output/playwright/reflection-atlas-desktop.png
npx --yes --package @playwright/cli playwright-cli -s=prism-atlas resize 390 844
npx --yes --package @playwright/cli playwright-cli -s=prism-atlas screenshot --filename output/playwright/reflection-atlas-mobile.png
```

Verify compact colored reflection shapes are clipped inside NOIR, the white rim remains dominant, no broad stripes appear, and the mobile model remains fully visible.

- [ ] **Step 6: Commit the isolated replacement**

```powershell
git add -A -- scene/PhysicalPrismGlassAsset.tsx scene/physical-prism-test-config.test.ts scene/PhysicalPrismCausticsOverlay.tsx scene/physical-prism-caustics-config.ts scene/physical-prism-caustics-config.test.ts scene/physical-prism-caustics-shaders.ts tmp/imagegen/noir-prism-reflections-atlas-v1-source.png
git commit -m "feat(hero): test atlas-backed prism reflections"
```
