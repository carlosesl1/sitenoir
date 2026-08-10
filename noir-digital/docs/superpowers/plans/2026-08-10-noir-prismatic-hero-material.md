# NOIR Prismatic Hero Material Implementation Plan

> **For agentic workers:** Execute directly by default. Use subagents only for independent bounded lanes that satisfy the global harness policy. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the existing 3D `NOIR` hero read as dark prismatic glass instead of opaque gray while preserving its geometry, layout, motion, refraction pipeline, and surrounding composition.

**Architecture:** Keep the current GLB, `ShaderMaterial`, scene-refraction buffer, pointer light, and post-processing passes. Add explicit face-transmission, neutral-rim, and spectral-rim controls to the existing configuration, wire them as static uniforms, and concentrate the already sampled RGB refraction into grazing-angle masks inside the current fragment shader.

**Tech Stack:** Next.js 16, React 19, React Three Fiber 9, Three.js 0.185, GLSL/WebGL, Vitest 4, Biome 2, T3 collaborative preview.

---

## File structure

- Create `scene/hero-glass-shaders.test.ts`: contract tests for the prismatic controls and shader composition.
- Modify `scene/hero-glass-config.ts`: single source of truth for the initial dark/light calibration.
- Modify `scene/HeroGlassAsset.tsx`: pass the new static configuration values into the existing material as uniforms.
- Modify `scene/hero-glass-shaders.ts`: attenuate front-facing mass and add neutral/spectral grazing-angle rims without a new render pass.
- Do not modify the GLB, hero layout, motion, refraction buffer, lens flare, cursor, stickers, text, or CSS.

### Task 1: Lock the prismatic material contract with a failing test

**Files:**
- Create: `scene/hero-glass-shaders.test.ts`
- Read: `scene/hero-glass-config.ts`
- Read: `scene/hero-glass-shaders.ts`

- [ ] **Step 1: Create the contract test**

Create `scene/hero-glass-shaders.test.ts` with:

```ts
import { describe, expect, it } from "vitest";

import { HERO_GLASS_CONFIG } from "@/scene/hero-glass-config";
import { HERO_GLASS_FRAGMENT_SHADER } from "@/scene/hero-glass-shaders";

describe("hero prismatic glass material", () => {
  it("keeps the dark face restrained while reserving energy for the rims", () => {
    expect(HERO_GLASS_CONFIG.dark.faceTransmission).toBeLessThan(0.35);
    expect(HERO_GLASS_CONFIG.dark.neutralRimStrength).toBeGreaterThan(
      HERO_GLASS_CONFIG.dark.faceTransmission,
    );
    expect(HERO_GLASS_CONFIG.dark.spectralRimStrength).toBeGreaterThan(0.5);
    expect(HERO_GLASS_CONFIG.dark.neutralRimPower).toBeGreaterThan(
      HERO_GLASS_CONFIG.dark.spectralRimPower,
    );
  });

  it("defines explicit face, neutral-rim, and spectral-rim shader controls", () => {
    for (const uniform of [
      "uFaceTransmission",
      "uNeutralRimPower",
      "uNeutralRimStrength",
      "uSpectralRimPower",
      "uSpectralRimStrength",
      "uSpectralSaturation",
    ]) {
      expect(HERO_GLASS_FRAGMENT_SHADER).toContain(`uniform float ${uniform};`);
    }
  });

  it("concentrates color and white light at grazing angles without alpha blending", () => {
    expect(HERO_GLASS_FRAGMENT_SHADER).toContain(
      "float grazing = clamp(1.0 - viewAlignment, 0.0, 1.0);",
    );
    expect(HERO_GLASS_FRAGMENT_SHADER).toContain("color *= faceAttenuation;");
    expect(HERO_GLASS_FRAGMENT_SHADER).toContain("color += spectralSource * spectralRim;");
    expect(HERO_GLASS_FRAGMENT_SHADER).toContain("color += vec3(neutralRim);");
    expect(HERO_GLASS_FRAGMENT_SHADER).toContain("gl_FragColor = vec4(color, 1.0);");
  });
});
```

- [ ] **Step 2: Run the test and verify the red state**

Run:

```powershell
npx vitest run scene/hero-glass-shaders.test.ts --maxWorkers=1
```

