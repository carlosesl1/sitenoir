# Footer Chrome Matcap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render the footer contact model as polished silver chrome with a bright face, black reflected bands, and crisp white rims while leaving the hero unchanged.

**Architecture:** Replace the contact-only PMREM path with one procedural 256 px grayscale matcap. `useGraphiteAsset` will select `MeshMatcapMaterial` only for contact GLBs and keep the existing `MeshPhysicalMaterial` for the hero, cursor, and other graphite assets.

**Tech Stack:** React Three Fiber, Three.js `DataTexture` and `MeshMatcapMaterial`, Vitest, Biome, Next.js.

---

### Task 1: Generate and test the chrome matcap

**Files:**
- Create: `scene/contact-chrome-matcap.ts`
- Create: `scene/contact-chrome-matcap.test.ts`
- Delete: `scene/contact-chrome-environment.ts`
- Delete: `scene/contact-chrome-environment.test.ts`
- Delete: `scene/contact-chrome-material.ts`
- Delete: `scene/contact-chrome-material.test.ts`

- [ ] **Step 1: Write the failing optical-profile test**

```ts
import { describe, expect, it } from "vitest";

import { sampleContactChromeMatcap } from "@/scene/contact-chrome-matcap";

describe("sampleContactChromeMatcap", () => {
  it("creates the white-black-white profile that reads as polished chrome", () => {
    expect(sampleContactChromeMatcap(0, 0)).toBeGreaterThan(0.82);
    expect(sampleContactChromeMatcap(0.62, 0)).toBeLessThan(0.18);
    expect(sampleContactChromeMatcap(0.92, 0)).toBeGreaterThan(0.72);
  });
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `npm test -- scene/contact-chrome-matcap.test.ts`

Expected: FAIL because `contact-chrome-matcap.ts` does not exist.

- [ ] **Step 3: Implement the procedural matcap**

Create a pure `sampleContactChromeMatcap(nx, ny)` function with a bright center, a dark Gaussian ring around radius `0.62`, a narrow diagonal white reflection, and a bright outer rim. Generate a 256 x 256 RGBA `DataTexture`, set `SRGBColorSpace`, linear filtering, no mipmaps, and `needsUpdate = true`.

```ts
export function sampleContactChromeMatcap(nx: number, ny: number): number {
  const radius = Math.min(1, Math.hypot(nx, ny));
  const brightFace = 0.9 - radius * 0.16;
  const darkBand = Math.exp(-((radius - 0.62) / 0.12) ** 2) * 0.86;
  const rim = smoothstep(0.78, 0.98, radius) * 0.76;
  const diagonal = Math.exp(-((ny + nx * 0.28 - 0.06) / 0.055) ** 2) * 0.24;
  return clamp(brightFace - darkBand + rim + diagonal, 0.015, 1);
}
```

- [ ] **Step 4: Run the matcap test**

Run: `npm test -- scene/contact-chrome-matcap.test.ts`

Expected: PASS.

### Task 2: Bind the matcap only to the footer model

**Files:**
- Modify: `scene/GraphiteAsset.ts`
- Test: `scene/contact-chrome-matcap.test.ts`

- [ ] **Step 1: Remove the contact PMREM dependency**

Remove `useThree`, `createContactChromeEnvironment`, `CONTACT_CHROME_MATERIAL`, the environment memo, `envMap`, and the environment cleanup from `useGraphiteAsset`.

- [ ] **Step 2: Select the material by asset role**

Memoize `createContactChromeMatcap()` only when `isContactAsset` is true. Return a neutral `MeshMatcapMaterial` for contact assets and preserve the existing `MeshPhysicalMaterial` values for all other assets.

```ts
const contactMatcap = useMemo(
  () => (isContactAsset ? createContactChromeMatcap() : null),
  [isContactAsset],
);
const material = useMemo(
  () =>
    isContactAsset
      ? new MeshMatcapMaterial({ color: dark ? "#ffffff" : "#e3e6e9", matcap: contactMatcap, toneMapped: false })
      : new MeshPhysicalMaterial(existingNonContactValues),
  [contactMatcap, dark, isContactAsset, isCursorAsset, isHeroAsset],
);
```

- [ ] **Step 3: Dispose footer-only GPU resources**

Keep the existing material cleanup and add a separate texture cleanup:

```ts
useEffect(() => () => material.dispose(), [material]);
useEffect(() => () => contactMatcap?.dispose(), [contactMatcap]);
```

- [ ] **Step 4: Run focused verification**

Run: `npm test -- scene/contact-chrome-matcap.test.ts`

Expected: PASS.

Run: `npm run check`

Expected: Biome reports no errors.

### Task 3: Production and visual verification

**Files:**
- Verify: `scene/GraphiteAsset.ts`
- Verify: `scene/contact-chrome-matcap.ts`

- [ ] **Step 1: Build production output**

Run: `npm run build`

Expected: Next.js compiles, TypeScript passes, and all routes are generated.

- [ ] **Step 2: Inspect the desktop footer**

Open `http://127.0.0.1:3000/#contact` after the entrance sequence.

Expected: the contact model has a silver-white face, black mirrored bands on angled/extruded faces, white rim highlights, visible depth during pointer rotation, and the existing compact spectral flare.

- [ ] **Step 3: Confirm isolation**

Open `http://127.0.0.1:3000/` and inspect the console.

Expected: the hero material is visually unchanged and the browser console contains no errors.
