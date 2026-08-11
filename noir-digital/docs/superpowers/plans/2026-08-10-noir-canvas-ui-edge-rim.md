# NOIR Canvas UI Edge Rim Implementation Plan

> **For agentic workers:** Execute directly by default. Use subagents only for independent bounded lanes that satisfy the global harness policy. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a continuously legible neutral white Fresnel rim to the Canvas UI NOIR glass without changing its geometry, transparent faces, or approved four-color refraction.

**Architecture:** Keep the existing `MeshTransmissionMaterial` as the only glass/refraction material and render a second lightweight shader mesh with the same geometry. The overlay computes a two-stage Fresnel response—a narrow white core plus a restrained halo—and is isolated in dedicated configuration and shader modules.

**Tech Stack:** Next.js 16, React 19, React Three Fiber, Drei `MeshTransmissionMaterial`, Three.js GLSL `ShaderMaterial`, Vitest, Biome.

---

## File structure

- Create `scene/hero-canvas-ui-rim-config.ts`: neutral rim constants only.
- Create `scene/hero-canvas-ui-rim-shaders.ts`: view-space Fresnel vertex and fragment programs.
- Create `scene/hero-canvas-ui-rim.test.ts`: shader/config contract tests.
- Modify `scene/HeroCanvasUiGlassAsset.tsx`: mount the rim overlay beside the transmission mesh.
- Modify `scene/hero-canvas-ui-glass.test.ts`: update the integration contract from one mesh to two coordinated meshes.

### Task 1: Add the neutral rim contract and shader

**Files:**
- Create: `scene/hero-canvas-ui-rim.test.ts`
- Create: `scene/hero-canvas-ui-rim-config.ts`
- Create: `scene/hero-canvas-ui-rim-shaders.ts`

- [ ] **Step 1: Write the failing rim contract test**

Create `scene/hero-canvas-ui-rim.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { HERO_CANVAS_UI_RIM_CONFIG } from "@/scene/hero-canvas-ui-rim-config";
import {
  HERO_CANVAS_UI_RIM_FRAGMENT_SHADER,
  HERO_CANVAS_UI_RIM_VERTEX_SHADER,
} from "@/scene/hero-canvas-ui-rim-shaders";

describe("Canvas UI neutral glass rim", () => {
  it("keeps a narrow neutral core and a softer halo", () => {
    expect(HERO_CANVAS_UI_RIM_CONFIG.color).toBe("#ffffff");
    expect(HERO_CANVAS_UI_RIM_CONFIG.coreStart).toBeGreaterThan(
      HERO_CANVAS_UI_RIM_CONFIG.haloStart,
    );
    expect(HERO_CANVAS_UI_RIM_CONFIG.coreOpacity).toBeGreaterThanOrEqual(0.82);
    expect(HERO_CANVAS_UI_RIM_CONFIG.coreOpacity).toBeLessThanOrEqual(0.92);
    expect(HERO_CANVAS_UI_RIM_CONFIG.haloOpacity).toBeGreaterThanOrEqual(0.12);
    expect(HERO_CANVAS_UI_RIM_CONFIG.haloOpacity).toBeLessThanOrEqual(0.2);
  });

  it("derives the rim from the view angle without spectral color or animation", () => {
    expect(HERO_CANVAS_UI_RIM_VERTEX_SHADER).toContain("vViewNormal");
    expect(HERO_CANVAS_UI_RIM_VERTEX_SHADER).toContain("vViewDirection");
    expect(HERO_CANVAS_UI_RIM_FRAGMENT_SHADER).toContain("1.0 - abs(dot");
    expect(HERO_CANVAS_UI_RIM_FRAGMENT_SHADER).toContain("float core = smoothstep");
    expect(HERO_CANVAS_UI_RIM_FRAGMENT_SHADER).toContain("float halo = smoothstep");
    expect(HERO_CANVAS_UI_RIM_FRAGMENT_SHADER).not.toContain("spectralPalette");
    expect(HERO_CANVAS_UI_RIM_FRAGMENT_SHADER).not.toContain("uTime");
  });
});
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```powershell
npm test -- scene/hero-canvas-ui-rim.test.ts
```

Expected: FAIL because `hero-canvas-ui-rim-config` and `hero-canvas-ui-rim-shaders` do not exist.

- [ ] **Step 3: Add the bounded rim configuration**

Create `scene/hero-canvas-ui-rim-config.ts`:

```ts
export const HERO_CANVAS_UI_RIM_CONFIG = {
  color: "#ffffff",
  coreEnd: 0.98,
  coreOpacity: 0.88,
  coreStart: 0.7,
  haloEnd: 0.88,
  haloOpacity: 0.16,
  haloStart: 0.34,
  polygonOffsetFactor: -1,
  polygonOffsetUnits: -1,
} as const;
```

- [ ] **Step 4: Add the isolated Fresnel shader**

Create `scene/hero-canvas-ui-rim-shaders.ts`:

```ts
export const HERO_CANVAS_UI_RIM_VERTEX_SHADER = /* glsl */ `
  varying vec3 vViewNormal;
  varying vec3 vViewDirection;

  void main() {
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vViewNormal = normalize(normalMatrix * normal);
    vViewDirection = normalize(-viewPosition.xyz);
    gl_Position = projectionMatrix * viewPosition;
  }
`;

