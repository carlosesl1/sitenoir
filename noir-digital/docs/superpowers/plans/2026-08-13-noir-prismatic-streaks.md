# NOIR Prismatic Streaks Implementation Plan

> **For agentic workers:** Execute directly by default. Use subagents only for independent bounded lanes that satisfy the global harness policy. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the flat spectral ribbons inside the Canvas UI NOIR with localized, tapered, slightly curved prismatic streaks matching the approved reference.

**Architecture:** Keep the existing single fullscreen spectral source and refraction pipeline. Expand each beam's static shape configuration, then replace the constant-width Gaussian mask with an asymmetric longitudinal envelope, three-point width interpolation, restrained curvature, and deterministic low-frequency breakup; retain the exact four-color palette and no time or pointer uniforms.

**Tech Stack:** TypeScript, Three.js `ShaderMaterial`, GLSL, Vitest, Biome, Next.js 16.

---

## File map

- Modify `scene/hero-canvas-ui-spectral-source-config.ts`: define the new streak-shape contract and tuned beam values.
- Modify `scene/hero-canvas-ui-spectral-source-shaders.ts`: generate the expanded GLSL calls and implement the tapered streak mask.
- Modify `scene/hero-canvas-ui-spectral-source.test.ts`: lock the shape contract, exact palette, static behavior, and one-pass rendering.
- No changes to the GLB, refraction buffer, hero composition, stickers, pointer handling, or default glass variant.

### Task 1: Lock the streak-shape configuration contract

**Files:**
- Modify: `scene/hero-canvas-ui-spectral-source.test.ts`
- Modify: `scene/hero-canvas-ui-spectral-source-config.ts`

- [ ] **Step 1: Replace the old fixed-width assertions with a failing streak-shape contract**

Update the first test to assert that every beam has three widths, restrained curvature, and a deterministic breakup amount:

```ts
expect(HERO_CANVAS_UI_SPECTRAL_SOURCE_CONFIG.beams).toMatchObject([
  {
    angle: -0.65,
    center: [0.24, 0.64],
    length: 0.15,
    widthStart: 0.018,
    widthMid: 0.044,
    widthEnd: 0.024,
    curve: 0.012,
    breakup: 0.12,
  },
  {
    angle: 0.48,
    center: [0.44, 0.46],
    length: 0.18,
    widthStart: 0.02,
    widthMid: 0.05,
    widthEnd: 0.018,
    curve: -0.01,
    breakup: 0.16,
  },
  {
    angle: -0.42,
    center: [0.63, 0.65],
    length: 0.13,
    widthStart: 0.014,
    widthMid: 0.038,
    widthEnd: 0.021,
    curve: 0.009,
    breakup: 0.2,
  },
  {
    angle: 0.62,
    center: [0.78, 0.53],
    length: 0.14,
    widthStart: 0.012,
    widthMid: 0.034,
    widthEnd: 0.016,
    curve: -0.008,
    breakup: 0.22,
  },
]);

for (const beam of HERO_CANVAS_UI_SPECTRAL_SOURCE_CONFIG.beams) {
  expect(beam.widthStart).toBeGreaterThan(0);
  expect(beam.widthMid).toBeGreaterThan(beam.widthStart);
  expect(beam.widthMid).toBeGreaterThan(beam.widthEnd);
  expect(beam.widthMid).toBeLessThan(0.08);
  expect(Math.abs(beam.curve)).toBeLessThanOrEqual(0.015);
  expect(beam.breakup).toBeGreaterThanOrEqual(0);
  expect(beam.breakup).toBeLessThanOrEqual(0.25);
}
```

Remove assertions for the deleted `width` property. Keep the current intensity, palette, viewport, and bounded-position assertions.

- [ ] **Step 2: Run the focused test and confirm the contract fails**

Run:

```powershell
npm test -- scene/hero-canvas-ui-spectral-source.test.ts
```

Expected: FAIL because `widthStart`, `widthMid`, `widthEnd`, `curve`, and `breakup` do not exist yet.

- [ ] **Step 3: Implement the minimal typed configuration**

Replace `HeroCanvasUiSpectralBeam` with:

```ts
export interface HeroCanvasUiSpectralBeam {
  readonly angle: number;
  readonly breakup: number;
  readonly center: readonly [number, number];
  readonly curve: number;
  readonly length: number;
  readonly phase: number;
  readonly strength: number;
  readonly widthEnd: number;
  readonly widthMid: number;
  readonly widthStart: number;
}
```

