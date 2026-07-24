# Home Services Project Groups — Design Specification

## Objective

Reorganize the existing home-page services section so visitors navigate by the
kind of service they need while still seeing real work as evidence. The current
left-side service statement, card styling, hover treatment, global grid, and
WebGL atmosphere remain intact.

The section must answer, in this order:

1. What services does NOIR DIGITAL provide?
2. What does each service look like in practice?
3. Which real projects demonstrate that capability?

## Scope

The right-hand project rail will be divided into four ordered service groups:

1. `Sites`
2. `Vídeos`
3. `Presença no Google`
4. `Redes sociais`

The previously discussed AI area is explicitly outside this change and remains
postponed.

## Content Model

Each project has one primary service used for placement and may have additional
delivery labels used only as metadata.

```ts
type ServiceId = "sites" | "videos" | "google" | "social";

type ServiceGroup = {
  id: ServiceId;
  index: "01" | "02" | "03" | "04";
  title: string;
  projects: readonly Project[];
};

type Project = {
  primaryService: ServiceId;
  deliveryLabels: readonly string[];
  client: string;
  title: string;
  year: string;
  image: string;
  hoverImage: string;
  imageAlt: string;
  href: "/services";
};
```

A project is rendered only once, under its primary service. Cross-disciplinary
work is communicated through `deliveryLabels`, preventing duplicate cards while
still showing the breadth of the engagement.

The implementation must not invent client results or performance numbers.
Existing imagery may be used temporarily to validate the grouped layout until
the final real-project media inventory is supplied, but temporary content stays
isolated in the data file for direct replacement.

## Desktop Composition

The section keeps its current 12-column layout:

- Columns 1–4: the existing sticky statement, unchanged.
- Columns 5–12: the grouped project rail.

Each service group follows the same rhythm:

1. A compact service heading such as `01 / SITES`.
2. One featured project spanning the full eight-column project rail.
3. Remaining projects presented as two four-column cards per row.

The service heading occupies the width of one regular card rather than spanning
the project rail. The first `SITES` heading begins at the same vertical baseline
as the `SERVIÇOS` eyebrow in the left statement. Subsequent headings use generous
top spacing to clearly close the preceding service before opening the next.

The headings are normal document-flow content, not sticky or dynamically
replaced. The left statement remains the only pinned element.

## Project Card Metadata

The visual card behavior stays unchanged. Under each image, the metadata order
becomes:

1. Project or client-facing title
2. Year
3. Client name and delivery labels

Example:

```text
Site institucional                     2026
ELITE ENGENHARIA / SITE / GOOGLE
```

The existing image hover and WebGL card treatment are preserved. No new canvas,
shader, continuous animation, filter control, tabs, or carousel is added.

## Mobile Composition

Below 768 px:

- The service statement remains above the project rail.
- Each service heading spans the full available width.
- The featured project spans the full width.
- Supporting projects also use one column to protect media scale and metadata
  readability.
- Service groups preserve the desktop order.

The mobile layout uses normal page scrolling and does not pin service headings.

## Accessibility and Motion

- Service group titles use semantic headings beneath the section's existing
  `h2`.
- Project links retain visible keyboard focus.
- Image alternative text describes the actual work shown.
- The layout does not depend on hover to reveal a project's category or client.
- Existing reduced-motion behavior remains authoritative.

## Performance Constraints

- Reuse the current card canvas and animation controller.
- Do not add another WebGL scene or per-group render loop.
- Preserve stable image dimensions to avoid layout shift.
- Grouping and headings are plain React and CSS.

## Validation

The implementation is complete when:

- The four service headings render in the specified order.
- Every project appears in exactly one service group.
- The first project in every non-empty group is full width on desktop.
- Remaining desktop projects use two columns.
- All project cards use one column on narrow mobile.
- The first service heading aligns optically with the left `SERVIÇOS` eyebrow.
- Existing hover, focus, theme, and reduced-motion behavior still works.
- The home page has no horizontal overflow at 390, 768, 1280, and 1440 px.

## Out of Scope

- A dedicated project-detail route
- Service filters or tabs
- A service carousel
- New AI services
- Fabricated testimonials, metrics, or outcomes
- Changes to the hero, principles story, trust strip, or contact footer
