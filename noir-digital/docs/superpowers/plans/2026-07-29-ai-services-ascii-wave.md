# AI Services ASCII Wave Implementation Plan

> **For agentic workers:** Execute directly by default. Use subagents only for independent bounded lanes that satisfy the global harness policy. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a responsive, accessible AI-services section between the homepage work cards and cursor story, using resolution-independent static ASCII-wave SVG assets with no continuous runtime rendering.

**Architecture:** A deterministic Node script generates desktop and mobile SVG assets from grouped vector glyph paths. A focused React client component owns one selected-service ID and renders semantic DOM markers over the decorative external SVG. CSS Modules provide Noir-aligned layout and breakpoint-specific coordinates; the existing `PrinciplesStory` remains untouched and continues using its own measured geometry.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS Modules, Vitest, Testing Library, deterministic Node ESM asset generation.

---

## File Map

- Create `data/ai-services.ts`: immutable service IDs, labels, and descriptions.
- Create `data/ai-services.test.ts`: content order and uniqueness contract.
- Create `scripts/generate-ai-wave.mjs`: deterministic vector-glyph SVG generator.
- Modify `package.json`: add the `assets:ai` generation command.
- Create `public/assets/v1/ai-services/ascii-wave-desktop.svg`: generated landscape wave.
- Create `public/assets/v1/ai-services/ascii-wave-mobile.svg`: generated portrait wave.
- Create `tests/ai-services-assets.test.ts`: vector safety, resolution, and size limits.
- Create `components/ai-services/AiServicesSection.tsx`: section semantics and disclosure state.
- Create `components/ai-services/AiServicesSection.module.css`: visual system and responsive marker coordinates.
- Create `components/ai-services/AiServicesSection.test.tsx`: interaction and accessibility behavior.
- Modify `app/page.tsx`: insert the section between `SelectedWork` and `PrinciplesStory`.
- Create `app/page-order.test.ts`: source-order regression contract.

### Task 1: Lock the AI-service content contract

**Files:**
- Create: `data/ai-services.test.ts`
- Create: `data/ai-services.ts`

- [ ] **Step 1: Write the failing content test**

```ts
import { describe, expect, it } from "vitest";

import { aiServices } from "@/data/ai-services";

describe("aiServices", () => {
  it("publishes the six approved services in order", () => {
    expect(aiServices).toEqual([
      {
        id: "custom-software",
        label: "Software sob medida",
        description: "Sistemas e ferramentas construídos para o fluxo real da sua operação.",
      },
      {
        id: "process-automation",
        label: "Automação de processos",
        description: "Integrações que eliminam tarefas repetitivas e reduzem gargalos.",
      },
      {
        id: "agents-copilots",
        label: "Agentes e copilotos",
        description: "Assistentes com contexto do negócio para apoiar equipes e decisões.",
      },
      {
        id: "ai-implementation",
        label: "Implantação de IA",
        description: "Diagnóstico, priorização e implantação segura de casos de uso.",
      },
      {
        id: "smart-integrations",
        label: "Integrações inteligentes",
        description: "Conectamos dados, sistemas e modelos sem romper sua operação atual.",
      },
      {
        id: "operational-optimization",
        label: "Otimização operacional",
        description: "Monitoramento e melhoria contínua para ampliar produtividade e margem.",
      },
    ]);
  });

  it("keeps every service id unique", () => {
    expect(new Set(aiServices.map(({ id }) => id)).size).toBe(aiServices.length);
  });
});
```

- [ ] **Step 2: Run the test and verify the missing-module failure**

Run: `npm test -- data/ai-services.test.ts`

Expected: FAIL because `@/data/ai-services` does not exist.

- [ ] **Step 3: Add the typed immutable data**

```ts
export const aiServices = [
  {
    id: "custom-software",
    label: "Software sob medida",
    description: "Sistemas e ferramentas construídos para o fluxo real da sua operação.",
  },
  {
    id: "process-automation",
    label: "Automação de processos",
    description: "Integrações que eliminam tarefas repetitivas e reduzem gargalos.",
  },
  {
    id: "agents-copilots",
    label: "Agentes e copilotos",
    description: "Assistentes com contexto do negócio para apoiar equipes e decisões.",
  },
  {
    id: "ai-implementation",
    label: "Implantação de IA",
    description: "Diagnóstico, priorização e implantação segura de casos de uso.",
  },
  {
    id: "smart-integrations",
    label: "Integrações inteligentes",
    description: "Conectamos dados, sistemas e modelos sem romper sua operação atual.",
  },
  {
    id: "operational-optimization",
    label: "Otimização operacional",
    description: "Monitoramento e melhoria contínua para ampliar produtividade e margem.",
  },
] as const;

export type AiService = (typeof aiServices)[number];
export type AiServiceId = AiService["id"];
```