Expected: FAIL because the new configuration properties and GLSL uniforms do not exist yet.

### Task 2: Add the minimal shader refinement

**Files:**
- Modify: `scene/hero-glass-config.ts`
- Modify: `scene/HeroGlassAsset.tsx:80-115`
- Modify: `scene/hero-glass-shaders.ts:17-50`
- Modify: `scene/hero-glass-shaders.ts:140-179`
- Test: `scene/hero-glass-shaders.test.ts`

- [ ] **Step 1: Replace the glass configuration with the calibrated controls**

Keep the existing object shape and replace `scene/hero-glass-config.ts` with:

```ts
export const HERO_GLASS_CONFIG = {
  ior: {
    red: 1.15,
    yellow: 1.16,
    green: 1.18,
    cyan: 1.22,
    blue: 1.22,
    purple: 1.22,
  },
  refractPower: 0.72,
  chromaticAberration: 0.18,
  loopCount: 3,
  specularStrength: 1.2,
  spectralSaturation: 2.4,
  lightZ: 0.5,
  dark: {
    shininess: 120,
    diffuseness: 0.025,
    fresnelPower: 3.2,
    fresnelStrength: 0.62,
    brightness: 0.5,
    contrast: 1.08,
    gamma: 0.96,
    saturation: 1.45,
    faceTransmission: 0.22,
    neutralRimPower: 5.5,
    neutralRimStrength: 0.88,
    spectralRimPower: 2.1,
    spectralRimStrength: 0.95,
    tintColorA: "#f4f4f0",
    tintColorB: "#dde8ff",
    tintMinimumAlpha: 0.42,
    tintMaximumAlpha: 0.12,
  },
  light: {
    shininess: 120,
    diffuseness: 0.08,
    fresnelPower: 1.4,
    fresnelStrength: 0.22,
    brightness: 0.74,
    contrast: 0.94,
    gamma: 1,
    saturation: 1.25,
    faceTransmission: 0.62,
    neutralRimPower: 5.5,
    neutralRimStrength: 0.34,
    spectralRimPower: 2.4,
    spectralRimStrength: 0.5,
    tintColorA: "#22d6d6",
    tintColorB: "#a855f7",
    tintMinimumAlpha: 0.82,
    tintMaximumAlpha: 0.68,
  },
  tintMix: 1,
  fresnelSideDirection: [-1, 1, -1],
  renderLayer: 10,
  resolutionScale: 0.5,
} as const;
```

- [ ] **Step 2: Wire the new values into the existing material**

In `scene/HeroGlassAsset.tsx`, add these entries inside the existing `uniforms` object; do not change the material lifecycle or `useFrame`:

```ts
uFaceTransmission: { value: theme.faceTransmission },
uNeutralRimPower: { value: theme.neutralRimPower },
uNeutralRimStrength: { value: theme.neutralRimStrength },
uSpectralRimPower: { value: theme.spectralRimPower },
uSpectralRimStrength: { value: theme.spectralRimStrength },
uSpectralSaturation: { value: HERO_GLASS_CONFIG.spectralSaturation },
```

Place `uFaceTransmission` after `uFresnelStrength`, the neutral-rim entries after `uLoop`, and the spectral entries after `uSpecularStrength` so related controls remain grouped.

- [ ] **Step 3: Declare the uniforms in the fragment shader**

In `scene/hero-glass-shaders.ts`, add:

```glsl
uniform float uFaceTransmission;
uniform float uNeutralRimPower;
uniform float uNeutralRimStrength;
uniform float uSpectralRimPower;
uniform float uSpectralRimStrength;
uniform float uSpectralSaturation;
```

Keep every existing IOR, tint, refraction, theme, and lighting uniform.

- [ ] **Step 4: Replace the grading and edge-composition tail**

Immediately after the refraction branch closes, replace the current grading/tint/lighting block with this complete block:

```glsl
  vec3 refractedSpectrum = max(color, vec3(0.0));
  color = saturation(color, uSaturation);
  color *= uBrightness;
  color = (color - 0.5) * uContrast + 0.5;
  color = pow(max(color, 0.0), vec3(1.0 / max(uGamma, 0.0001)));

  float viewAlignment = abs(dot(normal, eyeDirection));
  float grazing = clamp(1.0 - viewAlignment, 0.0, 1.0);
  float frontFacing = smoothstep(0.08, 0.9, viewAlignment);

  float gradientRange = max(uTintLocalYRange.y - uTintLocalYRange.x, 0.00001);
  float gradientFactor = clamp((modelLocalY - uTintLocalYRange.x) / gradientRange, 0.0, 1.0);
  vec4 tint = mix(uTintColorB, uTintColorA, gradientFactor);
  float tintAlpha = clamp(tint.a, 0.0, 1.0);
  tintAlpha *= mix(
    clamp(uTintThicknessMaxAlpha, 0.0, 1.0),
    clamp(uTintThicknessMinAlpha, 0.0, 1.0),
    grazing
  );

  float beerMix = clamp(uTintEnabled, 0.0, 1.0) * tintAlpha;
  vec3 transmittance = pow(clamp(tint.rgb, 0.001, 1.0), vec3(clamp(uTintMix, 0.01, 3.0)));
  vec3 beerColor = mix(color, color * transmittance, beerMix);
  float hardMix = clamp(uTintEnabled, 0.0, 1.0) * clamp(uTintMix, 0.0, 1.0) * tintAlpha;
  vec3 base = clamp(color, 0.0, 1.0);
  vec3 blend = clamp(tint.rgb, 0.0, 1.0);
  vec3 hard = mix(
    2.0 * base * blend,
    1.0 - 2.0 * (1.0 - base) * (1.0 - blend),
    step(vec3(0.5), blend)
  );
  color = mix(beerColor, mix(color, hard, hardMix), clamp(uDark, 0.0, 1.0));

  float faceAttenuation = mix(
    1.0,
    clamp(uFaceTransmission, 0.0, 1.0),
    frontFacing
  );
  float spectralRim = pow(grazing, max(uSpectralRimPower, 0.0001))
    * max(uSpectralRimStrength, 0.0);
  float neutralRim = pow(grazing, max(uNeutralRimPower, 0.0001))
    * max(uNeutralRimStrength, 0.0);
  vec3 spectralSource = saturation(
    refractedSpectrum,
    max(uSpectralSaturation, 1.0)
  );

  color *= faceAttenuation;
  color += spectralSource * spectralRim;
  color += vec3(neutralRim);
  color = mix(
    color,
    uGlassBaseColor,
    clamp(uGlassBaseStrength, 0.0, 1.0) * frontFacing
  );
  color += specular(uLight, normal, eyeDirection, uShininess, uDiffuseness) * uSpecularStrength;
  float fresnelLight = fresnel(eyeDirection, normal, uFresnelPower);
  float sideMask = smoothstep(-0.5, 0.5, dot(normal, normalize(uFresnelSideDir)));
  color += fresnelLight * sideMask * vec3(uFresnelStrength);

  gl_FragColor = vec4(color, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
```

Do not change `gl_FragColor` alpha from `1.0`; perceived transparency must remain scene refraction, not mesh alpha blending.

- [ ] **Step 5: Run the focused test and verify the green state**

Run:

```powershell
npx vitest run scene/hero-glass-shaders.test.ts --maxWorkers=1
```

Expected: 3 tests pass, 0 fail.

- [ ] **Step 6: Run focused static checks**

Run:

```powershell
npx biome check scene/hero-glass-config.ts scene/hero-glass-shaders.ts scene/HeroGlassAsset.tsx scene/hero-glass-shaders.test.ts
npm run typecheck
```

Expected: Biome exits 0 with no diagnostics; typecheck exits 0.

- [ ] **Step 7: Commit the coherent shader change**

```powershell
git add -- scene/hero-glass-config.ts scene/hero-glass-shaders.ts scene/HeroGlassAsset.tsx scene/hero-glass-shaders.test.ts
git diff --cached --check
git commit -m "feat(hero): render NOIR as prismatic glass"
```

Expected: one commit containing only the four listed files.

### Task 3: Inspect and calibrate the material in one visual batch

**Files:**
- Modify only if the first render misses the target: `scene/hero-glass-config.ts`
- Do not modify: geometry, layout, motion, refraction buffer, lens flare, cursor, stickers, hero CSS, or copy.

- [ ] **Step 1: Start the isolated preview**

Run from the worktree app directory:

```powershell
npm run dev -- --port 3100
```

