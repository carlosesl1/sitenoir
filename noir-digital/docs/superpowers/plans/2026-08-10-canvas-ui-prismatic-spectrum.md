# Canvas UI Prismatic Spectrum Implementation Plan

> **For agentic workers:** Execute directly by default. Use subagents only for independent bounded lanes that satisfy the global harness policy. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add strong spectral rims and sparse internal rainbow bands to the transparent Canvas UI NOIR variant without changing the default hero.

**Architecture:** Keep the existing `MeshPhysicalMaterial` as the transparent optical base and render one lightweight additive `ShaderMaterial` layer over the same `BufferGeometry`. Pure configuration, shader, material-factory, and layer-binding modules keep tuning testable and ensure the extra layer adds no texture, framebuffer, geometry clone, or time-based animation.

**Tech Stack:** Next.js 16, React 19, React Three Fiber 9, Three.js 0.185, TypeScript, Vitest, Biome.

---

## File structure

- Create `scene/hero-canvas-ui-spectrum-config.ts`: immutable tuning values and their relationships.
- Create `scene/hero-canvas-ui-spectrum-shaders.ts`: view-dependent spectral vertex and fragment shaders.
- Create `scene/hero-canvas-ui-spectrum-material.ts`: factory for the configured additive `ShaderMaterial`.
- Create `scene/hero-canvas-ui-spectrum-layers.ts`: pure layer descriptors that guarantee shared geometry and stable render order.
- Create `scene/hero-canvas-ui-spectrum.test.ts`: behavioral contract for tuning, shader, material, and geometry sharing.
- Modify `scene/HeroCanvasUiGlassAsset.tsx`: mount and dispose the spectral overlay beside the physical glass.

### Task 1: Lock the approved spectrum tuning

**Files:**
- Create: `scene/hero-canvas-ui-spectrum-config.ts`
- Create: `scene/hero-canvas-ui-spectrum.test.ts`

- [ ] **Step 1: Write the failing configuration test**

Create `scene/hero-canvas-ui-spectrum.test.ts` with:

```ts
import { describe, expect, it } from "vitest";

import { HERO_CANVAS_UI_SPECTRUM_CONFIG } from "@/scene/hero-canvas-ui-spectrum-config";

describe("Canvas UI hero spectrum", () => {
  it("keeps the rim dominant and the internal bands sparse", () => {
    const config = HERO_CANVAS_UI_SPECTRUM_CONFIG;

    expect(config.rimStrength).toBeGreaterThan(config.bandStrength);
    expect(config.rimPower).toBeGreaterThan(1);
    expect(config.bandSharpness).toBeGreaterThanOrEqual(12);
    expect(config.bandStrength).toBeLessThanOrEqual(0.55);
    expect(config.maximumOpacity).toBeLessThan(1);
    expect(config.saturation).toBeGreaterThan(1);
  });

  it("offsets the overlay without changing the geometry", () => {
    expect(HERO_CANVAS_UI_SPECTRUM_CONFIG.polygonOffsetFactor).toBeLessThan(0);
    expect(HERO_CANVAS_UI_SPECTRUM_CONFIG.polygonOffsetUnits).toBeLessThan(0);
  });
});
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```powershell
npx vitest run scene/hero-canvas-ui-spectrum.test.ts --maxWorkers=4 --reporter=verbose
```

Expected: FAIL because `hero-canvas-ui-spectrum-config.ts` does not exist.

- [ ] **Step 3: Add the minimal approved configuration**

Create `scene/hero-canvas-ui-spectrum-config.ts`:

```ts
export const HERO_CANVAS_UI_SPECTRUM_CONFIG = {
  bandFrequency: 2.15,
  bandSharpness: 16,
  bandStrength: 0.48,
  maximumOpacity: 0.88,
  polygonOffsetFactor: -1,
  polygonOffsetUnits: -1,
  rimPower: 1.65,
  rimStrength: 1.3,
  saturation: 1.35,
} as const;
```

- [ ] **Step 4: Run the test and verify GREEN**

Run:

```powershell
npx vitest run scene/hero-canvas-ui-spectrum.test.ts --maxWorkers=4 --reporter=verbose
```

Expected: 1 file and 2 tests PASS.

- [ ] **Step 5: Commit the configuration contract**

```powershell
git add -- scene/hero-canvas-ui-spectrum-config.ts scene/hero-canvas-ui-spectrum.test.ts
git commit -m "test(hero): define Canvas UI spectrum tuning"
```

### Task 2: Build the lightweight prismatic shader and material

**Files:**
- Modify: `scene/hero-canvas-ui-spectrum.test.ts`
- Create: `scene/hero-canvas-ui-spectrum-shaders.ts`
- Create: `scene/hero-canvas-ui-spectrum-material.ts`

- [ ] **Step 1: Add failing shader and material assertions**

Append these imports and tests to `scene/hero-canvas-ui-spectrum.test.ts`:

```ts
import { AdditiveBlending, DoubleSide } from "three";