- [ ] **Step 4: Run the focused test**

Run: `npm test -- data/ai-services.test.ts`

Expected: 2 tests PASS.

- [ ] **Step 5: Commit the content contract**

```powershell
git add -- data/ai-services.ts data/ai-services.test.ts
git commit -m "feat: define AI services content"
```

### Task 2: Generate safe resolution-independent wave assets

**Files:**
- Create: `scripts/generate-ai-wave.mjs`
- Modify: `package.json`
- Create: `tests/ai-services-assets.test.ts`
- Generate: `public/assets/v1/ai-services/ascii-wave-desktop.svg`
- Generate: `public/assets/v1/ai-services/ascii-wave-mobile.svg`

- [ ] **Step 1: Write the failing asset-contract test**

```ts
import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const assets = [
  "public/assets/v1/ai-services/ascii-wave-desktop.svg",
  "public/assets/v1/ai-services/ascii-wave-mobile.svg",
] as const;

describe("AI services vector assets", () => {
  for (const asset of assets) {
    it(`${asset} is a safe bounded external SVG`, () => {
      const absolutePath = join(process.cwd(), asset);
      const source = readFileSync(absolutePath, "utf8");

      expect(source).toMatch(/^<svg[^>]+viewBox=/);
      expect(source).toContain('data-asset="ai-services-ascii-wave"');
      expect(source).not.toMatch(/<(?:script|animate|image|foreignObject)\b/i);
      expect(source).not.toContain("data:");
      expect(source.match(/<path\b/g)?.length).toBeLessThanOrEqual(8);
      expect(statSync(absolutePath).size).toBeLessThan(300_000);
    });
  }
});
```

- [ ] **Step 2: Run the test and verify both files are missing**

Run: `npm test -- tests/ai-services-assets.test.ts`

Expected: FAIL with `ENOENT`.

- [ ] **Step 3: Add the deterministic generator**

Implement `scripts/generate-ai-wave.mjs` with fixed layout presets, a stable integer hash, seven
vector glyph templates, and no runtime dependency:

```js
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const OUTPUT_ROOT = resolve("public/assets/v1/ai-services");
const GLYPHS = [".", ":", "+", "0", "1", "/", "\\"];
const TONES = ["#f4f4f0", "#bfdff3", "#2f80ff"];

const presets = [
  { file: "ascii-wave-desktop.svg", width: 1600, height: 900, columns: 132, rows: 62, cursor: true },
  { file: "ascii-wave-mobile.svg", width: 720, height: 1120, columns: 68, rows: 96, cursor: false },
];

function hash(x, y) {
  let value = Math.imul(x + 17, 374761393) ^ Math.imul(y + 31, 668265263);
  value = Math.imul(value ^ (value >>> 13), 1274126177);
  return ((value ^ (value >>> 16)) >>> 0) / 4294967295;
}

function number(value) {
  return Number(value.toFixed(2));
}

function glyphPath(glyph, x, y, size) {
  const left = number(x - size * 0.32);
  const right = number(x + size * 0.32);
  const top = number(y - size * 0.44);
  const bottom = number(y + size * 0.44);
  const middle = number(y);
  const short = number(size * 0.12);

  switch (glyph) {
    case ".":
      return `M${x} ${bottom}h${short}`;
    case ":":
      return `M${x} ${number(y - size * 0.2)}h${short}M${x} ${number(y + size * 0.28)}h${short}`;
    case "+":
      return `M${left} ${middle}H${right}M${x} ${top}V${bottom}`;
    case "0":
      return `M${left} ${top}H${right}V${bottom}H${left}Z`;
    case "1":
      return `M${number(x - size * 0.12)} ${number(top + size * 0.14)}L${x} ${top}V${bottom}`;
    case "/":
      return `M${left} ${bottom}L${right} ${top}`;
    case "\\":
      return `M${left} ${top}L${right} ${bottom}`;
    default:
      throw new TypeError(`Unknown glyph: ${glyph}`);
  }
}

function buildWave({ width, height, columns, rows, cursor }) {
  const paths = TONES.map(() => []);
  const xStep = width / (columns - 1);
  const yStep = height / (rows - 1);

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const nx = column / (columns - 1);
      const ny = row / (rows - 1);
      const wave =
        0.5 +
        Math.sin(nx * Math.PI * 2.3 + 0.45) * 0.13 +
        Math.sin(nx * Math.PI * 5.1) * 0.045;
      const thickness = 0.13 + Math.sin(nx * Math.PI) * 0.09;
      const distance = Math.abs(ny - wave);
      const random = hash(column, row);

      if (distance > thickness || random < distance / thickness * 0.62) continue;

      const intensity = 1 - distance / thickness;
      const blueBias = Math.max(0, (nx - 0.55) / 0.45);
      const tone = blueBias > 0.62 ? 2 : intensity > 0.56 ? 0 : 1;
      const glyph = GLYPHS[Math.floor(hash(row + 11, column + 23) * GLYPHS.length)];
      const x = number(column * xStep);
      const y = number(row * yStep);
      const size = number(Math.min(xStep, yStep) * (0.48 + intensity * 0.22));
      paths[tone].push(glyphPath(glyph, x, y, size));
    }
  }

  const pathMarkup = paths
    .map(
      (commands, index) =>
        `<path d="${commands.join("")}" fill="none" stroke="${TONES[index]}" stroke-opacity="${index === 0 ? 0.82 : 0.72}" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"/>`,
    )
    .join("");
  const cursorMarkup = cursor
    ? '<path d="M1360 472l96 42-50 20-20 55-46-117z" fill="#2f80ff"/><path d="M1360 472l46 62 50-20-96-42z" fill="#bfdff3" fill-opacity=".72"/>'
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" data-asset="ai-services-ascii-wave">${pathMarkup}${cursorMarkup}</svg>\n`;
}

await mkdir(OUTPUT_ROOT, { recursive: true });
for (const preset of presets) {
  const destination = resolve(OUTPUT_ROOT, preset.file);
  if (dirname(destination) !== OUTPUT_ROOT) throw new Error("Unsafe output path");
  await writeFile(destination, buildWave(preset), "utf8");
}
```

- [ ] **Step 4: Add the package script**

Add beside the existing asset scripts:

```json
"assets:ai": "node scripts/generate-ai-wave.mjs"
```

- [ ] **Step 5: Generate the assets and run the contract test**

Run:

```powershell
npm run assets:ai
npm test -- tests/ai-services-assets.test.ts
```

Expected: two SVG files are created and 2 tests PASS. If either file exceeds 300 KB, reduce the
corresponding `columns` or `rows` before continuing.

- [ ] **Step 6: Commit generator, assets, and contract**

```powershell
git add -- package.json scripts/generate-ai-wave.mjs tests/ai-services-assets.test.ts public/assets/v1/ai-services
git commit -m "feat: generate vector ASCII wave assets"
```

### Task 3: Implement accessible disclosure behavior

**Files:**
- Create: `components/ai-services/AiServicesSection.test.tsx`
- Create: `components/ai-services/AiServicesSection.tsx`

- [ ] **Step 1: Write failing component tests**

Test these concrete states with Testing Library:

```tsx
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { AiServicesSection } from "@/components/ai-services/AiServicesSection";
import { aiServices } from "@/data/ai-services";

afterEach(cleanup);

