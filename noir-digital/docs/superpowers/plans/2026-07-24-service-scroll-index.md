# Service Scroll Index Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar um índice desktop orientado pelo scroll à seção de serviços da home e migrar o sumário da página de projeto para o mesmo rastreamento leve.

**Architecture:** Um hook genérico `useScrollSpy` encapsula `IntersectionObserver`, fallback e cleanup. `ServiceStatement` e `ServicesArticle` fornecem somente listas estáveis de IDs e preservam seus próprios visuais e comportamentos de clique.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS Modules, Testing Library, Vitest, Playwright CLI, Lenis via `ScrollProvider`.

---

## File map

- Create: `features/scroll/use-scroll-spy.ts` — estado ativo compartilhado e lifecycle do observer.
- Create: `features/scroll/use-scroll-spy.test.tsx` — contrato unitário do hook.
- Modify: `components/services/ServicesArticle.tsx:1-112` — trocar o listener manual pelo hook.
- Modify: `components/services/ServicesArticle.test.tsx:1-91` — validar integração sem depender de geometria.
- Modify: `components/work/ServiceStatement.tsx:1-87` — renderizar e controlar o índice da home.
- Modify: `components/work/SelectedWork.tsx:22-42` — fornecer IDs reais aos grupos.
- Modify: `components/work/SelectedWork.module.css:31-114, 270-340` — aparência, foco, breakpoint e scroll margin.
- Modify: `components/work/SelectedWork.test.tsx:1-207` — ordem, estado ativo, clique e responsividade.

### Task 1: Shared IntersectionObserver scroll spy

**Files:**
- Create: `features/scroll/use-scroll-spy.test.tsx`
- Create: `features/scroll/use-scroll-spy.ts`

- [ ] **Step 1: Write the failing public-behavior tests**

```tsx
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useScrollSpy } from "@/features/scroll/use-scroll-spy";

class TestIntersectionObserver implements IntersectionObserver {
  static current: TestIntersectionObserver | null = null;
  readonly root = null;
  readonly rootMargin: string;
  readonly thresholds = [0];
  readonly disconnect = vi.fn();
  readonly observe = vi.fn();
  readonly takeRecords = vi.fn(() => []);
  readonly unobserve = vi.fn();

  constructor(
    readonly callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit,
  ) {
    this.rootMargin = options?.rootMargin ?? "0px";
    TestIntersectionObserver.current = this;
  }

  emit(items: readonly { id: string; isIntersecting: boolean }[]) {
    this.callback(
      items.map(({ id, isIntersecting }) => ({
        boundingClientRect: {} as DOMRectReadOnly,
        intersectionRatio: isIntersecting ? 1 : 0,
        intersectionRect: {} as DOMRectReadOnly,
        isIntersecting,
        rootBounds: null,
        target: document.getElementById(id) as Element,
        time: 0,
      })),
      this,
    );
  }
}

const ids = ["sites", "videos", "google", "social"] as const;

beforeEach(() => {
  document.body.innerHTML = ids.map((id) => `<section id="${id}"></section>`).join("");
  vi.stubGlobal("IntersectionObserver", TestIntersectionObserver);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
  TestIntersectionObserver.current = null;
});

describe("useScrollSpy", () => {
  it("starts with the requested id and observes every existing target", () => {
    const { result } = renderHook(() => useScrollSpy({ ids, initialId: "sites" }));

    expect(result.current).toBe("sites");
    expect(TestIntersectionObserver.current?.rootMargin).toBe("-18% 0px -72% 0px");
    expect(TestIntersectionObserver.current?.observe).toHaveBeenCalledTimes(4);
  });

  it("selects the last intersecting id in document order", () => {
    const { result } = renderHook(() => useScrollSpy({ ids, initialId: "sites" }));

    act(() => {
      TestIntersectionObserver.current?.emit([
        { id: "videos", isIntersecting: true },
        { id: "google", isIntersecting: true },
      ]);
    });

    expect(result.current).toBe("google");
  });

  it("disconnects on cleanup and falls back without IntersectionObserver", () => {
    const { unmount } = renderHook(() => useScrollSpy({ ids, initialId: "sites" }));
    const observer = TestIntersectionObserver.current;
    unmount();
    expect(observer?.disconnect).toHaveBeenCalledOnce();

    vi.stubGlobal("IntersectionObserver", undefined);
    const fallback = renderHook(() => useScrollSpy({ ids, initialId: "sites" }));
    expect(fallback.result.current).toBe("sites");
  });
});
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```powershell
npm test -- features/scroll/use-scroll-spy.test.tsx
```

Expected: FAIL because `@/features/scroll/use-scroll-spy` does not exist.

- [ ] **Step 3: Implement the minimal shared hook**

```ts
"use client";

