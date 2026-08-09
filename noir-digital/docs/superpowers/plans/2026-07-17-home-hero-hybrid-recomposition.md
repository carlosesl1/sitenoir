# Home Hero Hybrid Recomposition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recompose the tablet and desktop home hero around the centered NOIR 3D mark, lower structural headline, description, and shared contact CTA while preserving the current mobile hero and all shader behavior.

**Architecture:** Extract the approved spectral contact anchor into one shared component consumed by the footer and hero. Recompose tablet/desktop with CSS positioning inside the existing hero boundary, keep mobile selectors unchanged, and adjust only deterministic hero/pointer transforms in `scene-layout.ts`; the header receives desktop-only spacing refinements without semantic changes.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS Modules, React Three Fiber, Vitest, Testing Library

---

## File map

- Create `components/contact/SpectrumContactCta.tsx`: reusable semantic contact anchor.
- Create `components/contact/SpectrumContactCta.module.css`: approved cut surface, spectrum, glow, focus, and reduced-motion behavior.
- Create `components/contact/SpectrumContactCta.test.tsx`: shared CTA contract.
- Modify `components/contact/ContactFooter.tsx`: consume the shared CTA.
- Modify `components/contact/ContactFooter.module.css`: retain footer placement only and remove duplicated button presentation.
- Modify `components/contact/ContactFooter.test.tsx`: preserve the footer integration assertion.
- Modify `components/hero/Hero.tsx`: add the action row and shared CTA while preserving all scramble nodes.
- Modify `components/hero/Hero.module.css`: implement the approved tablet/desktop composition and leave the mobile composition unchanged.
- Modify `components/hero/Hero.test.tsx`: lock CTA semantics, scramble count, scene anchor, and desktop/mobile CSS contracts.
- Modify `components/header/Header.module.css`: refine only the desktop navigation distribution.
- Modify `components/header/SiteHeader.test.tsx`: keep the exact four existing desktop controls locked.
- Modify `scene/scene-layout.ts`: update tablet/desktop hero and pointer transforms only.
- Modify `scene/scene-layout.test.ts`: lock the new transforms and unchanged mobile values.

### Task 1: Extract the approved shared contact CTA

**Files:**
- Create: `components/contact/SpectrumContactCta.test.tsx`
- Create: `components/contact/SpectrumContactCta.tsx`
- Create: `components/contact/SpectrumContactCta.module.css`
- Modify: `components/contact/ContactFooter.tsx:1-22`
- Modify: `components/contact/ContactFooter.module.css:78-205, 359-379, 488-507`
- Test: `components/contact/ContactFooter.test.tsx`

- [ ] **Step 1: Write the failing shared-component test**

Create `components/contact/SpectrumContactCta.test.tsx`:

```tsx
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { SpectrumContactCta } from "@/components/contact/SpectrumContactCta";
import { contactEmail } from "@/data/content";

afterEach(cleanup);

describe("SpectrumContactCta", () => {
  it("renders the approved accessible mail action", () => {
    render(<SpectrumContactCta />);

    expect(screen.getByRole("link", { name: "Entrar em contato" })).toHaveAttribute(
      "href",
      `mailto:${contactEmail}`,
    );
  });
});
```

- [ ] **Step 2: Run the shared-component test and verify RED**

Run:

```powershell
npm test -- components/contact/SpectrumContactCta.test.tsx
```

Expected: FAIL because `SpectrumContactCta` does not exist.

- [ ] **Step 3: Implement the shared semantic component**

Create `components/contact/SpectrumContactCta.tsx`:

```tsx
import { contactEmail } from "@/data/content";

import styles from "./SpectrumContactCta.module.css";

export function SpectrumContactCta() {
  return (
    <a className={styles["root"]} href={`mailto:${contactEmail}`}>
      <span className={styles["surface"]}>Entrar em contato</span>
    </a>
  );
}
```

- [ ] **Step 4: Move the approved button presentation into its own CSS Module**

