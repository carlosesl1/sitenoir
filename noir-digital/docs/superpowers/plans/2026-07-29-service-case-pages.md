# Service Case Pages Implementation Plan

> **For agentic workers:** Execute directly by default. Use subagents only for independent bounded lanes that satisfy the global harness policy. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build nine individual hybrid case pages from the existing `/services` editorial skeleton, wire every portfolio card to its case, publish optimized evidence media, and credit Dolomon on all three video cases.

**Architecture:** Keep `/services` as the general editorial page and add statically generated `/services/[slug]` routes. A typed `caseStudies` content module will join editorial copy and media to the existing `projects` records, while a reusable `CaseStudyArticle` will preserve the current table of contents, chapter rhythm, typography, metadata footer, and responsive behavior. A deterministic asset script will turn the existing authoring images and six source videos into production WebP/MP4 files under `public/cases`.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 5.9, CSS Modules, Motion 12, Sharp, FFmpeg, Vitest, Testing Library, Playwright.

---

## File map

### Create

- `data/case-studies.ts` — typed editorial content and media manifest for the nine cases.
- `data/case-studies.test.ts` — completeness, ordering, media, credits, and route invariants.
- `components/services/CaseStudyArticle.tsx` — reusable hybrid article based on the current skeleton.
- `components/services/CaseStudyArticle.module.css` — case-specific extensions of the editorial layout.
- `components/services/CaseStudyArticle.test.tsx` — semantic, media, CTA, credit, and navigation rendering.
- `app/services/[slug]/page.tsx` — static case route, metadata, and 404 handling.
- `app/services/[slug]/page.test.tsx` — static params and metadata coverage.
- `scripts/build-case-assets.mjs` — deterministic image optimization and video transcoding.
- `tests/interaction/case-pages.spec.ts` — navigation and responsive browser checks.

### Modify

- `data/projects.ts` — make every `href` point to `/services/[slug]`.
- `data/projects.test.ts` — assert unique case destinations.
- `components/work/SelectedWork.test.tsx` — assert each card uses its own route.
- `package.json` — add `assets:cases`.
- `app/sitemap.ts` — publish all case routes when a public site URL exists.
- `app/metadata.test.ts` — cover case sitemap entries.

### Generated production assets

- `public/cases/<slug>/*.webp` — hero, evidence, and poster images.
- `public/cases/strong/*.mp4` — three optimized vertical videos.
- `public/cases/together-motion/*.mp4` — one optimized horizontal video.
- `public/cases/ecox-hostel-cabanas/*.mp4` — two optimized vertical videos.

## Task 1: Define the case-study contract and route identity

**Files:**
- Create: `data/case-studies.test.ts`
- Create: `data/case-studies.ts`
- Modify: `data/projects.ts`
- Modify: `data/projects.test.ts`

- [ ] **Step 1: Write failing route and data-contract tests**

Add tests that require one case per project, one unique case route per card, complete media descriptions, and credits only on video cases:

```ts
import { describe, expect, it } from "vitest";

import { caseStudies, getCaseStudy, getCaseStudyNavigation } from "@/data/case-studies";
import { projects } from "@/data/projects";

describe("caseStudies", () => {
  it("publishes exactly one case for every project", () => {
    expect(caseStudies.map(({ slug }) => slug)).toEqual(projects.map(({ slug }) => slug));
    expect(new Set(caseStudies.map(({ slug }) => slug)).size).toBe(9);
  });

  it("exposes complete evidence media", () => {
    for (const study of caseStudies) {
      expect(study.summary.trim()).not.toBe("");
      expect(study.context.length).toBeGreaterThan(0);
      expect(study.deliveries.length).toBeGreaterThan(0);
      expect(study.benefits.length).toBeGreaterThan(0);
      expect(study.media.length).toBeGreaterThan(0);
      for (const media of study.media) {
        expect(media.alt.trim()).not.toBe("");
        expect(media.caption.trim()).not.toBe("");
        expect(media.width).toBeGreaterThan(0);
        expect(media.height).toBeGreaterThan(0);
      }
    }
  });

  it("credits Dolomon on every video case and nowhere else", () => {
    for (const study of caseStudies) {
      if (study.service === "videos") {
        expect(study.credit).toEqual({
          name: "Dolomon",
          role: "Design, motion design e edição de vídeo",
        });
      } else {
        expect(study.credit).toBeUndefined();
      }
    }
  });

  it("resolves adjacent case navigation in portfolio order", () => {
    expect(getCaseStudyNavigation("together-site")).toMatchObject({
      previous: undefined,
      next: { slug: "madeireira-fortaleza" },
    });
    expect(getCaseStudyNavigation("posto-ipiranga")).toMatchObject({
      previous: { slug: "contabil-sudoeste" },
      next: undefined,
    });
  });

  it("returns undefined for an unknown slug", () => {
    expect(getCaseStudy("unknown")).toBeUndefined();
  });
});
```

Update the existing project route assertion:

```ts
it("routes every project card to its individual case", () => {
  expect(projects.map(({ href }) => href)).toEqual(
    projects.map(({ slug }) => `/services/${slug}`),
  );
});
```

- [ ] **Step 2: Run the focused tests and verify failure**

Run:

```powershell
npm test -- data/case-studies.test.ts data/projects.test.ts
```

Expected: failure because `data/case-studies.ts` does not exist and project destinations still equal `/services`.

- [ ] **Step 3: Add the typed contract**

Create these public types and helpers in `data/case-studies.ts`:

```ts
import type { ServiceId } from "@/data/projects";
import { projects } from "@/data/projects";

export type CaseStudySlug = (typeof projects)[number]["slug"];

export type CaseImage = {
  readonly kind: "image";
  readonly src: `/cases/${string}.webp`;
  readonly alt: string;
  readonly caption: string;
  readonly width: number;
  readonly height: number;
  readonly layout: "wide" | "standard";
};

export type CaseVideo = {
  readonly kind: "video";
  readonly src: `/cases/${string}.mp4`;
  readonly poster: `/cases/${string}.webp`;
  readonly alt: string;
  readonly caption: string;
  readonly width: number;
  readonly height: number;
  readonly layout: "landscape" | "portrait";
};

export type CaseMedia = CaseImage | CaseVideo;

export type CaseStudy = {
  readonly slug: CaseStudySlug;
  readonly service: ServiceId;
  readonly headline: string;
  readonly summary: string;
  readonly context: readonly string[];
  readonly deliveries: readonly {
    readonly title: string;
    readonly body: string;
  }[];
  readonly benefits: readonly string[];
  readonly media: readonly CaseMedia[];
  readonly credit?: {
    readonly name: "Dolomon";
    readonly role: "Design, motion design e edição de vídeo";
  };
  readonly cta: {
    readonly label: string;
    readonly body: string;
  };
  readonly seoDescription: string;
};

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return caseStudies.find((study) => study.slug === slug);
}

export function getCaseStudyNavigation(slug: CaseStudySlug) {
  const index = caseStudies.findIndex((study) => study.slug === slug);
  return {
    previous: index > 0 ? caseStudies[index - 1] : undefined,
    next: index < caseStudies.length - 1 ? caseStudies[index + 1] : undefined,
  };
}
```

- [ ] **Step 4: Change the project destination type and values**

Change `Project.href` to:

```ts
readonly href: `/services/${string}`;
```

Assign these exact values:

```ts
[
  "/services/together-site",
  "/services/madeireira-fortaleza",
  "/services/jr-express",
  "/services/strong",
  "/services/together-motion",
  "/services/ecox-hostel-cabanas",
  "/services/chapada-backpackers",
  "/services/contabil-sudoeste",
  "/services/posto-ipiranga",
]
```

- [ ] **Step 5: Run the tests**

Run:

```powershell
npm test -- data/case-studies.test.ts data/projects.test.ts
```

Expected: the route assertions pass; completeness tests remain red until Task 2 supplies all nine records.

- [ ] **Step 6: Commit the contract and route identity**

```powershell
git add data/case-studies.ts data/case-studies.test.ts data/projects.ts data/projects.test.ts
git commit -m "feat: define service case contracts"
```

## Task 2: Add complete editorial content for all nine cases

**Files:**
- Modify: `data/case-studies.ts`
- Test: `data/case-studies.test.ts`

- [ ] **Step 1: Add the three site cases**

Use these exact content anchors and public media destinations:

```ts
{
  slug: "together-site",
  service: "sites",
  headline: "Privacidade e tecnologia com uma presença digital à altura",
  summary: "Um site responsivo que organiza serviços técnicos, fortalece confiança e conduz empresas até o próximo passo.",
  context: [
    "A Together atua em privacidade, proteção de dados e tecnologia — temas que exigem clareza sem perder profundidade.",
    "O projeto transformou esse repertório técnico em uma experiência digital direta, responsiva e orientada à conversa comercial.",
  ],
  deliveries: [
    { title: "Direção", body: "Arquitetura de conteúdo e linguagem visual alinhadas ao posicionamento privacy and tech." },
    { title: "Experiência", body: "Hierarquia, navegação e chamadas que tornam serviços complexos mais fáceis de compreender." },
    { title: "Implementação", body: "Desenvolvimento responsivo, componentes reutilizáveis e base preparada para evolução." },
  ],
  benefits: [
    "Explica serviços especializados com mais clareza.",
    "Reforça confiança antes do primeiro contato.",
    "Cria caminhos objetivos para diagnóstico e proposta.",
  ],
  media: [
    { kind: "image", src: "/cases/together-site/hero.webp", alt: "Site da Together exibido em desktop e celular", caption: "Experiência responsiva para serviços de privacidade e tecnologia.", width: 2400, height: 1350, layout: "wide" },
    { kind: "image", src: "/cases/together-site/full-page.webp", alt: "Página completa do site da Together", caption: "Arquitetura editorial e sequência de conteúdo da página.", width: 1600, height: 3200, layout: "standard" },
    { kind: "image", src: "/cases/together-site/mobile.webp", alt: "Abertura do site da Together em celular", caption: "Conteúdo e chamadas preservados em telas menores.", width: 900, height: 1600, layout: "standard" },
  ],
  cta: { label: "Planejar um site", body: "Transforme conhecimento e diferenciais em uma presença digital clara, confiável e pronta para crescer." },
  seoDescription: "Case do site da Together: estratégia, design e desenvolvimento responsivo para privacidade e tecnologia.",
}
```

Add the other two site records with this complete content:

```ts
{
  slug: "madeireira-fortaleza",
  service: "sites",
  headline: "Madeira, catálogo e orçamento em uma jornada direta",
  summary: "Uma presença digital que apresenta produtos, transmite confiança local e aproxima cada visita de um pedido de orçamento.",
  context: [
    "A Madeireira Fortaleza precisava organizar variedade, atendimento e confiança em uma experiência simples de consultar.",
    "O site usa a materialidade da madeira como linguagem visual e mantém produtos e contato sempre próximos da decisão.",
  ],
  deliveries: [
    { title: "Direção", body: "Identidade digital construída a partir de textura, aplicação e confiança no produto." },
    { title: "Catálogo", body: "Categorias e seções organizadas para facilitar a leitura das soluções disponíveis." },
    { title: "Conversão", body: "Chamadas de orçamento e contato posicionadas nos momentos de maior intenção." },
  ],
  benefits: [
    "Apresenta produtos sem depender de explicações dispersas.",
    "Reforça procedência e confiança antes do atendimento.",
    "Encurta o caminho entre interesse e orçamento.",
  ],
  media: [
    { kind: "image", src: "/cases/madeireira-fortaleza/hero.webp", alt: "Abertura do site da Madeireira Fortaleza", caption: "Proposta de valor, produto e orçamento concentrados na primeira tela.", width: 1600, height: 900, layout: "wide" },
    { kind: "image", src: "/cases/madeireira-fortaleza/products.webp", alt: "Seção de produtos da Madeireira Fortaleza", caption: "Organização visual para apresentar soluções e aplicações.", width: 1200, height: 1200, layout: "standard" },
    { kind: "image", src: "/cases/madeireira-fortaleza/contact.webp", alt: "Área de orçamento e contato do site", caption: "Próximo passo comercial visível e acessível.", width: 1200, height: 1200, layout: "standard" },
  ],
  cta: { label: "Planejar um site", body: "Organize produtos, diferenciais e contato em uma experiência que ajuda o cliente a decidir." },
  seoDescription: "Case do site da Madeireira Fortaleza: direção visual, catálogo e jornada de orçamento.",
},
{
  slug: "jr-express",
  service: "sites",
  headline: "Uma rota digital mais curta até a cotação",
  summary: "Um site de transporte que comunica capacidade, organiza serviços e reduz o atrito para solicitar uma cotação.",
  context: [
    "Quem procura transporte precisa compreender rapidamente cobertura, segurança e como iniciar a operação.",
    "O projeto reuniu essas respostas em uma jornada objetiva, com o formulário de cotação como ação central.",
  ],
  deliveries: [
    { title: "Direção", body: "Linguagem visual ligada a movimento, alcance e confiança operacional." },
    { title: "Serviços", body: "Apresentação clara das soluções e dos contextos de transporte atendidos." },
    { title: "Cotação", body: "Formulário e chamadas comerciais integrados à navegação principal." },
  ],
  benefits: [
    "Facilita a compreensão dos serviços logísticos.",
    "Reforça confiança e capacidade operacional.",
    "Reduz etapas até o pedido de cotação.",
  ],
  media: [
    { kind: "image", src: "/cases/jr-express/hero.webp", alt: "Abertura do site da JR Express", caption: "Serviço, confiança e cotação apresentados na primeira tela.", width: 1600, height: 900, layout: "wide" },
    { kind: "image", src: "/cases/jr-express/quote.webp", alt: "Formulário de cotação da JR Express", caption: "Coleta direta das informações necessárias para iniciar o atendimento.", width: 1200, height: 1200, layout: "standard" },
    { kind: "image", src: "/cases/jr-express/services.webp", alt: "Seção de serviços de transporte", caption: "Soluções logísticas organizadas para comparação rápida.", width: 1200, height: 1200, layout: "standard" },
  ],
  cta: { label: "Planejar um site", body: "Transforme uma operação complexa em uma jornada digital clara até o contato comercial." },
  seoDescription: "Case do site da JR Express: experiência digital, serviços logísticos e cotação online.",
}
```

- [ ] **Step 2: Add the three video cases**

Use the six exact production video paths:

```ts
[
  "/cases/strong/strong-whey-types.mp4",
  "/cases/strong/gladiator-ultra.mp4",
  "/cases/strong/cinco-sabores.mp4",
  "/cases/together-motion/migracao-privacy-tools.mp4",
  "/cases/ecox-hostel-cabanas/nova-cabana.mp4",
  "/cases/ecox-hostel-cabanas/o-que-voce-encontra.mp4",
]
```

The three records must use:

```ts
credit: {
  name: "Dolomon",
  role: "Design, motion design e edição de vídeo",
}
```

Add the records with these exact editorial fields:

```ts
{
  slug: "strong",
  service: "videos",
  headline: "Produtos de performance transformados em movimento",
  summary: "Três peças verticais que apresentam linhas, sabores e atributos da Strong com ritmo e reconhecimento para redes sociais.",
  context: ["Produtos de suplementação disputam atenção em poucos segundos.", "O trabalho combinou edição e motion para transformar informação de produto em conteúdo rápido e memorável."],
  deliveries: [
    { title: "Sistema visual", body: "Tipografia, cor e produto organizados para leitura imediata." },
    { title: "Ritmo", body: "Cortes e movimentos pensados para o consumo vertical." },
    { title: "Variações", body: "Três narrativas que preservam unidade sem repetir a mesma peça." },
  ],
  benefits: ["Apresenta atributos em poucos segundos.", "Cria consistência entre diferentes produtos.", "Entrega conteúdo adequado ao formato social."],
  media: [
    { kind: "video", src: "/cases/strong/strong-whey-types.mp4", poster: "/cases/strong/strong-whey-types.webp", alt: "Vídeo Strong Whey Types", caption: "Tipos de whey apresentados em uma sequência vertical de produto.", width: 720, height: 1280, layout: "portrait" },
    { kind: "video", src: "/cases/strong/gladiator-ultra.mp4", poster: "/cases/strong/gladiator-ultra.webp", alt: "Vídeo Gladiator Ultra da Strong", caption: "Performance e identidade do Gladiator Ultra em movimento.", width: 720, height: 1280, layout: "portrait" },
    { kind: "video", src: "/cases/strong/cinco-sabores.mp4", poster: "/cases/strong/cinco-sabores.webp", alt: "Vídeo Cinco Sabores Potencial Infinito", caption: "Linha de sabores organizada como uma peça curta e reconhecível.", width: 720, height: 1280, layout: "portrait" },
  ],
  credit: { name: "Dolomon", role: "Design, motion design e edição de vídeo" },
  cta: { label: "Criar conteúdo em vídeo", body: "Transforme atributos, lançamentos e histórias de produto em conteúdo visual com ritmo e clareza." },
  seoDescription: "Case de motion design e edição de vídeos verticais para produtos Strong.",
},
{
  slug: "together-motion",
  service: "videos",
  headline: "Uma migração técnica explicada com clareza visual",
  summary: "Um vídeo horizontal que organiza as etapas da migração para a Privacy Tools em uma narrativa objetiva e alinhada às marcas.",
  context: ["Migrações de dados envolvem etapas técnicas que podem parecer abstratas para o público.", "O motion transformou exportação, tratamento e importação em uma sequência visual compreensível."],
  deliveries: [
    { title: "Roteiro visual", body: "Etapas técnicas convertidas em uma progressão clara." },
    { title: "Motion", body: "Movimentos que orientam a leitura sem competir com a informação." },
    { title: "Marcas", body: "Together e Privacy Tools apresentadas com consistência e hierarquia." },
  ],
  benefits: ["Explica um processo técnico com menos atrito.", "Mantém atenção durante a apresentação das etapas.", "Reforça profissionalismo na comunicação da mudança."],
  media: [
    { kind: "video", src: "/cases/together-motion/migracao-privacy-tools.mp4", poster: "/cases/together-motion/migracao-privacy-tools.webp", alt: "Vídeo sobre migração para a Privacy Tools", caption: "Exportação, tratamento e importação organizados em 44,9 segundos.", width: 1280, height: 720, layout: "landscape" },
  ],
  credit: { name: "Dolomon", role: "Design, motion design e edição de vídeo" },
  cta: { label: "Criar conteúdo em vídeo", body: "Torne processos e serviços técnicos mais fáceis de compreender e apresentar." },
  seoDescription: "Case de motion design da Together para explicar a migração de dados para a Privacy Tools.",
},
{
  slug: "ecox-hostel-cabanas",
  service: "videos",
  headline: "A experiência da cabana antes mesmo da reserva",
  summary: "Dois vídeos verticais que mostram novidade, estrutura e experiência para ajudar o público a imaginar a estadia.",
  context: ["Hospedagem é uma decisão visual: o público precisa entender espaço, atmosfera e o que encontrará.", "A edição reuniu esses sinais em peças curtas, adequadas às redes e próximas da intenção de reserva."],
  deliveries: [
    { title: "Seleção", body: "Momentos e detalhes escolhidos para representar a experiência." },
    { title: "Edição", body: "Ritmo vertical que mantém a leitura confortável." },
    { title: "Conteúdo", body: "Uma peça de novidade e outra de apresentação da estrutura." },
  ],
  benefits: ["Torna a acomodação mais concreta antes da visita.", "Valoriza detalhes que influenciam a escolha.", "Cria conteúdo útil para descoberta e reserva."],
  media: [
    { kind: "video", src: "/cases/ecox-hostel-cabanas/nova-cabana.mp4", poster: "/cases/ecox-hostel-cabanas/nova-cabana.webp", alt: "Vídeo Nova Cabana da ECOX", caption: "Apresentação vertical da nova cabana e de sua atmosfera.", width: 720, height: 1280, layout: "portrait" },
    { kind: "video", src: "/cases/ecox-hostel-cabanas/o-que-voce-encontra.mp4", poster: "/cases/ecox-hostel-cabanas/o-que-voce-encontra.webp", alt: "Vídeo sobre o que existe nas cabanas ECOX", caption: "Estrutura e comodidades apresentadas antes da reserva.", width: 720, height: 1280, layout: "portrait" },
  ],
  credit: { name: "Dolomon", role: "Design, motion design e edição de vídeo" },
  cta: { label: "Criar conteúdo em vídeo", body: "Mostre a experiência do seu espaço com conteúdo que ajuda o público a se imaginar nele." },
  seoDescription: "Case de edição de vídeos verticais para apresentar as cabanas e experiências da ECOX.",
}
```

- [ ] **Step 3: Add the three Google cases**

Use one wide profile capture and one supporting image for each case:

```ts
[
  ["/cases/chapada-backpackers/profile.webp", "/cases/chapada-backpackers/search.webp"],
  ["/cases/contabil-sudoeste/profile.webp", "/cases/contabil-sudoeste/search.webp"],
  ["/cases/posto-ipiranga/profile.webp", "/cases/posto-ipiranga/search.webp"],
]
```

Use these complete content anchors:

```ts
{
  slug: "chapada-backpackers",
  headline: "Encontrada por quem procura viver a Chapada",
  summary: "Perfil estruturado e presença local para facilitar descoberta, avaliação e contato de quem procura hospedagem em Lençóis.",
  benefits: ["Aparece com informações úteis no momento da busca.", "Reúne fotos, localização e contato em um único ponto.", "Reduz incerteza antes da escolha da hospedagem."],
  media: [
    { kind: "image", src: "/cases/chapada-backpackers/profile.webp", alt: "Perfil da Chapada Backpackers no Google", caption: "Perfil com fotos, mapa e informações reais do estabelecimento.", width: 1600, height: 900, layout: "wide" },
    { kind: "image", src: "/cases/chapada-backpackers/search.webp", alt: "Resultado de busca local da Chapada Backpackers", caption: "Presença local conectando intenção de hospedagem e informação prática.", width: 1200, height: 1200, layout: "standard" },
  ],
},
{
  slug: "contabil-sudoeste",
  headline: "Confiança local antes do primeiro atendimento",
  summary: "Perfil empresarial e SEO local para tornar o escritório mais fácil de encontrar e verificar na região.",
  benefits: ["Reforça legitimidade com dados consistentes.", "Facilita localização e contato.", "Aproxima buscas regionais do atendimento contábil."],
  media: [
    { kind: "image", src: "/cases/contabil-sudoeste/profile.webp", alt: "Perfil da Contábil Sudoeste no Google", caption: "Informações do escritório reunidas no painel local.", width: 1600, height: 900, layout: "wide" },
    { kind: "image", src: "/cases/contabil-sudoeste/search.webp", alt: "Resultados locais da Contábil Sudoeste", caption: "Busca regional conectada ao perfil empresarial.", width: 1200, height: 1200, layout: "standard" },
  ],
},
{
  slug: "posto-ipiranga",
  headline: "Informação útil no momento da busca",
  summary: "Perfil local estruturado para apresentar localização, fotos e informações relevantes antes da visita ao posto.",
  benefits: ["Facilita descoberta em buscas de proximidade.", "Ajuda a planejar rota e visita.", "Reúne fotos, produtos e dados do estabelecimento."],
  media: [
    { kind: "image", src: "/cases/posto-ipiranga/profile.webp", alt: "Perfil do Posto Ipiranga no Google", caption: "Painel local com mapa, fotos e informações do posto.", width: 1600, height: 900, layout: "wide" },
    { kind: "image", src: "/cases/posto-ipiranga/search.webp", alt: "Resultado de busca local do Posto Ipiranga", caption: "Presença de proximidade para quem procura abastecimento e serviços.", width: 1200, height: 1200, layout: "standard" },
  ],
}
```

