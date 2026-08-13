# NOIR Environment Highlight Softening Implementation Plan

> **For agentic workers:** Execute directly by default. Use subagents only for independent bounded lanes that satisfy the global harness policy. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce the fixed white Canvas UI glass reflection by 35% without changing the RGB spectrum or the rest of the NOIR material.

**Architecture:** Keep the current PMREM reflector environment and alter only the material's effective `environmentIntensity`. Protect the value with the existing glass configuration test, then validate the production Canvas UI variant visually.

**Tech Stack:** TypeScript, Three.js, React Three Fiber, Vitest, Biome, Next.js

---

### Task 1: Reduce effective environment intensity

**Files:**
- Modify: `scene/hero-canvas-ui-glass-config.test.ts`
- Modify: `scene/hero-canvas-ui-glass-config.ts`

- [ ] **Step 1: Write the failing test**

Update the material expectation in `scene/hero-canvas-ui-glass-config.test.ts` to require the softened effective value while preserving the reflector cards:

```ts
expect(HERO_CANVAS_UI_GLASS_CONFIG.environmentIntensity).toBe(0.47);
expect(HERO_CANVAS_UI_REFLECTOR_CONFIG.map(({ intensity }) => intensity)).toEqual([78, 62.4, 90]);
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run:

```powershell
npx vitest run scene/hero-canvas-ui-glass-config.test.ts
```

Expected: FAIL because the current material intensity remains `0.72`.

- [ ] **Step 3: Apply the isolated configuration change**

In `scene/hero-canvas-ui-glass-config.ts`, retain every reflector property and reduce only the effective environment intensity:

```ts
environmentIntensity: 0.47,
```

- [ ] **Step 4: Run focused and integration verification**

Run:

```powershell
npx vitest run scene/hero-canvas-ui-environment.test.ts scene/hero-canvas-ui-glass-config.test.ts scene/hero-canvas-ui-glass.test.ts
npx biome check scene/hero-canvas-ui-environment.test.ts scene/hero-canvas-ui-glass-config.test.ts scene/hero-canvas-ui-glass-config.ts
npm run typecheck
npm run build
```

Expected: all commands pass.

- [ ] **Step 5: Verify the production rendering**

Serve the fresh static export on a clean port and inspect `/?effects=full&glass=canvas-ui`. Confirm that the top white reflection retains surface detail, the RGB bands remain saturated, and no pointer-bound light returns.

- [ ] **Step 6: Commit**

```powershell
git add -- scene/hero-canvas-ui-environment.test.ts scene/hero-canvas-ui-glass-config.test.ts scene/hero-canvas-ui-glass-config.ts
git commit -m "fix(hero): reduce effective environment reflection"
```