Create `components/contact/SpectrumContactCta.module.css`:

```css
.root {
  position: relative;
  z-index: 0;
  isolation: isolate;
  display: block;
  width: 100%;
  height: 64px;
  color: #0b0b0c;
  text-decoration: none;
}

.root::before,
.root::after {
  position: absolute;
  inset: 0;
  z-index: -1;
  border-radius: 4px;
  background: linear-gradient(
    90deg,
    #ff334f 0%,
    #ff8a00 16%,
    #d9ff00 31%,
    #00e88f 47%,
    #00c8ff 63%,
    #5f55ff 79%,
    #ff2fad 100%
  );
  background-position: 0% 50%;
  background-size: 180% 100%;
  clip-path: polygon(
    0 0,
    calc(100% - 14px) 0,
    100% 14px,
    100% 100%,
    14px 100%,
    0 calc(100% - 14px)
  );
  content: "";
  opacity: 0;
  transition: opacity 180ms ease;
}

.root::after {
  filter: blur(16px);
}

.surface {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  border: 1px solid rgb(255 255 255 / 58%);
  border-radius: 4px;
  background: linear-gradient(180deg, #fff 0%, #f4f4f3 48%, #c6c6c4 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 95%),
    inset 0 -4px 7px rgb(0 0 0 / 12%),
    0 8px 18px rgb(0 0 0 / 24%);
  clip-path: polygon(
    0 0,
    calc(100% - 14px) 0,
    100% 14px,
    100% 100%,
    14px 100%,
    0 calc(100% - 14px)
  );
  font-family: var(--font-display);
  font-size: 0.875rem;
  font-stretch: 108%;
  font-weight: 700;
  font-variation-settings: "wdth" 108;
  letter-spacing: 0.035em;
  text-transform: uppercase;
  transition:
    transform 260ms cubic-bezier(0.22, 1, 0.36, 1),
    filter 180ms ease;
}

@keyframes spectrumShift {
  from {
    background-position: 0% 50%;
  }

  to {
    background-position: 100% 50%;
  }
}

@media (hover: hover) and (pointer: fine) {
  .root:hover::before,
  .root:hover::after {
    animation: spectrumShift 1.8s linear infinite alternate;
  }

  .root:hover::before {
    opacity: 0.92;
  }

  .root:hover::after {
    opacity: 0.58;
  }

  .root:hover .surface {
    transform: translate(14px, -14px);
  }
}

.root:focus-visible {
  outline: none;
}

.root:focus-visible::before,
.root:focus-visible::after {
  animation: spectrumShift 1.8s linear infinite alternate;
}

.root:focus-visible::before {
  opacity: 0.92;
}

.root:focus-visible::after {
  opacity: 0.58;
}

.root:focus-visible .surface {
  filter: drop-shadow(0 0 1px #fff) drop-shadow(0 0 2px #0b0b0c);
  transform: translate(14px, -14px);
}

@media (prefers-reduced-motion: reduce) {
  .root::before,
  .root::after {
    background-position: 50% 50%;
    animation: none !important;
  }

  .surface {
    transition-duration: 120ms;
  }

  .root:focus-visible .surface {
    transform: translate(6px, -6px);
  }
}

@media (prefers-reduced-motion: reduce) and (hover: hover) and (pointer: fine) {
  .root:hover .surface {
    transform: translate(6px, -6px);
  }
}
```

- [ ] **Step 5: Replace the footer-local anchor with the shared component**

In `ContactFooter.tsx`, import the component and replace the existing anchor:

```tsx
import { SpectrumContactCta } from "@/components/contact/SpectrumContactCta";
```

```tsx
<div className={styles["contactCtaSlot"]}>
  <SpectrumContactCta />
</div>
```

In `ContactFooter.module.css`, delete all selectors from `.contactCta` through `.contactCta:focus-visible .contactCtaSurface`, delete `@keyframes contactSpectrumShift`, and delete both reduced-motion blocks that target the old selectors. Add:

```css
.contactCtaSlot {
  width: min(300px, 100%);
  margin-top: clamp(24px, 3.2svh, 40px);
}
```

Inside `@media (max-width: 767px)`, replace the old `.contactCta` rule with:

```css
.contactCtaSlot {
  width: min(300px, calc(100vw - 60px));
  margin-top: 24px;
}
```

- [ ] **Step 6: Run shared CTA and footer tests and verify GREEN**

Run:

```powershell
npm test -- components/contact/SpectrumContactCta.test.tsx components/contact/ContactFooter.test.tsx
```

Expected: both test files PASS; the footer still exposes exactly one `Entrar em contato` mail action.

- [ ] **Step 7: Commit the isolated shared CTA extraction**

```powershell
git add -- components/contact/SpectrumContactCta.tsx components/contact/SpectrumContactCta.module.css components/contact/SpectrumContactCta.test.tsx components/contact/ContactFooter.tsx components/contact/ContactFooter.module.css components/contact/ContactFooter.test.tsx
git commit -m "refactor: share the spectrum contact cta"
```

### Task 2: Add the hero action row and preserve semantic content

**Files:**
- Modify: `components/hero/Hero.test.tsx`
- Modify: `components/hero/Hero.tsx`
- Test: `components/hero/Hero.test.tsx`

- [ ] **Step 1: Write failing assertions for the hero CTA and layout slots**

Add `contactEmail` to the content import in `Hero.test.tsx`, then add:

```tsx
it("exposes the shared contact action in the desktop hero composition", () => {
  const view = render(<Hero />);

  expect(screen.getByRole("link", { name: "Entrar em contato" })).toHaveAttribute(
    "href",
    `mailto:${contactEmail}`,
  );
  expect(view.container.querySelector('[data-hero-action-row="true"]')).toBeInTheDocument();
});
```

Because the approved semantic reading order is headline before description, replace the existing scramble order and timing assertions with:

```tsx
expect(decodedLines.map((line) => line.dataset["scrambleText"])).toEqual([
  ...heroLabels,
  ...heroSupportLines,
  ...heroHeadlineLines,
  ...heroDescriptionLines,
]);
expect(
  decodedLines
    .slice(0, 5)
    .map((line) => [line.dataset["scrambleDelay"], line.dataset["scrambleLetterDelay"]]),
).toEqual(Array.from({ length: 5 }, () => ["0", "10"]));
expect(
  decodedLines
    .slice(5, 8)
    .map((line) => [line.dataset["scrambleDelay"], line.dataset["scrambleLetterDelay"]]),
).toEqual([
  ["0", "50"],
  ["120", "50"],
  ["240", "50"],
]);
expect(
  decodedLines
    .slice(8)
    .map((line) => [line.dataset["scrambleDelay"], line.dataset["scrambleLetterDelay"]]),
).toEqual(Array.from({ length: 3 }, () => ["0", "10"]));
```

- [ ] **Step 2: Run the hero test and verify RED**

Run:

```powershell
npm test -- components/hero/Hero.test.tsx
```

Expected: FAIL because the CTA and action-row marker do not exist and the current DOM order still places the description before the headline.

- [ ] **Step 3: Add the shared CTA and action-row markup**

In `Hero.tsx`, import:

```tsx
import { SpectrumContactCta } from "@/components/contact/SpectrumContactCta";
```

Keep the discipline and promise blocks unchanged. Keep the headline before the action row. Replace the current standalone description with this action row after the headline:

```tsx
<div className={styles["actionRow"]} data-hero-action-row="true">
  <p className={styles["description"]}>
    {heroDescriptionLines.map((line) => (
      <HeroScrambleText
        active={scrambleActive}
        key={line}
        letterDelayMs={10}
        reducedMotion={reducedMotion}
        startDelayMs={0}
        text={line}
      />
    ))}
  </p>

  <div className={styles["heroCtaSlot"]}>
    <SpectrumContactCta />
  </div>
</div>
```