Replace the four beam objects with the exact values asserted in Step 1, preserving the existing `phase`, `strength`, desktop/mobile intensity, and breakpoint values.

- [ ] **Step 4: Run the focused test and confirm the configuration passes**

Run:

```powershell
npm test -- scene/hero-canvas-ui-spectral-source.test.ts
```

Expected: the configuration test passes; the shader test may still fail once its new expectations are added in Task 2.

- [ ] **Step 5: Commit the shape contract**

```powershell
git add -- scene/hero-canvas-ui-spectral-source-config.ts scene/hero-canvas-ui-spectral-source.test.ts
git commit -m "test(hero): define prismatic streak shape contract"
```

### Task 2: Replace the flat ribbon mask with tapered prismatic streaks

**Files:**
- Modify: `scene/hero-canvas-ui-spectral-source.test.ts`
- Modify: `scene/hero-canvas-ui-spectral-source-shaders.ts`

- [ ] **Step 1: Add failing assertions for the new shader behavior**

In the shader test, replace the old Gaussian-mask assertion with:

```ts
expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER).toContain("streakWidth");
expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER).toContain("asymmetricEnvelope");
expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER).toContain("curvedCenterline");
expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER).toContain("breakupMask");
expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER).toContain("widthStart");
expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER).toContain("widthMid");
expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER).toContain("widthEnd");
expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER).not.toContain(
  "exp(-pow(abs(point.y) / width, 2.0))",
);
expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER).not.toContain("uTime");
expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER).not.toContain("uPointer");
expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER).not.toContain("float whiteCore");
```

Keep the four exact palette assertions and the assertion that five `spectralBeam(` occurrences exist: one function plus four calls.

- [ ] **Step 2: Run the focused test and confirm the shader assertions fail**

Run:

```powershell
npm test -- scene/hero-canvas-ui-spectral-source.test.ts
```

Expected: FAIL because the current shader still uses one constant `width` and a symmetric Gaussian ribbon.

- [ ] **Step 3: Expand generated beam calls**

Change the `beamCalls` destructuring and generated call to pass:

```ts
({
  angle,
  breakup,
  center,
  curve,
  length,
  phase,
  strength,
  widthEnd,
  widthMid,
  widthStart,
}) =>
  `beam += spectralBeam(vUv, vec2(${toGlslFloat(center[0])}, ${toGlslFloat(center[1])}), ${toGlslFloat(angle)}, ${toGlslFloat(length)}, ${toGlslFloat(widthStart)}, ${toGlslFloat(widthMid)}, ${toGlslFloat(widthEnd)}, ${toGlslFloat(curve)}, ${toGlslFloat(breakup)}, ${toGlslFloat(strength)}, ${toGlslFloat(phase)});`
```

- [ ] **Step 4: Implement the static shape helpers in GLSL**

Insert these helpers before `spectralBeam`:

```glsl
float streakWidth(float axisPosition, float widthStart, float widthMid, float widthEnd) {
  float firstHalf = smoothstep(0.0, 0.5, axisPosition);
  float secondHalf = smoothstep(0.5, 1.0, axisPosition);
  float opening = mix(widthStart, widthMid, firstHalf);
  return mix(opening, widthEnd, secondHalf);
}

float asymmetricEnvelope(float axisPosition) {
  float attack = smoothstep(0.0, 0.16, axisPosition);
  float release = 1.0 - smoothstep(0.7, 1.0, axisPosition);
  return attack * release;
}

float curvedCenterline(float axisPosition, float curve) {
  float centered = axisPosition - 0.5;
  return curve * (centered * centered * 4.0 - 0.35);
}

float breakupMask(float axisPosition, float phase, float breakup) {
  float broad = sin(axisPosition * 13.0 + phase * 17.0);
  float fine = sin(axisPosition * 29.0 - phase * 11.0);
  float variation = 0.5 + 0.32 * broad + 0.18 * fine;
  return mix(1.0, smoothstep(-0.15, 0.8, variation), breakup);
}
```

These functions are static and texture-free. The restrained curvature prevents a perfectly mechanical stripe without turning it into a wavy ribbon.

- [ ] **Step 5: Replace `spectralBeam` with the tapered mask**

Use this signature and body:

```glsl
vec4 spectralBeam(
  vec2 uv,
  vec2 center,
  float angle,
  float beamLength,
  float widthStart,
  float widthMid,
  float widthEnd,
  float curve,
  float breakup,
  float strength,
  float phase
) {
  float cosine = cos(angle);
  float sine = sin(angle);
  vec2 point = uv - center;
  point = mat2(cosine, -sine, sine, cosine) * point;

  float axisPosition = point.x / max(beamLength * 2.0, 0.0001) + 0.5;
  float localWidth = streakWidth(axisPosition, widthStart, widthMid, widthEnd);
  float centerline = curvedCenterline(axisPosition, curve);
  float transversePosition = (point.y - centerline) / max(localWidth, 0.0001);

  float longitudinal = asymmetricEnvelope(axisPosition);
  float transverse = 1.0 - smoothstep(0.68, 1.08, abs(transversePosition));
  float caustic = pow(max(transverse, 0.0), 1.35);
  float irregularity = breakupMask(axisPosition, phase, breakup);
  float mask = longitudinal * caustic * irregularity * strength;

  vec3 color = dispersedSpectrum(transversePosition, phase);
  return vec4(color * mask, mask);
}
```

Keep `spectralPalette`, the four approved colors, `normalizeSpectrumColor`, and the absence of a white core. Update `dispersedSpectrum` only if needed to clamp the palette lookup while retaining the same ordering:

```glsl
float palettePosition = clamp((0.72 - transversePosition) / 1.44 + phase * 0.05, 0.0, 1.0);
```

- [ ] **Step 6: Run focused tests and formatting checks**

Run:

```powershell
npm test -- scene/hero-canvas-ui-spectral-source.test.ts
npx biome check scene/hero-canvas-ui-spectral-source-config.ts scene/hero-canvas-ui-spectral-source-shaders.ts scene/hero-canvas-ui-spectral-source.test.ts
```

Expected: both commands pass with four configured streaks, one fullscreen render, no `uTime`, no pointer uniform, and no white spectral core.

- [ ] **Step 7: Commit the shader implementation**

```powershell
git add -- scene/hero-canvas-ui-spectral-source-shaders.ts scene/hero-canvas-ui-spectral-source.test.ts
git commit -m "feat(hero): shape spectral light into prismatic streaks"
```

### Task 3: Integrate and visually tune without changing architecture

**Files:**
- Modify only if visual evidence requires tuning: `scene/hero-canvas-ui-spectral-source-config.ts`

- [ ] **Step 1: Run the integration checks after the shader change**

```powershell
npm run typecheck
npm test -- scene/hero-canvas-ui-spectral-source.test.ts
npm run build
```

Expected: all commands exit with code 0.

- [ ] **Step 2: Start the production build on a free localhost port**

```powershell
npm run start -- --port 3010
```

Open `http://127.0.0.1:3010/?effects=full&glass=canvas-ui` in the collaborative preview.

- [ ] **Step 3: Compare against the approved reference at desktop size**

Verify at 1440×900:

- the body remains dark and transparent;
- each visible spectrum is a localized diagonal streak with tapered ends;
- no streak looks like a uniform rectangular band or circular blob;
- the four approved colors remain recognizable without a white center;
- bright edges remain thin and predominantly white;
- stickers stay behind the 3D model;
- pointer movement does not change illumination.

- [ ] **Step 4: Check mobile behavior**

Verify at 390×844 that the lower mobile intensity remains legible without covering the letterforms and that the hero layout is unchanged.

- [ ] **Step 5: Apply at most one evidence-led configuration tuning pass**

If the streaks are too broad, reduce only `widthMid` values by 10%. If they are too weak, raise only `desktopIntensity` from `0.52` to at most `0.58` and `mobileIntensity` from `0.4` to at most `0.44`. Do not alter the glass material, environment intensity, lights, refraction pipeline, or palette to compensate for streak shape.

- [ ] **Step 6: Re-run final proof after any tuning**

```powershell
npm test -- scene/hero-canvas-ui-spectral-source.test.ts
npx biome check scene/hero-canvas-ui-spectral-source-config.ts scene/hero-canvas-ui-spectral-source-shaders.ts scene/hero-canvas-ui-spectral-source.test.ts
npm run typecheck
npm run build
```

Expected: all commands pass after the final relevant change.

- [ ] **Step 7: Commit visual tuning only if Step 5 changed the config**

```powershell
git add -- scene/hero-canvas-ui-spectral-source-config.ts scene/hero-canvas-ui-spectral-source.test.ts
git commit -m "fix(hero): tune prismatic streak proportions"
```
