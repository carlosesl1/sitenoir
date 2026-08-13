# NOIR Prismatic Fragment Field Implementation Plan

> **For agentic workers:** Execute directly by default. Use subagents only for independent bounded lanes that satisfy the global harness policy. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the four visible spectral streaks with ten localized prism fragments whose shapes, strengths, sizes, and color windows vary like the approved reference.

**Architecture:** Keep the existing fullscreen spectral source, refraction buffer, material, and single draw call. Replace the `beams` configuration with a deterministic `fragments` array compiled into ten GLSL calls; each call selects one of three bounded masks and samples only its configured window of the approved four-color palette.

**Tech Stack:** TypeScript, Three.js `ShaderMaterial`, GLSL, Vitest, Biome, Next.js 16.

---

## File map

- Modify `scene/hero-canvas-ui-spectral-source-config.ts`: own the fragment union, shape contract, common angle, responsive intensity, and ten tuned fragment definitions.
- Modify `scene/hero-canvas-ui-spectral-source-shaders.ts`: translate shape names to numeric GLSL kinds, generate ten calls, implement three bounded masks, and apply per-fragment color windows.
- Modify `scene/hero-canvas-ui-spectral-source.test.ts`: prove that the old beam model is gone, the fragment field is varied and bounded, and the renderer still uses one static fullscreen quad.
- Do not modify `HeroRefractionBuffer`, the Canvas UI material, lights, GLB, stickers, loader, hero layout, or default variant.

### Task 1: Replace the beam contract with ten prism fragments

**Files:**
- Modify: `scene/hero-canvas-ui-spectral-source.test.ts`
- Modify: `scene/hero-canvas-ui-spectral-source-config.ts`

- [ ] **Step 1: Write the failing configuration test**

Replace the first test's beam assertions with this contract:

```ts
const {
  HERO_CANVAS_UI_SPECTRAL_FRAGMENT_ANGLE,
  HERO_CANVAS_UI_SPECTRAL_SOURCE_CONFIG,
  resolveHeroCanvasUiSpectralIntensity,
} = await import(configModulePath);

expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_ANGLE).toBe(0.58);
expect(HERO_CANVAS_UI_SPECTRAL_SOURCE_CONFIG).not.toHaveProperty("beams");
expect(HERO_CANVAS_UI_SPECTRAL_SOURCE_CONFIG.fragments).toHaveLength(10);
expect(new Set(HERO_CANVAS_UI_SPECTRAL_SOURCE_CONFIG.fragments.map(
  ({ kind }: { readonly kind: string }) => kind,
))).toEqual(new Set(["lens", "wedge", "glint"]));

const colorWindows = new Set(
  HERO_CANVAS_UI_SPECTRAL_SOURCE_CONFIG.fragments.map(
    ({ colorEnd, colorStart }: { readonly colorEnd: number; readonly colorStart: number }) =>
      `${colorStart}:${colorEnd}`,
  ),
);
expect(colorWindows.size).toBeGreaterThanOrEqual(3);

for (const fragment of HERO_CANVAS_UI_SPECTRAL_SOURCE_CONFIG.fragments) {
  expect(fragment.center[0]).toBeGreaterThanOrEqual(0);
  expect(fragment.center[0]).toBeLessThanOrEqual(1);
  expect(fragment.center[1]).toBeGreaterThanOrEqual(0);
  expect(fragment.center[1]).toBeLessThanOrEqual(1);
  expect(fragment.size[0]).toBeGreaterThan(0);
  expect(fragment.size[0]).toBeLessThanOrEqual(0.13);
  expect(fragment.size[1]).toBeGreaterThan(0);
  expect(fragment.size[1]).toBeLessThanOrEqual(0.05);
  expect(fragment.strength).toBeGreaterThan(0);
  expect(fragment.strength).toBeLessThanOrEqual(1);
  expect(fragment.softness).toBeGreaterThanOrEqual(0.55);
  expect(fragment.softness).toBeLessThanOrEqual(0.9);
  expect(Math.abs(fragment.skew)).toBeLessThanOrEqual(0.25);
  expect(fragment.colorStart).toBeGreaterThanOrEqual(0);
  expect(fragment.colorEnd).toBeLessThanOrEqual(1);
  expect(fragment.colorEnd).toBeGreaterThan(fragment.colorStart);
}

expect(resolveHeroCanvasUiSpectralIntensity(1440)).toBe(0.52);
expect(resolveHeroCanvasUiSpectralIntensity(767)).toBe(0.4);
```

