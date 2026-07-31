import { readFileSync } from "node:fs";
import { join } from "node:path";

import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TrustStrip } from "@/components/trust/TrustStrip";
import { SelectedWork } from "@/components/work/SelectedWork";
import { clientLogos, serviceContent } from "@/data/content";
import { groupProjectsByService, projects, serviceGroups } from "@/data/projects";

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

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  serviceIndexMocks.activeId = "service-sites";
  serviceIndexMocks.scrollToSelector.mockClear();
  window.history.replaceState(null, "", "/");
});

describe("TrustStrip", () => {
  it("pauses the marquee until at least one pixel is visible", () => {
    let notify: IntersectionObserverCallback = () => undefined;
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(callback: IntersectionObserverCallback) {
          notify = callback;
        }

        observe() {}
        disconnect() {}
      },
    );

    const view = render(<TrustStrip />);
    const section = view.container.querySelector("section");

    act(() => {
      notify(
        [
          {
            boundingClientRect: { bottom: 1010, top: 800 },
            isIntersecting: true,
            rootBounds: { bottom: 800, top: 0 },
          } as IntersectionObserverEntry,
        ],
        {} as IntersectionObserver,
      );
    });
    expect(section).toHaveAttribute("data-animation-active", "false");

    act(() => {
      notify(
        [
          {
            boundingClientRect: { bottom: 1009, top: 799 },
            isIntersecting: true,
            rootBounds: { bottom: 800, top: 0 },
          } as IntersectionObserverEntry,
        ],
        {} as IntersectionObserver,
      );
    });
    expect(section).toHaveAttribute("data-animation-active", "true");
  });

  it("renders every approved logo once for assistive technology", () => {
    render(<TrustStrip />);

    const list = screen.getByRole("list", { name: "Clientes" });
    expect(screen.getByRole("heading", { name: "Empresas que confiam" })).toBeInTheDocument();
    expect(within(list).getAllByRole("listitem")).toHaveLength(13);
    for (const client of clientLogos) {
      expect(within(list).getByRole("img", { name: client.label })).toHaveStyle({
        "--client-logo": `url(${client.image})`,
      });
    }
  });

  it("keeps two visual sequences moving continuously for a gap-free CSS marquee", () => {
    const view = render(<TrustStrip />);
    const track = view.container.querySelector('[data-logo-marquee="track"]');
    const sequences = track?.querySelectorAll('[data-logo-marquee="sequence"]');
    const css = readFileSync(join(process.cwd(), "components/trust/TrustStrip.module.css"), "utf8");

    expect(track).toBeInTheDocument();
    expect(sequences).toHaveLength(2);
    expect(sequences?.[1]).toHaveAttribute("aria-hidden", "true");
    expect(css).toMatch(/@keyframes\s+logo-marquee/);
    expect(css).toMatch(/translate3d\(-50%,\s*0,\s*0\)/);
    expect(view.container.querySelector("section")).toHaveAttribute(
      "data-animation-active",
      "true",
    );
    expect(css).toMatch(
      /\.trustStrip\[data-animation-active="false"\] \.marqueeTrack\s*\{[^}]*animation-play-state:\s*paused/,
    );
    expect(css).toMatch(/prefers-reduced-motion:\s*reduce/);
    expect(css).toMatch(/\.logoSequence\s*\{[^}]*gap:\s*clamp\(24px,\s*3vw,\s*48px\)/);
    expect(css).toMatch(/\.logoItem\s*\{[^}]*width:\s*clamp\(104px,\s*9vw,\s*148px\)/);
    expect(css).toMatch(/\.logo\[data-client-logo="together"\]\s*\{[^}]*mask-size:\s*auto\s+92%/);
    expect(css).not.toMatch(/\.logo\[data-client-logo="together"\]\s*\{[^}]*transform:\s*scale/);
    expect(css).toMatch(
      /\.logo\[data-client-logo="ecohotel-cabanas"\]\s*\{[^}]*transform:\s*scale\(1\.12\)/,
    );
  });

  it("keeps section surfaces transparent for the global WebGL atmosphere", () => {
    render(
      <>
        <TrustStrip />
        <SelectedWork />
      </>,
    );

    expect(screen.getByRole("region", { name: "Empresas que confiam" })).not.toHaveClass(
      "ditherSurface",
    );
    expect(screen.getByRole("region", { name: /Serviços que estruturam/i })).not.toHaveClass(
      "ditherSurface",
    );
  });
});

