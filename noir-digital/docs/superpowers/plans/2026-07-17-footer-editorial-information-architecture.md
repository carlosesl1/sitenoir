# Footer Editorial Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrar ao footer atual uma faixa institucional e uma barra final editorial responsivas, preservando completamente o palco, o 3D e o flare existentes.

**Architecture:** O componente `ContactFooter` será dividido semanticamente entre um `contactStage`, que mantém os elementos atualmente posicionados sobre a cena, e um `informationFooter`, que entra no fluxo normal após o palco. Toda a adaptação de viewport ficará no CSS Module existente; o conteúdo atual continuará vindo de `data/content.ts`.

**Tech Stack:** Next.js App Router, React, TypeScript, CSS Modules, Vitest e Testing Library.

---

## File Structure

- `components/contact/ContactFooter.tsx`: organiza o palco atual e renderiza as duas faixas informativas.
- `components/contact/ContactFooter.module.css`: preserva o layout do palco e implementa as grades desktop, tablet e mobile do novo footer.
- `components/contact/ContactFooter.test.tsx`: garante conteúdo, semântica, links e preservação do anchor 3D.

### Task 1: Cobrir a nova informação com teste de componente

**Files:**
- Modify: `components/contact/ContactFooter.test.tsx`

- [ ] **Step 1: Escrever o teste que exige as duas faixas e seus links**

Adicionar um caso que verifique:

```tsx
it("renders the editorial information footer and internal routes", () => {
  render(<ContactFooter />);

  expect(screen.getByText("DO ESCURO, HÁ IDEIAS QUE MARCAM.")).toBeInTheDocument();
  expect(
    screen.getByText("© NOIR.DIGITAL 2026. TODOS OS DIREITOS RESERVADOS."),
  ).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Work" })).toHaveAttribute(
    "href",
    "/#selected-work",
  );
  expect(screen.getByRole("link", { name: "Services" })).toHaveAttribute(
    "href",
    "/services",
  );
  expect(screen.getAllByRole("link", { name: "Privacidade" })).toHaveLength(2);
  expect(screen.getAllByRole("link", { name: "Termos" })).toHaveLength(2);
  for (const link of screen.getAllByRole("link", { name: "Privacidade" })) {
    expect(link).toHaveAttribute("href", "/privacidade");
  }
  for (const link of screen.getAllByRole("link", { name: "Termos" })) {
    expect(link).toHaveAttribute("href", "/termos");
  }
});
```

- [ ] **Step 2: Executar o teste e confirmar a falha esperada**

Run: `npx vitest run components/contact/ContactFooter.test.tsx`

Expected: FAIL porque o manifesto e os novos links ainda não existem.

### Task 2: Implementar a estrutura semântica do footer

**Files:**
- Modify: `components/contact/ContactFooter.tsx`

- [ ] **Step 1: Isolar o palco atual**

Envolver headline, anchor da cena e progress line em:

```tsx
<div className={styles["contactStage"]}>
  {/* headline, sceneAnchor e progressLine existentes */}
</div>
```

Remover do palco os antigos `contactBaseline` e `footerMeta`, pois seus conteúdos passam a integrar as novas faixas.

- [ ] **Step 2: Renderizar a faixa institucional**

Adicionar após `contactStage`:

```tsx
<div className={styles["informationFooter"]}>
  <div className={styles["informationGrid"]}>
    <section className={`${styles["informationCell"]} ${styles["brandCell"]}`}>
      <span className={styles["brandSymbol"]} aria-hidden="true" />
      <p>NOIR.DIGITAL</p>
      <span>ESTÚDIO DE ESTRUTURA DIGITAL</span>
    </section>
    <section className={styles["informationCell"]} aria-labelledby="footer-contact-label">
      <h3 id="footer-contact-label">Contato</h3>
      <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
    </section>
    <section className={styles["informationCell"]} aria-labelledby="footer-social-label">
      <h3 id="footer-social-label">Social</h3>
      <div className={styles["informationList"]}>
        {socialLinks.map((social) => <span key={social.label}>{social.label}</span>)}
      </div>
    </section>
    <nav className={styles["informationCell"]} aria-label="Links do footer">
      <h3>Links</h3>
      <a href="/#selected-work">Work</a>
      <a href="/services">Services</a>
    </nav>
    <nav className={styles["informationCell"]} aria-label="Links legais">
      <h3>Legal</h3>
      <a href="/privacidade">Privacidade</a>
      <a href="/termos">Termos</a>
    </nav>
  </div>
</div>
```

- [ ] **Step 3: Renderizar a barra final**

Adicionar dentro de `informationFooter`, após `informationGrid`:

```tsx
<div className={styles["closingBar"]}>
  <p>© NOIR.DIGITAL 2026. TODOS OS DIREITOS RESERVADOS.</p>
  <p className={styles["manifesto"]}>DO ESCURO, HÁ IDEIAS QUE MARCAM.</p>
  <nav className={styles["legalClosing"]} aria-label="Links legais finais">
    <a href="/privacidade">Privacidade</a>
    <a href="/termos">Termos</a>
    <span className={styles["footerMark"]} aria-hidden="true" />
  </nav>
</div>
```

