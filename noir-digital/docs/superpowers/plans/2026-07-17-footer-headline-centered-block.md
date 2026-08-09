# Footer Headline Centered Block Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar o headline do palco 3D do footer em um bloco centralizado e legível de três linhas.

**Architecture:** O conteúdo continuará vindo de `data/content.ts`, mas será reagrupado semanticamente em três entradas. O componente permanece inalterado; o CSS Module substitui o posicionamento assimétrico de quatro spans por três linhas centralizadas sobre o mesmo anchor 3D.

**Tech Stack:** Next.js, React, TypeScript, CSS Modules, Vitest e Testing Library.

---

### Task 1: Atualizar o contrato textual e o layout centralizado

**Files:**
- Modify: `components/contact/ContactFooter.test.tsx`
- Modify: `data/content.ts`
- Modify: `components/contact/ContactFooter.module.css`

- [ ] **Step 1: Escrever a expectativa de três linhas**

No primeiro teste de `ContactFooter.test.tsx`, manter a iteração sobre `contactHeadlineLines` e adicionar:

```tsx
expect(contactHeadlineLines).toEqual([
  "O PRÓXIMO PASSO",
  "DO SEU NEGÓCIO",
  "COMEÇA AQUI.",
]);
```

- [ ] **Step 2: Executar o teste e confirmar a falha**

Run: `npx vitest run components/contact/ContactFooter.test.tsx`

Expected: FAIL porque `contactHeadlineLines` ainda contém quatro entradas.

- [ ] **Step 3: Atualizar o conteúdo**

Substituir em `data/content.ts`:

```ts
export const contactHeadlineLines = [
  "O PRÓXIMO PASSO",
  "DO SEU NEGÓCIO",
  "COMEÇA AQUI.",
] as const;
```

- [ ] **Step 4: Centralizar as três linhas no desktop**

Em `ContactFooter.module.css`, manter `.headline` como grid de 12 colunas e aplicar:

```css
.headline {
  top: 30svh;
  grid-template-rows: repeat(3, auto);
  row-gap: 0.04em;
  text-align: center;
}

.headline span {
  grid-column: 1 / -1;
  white-space: nowrap;
}

.headline span:nth-child(1) { grid-row: 1; }
.headline span:nth-child(2) { grid-row: 2; }
.headline span:nth-child(3) { grid-row: 3; }
```

Remover as regras de `nth-child(4)` e os alinhamentos laterais antigos. Manter `z-index`, cores e famílias tipográficas existentes.

- [ ] **Step 5: Ajustar tablet e mobile**

No breakpoint mobile, substituir os posicionamentos individuais por:

```css
.headline {
  top: 41svh;
  right: 16px;
  left: 16px;
  font-size: clamp(1.6rem, 7.2vw, 2.25rem);
}

.headline span {
  grid-column: 1 / -1;
}
```

Não criar novas regras para o 3D ou `sceneAnchor`.

- [ ] **Step 6: Executar o teste direcionado**

Run: `npx vitest run components/contact/ContactFooter.test.tsx`

Expected: PASS nos três testes.

- [ ] **Step 7: Verificar integração e responsividade**

Run: `npm run typecheck`

Expected: PASS sem erros TypeScript.

Run: `npm run build`

Expected: build de produção concluído.

Inspecionar `http://127.0.0.1:3000/#contact` em 1440×900 e 390×844. Confirmar que as três linhas estão centralizadas, não ultrapassam a viewport e o 3D mantém escala, posição e movimento.
