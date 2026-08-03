import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { aiServices } from "@/data/ai-services";
import { AiServicesSection } from "./AiServicesSection";

describe("AiServicesSection", () => {
  it("renders the approved editorial introduction", () => {
    render(<AiServicesSection />);

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "IA para simplificar sua operação",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("IA FIRST")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Soluções de IA aplicadas ao que realmente move o seu negócio: eficiência, escala e decisões melhores.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("Identificação da seção")).not.toBeInTheDocument();
  });

  it("renders six static technical cards with their numbering and codes", () => {
    const { container } = render(<AiServicesSection />);
    const cards = container.querySelectorAll("article[data-ai-service]");

    expect(cards).toHaveLength(aiServices.length);

    aiServices.forEach((service, index) => {
      const card = cards.item(index);
      const number = String(index + 1).padStart(2, "0");

      expect(card).toBeInstanceOf(HTMLElement);
      if (!(card instanceof HTMLElement)) {
        throw new Error(`Missing AI service card at index ${index}`);
      }

      expect(card).toHaveAttribute("data-ai-service", service.id);
      expect(card).toHaveAttribute("data-glyph", service.glyph);
      expect(
        within(card).getByRole("heading", { level: 3, name: service.label }),
      ).toBeInTheDocument();
      expect(within(card).getByText(service.description)).toBeInTheDocument();
      expect(within(card).getAllByText(number).length).toBeGreaterThan(0);
      expect(within(card).getByText(`NOIR-IA · ${service.code}`)).toBeInTheDocument();
      expect(within(card).getByText(`${number}/06`)).toBeInTheDocument();
      const signal = card.querySelector(`[data-ai-signal="${service.glyph}"]`);
      expect(signal).toHaveAttribute("aria-hidden", "true");
      const icon = signal?.querySelector(`svg[data-ai-glyph-icon="${service.glyph}"]`);
      expect(icon).toBeInTheDocument();
      const dotCount = [...(icon?.querySelectorAll('[data-ai-glyph-dots="true"]') ?? [])].reduce(
        (total, path) => total + Number(path.getAttribute("data-ai-glyph-dot-count") ?? 0),
        0,
      );
      expect(dotCount).toBeGreaterThan(20);
      if (service.glyph !== "copilots") {
        expect(icon?.querySelector('[data-ai-glyph-emphasis="true"]')).toBeInTheDocument();
      }
    });
  });

  it("contains no wave, image, canvas, disclosure, or section CTA", () => {
    const { container } = render(<AiServicesSection />);
    const source = readFileSync(
      join(process.cwd(), "components/ai-services/AiServicesSection.tsx"),
      "utf8",
    );

    expect(container.querySelector("button")).toBeNull();
    expect(container.querySelector("canvas")).toBeNull();
    expect(container.querySelectorAll("svg[data-ai-glyph-icon]")).toHaveLength(aiServices.length);
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("source")).toBeNull();
    expect(source).not.toContain("AiDitherWave");
    expect(source).not.toContain("SpectrumContactCta");
    expect(source).not.toContain("useState");
    expect(source).not.toContain("useEffect");
    expect(source).not.toContain("requestAnimationFrame");
  });

  it("continues the site background and structural grid without a private surface", () => {
    const css = readFileSync(
      join(process.cwd(), "components/ai-services/AiServicesSection.module.css"),
      "utf8",
    );

    expect(css).toMatch(/\.section\s*\{[\s\S]*background:\s*transparent/);
    expect(css).not.toMatch(/\.section::before\s*\{/);
    expect(css).toMatch(/\.inner\s*\{[\s\S]*max-width:\s*none/);
    expect(css).toMatch(/\.intro\s*\{[\s\S]*grid-template-columns:\s*repeat\(12,/);
    expect(css).toMatch(
      /\.servicesGrid\s*\{[\s\S]*grid-template-columns:\s*repeat\(3,[\s\S]*gap:\s*0\.5rem/,
    );
    expect(css).toContain("--site-grid-line-clearance: 0.25rem");
    expect(css).toMatch(
      /@media \(min-width:\s*1024px\)[\s\S]*\.servicesGrid\s*\{[^}]*column-gap:\s*0/,
    );
    expect(css).toMatch(
      /\.card:nth-child\(3n \+ 2\)\s*\{[^}]*margin-right:\s*var\(--site-grid-line-clearance\)[^}]*margin-left:\s*calc\(var\(--site-grid-line-clearance\) \+ var\(--stroke-hairline\)\)/,
    );
    expect(css).toMatch(
      /\.heading\s*\{[\s\S]*margin:[\s\S]*calc\(var\(--header-brand-text-inset\) - var\(--page-inline\)\)/,
    );
    expect(css).toMatch(
      /\.card\s*\{[\s\S]*--card-border:\s*rgb\(168 173 178 \/ 22%\)[\s\S]*border:\s*1px solid var\(--card-border\)[\s\S]*background:\s*color-mix\(in srgb, var\(--color-noir-black\) 96%, transparent\)/,
    );
    expect(css).toMatch(/\.section::after\s*\{[\s\S]*border-block:\s*1px solid transparent/);
    expect(css).not.toContain("--border-primary");
    expect(css).not.toContain("--surface-secondary");
    expect(css).not.toContain("--text-tertiary");
    expect(css).toMatch(/@media \(max-width:\s*1023px\)[\s\S]*grid-template-columns:\s*repeat\(2,/);
    expect(css).toMatch(
      /@media \(max-width:\s*767px\)[\s\S]*\.servicesGrid\s*\{[\s\S]*grid-template-columns:\s*1fr/,
    );
    expect(css).toContain("radial-gradient(");
    expect(css).toContain("--service-accent");
    expect(css).toMatch(
      /\.signal::before\s*\{[^}]*inset:\s*6%[^}]*background-size:\s*4px 4px[^}]*opacity:\s*0\.42/,
    );
    expect(css).not.toMatch(/\.signal::before\s*\{[^}]*mask-image/);
    expect(css).toMatch(/\.signalGlyph path\s*\{[^}]*fill:\s*currentColor/);
    expect(css).toMatch(/\.number\s*\{[^}]*font-family:\s*var\(--font-display\)/);
    expect(css).toMatch(/\.card h3\s*\{[^}]*font-family:\s*var\(--font-display\)/);
    expect(css).toMatch(/\.description\s*\{[^}]*font-family:\s*var\(--font-display\)/);
    expect(css).toMatch(/\.description\s*\{[^}]*font-size:\s*0\.875rem/);
    expect(css).toMatch(/\.cardFooter\s*\{[^}]*font-family:\s*var\(--font-display\)/);
    expect(css).not.toContain("stroke-dasharray");
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).not.toContain("animation: infinite");
    expect(css).not.toContain("mix-blend-mode");
  });
});