- [ ] **Step 2: Run the focused test and verify RED**

```powershell
npm test -- scene/hero-canvas-ui-spectral-source.test.ts
```

Expected: FAIL because the source still exposes `beams` and has no `fragments` property.

- [ ] **Step 3: Replace the TypeScript model**

Replace `HeroCanvasUiSpectralBeam` and the streak-angle constant with:

```ts
export type HeroCanvasUiSpectralFragmentKind = "lens" | "wedge" | "glint";

export interface HeroCanvasUiSpectralFragment {
  readonly center: readonly [number, number];
  readonly colorEnd: number;
  readonly colorStart: number;
  readonly kind: HeroCanvasUiSpectralFragmentKind;
  readonly phase: number;
  readonly size: readonly [number, number];
  readonly skew: number;
  readonly softness: number;
  readonly strength: number;
}

export const HERO_CANVAS_UI_SPECTRAL_FRAGMENT_ANGLE = 0.58;
```

- [ ] **Step 4: Replace `beams` with the approved ten-fragment field**

Use this exact initial configuration:

```ts
fragments: [
  {
    center: [0.16, 0.63], colorEnd: 1, colorStart: 0, kind: "lens", phase: 0,
    size: [0.105, 0.038], skew: 0.12, softness: 0.7, strength: 0.9,
  },
  {
    center: [0.27, 0.49], colorEnd: 0.48, colorStart: 0, kind: "wedge", phase: 0.03,
    size: [0.08, 0.026], skew: -0.18, softness: 0.65, strength: 0.62,
  },
  {
    center: [0.34, 0.67], colorEnd: 1, colorStart: 0.48, kind: "glint", phase: 0.1,
    size: [0.052, 0.016], skew: 0.2, softness: 0.82, strength: 0.52,
  },
  {
    center: [0.44, 0.58], colorEnd: 1, colorStart: 0, kind: "lens", phase: 0.05,
    size: [0.12, 0.044], skew: -0.12, softness: 0.74, strength: 0.96,
  },
  {
    center: [0.53, 0.42], colorEnd: 0.42, colorStart: 0, kind: "glint", phase: 0.08,
    size: [0.055, 0.014], skew: 0.16, softness: 0.86, strength: 0.42,
  },
  {
    center: [0.58, 0.69], colorEnd: 1, colorStart: 0.45, kind: "wedge", phase: 0.14,
    size: [0.078, 0.03], skew: -0.2, softness: 0.68, strength: 0.72,
  },
  {
    center: [0.66, 0.5], colorEnd: 1, colorStart: 0.38, kind: "lens", phase: 0.16,
    size: [0.09, 0.036], skew: 0.1, softness: 0.72, strength: 0.74,
  },
  {
    center: [0.73, 0.62], colorEnd: 1, colorStart: 0, kind: "wedge", phase: 0.21,
    size: [0.1, 0.034], skew: -0.15, softness: 0.65, strength: 0.84,
  },
  {
    center: [0.81, 0.43], colorEnd: 1, colorStart: 0.52, kind: "glint", phase: 0.24,
    size: [0.048, 0.013], skew: 0.22, softness: 0.88, strength: 0.44,
  },
  {
    center: [0.86, 0.58], colorEnd: 0.46, colorStart: 0, kind: "lens", phase: 0.28,
    size: [0.072, 0.028], skew: -0.08, softness: 0.76, strength: 0.58,
  },
] satisfies readonly HeroCanvasUiSpectralFragment[],
```

Keep `desktopIntensity: 0.52`, `mobileIntensity: 0.4`, `mobileBreakpoint: 768`, and `resolveHeroCanvasUiSpectralIntensity` unchanged.

- [ ] **Step 5: Run the focused test and verify GREEN for configuration**

```powershell
npm test -- scene/hero-canvas-ui-spectral-source.test.ts
```

Expected: the configuration test passes; the existing shader test may fail because it still imports `beams`.

- [ ] **Step 6: Commit the new source contract**

```powershell
git add -- scene/hero-canvas-ui-spectral-source-config.ts scene/hero-canvas-ui-spectral-source.test.ts
git commit -m "test(hero): define prismatic fragment field"
```

### Task 2: Render three localized prism shapes instead of streaks

**Files:**
- Modify: `scene/hero-canvas-ui-spectral-source.test.ts`
- Modify: `scene/hero-canvas-ui-spectral-source-shaders.ts`