export const HERO_CANVAS_UI_RIM_FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uColor;
  uniform float uCoreStart;
  uniform float uCoreEnd;
  uniform float uCoreOpacity;
  uniform float uHaloStart;
  uniform float uHaloEnd;
  uniform float uHaloOpacity;

  varying vec3 vViewNormal;
  varying vec3 vViewDirection;

  void main() {
    vec3 normal = normalize(vViewNormal);
    vec3 viewDirection = normalize(vViewDirection);
    float fresnel = clamp(1.0 - abs(dot(normal, viewDirection)), 0.0, 1.0);
    float core = smoothstep(uCoreStart, uCoreEnd, fresnel);
    float halo = smoothstep(uHaloStart, uHaloEnd, fresnel) * (1.0 - core);
    float opacity = clamp(core * uCoreOpacity + halo * uHaloOpacity, 0.0, 1.0);

    if (opacity <= 0.002) discard;
    gl_FragColor = vec4(uColor, opacity);
  }
`;
```

- [ ] **Step 5: Run the rim test and verify GREEN**

Run:

```powershell
npm test -- scene/hero-canvas-ui-rim.test.ts
```

Expected: 1 file and 2 tests PASS.

- [ ] **Step 6: Commit the isolated shader contract**

```powershell
git add -- scene/hero-canvas-ui-rim-config.ts scene/hero-canvas-ui-rim-shaders.ts scene/hero-canvas-ui-rim.test.ts
git diff --cached --check
git commit -m "feat(hero): add neutral Canvas UI rim shader"
```

### Task 2: Integrate the rim with the glass asset

**Files:**
- Modify: `scene/hero-canvas-ui-glass.test.ts:12-39`
- Modify: `scene/HeroCanvasUiGlassAsset.tsx:1-55`

- [ ] **Step 1: Update the integration test first**

In the first test of `scene/hero-canvas-ui-glass.test.ts`, replace the single-mesh assertions with:

```ts
expect(source.match(/<mesh\b/g)).toHaveLength(2);
expect(source.match(/geometry=\{geometry\}/g)).toHaveLength(2);
expect(source.match(/<MeshTransmissionMaterial\b/g)).toHaveLength(1);
expect(source.match(/<shaderMaterial\b/g)).toHaveLength(1);
expect(source).toContain("HERO_CANVAS_UI_RIM_CONFIG as rimConfig");
expect(source).toContain("HERO_CANVAS_UI_RIM_FRAGMENT_SHADER");
expect(source).toContain("HERO_CANVAS_UI_RIM_VERTEX_SHADER");
expect(source).toContain("depthWrite={false}");
expect(source).toContain("toneMapped={false}");
expect(source).toContain("polygonOffset");
expect(source).not.toContain("EdgesGeometry");
```