describe("SelectedWork", () => {
  it("renders a desktop service index in project-group order", () => {
    render(<SelectedWork />);
    const index = screen.getByLabelText("Índice de serviços");
    const links = within(index).getAllByRole("link", { hidden: true });

    expect(links.map((link) => link.textContent)).toEqual(serviceGroups.map(({ title }) => title));
    expect(links[0]).toHaveAttribute("aria-current", "location");
    expect(links.map((link) => link.getAttribute("href"))).toEqual(
      serviceGroups.map(({ id }) => `#service-${id}`),
    );
  });

  it("scrolls smoothly when a service-index item is selected", () => {
    render(<SelectedWork />);
    const index = screen.getByLabelText("Índice de serviços");
    const videoLink = Array.from(index.querySelectorAll("a")).find(
      (link) => link.textContent === "Vídeos",
    );

    expect(videoLink).toBeDefined();
    fireEvent.click(videoLink as HTMLAnchorElement);

    expect(serviceIndexMocks.scrollToSelector).toHaveBeenCalledWith("#service-videos");
    expect(window.location.hash).toBe("#service-videos");
  });

  it("pins the statement within a dedicated rail while the cards scroll", () => {
    const view = render(<SelectedWork />);
    const section = view.container.querySelector("#selected-work");
    const rail = view.container.querySelector('[data-services-sticky-rail="true"]');
    const statement = view.container.querySelector('[data-service-pin-state="before"]');
    const css = readFileSync(
      join(process.cwd(), "components/work/SelectedWork.module.css"),
      "utf8",
    );

    expect(section?.firstElementChild).toBe(rail);
    expect(rail?.firstElementChild).toBe(statement);
    expect(statement).toContainElement(screen.getByRole("heading", { level: 2 }));
    expect(css).toMatch(/\.selectedWork\s*\{[^}]*align-items:\s*start/);
    expect(css).toMatch(
      /\.statement\s*\{[^}]*margin-left:\s*calc\(var\(--header-brand-text-inset\) - 56px\)/,
    );
    expect(css).toMatch(
      /@media \(max-width: 767px\)[\s\S]*\.statement\s*\{[^}]*margin-left:\s*calc\(var\(--header-brand-text-inset\) - 16px\)/,
    );
    expect(css).toMatch(
      /@media \(min-width: 1024px\)[\s\S]*\.selectedWork\s*\{[^}]*min-height:\s*180vh/,
    );
    expect(css).toMatch(
      /\.statement\[data-service-pin-state="pinned"\]\s*\{[^}]*position:\s*fixed[^}]*top:\s*7rem/,
    );
    expect(css).toMatch(
      /@media \(max-width: 767px\)[\s\S]*\.statement\s*\{[\s\S]*position:\s*static/,
    );
    expect(css).toMatch(/@media \(max-width: 767px\)[\s\S]*\.projectGrid\s*\{[^}]*grid-row:\s*2/);
  });

  it("uses the approved service-group grid at desktop and mobile", () => {
    const css = readFileSync(
      join(process.cwd(), "components/work/SelectedWork.module.css"),
      "utf8",
    );

    expect(css).toMatch(
      /\.serviceGroup\s*\{[^}]*grid-template-columns:\s*repeat\(8,\s*minmax\(0,\s*1fr\)\)/,
    );
    expect(css).toMatch(/\.serviceHeading\s*\{[^}]*grid-column:\s*1\s*\/\s*span\s*4/);
    expect(css).toMatch(/\.projectCard\s*\{[^}]*grid-column:\s*span\s*4/);
    expect(css).toMatch(/\.featuredCard\s*\{[^}]*grid-column:\s*1\s*\/\s*-1/);
    expect(css).toMatch(/\.imageFrame\s*\{[^}]*aspect-ratio:\s*1/);
    expect(css).toMatch(/\.featuredCard\s+\.imageFrame\s*\{[^}]*aspect-ratio:\s*1332\s*\/\s*750/);
    expect(css).toMatch(
      /@media \(min-width:\s*1280px\)[\s\S]*\.projectCard:not\(\.featuredCard\)\s*\{[^}]*grid-column:\s*span\s*3/,
    );
    expect(css).toMatch(
      /@media \(min-width:\s*1280px\)[\s\S]*\.serviceGroup\s+\.projectCard:nth-of-type\(2\):not\(\.featuredCard\)\s*\{[^}]*grid-column:\s*1\s*\/\s*span\s*3/,
    );
    expect(css).toMatch(
      /@media \(min-width:\s*1280px\)[\s\S]*\.serviceGroup\s+\.projectCard:nth-of-type\(3\):not\(\.featuredCard\)\s*\{[^}]*grid-column:\s*5\s*\/\s*span\s*3/,
    );
    expect(css).not.toMatch(/\.serviceGroup\s+\.projectCard[^}]*\{[^}]*margin-top:\s*120px/);
    expect(css).toMatch(
      /@media \(max-width:\s*767px\)[\s\S]*\.serviceGroup\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/,
    );
    expect(css).toMatch(
      /@media \(max-width:\s*767px\)[\s\S]*\.projectCard\s*\{[^}]*grid-column:\s*span\s*1/,
    );
    expect(css).toMatch(
      /@media \(max-width:\s*767px\)[\s\S]*\.featuredCard\s*\{[^}]*grid-column:\s*1\s*\/\s*-1/,
    );
    expect(css).toMatch(/\.serviceIndex\s*\{[^}]*display:\s*none/);
    expect(css).toMatch(
      /@media \(min-width:\s*1024px\)[\s\S]*\.serviceIndex\s*\{[^}]*display:\s*flex/,
    );
  });

  it("locks the desktop service statement into the four requested lines", () => {
    render(<SelectedWork />);

    const heading = screen.getByRole("heading", { level: 2, name: serviceContent.heading });
    expect(
      Array.from(heading.querySelectorAll("span"), (line) => line.textContent?.trim()),
    ).toEqual([
      serviceContent.heading,
      "Serviços que",
      "estruturam sua",
      "empresa para",
      "crescer",
    ]);
    expect(within(heading).queryByRole("link")).not.toBeInTheDocument();
  });

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
        within(region)
          .getAllByTestId(/^project-/)
          .map((card) => card.getAttribute("data-testid")?.replace("project-", "")),
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
    const view = render(<SelectedWork />);
    const css = readFileSync(
      join(process.cwd(), "components/work/SelectedWork.module.css"),
      "utf8",
    );

    for (const project of projects) {
      const card = screen.getByTestId(`project-${project.slug}`);
      const client = card.querySelector("[data-project-client]");

      expect(client).toHaveTextContent(project.client);
      expect(
        card.textContent?.match(
          new RegExp(project.client.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
        ),
      ).toHaveLength(1);
      for (const label of project.deliveryLabels) {
        expect(card).toHaveTextContent(label);
      }
    }

    expect(view.container.querySelectorAll("[data-project-client]")).toHaveLength(projects.length);
    expect(css).toMatch(/\.projectTitle\s*\{[^}]*text-transform:\s*uppercase/);
  });

  it("uses the pre-optimized work assets directly in both image slots", () => {
    render(<SelectedWork />);
    const featuredProjects = new Set(
      groupProjectsByService().flatMap((group) => group.projects[0]?.slug ?? []),
    );

    for (const project of projects) {
      const card = screen.getByTestId(`project-${project.slug}`);
      const primary = within(card).getByRole("img", { name: project.imageAlt });
      const hover = card.querySelector('[data-image-role="hover"]');
      const hoverReveal = card.querySelector<HTMLElement>('[data-card-hover-reveal="true"]');
      const frame = card.querySelector<HTMLElement>(`[data-work-card="${project.slug}"]`);
      const imageClip = primary.parentElement;

      expect(primary).toHaveAttribute("data-image-role", "primary");
      expect(primary).toHaveAttribute("src", project.image);
      expect(primary).toHaveAttribute("loading", "lazy");
      expect(primary).toHaveAttribute("fetchpriority", "low");
      expect(primary).toHaveAttribute(
        "width",
        featuredProjects.has(project.slug) ? "2400" : "1200",
      );
      expect(primary).toHaveAttribute(
        "height",
        featuredProjects.has(project.slug) ? "1351" : "1200",
      );
      expect(primary.getAttribute("srcset")).toContain("-960.webp 960w");
      expect(hover).toHaveAttribute("aria-hidden", "true");
      expect(hover).toHaveAttribute("src", project.hoverImage);
      expect(hover).toHaveAttribute("loading", "lazy");
      expect(hover).toHaveAttribute("fetchpriority", "low");
      expect(hover).toHaveAttribute("width", featuredProjects.has(project.slug) ? "2400" : "1200");
      expect(hover).toHaveAttribute("height", featuredProjects.has(project.slug) ? "1351" : "1200");
      expect(hover?.getAttribute("srcset")).toContain("-960.webp 960w");
      expect(hoverReveal).toBeInTheDocument();
      expect(hoverReveal).toHaveAttribute("aria-hidden", "true");
      expect(frame).toContainElement(hoverReveal);
      expect(frame).toHaveAttribute("data-canvas-active", "false");
      expect(imageClip).not.toContainElement(hoverReveal);
      expect(hoverReveal?.parentElement).toBe(frame);
    }
  });

  it("keeps every project destination internal and in the current tab", () => {
    render(<SelectedWork />);

    for (const project of projects) {
      const card = screen.getByTestId(`project-${project.slug}`);
      const link = within(card).getByRole("link");
      expect(link).toHaveAttribute("href", `/services/${project.slug}`);
      expect(link).not.toHaveAttribute("target");
      expect(link).not.toHaveAttribute("rel");
    }
  });
});
