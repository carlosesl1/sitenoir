# Footer Brand Lockup and Contact Grid Implementation Plan

> **For agentic workers:** Execute directly by default. Use subagents only for independent bounded lanes that satisfy the global harness policy. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align the NOIR symbol to the wordmark height, move the agency descriptor below the complete name row, update every lockup from `ESTÚDIO` to `AGÊNCIA`, and prevent mobile footer contact details from overlapping social links.

**Architecture:** Keep the existing symbol and wordmark SVG assets, but introduce a semantic name-row wrapper whose two images share one responsive height token. Replace positional `nth-child` grid ownership with explicit contact, social, and links cell classes so the mobile grid can give the email a full row and place Social and Links side by side without affecting desktop or tablet.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS Modules, Next Image, Vitest, Testing Library, Biome, Playwright/browser preview.

---

## File Structure

- `components/contact/ContactFooter.tsx`: brand lockup markup, agency descriptor, accessible label, and explicit information-cell roles.
- `components/contact/ContactFooter.module.css`: equal-height symbol/wordmark row and responsive contact/social/links grid ownership.
- `components/contact/ContactFooter.test.tsx`: footer copy, markup, CSS proportion, and mobile-grid contract.
- `components/contact/ContactPage.tsx`: agency descriptor in the contact-page brand link.
- `components/contact/ContactPage.test.tsx`: contact-page descriptor regression coverage.

### Task 1: Lock the approved copy and layout contract in tests

**Files:**
- Modify: `components/contact/ContactFooter.test.tsx`
- Modify: `components/contact/ContactPage.test.tsx`

- [ ] **Step 1: Add failing footer assertions**

In the existing `preserves the email action, approved social links, and the 3D anchor` test, add assertions for the approved descriptor and name-row wrapper:

```tsx
expect(screen.getByText("AGÊNCIA DE ESTRUTURA DIGITAL")).toBeInTheDocument();
expect(screen.queryByText("ESTÚDIO DE ESTRUTURA DIGITAL")).not.toBeInTheDocument();
expect(view.container.querySelector('[data-footer-brand-name-row="true"]')).toBeInTheDocument();
```

Replace the old symbol-width CSS assertion with the equal-height and explicit-grid contract:

```tsx
expect(css).toMatch(/--brand-name-height:\s*clamp\(/);
expect(css).toMatch(/\.brandSymbol\s*\{[^}]*height:\s*var\(--brand-name-height\)/);
expect(css).toMatch(/\.brandWordmark\s*\{[^}]*height:\s*var\(--brand-name-height\)/);
expect(css).toMatch(
  /@media \(max-width:\s*767px\)[\s\S]*\.contactCell\s*\{[^}]*grid-column:\s*1\s*\/\s*-1/,
);
expect(css).toMatch(
  /@media \(max-width:\s*767px\)[\s\S]*\.linksCell\s*\{[^}]*grid-column:\s*span 1/,
);
```

- [ ] **Step 2: Add the contact-page copy assertion**

In the contact-page brand/navigation test, assert the new descriptor and reject the previous one:

```tsx
expect(screen.getByText("AGÊNCIA DE ESTRUTURA DIGITAL")).toBeInTheDocument();
expect(screen.queryByText("ESTÚDIO DE ESTRUTURA DIGITAL")).not.toBeInTheDocument();
```

- [ ] **Step 3: Run the focused tests and confirm they fail for the intended reason**

Run:

```bash
npm test -- components/contact/ContactFooter.test.tsx components/contact/ContactPage.test.tsx
```

Expected: FAIL because the rendered descriptor is still `ESTÚDIO DE ESTRUTURA DIGITAL`, the footer has no `data-footer-brand-name-row`, and the new equal-height/mobile-grid CSS declarations do not exist.

- [ ] **Step 4: Commit the failing tests**

```bash
git add components/contact/ContactFooter.test.tsx components/contact/ContactPage.test.tsx
git commit -m "test: define footer lockup and grid correction"
```

### Task 2: Recompose the brand lockup and update agency copy