Keep the existing assertions for `MeshTransmissionMaterial`, `useHeroRefraction`, `buffer={texture}`, the environment, and rejected additive-spectrum modules.

- [ ] **Step 2: Run the integration test and verify RED**

Run:

```powershell
npm test -- scene/hero-canvas-ui-glass.test.ts
```

Expected: FAIL because the asset still renders one mesh and has no rim shader.

- [ ] **Step 3: Mount the rim overlay with shared geometry**

Replace `scene/HeroCanvasUiGlassAsset.tsx` with:

```tsx
"use client";

import { MeshTransmissionMaterial } from "@react-three/drei/core/MeshTransmissionMaterial";
import { useLoader, useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo } from "react";
import { Color, FrontSide, NormalBlending, type WebGLRenderTarget } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import { HERO_MODEL_SOURCE } from "@/scene/critical-hero-preload";
import { useHeroRefraction } from "@/scene/HeroRefractionBuffer";
import { createHeroCanvasUiEnvironment } from "@/scene/hero-canvas-ui-environment";
import {
  HERO_CANVAS_UI_GLASS_CONFIG as glassConfig,
  resolveHeroCanvasUiThickness,
} from "@/scene/hero-canvas-ui-glass-config";
import { HERO_CANVAS_UI_RIM_CONFIG as rimConfig } from "@/scene/hero-canvas-ui-rim-config";
import {
  HERO_CANVAS_UI_RIM_FRAGMENT_SHADER,
  HERO_CANVAS_UI_RIM_VERTEX_SHADER,
} from "@/scene/hero-canvas-ui-rim-shaders";
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
  const environment = useMemo<WebGLRenderTarget>(() => createHeroCanvasUiEnvironment(gl), [gl]);
  const rimUniforms = useMemo(
    () => ({
      uColor: { value: new Color(rimConfig.color) },
      uCoreEnd: { value: rimConfig.coreEnd },
      uCoreOpacity: { value: rimConfig.coreOpacity },
      uCoreStart: { value: rimConfig.coreStart },
      uHaloEnd: { value: rimConfig.haloEnd },
      uHaloOpacity: { value: rimConfig.haloOpacity },
      uHaloStart: { value: rimConfig.haloStart },
    }),
    [],
  );

  useLayoutEffect(() => () => geometry.dispose(), [geometry]);
  useLayoutEffect(() => () => environment.dispose(), [environment]);

  return (
    <>
      <mesh geometry={geometry} onUpdate={(mesh) => mesh.layers.set(HERO_GLASS_CONFIG.renderLayer)}>
        <MeshTransmissionMaterial
          anisotropicBlur={glassConfig.anisotropicBlur}
          backside={glassConfig.backside}
          buffer={texture}
          chromaticAberration={glassConfig.chromaticAberration}
          clearcoat={glassConfig.clearcoat}
          clearcoatRoughness={glassConfig.clearcoatRoughness}
          color="#ffffff"
          envMap={environment.texture}
          envMapIntensity={glassConfig.environmentIntensity}
          ior={glassConfig.ior}
          roughness={glassConfig.roughness}
          samples={glassConfig.samples}
          thickness={resolveHeroCanvasUiThickness(sceneScale)}
          transmission={glassConfig.transmission}
        />
      </mesh>
      <mesh
        geometry={geometry}
        onUpdate={(mesh) => mesh.layers.set(HERO_GLASS_CONFIG.renderLayer)}
        renderOrder={1}
      >
        <shaderMaterial
          blending={NormalBlending}
          depthTest
          depthWrite={false}
          fragmentShader={HERO_CANVAS_UI_RIM_FRAGMENT_SHADER}
          polygonOffset
          polygonOffsetFactor={rimConfig.polygonOffsetFactor}
          polygonOffsetUnits={rimConfig.polygonOffsetUnits}
          side={FrontSide}
          toneMapped={false}
          transparent
          uniforms={rimUniforms}
          vertexShader={HERO_CANVAS_UI_RIM_VERTEX_SHADER}
        />
      </mesh>
    </>
  );
}
```

