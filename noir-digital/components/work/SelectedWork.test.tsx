import { readFileSync } from "node:fs";
import { join } from "node:path";

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
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
  serviceIndexMocks.activeId = "service-sites";
  serviceIndexMocks.scrollToSelector.mockClear();
  window.history.replaceState(null, "", "/");
});

describe("TrustStrip", () => {
  it("renders every approved logo once for assistive technology", () => {
    render(<TrustStrip />);

    const list = screen.getByRole("list", { name: "Clientes" });
    expect(screen.getByRole("heading", { name: "Empresas que confiam" })).toBeInTheDocument();
    expect(within(list).getAllByRole("listitem")).toHaveLength(11);
    for (const client of clientLogos) {
      expect(within(list).getByRole("img", { name: client.label })).toHaveStyle({
        "--client-logo": `url(${client.image})`,
      });
    }
  });

  it("keeps four visual sequences moving continuously for a gap-free CSS marquee", () => {
    const view = render(<TrustStrip />);
    const track = view.container.querySelector('[data-logo-marquee="track"]');
    const sequences = track?.querySelectorAll('[data-logo-marquee="sequence"]');
    const css = readFileSync(join(process.cwd(), "components/trust/TrustStrip.module.css"), "utf8");

    expect(track).toBeInTheDocument();
    expect(sequences).toHaveLength(4);
    expect(sequences?.[1]).toHaveAttribute("aria-hidden", "true");
    expect(sequences?.[2]).toHaveAttribute("aria-hidden", "true");
    expect(sequences?.[3]).toHaveAttribute("aria-hidden", "true");
    expect(css).toMatch(/@keyframes\s+logo-marquee/);
    expect(css).toMatch(/translate3d\(-25%,\s*0,\s*0\)/);
    expect(css).not.toMatch(/animation-play-state:\s*paused/);
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

    expect(links.map((link) => link.textContent)).toEqual(
      serviceGroups.map(({ title }) => title),
    );
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
    expect(css).toMatch(/\.featuredCard\s*\{[^}]*grid-column:\s*1\s*\/\s*-1/);
    expect(css).toMatch(
      /@media \(max-width:\s*767px\)[\s\S]*\.serviceGroup\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/,
    );
    expect(css).toMatch(
      /@media \(max-width:\s*767px\)[\s\S]*\.projectCard\s*\{[^}]*grid-column:\s*1\s*\/\s*-1/,
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
    render(<SelectedWork />);

    for (const project of projects) {
      const card = screen.getByTestId(`project-${project.slug}`);
      expect(card).toHaveTextContent(project.client);
      for (const label of project.deliveryLabels) {
        expect(card).toHaveTextContent(label);
      }
    }
  });

  it("provides descriptive primary images and stable hover image slots", () => {
    render(<SelectedWork />);

    for (const project of projects) {
      const card = screen.getByTestId(`project-${project.slug}`);
      const primary = within(card).getByRole("img", { name: project.imageAlt });
      const hover = card.querySelector('[data-image-role="hover"]');
      const hoverReveal = card.querySelector<HTMLElement>('[data-card-hover-reveal="true"]');
      const frame = card.querySelector<HTMLElement>(`[data-work-card="${project.slug}"]`);
      const imageClip = primary.parentElement;

      expect(primary).toHaveAttribute("data-image-role", "primary");
      expect(primary.getAttribute("src")).toContain(encodeURIComponent(project.image));
      expect(hover).toHaveAttribute("aria-hidden", "true");
      expect(hover?.getAttribute("src")).toContain(encodeURIComponent(project.hoverImage));
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
      expect(link).toHaveAttribute("href", "/services");
      expect(link).not.toHaveAttribute("target");
      expect(link).not.toHaveAttribute("rel");
    }
  });
});
