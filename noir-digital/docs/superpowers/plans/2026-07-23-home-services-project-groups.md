# Home Services Project Groups Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganize the existing home services project rail into four service-led groups, each with a compact heading, one full-width featured project, and supporting real-project slots.

**Architecture:** Extend the typed project table with a primary service, client, and delivery labels, then derive ordered service groups from that single source of truth. `SelectedWork` renders semantic service sections inside the existing right rail; `ProjectCard` remains responsible for media, hover behavior, and metadata. CSS changes only the document-flow grid, preserving the current sticky statement and shared WebGL card canvas.

**Tech Stack:** Next.js 16, React 19, TypeScript 5.9, CSS Modules, Vitest, Testing Library, Playwright

---

## Execution Directory

Run all npm, Vitest, typecheck, build, and Playwright commands from:

```text
C:\Users\Carlos\Documents\site\noir-digital
```

Because the Git root is the parent directory, the commit examples use
`git -C ..` and paths prefixed with `noir-digital/`.

## File Structure

- Modify `data/projects.ts`: own service identifiers, service descriptors, project metadata, and deterministic grouping.
- Modify `data/projects.test.ts`: verify service order, complete membership, uniqueness, and the temporary content contract.
- Modify `components/work/SelectedWork.tsx`: render one semantic group per service.
- Modify `components/work/SelectedWork.module.css`: implement desktop and mobile group grids.
- Modify `components/work/ProjectCard.tsx`: expose featured state, render client/delivery metadata, and correct mobile image sizing.
- Modify `components/work/SelectedWork.test.tsx`: verify semantic hierarchy, featured cards, metadata, and responsive CSS contracts.
- Verify `tests/visual/home.visual.spec.ts`: reuse the existing home visual coverage; update snapshots only after manual comparison confirms the intended change.

### Task 1: Add the typed service-group data contract

**Files:**
- Modify: `noir-digital/data/projects.ts`
- Modify: `noir-digital/data/projects.test.ts`

- [ ] **Step 1: Replace the exact-record test with service-aware assertions that initially fail**

Add these imports and tests to `data/projects.test.ts`, while keeping the existing asset, route, and unique-slug tests:

```ts
import {
  groupProjectsByService,
  projects,
  reservedWorkAssets,
  serviceGroups,
} from "@/data/projects";

it("publishes the four services in the approved order", () => {
  expect(serviceGroups).toEqual([
    { id: "sites", index: "01", title: "Sites" },
    { id: "videos", index: "02", title: "Vídeos" },
    { id: "google", index: "03", title: "Presença no Google" },
    { id: "social", index: "04", title: "Redes sociais" },
  ]);
});

it("places every visible project in exactly one non-empty service group", () => {
  const grouped = groupProjectsByService(projects);
  const groupedSlugs = grouped.flatMap((group) => group.projects.map((project) => project.slug));

  expect(grouped.map((group) => group.projects.length)).toEqual([3, 2, 2, 3]);
  expect(groupedSlugs).toHaveLength(projects.length);
  expect(new Set(groupedSlugs).size).toBe(projects.length);
  expect(groupedSlugs.toSorted()).toEqual(projects.map((project) => project.slug).toSorted());
});

it("gives every project client and delivery metadata", () => {
  for (const project of projects) {
    expect(project.client.trim()).not.toBe("");
    expect(project.deliveryLabels.length).toBeGreaterThan(0);
    expect(project.deliveryLabels.every((label) => label.trim() !== "")).toBe(true);
  }
});
```

Delete the test named `"preserves the ten visible project records in source order"` because it duplicates the table implementation and would make final content replacement unnecessarily brittle.

- [ ] **Step 2: Run the focused data test to verify the new contract fails**

Run:

```powershell
npm test -- data/projects.test.ts
```

Expected: FAIL because `serviceGroups`, `groupProjectsByService`, `client`, `primaryService`, and `deliveryLabels` do not exist yet.

- [ ] **Step 3: Add service descriptors and project metadata**

At the top of `data/projects.ts`, replace the old project type declarations with:

```ts
export type ProjectKind = "Coding Project" | "Project" | "Event";
export type ServiceId = "sites" | "videos" | "google" | "social";

export interface Project {
  readonly slug: string;
  readonly title: string;
  readonly client: string;
  readonly year: string;
  readonly kind: ProjectKind;
  readonly primaryService: ServiceId;
  readonly deliveryLabels: readonly string[];
  readonly href: "/services";
  readonly image: `/work/${string}.png`;
  readonly hoverImage: `/work/${string}.png`;
  readonly imageAlt: string;
}

export const serviceGroups = [
  { id: "sites", index: "01", title: "Sites" },
  { id: "videos", index: "02", title: "Vídeos" },
  { id: "google", index: "03", title: "Presença no Google" },
  { id: "social", index: "04", title: "Redes sociais" },
] as const satisfies readonly {
  readonly id: ServiceId;
  readonly index: string;
  readonly title: string;
}[];
```

