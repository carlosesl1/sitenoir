# Canvas UI Spectral Lighting Implementation Plan

> **For agentic workers:** Execute directly by default. Use subagents only for independent bounded lanes that satisfy the global harness policy. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the isolated Canvas UI NOIR glass bright neutral bevel highlights and four broad, localized RGB refraction beams without tinting the faces, outlining the model, or adding a second NOIR mesh.

**Architecture:** Keep `HeroCanvasUiGlassAsset` as one `MeshTransmissionMaterial` mesh consuming the existing `HeroRefractionBuffer`. Add one capture-only fullscreen spectral quad to that existing render target after the normal background capture, and extract a Canvas UI-only PMREM environment containing a white ring plus three angled white reflector cards. The standard glass variant, model, layout, motion, and visible scene remain unchanged.

**Tech Stack:** Next.js 16, React 19, React Three Fiber 9, Drei 10.7.8, Three.js 0.185, TypeScript, Vitest, Biome, Webpack production build

---

## File structure

- Create `scene/hero-canvas-ui-spectral-source-config.ts`: own the four beam definitions and responsive intensity resolver.
- Create `scene/hero-canvas-ui-spectral-source-shaders.ts`: generate the stable screen-space spectral shader with no time uniform.
- Create `scene/hero-canvas-ui-spectral-source.ts`: own the internal scene, fullscreen quad, material, render API, and idempotent cleanup.
- Create `scene/hero-canvas-ui-spectral-source.test.ts`: verify the beam contract, shader constraints, material flags, single draw call, and cleanup.
- Modify `scene/HeroRefractionBuffer.tsx`: optionally composite the spectral source into the existing target and restore renderer/camera state in `finally`.
- Modify `scene/SiteCanvas.tsx`: enable the source only for `heroGlassVariant === "canvas-ui"`.
- Create `scene/hero-canvas-ui-environment.ts`: construct and dispose the Canvas UI-only PMREM room, white ring, and three white reflector cards.
- Create `scene/hero-canvas-ui-environment.test.ts`: inspect the optical-room contents and verify PMREM resource cleanup.
- Modify `scene/hero-canvas-ui-glass-config.ts`: apply the approved clear-glass tuning and declare the ring/reflector definitions.
- Modify `scene/hero-canvas-ui-glass-config.test.ts`: lock the approved neutral material and white-reflector contract.
- Modify `scene/HeroCanvasUiGlassAsset.tsx`: consume the extracted environment helper while retaining exactly one visible mesh/material.
- Modify `scene/hero-canvas-ui-glass.test.ts`: protect the single-mesh and helper-integration contracts.

No changes are planned for the GLB, `HeroGlassAsset`, `HeroModel`, layout, camera, stickers, typography, scroll motion, default glass variant, or production deployment.

### Task 1: Define the four-beam spectral contract and shader

**Files:**
- Create: `scene/hero-canvas-ui-spectral-source.test.ts`
- Create: `scene/hero-canvas-ui-spectral-source-config.ts`
- Create: `scene/hero-canvas-ui-spectral-source-shaders.ts`

- [ ] **Step 1: Add the failing existence and behavior tests**

Create `scene/hero-canvas-ui-spectral-source.test.ts` with this first test block:

```ts
import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const configPath = join(process.cwd(), "scene/hero-canvas-ui-spectral-source-config.ts");
const shaderPath = join(process.cwd(), "scene/hero-canvas-ui-spectral-source-shaders.ts");

describe("Canvas UI spectral source", () => {
  it("defines four bounded beams and responsive intensities", async () => {
    expect(existsSync(configPath)).toBe(true);
    if (!existsSync(configPath)) return;

    const { HERO_CANVAS_UI_SPECTRAL_SOURCE_CONFIG, resolveHeroCanvasUiSpectralIntensity } =
      await import("@/scene/hero-canvas-ui-spectral-source-config");

    expect(HERO_CANVAS_UI_SPECTRAL_SOURCE_CONFIG.beams).toHaveLength(4);
    expect(HERO_CANVAS_UI_SPECTRAL_SOURCE_CONFIG.desktopIntensity).toBe(0.62);
    expect(HERO_CANVAS_UI_SPECTRAL_SOURCE_CONFIG.mobileIntensity).toBe(0.48);
    expect(HERO_CANVAS_UI_SPECTRAL_SOURCE_CONFIG.mobileBreakpoint).toBe(768);
    expect(resolveHeroCanvasUiSpectralIntensity(1440)).toBe(0.62);
    expect(resolveHeroCanvasUiSpectralIntensity(767)).toBe(0.48);

    for (const beam of HERO_CANVAS_UI_SPECTRAL_SOURCE_CONFIG.beams) {
      expect(beam.center[0]).toBeGreaterThanOrEqual(0);
      expect(beam.center[0]).toBeLessThanOrEqual(1);
      expect(beam.center[1]).toBeGreaterThanOrEqual(0);
      expect(beam.center[1]).toBeLessThanOrEqual(1);
      expect(beam.width).toBeGreaterThan(0);
      expect(beam.width).toBeLessThan(0.1);
      expect(beam.length).toBeGreaterThan(beam.width);
      expect(beam.strength).toBeGreaterThan(0);
      expect(beam.strength).toBeLessThanOrEqual(1);
    }
  });

  it("builds a stable spectral shader without autonomous animation", async () => {
    expect(existsSync(shaderPath)).toBe(true);
    if (!existsSync(shaderPath)) return;

    const { HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER } = await import(
      "@/scene/hero-canvas-ui-spectral-source-shaders"
    );

    expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER).toContain("prismSpectrum");
    expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER).toContain("spectralBeam");
    expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER.match(/spectralBeam\(/g)).toHaveLength(5);
    expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER).toContain("uniform float uIntensity");
    expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER).not.toContain("uTime");
  });
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```powershell
npm test -- scene/hero-canvas-ui-spectral-source.test.ts
```

Expected: 2 tests fail on the missing config and shader files; the guarded imports do not cause a collection error.

- [ ] **Step 3: Implement the pure spectral configuration**

Create `scene/hero-canvas-ui-spectral-source-config.ts`:

```ts
export interface HeroCanvasUiSpectralBeam {
  readonly angle: number;
  readonly center: readonly [number, number];
  readonly length: number;
  readonly phase: number;
  readonly strength: number;
  readonly width: number;
}

export const HERO_CANVAS_UI_SPECTRAL_SOURCE_CONFIG = {
  beams: [
    { angle: -0.55, center: [0.22, 0.48], length: 0.3, phase: 0, strength: 1, width: 0.065 },
    { angle: 0.38, center: [0.43, 0.55], length: 0.34, phase: 0.08, strength: 0.88, width: 0.08 },
    { angle: -0.32, center: [0.65, 0.46], length: 0.28, phase: 0.16, strength: 0.78, width: 0.06 },
    { angle: 0.5, center: [0.82, 0.56], length: 0.24, phase: 0.22, strength: 0.62, width: 0.05 },
  ] satisfies readonly HeroCanvasUiSpectralBeam[],
  desktopIntensity: 0.62,
  mobileBreakpoint: 768,
  mobileIntensity: 0.48,
} as const;

export function resolveHeroCanvasUiSpectralIntensity(viewportWidth: number): number {
  return viewportWidth < HERO_CANVAS_UI_SPECTRAL_SOURCE_CONFIG.mobileBreakpoint
    ? HERO_CANVAS_UI_SPECTRAL_SOURCE_CONFIG.mobileIntensity
    : HERO_CANVAS_UI_SPECTRAL_SOURCE_CONFIG.desktopIntensity;
}
```

- [ ] **Step 4: Implement the deterministic four-beam shader**

Create `scene/hero-canvas-ui-spectral-source-shaders.ts`:

```ts
import { HERO_CANVAS_UI_SPECTRAL_SOURCE_CONFIG } from "@/scene/hero-canvas-ui-spectral-source-config";

export const HERO_CANVAS_UI_SPECTRAL_VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const beamCalls = HERO_CANVAS_UI_SPECTRAL_SOURCE_CONFIG.beams
  .map(
    ({ angle, center, length, phase, strength, width }) =>
      `beam += spectralBeam(vUv, vec2(${center[0]}, ${center[1]}), ${angle}, ${width}, ${length}, ${strength}, ${phase});`,
  )
  .join("\n");