The scramble nodes remain 11 because the CTA text does not use `HeroScrambleText`.

- [ ] **Step 4: Run the hero test and verify the semantic contract passes**

Run:

```powershell
npm test -- components/hero/Hero.test.tsx
```

Expected: all hero tests PASS, including the new CTA and action-row contract, while the existing 11-node scramble assertion remains unchanged.

### Task 3: Recompose the tablet/desktop hero and refine the header

**Files:**
- Modify: `components/hero/Hero.module.css`
- Modify: `components/header/Header.module.css:190-239`
- Modify: `components/header/SiteHeader.test.tsx:56-74`
- Test: `components/hero/Hero.test.tsx`
- Test: `components/header/SiteHeader.test.tsx`

- [ ] **Step 1: Lock the unchanged four-control header contract**

Inside the first `SiteHeader` test, add:

```tsx
const desktopNavigation = screen.getByRole("navigation", { name: "Principal" });
expect(within(desktopNavigation).getAllByRole("button", { hidden: true })).toHaveLength(4);
for (const label of ["Work", "Contact", "Theme", "Sound"]) {
  expect(within(desktopNavigation).getByRole("button", { name: label, hidden: true })).toBeInTheDocument();
}
```

Extend the existing CSS contract test in `Hero.test.tsx` with:

```tsx
expect(css).toContain("@media (min-width: 768px)");
expect(css).toMatch(/\.heroCtaSlot[\s\S]*display:\s*none/);
```

Run:

```powershell
npm test -- components/hero/Hero.test.tsx components/header/SiteHeader.test.tsx
```

Expected: the hero test FAILS because the desktop media query and hidden mobile CTA contract are not implemented; all existing header assertions continue to pass.

- [ ] **Step 2: Implement the base mobile-preserving action-row contract**

In the existing mobile block, keep the current `.hero`, `.heroGrid`, `.description`, `.headline`, and `.sceneAnchor` declarations unchanged. Add:

```css
.actionRow {
  display: contents;
}

.heroCtaSlot {
  display: none;
}
```

The description remains a direct grid participant because `display: contents` preserves its current `grid-area: description` behavior.

- [ ] **Step 3: Add the tablet/desktop recomposition at 768px and above**

Add before the existing 768–1023 block:

```css
@media (min-width: 768px) {
  .heroGrid {
    display: block;
    padding: 0;
  }

  .disciplines,
  .promise,
  .headline,
  .actionRow {
    position: absolute;
  }

  .disciplines {
    top: 15.5svh;
    left: clamp(32px, 3.7vw, 56px);
    padding: 0;
    font-size: clamp(1rem, 1.35vw, 1.25rem);
    line-height: 1.3;
  }

  .promise {
    top: 16.5svh;
    right: clamp(32px, 4.2vw, 64px);
    padding: 0;
    font-size: clamp(0.75rem, 1vw, 0.875rem);
    line-height: 1.45;
    text-align: right;
    text-transform: uppercase;
  }

  .headline {
    z-index: 3;
    top: 55.5svh;
    right: 22vw;
    left: clamp(32px, 10.8vw, 176px);
    padding: 0;
    font-size: clamp(3rem, 5.15vw, 5.25rem);
    line-height: 0.96;
  }

  .actionRow {
    z-index: 4;
    top: 81.5svh;
    right: clamp(48px, 12vw, 190px);
    left: clamp(32px, 29vw, 470px);
    display: grid;
    grid-template-columns: minmax(280px, 1fr) minmax(240px, 300px);
    align-items: center;
    gap: clamp(28px, 4vw, 64px);
  }

  .description {
    display: flex;
    max-width: none;
    padding: 0;
    font-size: clamp(0.6875rem, 0.88vw, 0.8125rem);
    line-height: 1.55;
    text-align: right;
  }

  .heroCtaSlot {
    display: block;
    width: 100%;
  }

  .sceneAnchor {
    inset: 20% 8% 31%;
  }
}
```