import { createHeroCanvasUiSpectrumMaterial } from "@/scene/hero-canvas-ui-spectrum-material";
import { HERO_CANVAS_UI_SPECTRUM_FRAGMENT_SHADER } from "@/scene/hero-canvas-ui-spectrum-shaders";

it("separates grazing rims from narrow face bands without time animation", () => {
  expect(HERO_CANVAS_UI_SPECTRUM_FRAGMENT_SHADER).toContain(
    "float grazing = clamp(1.0 - viewAlignment, 0.0, 1.0);",
  );
  expect(HERO_CANVAS_UI_SPECTRUM_FRAGMENT_SHADER).toContain(
    "float rim = pow(grazing, max(uRimPower, 0.0001)) * uRimStrength;",
  );
  expect(HERO_CANVAS_UI_SPECTRUM_FRAGMENT_SHADER).toContain("float bands = pow(");
  expect(HERO_CANVAS_UI_SPECTRUM_FRAGMENT_SHADER).toContain("uBandStrength");
  expect(HERO_CANVAS_UI_SPECTRUM_FRAGMENT_SHADER).not.toContain("uTime");
});

it("creates a transparent additive overlay that cannot occlude the glass", () => {
  const material = createHeroCanvasUiSpectrumMaterial();

  expect(material.transparent).toBe(true);
  expect(material.depthWrite).toBe(false);
  expect(material.blending).toBe(AdditiveBlending);
  expect(material.side).toBe(DoubleSide);
  expect(material.toneMapped).toBe(false);
  expect(material.polygonOffset).toBe(true);
  expect(material.polygonOffsetFactor).toBeLessThan(0);
  expect(material.uniforms["uRimStrength"]?.value).toBeGreaterThan(
    material.uniforms["uBandStrength"]?.value,
  );

  material.dispose();
});
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```powershell
npx vitest run scene/hero-canvas-ui-spectrum.test.ts --maxWorkers=4 --reporter=verbose
```

Expected: FAIL because the shader and material modules do not exist.

- [ ] **Step 3: Add the vertex and fragment shaders**

Create `scene/hero-canvas-ui-spectrum-shaders.ts`:

```ts
export const HERO_CANVAS_UI_SPECTRUM_VERTEX_SHADER = `
varying vec3 vLocalPosition;
varying vec3 vWorldNormal;
varying vec3 vWorldPosition;