export const HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  uniform float uIntensity;
  varying vec2 vUv;

  vec3 prismSpectrum(float value) {
    float t = fract(value);
    return clamp(vec3(
      1.5 - abs(4.0 * t - 3.0),
      1.5 - abs(4.0 * t - 2.0),
      1.5 - abs(4.0 * t - 1.0)
    ), 0.0, 1.0);
  }

  vec4 spectralBeam(
    vec2 uv,
    vec2 center,
    float angle,
    float width,
    float beamLength,
    float strength,
    float phase
  ) {
    float cosine = cos(angle);
    float sine = sin(angle);
    vec2 point = uv - center;
    point = mat2(cosine, -sine, sine, cosine) * point;
    float longitudinal = 1.0 - smoothstep(beamLength * 0.72, beamLength, abs(point.x));
    float transverse = exp(-pow(abs(point.y) / width, 2.0));
    float mask = longitudinal * transverse * strength;
    vec3 color = prismSpectrum(point.y / max(width * 2.5, 0.0001) + 0.5 + phase);
    return vec4(color * mask, mask);
  }

  void main() {
    vec4 beam = vec4(0.0);
    ${beamCalls}
    gl_FragColor = vec4(beam.rgb * uIntensity, clamp(beam.a * uIntensity, 0.0, 1.0));
  }
`;
```

The RGB source is broad and soft, but remains invisible until the transmission material samples the buffer. There is deliberately no `uTime`, texture fetch, emissive surface color, or magenta tint.

- [ ] **Step 5: Run the pure tests and verify GREEN**

Run:

```powershell
npm test -- scene/hero-canvas-ui-spectral-source.test.ts
```

Expected: 2 tests pass.

- [ ] **Step 6: Commit the pure spectral contract**

Run:

```powershell
git add -- scene/hero-canvas-ui-spectral-source-config.ts scene/hero-canvas-ui-spectral-source-shaders.ts scene/hero-canvas-ui-spectral-source.test.ts
git diff --cached --check
git commit -m "feat(hero): define Canvas UI spectral source"
```

Expected: one commit containing only the pure config, shader, and tests.

### Task 2: Build the capture-only spectral source resource

**Files:**
- Modify: `scene/hero-canvas-ui-spectral-source.test.ts`
- Create: `scene/hero-canvas-ui-spectral-source.ts`

- [ ] **Step 1: Extend the test with material, render, and cleanup contracts**

Add these imports to `scene/hero-canvas-ui-spectral-source.test.ts`:

```ts
import { AdditiveBlending, Mesh, type Scene, type ShaderMaterial, type WebGLRenderer } from "three";
import { describe, expect, it, vi } from "vitest";

import {
  createHeroCanvasUiSpectralMaterial,
  createHeroCanvasUiSpectralSource,
} from "@/scene/hero-canvas-ui-spectral-source";
```

Replace the existing Vitest import rather than duplicating it, then add:

```ts
it("uses a transparent additive material that cannot write depth", () => {
  const material = createHeroCanvasUiSpectralMaterial();

  expect(material.transparent).toBe(true);
  expect(material.blending).toBe(AdditiveBlending);
  expect(material.depthTest).toBe(false);
  expect(material.depthWrite).toBe(false);
  expect(material.toneMapped).toBe(false);
  expect(material.uniforms["uIntensity"]?.value).toBe(0);

  material.dispose();
});

it("renders one fullscreen quad and disposes its resources once", () => {
  const source = createHeroCanvasUiSpectralSource();
  const render = vi.fn();
  const renderer = { render } as unknown as WebGLRenderer;

  source.render(renderer, 0.62);

  expect(render).toHaveBeenCalledTimes(1);
  const scene = render.mock.calls[0]?.[0] as Scene;
  const meshes = scene.children.filter((child): child is Mesh => child instanceof Mesh);
  expect(meshes).toHaveLength(1);
  const mesh = meshes[0];
  const geometryDispose = vi.spyOn(mesh.geometry, "dispose");
  const material = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material) as ShaderMaterial;
  const materialDispose = vi.spyOn(material, "dispose");
  expect(material.uniforms["uIntensity"]?.value).toBe(0.62);

  source.dispose();
  source.dispose();

  expect(geometryDispose).toHaveBeenCalledTimes(1);
  expect(materialDispose).toHaveBeenCalledTimes(1);
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```powershell
npm test -- scene/hero-canvas-ui-spectral-source.test.ts
```

Expected: test collection fails because `hero-canvas-ui-spectral-source.ts` does not exist.

- [ ] **Step 3: Implement the isolated Three.js source**

Create `scene/hero-canvas-ui-spectral-source.ts`:

```ts
import {
  AdditiveBlending,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  type WebGLRenderer,
} from "three";

import {
  HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER,
  HERO_CANVAS_UI_SPECTRAL_VERTEX_SHADER,
} from "@/scene/hero-canvas-ui-spectral-source-shaders";