- [ ] **Step 4: Add tablet and short-height containment refinements**

Replace the current 768–1023 block with:

```css
@media (min-width: 768px) and (max-width: 1279px) {
  .headline {
    top: 57svh;
    right: 32px;
    left: 32px;
    font-size: clamp(2.75rem, 5.4vw, 4.3rem);
  }

  .actionRow {
    top: 80.5svh;
    right: 32px;
    left: 18vw;
    grid-template-columns: minmax(240px, 1fr) minmax(220px, 260px);
    gap: 24px;
  }

  .sceneAnchor {
    inset: 21% 5% 32%;
  }
}

@media (min-width: 768px) and (max-height: 720px) {
  .disciplines,
  .promise {
    top: 14svh;
  }

  .headline {
    top: 53svh;
    font-size: clamp(2.5rem, 4.7vw, 4.3rem);
  }

  .actionRow {
    top: 78svh;
  }
}
```

Keep the existing 1024–1279, 1280–1535, and 1536 headline-size blocks only if they do not override these new values; otherwise remove those obsolete blocks so there is one source of truth.

- [ ] **Step 5: Refine desktop header distribution without changing markup**

Inside `@media (min-width: 1024px)` in `Header.module.css`, replace the desktop navigation sizing with:

```css
.desktopNavigation {
  position: absolute;
  top: 0;
  left: 50%;
  display: flex;
  width: min(520px, 46vw);
  justify-content: space-between;
  transform: translateX(-50%);
}

.control {
  padding-inline: 10px;
}
```

Do not change `SiteHeader.tsx`; the current semantic order already matches the approved labels.

- [ ] **Step 6: Run hero and header tests**

Run:

```powershell
npm test -- components/hero/Hero.test.tsx components/header/SiteHeader.test.tsx
```

Expected: both files PASS; the hero still exposes 11 scramble nodes and the header exposes exactly Work, Contact, Theme, and Sound.

- [ ] **Step 7: Commit the DOM/CSS recomposition**

```powershell
git add -- components/hero/Hero.tsx components/hero/Hero.module.css components/hero/Hero.test.tsx components/header/Header.module.css components/header/SiteHeader.test.tsx
git commit -m "feat: recompose the home hero layout"
```

### Task 4: Reframe only the tablet and desktop hero scene transforms

**Files:**
- Modify: `scene/scene-layout.test.ts:20-43`
- Modify: `scene/scene-layout.ts:180-198`
- Test: `scene/scene-layout.test.ts`

- [ ] **Step 1: Write failing transform expectations while locking mobile values**

Replace the tablet and desktop hero/pointer assertions with:

```ts
expect(sceneLayouts.mobile.hero).toEqual({
  position: [-0.1, 0, 2],
  rotation: [0, 4, 0],
  scale: 8.1,
});
expect(sceneLayouts.tablet.hero).toEqual({
  position: [-0.1, 1.15, 2],
  rotation: [0, 4, 0],
  scale: 16.4,
});
expect(sceneLayouts.desktop.hero).toEqual({
  position: [-0.1, 1.4, 2],
  rotation: [0, 4, 0],
  scale: 22.5,
});
expect(sceneLayouts.mobile.pointer).toEqual({
  position: [3.25, -1, -3],
  rotation: [0, 0, 0],
  scale: 0.032,
});
expect(sceneLayouts.tablet.pointer).toEqual({
  position: [5.8, -2.7, -3],
  rotation: [0, 0, 0],
  scale: 0.075,
});
expect(sceneLayouts.desktop.pointer).toEqual({
  position: [9.2, -2.7, -3],
  rotation: [0, 0, 0],
  scale: 0.085,
});
```

- [ ] **Step 2: Run the scene layout test and verify RED**

Run:

```powershell
npm test -- scene/scene-layout.test.ts
```

Expected: FAIL on the new tablet and desktop transform values; mobile expectations pass.

- [ ] **Step 3: Implement the deterministic transform values**

Update only the `hero` and `pointer` entries:

```ts
tablet: {
  hero: { position: [-0.1, 1.15, 2], rotation: [0, 4, 0], scale: 16.4 },
  pointer: { position: [5.8, -2.7, -3], rotation: [0, 0, 0], scale: 0.075 },
  contact: { position: [0, -1, 0], rotation: [0, 0, 0], scale: 17 },
  stickers: createStickerLayout("tablet"),
},
desktop: {
  hero: { position: [-0.1, 1.4, 2], rotation: [0, 4, 0], scale: 22.5 },
  pointer: { position: [9.2, -2.7, -3], rotation: [0, 0, 0], scale: 0.085 },
  contact: { position: [0, -0.1, 0], rotation: [0, 0, 0], scale: 19 },
  stickers: createStickerLayout("desktop"),
},
```

Do not modify mobile, contact, sticker, camera, material, or shader values.

- [ ] **Step 4: Run the scene layout test and verify GREEN**

Run:

```powershell
npm test -- scene/scene-layout.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit the scene-only reframe**

```powershell
git add -- scene/scene-layout.ts scene/scene-layout.test.ts
git commit -m "feat: reframe the desktop hero scene"
```

### Task 5: Verify and visually tune the complete first viewport

**Files:**
- Modify only if required by visual evidence: `components/hero/Hero.module.css`
- Modify only if required by visual evidence: `scene/scene-layout.ts`
- Update corresponding locked values if a scene transform changes: `scene/scene-layout.test.ts`

- [ ] **Step 1: Run focused integration tests**

Run:

```powershell
npm test -- components/contact/SpectrumContactCta.test.tsx components/contact/ContactFooter.test.tsx components/hero/Hero.test.tsx components/header/SiteHeader.test.tsx scene/scene-layout.test.ts
```

Expected: all focused test files PASS.

- [ ] **Step 2: Run the production build**

Run:

```powershell
npm run build
```

Expected: Next.js completes compilation, TypeScript, and static page generation without errors.

- [ ] **Step 3: Inspect the approved desktop viewport**

Open `http://127.0.0.1:3000/` at 1536 × 960 after the preloader and verify:

- Brand remains upper-left and the four controls remain centered.
- Disciplines and promise occupy the upper-left and upper-right support positions.
- NOIR mark is centered and dominant without being cropped.
- Pointer remains secondary near the model’s lower-right area.
- Headline occupies the lower-left band and remains fully readable above WebGL.
- Description and CTA form one lower action row.
- CTA hover/focus exposes the fixed spectral base.
- Bottom clock, coordinates, and mark do not collide with the action row.

- [ ] **Step 4: Inspect tablet and mobile boundaries**

At 1024 × 768, verify the same hierarchy with no horizontal overflow and no collision with the status row.

At 390 × 844, verify the hero matches the pre-change mobile contract:

- No hero CTA is visible.
- Existing headline and description positions are unchanged.
- Existing mobile 3D and cursor transforms remain unchanged.
- Mobile header and menu behavior remain unchanged.

- [ ] **Step 5: Enforce the visual pass/fail boundary**

Treat the numeric CSS and scene values defined in Tasks 3 and 4 as the approved baseline. If any viewport check fails, stop execution and record the failing viewport, element, measured bounding box, and reference mismatch before changing code. Revise only the affected baseline declaration and its scene test expectation in a reviewed plan update; do not improvise changes to shaders, camera, flare, materials, mobile transforms, contact transforms, or global tokens.

- [ ] **Step 6: Run final tests after optical corrections**

Run:

```powershell
npm test -- --testTimeout=15000
npm run build
```

Expected: at least 59 test files / 242 tests PASS and the production build succeeds.