Add the following fields to the existing ten project records without changing their slugs, routes, or asset paths:

```ts
// reunimos
client: "Reunimos",
primaryService: "sites",
deliveryLabels: ["Site", "Sistema"],

// inspire-mono
client: "Inspire Mono",
primaryService: "sites",
deliveryLabels: ["Site", "Identidade"],

// wasm-design-utils
client: "Wasm design utils",
primaryService: "sites",
deliveryLabels: ["Site", "Tecnologia"],

// vectorsymbols
client: "VectorSymbols",
primaryService: "videos",
deliveryLabels: ["Vídeo", "Motion"],

// darkside
client: "DarkSide",
primaryService: "videos",
deliveryLabels: ["Vídeo", "Conteúdo"],

// adrive
client: "aDrive",
primaryService: "google",
deliveryLabels: ["Google", "Presença digital"],

// shore-icon
client: "Shore Icon",
primaryService: "google",
deliveryLabels: ["Google", "Conteúdo local"],

// teambition
client: "Teambition",
primaryService: "social",
deliveryLabels: ["Redes sociais", "Conteúdo"],

// fof-see-hear-touch
client: "FoF",
primaryService: "social",
deliveryLabels: ["Redes sociais", "Campanha"],

// fof-design-system
client: "FoF",
primaryService: "social",
deliveryLabels: ["Redes sociais", "Design system"],
```

After the `projects` table, add the deterministic grouping function:

```ts
export function groupProjectsByService(source: readonly Project[] = projects) {
  return serviceGroups.map((service) => ({
    ...service,
    projects: source.filter((project) => project.primaryService === service.id),
  }));
}
```

The assignments above are temporary layout content. Replacing them with the user's real projects later changes only `data/projects.ts`.

- [ ] **Step 4: Run the data tests and typecheck**

Run:

```powershell
npm test -- data/projects.test.ts
npm run typecheck
```

Expected: all `data/projects.test.ts` tests PASS and TypeScript reports no errors.

- [ ] **Step 5: Commit the data contract**

```powershell
git -C .. add noir-digital/data/projects.ts noir-digital/data/projects.test.ts
git -C .. commit -m "feat: group projects by service"
```

### Task 2: Render semantic service groups and updated project metadata

**Files:**
- Modify: `noir-digital/components/work/SelectedWork.tsx`
- Modify: `noir-digital/components/work/ProjectCard.tsx`
- Modify: `noir-digital/components/work/SelectedWork.test.tsx`

- [ ] **Step 1: Add failing component tests for headings, group membership, and featured cards**

In `SelectedWork.test.tsx`, update the project import and add the following tests:

```ts
import { groupProjectsByService, projects, serviceGroups } from "@/data/projects";

it("renders one ordered semantic heading for every service group", () => {
  render(<SelectedWork />);

  expect(
    screen.getAllByRole("heading", { level: 3 }).map((heading) => heading.textContent),
  ).toEqual(serviceGroups.map((service) => service.title));
});

it("renders every project once inside its primary service", () => {
  render(<SelectedWork />);

  for (const group of groupProjectsByService()) {
    const region = screen.getByRole("region", { name: group.title });
    expect(
      within(region).getAllByTestId(/^project-/).map((card) =>
        card.getAttribute("data-testid")?.replace("project-", ""),
      ),
    ).toEqual(group.projects.map((project) => project.slug));
  }
});

it("features only the first project in every service group", () => {
  render(<SelectedWork />);

  for (const group of groupProjectsByService()) {
    const region = screen.getByRole("region", { name: group.title });
    const cards = within(region).getAllByTestId(/^project-/);

    expect(cards[0]).toHaveAttribute("data-project-featured", "true");
    for (const card of cards.slice(1)) {
      expect(card).toHaveAttribute("data-project-featured", "false");
    }
  }
});

it("renders client and delivery labels without relying on hover", () => {
  render(<SelectedWork />);

  for (const project of projects) {
    const card = screen.getByTestId(`project-${project.slug}`);
    expect(card).toHaveTextContent(project.client);
    for (const label of project.deliveryLabels) {
      expect(card).toHaveTextContent(label);
    }
  }
});
```