Complete each Google record with these shared delivery values and a client-specific CTA body and description:

```ts
service: "google",
deliveries: [
  { title: "Perfil", body: "Cadastro e estruturação das informações essenciais do estabelecimento." },
  { title: "Conteúdo", body: "Organização de fotos, categoria, localização e formas de contato." },
  { title: "SEO local", body: "Base semântica e geográfica para buscas relacionadas à região e ao serviço." },
],
cta: {
  label: "Fortalecer presença no Google",
  body: "Organize sua presença local para ser encontrado com informações claras no momento da busca.",
},
```

Replace the final `seoDescription` line in each object with:

```ts
// chapada-backpackers
seoDescription: "Case de presença no Google da Chapada Backpackers: Perfil da Empresa e SEO local para hospedagem em Lençóis.",

// contabil-sudoeste
seoDescription: "Case de presença no Google da Contábil Sudoeste: Perfil da Empresa e SEO local para atendimento regional.",

// posto-ipiranga
seoDescription: "Case de presença no Google do Posto Ipiranga: Perfil da Empresa e SEO local para buscas de proximidade.",
```

Do not state that the service created the visible reviews or ratings.

- [ ] **Step 4: Run the content tests**

Run:

```powershell
npm test -- data/case-studies.test.ts
```

Expected: all case completeness, media, credit, and navigation tests pass.

- [ ] **Step 5: Commit the editorial content**

```powershell
git add data/case-studies.ts data/case-studies.test.ts
git commit -m "feat: add service case content"
```

## Task 3: Build the static case route and metadata

**Files:**
- Create: `app/services/[slug]/page.test.tsx`
- Create: `app/services/[slug]/page.tsx`
- Modify: `app/sitemap.ts`
- Modify: `app/metadata.test.ts`

- [ ] **Step 1: Write failing static-route tests**

```ts
import { describe, expect, it } from "vitest";

import { caseStudies } from "@/data/case-studies";
import { generateMetadata, generateStaticParams } from "./page";

describe("service case route", () => {
  it("prebuilds every approved case", () => {
    expect(generateStaticParams()).toEqual(caseStudies.map(({ slug }) => ({ slug })));
  });

  it("creates case-specific metadata", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "strong" }),
    });
    expect(metadata.title).toBe("Strong | Cases | NOIR DIGITAL");
    expect(metadata.description).toContain("motion");
    expect(metadata.openGraph).toMatchObject({
      title: "Strong | Cases | NOIR DIGITAL",
    });
  });
});
```

Extend the sitemap expectation with the nine URLs in `caseStudies` order.

- [ ] **Step 2: Run the route tests and verify failure**

Run:

```powershell
npm test -- "app/services/[slug]/page.test.tsx" app/metadata.test.ts
```

Expected: failure because the dynamic route does not exist and the sitemap only lists `/` and `/services`.

- [ ] **Step 3: Implement the dynamic page**

Use this route structure:

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CaseStudyArticle } from "@/components/services/CaseStudyArticle";
import { SiteHeader } from "@/components/header/SiteHeader";
import { caseStudies, getCaseStudy, getCaseStudyNavigation } from "@/data/case-studies";
import { projects } from "@/data/projects";
import { AudioProvider } from "@/features/audio/AudioProvider";
import { PrincipleSceneProvider } from "@/features/principles/PrincipleSceneProvider";
import { ScrollProvider } from "@/features/scroll/ScrollProvider";
import { ThemeProvider } from "@/features/theme/ThemeProvider";

type CasePageProps = {
  readonly params: Promise<{ readonly slug: string }>;
};

export function generateStaticParams() {
  return caseStudies.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: CasePageProps): Promise<Metadata> {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  const project = projects.find((candidate) => candidate.slug === slug);
  if (!study || !project) return {};
  const title = `${project.client} | Cases | NOIR DIGITAL`;
  return {
    title,
    description: study.seoDescription,
    openGraph: {
      title,
      description: study.seoDescription,
      images: [{ url: project.image, alt: project.imageAlt }],
    },
  };
}