export interface HeroCanvasUiSpectralSource {
  readonly dispose: () => void;
  readonly render: (renderer: WebGLRenderer, intensity: number) => void;
}

export function createHeroCanvasUiSpectralMaterial(): ShaderMaterial {
  return new ShaderMaterial({
    blending: AdditiveBlending,
    depthTest: false,
    depthWrite: false,
    fragmentShader: HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER,
    toneMapped: false,
    transparent: true,
    uniforms: { uIntensity: { value: 0 } },
    vertexShader: HERO_CANVAS_UI_SPECTRAL_VERTEX_SHADER,
  });
}

export function createHeroCanvasUiSpectralSource(): HeroCanvasUiSpectralSource {
  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const geometry = new PlaneGeometry(2, 2);
  const material = createHeroCanvasUiSpectralMaterial();
  const quad = new Mesh(geometry, material);
  scene.add(quad);
  let disposed = false;

  return {
    dispose() {
      if (disposed) return;
      disposed = true;
      geometry.dispose();
      material.dispose();
    },
    render(renderer, intensity) {
      if (disposed) return;
      const intensityUniform = material.uniforms["uIntensity"];
      if (intensityUniform) intensityUniform.value = intensity;
      renderer.render(scene, camera);
    },
  };
}
```

- [ ] **Step 4: Verify the source implementation**

Run:

```powershell
npm test -- scene/hero-canvas-ui-spectral-source.test.ts
npm run typecheck
```

Expected: 4 tests pass and TypeScript exits 0.

- [ ] **Step 5: Commit the runtime resource**

Run:

```powershell
git add -- scene/hero-canvas-ui-spectral-source.ts scene/hero-canvas-ui-spectral-source.test.ts
git diff --cached --check
git commit -m "feat(hero): create Canvas UI spectral pass"
```

### Task 3: Composite the spectral source into the existing refraction buffer

**Files:**
- Modify: `scene/hero-canvas-ui-spectral-source.test.ts`
- Modify: `scene/HeroRefractionBuffer.tsx`
- Modify: `scene/SiteCanvas.tsx`

- [ ] **Step 1: Add a failing integration contract test**

Add `readFileSync` to the Node fs import in `scene/hero-canvas-ui-spectral-source.test.ts`, then add:

```ts
it("activates the source only for Canvas UI and restores capture state", () => {
  const bufferSource = readFileSync(
    join(process.cwd(), "scene/HeroRefractionBuffer.tsx"),
    "utf8",
  );
  const siteCanvasSource = readFileSync(join(process.cwd(), "scene/SiteCanvas.tsx"), "utf8");

  expect(bufferSource).toContain("spectralSourceActive = false");
  expect(bufferSource).toContain("createHeroCanvasUiSpectralSource()");
  expect(bufferSource).toContain("resolveHeroCanvasUiSpectralIntensity(size.width)");
  expect(bufferSource).toContain("spectralSource.render(gl, spectralIntensity)");
  expect(bufferSource).toContain("try {");
  expect(bufferSource).toContain("finally {");
  expect(siteCanvasSource).toContain(
    'spectralSourceActive={heroGlassVariant === "canvas-ui"}',
  );
});
```

- [ ] **Step 2: Run the integration test and verify RED**

Run:

```powershell
npm test -- scene/hero-canvas-ui-spectral-source.test.ts
```

Expected: the new test fails because the buffer has no spectral prop or composition call.

- [ ] **Step 3: Add the opt-in prop and resource lifecycle**

In `scene/HeroRefractionBuffer.tsx`, add:

```ts
import { resolveHeroCanvasUiSpectralIntensity } from "@/scene/hero-canvas-ui-spectral-source-config";
import { createHeroCanvasUiSpectralSource } from "@/scene/hero-canvas-ui-spectral-source";
```

Extend the props and component arguments:

```ts
interface HeroRefractionBufferProps {
  readonly active: boolean;
  readonly children: ReactNode;
  readonly resolutionScale: number;
  readonly spectralSourceActive?: boolean;
}