Replace the old exact-order test with the group-membership test above.

- [ ] **Step 2: Run the focused component test to verify failure**

Run:

```powershell
npm test -- components/work/SelectedWork.test.tsx
```

Expected: FAIL because no level-three service headings, service regions, or featured-state attributes are rendered.

- [ ] **Step 3: Render the service groups in `SelectedWork.tsx`**

Replace the direct `projects.map` block with:

```tsx
import { groupProjectsByService } from "@/data/projects";

export function SelectedWork() {
  const groupedProjects = groupProjectsByService();

  return (
    <section id="selected-work" className={styles["selectedWork"]} aria-labelledby="work-heading">
      <WorkCardCanvas className={styles["workCardCanvas"]} />
      <ServiceStatement />

      <WorkCardAnimationProvider>
        <div className={styles["projectGrid"]}>
          {groupedProjects.map((group) => {
            const headingId = `service-${group.id}-heading`;

            return (
              <section
                key={group.id}
                className={styles["serviceGroup"]}
                aria-labelledby={headingId}
                data-service-group={group.id}
              >
                <header className={styles["serviceHeading"]}>
                  <span aria-hidden="true">{group.index}</span>
                  <h3 id={headingId}>{group.title}</h3>
                </header>

                {group.projects.map((project, index) => (
                  <ProjectCard key={project.slug} project={project} featured={index === 0} />
                ))}
              </section>
            );
          })}
        </div>
      </WorkCardAnimationProvider>
    </section>
  );
}
```

- [ ] **Step 4: Expose featured state and render the approved metadata in `ProjectCard.tsx`**

Change the non-featured `sizes` value so every mobile card receives a full-width source:

```ts
const sizes = featured
  ? "(max-width: 767px) calc(100vw - 32px), calc(66.7vw - 75px)"
  : "(max-width: 767px) calc(100vw - 32px), calc(33.3vw - 49px)";
```

Add the state attribute to the article:

```tsx
<article
  className={cardClassName}
  data-testid={`project-${project.slug}`}
  data-project-featured={featured ? "true" : "false"}
>
```

Replace the third metadata line:

```tsx
<span>{[project.client, ...project.deliveryLabels].join(" / ")}</span>
```

- [ ] **Step 5: Run the focused component tests**

Run:

```powershell
npm test -- components/work/SelectedWork.test.tsx
```

Expected: all `SelectedWork` and `TrustStrip` tests in the file PASS.

- [ ] **Step 6: Commit the grouped rendering**

```powershell
git -C .. add noir-digital/components/work/SelectedWork.tsx noir-digital/components/work/ProjectCard.tsx noir-digital/components/work/SelectedWork.test.tsx
git -C .. commit -m "feat: render service-led project groups"
```

### Task 3: Implement the desktop and mobile editorial grid

**Files:**
- Modify: `noir-digital/components/work/SelectedWork.module.css`
- Modify: `noir-digital/components/work/SelectedWork.test.tsx`

- [ ] **Step 1: Add failing CSS contract assertions**

Add this test to `SelectedWork.test.tsx`:

```ts
it("uses the approved service-group grid at desktop and mobile", () => {
  const css = readFileSync(
    join(process.cwd(), "components/work/SelectedWork.module.css"),
    "utf8",
  );

  expect(css).toMatch(
    /\.serviceGroup\s*\{[^}]*grid-template-columns:\s*repeat\(8,\s*minmax\(0,\s*1fr\)\)/,
  );
  expect(css).toMatch(/\.serviceHeading\s*\{[^}]*grid-column:\s*1\s*\/\s*span\s*4/);
  expect(css).toMatch(/\.featuredCard\s*\{[^}]*grid-column:\s*1\s*\/\s*-1/);
  expect(css).toMatch(
    /@media \(max-width:\s*767px\)[\s\S]*\.serviceGroup\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/,
  );
  expect(css).toMatch(
    /@media \(max-width:\s*767px\)[\s\S]*\.projectCard\s*\{[^}]*grid-column:\s*1\s*\/\s*-1/,
  );
});
```

- [ ] **Step 2: Run the test to verify the layout contract fails**

Run:

```powershell
npm test -- components/work/SelectedWork.test.tsx
```

Expected: FAIL because `.serviceGroup` and `.serviceHeading` do not exist and mobile cards still span one of two columns.

- [ ] **Step 3: Replace the flat card-grid rules with grouped-grid rules**

Keep `.projectGrid` in columns 5–12 but change its internal responsibility:

```css
.projectGrid {
  position: relative;
  z-index: 2;
  display: grid;
  grid-column: 5 / -1;
  grid-row: 1;
  gap: clamp(160px, 14vw, 240px);
  align-items: start;
}

.serviceGroup {
  display: grid;
  grid-template-columns: repeat(8, minmax(0, 1fr));
  gap: 96px var(--grid-gutter);
  align-items: start;
  min-width: 0;
}

.serviceHeading {
  display: grid;
  grid-column: 1 / span 4;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 12px;
  align-items: baseline;
  color: var(--text-secondary);
  font-family: var(--font-pixel);
  text-transform: uppercase;
}

.serviceHeading span {
  font-size: 0.5625rem;
  line-height: 1;
  letter-spacing: 0.04em;
}

.serviceHeading h3 {
  margin: 0;
  color: var(--text-primary);
  font-family: var(--font-interface);
  font-size: clamp(1rem, 1.35vw, 1.25rem);
  font-weight: 650;
  line-height: 1;
  letter-spacing: -0.025em;
}

.projectCard {
  grid-column: span 4;
  min-width: 0;
}

.featuredCard {
  grid-column: 1 / -1;
}

.serviceGroup .projectCard:nth-of-type(2n + 3):not(.featuredCard) {
  margin-top: 120px;
}
```

Delete the old flat-grid `grid-template-columns` and `.projectCard:nth-child(2n + 3)` rule. The first service heading naturally begins at the top of the project rail, matching the left eyebrow's section-start baseline.

- [ ] **Step 4: Make every project full width on narrow mobile**

Inside `@media (max-width: 767px)`, replace the current two-column project rules with:

```css
.projectGrid {
  grid-column: 1 / -1;
  grid-row: 2;
  gap: 104px;
}

.serviceGroup {
  grid-template-columns: minmax(0, 1fr);
  gap: 32px;
}

.serviceHeading,
.projectCard,
.featuredCard,
.serviceGroup .projectCard:nth-of-type(2n + 3):not(.featuredCard) {
  grid-column: 1 / -1;
  margin-top: 0;
}

.serviceHeading {
  padding-bottom: 8px;
}
```

- [ ] **Step 5: Run focused tests and formatting checks**

Run:

```powershell
npm test -- components/work/SelectedWork.test.tsx data/projects.test.ts
npm run check
npm run typecheck
```

Expected: tests PASS; Biome and TypeScript report no errors introduced by the changed files.

- [ ] **Step 6: Commit the responsive grid**

```powershell
git -C .. add noir-digital/components/work/SelectedWork.module.css noir-digital/components/work/SelectedWork.test.tsx
git -C .. commit -m "style: add editorial service project rhythm"
```

### Task 4: Verify rendering, interaction, and performance-sensitive behavior

**Files:**
- Verify: `noir-digital/tests/visual/home.visual.spec.ts`
- Update only if approved: `noir-digital/tests/visual/home.visual.spec.ts-snapshots/*-work-chromium-win32.png`

- [ ] **Step 1: Run the complete unit suite**

Run:

```powershell
npm test
```

Expected: all Vitest suites PASS.

- [ ] **Step 2: Produce a clean production build**

Run:

```powershell
npm run build
```

Expected: Next.js production build completes without type, route, or prerender errors.

- [ ] **Step 3: Inspect the work section at four relevant widths**

Run the production server and inspect `/#selected-work` at:

- 390 × 844
- 768 × 1024
- 1280 × 720
- 1440 × 900

Verify:

- `01 / SITES` begins on the same optical baseline as the left `SERVIÇOS` eyebrow at desktop.
- The left statement remains pinned only at desktop.
- Each group has one full-width first project.
- Supporting cards are two columns at desktop and one column at 390 px.
- Cards have no horizontal overflow or clipped metadata.
- Hover reveal still runs for mouse users.
- Keyboard focus remains visible.
- Light and dark themes retain readable headings and metadata.
- Reduced motion does not introduce hidden or incomplete content.

- [ ] **Step 4: Run the existing home visual spec**

Run:

```powershell
npx playwright test tests/visual/home.visual.spec.ts --config=playwright.visual.config.ts
```

Expected: the test reports intentional work-section snapshot differences only. Review those images manually; update snapshots only after confirming the new group layout and all unaffected sections remain stable.

- [ ] **Step 5: Commit approved visual baselines only when they changed**

```powershell
git -C .. add noir-digital/tests/visual/home.visual.spec.ts-snapshots
git -C .. commit -m "test: approve grouped service visuals"
```

If no snapshots require updating, skip this commit.