- [ ] **Step 4: Executar o teste direcionado**

Run: `npx vitest run components/contact/ContactFooter.test.tsx`

Expected: o novo teste passa; o teste existente continua encontrando o e-mail, os sociais e o anchor 3D.

### Task 3: Implementar o layout responsivo sem alterar a cena

**Files:**
- Modify: `components/contact/ContactFooter.module.css`

- [ ] **Step 1: Preservar o palco como unidade independente**

Mover as regras de altura e padding visual da cena para `.contactStage`, mantendo `.contact` como contêiner preto com `overflow: clip`:

```css
.contact {
  position: relative;
  overflow: clip;
  background: var(--surface-primary);
  color: var(--text-primary);
}

.contactStage {
  position: relative;
  min-height: max(720px, 100svh);
  padding: 104px 56px 32px;
}
```

Manter `.headline`, `.sceneAnchor` e `.progressLine` com os mesmos valores atuais para desktop, mobile e landscape.

- [ ] **Step 2: Criar a grade desktop das duas faixas**

Adicionar regras equivalentes a:

```css
.informationFooter {
  position: relative;
  z-index: 12;
  border-top: 1px solid var(--border-default);
  background: var(--surface-primary);
  font-family: var(--font-pixel);
  text-transform: uppercase;
}

.informationGrid {
  display: grid;
  grid-template-columns: 1.5fr repeat(4, 1fr);
  min-height: 168px;
}

.informationCell {
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  padding: 24px clamp(20px, 2.8vw, 48px);
  border-right: 1px solid var(--border-default);
}

.informationCell:last-child { border-right: 0; }
.informationCell h3,
.informationCell p { margin: 0; }
.informationCell h3 { color: var(--text-secondary); font: inherit; }
.informationCell a,
.informationCell span { color: inherit; text-decoration: none; }
.informationList { display: grid; gap: 8px; }

.closingBar {
  display: grid;
  min-height: 76px;
  grid-template-columns: 1.35fr 1fr 1.25fr;
  align-items: stretch;
  border-top: 1px solid var(--border-default);
}

.closingBar > p,
.legalClosing {
  display: flex;
  margin: 0;
  align-items: center;
  padding: 18px clamp(20px, 2.8vw, 48px);
  border-right: 1px solid var(--border-default);
}

.legalClosing {
  justify-content: flex-end;
  gap: clamp(18px, 2.5vw, 40px);
  border-right: 0;
}
```

- [ ] **Step 3: Criar os breakpoints tablet e mobile**

No tablet, usar grade de três colunas e permitir que a marca ocupe duas colunas. No mobile, usar duas colunas, marca em largura total e barra final empilhada:

```css
@media (max-width: 1023px) {
  .informationGrid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .brandCell { grid-column: span 2; }
  .closingBar { grid-template-columns: 1fr 1fr; }
  .manifesto { grid-column: 1 / -1; grid-row: 1; }
}

@media (max-width: 767px) {
  .contactStage { min-height: max(844px, 100svh); padding: 88px 16px 20px; }
  .informationGrid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .brandCell { grid-column: 1 / -1; }
  .informationCell { min-height: 132px; padding: 20px 16px; }
  .closingBar { display: flex; flex-direction: column; }
  .closingBar > p,
  .legalClosing { min-height: 62px; padding: 16px; border-right: 0; border-bottom: 1px solid var(--border-default); }
  .manifesto { order: -1; }
  .legalClosing { justify-content: space-between; border-bottom: 0; }
}
```

- [ ] **Step 4: Garantir foco e legibilidade**

Aplicar `min-height: 44px` aos links, `display: inline-flex`, alinhamento vertical e borda pontilhada transparente; em `:focus-visible`, mostrar a borda com `currentColor`.

- [ ] **Step 5: Executar checagem direcionada**

Run: `npm run typecheck`

Expected: PASS sem erros TypeScript.

### Task 4: Verificar a integração

**Files:**
- Verify: `components/contact/ContactFooter.tsx`
- Verify: `components/contact/ContactFooter.module.css`
- Verify: `components/contact/ContactFooter.test.tsx`

- [ ] **Step 1: Executar o teste do footer**

Run: `npx vitest run components/contact/ContactFooter.test.tsx`

Expected: PASS em todos os testes do componente.

- [ ] **Step 2: Executar o build de produção**

Run: `npm run build`

Expected: build concluído sem erros.

- [ ] **Step 3: Verificar desktop e mobile no localhost**

Inspecionar `http://127.0.0.1:3000/#contact` em 1440×900 e 390×844. Confirmar:

- headline, 3D e flare mantêm a composição anterior;
- faixa institucional e barra final aparecem abaixo do palco;
- manifesto usa a frase aprovada;
- nenhum texto ultrapassa a viewport;
- não existe scroll horizontal;
- links internos e legais têm destinos corretos.