export function HeroRefractionBuffer({
  active,
  children,
  resolutionScale,
  spectralSourceActive = false,
}: HeroRefractionBufferProps) {
```

After creating `target`, create and clean up the optional source:

```ts
const spectralSource = useMemo(
  () => (spectralSourceActive ? createHeroCanvasUiSpectralSource() : null),
  [spectralSourceActive],
);

useEffect(() => () => spectralSource?.dispose(), [spectralSource]);
```

- [ ] **Step 4: Replace the frame body with guarded state restoration and one additive draw**

Keep the existing transition guard, then replace the mutable capture section inside `useFrame` with:

```ts
const previousLayerMask = camera.layers.mask;
const previousTarget = gl.getRenderTarget();
const previousAutoClear = gl.autoClear;
const hiddenContactObjects: { object: { visible: boolean }; visible: boolean }[] = [];

try {
  scene.traverse((object) => {
    const isContactObject =
      object.userData["contactRefractiveObject"] === true ||
      object.layers.isEnabled(CONTACT_FLARE_LAYER);
    if (!isContactObject || !object.visible) return;
    hiddenContactObjects.push({ object, visible: object.visible });
    object.visible = false;
  });
  camera.layers.mask = 1;
  gl.setRenderTarget(target);
  gl.clear();
  gl.render(scene, camera);

  if (spectralSource) {
    const spectralIntensity = resolveHeroCanvasUiSpectralIntensity(size.width);
    gl.autoClear = false;
    spectralSource.render(gl, spectralIntensity);
  }
} finally {
  for (const entry of hiddenContactObjects) entry.object.visible = entry.visible;
  camera.layers.mask = previousLayerMask;
  gl.setRenderTarget(previousTarget);
  gl.autoClear = previousAutoClear;
}
```

This performs one normal background capture and one fullscreen quad draw into the same target. It does not re-render the site or place the quad in the visible R3F scene.

- [ ] **Step 5: Enable the source only for Canvas UI**

Modify the existing `HeroRefractionBuffer` call in `scene/SiteCanvas.tsx`:

```tsx
<HeroRefractionBuffer
  active={!principleScene.active}
  resolutionScale={qualityConfig.refractionResolutionScale}
  spectralSourceActive={heroGlassVariant === "canvas-ui"}
>
```

- [ ] **Step 6: Verify integration and regressions**

Run:

```powershell
npm test -- scene/hero-canvas-ui-spectral-source.test.ts scene/hero-glass-variant.test.ts scene/LazySiteCanvas.test.tsx app/glass-test/page.test.tsx
npm run typecheck
```

Expected: all selected tests pass and TypeScript exits 0. The source exists only when the Canvas UI variant is selected.

- [ ] **Step 7: Commit the buffer integration**

Run:

```powershell
git add -- scene/HeroRefractionBuffer.tsx scene/SiteCanvas.tsx scene/hero-canvas-ui-spectral-source.test.ts
git diff --cached --check
git commit -m "feat(hero): refract Canvas UI spectral beams"
```

### Task 4: Build the white bevel-highlight environment

**Files:**
- Modify: `scene/hero-canvas-ui-glass-config.test.ts`
- Modify: `scene/hero-canvas-ui-glass-config.ts`
- Create: `scene/hero-canvas-ui-environment.test.ts`
- Create: `scene/hero-canvas-ui-environment.ts`
- Modify: `scene/hero-canvas-ui-glass.test.ts`
- Modify: `scene/HeroCanvasUiGlassAsset.tsx`

- [ ] **Step 1: Change the glass-config test to the approved neutral highlight values**

Replace the `toMatchObject` values in `scene/hero-canvas-ui-glass-config.test.ts` with:

```ts
expect(HERO_CANVAS_UI_GLASS_CONFIG).toMatchObject({
  anisotropicBlur: 0.03,
  backside: false,
  chromaticAberration: 0.07,
  clearcoat: 1,
  clearcoatRoughness: 0.02,
  environmentBlur: 0.02,
  environmentIntensity: 1.6,
  highlight: "#ffffff",
  ior: 1.58,
  roughness: 0.05,
  samples: 6,
  thickness: 4,
  transmission: 1,
});
expect(HERO_CANVAS_UI_RING_CONFIG.color).toBe("#ffffff");
expect(HERO_CANVAS_UI_REFLECTOR_CONFIG).toHaveLength(3);
expect(HERO_CANVAS_UI_REFLECTOR_CONFIG.every((reflector) => reflector.color === "#ffffff")).toBe(
  true,
);
```

Add `HERO_CANVAS_UI_RING_CONFIG` and `HERO_CANVAS_UI_REFLECTOR_CONFIG` to the import list.

- [ ] **Step 2: Add the failing environment-room test**

Create `scene/hero-canvas-ui-environment.test.ts`:

```ts
import { Mesh, MeshBasicMaterial } from "three";
import { describe, expect, it } from "vitest";

import { createHeroCanvasUiEnvironmentRoom } from "@/scene/hero-canvas-ui-environment";

describe("Canvas UI optical environment", () => {
  it("contains one white ring and three angled white reflector cards", () => {
    const room = createHeroCanvasUiEnvironmentRoom();
    const opticalMeshes = room.children.filter(
      (child): child is Mesh => child instanceof Mesh && child.userData["canvasUiOptical"] === true,
    );
    const rings = opticalMeshes.filter((mesh) => mesh.userData["canvasUiRole"] === "ring");
    const reflectors = opticalMeshes.filter(
      (mesh) => mesh.userData["canvasUiRole"] === "reflector",
    );

    expect(rings).toHaveLength(1);
    expect(reflectors).toHaveLength(3);
    for (const mesh of opticalMeshes) {
      expect(mesh.material).toBeInstanceOf(MeshBasicMaterial);
      expect((mesh.material as MeshBasicMaterial).toneMapped).toBe(false);
    }
    expect(new Set(reflectors.map((mesh) => mesh.rotation.toArray().join(","))).size).toBe(3);

    room.dispose();
  });
});
```

- [ ] **Step 3: Protect the component integration and single-mesh contract**

In the first test of `scene/hero-canvas-ui-glass.test.ts`, add:

```ts
expect(source).toContain(
  'import { createHeroCanvasUiEnvironment } from "@/scene/hero-canvas-ui-environment";',
);
expect(source).toContain("createHeroCanvasUiEnvironment(gl)");
expect(source).not.toContain("new RoomEnvironment");
```

Keep the existing assertions requiring exactly one `<mesh>` and exactly one `<MeshTransmissionMaterial>`.

- [ ] **Step 4: Run the environment tests and verify RED**

Run:

```powershell
npm test -- scene/hero-canvas-ui-glass-config.test.ts scene/hero-canvas-ui-environment.test.ts scene/hero-canvas-ui-glass.test.ts
```

Expected: failures for the old material values, absent reflector constants, absent environment module, and inline room construction.

- [ ] **Step 5: Apply the approved material, ring, and reflector configuration**

Replace `scene/hero-canvas-ui-glass-config.ts` with:

```ts
export const HERO_CANVAS_UI_GLASS_CONFIG = {
  anisotropicBlur: 0.03,
  backside: false,
  chromaticAberration: 0.07,
  clearcoat: 1,
  clearcoatRoughness: 0.02,
  environmentBlur: 0.02,
  environmentIntensity: 1.6,
  highlight: "#ffffff",
  ior: 1.58,
  roughness: 0.05,
  samples: 6,
  thickness: 4,
  transmission: 1,
} as const;

export const HERO_CANVAS_UI_RING_CONFIG = {
  color: "#ffffff",
  intensity: 34,
  position: [2, 3, -2],
  scale: [10, 10, 10],
} as const;

export const HERO_CANVAS_UI_REFLECTOR_CONFIG = [
  {
    color: "#ffffff",
    intensity: 65,
    position: [-14, 10, 5],
    rotation: [0, -0.35, 0.2],
    scale: [0.08, 5.5, 1.2],
  },
  {
    color: "#ffffff",
    intensity: 52,
    position: [14, 8, -3],
    rotation: [0, 0.45, -0.25],
    scale: [0.08, 4.2, 1],
  },
  {
    color: "#ffffff",
    intensity: 75,
    position: [0, 16, -10],
    rotation: [0.45, 0, 0.1],
    scale: [5, 0.08, 1.1],
  },
] as const;

export function resolveHeroCanvasUiThickness(sceneScale: number): number {
  return HERO_CANVAS_UI_GLASS_CONFIG.thickness / Math.max(Math.abs(sceneScale), 0.0001);
}
```

- [ ] **Step 6: Implement the PMREM environment helper with explicit cleanup**

Create `scene/hero-canvas-ui-environment.ts`:

```ts
import {
  BoxGeometry,
  Color,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  PMREMGenerator,
  RingGeometry,
  type WebGLRenderer,
  type WebGLRenderTarget,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

import {
  HERO_CANVAS_UI_GLASS_CONFIG,
  HERO_CANVAS_UI_REFLECTOR_CONFIG,
  HERO_CANVAS_UI_RING_CONFIG,
} from "@/scene/hero-canvas-ui-glass-config";

function createOpticalMaterial(color: string, intensity: number): MeshBasicMaterial {
  return new MeshBasicMaterial({
    color: new Color(color).multiplyScalar(intensity),
    side: DoubleSide,
    toneMapped: false,
  });
}

export function createHeroCanvasUiEnvironmentRoom(): RoomEnvironment {
  const room = new RoomEnvironment();
  const ring = new Mesh(
    new RingGeometry(0.5, 1, 64),
    createOpticalMaterial(HERO_CANVAS_UI_RING_CONFIG.color, HERO_CANVAS_UI_RING_CONFIG.intensity),
  );
  ring.position.set(...HERO_CANVAS_UI_RING_CONFIG.position);
  ring.scale.set(...HERO_CANVAS_UI_RING_CONFIG.scale);
  ring.lookAt(0, 0, 0);
  ring.userData["canvasUiOptical"] = true;
  ring.userData["canvasUiRole"] = "ring";
  room.add(ring);

  for (const reflectorConfig of HERO_CANVAS_UI_REFLECTOR_CONFIG) {
    const reflector = new Mesh(
      new BoxGeometry(1, 1, 1),
      createOpticalMaterial(reflectorConfig.color, reflectorConfig.intensity),
    );
    reflector.position.set(...reflectorConfig.position);
    reflector.rotation.set(...reflectorConfig.rotation);
    reflector.scale.set(...reflectorConfig.scale);
    reflector.userData["canvasUiOptical"] = true;
    reflector.userData["canvasUiRole"] = "reflector";
    room.add(reflector);
  }

  return room;
}

export function createHeroCanvasUiEnvironment(gl: WebGLRenderer): WebGLRenderTarget {
  const room = createHeroCanvasUiEnvironmentRoom();
  const pmrem = new PMREMGenerator(gl);
  try {
    return pmrem.fromScene(room, HERO_CANVAS_UI_GLASS_CONFIG.environmentBlur, 0.1, 1000);
  } finally {
    room.dispose();
    pmrem.dispose();
  }
}
```

- [ ] **Step 7: Replace inline environment construction in the asset**

In `scene/HeroCanvasUiGlassAsset.tsx`:

1. Remove `Color`, `DoubleSide`, `Mesh`, `MeshBasicMaterial`, `PMREMGenerator`, `RingGeometry`, and `RoomEnvironment` imports.
2. Keep the `WebGLRenderTarget` type import from Three.js.
3. Add:

```ts
import { createHeroCanvasUiEnvironment } from "@/scene/hero-canvas-ui-environment";
```

4. Replace the inline environment `useMemo` body with:

```ts
const environment = useMemo<WebGLRenderTarget>(
  () => createHeroCanvasUiEnvironment(gl),
  [gl],
);
```

Do not change the component JSX except for formatting. It must still contain one `<mesh>` and one `<MeshTransmissionMaterial>`.

- [ ] **Step 8: Verify the white-edge environment**

Run:

```powershell
npm test -- scene/hero-canvas-ui-glass-config.test.ts scene/hero-canvas-ui-environment.test.ts scene/hero-canvas-ui-glass.test.ts
npm run typecheck
```

Expected: all selected tests pass and TypeScript exits 0.

- [ ] **Step 9: Commit the environment extraction and tuning**

Run:

```powershell
git add -- scene/HeroCanvasUiGlassAsset.tsx scene/hero-canvas-ui-environment.ts scene/hero-canvas-ui-environment.test.ts scene/hero-canvas-ui-glass-config.ts scene/hero-canvas-ui-glass-config.test.ts scene/hero-canvas-ui-glass.test.ts
git diff --cached --check
git commit -m "feat(hero): brighten Canvas UI glass bevels"
```

### Task 5: Prove the combined effect and perform bounded visual calibration

**Files:**
- Modify only if visual evidence requires it: `scene/hero-canvas-ui-spectral-source-config.ts`
- Modify only if visual evidence requires it: `scene/hero-canvas-ui-glass-config.ts`
- Modify matching exact-value tests whenever either config changes.
- Restore only if generated tooling changes it: `next-env.d.ts`

- [ ] **Step 1: Run the focused regression suite after the combined implementation**

Run:

```powershell
npm test -- scene/hero-canvas-ui-spectral-source.test.ts scene/hero-canvas-ui-environment.test.ts scene/hero-canvas-ui-glass-config.test.ts scene/hero-canvas-ui-glass.test.ts scene/hero-glass-variant.test.ts app/glass-test/page.test.tsx scene/LazySiteCanvas.test.tsx scene/hero-model-geometry.test.ts
```

Expected: all selected tests pass; the old additive-overlay files remain absent.

- [ ] **Step 2: Run static checks on the complete changed surface**

Run:

```powershell
npm run typecheck
npx biome check scene/HeroRefractionBuffer.tsx scene/SiteCanvas.tsx scene/HeroCanvasUiGlassAsset.tsx scene/hero-canvas-ui-spectral-source-config.ts scene/hero-canvas-ui-spectral-source-shaders.ts scene/hero-canvas-ui-spectral-source.ts scene/hero-canvas-ui-spectral-source.test.ts scene/hero-canvas-ui-environment.ts scene/hero-canvas-ui-environment.test.ts scene/hero-canvas-ui-glass-config.ts scene/hero-canvas-ui-glass-config.test.ts scene/hero-canvas-ui-glass.test.ts
```

Expected: both commands exit 0 without unrequested rewrites.

- [ ] **Step 3: Restart localhost after the module graph changes**

Stop the existing Next.js dev process cleanly, then run:

```powershell
npm run dev -- --webpack
```

Expected: `http://127.0.0.1:3000` becomes ready. Restarting is required because the earlier Drei installation changed the dependency tree while a dev server was alive.

- [ ] **Step 4: Inspect desktop, mobile, and the isolated comparison**

Use the T3 collaborative preview status/open flow first, then inspect:

```text
http://127.0.0.1:3000/glass-test
http://127.0.0.1:3000/?effects=full&glass=canvas-ui
```

Capture the Canvas UI home at `1440 × 900` and `390 × 844`. Record the console after the Canvas UI page is loaded directly, not only through the comparison iframe.

The visual proof passes only when all checks are true:

```text
1. The NOIR model is visible and remains transparent.
2. Internal and external bevels show clear neutral/white highlights on every letter.
3. At least two broad RGB beam regions are recognizable in a common frame.
4. No beam fills an entire letter face.
5. There is no continuous RGB outline, pink face tint, or dominant magenta cast.
6. The spectral source is invisible in the background outside the glass.
7. The standard/ATUAL panel has no new source or white-reflector treatment.
8. Model motion changes the sampled beam placement without autonomous color cycling.
9. Mobile keeps the title legible and uses the lower 0.48 intensity.
10. No new Canvas UI console error appears.
```

Do not attribute the already-known `/glass-test` legacy `isReady` error to this change unless it also reproduces on the direct Canvas UI home after a clean restart.

- [ ] **Step 5: Make at most one bounded adjustment per observed defect**

Change the matching exact-value test first, verify RED, then change the config and verify GREEN. Use only these bounds:

```ts
// Spectral beams are present but too faint:
desktopIntensity: 0.72,
mobileIntensity: 0.54,

// Spectral beams color too much of the faces:
desktopIntensity: 0.52,
mobileIntensity: 0.4,

// White bevels are still too weak:
environmentIntensity: 1.9,

// White bevels are too uniform and flatten the volume:
environmentIntensity: 1.35,
```

If beam coverage is too wide, reduce every beam `width` by 15% while preserving four beams and their positions. If only one reflector needs correction, change its intensity by at most 20%, capped at `90`. Do not add a second mesh, postprocessing, bloom, tint, emissive color, time animation, extra render target, or another full-scene capture.

- [ ] **Step 6: Commit evidence-backed visual tuning only when needed**

If Step 5 changed configuration, stage only the changed config and matching test files, then run:

```powershell
git diff --cached --check
git commit -m "fix(hero): calibrate Canvas UI spectral lighting"
```

If the initial approved values pass, skip this commit.

- [ ] **Step 7: Run the production build after the final values are fixed**

Stop the dev server before the build, then run:

```powershell
npm run build -- --webpack
```

Expected: Next.js exits 0 and lists `/` plus `/glass-test` in the route output. Restart `npm run dev -- --webpack` afterward so the user can continue reviewing localhost.

- [ ] **Step 8: Normalize generated Next.js state if necessary**

If `git diff -- next-env.d.ts` shows `.next/dev/types/routes.d.ts`, restore the tracked production reference using `apply_patch`:

```ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />
import "./.next/types/routes.d.ts";

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.
```

Expected: `next-env.d.ts` has no final diff.

- [ ] **Step 9: Inspect branch isolation and hand the localhost result back**

Run:

```powershell
git status --short --branch
git diff --check
git log -6 --oneline
```

Expected: the worktree is clean on `codex/noir-prismatic-glass`, the dev server is available on port 3000, and no push, merge, deployment, production cache purge, GLB change, or default-variant visual change has occurred.
