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
      expect(icon).toHaveAttribute("fill", "none");
      expect(icon).toHaveAttribute("stroke", "currentColor");
      expect(card.querySelector('[data-ai-halo="true"]')).toHaveAttribute("aria-hidden", "true");
    });
  });

  it("draws a different line icon for each service", () => {
    const { container } = render(<AiServicesSection />);
    const drawings = [...container.querySelectorAll("svg[data-ai-glyph-icon]")].map((icon) =>
      [...icon.querySelectorAll("path")].map((path) => path.getAttribute("d")).join(" "),
    );

    expect(drawings.every((drawing) => drawing.length > 0)).toBe(true);
    expect(new Set(drawings).size).toBe(aiServices.length);
  });

  it("masks the spectrum with one colourless halftone of shrinking dots", () => {
    const svg = readFileSync(join(process.cwd(), "public/brand/ai-halftone.svg"), "utf8");
    const radii = [...svg.matchAll(/<circle [^>]*r="([\d.]+)"/g)].map((match) => Number(match[1]));

    expect(radii.length).toBeGreaterThan(500);
    expect(Math.max(...radii)).toBeGreaterThan(Math.min(...radii) * 5);
    expect(svg.match(/(?:fill|stroke)="[^"]+"/g)).toEqual(['fill="#000"']);
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
      /\.heading\s*\{[\s\S]*margin:[\s\S]*calc\(var\(--text-axis\) - var\(--page-inline\)\)/,
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
    expect(css).toContain("--service-accent");
    expect(css).toMatch(/\.halo\s*\{[^}]*var\(--spectrum-linear\)/);
    expect(css).toMatch(
      /\.halo\s*\{[^}]*calc\(var\(--service-index\) \* 20%\)[^}]*background-size:\s*500% 100%/,
    );
    expect(css).toMatch(/\.halo\s*\{[^}]*mask:\s*url\("\/brand\/ai-halftone\.svg"\)/);
    expect(css).toMatch(/\.halo\s*\{[^}]*width:\s*280px;\s*height:\s*280px/);
    expect(css).not.toMatch(/\.signal::(?:before|after)/);
    expect(css).toMatch(/\.cardMain\s*\{[^}]*z-index:\s*1/);
    expect(css).toMatch(/\.description\s*\{[^}]*margin:\s*0;/);
    expect(css).toMatch(/\.card h3\s*\{[^}]*min-height:\s*2\.5em/);
    expect(css).toMatch(/\.number\s*\{[^}]*font:\s*var\(--role-label\)/);
    expect(css).toMatch(/\.card h3\s*\{[^}]*font:\s*var\(--role-subtitle\)/);
    expect(css).toMatch(/\.description\s*\{[^}]*font:\s*var\(--role-body\)/);
    expect(css).toMatch(/\.cardFooter\s*\{[^}]*font:\s*var\(--role-label\)/);
    expect(css).not.toContain("stroke-dasharray");
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).not.toContain("animation: infinite");
    expect(css).not.toContain("mix-blend-mode");
  });
});