void main() {
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vLocalPosition = position;
  vWorldNormal = normalize(modelMatrix * vec4(normal, 0.0)).xyz;
  vWorldPosition = worldPosition.xyz;
  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
`;

export const HERO_CANVAS_UI_SPECTRUM_FRAGMENT_SHADER = `
uniform float uBandFrequency;
uniform float uBandSharpness;
uniform float uBandStrength;
uniform float uMaximumOpacity;
uniform float uRimPower;
uniform float uRimStrength;
uniform float uSaturation;

varying vec3 vLocalPosition;
varying vec3 vWorldNormal;
varying vec3 vWorldPosition;

vec3 saturateColor(vec3 color, float amount) {
  const vec3 weights = vec3(0.2125, 0.7154, 0.0721);
  return mix(vec3(dot(color, weights)), color, amount);
}

void main() {
  vec3 normal = normalize(vWorldNormal);
  vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
  float viewAlignment = abs(dot(normal, viewDirection));
  float grazing = clamp(1.0 - viewAlignment, 0.0, 1.0);
  float rim = pow(grazing, max(uRimPower, 0.0001)) * uRimStrength;

  float spectralCoordinate = vLocalPosition.x * 0.17
    + vLocalPosition.y * 0.11
    + dot(normal, vec3(0.23, 0.37, 0.17));
  float wave = 0.5 + 0.5 * sin(spectralCoordinate * uBandFrequency * 6.2831853);
  float bands = pow(max(wave, 0.0), max(uBandSharpness, 1.0));
  float faceVisibility = smoothstep(0.18, 0.92, viewAlignment);
  float bandLight = bands * faceVisibility * uBandStrength;

  vec3 palette = 0.5 + 0.5 * cos(
    6.2831853 * (spectralCoordinate + vec3(0.0, 0.3333, 0.6667))
  );
  vec3 color = saturateColor(palette, uSaturation) * (rim + bandLight);
  float alpha = clamp((rim + bandLight) * uMaximumOpacity, 0.0, uMaximumOpacity);

  gl_FragColor = vec4(max(color, vec3(0.0)), alpha);
}
`;
```

- [ ] **Step 4: Add the configured material factory**

Create `scene/hero-canvas-ui-spectrum-material.ts`:

```ts
import { AdditiveBlending, DoubleSide, ShaderMaterial } from "three";

import { HERO_CANVAS_UI_SPECTRUM_CONFIG as config } from "@/scene/hero-canvas-ui-spectrum-config";
import {
  HERO_CANVAS_UI_SPECTRUM_FRAGMENT_SHADER,
  HERO_CANVAS_UI_SPECTRUM_VERTEX_SHADER,
} from "@/scene/hero-canvas-ui-spectrum-shaders";

export function createHeroCanvasUiSpectrumMaterial(): ShaderMaterial {
  return new ShaderMaterial({
    blending: AdditiveBlending,
    depthTest: true,
    depthWrite: false,
    fragmentShader: HERO_CANVAS_UI_SPECTRUM_FRAGMENT_SHADER,
    polygonOffset: true,
    polygonOffsetFactor: config.polygonOffsetFactor,
    polygonOffsetUnits: config.polygonOffsetUnits,
    side: DoubleSide,
    toneMapped: false,
    transparent: true,
    uniforms: {
      uBandFrequency: { value: config.bandFrequency },
      uBandSharpness: { value: config.bandSharpness },
      uBandStrength: { value: config.bandStrength },
      uMaximumOpacity: { value: config.maximumOpacity },
      uRimPower: { value: config.rimPower },
      uRimStrength: { value: config.rimStrength },
      uSaturation: { value: config.saturation },
    },
    vertexShader: HERO_CANVAS_UI_SPECTRUM_VERTEX_SHADER,
  });
}
```

- [ ] **Step 5: Run the test and verify GREEN**

Run:

```powershell
npx vitest run scene/hero-canvas-ui-spectrum.test.ts --maxWorkers=4 --reporter=verbose
```

Expected: 1 file and 4 tests PASS with no warnings.

- [ ] **Step 6: Commit the spectral material**

```powershell
git add -- scene/hero-canvas-ui-spectrum.test.ts scene/hero-canvas-ui-spectrum-shaders.ts scene/hero-canvas-ui-spectrum-material.ts
git commit -m "feat(hero): add Canvas UI spectrum material"
```

### Task 3: Mount the spectrum over shared geometry

**Files:**
- Modify: `scene/hero-canvas-ui-spectrum.test.ts`
- Create: `scene/hero-canvas-ui-spectrum-layers.ts`
- Modify: `scene/HeroCanvasUiGlassAsset.tsx`

- [ ] **Step 1: Add a failing geometry-sharing test**

Add these imports and test to `scene/hero-canvas-ui-spectrum.test.ts`:

```ts
import { BufferGeometry, MeshBasicMaterial } from "three";

import { createHeroCanvasUiSpectrumLayers } from "@/scene/hero-canvas-ui-spectrum-layers";

it("renders physical glass and spectrum over the exact same geometry", () => {
  const geometry = new BufferGeometry();
  const physicalMaterial = new MeshBasicMaterial();
  const spectrumMaterial = createHeroCanvasUiSpectrumMaterial();
  const layers = createHeroCanvasUiSpectrumLayers({
    geometry,
    physicalMaterial,
    spectrumMaterial,
  });

  expect(layers.map((layer) => layer.id)).toEqual(["physical", "spectrum"]);
  expect(layers[0].geometry).toBe(geometry);
  expect(layers[1].geometry).toBe(geometry);
  expect(layers[0].material).toBe(physicalMaterial);
  expect(layers[1].material).toBe(spectrumMaterial);
  expect(layers[1].renderOrder).toBeGreaterThan(layers[0].renderOrder);

  geometry.dispose();
  physicalMaterial.dispose();
  spectrumMaterial.dispose();
});
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```powershell
npx vitest run scene/hero-canvas-ui-spectrum.test.ts --maxWorkers=4 --reporter=verbose
```

Expected: FAIL because `hero-canvas-ui-spectrum-layers.ts` does not exist.

- [ ] **Step 3: Implement immutable shared layer descriptors**

Create `scene/hero-canvas-ui-spectrum-layers.ts`:

```ts
import type { BufferGeometry, Material } from "three";

interface HeroCanvasUiSpectrumLayerOptions {
  readonly geometry: BufferGeometry;
  readonly physicalMaterial: Material;
  readonly spectrumMaterial: Material;
}

export function createHeroCanvasUiSpectrumLayers({
  geometry,
  physicalMaterial,
  spectrumMaterial,
}: HeroCanvasUiSpectrumLayerOptions) {
  return [
    { geometry, id: "physical", material: physicalMaterial, renderOrder: 0 },
    { geometry, id: "spectrum", material: spectrumMaterial, renderOrder: 1 },
  ] as const;
}
```

- [ ] **Step 4: Run the test and verify GREEN**

Run:

```powershell
npx vitest run scene/hero-canvas-ui-spectrum.test.ts --maxWorkers=4 --reporter=verbose
```

Expected: 1 file and 5 tests PASS.

- [ ] **Step 5: Integrate the two layers into the Canvas UI asset**

In `scene/HeroCanvasUiGlassAsset.tsx`, add:

```ts
import { createHeroCanvasUiSpectrumLayers } from "@/scene/hero-canvas-ui-spectrum-layers";
import { createHeroCanvasUiSpectrumMaterial } from "@/scene/hero-canvas-ui-spectrum-material";
```

After creating the physical `material`, create the overlay and descriptors:

```ts
const spectrumMaterial = useMemo(() => createHeroCanvasUiSpectrumMaterial(), []);
const layers = useMemo(
  () =>
    createHeroCanvasUiSpectrumLayers({
      geometry,
      physicalMaterial: material,
      spectrumMaterial,
    }),
  [geometry, material, spectrumMaterial],
);
```

Replace the single-mesh layer effect and material cleanup with:

```ts
useLayoutEffect(() => () => geometry.dispose(), [geometry]);
useLayoutEffect(() => () => material.dispose(), [material]);
useLayoutEffect(() => () => spectrumMaterial.dispose(), [spectrumMaterial]);
useLayoutEffect(() => () => environment.dispose(), [environment]);
```

Replace the single mesh return with:

```tsx
return (
  <>
    {layers.map((layer) => (
      <mesh
        key={layer.id}
        geometry={layer.geometry}
        material={layer.material}
        onUpdate={(mesh) => mesh.layers.set(HERO_GLASS_CONFIG.renderLayer)}
        renderOrder={layer.renderOrder}
      />
    ))}
  </>
);
```

Remove the unused `meshRef`, `useRef`, and `Mesh` imports.

- [ ] **Step 6: Run focused integration tests**

Run:

```powershell
npx vitest run scene/hero-canvas-ui-spectrum.test.ts scene/hero-canvas-ui-glass-config.test.ts scene/hero-model-geometry.test.ts scene/hero-glass-variant.test.ts scene/LazySiteCanvas.test.tsx components/glass-test/glass-comparison.test.ts app/glass-test/page.test.tsx --maxWorkers=4 --reporter=verbose
```

Expected: all listed files PASS with no new warnings.

- [ ] **Step 7: Commit the mounted overlay**

```powershell
git add -- scene/HeroCanvasUiGlassAsset.tsx scene/hero-canvas-ui-spectrum-layers.ts scene/hero-canvas-ui-spectrum.test.ts
git commit -m "feat(hero): layer prism spectrum over Canvas UI glass"
```

### Task 4: Validate and tune against the reference

**Files:**
- Modify only if needed: `scene/hero-canvas-ui-spectrum-config.ts`
- Test alongside tuning: `scene/hero-canvas-ui-spectrum.test.ts`

- [ ] **Step 1: Run technical verification**

Run:

```powershell
npx vitest run scene/hero-canvas-ui-spectrum.test.ts scene/hero-canvas-ui-glass-config.test.ts scene/hero-model-geometry.test.ts scene/hero-glass-variant.test.ts scene/LazySiteCanvas.test.tsx scene/critical-hero-preload.test.ts scene/hero-glass-shaders.test.ts components/glass-test/glass-comparison.test.ts app/glass-test/page.test.tsx --maxWorkers=4 --reporter=verbose
npm run typecheck
npx biome check scene/HeroCanvasUiGlassAsset.tsx scene/hero-canvas-ui-spectrum-config.ts scene/hero-canvas-ui-spectrum-shaders.ts scene/hero-canvas-ui-spectrum-material.ts scene/hero-canvas-ui-spectrum-layers.ts scene/hero-canvas-ui-spectrum.test.ts
npm run build -- --webpack
```

Expected: all tests PASS, TypeScript exits 0, Biome reports no fixes needed, and the Webpack production build includes `/glass-test`.

- [ ] **Step 2: Inspect the comparison route**

Use the running local server at:

```text
http://127.0.0.1:3000/glass-test/
```

Verify at a desktop viewport:

- left panel remains the current material;
- right panel keeps the background visible through the faces;
- external and internal edges show clear RGB separation;
- only a few narrow bands cross the faces;
- white highlights and bevel definition remain visible;
- the browser console contains no new shader, PMREM, or WebGL warnings.

- [ ] **Step 3: Tune only within the approved contract if necessary**

If the rim is too weak, increase `rimStrength` while keeping it above `bandStrength`. If the faces become colorful slabs, increase `bandSharpness` or reduce `bandStrength`; keep the existing tests green after every change. Do not add time animation, textures, framebuffer passes, or geometry clones.

- [ ] **Step 4: Commit any visual tuning**

If configuration changed:

```powershell
git add -- scene/hero-canvas-ui-spectrum-config.ts scene/hero-canvas-ui-spectrum.test.ts
git commit -m "refine(hero): tune Canvas UI prism spectrum"
```

- [ ] **Step 5: Confirm a clean isolated branch**

Run:

```powershell
git diff --check
git status --short --branch
git log --oneline -8
```

Expected: no unstaged or untracked production files, branch `codex/noir-prismatic-glass`, and only the intended local commits. Do not push, merge, or deploy.