**Files:**
- Modify: `components/contact/ContactFooter.tsx:34-78`
- Modify: `components/contact/ContactFooter.module.css:92-201`
- Modify: `components/contact/ContactPage.tsx:120-135`
- Test: `components/contact/ContactFooter.test.tsx`
- Test: `components/contact/ContactPage.test.tsx`

- [ ] **Step 1: Recompose the footer brand markup**

Replace the current brand cell contents with this structure:

```tsx
<section
  className={`${styles["informationCell"]} ${styles["brandCell"]}`}
  aria-label="NOIR DIGITAL — Agência de Estrutura Digital"
>
  <div className={styles["brandNameRow"]} data-footer-brand-name-row="true">
    <Image
      className={styles["brandSymbol"]}
      src="/brand/noir-symbol.svg"
      width="164"
      height="186"
      alt=""
      aria-hidden="true"
    />
    <Image
      className={styles["brandWordmark"]}
      src="/brand/noir-wordmark.svg"
      width="389"
      height="116"
      alt=""
      aria-hidden="true"
    />
  </div>
  <span className={styles["brandTagline"]}>AGÊNCIA DE ESTRUTURA DIGITAL</span>
</section>
```

Apply explicit cell classes to the following three cells:

```tsx
<section
  className={`${styles["informationCell"]} ${styles["contactCell"]}`}
  aria-labelledby="footer-contact-label"
>
```

```tsx
<section
  className={`${styles["informationCell"]} ${styles["socialCell"]}`}
  aria-labelledby="footer-social-label"
>
```

```tsx
<nav
  className={`${styles["informationCell"]} ${styles["linksCell"]}`}
  aria-label="Links do footer"
>
```

- [ ] **Step 2: Give the symbol and wordmark one shared height**

Replace the existing brand cell, symbol, lockup, wordmark, and tagline rules with:

```css
.brandCell {
  --brand-name-height: clamp(1.75rem, 2vw, 2rem);

  display: grid;
  grid-column: span 2;
  align-content: center;
  justify-items: start;
  gap: 9px;
  border-right: 1px solid var(--border-default);
}

.brandNameRow {
  display: flex;
  align-items: center;
  gap: clamp(10px, 1vw, 14px);
}

.brandSymbol,
.brandWordmark {
  display: block;
  width: auto;
  height: var(--brand-name-height);
  object-fit: contain;
}

.brandTagline {
  max-width: 27ch;
  font-size: clamp(0.5625rem, 0.62vw, 0.6875rem);
  letter-spacing: 0.04em;
  color: var(--text-secondary);
  line-height: 1.45;
}
```

Keep the existing light-theme filter selector for `.brandSymbol` and `.brandWordmark` unchanged.

- [ ] **Step 3: Replace positional desktop grid ownership with explicit classes**

Replace the current `nth-child` and `last-child` grid rules with:

```css
.contactCell,
.socialCell {
  grid-column: span 1;
}

.socialCell {
  border-right: 1px solid var(--border-default);
}

.linksCell {
  grid-column: span 2;
}

.contactCell .informationList a {
  white-space: nowrap;
}
```

- [ ] **Step 4: Update every site lockup to Agency**

In `ContactPage.tsx`, replace:

```tsx
<small>ESTÚDIO DE ESTRUTURA DIGITAL</small>
```

with:

```tsx
<small>AGÊNCIA DE ESTRUTURA DIGITAL</small>
```

Confirm that `ContactFooter.tsx` contains no remaining `Estúdio` or `ESTÚDIO` in visible or accessible copy.

- [ ] **Step 5: Run the focused tests**

Run:

```bash
npm test -- components/contact/ContactFooter.test.tsx components/contact/ContactPage.test.tsx
```

Expected: both test files pass.

- [ ] **Step 6: Commit the lockup implementation**

```bash
git add components/contact/ContactFooter.tsx components/contact/ContactFooter.module.css components/contact/ContactPage.tsx components/contact/ContactFooter.test.tsx components/contact/ContactPage.test.tsx
git commit -m "fix: align NOIR footer brand lockup"
```

### Task 3: Correct the mobile information grid

**Files:**
- Modify: `components/contact/ContactFooter.module.css:269-294`
- Test: `components/contact/ContactFooter.test.tsx`