describe("AiServicesSection", () => {
  it("renders the approved content and closed marker state", () => {
    render(<AiServicesSection />);

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "IA para transformar operação em vantagem real",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Falar com especialista/i })).toHaveAttribute(
      "href",
      "mailto:contato@noirdigital.com.br",
    );
    for (const service of aiServices) {
      expect(screen.getByRole("button", { name: service.label })).toHaveAttribute(
        "aria-expanded",
        "false",
      );
    }
    expect(screen.queryByTestId("ai-service-detail")).not.toBeInTheDocument();
  });

  it("opens, switches, and closes one service at a time", () => {
    render(<AiServicesSection />);
    const first = screen.getByRole("button", { name: aiServices[0].label });
    const second = screen.getByRole("button", { name: aiServices[1].label });

    fireEvent.click(first);
    expect(first).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByTestId("ai-service-detail")).toHaveTextContent(aiServices[0].description);

    fireEvent.click(second);
    expect(first).toHaveAttribute("aria-expanded", "false");
    expect(second).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByTestId("ai-service-detail")).toHaveTextContent(aiServices[1].description);

    fireEvent.click(second);
    expect(screen.queryByTestId("ai-service-detail")).not.toBeInTheDocument();
  });

  it("closes with Escape and restores marker focus", () => {
    render(<AiServicesSection />);
    const marker = screen.getByRole("button", { name: aiServices[0].label });
    fireEvent.click(marker);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByTestId("ai-service-detail")).not.toBeInTheDocument();
    expect(marker).toHaveFocus();
  });

  it("closes when the pointer presses outside the active disclosure", () => {
    render(<AiServicesSection />);
    fireEvent.click(screen.getByRole("button", { name: aiServices[0].label }));
    fireEvent.pointerDown(screen.getByRole("heading", { level: 2 }));
    expect(screen.queryByTestId("ai-service-detail")).not.toBeInTheDocument();
  });

  it("keeps the wave decorative and external", () => {
    const view = render(<AiServicesSection />);
    const picture = view.container.querySelector("picture");
    const image = within(picture as HTMLElement).getByRole("presentation", { hidden: true });
    expect(image).toHaveAttribute("src", "/assets/v1/ai-services/ascii-wave-desktop.svg");
    expect(image).toHaveAttribute("loading", "lazy");
    expect(view.container.querySelector("svg")).not.toBeInTheDocument();
    expect(view.container.querySelector("canvas")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the tests and verify the component is missing**

Run: `npm test -- components/ai-services/AiServicesSection.test.tsx`

Expected: FAIL because the component module does not exist.

- [ ] **Step 3: Implement the section state and semantics**

Create a client component that:

```tsx
"use client";

import { useEffect, useRef, useState } from "react";

import { NoirControl } from "@/components/primitives/NoirControl";
import { aiServices, type AiServiceId } from "@/data/ai-services";

import styles from "./AiServicesSection.module.css";

export function AiServicesSection() {
  const [activeId, setActiveId] = useState<AiServiceId | null>(null);
  const markerRefs = useRef(new Map<AiServiceId, HTMLButtonElement>());
  const activeService = aiServices.find(({ id }) => id === activeId) ?? null;

  useEffect(() => {
    if (activeId === null) return;

    const close = () => setActiveId(null);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      markerRefs.current.get(activeId)?.focus();
      close();
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest("[data-ai-marker], [data-ai-detail]") === null) close();
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [activeId]);

  return (
    <section
      id="ai-services"
      className={styles.section}
      aria-labelledby="ai-services-heading"
      data-active-service={activeId ?? "none"}
    >
      <div className={styles.copy}>
        <p className={styles.eyebrow}>Inteligência aplicada</p>
        <h2 id="ai-services-heading">IA para transformar operação em vantagem real</h2>
        <p className={styles.body}>
          Soluções de IA que aumentam a eficiência, reduzem custos e criam vantagem competitiva. Do
          diagnóstico à execução, com foco em resultado.
        </p>
        <NoirControl kind="link" href="mailto:contato@noirdigital.com.br" meta="↗">
          Falar com especialista
        </NoirControl>
      </div>

      <div className={styles.visual}>
        <picture aria-hidden="true">
          <source
            media="(max-width: 767px)"
            srcSet="/assets/v1/ai-services/ascii-wave-mobile.svg"
          />
          <img
            className={styles.wave}
            src="/assets/v1/ai-services/ascii-wave-desktop.svg"
            alt=""
            width="1600"
            height="900"
            loading="lazy"
            decoding="async"
          />
        </picture>

        <div className={styles.markers}>
          {aiServices.map((service) => {
            const expanded = service.id === activeId;
            return (
              <div
                key={service.id}
                className={styles.marker}
                data-ai-marker
                data-ai-service={service.id}
              >
                <button
                  ref={(node) => {
                    if (node) markerRefs.current.set(service.id, node);
                    else markerRefs.current.delete(service.id);
                  }}
                  type="button"
                  className={styles.markerButton}
                  aria-controls="ai-service-detail"
                  aria-expanded={expanded}
                  onClick={() => setActiveId(expanded ? null : service.id)}
                >
                  <span aria-hidden="true">+</span>
                  <span>{service.label}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.detailReserve}>
        {activeService ? (
          <div
            id="ai-service-detail"
            data-testid="ai-service-detail"
            data-ai-detail
            className={styles.detail}
          >
            <strong>{activeService.label}</strong>
            <p>{activeService.description}</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Add a temporary empty CSS module and run interaction tests**

Create `components/ai-services/AiServicesSection.module.css` with the class names used by the
component and no visual layout yet. Run:

`npm test -- components/ai-services/AiServicesSection.test.tsx`

Expected: all behavior tests PASS.

- [ ] **Step 5: Commit the semantic component**

```powershell
git add -- components/ai-services/AiServicesSection.tsx components/ai-services/AiServicesSection.module.css components/ai-services/AiServicesSection.test.tsx
git commit -m "feat: add accessible AI service disclosures"
```

### Task 4: Apply the Noir composition and integrate page order

**Files:**
- Modify: `components/ai-services/AiServicesSection.module.css`
- Modify: `app/page.tsx`
- Create: `app/page-order.test.ts`

- [ ] **Step 1: Write the failing page-order regression**

```ts
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

describe("homepage section order", () => {
  it("places AI services after work and before the cursor story", () => {
    const source = readFileSync(join(process.cwd(), "app/page.tsx"), "utf8");
    const work = source.indexOf("<SelectedWork />");
    const ai = source.indexOf("<AiServicesSection />");
    const principles = source.indexOf("<PrinciplesStory />");

    expect(work).toBeGreaterThan(-1);
    expect(ai).toBeGreaterThan(work);
    expect(principles).toBeGreaterThan(ai);
  });
});
```

- [ ] **Step 2: Run the test and verify the section is absent**

Run: `npm test -- app/page-order.test.ts`

Expected: FAIL because `<AiServicesSection />` is absent.

- [ ] **Step 3: Insert the component without changing `PrinciplesStory`**

Add:

```tsx
import { AiServicesSection } from "@/components/ai-services/AiServicesSection";
```

and render:

```tsx
<SelectedWork />
<AiServicesSection />
<PrinciplesStory />
```

- [ ] **Step 4: Implement the complete CSS composition**

Use the existing Noir tokens and these exact structural rules:

```css
.section {
  position: relative;
  isolation: isolate;
  display: grid;
  min-height: max(100svh, 820px);
  overflow: clip;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: var(--grid-gutter);
  padding: clamp(96px, 11vh, 144px) var(--page-inline);
  background: var(--color-noir-black);
  color: var(--color-noir-warm-white);
}

.section::before {
  position: absolute;
  z-index: -1;
  inset: 0;
  background-image:
    linear-gradient(rgb(168 173 178 / 10%) 1px, transparent 1px),
    linear-gradient(90deg, rgb(168 173 178 / 10%) 1px, transparent 1px);
  background-size: calc(100% / 12) 25%;
  content: "";
  pointer-events: none;
}

.copy {
  position: relative;
  z-index: 3;
  grid-column: 1 / span 5;
  align-self: center;
  max-width: 39rem;
}

.eyebrow {
  margin: 0 0 var(--space-16);
  color: var(--color-noir-optical-blue);
  font-family: var(--font-pixel);
  font-size: var(--type-label);
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
}

.copy h2 {
  max-width: 10ch;
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(3.25rem, 5.3vw, 5.6rem);
  font-stretch: 120%;
  font-weight: 700;
  font-variation-settings: "wdth" 120;
  line-height: 0.94;
  letter-spacing: -0.055em;
}

.body {
  max-width: 43ch;
  margin: var(--space-10) 0 var(--space-10);
  color: rgb(244 244 240 / 72%);
  font-family: var(--font-display);
  font-size: var(--type-body-large);
  line-height: 1.55;
}

.visual {
  position: absolute;
  z-index: 1;
  inset: 0;
}

.visual::after {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, #030303 0%, rgb(3 3 3 / 92%) 24%, transparent 58%);
  content: "";
  pointer-events: none;
}

.visual picture {
  position: absolute;
  inset: 0;
}

.wave {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.markers {
  position: absolute;
  z-index: 2;
  inset: 0;
}

.marker {
  position: absolute;
  top: var(--marker-y);
  left: var(--marker-x);
  transform: translate(-50%, -50%);
}

.markerButton {
  display: flex;
  min-width: 44px;
  min-height: 44px;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border: 1px solid rgb(244 244 240 / 35%);
  background: rgb(3 3 3 / 78%);
  color: var(--color-noir-warm-white);
  font-family: var(--font-pixel);
  font-size: 0.6875rem;
  letter-spacing: 0.055em;
  text-transform: uppercase;
  transition:
    color var(--duration-micro) var(--ease-standard),
    border-color var(--duration-micro) var(--ease-standard),
    transform var(--duration-micro) var(--ease-standard);
}

.markerButton > span:first-child {
  color: var(--color-spectral-blue);
  font-family: var(--font-interface);
}

.markerButton:hover,
.markerButton[aria-expanded="true"] {
  border-color: var(--color-spectral-blue);
  color: var(--color-noir-optical-blue);
  transform: translateY(-2px);
}

.markerButton:focus-visible {
  outline: 1px dotted var(--color-noir-warm-white);
  outline-offset: var(--focus-offset);
}

.marker[data-ai-service="custom-software"] {
  --marker-x: 55%;
  --marker-y: 20%;
}

.marker[data-ai-service="process-automation"] {
  --marker-x: 77%;
  --marker-y: 29%;
}

.marker[data-ai-service="agents-copilots"] {
  --marker-x: 48%;
  --marker-y: 56%;
}

.marker[data-ai-service="ai-implementation"] {
  --marker-x: 67%;
  --marker-y: 47%;
}

.marker[data-ai-service="smart-integrations"] {
  --marker-x: 82%;
  --marker-y: 64%;
}

.marker[data-ai-service="operational-optimization"] {
  --marker-x: 60%;
  --marker-y: 78%;
}

.detailReserve {
  position: absolute;
  z-index: 4;
  top: var(--detail-y, 66%);
  left: var(--detail-x, 64%);
  width: min(22rem, calc(100% - 112px));
}

.section[data-active-service="custom-software"] {
  --detail-x: 47%;
  --detail-y: 29%;
}

.section[data-active-service="process-automation"] {
  --detail-x: 68%;
  --detail-y: 37%;
}

.section[data-active-service="agents-copilots"] {
  --detail-x: 39%;
  --detail-y: 64%;
}

.section[data-active-service="ai-implementation"] {
  --detail-x: 58%;
  --detail-y: 55%;
}

.section[data-active-service="smart-integrations"] {
  --detail-x: 70%;
  --detail-y: 72%;
}

.section[data-active-service="operational-optimization"] {
  --detail-x: 50%;
  --detail-y: 84%;
}

.detail {
  padding: var(--space-4);
  border-left: 1px solid var(--color-spectral-blue);
  background: rgb(3 3 3 / 92%);
  animation: detail-in var(--duration-standard) var(--ease-standard) both;
}

.detail strong {
  font-family: var(--font-interface);
  font-size: var(--type-label);
  text-transform: uppercase;
}

.detail p {
  margin: var(--space-2) 0 0;
  color: rgb(244 244 240 / 72%);
  font-family: var(--font-display);
  font-size: var(--type-body);
  line-height: var(--leading-body);
}

@keyframes detail-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

Add a tablet breakpoint that converts the section to six columns and supplies collision-free
coordinates. Add the mobile breakpoint below exactly as the reflow contract:

```css
@media (max-width: 767px) {
  .section {
    display: flex;
    min-height: auto;
    padding: 96px 16px 120px;
    flex-direction: column;
  }

  .section::before {
    background-size: 50% 12.5%;
  }

  .copy {
    width: 100%;
    max-width: none;
  }

  .copy h2 {
    max-width: 12ch;
    font-size: clamp(2.6rem, 13vw, 4rem);
  }

  .eyebrow {
    margin-bottom: var(--space-10);
  }

  .visual {
    position: relative;
    width: calc(100% + 32px);
    margin: var(--space-16) -16px 0;
    aspect-ratio: 720 / 1120;
  }

  .visual::after {
    background: linear-gradient(180deg, #030303 0%, transparent 24%, transparent 82%, #030303 100%);
  }

  .markerButton {
    max-width: 9rem;
    padding: var(--space-2);
    font-size: 0.625rem;
    line-height: 1.25;
  }

  .marker[data-ai-service="custom-software"] {
    --marker-x: 28%;
    --marker-y: 16%;
  }

  .marker[data-ai-service="process-automation"] {
    --marker-x: 69%;
    --marker-y: 28%;
  }

  .marker[data-ai-service="agents-copilots"] {
    --marker-x: 30%;
    --marker-y: 43%;
  }

  .marker[data-ai-service="ai-implementation"] {
    --marker-x: 69%;
    --marker-y: 56%;
  }

  .marker[data-ai-service="smart-integrations"] {
    --marker-x: 31%;
    --marker-y: 70%;
  }

  .marker[data-ai-service="operational-optimization"] {
    --marker-x: 66%;
    --marker-y: 83%;
  }

  .detailReserve {
    position: relative;
    top: auto;
    left: auto;
    width: 100%;
    min-height: 8rem;
    margin-top: var(--space-6);
  }
}

@media (prefers-reduced-motion: reduce) {
  .markerButton {
    transition: none;
  }

  .markerButton:hover,
  .markerButton[aria-expanded="true"] {
    transform: none;
  }

  .detail {
    animation: none;
  }
}
```

- [ ] **Step 5: Run focused integration tests**

Run:

```powershell
npm test -- app/page-order.test.ts components/ai-services/AiServicesSection.test.tsx data/ai-services.test.ts tests/ai-services-assets.test.ts
```

Expected: all focused tests PASS.

- [ ] **Step 6: Commit the page integration**

```powershell
git add -- app/page.tsx app/page-order.test.ts components/ai-services/AiServicesSection.module.css
git commit -m "feat: integrate AI services wave section"
```

### Task 5: Verify behavior, responsiveness, and performance

**Files:**
- Modify only files from Tasks 1–4 if verification exposes a defect.
- Record evidence in the final handoff; do not add generated screenshots unless explicitly useful.

- [ ] **Step 1: Run static and production gates**

Run in order:

```powershell
git diff --check
npm test -- app/page-order.test.ts components/ai-services/AiServicesSection.test.tsx data/ai-services.test.ts tests/ai-services-assets.test.ts
npm run typecheck
npm run check
npm run build
```

Expected: every command exits 0. Existing unrelated warnings must be reported separately and must
not be described as caused or fixed by this work without evidence.

- [ ] **Step 2: Start the local production-equivalent page**

Use a hidden background process:

```powershell
npm run dev -- --hostname 127.0.0.1 --port 3000
```

Open `http://127.0.0.1:3000/` in the Codex in-app browser.

- [ ] **Step 3: Verify desktop and tablet**

At 1440×900 and 1024×768, confirm:

- the section is immediately after the final Google cards;
- heading, body, CTA, wave, cursor silhouette, and six markers are visible;
- no marker or detail overflows the section;
- clicking each marker opens only its matching description;
- switching markers leaves one open;
- clicking the selected marker, pressing Escape, and clicking outside close it;
- keyboard focus remains visible;
- `PrinciplesStory` starts after the section and its cursor/text sequence still advances.

- [ ] **Step 4: Verify mobile and zoom**

At 390×844 and 320×640, and with 200% zoom/reflow, confirm:

- the mobile portrait SVG loads;
- all six 44-pixel marker targets remain usable;
- the detail reserve prevents layout shift;
- labels and body copy remain contained;
- no horizontal overflow exists;
- the CTA remains reachable and readable.

- [ ] **Step 5: Verify reduced motion and runtime cost**

With reduced motion enabled, confirm the disclosure changes immediately. Compare to the recorded
1280×720 baseline:

```js
{
  canvasCount: 12,
  runningAnimationsAddedByAiSection: 0,
  offscreenRafLoopsAddedByAiSection: 0
}
```

Use computed animation names and element bounds to confirm the new section contributes no running
animation while idle. Confirm it adds no `<canvas>` and no console errors.

- [ ] **Step 6: Fix only evidence-backed defects and rerun the failed gate**

For a responsive or interaction defect, change the smallest owning component or style, rerun the
focused test or viewport that failed, then rerun the full static gate once after the last code change.

- [ ] **Step 7: Record whether verification required a corrective commit**

If verification changed `AiServicesSection.tsx`, `AiServicesSection.module.css`, the generator, or
either SVG asset, stage only the specific corrected files from Tasks 2–4 and commit them with
`fix: polish AI services responsive behavior`. If no adjustment was needed, do not create an empty
commit.