Expected: Next.js serves `http://127.0.0.1:3100` from branch `codex/noir-prismatic-glass`.

- [ ] **Step 2: Capture the first grouped inspection**

Use the T3 collaborative preview at:

```text
http://127.0.0.1:3100/?effects=on
```

Inspect dark theme at desktop 1920 × 1080 and mobile 390 × 844, then inspect light theme at desktop. Wait for the entry preloader and scene-ready state before judging the material.

Expected dark-theme signals:

- face mass is near-black rather than mid-gray;
- background remains perceptible through refraction;
- white rim is crisp and narrower than the letter strokes;
- spectral color is concentrated around bevels and corners;
- pointer movement shifts highlights without flashing the whole face;
- texts, CTA, grid, cursor, stickers, scale, placement, and motion match the baseline composition.

- [ ] **Step 3: Apply at most one configuration-only calibration batch**

If the first render misses the target, change only these existing values in `scene/hero-glass-config.ts`, using the matching bounded adjustment once:

- face still gray: `dark.faceTransmission` from `0.22` to `0.16` and `dark.brightness` from `0.50` to `0.44`;
- rim too broad: `dark.neutralRimPower` from `5.5` to `6.5`;
- rim too weak: `dark.neutralRimStrength` from `0.88` to `1.02`;
- rainbow washes across faces: `dark.spectralRimPower` from `2.1` to `2.7` and `dark.spectralRimStrength` from `0.95` to `0.78`;
- spectrum is too faint: `dark.spectralRimStrength` from `0.95` to `1.12`;
- light theme clips to white: `light.neutralRimStrength` from `0.34` to `0.24` and `light.brightness` from `0.74` to `0.68`.

Do not combine opposite adjustments. Make one coherent batch from the observed defects, then stop tuning after the confirmation pass.

- [ ] **Step 4: Run the confirmation pass**

Repeat the same three view checks once. Confirm no horizontal overflow, no console/WebGL errors, and no geometry or composition change.

- [ ] **Step 5: Verify and commit any calibration**

If `scene/hero-glass-config.ts` changed:

```powershell
npx vitest run scene/hero-glass-shaders.test.ts --maxWorkers=1
npx biome check scene/hero-glass-config.ts
git add -- scene/hero-glass-config.ts
git diff --cached --check
git commit -m "refine(hero): calibrate prismatic glass"
```

Expected: 3 tests pass; Biome exits 0; the commit contains only the config file. If no calibration was needed, do not create an empty commit.

### Task 4: Run final integration verification

**Files:**
- Verify: `scene/hero-glass-config.ts`
- Verify: `scene/hero-glass-shaders.ts`
- Verify: `scene/HeroGlassAsset.tsx`
- Verify: `scene/hero-glass-shaders.test.ts`

- [ ] **Step 1: Run the focused regression set**

```powershell
npx vitest run scene/hero-glass-shaders.test.ts scene/hero-motion.test.ts scene/scene-layout.test.ts scene/scene-program-compile.test.ts --maxWorkers=4
```

Expected: all listed test files pass. Report the exact test count rather than inferring the full suite is healthy.

- [ ] **Step 2: Run final project checks after the last visual change**

```powershell
npx biome check scene/hero-glass-config.ts scene/hero-glass-shaders.ts scene/HeroGlassAsset.tsx scene/hero-glass-shaders.test.ts
npm run typecheck
npm run build
```

Expected: all commands exit 0; the production build completes without shader, TypeScript, or static-export errors.

- [ ] **Step 3: Inspect the final branch diff**

```powershell
git status --short
git diff --stat f91c220..HEAD
git log --oneline --decorate f91c220..HEAD
```

Expected: a clean worktree. The branch contains the design spec, this implementation plan, the shader/config/uniform/test change, and at most one config-only visual calibration commit. It contains no generated assets, dependency changes, layout edits, or companion files.

- [ ] **Step 4: Hand off the local test without publishing**

Report:

- branch `codex/noir-prismatic-glass`;
- worktree path `C:\Users\Carlos\.config\superpowers\worktrees\site\noir-prismatic-glass`;
- commit IDs created;
- focused test, Biome, typecheck, build, desktop/mobile, theme, console, and overflow evidence;
- the pre-existing incomplete full-suite baseline;
- explicit statement that nothing was pushed, merged, deployed, or published.