import { useEffect, useState } from "react";

const DEFAULT_ROOT_MARGIN = "-18% 0px -72% 0px";

type UseScrollSpyOptions<Id extends string> = {
  readonly ids: readonly Id[];
  readonly initialId: Id;
  readonly rootMargin?: string;
};

export function useScrollSpy<Id extends string>({
  ids,
  initialId,
  rootMargin = DEFAULT_ROOT_MARGIN,
}: UseScrollSpyOptions<Id>): Id {
  const [activeId, setActiveId] = useState<Id>(initialId);

  useEffect(() => {
    setActiveId(initialId);
    if (typeof IntersectionObserver === "undefined") return;

    const order = new Map(ids.map((id, index) => [id, index] as const));
    const intersecting = new Set<Id>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id as Id;
          if (!order.has(id)) continue;
          if (entry.isIntersecting) intersecting.add(id);
          else intersecting.delete(id);
        }

        const next = [...intersecting].sort(
          (left, right) => (order.get(left) ?? 0) - (order.get(right) ?? 0),
        ).at(-1);
        if (next) setActiveId((current) => (current === next ? current : next));
      },
      { rootMargin, threshold: 0 },
    );

    for (const id of ids) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }

    return () => observer.disconnect();
  }, [ids, initialId, rootMargin]);

  return activeId;
}
```

- [ ] **Step 4: Run the focused tests and verify GREEN**

Run:

```powershell
npm test -- features/scroll/use-scroll-spy.test.tsx
```

Expected: 3 tests passed.

- [ ] **Step 5: Commit the shared primitive**

```powershell
git add noir-digital/features/scroll/use-scroll-spy.ts noir-digital/features/scroll/use-scroll-spy.test.tsx
git commit -m "feat: add shared scroll spy"
```

### Task 2: Migrate the project-page table of contents

**Files:**
- Modify: `components/services/ServicesArticle.tsx:1-112`
- Modify: `components/services/ServicesArticle.test.tsx:1-91`

- [ ] **Step 1: Replace the geometry test with the shared-hook integration contract**

Add a hoisted mock beside `providerMocks`:

```tsx
const scrollSpyMocks = vi.hoisted(() => ({
  activeId: "visao-geral",
}));

vi.mock("@/features/scroll/use-scroll-spy", () => ({
  useScrollSpy: () => scrollSpyMocks.activeId,
}));
```

Reset `scrollSpyMocks.activeId = "visao-geral"` in `afterEach`, then replace the test “highlights the latest chapter that crossed the reading line” with:

```tsx
it("marks the chapter selected by the shared scroll spy", () => {
  scrollSpyMocks.activeId = "processo";
  render(<ServicesArticle />);
  const summary = screen.getByRole("navigation", { name: "Sumário do serviço" });

  expect(within(summary).getByRole("link", { name: "Como trabalhamos" })).toHaveAttribute(
    "aria-current",
    "location",
  );
  expect(within(summary).getByRole("link", { name: "Visão geral" })).not.toHaveAttribute(
    "aria-current",
  );
});
```

- [ ] **Step 2: Run the component test and verify RED**

Run:

```powershell
npm test -- components/services/ServicesArticle.test.tsx
```

Expected: FAIL because the component still owns its manual scroll listener and does not call the mocked hook.

- [ ] **Step 3: Replace the manual listener with `useScrollSpy`**

Change the imports and stable IDs:

```tsx
import { type MouseEvent } from "react";

import { useScroll } from "@/features/scroll/ScrollProvider";
import { useScrollSpy } from "@/features/scroll/use-scroll-spy";

