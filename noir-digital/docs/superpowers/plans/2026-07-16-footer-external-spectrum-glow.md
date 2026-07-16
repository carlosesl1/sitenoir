# Footer External Spectrum Glow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the footer's full-surface spectral flare with a compact rainbow halo rendered only outside the contact model's external silhouette.

**Architecture:** Rasterize the loaded contact GLB into a local XY binary mask, seal narrow internal channels, flood-fill from the texture edges to remove enclosed holes, and generate a 256 px outward-only spectral distance field. Render it on one transparent plane behind the model and disable the existing full-screen flare only while the footer contact state is active.

**Tech Stack:** React Three Fiber, Three.js `DataTexture`, `PlaneGeometry`, `MeshBasicMaterial`, Vitest, Biome, Next.js.

---

### Task 1: Build and test the exterior-only mask pipeline

**Files:**
- Create: `scene/contact-external-glow.ts`
- Create: `scene/contact-external-glow.test.ts`

- [ ] **Step 1: Write failing tests for enclosed holes and exterior alpha**

```ts
import { describe, expect, it } from "vitest";

import { createExteriorGlowPixels, fillEnclosedHoles } from "@/scene/contact-external-glow";

describe("contact external glow", () => {
  it("fills transparent holes that are not connected to the texture edge", () => {
    const mask = Uint8Array.from([
      0, 0, 0, 0, 0,
      0, 1, 1, 1, 0,
      0, 1, 0, 1, 0,
      0, 1, 1, 1, 0,
      0, 0, 0, 0, 0,
    ]);
    expect(fillEnclosedHoles(mask, 5, 5)[12]).toBe(1);
  });

  it("writes alpha outside the contour but not inside the solid or enclosed hole", () => {
    const mask = Uint8Array.from([
      0, 0, 0, 0, 0,
      0, 1, 1, 1, 0,
      0, 1, 0, 1, 0,
      0, 1, 1, 1, 0,
      0, 0, 0, 0, 0,
    ]);
    const pixels = createExteriorGlowPixels(mask, 5, 5, 2);
    expect(pixels[3]).toBeGreaterThan(0);
    expect(pixels[6 * 4 + 3]).toBe(0);
    expect(pixels[12 * 4 + 3]).toBe(0);
  });
});
```

- [ ] **Step 2: Run the tests and verify they fail**

Run: `npm test -- scene/contact-external-glow.test.ts`

Expected: FAIL because `contact-external-glow.ts` does not exist.

- [ ] **Step 3: Implement rasterization and texture generation**

Create pure helpers that flood-fill edge-connected empty pixels, fill enclosed holes, calculate an outward chamfer distance field, encode violet-to-red bands by distance, and rasterize every transformed mesh triangle from an `Object3D` into a padded 256 px mask. Export `createContactExternalGlow(root)` returning `{ texture, width, height, centerX, centerY, behindZ }`.

- [ ] **Step 4: Run the focused tests**

Run: `npm test -- scene/contact-external-glow.test.ts`

Expected: PASS.

### Task 2: Render the halo behind the footer and isolate the hero flare

**Files:**
- Create: `scene/ContactExternalGlow.tsx`
- Modify: `scene/ContactModel.tsx`
- Modify: `scene/HeroLensFlare.tsx`

- [ ] **Step 1: Create the glow plane component**

Memoize the generated glow resource from the contact scene. Render a `planeGeometry` with the returned local width and height, a transparent additive `meshBasicMaterial`, `depthWrite={false}`, and position it at `[centerX, centerY, behindZ]`. Dispose the texture on unmount.

- [ ] **Step 2: Mount the plane in the contact transform**

Render `<ContactExternalGlow source={scene} />` beside `<primitive object={scene} />` inside the existing contact asset scale group so both share position, scale, and rotation.

- [ ] **Step 3: Disable the full-screen flare only for contact**

Change the flare gate to:

```ts
const flareEnabled =
  active && transition.sourceVisible && !transition.solid && !transition.contactVisible;
```

The hero gate and every non-contact transition remain unchanged.

- [ ] **Step 4: Run static verification**

Run: `npm run check`

Expected: Biome reports no errors.

### Task 3: Production and visual verification

**Files:**
- Verify: `scene/contact-external-glow.ts`
- Verify: `scene/ContactExternalGlow.tsx`
- Verify: `scene/ContactModel.tsx`
- Verify: `scene/HeroLensFlare.tsx`

- [ ] **Step 1: Build production output**

Run: `npm run build`

Expected: Next.js and TypeScript complete successfully.

- [ ] **Step 2: Inspect the footer at multiple pointer positions**

Open `http://127.0.0.1:3000/#contact`, wait for the entrance, and move the pointer across the viewport.

Expected: rainbow light appears outside the outer silhouette only; the chrome surface and enclosed center remain free of spectral fill.

- [ ] **Step 3: Confirm hero isolation and regression coverage**

Open `http://127.0.0.1:3000/`, confirm the original hero flare remains, check the console, and run `npm test`.

Expected: no browser errors and all tests pass.