- [ ] **Step 1: Assign the approved mobile rows**

Inside `@media (max-width: 767px)`, replace the positional grid overrides with:

```css
.brandCell,
.contactCell {
  grid-column: 1 / -1;
}

.brandCell {
  min-height: 112px;
  border-right: 0;
}

.socialCell,
.linksCell {
  grid-column: span 1;
}

.socialCell {
  border-right: 1px solid var(--border-default);
}
```

Keep the shared mobile `.informationCell` padding, minimum height, and bottom border. Remove obsolete mobile selectors targeting `nth-child(3)` and `last-child`.

- [ ] **Step 2: Preserve tablet behavior with explicit classes**

Inside `@media (min-width: 768px) and (max-width: 1023px)`, keep the two-column grid and replace positional selectors with:

```css
.brandCell {
  grid-column: span 2;
}

.informationCell {
  min-height: 142px;
  border-right: 0;
  border-bottom: 1px solid var(--border-default);
}

.linksCell {
  grid-column: 1 / -1;
}
```

- [ ] **Step 3: Run the focused tests and static formatting check**

Run:

```bash
npm test -- components/contact/ContactFooter.test.tsx components/contact/ContactPage.test.tsx
npx biome check components/contact/ContactFooter.tsx components/contact/ContactFooter.module.css components/contact/ContactFooter.test.tsx components/contact/ContactPage.tsx components/contact/ContactPage.test.tsx
```

Expected: all focused tests pass and Biome reports no fixes required.

- [ ] **Step 4: Commit the responsive grid correction**

```bash
git add components/contact/ContactFooter.module.css components/contact/ContactFooter.test.tsx
git commit -m "fix: contain footer contact details on mobile"
```

### Task 4: Verify production behavior locally

**Files:**
- Verify: `components/contact/ContactFooter.tsx`
- Verify: `components/contact/ContactFooter.module.css`
- Verify: `components/contact/ContactPage.tsx`

- [ ] **Step 1: Run the production build**

Run:

```bash
npm run build
```

Expected: the Next.js static export completes successfully.

- [ ] **Step 2: Inspect the mobile footer at 390 × 844**

Open the homepage at 390 × 844, scroll the brand and information grid into view, and measure:

```js
(() => {
  const symbol = document.querySelector('[class*="brandSymbol"]');
  const wordmark = document.querySelector('[class*="brandWordmark"]');
  const contact = document.querySelector('[class*="contactCell"]');
  const social = document.querySelector('[class*="socialCell"]');
  const email = contact?.querySelector('a[href^="mailto:"]');
  const sr = symbol?.getBoundingClientRect();
  const wr = wordmark?.getBoundingClientRect();
  const cr = contact?.getBoundingClientRect();
  const sor = social?.getBoundingClientRect();
  const er = email?.getBoundingClientRect();
  return {
    symbolHeight: sr?.height,
    wordmarkHeight: wr?.height,
    equalNameHeight: sr && wr ? Math.abs(sr.height - wr.height) < 0.2 : false,
    emailContained: er && cr ? er.left >= cr.left && er.right <= cr.right : false,
    contactAboveSocial: cr && sor ? cr.bottom <= sor.top + 1 : false,
    pageOverflows: document.documentElement.scrollWidth > innerWidth,
  };
})()
```

Expected: equal name heights, contained email, contact above Social, and no page overflow.

- [ ] **Step 3: Inspect the desktop footer at 1920 × 1080**

Run the same measurement at 1920 × 1080.

Expected: symbol and wordmark height difference under `0.2px`, Contact and Social remain separate desktop columns, the descriptor sits below the complete name row, and no horizontal overflow exists.

- [ ] **Step 4: Verify contact-page copy**

Open `/contato/` and confirm the header lockup displays `AGÊNCIA DE ESTRUTURA DIGITAL` with no remaining `ESTÚDIO` copy.

- [ ] **Step 5: Review the final diff and status**

Run:

```bash
git diff --check
git status --short
```

Expected: no whitespace errors; only intentionally excluded pre-existing untracked artifacts may remain. Do not push or deploy unless the user explicitly requests publication.
