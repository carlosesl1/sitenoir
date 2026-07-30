import { readFileSync } from "node:fs";
import { join } from "node:path";

import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Hero } from "@/components/hero/Hero";
import {
  contactEmail,
  heroDescriptionLines,
  heroHeadlineLines,
  heroLabels,
  heroSupportLines,
} from "@/data/content";

afterEach(cleanup);

describe("Hero", () => {
  it("renders one semantic headline with the exact locked lines", () => {
    render(<Hero />);
    const heading = screen.getByRole("heading", { level: 1 });

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    for (const line of heroHeadlineLines) {
      expect(within(heading).getByText(line)).toBeInTheDocument();
    }
  });

  it("preserves all supporting copy in the DOM", () => {
    render(<Hero />);

    for (const label of heroLabels) expect(screen.getByText(label)).toBeInTheDocument();
    for (const line of heroSupportLines) expect(screen.getByText(line)).toBeInTheDocument();
    for (const line of heroDescriptionLines) expect(screen.getByText(line)).toBeInTheDocument();
  });

  it("exposes the shared contact action in the desktop hero composition", () => {
    const view = render(<Hero />);

    expect(screen.getByRole("link", { name: "Entrar em contato", hidden: true })).toHaveAttribute(
      "href",
      `mailto:${contactEmail}`,
    );
    expect(view.container.querySelector('[data-hero-action-row="true"]')).toBeInTheDocument();
  });

  it("assigns the copied decode timing to every visible hero line", () => {
    const view = render(<Hero />);
    const decodedLines = Array.from(
      view.container.querySelectorAll<HTMLElement>("[data-hero-scramble]"),
    );

    expect(decodedLines).toHaveLength(11);
    expect(decodedLines.map((line) => line.dataset["scrambleText"])).toEqual([
      ...heroLabels,
      ...heroSupportLines,
      ...heroHeadlineLines,
      ...heroDescriptionLines,
    ]);
    expect(
      decodedLines
        .slice(0, 5)
        .map((line) => [line.dataset["scrambleDelay"], line.dataset["scrambleLetterDelay"]]),
    ).toEqual(Array.from({ length: 5 }, () => ["0", "10"]));
    expect(
      decodedLines
        .slice(5, 8)
        .map((line) => [line.dataset["scrambleDelay"], line.dataset["scrambleLetterDelay"]]),
    ).toEqual([
      ["0", "50"],
      ["120", "50"],
      ["240", "50"],
    ]);
    expect(
      decodedLines
        .slice(8)
        .map((line) => [line.dataset["scrambleDelay"], line.dataset["scrambleLetterDelay"]]),
    ).toEqual(Array.from({ length: 3 }, () => ["0", "10"]));
  });

  it("exposes a stable decorative anchor for the fixed 3D scene", () => {
    const view = render(<Hero />);
    const anchor = view.container.querySelector('[data-scene-anchor="hero"]');

    expect(anchor).toBeInTheDocument();
    expect(anchor).toHaveAttribute("aria-hidden", "true");
  });

  it("uses a CSS-only mobile contract for desktop supporting labels", () => {
    const css = readFileSync(join(process.cwd(), "components/hero/Hero.module.css"), "utf8");
    const tokens = readFileSync(join(process.cwd(), "styles/tokens.css"), "utf8");

    expect(css).toContain("grid-template-areas");
    expect(css).toMatch(/\.heroGrid\s*\{[^}]*z-index:\s*3/);
    for (const area of ["disciplines", "promise", "description", "headline"]) {
      expect(css).toContain(area);
    }
    expect(css).toContain("@media (max-width: 767px)");
    expect(css).toContain("@media (min-width: 768px)");
    expect(tokens).toMatch(/--header-brand-text-inset:\s*26px/);
    expect(tokens).toMatch(/@media \(min-width: 1024px\)[\s\S]*--header-brand-text-inset:\s*66px/);
    expect(css).toMatch(
      /@media \(min-width: 768px\)[\s\S]*\.disciplines\s*\{[^}]*left:\s*var\(--header-brand-text-inset\)/,
    );
    expect(css).toMatch(/\.desktopSupport[\s\S]*display:\s*none/);
    expect(css).toMatch(/\.heroCtaSlot[\s\S]*display:\s*none/);
    expect(css).toMatch(
      /@media \(max-width: 767px\)[\s\S]*\.actionRow\s*\{[^}]*display:\s*flex[^}]*grid-area:\s*description[^}]*flex-direction:\s*column/,
    );
    expect(css).toMatch(
      /@media \(max-width: 767px\)[\s\S]*\.heroCtaSlot\s*\{[^}]*display:\s*block[^}]*width:\s*min\(100%, 260px\)/,
    );
    expect(css).toMatch(
      /@media \(max-width: 767px\)[\s\S]*\.heroGrid\s*\{[^}]*min-height:\s*100svh[^}]*grid-template-rows:\s*auto 1fr auto/,
    );
    expect(css).toMatch(
      /@media \(max-width: 767px\)[\s\S]*\.description\s*\{[^}]*display:\s*block/,
    );
    expect(css).toContain('.description > [data-hero-scramble="true"]');
    expect(css).toContain('.headline > [data-hero-scramble="true"]');
    expect(css).toContain('[data-scramble-visual="true"]');
    expect(css).toContain('[data-scramble-measure="true"]');
    expect(css).toMatch(/@media \(min-width: 768px\)[\s\S]*\.description[\s\S]*grid-area:\s*auto/);
    expect(css).toMatch(
      /@media \(min-width: 768px\)[\s\S]*\.actionRow::before\s*\{[^}]*grid-column:\s*2[^}]*content:\s*""/,
    );
    expect(css).toMatch(
      /@media \(min-width: 768px\)[\s\S]*\.actionRow\s*\{[^}]*top:\s*calc\(81\.5svh \+ 24px\)[^}]*right:\s*auto[^}]*left:\s*50%[^}]*max-width:\s*760px[^}]*transform:\s*translateX\(-50%\)/,
    );
    expect(css).toMatch(
      /@media \(min-width: 768px\)[\s\S]*\.description\s*\{[^}]*grid-column:\s*1[^}]*padding-right:\s*0[^}]*white-space:\s*nowrap/,
    );
    expect(css).toMatch(
      /@media \(min-width: 768px\)[\s\S]*\.heroCtaSlot\s*\{[^}]*grid-column:\s*3[^}]*padding-left:\s*0[^}]*border-left:\s*0/,
    );
    expect(css).toMatch(
      /@media \(min-width: 768px\)[\s\S]*\.headline\s*\{[^}]*top:\s*calc\(55\.5svh \+ 24px\)/,
    );
    expect(css).toMatch(
      /@media \(min-width: 768px\) and \(max-width: 1279px\)[\s\S]*\.headline\s*\{[^}]*top:\s*calc\(57svh \+ 20px\)/,
    );
    expect(css).toMatch(
      /@media \(min-width: 768px\) and \(max-width: 1279px\)[\s\S]*\.actionRow\s*\{[^}]*top:\s*calc\(80\.5svh \+ 20px\)/,
    );
    expect(css).toMatch(
      /@media \(min-width: 768px\) and \(max-height: 720px\)[\s\S]*\.headline\s*\{[^}]*top:\s*calc\(18\.5svh \+ 20px\)[^}]*left:\s*clamp\(56px, 8\.6vw, 176px\)/,
    );
    expect(css).toMatch(/font-size:\s*clamp\(2\.75rem, 5\.75vw, 7\.4rem\)/);
    expect(css).toMatch(
      /@media \(min-width: 768px\) and \(max-height: 720px\)[\s\S]*\.actionRow\s*\{[^}]*top:\s*calc\(66\.8svh \+ 20px\)[^}]*right:\s*auto[^}]*left:\s*50%[^}]*width:\s*calc\(100vw - clamp\(120px, 32\.5vw, 666px\) - clamp\(32px, 14\.5vw, 297px\)\)[^}]*grid-template-columns:\s*minmax\(0, 1fr\) 1px minmax\(220px, 260px\)[^}]*column-gap:\s*clamp\(24px, 3vw, 40px\)/,
    );
  });
});