type ChapterId = (typeof chapters)[number]["id"];
const chapterIds = chapters.map(({ id }) => id);
const INITIAL_CHAPTER_ID: ChapterId = "visao-geral";
```

Inside `ServicesArticle`, replace `useState` and the entire scroll `useEffect` with:

```tsx
const activeChapter = useScrollSpy({
  ids: chapterIds,
  initialId: INITIAL_CHAPTER_ID,
});
```

Remove `setActiveChapter(chapterId)` from `scrollToChapter`; the observer becomes the only source of truth.

- [ ] **Step 4: Run the project-page tests and verify GREEN**

Run:

```powershell
npm test -- components/services/ServicesArticle.test.tsx
```

Expected: 3 tests passed, including the existing smooth-scroll/hash test.

- [ ] **Step 5: Commit the migration**

```powershell
git add noir-digital/components/services/ServicesArticle.tsx noir-digital/components/services/ServicesArticle.test.tsx
git commit -m "perf: migrate service article scroll spy"
```

### Task 3: Add the desktop service index to the home

**Files:**
- Modify: `components/work/ServiceStatement.tsx:1-87`
- Modify: `components/work/SelectedWork.tsx:22-42`
- Modify: `components/work/SelectedWork.module.css:31-114, 270-340`
- Modify: `components/work/SelectedWork.test.tsx:1-207`

- [ ] **Step 1: Add failing home-index component tests**

Add the provider and hook mocks at the top of `SelectedWork.test.tsx`:

```tsx
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const serviceIndexMocks = vi.hoisted(() => ({
  activeId: "service-sites",
  scrollToSelector: vi.fn(),
}));

vi.mock("@/features/scroll/ScrollProvider", () => ({
  useScroll: () => ({ scrollToSelector: serviceIndexMocks.scrollToSelector }),
}));

vi.mock("@/features/scroll/use-scroll-spy", () => ({
  useScrollSpy: () => serviceIndexMocks.activeId,
}));
```

Extend the existing cleanup:

```tsx
afterEach(() => {
  cleanup();
  serviceIndexMocks.activeId = "service-sites";
  serviceIndexMocks.scrollToSelector.mockClear();
  window.history.replaceState(null, "", "/");
});
```

Then add:

```tsx
it("renders a desktop service index in project-group order", () => {
  render(<SelectedWork />);
  const index = screen.getByRole("navigation", { name: "Índice de serviços" });
  const links = within(index).getAllByRole("link");

  expect(links.map((link) => link.textContent)).toEqual(serviceGroups.map(({ title }) => title));
  expect(links[0]).toHaveAttribute("aria-current", "location");
  expect(links.map((link) => link.getAttribute("href"))).toEqual(
    serviceGroups.map(({ id }) => `#service-${id}`),
  );
});

it("scrolls smoothly when a service-index item is selected", () => {
  render(<SelectedWork />);
  fireEvent.click(screen.getByRole("link", { name: "Vídeos" }));

  expect(serviceIndexMocks.scrollToSelector).toHaveBeenCalledWith("#service-videos");
  expect(window.location.hash).toBe("#service-videos");
});
```

Extend the CSS contract test:

```tsx
expect(css).toMatch(/\.serviceIndex\s*\{[^}]*display:\s*none/);
expect(css).toMatch(
  /@media \(min-width:\s*1024px\)[\s\S]*\.serviceIndex\s*\{[^}]*display:\s*flex/,
);
```

- [ ] **Step 2: Run the home tests and verify RED**

Run:

```powershell
npm test -- components/work/SelectedWork.test.tsx
```

Expected: FAIL because “Índice de serviços” is not rendered.

- [ ] **Step 3: Give every service group a stable hash target**

In `SelectedWork.tsx`, add the section ID:

```tsx
<section
  id={`service-${group.id}`}
  key={group.id}
  className={styles["serviceGroup"]}
  aria-labelledby={headingId}
  data-service-group={group.id}
>
```

- [ ] **Step 4: Render the index inside the pinned statement**

Update `ServiceStatement.tsx` imports and constants:

```tsx
import { type MouseEvent, useEffect, useRef, useState } from "react";

import { serviceGroups, type ServiceId } from "@/data/projects";
import { useScroll } from "@/features/scroll/ScrollProvider";
import { useScrollSpy } from "@/features/scroll/use-scroll-spy";

type ServiceAnchorId = `service-${ServiceId}`;
const serviceAnchorIds = serviceGroups.map(
  ({ id }) => `service-${id}` as ServiceAnchorId,
);
const INITIAL_SERVICE_ANCHOR: ServiceAnchorId = "service-sites";
```

Inside `ServiceStatement`:

```tsx
const activeService = useScrollSpy({
  ids: serviceAnchorIds,
  initialId: INITIAL_SERVICE_ANCHOR,
});
const { scrollToSelector } = useScroll();

const scrollToService = (
  event: MouseEvent<HTMLAnchorElement>,
  anchorId: ServiceAnchorId,
) => {
  event.preventDefault();
  window.history.replaceState(null, "", `#${anchorId}`);
  scrollToSelector(`#${anchorId}`);
};
```

Render after the `h2`:

```tsx
<nav className={styles["serviceIndex"]} aria-label="Índice de serviços">
  {serviceGroups.map((service) => {
    const anchorId = `service-${service.id}` as ServiceAnchorId;
    return (
      <a
        key={service.id}
        href={`#${anchorId}`}
        aria-current={activeService === anchorId ? "location" : undefined}
        onClick={(event) => scrollToService(event, anchorId)}
      >
        {service.title}
      </a>
    );
  })}
