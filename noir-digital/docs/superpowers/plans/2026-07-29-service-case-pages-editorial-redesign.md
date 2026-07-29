# Service Case Pages Editorial Redesign Implementation Plan

> **For agentic workers:** Execute directly by default. Use subagents only for independent bounded lanes that satisfy the global harness policy. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the nine service case pages with three category-specific editorial layouts, hybrid heroes, concise case-specific copy, native media proportions, and a one-file route rollback to the current presentation.

**Architecture:** Keep the current `CaseStudyArticle` and `data/case-studies.ts` intact as the rollback version. Build a parallel V2 system with one shared shell, one typed data module, shared media primitives, and `SiteCaseLayout`, `VideoCaseLayout`, and `GoogleCaseLayout`. Generate all redesigned assets under `asset-sources/case-redesign` and `public/cases-v2`; switch only `app/services/[slug]/page.tsx` after the V2 pages pass focused tests and visual review.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, CSS Modules, `next/image`, Sharp, FFmpeg, Vitest, Testing Library, Playwright, GPT Images.

---

## Scope and file map

### Preserve unchanged for rollback

- `components/services/CaseStudyArticle.tsx`
- `components/services/CaseStudyArticle.module.css`
- `data/case-studies.ts`
- `public/cases/**`

### Create

- `data/case-studies-v2.ts` — typed V2 content and ordered blocks for all nine cases.
- `data/case-studies-v2.test.ts` — content completeness, category, media, and causal-claim tests.
- `components/services/case-v2/CaseStudyArticleV2.tsx` — shared page shell and category dispatch.
- `components/services/case-v2/CaseStudyArticleV2.module.css` — shared typography, container, navigation, and CTA.
- `components/services/case-v2/CaseMediaV2.tsx` — native-ratio images, videos, captions, and responsive `sizes`.
- `components/services/case-v2/CaseMediaV2.module.css` — shared media frame and caption styling.
- `components/services/case-v2/SiteCaseLayout.tsx`
- `components/services/case-v2/SiteCaseLayout.module.css`
- `components/services/case-v2/VideoCaseLayout.tsx`
- `components/services/case-v2/VideoCaseLayout.module.css`
- `components/services/case-v2/GoogleCaseLayout.tsx`
- `components/services/case-v2/GoogleCaseLayout.module.css`
- `components/services/case-v2/CaseStudyArticleV2.test.tsx`
- `components/services/case-v2/SiteCaseLayout.test.tsx`
- `components/services/case-v2/VideoCaseLayout.test.tsx`
- `components/services/case-v2/GoogleCaseLayout.test.tsx`
- `scripts/build-case-assets-v2.mjs` — composites real screenshots over generated backgrounds.
- `tests/case-assets-v2.test.ts` — file existence, dimensions, and declared-ratio checks.
- `tests/interaction/case-pages-v2.spec.ts` — route, media, responsive, and rollback-safe E2E checks.
- `asset-sources/case-redesign/<slug>/background.png` — generated background sources.
- `public/cases-v2/<slug>/**` — optimized V2 heroes and derived evidence assets.
- `docs/verification/case-redesign-baseline.md` — before-state evidence and rollback inventory.

### Modify

- `app/services/[slug]/page.tsx` — switch route rendering and metadata to V2.
- `app/services/[slug]/page.test.tsx` — assert V2 static route data and metadata.
- `app/metadata.test.ts` — retain all nine sitemap entries and case-specific metadata.
- `package.json` — add the V2 asset build command.
- `playwright.config.ts` — no change unless the existing external base URL switch fails.

## Task 1: Record the current presentation and rollback boundary

**Files:**
- Create: `docs/verification/case-redesign-baseline.md`
- Inspect: `components/services/CaseStudyArticle.tsx`
- Inspect: `components/services/CaseStudyArticle.module.css`
- Inspect: `data/case-studies.ts`
- Inspect: `public/cases/**`

- [ ] **Step 1: Capture the nine current routes**

Run the current production build on port `3100`, then capture each page in desktop and mobile:

```powershell
npm run build
npm run start -- --port 3100
```

Use Playwright CLI sessions and save artifacts under:

```text
output/playwright/cases-before/<slug>-desktop.png
output/playwright/cases-before/<slug>-mobile.png
```

Expected: 18 screenshots, one desktop and one mobile image for each slug.

- [ ] **Step 2: Record hashes for rollback files**

Run:

```powershell
$targets = @(
  "components/services/CaseStudyArticle.tsx",
  "components/services/CaseStudyArticle.module.css",
  "data/case-studies.ts"
)
$targets | ForEach-Object {
  $hash = Get-FileHash -Algorithm SHA256 -LiteralPath $_
  "$($hash.Hash)  $($_)"
}
```

Expected: one SHA-256 line per rollback file.

- [ ] **Step 3: Write the baseline document**

Create `docs/verification/case-redesign-baseline.md` with this structure:

```markdown
# Case redesign baseline

## Rollback files

- `components/services/CaseStudyArticle.tsx`
- `components/services/CaseStudyArticle.module.css`
- `data/case-studies.ts`

The SHA-256 values recorded during this run are retained in the verification
log accompanying the before-state screenshots.

## Current public assets

The current presentation reads only from `public/cases/**` and remains untouched.

## Before-state screenshots

Desktop and mobile screenshots are stored in `output/playwright/cases-before/`.

## Rollback action

Restore the route imports in `app/services/[slug]/page.tsx` from
`CaseStudyArticleV2` and `getCaseStudyV2` to `CaseStudyArticle` and
`getCaseStudy`. No V1 component, data, or asset deletion is permitted before
visual approval.
```

- [ ] **Step 4: Commit only the baseline document**

```powershell
git add -- noir-digital/docs/verification/case-redesign-baseline.md
git commit -m "docs: record case redesign baseline"
```

Expected: the commit contains one file.

## Task 2: Define the V2 content model with failing tests

**Files:**
- Create: `data/case-studies-v2.ts`
- Create: `data/case-studies-v2.test.ts`
- Read: `data/case-studies.ts`
- Read: `data/projects.ts`

- [ ] **Step 1: Write the failing data tests**

Create `data/case-studies-v2.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { caseStudiesV2, getCaseStudyV2 } from "@/data/case-studies-v2";
import { projects } from "@/data/projects";

describe("caseStudiesV2", () => {
  it("defines exactly one V2 case for every project", () => {
    expect(caseStudiesV2.map(({ slug }) => slug)).toEqual(
      projects.map(({ slug }) => slug),
    );
  });

  it("uses one of the three approved category layouts", () => {
    expect(new Set(caseStudiesV2.map(({ categoryLayout }) => categoryLayout))).toEqual(
      new Set(["site", "video", "google"]),
    );
  });

  it("keeps every case concise and evidence-led", () => {
    for (const study of caseStudiesV2) {
      expect(study.sections.length).toBeGreaterThanOrEqual(3);
      expect(study.sections.length).toBeLessThanOrEqual(5);
      expect(study.sections.some(({ type }) => type === "evidence")).toBe(true);
      expect(study.hero.src).toMatch(/^\/cases-v2\/.+\.webp$/);
      expect(study.hero.width).toBeGreaterThan(0);
      expect(study.hero.height).toBeGreaterThan(0);
    }
  });

  it("credits Dolomon only on video cases", () => {
    for (const study of caseStudiesV2) {
      expect(Boolean(study.credit)).toBe(study.categoryLayout === "video");
    }
  });

  it("does not claim that SEO created visible reviews", () => {
    const googleCopy = caseStudiesV2
      .filter(({ categoryLayout }) => categoryLayout === "google")
      .flatMap(({ sections }) => sections)
      .map((section) => JSON.stringify(section))
      .join(" ");

    expect(googleCopy).not.toMatch(/(criamos|geramos|aumentamos) as avaliaç(ão|ões)/i);
  });

  it("returns undefined for unknown slugs", () => {
    expect(getCaseStudyV2("unknown")).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run the test and verify the missing module failure**

Run:

```powershell
npx vitest run data/case-studies-v2.test.ts
```

Expected: FAIL because `@/data/case-studies-v2` does not exist.

- [ ] **Step 3: Create the V2 types and selectors**

Create `data/case-studies-v2.ts` with these complete public contracts:

```ts
import type { CaseStudySlug } from "@/data/case-studies";

export type CaseCategoryLayout = "site" | "video" | "google";
export type CaseAccent = "together-yellow" | "madeireira-green" | "jr-red-blue"
  | "strong-spectrum" | "together-blue" | "ecox-earth"
  | "chapada-green" | "contabil-gold" | "ipiranga-yellow-blue";

export type EditorialImage = {
  readonly kind: "image";
  readonly src: `/cases${string}.webp`;
  readonly alt: string;
  readonly caption: string;
  readonly width: number;
  readonly height: number;
  readonly fit: "contain" | "cover";
};

export type EditorialVideo = {
  readonly kind: "video";
  readonly src: `/cases${string}.mp4`;
  readonly poster: `/cases${string}.webp`;
  readonly alt: string;
  readonly caption: string;
  readonly width: number;
  readonly height: number;
};

export type EditorialMedia = EditorialImage | EditorialVideo;

export type TextSection = {
  readonly type: "text";
  readonly id: string;
  readonly eyebrow?: string;
  readonly title: string;
  readonly paragraphs: readonly string[];
};

export type EvidenceSection = {
  readonly type: "evidence";
  readonly id: string;
  readonly title: string;
  readonly presentation:
    | "wide-sequence"
    | "device-comparison"
    | "campaign"
    | "single-film"
    | "paired-films"
    | "search-journey";
  readonly media: readonly EditorialMedia[];
};

export type InsightSection = {
  readonly type: "insights";
  readonly id: string;
  readonly title: string;
  readonly items: readonly {
    readonly label: string;
    readonly body: string;
  }[];
};

export type CaseSection = TextSection | EvidenceSection | InsightSection;

export type CaseStudyV2 = {
  readonly slug: CaseStudySlug;
  readonly categoryLayout: CaseCategoryLayout;
  readonly accent: CaseAccent;
  readonly headline: string;
  readonly summary: string;
  readonly hero: EditorialImage;
  readonly sections: readonly CaseSection[];
  readonly credit?: {
    readonly name: "Dolomon";
    readonly role: "Design, motion design e edição de vídeo";
    readonly contribution: string;
  };
  readonly cta: {
    readonly label: string;
    readonly body: string;
  };
  readonly seoDescription: string;
};

export const caseStudiesV2: readonly CaseStudyV2[] = [];

export function getCaseStudyV2(slug: string): CaseStudyV2 | undefined {
  return caseStudiesV2.find((study) => study.slug === slug);
}

export function getCaseStudyV2Navigation(slug: CaseStudySlug) {
  const index = caseStudiesV2.findIndex((study) => study.slug === slug);
  return {
    previous: index > 0 ? caseStudiesV2[index - 1] : undefined,
    next:
      index >= 0 && index < caseStudiesV2.length - 1
        ? caseStudiesV2[index + 1]
        : undefined,
  };
}
```

- [ ] **Step 4: Run the data test and confirm it now fails on missing cases**

Run:

```powershell
npx vitest run data/case-studies-v2.test.ts
```

Expected: FAIL because `caseStudiesV2` is empty.

## Task 3: Author the nine concise V2 case records

**Files:**
- Modify: `data/case-studies-v2.ts`
- Test: `data/case-studies-v2.test.ts`

- [ ] **Step 1: Add the shared media and CTA helpers**

Add above `caseStudiesV2`:

```ts
const videoCredit = (contribution: string) => ({
  name: "Dolomon" as const,
  role: "Design, motion design e edição de vídeo" as const,
  contribution,
});

const siteCta = {
  label: "Planejar um site",
  body: "Organize sua presença digital para transformar interesse em uma conversa comercial.",
} as const;

const videoCta = {
  label: "Criar conteúdo em vídeo",
  body: "Apresente produtos, processos e experiências com direção, ritmo e clareza.",
} as const;

const googleCta = {
  label: "Fortalecer presença no Google",
  body: "Estruture as informações que ajudam clientes locais a encontrar e escolher sua empresa.",
} as const;
```

- [ ] **Step 2: Add the three Site records**

Use these exact section sequences:

```ts
{
  slug: "together-site",
  categoryLayout: "site",
  accent: "together-yellow",
  headline: "Complexidade técnica, leitura direta",
  summary: "Um site que organiza privacidade, tecnologia e serviços especializados em uma jornada clara até o contato.",
  hero: {
    kind: "image",
    src: "/cases-v2/together-site/hero.webp",
    alt: "Site da Together apresentado em telas desktop e mobile",
    caption: "Interface real inserida em uma composição editorial da Together.",
    width: 2400,
    height: 1500,
    fit: "contain",
  },
  sections: [
    {
      type: "text",
      id: "desafio",
      eyebrow: "Desafio",
      title: "Explicar sem simplificar demais",
      paragraphs: [
        "Privacidade e proteção de dados exigem precisão. A arquitetura editorial separa serviços, método e caminhos de contato sem transformar o site em um documento técnico.",
      ],
    },
    {
      type: "evidence",
      id: "experiencia",
      title: "Uma experiência que se adapta ao contexto",
      presentation: "device-comparison",
      media: [
        {
          kind: "image",
          src: "/cases/together-site/hero.webp",
          alt: "Abertura responsiva do site da Together",
          caption: "A proposta de valor permanece legível em desktop e mobile.",
          width: 2400,
          height: 1350,
          fit: "contain",
        },
        {
          kind: "image",
          src: "/cases/together-site/mobile.webp",
          alt: "Site da Together em uma tela mobile",
          caption: "Navegação e chamadas preservadas em telas menores.",
          width: 900,
          height: 1600,
          fit: "contain",
        },
      ],
    },
    {
      type: "insights",
      id: "decisoes",
      title: "Decisões do projeto",
      items: [
        { label: "Conteúdo", body: "Hierarquia para serviços técnicos e metodologia." },
        { label: "Experiência", body: "Chamadas comerciais próximas do contexto." },
        { label: "Base", body: "Componentes responsivos preparados para evolução." },
      ],
    },
  ],
  cta: siteCta,
  seoDescription: "Case editorial do site da Together, com arquitetura de conteúdo e desenvolvimento responsivo.",
}
```

Add `madeireira-fortaleza` with the sequence `produto → catálogo → orçamento` and media:

```ts
[
  "/cases/madeireira-fortaleza/hero.webp",
  "/cases/madeireira-fortaleza/products.webp",
  "/cases/madeireira-fortaleza/contact.webp",
]
```

Use headline `Produto, confiança e orçamento no mesmo percurso`, accent `madeireira-green`, and hero `/cases-v2/madeireira-fortaleza/hero.webp` at `2400 × 1500`.

Add `jr-express` with the sequence `necessidade logística → serviços → cotação` and media:

```ts
[
  "/cases/jr-express/hero.webp",
  "/cases/jr-express/services.webp",
  "/cases/jr-express/quote.webp",
]
```

Use headline `Da necessidade logística à cotação`, accent `jr-red-blue`, and hero `/cases-v2/jr-express/hero.webp` at `2400 × 1500`.

- [ ] **Step 3: Add the three Video records**

Use these exact presentations:

```ts
strong: "campaign"
together-motion: "single-film"
ecox-hostel-cabanas: "paired-films"
```

Strong uses the three existing MP4 files, headline `Três produtos, uma campanha em movimento`, and hero `/cases-v2/strong/hero.webp` at `2400 × 1500`.

Together Motion uses the existing horizontal MP4, headline `Uma migração técnica em 44,9 segundos`, and hero `/cases-v2/together-motion/hero.webp` at `2400 × 1350`.

ECOX uses the two existing vertical MP4 files, headline `A estadia começa antes da reserva`, and hero `/cases-v2/ecox-hostel-cabanas/hero.webp` at `2400 × 1500`.

Each record has one `text` section, one `evidence` section, one `insights` section, `videoCredit(...)`, and `videoCta`.

- [ ] **Step 4: Add the three Google records**

Use one `text`, one `evidence` with `presentation: "search-journey"`, and one `insights` section per record.

Use these headlines and hero paths:

```ts
[
  ["chapada-backpackers", "Ser encontrada no momento da viagem", "/cases-v2/chapada-backpackers/hero.webp"],
  ["contabil-sudoeste", "Confiança local antes do primeiro contato", "/cases-v2/contabil-sudoeste/hero.webp"],
  ["posto-ipiranga", "Informação útil antes de seguir a rota", "/cases-v2/posto-ipiranga/hero.webp"],
]
```

Each Google record uses its two existing real screenshots, preserves their declared dimensions, uses `fit: "contain"`, and ends with `googleCta`.

Use these exact strings for the eight records not expanded in Step 2:

```ts
const approvedCopy = {
  "madeireira-fortaleza": {
    summary:
      "Um site que transforma variedade de produtos, confiança local e atendimento em um percurso direto até o orçamento.",
    textTitle: "Mostrar a madeira antes de iniciar a conversa",
    textBody:
      "A experiência aproxima produto e aplicação. Categorias, texturas e chamadas comerciais aparecem na ordem em que ajudam o cliente a avaliar e pedir atendimento.",
    insights: [
      ["Produto", "Categorias e aplicações ocupam o centro da narrativa."],
      ["Confiança", "A linguagem visual reforça materialidade e procedência."],
      ["Contato", "WhatsApp e orçamento aparecem próximos da decisão."],
    ],
  },
  "jr-express": {
    summary:
      "Uma presença digital que organiza capacidade logística e conduz a necessidade do cliente até uma cotação estruturada.",
    textTitle: "Responder rápido ao que importa na logística",
    textBody:
      "A página apresenta atuação, serviços e segurança antes de solicitar origem, destino e detalhes da carga.",
    insights: [
      ["Clareza", "Serviços e áreas de atuação são apresentados antes do formulário."],
      ["Contexto", "A interface explica a operação sem prolongar a jornada."],
      ["Cotação", "Os dados essenciais chegam organizados para o atendimento."],
    ],
  },
  strong: {
    summary:
      "Três peças verticais apresentam produtos, sabores e performance com unidade visual e ritmos diferentes.",
    textTitle: "Uma campanha que muda sem perder reconhecimento",
    textBody:
      "Cada vídeo parte de um atributo de produto e preserva tipografia, contraste e presença da marca no formato vertical.",
    insights: [
      ["Formato", "Composição construída para consumo em 9:16."],
      ["Produto", "Embalagem e atributo permanecem legíveis em movimento."],
      ["Variação", "As peças compartilham sistema sem repetir a mesma edição."],
    ],
  },
  "together-motion": {
    summary:
      "Um motion horizontal transforma exportação, tratamento e importação em uma explicação visual objetiva.",
    textTitle: "Três etapas técnicas, uma sequência legível",
    textBody:
      "A progressão visual reduz abstração e mantém Together e Privacy Tools identificáveis durante toda a apresentação.",
    insights: [
      ["Sequência", "Exportar, tratar e importar aparecem em ordem explícita."],
      ["Leitura", "Movimento orienta a atenção sem competir com a informação."],
      ["Marcas", "As duas identidades mantêm hierarquia e consistência."],
    ],
  },
  "ecox-hostel-cabanas": {
    summary:
      "Dois vídeos verticais mostram novidade, estrutura e atmosfera para antecipar a experiência da hospedagem.",
    textTitle: "Fazer o público imaginar a estadia",
    textBody:
      "A edição alterna ambiente, detalhes e informação prática para aproximar descoberta e intenção de reserva.",
    insights: [
      ["Atmosfera", "Luz, madeira e paisagem apresentam a sensação do espaço."],
      ["Estrutura", "Comodidades aparecem dentro de uma narrativa de experiência."],
      ["Descoberta", "As peças funcionam como conteúdo de apresentação e novidade."],
    ],
  },
  "chapada-backpackers": {
    summary:
      "Perfil, imagens e localização organizados para quem procura hospedagem e experiências em Lençóis.",
    textTitle: "Responder às perguntas de quem planeja a viagem",
    textBody:
      "O perfil reúne fotos, categoria, mapa e contato no mesmo contexto em que a pessoa compara opções locais.",
    insights: [
      ["Descoberta", "O perfil conecta a busca à presença real do negócio."],
      ["Verificação", "Fotos e localização ajudam a avaliar a hospedagem."],
      ["Ação", "Rota, site e contato permanecem próximos da decisão."],
    ],
  },
  "contabil-sudoeste": {
    summary:
      "Identidade, endereço e contato organizados para reforçar a presença regional do escritório.",
    textTitle: "Ser encontrada e verificada antes do atendimento",
    textBody:
      "A estrutura local facilita confirmar nome, atividade, localização e canais de contato sem depender de informações dispersas.",
    insights: [
      ["Identidade", "Nome e atividade aparecem de forma consistente."],
      ["Região", "Endereço e contexto local aproximam a busca do escritório."],
      ["Contato", "Os canais de atendimento ficam disponíveis no painel."],
    ],
  },
  "posto-ipiranga": {
    summary:
      "Localização, fotos e informações do estabelecimento reunidas para buscas de proximidade.",
    textTitle: "Informação prática para uma decisão imediata",
    textBody:
      "Quem procura abastecimento precisa confirmar rota, estrutura e disponibilidade com poucos passos antes da visita.",
    insights: [
      ["Proximidade", "O perfil responde a buscas ligadas à localização."],
      ["Rota", "Mapa e endereço ajudam a planejar o deslocamento."],
      ["Estrutura", "Fotos e produtos antecipam o que existe no local."],
    ],
  },
} as const;
```

- [ ] **Step 5: Run the data tests**

Run:

```powershell
npx vitest run data/case-studies-v2.test.ts
```

Expected: PASS, 6 tests.

- [ ] **Step 6: Commit the V2 model and content**

```powershell
git add -- noir-digital/data/case-studies-v2.ts noir-digital/data/case-studies-v2.test.ts
git commit -m "feat: define category-specific case content"
```

## Task 4: Build native-ratio shared media primitives

**Files:**
- Create: `components/services/case-v2/CaseMediaV2.tsx`
- Create: `components/services/case-v2/CaseMediaV2.module.css`
- Create: `components/services/case-v2/CaseStudyArticleV2.test.tsx`

- [ ] **Step 1: Write the failing shared media tests**

Create `CaseStudyArticleV2.test.tsx` with fixtures that assert:

```tsx
expect(screen.getByRole("img", { name: media.alt })).toHaveAttribute(
  "width",
  String(media.width),
);
expect(screen.getByRole("img", { name: media.alt })).toHaveAttribute(
  "height",
  String(media.height),
);
expect(container.querySelector("[data-fit='contain']")).toBeInTheDocument();
```

For videos:

```tsx
expect(video).toHaveAttribute("controls");
expect(video).toHaveAttribute("playsinline");
expect(video).toHaveAttribute("preload", "metadata");
expect(video).not.toHaveAttribute("autoplay");
```

- [ ] **Step 2: Run the test and verify the missing component failure**

Run:

```powershell
npx vitest run components/services/case-v2/CaseStudyArticleV2.test.tsx
```

Expected: FAIL because V2 components do not exist.

- [ ] **Step 3: Implement the shared media component**

Create `CaseMediaV2.tsx`:

```tsx
import Image from "next/image";

import type { EditorialMedia } from "@/data/case-studies-v2";

import styles from "./CaseMediaV2.module.css";

export function CaseMediaV2({
  media,
  priority = false,
}: {
  readonly media: EditorialMedia;
  readonly priority?: boolean;
}) {
  const ratio = `${media.width} / ${media.height}`;

  return (
    <figure className={styles.figure}>
      <div
        className={styles.frame}
        data-fit={media.kind === "image" ? media.fit : "contain"}
        style={{ aspectRatio: ratio }}
      >
        {media.kind === "image" ? (
          <Image
            className={styles.image}
            src={media.src}
            alt={media.alt}
            width={media.width}
            height={media.height}
            priority={priority}
            sizes="(max-width: 767px) calc(100vw - 32px), (max-width: 1199px) 88vw, 1120px"
          />
        ) : (
          // biome-ignore lint/a11y/useMediaCaption: supplied portfolio edits do not include transcript files.
          <video
            className={styles.video}
            aria-label={media.alt}
            controls
            playsInline
            preload="metadata"
            poster={media.poster}
            width={media.width}
            height={media.height}
          >
            <source src={media.src} type="video/mp4" />
          </video>
        )}
      </div>
      <figcaption>{media.caption}</figcaption>
    </figure>
  );
}
```

- [ ] **Step 4: Implement native-ratio CSS**

Create `CaseMediaV2.module.css`:

```css
.figure {
  min-width: 0;
  margin: 0;
}

.frame {
  position: relative;
  width: 100%;
  overflow: hidden;
  border: 1px solid var(--border-default);
  background: var(--surface-elevated);
}

.image,
.video {
  display: block;
  width: 100%;
  height: 100%;
}

.frame[data-fit="contain"] .image,
.video {
  object-fit: contain;
}

.frame[data-fit="cover"] .image {
  object-fit: cover;
}

.figure figcaption {
  max-width: 68ch;
  padding-top: 10px;
  color: var(--text-secondary);
  font-family: var(--font-pixel);
  font-size: 0.6875rem;
  line-height: 1.5;
}
```

- [ ] **Step 5: Run the focused tests**

Run:

```powershell
npx vitest run components/services/case-v2/CaseStudyArticleV2.test.tsx
```

Expected: media assertions pass; shell assertions may remain failing until Task 5.

## Task 5: Implement the shared V2 shell and safe category dispatch

**Files:**
- Create: `components/services/case-v2/CaseStudyArticleV2.tsx`
- Create: `components/services/case-v2/CaseStudyArticleV2.module.css`
- Modify: `components/services/case-v2/CaseStudyArticleV2.test.tsx`

- [ ] **Step 1: Add failing shell tests**

Add:

```tsx
expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
expect(container.firstElementChild).toHaveAttribute(
  "data-case-layout",
  study.categoryLayout,
);
expect(screen.getByRole("link", { name: study.cta.label })).toHaveAttribute(
  "href",
  "/#contact",
);
```

Assert that navigation renders previous and next cases and that a site fixture dispatches `SiteCaseLayout`.

- [ ] **Step 2: Implement the shell**

Create `CaseStudyArticleV2.tsx`:

```tsx
"use client";

import type { CaseStudyV2 } from "@/data/case-studies-v2";
import type { Project } from "@/data/projects";

import { GoogleCaseLayout } from "./GoogleCaseLayout";
import { SiteCaseLayout } from "./SiteCaseLayout";
import { VideoCaseLayout } from "./VideoCaseLayout";
import styles from "./CaseStudyArticleV2.module.css";

type Navigation = {
  readonly previous: CaseStudyV2 | undefined;
  readonly next: CaseStudyV2 | undefined;
};

export function CaseStudyArticleV2({
  project,
  study,
  navigation,
}: {
  readonly project: Project;
  readonly study: CaseStudyV2;
  readonly navigation: Navigation;
}) {
  const Layout = {
    site: SiteCaseLayout,
    video: VideoCaseLayout,
    google: GoogleCaseLayout,
  }[study.categoryLayout];

  return (
    <article
      className={styles.page}
      data-case-study={study.slug}
      data-case-layout={study.categoryLayout}
      data-accent={study.accent}
    >
      <Layout project={project} study={study} />
      <section className={styles.closing}>
        <p>Próximo passo</p>
        <h2>{study.cta.body}</h2>
        <a href="/#contact">{study.cta.label}</a>
      </section>
      <nav className={styles.navigation} aria-label="Navegação entre cases">
        {navigation.previous ? (
          <a href={`/services/${navigation.previous.slug}`}>
            <span>Anterior</span>
            {navigation.previous.headline}
          </a>
        ) : (
          <a href="/#selected-work">
            <span>Voltar</span>
            Todos os cases
          </a>
        )}
        {navigation.next ? (
          <a href={`/services/${navigation.next.slug}`}>
            <span>Próximo</span>
            {navigation.next.headline}
          </a>
        ) : null}
      </nav>
    </article>
  );
}
```

- [ ] **Step 3: Implement shared semibold and navigation CSS**

The CSS must include:

```css
.page {
  width: min(1180px, calc(100% - 48px));
  padding: 168px 0 112px;
  margin: 0 auto;
}

.page h1,
.page h2,
.page h3 {
  font-family: var(--font-display);
  font-weight: 600;
  text-wrap: balance;
}

.closing {
  padding: clamp(40px, 7vw, 88px);
  border: 1px solid var(--border-default);
  margin-top: clamp(96px, 14vw, 176px);
  background: var(--surface-elevated);
}

.navigation {
  display: grid;
  padding-top: 64px;
  border-top: 1px solid var(--border-default);
  margin-top: 96px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

@media (max-width: 767px) {
  .page {
    width: 100%;
    padding: 136px 16px 80px;
  }

  .navigation {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 4: Run the shell tests**

Run:

```powershell
npx vitest run components/services/case-v2/CaseStudyArticleV2.test.tsx
```

Expected: PASS after category layout stubs exist in Tasks 6–8; before that, missing-module failures are expected.

## Task 6: Implement the Site editorial layout

**Files:**
- Create: `components/services/case-v2/SiteCaseLayout.tsx`
- Create: `components/services/case-v2/SiteCaseLayout.module.css`
- Create: `components/services/case-v2/SiteCaseLayout.test.tsx`

- [ ] **Step 1: Write the failing Site layout test**

```tsx
it("renders a site hero, concise story, and native-ratio evidence", () => {
  render(<SiteCaseLayout project={project} study={study} />);
  expect(screen.getByRole("heading", { level: 1, name: study.headline })).toBeVisible();
  expect(screen.getByTestId("site-case-hero")).toBeVisible();
  expect(screen.getAllByRole("figure")).toHaveLength(3);
  expect(screen.queryByText("Valor para a empresa")).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run the test and verify failure**

Run:

```powershell
npx vitest run components/services/case-v2/SiteCaseLayout.test.tsx
```

Expected: FAIL because `SiteCaseLayout` does not exist.

- [ ] **Step 3: Implement the Site layout**

Render:

```tsx
<header className={styles.hero}>
  <div className={styles.heroCopy}>
    <p>{project.client} / Site</p>
    <h1>{study.headline}</h1>
    <p>{study.summary}</p>
  </div>
  <div data-testid="site-case-hero" className={styles.heroMedia}>
    <CaseMediaV2 media={study.hero} priority />
  </div>
</header>
```

Map `text` sections to editorial copy, `evidence` sections to an asymmetric sequence, and `insights` to a compact decision index. Do not render empty containers for unsupported section types; throw during development if a Site record contains an invalid presentation.

- [ ] **Step 4: Implement the Site layout CSS**

Required layout rules:

```css
.hero {
  display: grid;
  grid-template-columns: minmax(260px, 0.72fr) minmax(0, 1.28fr);
  gap: clamp(32px, 6vw, 96px);
  align-items: end;
}

.heroMedia {
  min-width: 0;
}

.evidence {
  display: grid;
  gap: clamp(32px, 6vw, 80px);
}

.evidence > :nth-child(even) {
  width: min(82%, 920px);
  margin-left: auto;
}

@media (max-width: 767px) {
  .hero {
    grid-template-columns: 1fr;
  }

  .evidence > :nth-child(even) {
    width: 100%;
  }
}
```

- [ ] **Step 5: Run and commit**

```powershell
npx vitest run components/services/case-v2/SiteCaseLayout.test.tsx
git add -- noir-digital/components/services/case-v2/SiteCaseLayout*
git commit -m "feat: add editorial site case layout"
```

Expected: PASS.

## Task 7: Implement the Video cinematic layout

**Files:**
- Create: `components/services/case-v2/VideoCaseLayout.tsx`
- Create: `components/services/case-v2/VideoCaseLayout.module.css`
- Create: `components/services/case-v2/VideoCaseLayout.test.tsx`

- [ ] **Step 1: Write the failing Video layout tests**

Test Strong, Together Motion, and ECOX:

```tsx
expect(strongView.container.querySelectorAll("video")).toHaveLength(3);
expect(togetherView.container.querySelectorAll("video")).toHaveLength(1);
expect(ecoxView.container.querySelectorAll("video")).toHaveLength(2);
expect(screen.getByRole("heading", { name: "Dolomon" })).toBeVisible();
```

For every video:

```tsx
expect(video).toHaveAttribute("controls");
expect(video).not.toHaveAttribute("autoplay");
```

- [ ] **Step 2: Run the test and verify failure**

```powershell
npx vitest run components/services/case-v2/VideoCaseLayout.test.tsx
```

Expected: FAIL because `VideoCaseLayout` does not exist.

- [ ] **Step 3: Implement presentation-specific video grids**

Use `section.presentation` to select:

```tsx
const presentationClass = {
  campaign: styles.campaign,
  "single-film": styles.singleFilm,
  "paired-films": styles.pairedFilms,
}[section.presentation];
```

Render the first campaign video with `data-primary-video`, retain one player for `single-film`, and render two equal 9:16 columns for `paired-films`.

Render the integrated credit:

```tsx
<aside className={styles.credit}>
  <div className={styles.portrait} aria-hidden="true">D</div>
  <div>
    <p>Crédito de produção</p>
    <h2>{study.credit.name}</h2>
    <p>{study.credit.role}</p>
    <p>{study.credit.contribution}</p>
  </div>
</aside>
```

- [ ] **Step 4: Implement cinematic responsive CSS**

Required rules:

```css
.campaign {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 24px;
}

.campaign > :first-child {
  grid-row: span 2;
}

.singleFilm {
  width: min(100%, 1120px);
  margin-inline: auto;
}

.pairedFilms {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(16px, 4vw, 48px);
}

@media (max-width: 767px) {
  .campaign,
  .pairedFilms {
    grid-template-columns: 1fr;
  }

  .campaign > :first-child {
    grid-row: auto;
  }
}
```

- [ ] **Step 5: Run and commit**

```powershell
npx vitest run components/services/case-v2/VideoCaseLayout.test.tsx
git add -- noir-digital/components/services/case-v2/VideoCaseLayout*
git commit -m "feat: add cinematic video case layout"
```

Expected: PASS.

## Task 8: Implement the Google search-journey layout

**Files:**
- Create: `components/services/case-v2/GoogleCaseLayout.tsx`
- Create: `components/services/case-v2/GoogleCaseLayout.module.css`
- Create: `components/services/case-v2/GoogleCaseLayout.test.tsx`

- [ ] **Step 1: Write the failing Google layout tests**

```tsx
expect(screen.getByText("Buscar")).toBeVisible();
expect(screen.getByText("Encontrar")).toBeVisible();
expect(screen.getByText("Verificar")).toBeVisible();
expect(screen.getByText("Decidir")).toBeVisible();
expect(screen.getAllByRole("figure")).toHaveLength(3);
expect(document.body.textContent).not.toMatch(/geramos? as avaliações/i);
```

- [ ] **Step 2: Run the test and verify failure**

```powershell
npx vitest run components/services/case-v2/GoogleCaseLayout.test.tsx
```

Expected: FAIL because `GoogleCaseLayout` does not exist.

- [ ] **Step 3: Implement the search journey**

Render this semantic list before the evidence:

```tsx
const journey = [
  ["01", "Buscar", "Uma necessidade local inicia a pesquisa."],
  ["02", "Encontrar", "O perfil aparece com identidade e categoria."],
  ["03", "Verificar", "Fotos, localização e contato ajudam a avaliar."],
  ["04", "Decidir", "A pessoa escolhe rota, visita ou contato."],
] as const;
```

Use an ordered list and associate the two real screenshots with their specific captions. The generated hero remains separate and appears only once.

- [ ] **Step 4: Implement documentary responsive CSS**

Required rules:

```css
.journey {
  display: grid;
  padding: 0;
  border-block: 1px solid var(--border-default);
  grid-template-columns: repeat(4, minmax(0, 1fr));
  list-style: none;
}

.journey li {
  min-height: 180px;
  padding: 20px;
  border-right: 1px solid var(--border-default);
}

.evidence {
  display: grid;
  grid-template-columns: 1.18fr 0.82fr;
  gap: 24px;
  align-items: start;
}

@media (max-width: 767px) {
  .journey,
  .evidence {
    grid-template-columns: 1fr;
  }

  .journey li {
    min-height: auto;
    border-right: 0;
    border-bottom: 1px solid var(--border-default);
  }
}
```

- [ ] **Step 5: Run and commit**

```powershell
npx vitest run components/services/case-v2/GoogleCaseLayout.test.tsx
git add -- noir-digital/components/services/case-v2/GoogleCaseLayout*
git commit -m "feat: add documentary Google case layout"
```

Expected: PASS.

## Task 9: Generate nine hybrid heroes and optimized V2 assets

**Files:**
- Create: `asset-sources/case-redesign/<slug>/background.png`
- Create: `scripts/build-case-assets-v2.mjs`
- Create: `tests/case-assets-v2.test.ts`
- Create: `public/cases-v2/<slug>/hero.webp`
- Modify: `package.json`

- [ ] **Step 1: Generate the background-only images with GPT Images**

Generate one background per case. Do not ask the model to render logos, website text, Google panels, or products. Use these prompts:

```text
Together Site — clean black editorial studio, translucent amber acrylic blocks,
precise yellow light lines, generous negative space for a desktop monitor and
phone, premium privacy technology presentation, no devices, no logos, no text.

Madeireira Fortaleza — dark architectural studio with warm Brazilian hardwood
planes, restrained green edge light, negative space for a website interface,
premium commercial editorial scene, no devices, no logos, no text.

JR Express — deep graphite logistics environment, subtle road geometry and
directional red and navy light, negative space for a browser interface, no
trucks with branding, no devices, no logos, no text.

Strong — high-contrast black product campaign stage, controlled yellow, green
and violet light zones, negative space for three vertical video frames, no
supplement containers, no logos, no text.

Together Motion — white and deep blue technical editorial environment, fine
wave lines and modular data geometry, negative space for one horizontal video,
no devices, no logos, no text.

ECOX — cinematic forest-cabin atmosphere, warm interior light, natural timber
and dark green vegetation, negative space for two vertical video frames, no
people, no logos, no text.

Chapada Backpackers — warm travel editorial environment inspired by Chapada
Diamantina, sand and deep green palette, subtle route line, negative space for
Google search panels, no devices, no logos, no text.

Contábil Sudoeste — refined graphite office environment with restrained gold
line work, precise and trustworthy, negative space for local business panels,
no devices, no logos, no text.

Posto Ipiranga — clean mobility editorial environment, dark navy field with
controlled yellow directional lines, negative space for map and business
profile panels, no fuel station logo, no devices, no text.
```

Save each result as `asset-sources/case-redesign/<slug>/background.png`.

- [ ] **Step 2: Write the failing asset tests**

Create `tests/case-assets-v2.test.ts`:

```ts
import { access } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";

import { caseStudiesV2 } from "@/data/case-studies-v2";

describe("V2 case assets", () => {
  it("publishes every declared hero at its declared dimensions", async () => {
    for (const study of caseStudiesV2) {
      const file = path.join(process.cwd(), "public", study.hero.src);
      await access(file);
      const metadata = await sharp(file).metadata();
      expect(metadata.width).toBe(study.hero.width);
      expect(metadata.height).toBe(study.hero.height);
    }
  });
});
```

- [ ] **Step 3: Run the asset test and verify missing files**

```powershell
npx vitest run tests/case-assets-v2.test.ts
```

Expected: FAIL because `public/cases-v2` does not exist.

- [ ] **Step 4: Implement deterministic Sharp composites**

Create `scripts/build-case-assets-v2.mjs`. The configuration must declare:

```js
const heroes = [
  {
    slug: "together-site",
    size: [2400, 1500],
    background: "asset-sources/case-redesign/together-site/background.png",
    layers: [
      {
        source: "asset-sources/together/screenshots/together-desktop-hero-clean.png",
        left: 720,
        top: 270,
        width: 1440,
        height: 810,
      },
      {
        source: "asset-sources/together/screenshots/together-mobile-hero-clean.png",
        left: 310,
        top: 470,
        width: 360,
        height: 640,
      },
    ],
  },
  {
    slug: "madeireira-fortaleza",
    size: [2400, 1500],
    background: "asset-sources/case-redesign/madeireira-fortaleza/background.png",
    layers: [
      {
        source: "asset-sources/madeireira-fortaleza/screenshots/madeireira-fortaleza-hero.png",
        left: 640,
        top: 260,
        width: 1536,
        height: 864,
      },
    ],
  },
  {
    slug: "jr-express",
    size: [2400, 1500],
    background: "asset-sources/case-redesign/jr-express/background.png",
    layers: [
      {
        source: "asset-sources/jr-express/screenshots/jr-express-hero.png",
        left: 660,
        top: 280,
        width: 1536,
        height: 864,
      },
    ],
  },
  {
    slug: "strong",
    size: [2400, 1500],
    background: "asset-sources/case-redesign/strong/background.png",
    layers: [
      {
        source: "asset-sources/video-projects/strong/frames/whey-types/frame-03.jpg",
        left: 360,
        top: 170,
        width: 520,
        height: 924,
      },
      {
        source: "asset-sources/video-projects/strong/frames/gladiator-ultra/frame-03.jpg",
        left: 940,
        top: 250,
        width: 520,
        height: 924,
      },
      {
        source: "asset-sources/video-projects/strong/frames/cinco-sabores/frame-03.jpg",
        left: 1520,
        top: 170,
        width: 520,
        height: 924,
      },
    ],
  },
  {
    slug: "together-motion",
    size: [2400, 1350],
    background: "asset-sources/case-redesign/together-motion/background.png",
    layers: [
      {
        source: "asset-sources/video-projects/together/frames/privacy-motion/frame-03.jpg",
        left: 420,
        top: 260,
        width: 1560,
        height: 878,
      },
    ],
  },
  {
    slug: "ecox-hostel-cabanas",
    size: [2400, 1500],
    background: "asset-sources/case-redesign/ecox-hostel-cabanas/background.png",
    layers: [
      {
        source: "asset-sources/video-projects/ecox/frames/nova-cabana/frame-03.jpg",
        left: 560,
        top: 190,
        width: 560,
        height: 996,
      },
      {
        source: "asset-sources/video-projects/ecox/frames/o-que-encontra/frame-03.jpg",
        left: 1280,
        top: 260,
        width: 560,
        height: 996,
      },
    ],
  },
  {
    slug: "chapada-backpackers",
    size: [2400, 1500],
    background: "asset-sources/case-redesign/chapada-backpackers/background.png",
    layers: [
      {
        source: "asset-sources/google-presence/chapada-backpackers/screenshots/google-profile.jpg",
        left: 520,
        top: 320,
        width: 1518,
        height: 854,
      },
    ],
  },
  {
    slug: "contabil-sudoeste",
    size: [2400, 1500],
    background: "asset-sources/case-redesign/contabil-sudoeste/background.png",
    layers: [
      {
        source: "asset-sources/google-presence/contabil-sudoeste/screenshots/google-profile.jpg",
        left: 500,
        top: 320,
        width: 1518,
        height: 864,
      },
    ],
  },
  {
    slug: "posto-ipiranga",
    size: [2400, 1500],
    background: "asset-sources/case-redesign/posto-ipiranga/background.png",
    layers: [
      {
        source: "asset-sources/google-presence/posto-ipiranga/screenshots/google-profile.jpg",
        left: 430,
        top: 280,
        width: 1596,
        height: 1008,
      },
    ],
  },
];
```

The script must:

1. resize the generated background with `fit: "cover"`;
2. resize real UI with `fit: "contain"`;
3. place it over a neutral SVG frame with a 1px border and restrained shadow;
4. composite without rotation or perspective distortion;
5. export WebP at quality `90`, effort `6`;
6. write only under `public/cases-v2`.

- [ ] **Step 5: Add the package script**

```json
"assets:cases:v2": "node scripts/build-case-assets-v2.mjs"
```

- [ ] **Step 6: Generate and inspect every hero**

Run:

```powershell
npm run assets:cases:v2
npx vitest run tests/case-assets-v2.test.ts
```

Expected: nine WebP heroes and PASS.

Open each hero with image inspection and reject any result with:

- clipped UI;
- distorted text;
- stretched logo;
- incorrect client colors;
- empty framing;
- visible generation artifacts.

- [ ] **Step 7: Commit the asset pipeline and optimized outputs**

Do not commit the large background sources if `asset-sources` is intentionally excluded from source control. Commit only the script, tests, package command, and web outputs:

```powershell
git add -- noir-digital/scripts/build-case-assets-v2.mjs noir-digital/tests/case-assets-v2.test.ts noir-digital/package.json noir-digital/public/cases-v2
git commit -m "feat: add hybrid editorial case assets"
```

## Task 10: Switch the dynamic route to V2

**Files:**
- Modify: `app/services/[slug]/page.tsx`
- Modify: `app/services/[slug]/page.test.tsx`
- Modify: `app/metadata.test.ts`
- Test: `components/services/case-v2/*.test.tsx`

- [ ] **Step 1: Update the route tests first**

Change imports and expectations to V2:

```ts
import { caseStudiesV2, getCaseStudyV2 } from "@/data/case-studies-v2";

expect(generateStaticParams()).toEqual(
  caseStudiesV2.map(({ slug }) => ({ slug })),
);
expect(await generateMetadata({ params: Promise.resolve({ slug: "strong" }) }))
  .toMatchObject({
    title: expect.stringContaining("Strong"),
    description: getCaseStudyV2("strong")?.seoDescription,
  });
```

- [ ] **Step 2: Run the route test and verify failure**

```powershell
npx vitest run "app/services/[slug]/page.test.tsx"
```

Expected: FAIL while the route still uses V1.

- [ ] **Step 3: Switch only the route imports and selectors**

In `page.tsx`, use:

```tsx
import { CaseStudyArticleV2 } from "@/components/services/case-v2/CaseStudyArticleV2";
import {
  caseStudiesV2,
  getCaseStudyV2,
  getCaseStudyV2Navigation,
} from "@/data/case-studies-v2";
```

Render:

```tsx
<CaseStudyArticleV2
  project={project}
  study={study}
  navigation={getCaseStudyV2Navigation(study.slug)}
/>
```

Keep `dynamicParams = false`, `notFound()`, providers, header, and route shape unchanged.

- [ ] **Step 4: Run route, metadata, and component tests**

```powershell
npx vitest run "app/services/[slug]/page.test.tsx" app/metadata.test.ts components/services/case-v2
```

Expected: PASS.

- [ ] **Step 5: Commit the route switch**

```powershell
git add -- noir-digital/app/services/[slug]/page.tsx noir-digital/app/services/[slug]/page.test.tsx noir-digital/app/metadata.test.ts noir-digital/components/services/case-v2
git commit -m "feat: publish category-specific case pages"
```

## Task 11: Add E2E coverage for all three category systems

**Files:**
- Create: `tests/interaction/case-pages-v2.spec.ts`
- Read: `tests/interaction/case-pages.spec.ts`

- [ ] **Step 1: Write category and route tests**

Create:

```ts
import { expect, test } from "@playwright/test";

const cases = [
  ["together-site", "site"],
  ["madeireira-fortaleza", "site"],
  ["jr-express", "site"],
  ["strong", "video"],
  ["together-motion", "video"],
  ["ecox-hostel-cabanas", "video"],
  ["chapada-backpackers", "google"],
  ["contabil-sudoeste", "google"],
  ["posto-ipiranga", "google"],
] as const;

for (const [slug, layout] of cases) {
  test(`${slug} publishes the ${layout} editorial layout`, async ({ page }) => {
    await page.goto(`/services/${slug}`);
    await expect(page.locator("[data-case-study]")).toHaveAttribute(
      "data-case-study",
      slug,
    );
    await expect(page.locator("[data-case-layout]")).toHaveAttribute(
      "data-case-layout",
      layout,
    );
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("link", { name: /Planejar|Criar|Fortalecer/ })).toBeVisible();
  });
}
```

- [ ] **Step 2: Add media and mobile checks**

Add:

```ts
test("Strong keeps three controllable portrait videos", async ({ page }) => {
  await page.goto("/services/strong");
  await expect(page.locator("video")).toHaveCount(3);
  for (const video of await page.locator("video").all()) {
    await expect(video).toHaveAttribute("controls", "");
    await expect(video).not.toHaveAttribute("autoplay", "");
  }
});

test("mobile layouts have no horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const [slug] of cases) {
    await page.goto(`/services/${slug}`);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth === window.innerWidth),
    ).toBe(true);
  }
});
```

- [ ] **Step 3: Run desktop and mobile projects**

```powershell
$env:PLAYWRIGHT_BASE_URL="http://127.0.0.1:3000"
npx playwright test tests/interaction/case-pages-v2.spec.ts --project=desktop-chromium --project=mobile-chromium
```

Expected: all tests pass.

- [ ] **Step 4: Commit E2E coverage**

```powershell
git add -- noir-digital/tests/interaction/case-pages-v2.spec.ts
git commit -m "test: cover redesigned case pages"
```

## Task 12: Run production comparison and decide permanence

**Files:**
- Create: `docs/verification/case-redesign-results.md`
- Inspect: `output/playwright/cases-before/**`
- Create: `output/playwright/cases-after/**`

- [ ] **Step 1: Run focused static verification**

```powershell
npx biome check data/case-studies-v2.ts components/services/case-v2 scripts/build-case-assets-v2.mjs tests/case-assets-v2.test.ts tests/interaction/case-pages-v2.spec.ts
npm run typecheck
npx vitest run data/case-studies-v2.test.ts components/services/case-v2 tests/case-assets-v2.test.ts "app/services/[slug]/page.test.tsx" app/metadata.test.ts
```

Expected: all commands exit `0`.

- [ ] **Step 2: Run the production build**

```powershell
npm run build
```

Expected: 15 static pages, including nine `/services/[slug]` routes.

- [ ] **Step 3: Inspect generated HTML**

```powershell
$caseHtml = Get-ChildItem .next/server/app/services -File -Filter *.html
$combined = ($caseHtml | ForEach-Object {
  Get-Content -Raw -LiteralPath $_.FullName
}) -join "`n"

if ($caseHtml.Count -ne 9) { throw "Expected 9 case pages" }
if ($combined.Contains("asset-sources")) { throw "Authoring path leaked into build" }
if ($combined.Contains("C:\Users\Carlos")) { throw "Local path leaked into build" }
```

Expected: no exception.

- [ ] **Step 4: Capture after-state screenshots**

Capture all nine routes in desktop and mobile under:

```text
output/playwright/cases-after/<slug>-desktop.png
output/playwright/cases-after/<slug>-mobile.png
```

Scroll through every page before the final screenshot so lazy-loaded evidence is present.

- [ ] **Step 5: Complete the visual review**

For every case, compare before and after:

- first fold;
- hero proportion;
- evidence legibility;
- text repetition;
- category identity;
- client accent;
- CTA;
- mobile layout;
- loaded below-fold media.

Write the result in `docs/verification/case-redesign-results.md`:

```markdown
# Case redesign results

| Case | Category identity | Media fit | Copy | Mobile | Decision |
| --- | --- | --- | --- | --- | --- |
| Together Site | Pass | Pass | Pass | Pass | Keep |
```

Use only `Pass`, `Needs adjustment`, or `Reject`. Record a concrete observation for every non-pass item.

- [ ] **Step 6: Apply the permanence rule**

Keep V2 only if:

- every category is visually distinct;
- all nine pages still look like NOIR;
- all meaningful media is more legible than before;
- copy is shorter and case-specific;
- build and E2E checks pass.

If V2 is rejected, restore only the imports in `app/services/[slug]/page.tsx` and its test to V1. Leave V2 files unreferenced for inspection; do not delete concurrent work.

- [ ] **Step 7: Run the relevant final proof after any adjustment**

```powershell
npm run typecheck
npx vitest run data/case-studies-v2.test.ts components/services/case-v2 tests/case-assets-v2.test.ts "app/services/[slug]/page.test.tsx"
npm run build
$env:PLAYWRIGHT_BASE_URL="http://127.0.0.1:3000"
npx playwright test tests/interaction/case-pages-v2.spec.ts --project=desktop-chromium --project=mobile-chromium
```

Expected: all commands pass after the last relevant change.

- [ ] **Step 8: Commit the verified result**

```powershell
git add -- noir-digital/docs/verification/case-redesign-results.md
git commit -m "docs: verify editorial case redesign"
```

Do not claim the full repository suite is green if unrelated concurrent files fail. Report focused proof separately from pre-existing or concurrent failures.
