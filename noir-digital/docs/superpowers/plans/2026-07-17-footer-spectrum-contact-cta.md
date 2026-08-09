# Footer Spectrum Contact CTA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the approved `ENTRAR EM CONTATO` mail CTA to the footer contact stage with a polished light surface, opposing diagonal cuts, and a balanced spectral layer revealed by motion.

**Architecture:** Keep the CTA inside `ContactFooter` because it reuses the existing `contactEmail` content source and belongs to the contact stage. Introduce a positioned content wrapper that inherits the headline's exact current coordinates, then place the CTA below the unchanged headline; implement all geometry and interaction in the existing CSS Module so WebGL, scene layout, and global styles remain untouched.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS Modules, Vitest, Testing Library

---

## File map

- Modify `components/contact/ContactFooter.test.tsx`: assert the CTA's accessible name and `mailto:` destination.
- Modify `components/contact/ContactFooter.tsx`: group headline and CTA in a contact-content layer and render the semantic link.
- Modify `components/contact/ContactFooter.module.css`: preserve the headline coordinates, add the approved button surface/spectrum/glow, and define responsive and reduced-motion behavior.

### Task 1: Lock the CTA contract with a component test

**Files:**
- Test: `components/contact/ContactFooter.test.tsx:25-41`

- [ ] **Step 1: Write the failing CTA assertion**

Add this assertion to the existing action test immediately after rendering:

```tsx
const contactCta = screen.getByRole("link", { name: "Entrar em contato" });
expect(contactCta).toHaveAttribute("href", `mailto:${contactEmail}`);
```

- [ ] **Step 2: Run the focused test and verify the new assertion fails**

Run:

```powershell
npm test -- components/contact/ContactFooter.test.tsx
```

Expected: FAIL because no link named `Entrar em contato` exists yet.

### Task 2: Add the semantic CTA without moving the existing headline

**Files:**
- Modify: `components/contact/ContactFooter.tsx:8-15`

- [ ] **Step 1: Group the heading and CTA in a content layer**

Replace the current standalone heading with this markup:

```tsx
<div className={styles["contactContent"]}>
  <h2 id="contact-heading" className={styles["headline"]}>
    {contactHeadlineLines.map((line) => (
      <span key={line}>{line}</span>
    ))}
  </h2>

  <a className={styles["contactCta"]} href={`mailto:${contactEmail}`}>
    <span className={styles["contactCtaSurface"]}>Entrar em contato</span>
  </a>
</div>
```

Keep the existing `sceneAnchor` as a sibling after `contactContent` so the CTA remains a DOM overlay and does not alter the 3D scene.

- [ ] **Step 2: Run the focused component test**

Run:

```powershell
npm test -- components/contact/ContactFooter.test.tsx
```

Expected: PASS, including the new accessible-name and `mailto:` assertion.

### Task 3: Implement the approved surface, spectral reveal, and responsive behavior

**Files:**
- Modify: `components/contact/ContactFooter.module.css:14-70`
- Modify: `components/contact/ContactFooter.module.css:224-236`
- Modify: `components/contact/ContactFooter.module.css:300-309`

- [ ] **Step 1: Move the headline positioning to a shared wrapper**

Add a wrapper whose coordinates exactly match the current headline and remove only the positioning declarations from `.headline`:

```css
.contactContent {
  position: absolute;
  z-index: 10;
  top: calc(50svh - 40px);
  right: 56px;
  left: 56px;
  display: grid;
  justify-items: center;
}

.headline {
  display: grid;
  width: 100%;
  margin: 0;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  grid-template-rows: repeat(3, auto);
  row-gap: 0.04em;
  font-family: var(--font-display);
  font-size: 7.2svw;
  font-stretch: 120%;
  font-weight: 700;
  font-variation-settings: "wdth" 120;
  line-height: 1;
  letter-spacing: 0;
  text-align: center;
  text-transform: uppercase;
  color: var(--color-noir-warm-white);
}
```

This keeps the heading's top, left, and right edges at the same rendered coordinates while allowing the CTA to flow beneath it.

- [ ] **Step 2: Add the resting spectral base and polished light surface**

Add the following scoped styles after the headline span rules:

```css
.contactCta {
  position: relative;
  z-index: 0;
  isolation: isolate;
  width: min(300px, 100%);
  height: 64px;
  margin-top: clamp(24px, 3.2svh, 40px);
  color: #0b0b0c;
  text-decoration: none;
}

.contactCta::before,
.contactCta::after {
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
  background-size: 180% 100%;
  clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px));
  content: "";
  opacity: 0;
  transition: opacity 180ms ease;
}

.contactCta::after {
  filter: blur(16px);
  opacity: 0;
}

.contactCtaSurface {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  border: 1px solid rgb(255 255 255 / 58%);
  border-radius: 4px;
  background: linear-gradient(180deg, #ffffff 0%, #f4f4f3 48%, #c6c6c4 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 95%),
    inset 0 -4px 7px rgb(0 0 0 / 12%),
    0 8px 18px rgb(0 0 0 / 24%);
  clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px));
  font-family: var(--font-interface);
  font-size: 0.875rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  transition:
    transform 260ms cubic-bezier(0.22, 1, 0.36, 1),
    filter 180ms ease;
}
```

- [ ] **Step 3: Add hover, keyboard focus, and horizontal spectrum motion**

Add:

```css
@keyframes contactSpectrumShift {
  from {
    background-position: 0% 50%;
  }
  to {
    background-position: 100% 50%;
  }
}

@media (hover: hover) and (pointer: fine) {
  .contactCta:hover::before,
  .contactCta:hover::after {
    opacity: 0.92;
    animation: contactSpectrumShift 1.8s linear infinite alternate;
  }

  .contactCta:hover::after {
    opacity: 0.58;
  }

  .contactCta:hover .contactCtaSurface {
    transform: translate(14px, -14px);
  }
}

.contactCta:focus-visible {
  outline: none;
}

.contactCta:focus-visible::before,
.contactCta:focus-visible::after {
  opacity: 0.92;
  animation: contactSpectrumShift 1.8s linear infinite alternate;
}

.contactCta:focus-visible::after {
  opacity: 0.58;
}

.contactCta:focus-visible .contactCtaSurface {
  transform: translate(14px, -14px);
  filter: drop-shadow(0 0 1px #ffffff) drop-shadow(0 0 2px #0b0b0c);
}
```

- [ ] **Step 4: Preserve current breakpoints and prevent mobile overflow**

Inside `@media (max-width: 767px)`, move the current positioning values from `.headline` to `.contactContent`, then keep only typography on `.headline`:

```css
.contactContent {
  top: 41svh;
  right: 16px;
  left: 16px;
}

.headline {
  font-size: clamp(1.6rem, 7.2vw, 2.25rem);
  line-height: 1;
}

.contactCta {
  width: min(300px, calc(100vw - 32px));
  margin-top: 24px;
}
```

Inside `@media (min-width: 768px) and (max-height: 560px)`, move `top: 28svh` from `.headline` to `.contactContent`; keep the short-viewport font size on `.headline`.

- [ ] **Step 5: Add reduced-motion behavior**

Add at the end of the file:

```css
@media (prefers-reduced-motion: reduce) {
  .contactCta::before,
  .contactCta::after {
    background-position: 50% 50%;
    animation: none !important;
  }

  .contactCtaSurface {
    transition-duration: 120ms;
  }

  .contactCta:focus-visible .contactCtaSurface {
    transform: translate(6px, -6px);
  }
}

@media (prefers-reduced-motion: reduce) and (hover: hover) and (pointer: fine) {
  .contactCta:hover .contactCtaSurface {
    transform: translate(6px, -6px);
  }
}
```

- [ ] **Step 6: Run component tests and the production build**

Run:

```powershell
npm test -- components/contact/ContactFooter.test.tsx
npm run build
```

Expected: the focused test file passes and Next.js completes a production build without type or CSS errors.

- [ ] **Step 7: Verify the rendered interaction at desktop and mobile widths**

At `http://127.0.0.1:3000/#contact`, verify:

- Desktop: button is centered below the unchanged three-line headline; hover moves only the light surface 14px up/right; the spectrum remains at the resting location and animates horizontally; the external glow is compact.
- Keyboard: tab focus shows the same reveal and a visible silhouette-following focus treatment.
- Mobile 390 × 844: button remains fully within the 16px page inset and the CTA does not overlap the information footer.
- Reduced motion: the spectral gradient is static and surface displacement is 6px.

Do not modify the WebGL scene, shader, footer information grid, or global styles while correcting any visual issue found here.