- [ ] **Step 4: Run focused tests and verify GREEN**

Run:

```powershell
npm test -- scene/hero-canvas-ui-rim.test.ts scene/hero-canvas-ui-glass.test.ts scene/hero-canvas-ui-glass-config.test.ts scene/hero-canvas-ui-environment.test.ts scene/hero-canvas-ui-spectral-source.test.ts
```

Expected: 5 files PASS with no assertion failure.

- [ ] **Step 5: Check types and formatting**

Run:

```powershell
npm run typecheck
npx biome check scene/HeroCanvasUiGlassAsset.tsx scene/hero-canvas-ui-glass.test.ts scene/hero-canvas-ui-rim-config.ts scene/hero-canvas-ui-rim-shaders.ts scene/hero-canvas-ui-rim.test.ts
git diff --check
```

Expected: all commands exit 0 and Biome reports no fixes required.

- [ ] **Step 6: Commit the integration**

```powershell
git add -- scene/HeroCanvasUiGlassAsset.tsx scene/hero-canvas-ui-glass.test.ts
git diff --cached --check
git commit -m "feat(hero): layer a white rim over Canvas UI glass"
```

### Task 3: Perform bounded visual calibration and final proof

**Files:**
- Modify only if visual calibration requires it: `scene/hero-canvas-ui-rim-config.ts:1-11`

- [ ] **Step 1: Inspect the approved routes at desktop and mobile widths**

Start the existing development server if it is not already running:

```powershell
npm run dev
```

Inspect both:

- `http://127.0.0.1:3000/?effects=full&glass=canvas-ui`
- `http://127.0.0.1:3000/glass-test/`

Capture one bounded pass at `1536x864` and `390x844`. Compare the outer silhouette, the inner opening of the `O`, and the chamfer lines with the supplied reference.

- [ ] **Step 2: Apply at most one calibration batch if required**

Use these bounded corrections, changing only `scene/hero-canvas-ui-rim-config.ts`:

- If flat faces acquire visible white fill, set `haloStart` to `0.42` and `haloOpacity` to `0.12`.
- If the outline remains too faint, set `coreStart` to `0.64` and `coreOpacity` to `0.92`.
- If the core looks thicker than 2 CSS pixels, set `coreStart` to `0.76` and `coreEnd` to `0.995`.

Do not recolor the rim and do not alter the spectral source, model geometry, camera, layout, or environment.

- [ ] **Step 3: Run the final integration proof after the last change**

Run:

```powershell
npm test -- scene/hero-canvas-ui-rim.test.ts scene/hero-canvas-ui-glass.test.ts scene/hero-canvas-ui-glass-config.test.ts scene/hero-canvas-ui-environment.test.ts scene/hero-canvas-ui-spectral-source.test.ts scene/hero-glass-variant.test.ts app/glass-test/page.test.tsx scene/LazySiteCanvas.test.tsx scene/hero-model-geometry.test.ts
npm run typecheck
npx biome check scene/HeroCanvasUiGlassAsset.tsx scene/hero-canvas-ui-glass.test.ts scene/hero-canvas-ui-rim-config.ts scene/hero-canvas-ui-rim-shaders.ts scene/hero-canvas-ui-rim.test.ts
git diff --check
npm run build -- --webpack
```

Expected: all focused test files pass, typecheck and Biome exit 0, `git diff --check` is clean, and the Next.js production build completes successfully.

- [ ] **Step 4: Commit calibration only when it produced a diff**

```powershell
git add -- scene/hero-canvas-ui-rim-config.ts
git diff --cached --check
git commit -m "fix(hero): calibrate Canvas UI white rim"
```

Skip this commit when the initial configuration already satisfies visual acceptance.

- [ ] **Step 5: Leave the isolated branch ready for review**

Run:

```powershell
git status --short --branch
git log -4 --oneline
```

Expected: branch `codex/noir-prismatic-glass` is clean, contains the design and implementation commits, and has not been pushed or merged.