export default async function CasePage({ params }: CasePageProps) {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  const project = projects.find((candidate) => candidate.slug === slug);
  if (!study || !project) notFound();

  return (
    <ThemeProvider>
      <AudioProvider>
        <ScrollProvider>
          <PrincipleSceneProvider>
            <SiteHeader sectionLinksBase="/" />
            <main id="main-content">
              <CaseStudyArticle
                project={project}
                study={study}
                navigation={getCaseStudyNavigation(study.slug)}
              />
            </main>
          </PrincipleSceneProvider>
        </ScrollProvider>
      </AudioProvider>
    </ThemeProvider>
  );
}
```

- [ ] **Step 4: Publish case URLs in the sitemap**

When `NEXT_PUBLIC_SITE_URL` is valid, append:

```ts
...caseStudies.map(({ slug }) => ({
  url: new URL(`/services/${slug}`, siteUrl).toString(),
  changeFrequency: "monthly" as const,
  priority: 0.7,
}))
```

- [ ] **Step 5: Run the route and metadata tests**

Run:

```powershell
npm test -- "app/services/[slug]/page.test.tsx" app/metadata.test.ts
```

Expected: all tests pass.

- [ ] **Step 6: Commit the static route**

```powershell
git add "app/services/[slug]/page.tsx" "app/services/[slug]/page.test.tsx" app/sitemap.ts app/metadata.test.ts
git commit -m "feat: add static service case routes"
```

## Task 4: Implement the editorial case template

**Files:**
- Create: `components/services/CaseStudyArticle.test.tsx`
- Create: `components/services/CaseStudyArticle.tsx`
- Create: `components/services/CaseStudyArticle.module.css`

- [ ] **Step 1: Write failing semantic rendering tests**

Cover one site, one video, and one Google case:

```tsx
const strongProject = projects.find(({ slug }) => slug === "strong");
const strongStudy = getCaseStudy("strong");
if (!strongProject || !strongStudy) throw new Error("Strong case fixture is missing");

render(
  <CaseStudyArticle
    project={strongProject}
    study={strongStudy}
    navigation={getCaseStudyNavigation("strong")}
  />,
);

expect(screen.getByRole("heading", { level: 1, name: strongStudy.headline })).toBeVisible();
expect(screen.getByRole("navigation", { name: "Sumário do case" })).toBeInTheDocument();
expect(document.querySelectorAll("video")).toHaveLength(3);
expect(screen.getByRole("heading", { name: "Dolomon" })).toBeVisible();
expect(screen.getByText("Design, motion design e edição de vídeo")).toBeVisible();
expect(screen.getByRole("link", { name: strongStudy.cta.label })).toHaveAttribute(
  "href",
  "/#contact",
);
```

For `together-site`, assert that no Dolomon heading exists and that every image has its authored alt text. For `chapada-backpackers`, assert that the visible copy does not claim the rating was produced by the service.

- [ ] **Step 2: Run the component test and verify failure**

Run:

```powershell
npm test -- components/services/CaseStudyArticle.test.tsx
```

Expected: failure because `CaseStudyArticle` does not exist.

- [ ] **Step 3: Implement the shared chapter structure**

The rendered order must be:

```tsx
<div className={styles.page}>
  <CaseTableOfContents hasCredit={study.credit !== undefined} />
  <article className={styles.article}>
    <CaseIntro project={project} study={study} />
    <section id="visao-geral">...</section>
    <section id="entrega">...</section>
    <section id="evidencias">...</section>
    <section id="valor">...</section>
    {study.credit ? <section id="creditos">...</section> : null}
    <section id="proximo-passo">...</section>
    <CaseFooter navigation={navigation} />
  </article>
</div>
```

Reuse `useScrollSpy` and `useScroll().scrollToSelector` exactly as the current `ServicesArticle` does. Derive chapter IDs from `hasCredit`, so pages without credit never expose a dead `#creditos` link.

- [ ] **Step 4: Implement accessible image and video evidence**

Images:

```tsx
<figure className={styles.mediaFigure} data-layout={media.layout}>
  <div
    className={styles.mediaFrame}
    style={{ aspectRatio: `${media.width} / ${media.height}` }}
  >
    <Image
      src={media.src}
      alt={media.alt}
      fill
      sizes={media.layout === "wide" ? "(max-width: 767px) 100vw, 1100px" : "(max-width: 767px) 100vw, 520px"}
    />
  </div>
  <figcaption>{media.caption}</figcaption>
</figure>
```

Videos:

```tsx
<figure className={styles.mediaFigure} data-layout={media.layout}>
  <video
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
  <figcaption>{media.caption}</figcaption>
</figure>
```

- [ ] **Step 5: Implement the Dolomon credit block**

Use an intentional monogram until a real portrait is supplied:

```tsx
<div className={styles.credit}>
  <div className={styles.creditPortrait} aria-hidden="true">
    D
  </div>
  <div>
    <p className={styles.creditLabel}>Crédito de produção</p>
    <h2>Dolomon</h2>
    <p>Design, motion design e edição de vídeo</p>
    <p>Editor responsável pelos vídeos apresentados neste case.</p>
  </div>
</div>
```

- [ ] **Step 6: Create responsive styles from the existing skeleton**

Copy the established surface, type, TOC, chapter, footer, focus, and mobile rules from `ServicesArticle.module.css`. Add:

```css
.article {
  width: min(920px, calc(100% - 48px));
}

.mediaGrid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 32px 24px;
}

.mediaFigure[data-layout="wide"],
.mediaFigure[data-layout="landscape"] {
  grid-column: 1 / -1;
}

.mediaFrame,
.mediaFigure video {
  display: block;
  width: 100%;
  overflow: hidden;
  background: var(--surface-elevated);
}

.credit {
  display: grid;
  padding: clamp(24px, 4vw, 48px);
  border-block: 1px solid var(--border-default);
  grid-template-columns: minmax(120px, 220px) 1fr;
  gap: 32px;
}

.creditPortrait {
  display: grid;
  aspect-ratio: 1;
  place-items: center;
  background: var(--text-primary);
  color: var(--surface-primary);
  font-family: var(--font-display);
  font-size: clamp(4rem, 12vw, 8rem);
}

@media (max-width: 767px) {
  .mediaGrid,
  .credit {
    grid-template-columns: 1fr;
  }
}
```

Add the exact interaction guards:

```css
.page {
  overflow: clip;
}

.toc a:focus-visible,
.caseNavigation a:focus-visible,
.cta:focus-visible {
  outline: 2px dotted currentColor;
  outline-offset: 4px;
}

.caseNavigation a,
.cta {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
}

@media (prefers-reduced-motion: reduce) {
  .mediaFigure,
  .cta {
    transition: none;
  }
}
```

- [ ] **Step 7: Run the component tests**

Run:

```powershell
npm test -- components/services/CaseStudyArticle.test.tsx
```

Expected: all semantic, media, credit, CTA, and navigation tests pass.

- [ ] **Step 8: Commit the template**

```powershell
git add components/services/CaseStudyArticle.tsx components/services/CaseStudyArticle.module.css components/services/CaseStudyArticle.test.tsx
git commit -m "feat: build editorial case template"
```

## Task 5: Build optimized case images and videos

**Files:**
- Create: `scripts/build-case-assets.mjs`
- Modify: `package.json`
- Create: `asset-sources/video-projects/strong/source/*.mp4`
- Create: `asset-sources/video-projects/together/source/*.mp4`
- Create: `asset-sources/video-projects/ecox/source/*.mp4`
- Generate: `public/cases/**/*`

- [ ] **Step 1: Copy the six authorized source videos**

Use `Copy-Item -LiteralPath` with the exact source paths already supplied by the user:

```powershell
$sourceRoot = 'C:\Users\Carlos\Downloads\Videos Dola ( Portifolio )-20260728T183432Z-1-001\Videos Dola ( Portifolio )'
Copy-Item -LiteralPath (Join-Path $sourceRoot 'STRONG WHEY TYPES - Video 2.mp4') -Destination 'asset-sources/video-projects/strong/source/strong-whey-types.mp4'
Copy-Item -LiteralPath (Join-Path $sourceRoot 'Novo Video - Gladiator Ultra ( Strong )1.mp4') -Destination 'asset-sources/video-projects/strong/source/gladiator-ultra.mp4'
Copy-Item -LiteralPath (Join-Path $sourceRoot '5 Sabores Potencial Infinito ( Animação video ).mp4') -Destination 'asset-sources/video-projects/strong/source/cinco-sabores.mp4'
Copy-Item -LiteralPath (Join-Path $sourceRoot 'Migração - Privacy Tools ( Motion Video ) 3.mp4') -Destination 'asset-sources/video-projects/together/source/migracao-privacy-tools.mp4'
Copy-Item -LiteralPath (Join-Path $sourceRoot 'Video ECOXHOSTELCABANAS - Nova Cabana.mp4') -Destination 'asset-sources/video-projects/ecox/source/nova-cabana.mp4'
Copy-Item -LiteralPath (Join-Path $sourceRoot 'Video ECOXHOSTELCABANAS - O QUE VOCÊ ENCONTRA NAS CABANAS.mp4') -Destination 'asset-sources/video-projects/ecox/source/o-que-voce-encontra.mp4'
```

Create the three destination directories with `New-Item -ItemType Directory -Force` before copying.

- [ ] **Step 2: Implement the deterministic image manifest**

Map the existing authoring sources to the public destinations defined in Task 2. Use Sharp with `.rotate()`, `fit: "cover"` only for authored landscape/card images, `fit: "inside"` for full-page captures, WebP quality 88, effort 6, and stable dimensions.

The manifest must include:

- three images for each site case;
- two images for each Google case;
- one poster for each of the six videos.

- [ ] **Step 3: Implement the video transcoder**

Use `node:child_process` `spawn` and fail on non-zero exit. Resolve FFmpeg from `process.env.FFMPEG_PATH ?? "ffmpeg"`. Use these arguments:

```js
const commonArgs = [
  "-c:v", "libx264",
  "-preset", "slow",
  "-crf", "24",
  "-pix_fmt", "yuv420p",
  "-c:a", "aac",
  "-b:a", "128k",
  "-movflags", "+faststart",
];
```

For portrait videos use `-vf scale=720:1280:force_original_aspect_ratio=decrease,pad=720:1280:(ow-iw)/2:(oh-ih)/2:black`. For Together use `-vf scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2:black`.

- [ ] **Step 4: Register the asset command**

Add:

```json
"assets:cases": "node scripts/build-case-assets.mjs"
```

- [ ] **Step 5: Generate and inspect the production assets**

Run:

```powershell
$env:FFMPEG_PATH = 'C:\ffmpeg\bin\ffmpeg.exe'
npm run assets:cases
```

Expected: twenty-one WebP images and six MP4 videos are written under `public/cases`; every output is non-empty.

Use `ffprobe` to confirm:

- Together: 1280×720;
- five vertical videos: 720×1280;
- H.264 video;
- AAC audio where the source contains audio;
- duration within 0.2 seconds of the source.

- [ ] **Step 6: Add asset existence checks**

Extend `data/case-studies.test.ts` with:

```ts
import { stat } from "node:fs/promises";
import path from "node:path";

it("ships every authored case asset as a non-empty public file", async () => {
  const paths = caseStudies.flatMap((study) =>
    study.media.flatMap((media) =>
      media.kind === "video" ? [media.src, media.poster] : [media.src],
    ),
  );

  for (const publicPath of paths) {
    const asset = await stat(path.join(process.cwd(), "public", publicPath.slice(1)));
    expect(asset.isFile()).toBe(true);
    expect(asset.size).toBeGreaterThan(0);
  }
});
```

- [ ] **Step 7: Run asset and content checks**

Run:

```powershell
npm test -- data/case-studies.test.ts
npx biome check scripts/build-case-assets.mjs package.json
```

Expected: all checks pass.

- [ ] **Step 8: Commit the pipeline and production assets**

```powershell
git add scripts/build-case-assets.mjs package.json package-lock.json public/cases
git commit -m "feat: publish optimized case media"
```

Keep the large authoring MP4 files in `asset-sources` outside the runtime and outside this commit. They remain local source material; only the optimized public versions are published.

## Task 6: Wire cards and preserve interaction behavior

**Files:**
- Modify: `components/work/SelectedWork.test.tsx`
- Test: `components/work/ProjectCard.tsx`
- Test: `data/projects.ts`

- [ ] **Step 1: Update the card destination test**

Replace the shared `/services` expectation with:

```ts
for (const project of projects) {
  const card = screen.getByTestId(`project-${project.slug}`);
  const link = within(card).getByRole("link");
  expect(link).toHaveAttribute("href", `/services/${project.slug}`);
  expect(link).not.toHaveAttribute("target");
  expect(link).not.toHaveAttribute("rel");
}
```

- [ ] **Step 2: Run the SelectedWork test**

Run:

```powershell
npm test -- components/work/SelectedWork.test.tsx
```

Expected: pass after the Task 1 project destinations are present. No `ProjectCard` motion, hover, canvas, or sizing code should change.

- [ ] **Step 3: Commit the card integration**

```powershell
git add components/work/SelectedWork.test.tsx
git commit -m "test: verify individual case navigation"
```

## Task 7: Add end-to-end route and responsive coverage

**Files:**
- Create: `tests/interaction/case-pages.spec.ts`

- [ ] **Step 1: Write the browser flow**

```ts
import { expect, test } from "@playwright/test";

const cases = [
  ["together-site", "Privacidade e tecnologia com uma presença digital à altura"],
  ["madeireira-fortaleza", "Madeira, catálogo e orçamento em uma jornada direta"],
  ["jr-express", "Uma rota digital mais curta até a cotação"],
  ["strong", "Produtos de performance transformados em movimento"],
  ["together-motion", "Uma migração técnica explicada com clareza visual"],
  ["ecox-hostel-cabanas", "A experiência da cabana antes mesmo da reserva"],
  ["chapada-backpackers", "Encontrada por quem procura viver a Chapada"],
  ["contabil-sudoeste", "Confiança local antes do primeiro atendimento"],
  ["posto-ipiranga", "Informação útil no momento da busca"],
] as const;

for (const [slug, heading] of cases) {
  test(`${slug} opens its individual case`, async ({ page }) => {
    await page.goto("/");
    await page.getByTestId(`project-${slug}`).getByRole("link").click();
    await expect(page).toHaveURL(new RegExp(`/services/${slug}$`));
    await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
  });
}

test("video cases expose Dolomon credit and controllable players", async ({ page }) => {
  await page.goto("/services/strong");
  await expect(page.getByRole("heading", { name: "Dolomon" })).toBeVisible();
  await expect(page.locator("video")).toHaveCount(3);
  await expect(page.locator("video").first()).toHaveAttribute("controls", "");
});

test("site cases do not expose video credits", async ({ page }) => {
  await page.goto("/services/together-site");
  await expect(page.getByRole("heading", { name: "Dolomon" })).toHaveCount(0);
});
```

- [ ] **Step 2: Add mobile containment and reduced-motion checks**

Add:

```ts
test("mobile case content stays inside the viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/services/strong");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: "Criar conteúdo em vídeo" })).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth === window.innerWidth),
  ).toBe(true);
});

test("reduced motion keeps all authored content visible", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/services/chapada-backpackers");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("figure")).toHaveCount(2);
  await expect(page.getByRole("link", { name: "Fortalecer presença no Google" })).toBeVisible();
});
```

- [ ] **Step 3: Run the interaction suite**

Run:

```powershell
npm run test:e2e -- tests/interaction/case-pages.spec.ts
```

Expected: all case routes, video credit, mobile containment, and reduced-motion checks pass.

- [ ] **Step 4: Commit the browser coverage**

```powershell
git add tests/interaction/case-pages.spec.ts
git commit -m "test: cover service case journeys"
```

## Task 8: Final integration and visual verification

**Files:**
- Verify all files changed by Tasks 1–7.

- [ ] **Step 1: Run formatting and static checks**

```powershell
npm run check
npm run typecheck
```

Expected: both commands exit 0.

- [ ] **Step 2: Run the complete test suite**

```powershell
npm test
```

Expected: all Vitest files and tests pass with no unhandled errors.

- [ ] **Step 3: Build production output**

```powershell
npm run build
```

Expected: Next.js compiles, typechecks, and statically generates `/services` plus all nine `/services/[slug]` routes.

- [ ] **Step 4: Inspect generated HTML**

Check `.next/server/app/services/<slug>.html` or the corresponding static output for:

- authored `h1`, summary, evidence captions, CTA, and metadata;
- Dolomon present only in Strong, Together Motion, and ECOX;
- no authoring paths from `asset-sources`;
- no references to original high-bitrate videos.

- [ ] **Step 5: Perform visual browser verification**

Inspect desktop 1440×1000 and mobile 390×844 for:

- `together-site`;
- `strong`;
- `chapada-backpackers`.

Verify first viewport hierarchy, TOC state, image crop, vertical and horizontal video proportions, credit block, CTA, focus visibility, no overlaps, no text clipping, and no horizontal overflow. Then open the remaining six routes and confirm their unique content and media load.

- [ ] **Step 6: Confirm performance-sensitive behavior**

Use the browser network panel or performance entries to confirm:

- only the hero image is eager;
- videos load metadata but do not autoplay;
- below-fold images lazy-load;
- no new canvas or continuous animation appears on case pages;
- card hover and scroll effects on the home remain unchanged.

- [ ] **Step 7: Review the final diff**

Confirm no unrelated dirty work was staged or reverted. Ensure every changed file maps to the approved design specification.

- [ ] **Step 8: Create the integration commit**

```powershell
git add "app/services/[slug]/page.tsx" "app/services/[slug]/page.test.tsx" app/sitemap.ts app/metadata.test.ts
git add components/services/CaseStudyArticle.tsx components/services/CaseStudyArticle.module.css components/services/CaseStudyArticle.test.tsx components/work/SelectedWork.test.tsx
git add data/case-studies.ts data/case-studies.test.ts data/projects.ts data/projects.test.ts
git add scripts/build-case-assets.mjs tests/interaction/case-pages.spec.ts public/cases package.json package-lock.json
git commit -m "feat: deliver individual service case pages"
```