- [ ] **Step 1: Write failing shader assertions**

Replace streak-specific assertions with:

```ts
expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER).toContain("spectralFragment");
expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER.match(/spectralFragment\(/g)).toHaveLength(11);
expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER).toContain("lensMask");
expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER).toContain("wedgeMask");
expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER).toContain("glintMask");
expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER).toContain("colorStart");
expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER).toContain("colorEnd");
expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER).not.toContain("spectralBeam");
expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER).not.toContain("streakWidth");
expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER).not.toContain("asymmetricEnvelope");
expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER).not.toContain("uTime");
expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER).not.toContain("uPointer");
expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER).not.toContain("whiteCore");
```

Keep the exact approved color assertions, `normalizeSpectrumColor`, `uniform float uIntensity`, and the material/quad cleanup tests.

- [ ] **Step 2: Run the focused test and verify RED**

```powershell
npm test -- scene/hero-canvas-ui-spectral-source.test.ts
```

Expected: FAIL because the shader still contains `spectralBeam`, streak helpers, and four generated calls.

- [ ] **Step 3: Translate fragment kinds at build time**

Add this TypeScript helper above the generated calls:

```ts
function fragmentKindToGlsl(kind: "lens" | "wedge" | "glint"): string {
  if (kind === "lens") return "0.0";
  if (kind === "wedge") return "1.0";
  return "2.0";
}
```

Generate calls from `HERO_CANVAS_UI_SPECTRAL_SOURCE_CONFIG.fragments`:

```ts
const fragmentCalls = HERO_CANVAS_UI_SPECTRAL_SOURCE_CONFIG.fragments
  .map(
    ({ center, colorEnd, colorStart, kind, phase, size, skew, softness, strength }) =>
      `field += spectralFragment(vUv, vec2(${toGlslFloat(center[0])}, ${toGlslFloat(center[1])}), vec2(${toGlslFloat(size[0])}, ${toGlslFloat(size[1])}), ${toGlslFloat(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_ANGLE)}, ${fragmentKindToGlsl(kind)}, ${toGlslFloat(strength)}, ${toGlslFloat(softness)}, ${toGlslFloat(skew)}, ${toGlslFloat(phase)}, ${toGlslFloat(colorStart)}, ${toGlslFloat(colorEnd)});`,
  )
  .join("\n");
```

Import `HERO_CANVAS_UI_SPECTRAL_FRAGMENT_ANGLE` beside the source config.

- [ ] **Step 4: Implement the three bounded GLSL masks**

Delete `streakWidth`, `asymmetricEnvelope`, `curvedCenterline`, `breakupMask`, and `spectralBeam`. Add:

```glsl
float maskEdge(float distanceValue, float softness) {
  float feather = mix(0.08, 0.38, softness);
  return 1.0 - smoothstep(1.0 - feather, 1.0, distanceValue);
}

float lensMask(vec2 point, float softness) {
  float distanceValue = length(point);
  float body = maskEdge(distanceValue, softness);
  float concentration = 0.72 + 0.28 * (1.0 - smoothstep(0.0, 0.75, distanceValue));
  return body * concentration;
}

float wedgeMask(vec2 point, float softness) {
  float axis = clamp(point.x * 0.5 + 0.5, 0.0, 1.0);
  float localWidth = mix(0.18, 1.0, smoothstep(0.0, 0.82, axis));
  float distanceValue = max(abs(point.x), abs(point.y) / max(localWidth, 0.001));
  float body = maskEdge(distanceValue, softness);
  float release = 1.0 - smoothstep(0.68, 1.0, axis);
  return body * mix(0.55, 1.0, axis) * release;
}

float glintMask(vec2 point, float softness) {
  float longitudinal = 1.0 - smoothstep(0.5, 1.0, abs(point.x));
  float transverse = 1.0 - smoothstep(0.22, 1.0, abs(point.y));
  float core = pow(max(longitudinal * transverse, 0.0), mix(1.8, 1.1, softness));
  return core;
}
```

- [ ] **Step 5: Implement color-windowed fragments**

Use this function:

```glsl
vec4 spectralFragment(
  vec2 uv,
  vec2 center,
  vec2 size,
  float angle,
  float kind,
  float strength,
  float softness,
  float skew,
  float phase,
  float colorStart,
  float colorEnd
) {
  float cosine = cos(angle);
  float sine = sin(angle);
  vec2 point = uv - center;
  point = mat2(cosine, -sine, sine, cosine) * point;
  point /= max(size, vec2(0.0001));
  point.y -= point.x * skew;

  float mask = lensMask(point, softness);
  if (kind > 0.5 && kind < 1.5) mask = wedgeMask(point, softness);
  if (kind >= 1.5) mask = glintMask(point, softness);

  float transverse = clamp((0.72 - point.y) / 1.44 + phase * 0.05, 0.0, 1.0);
  float palettePosition = mix(colorStart, colorEnd, transverse);
  vec3 color = spectralPalette(palettePosition) * 2.2;
  float alpha = mask * strength;
  return vec4(color * alpha, alpha);
}
```

Change `main` to accumulate `vec4 field`, inject `${fragmentCalls}`, and output `field` through the existing `uIntensity` calculation.

- [ ] **Step 6: Run focused tests and Biome**

```powershell
npm test -- scene/hero-canvas-ui-spectral-source.test.ts
npx biome check scene/hero-canvas-ui-spectral-source-config.ts scene/hero-canvas-ui-spectral-source-shaders.ts scene/hero-canvas-ui-spectral-source.test.ts
```

Expected: both commands pass; the generated shader contains one function plus ten calls and no beam/streak helpers.

- [ ] **Step 7: Commit the fragment shader**

```powershell
git add -- scene/hero-canvas-ui-spectral-source-shaders.ts scene/hero-canvas-ui-spectral-source.test.ts
git commit -m "feat(hero): render localized prismatic fragments"
```

### Task 3: Validate and tune the field against the reference

**Files:**
- Modify only when the visual comparison requires it: `scene/hero-canvas-ui-spectral-source-config.ts`
- Modify matching exact-value assertions when config tuning occurs: `scene/hero-canvas-ui-spectral-source.test.ts`

- [ ] **Step 1: Run integration verification**

```powershell
npm run typecheck
npm test -- scene/hero-canvas-ui-spectral-source.test.ts
npm run build
```

Expected: all commands exit with code 0.

- [ ] **Step 2: Serve the static production output**

```powershell
npx serve@latest out -l 3010
```

Open `http://127.0.0.1:3010/?effects=full&glass=canvas-ui&v=fragments` in the collaborative preview at 1440×900.

- [ ] **Step 3: Verify the desktop acceptance criteria**

Confirm against the supplied reference:

- reflections can no longer be counted as four large bands;
- multiple isolated fragments appear in different parts of `NOIR`;
- lens, wedge, and short-glint silhouettes are visible;
- some fragments are full-spectrum, some warm, and some cool;
- neutral glass remains between fragments;
- all fragments retain the common lower-left to upper-right bias;
- edges, illumination, stickers, and pointer behavior are unchanged.

- [ ] **Step 4: Verify mobile at 390×844**

Confirm that the responsive intensity keeps fragments visible without filling entire letterforms and that hero layout, text, button, cursor model, and sticker depth remain unchanged.

- [ ] **Step 5: Apply one configuration-only tuning pass if required**

Use only these bounded adjustments, based on visible evidence:

- fragment too broad: reduce that fragment's `size[1]` by 10–15%;
- fragment too long: reduce that fragment's `size[0]` by 10%;
- fragment too dominant: reduce only its `strength` by 0.08–0.12;
- empty region: move the nearest fragment's `center` by no more than 0.04 on either axis;
- insufficient color variety: adjust only `colorStart` or `colorEnd`, preserving `0 <= start < end <= 1`;
- do not change environment intensity, material, lights, palette, renderer, or responsive global intensity during shape tuning.

- [ ] **Step 6: Run final proof after the last tuning change**

```powershell
npm test -- scene/hero-canvas-ui-spectral-source.test.ts
npx biome check scene/hero-canvas-ui-spectral-source-config.ts scene/hero-canvas-ui-spectral-source-shaders.ts scene/hero-canvas-ui-spectral-source.test.ts
npm run typecheck
npm run build
```

Expected: all commands pass after the final relevant change.

- [ ] **Step 7: Commit tuning only when Step 5 changed files**

```powershell
git add -- scene/hero-canvas-ui-spectral-source-config.ts scene/hero-canvas-ui-spectral-source.test.ts
git commit -m "fix(hero): tune prismatic fragment distribution"
```