</nav>
```

- [ ] **Step 5: Add the editorial desktop styling**

Add before `.projectGrid`:

```css
.serviceIndex {
  display: none;
}

.serviceIndex a {
  position: relative;
  width: 100%;
  padding: 4px 8px 4px 18px;
  border: 2px dotted transparent;
  color: var(--text-secondary);
  font-family: var(--font-interface);
  font-size: 0.875rem;
  line-height: 1.25;
  text-decoration: none;
  transition: color var(--duration-micro) var(--ease-standard);
}

.serviceIndex a::before {
  position: absolute;
  top: 50%;
  left: 2px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: currentColor;
  content: "";
  opacity: 0;
  transform: translateY(-50%);
}

.serviceIndex a[aria-current="location"] {
  color: var(--text-primary);
  font-weight: 650;
}

.serviceIndex a[aria-current="location"]::before {
  opacity: 1;
}

.serviceIndex a:hover {
  color: var(--text-primary);
}

.serviceIndex a:focus-visible {
  border-color: currentColor;
  outline: none;
}
```

Inside `@media (min-width: 1024px)` add:

```css
.serviceIndex {
  display: flex;
  width: min(100%, 13rem);
  margin-top: clamp(28px, 4vh, 48px);
  flex-direction: column;
  align-items: flex-start;
}
```

Add scroll margin and reduced motion:

```css
.serviceGroup {
  scroll-margin-top: 7rem;
}

@media (prefers-reduced-motion: reduce) {
  .serviceIndex a {
    transition: none;
  }
}
```

- [ ] **Step 6: Run the home tests and verify GREEN**

Run:

```powershell
npm test -- components/work/SelectedWork.test.tsx
```

Expected: all SelectedWork/TrustStrip tests passed.

- [ ] **Step 7: Commit the home index**

```powershell
git add noir-digital/components/work/ServiceStatement.tsx noir-digital/components/work/SelectedWork.tsx noir-digital/components/work/SelectedWork.module.css noir-digital/components/work/SelectedWork.test.tsx
git commit -m "feat: add active service index"
```

### Task 4: Integrated verification

**Files:**
- Verify only; modify the smallest affected file only if a check exposes a defect.

- [ ] **Step 1: Run all focused tests together**

Run:

```powershell
npm test -- features/scroll/use-scroll-spy.test.tsx components/services/ServicesArticle.test.tsx components/work/SelectedWork.test.tsx
```

Expected: all focused tests passed.

- [ ] **Step 2: Run typecheck and production build**

Run:

```powershell
npm run typecheck
npm run build
```

Expected: both commands exit with code 0.

- [ ] **Step 3: Verify the home in a real browser**

At 1440×900:

- open `http://127.0.0.1:3000/#selected-work`;
- confirm the index sits below the pinned title;
- scroll through all four groups and confirm the active item changes;
- click each item and confirm smooth navigation;
- confirm no overlap with the status bar and no horizontal overflow.

At 390×844:

- confirm the index is absent;
- confirm the title and cards retain their current layout;
- confirm no horizontal overflow.

- [ ] **Step 4: Verify the project page**

At 1440×900:

- open `http://127.0.0.1:3000/services`;
- confirm the existing sumário remains visible at its current breakpoint;
- scroll through parent and nested chapters;
- confirm active selection and click navigation remain correct.

- [ ] **Step 5: Run the full test suite serially**

Run:

```powershell
npx vitest run --maxWorkers=1 --no-file-parallelism
```

Expected: all test files and tests passed without worker crashes.

- [ ] **Step 6: Commit any verification-only correction**

Only if Step 3 or Step 4 required a correction:

```powershell
git add noir-digital/features/scroll/use-scroll-spy.ts noir-digital/features/scroll/use-scroll-spy.test.tsx noir-digital/components/services/ServicesArticle.tsx noir-digital/components/services/ServicesArticle.test.tsx noir-digital/components/work/ServiceStatement.tsx noir-digital/components/work/SelectedWork.tsx noir-digital/components/work/SelectedWork.module.css noir-digital/components/work/SelectedWork.test.tsx
git commit -m "fix: refine service scroll index"
```

If no correction was required, do not create an empty commit.
