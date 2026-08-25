import { readFileSync } from "node:fs";
import { join } from "node:path";

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { SpectrumContactCta } from "@/components/contact/SpectrumContactCta";

afterEach(cleanup);

describe("SpectrumContactCta", () => {
  it("renders the approved accessible contact-page action", () => {
    render(<SpectrumContactCta />);

    expect(screen.getByRole("link", { name: "Entrar em contato" })).toHaveAttribute(
      "href",
      "/contato",
    );
  });

  it("reuses the spectrum action with contextual labels and destinations", () => {
    render(<SpectrumContactCta href="/#contact" label="Planejar meu site" />);

    expect(screen.getByRole("link", { name: "Planejar meu site" })).toHaveAttribute(
      "href",
      "/#contact",
    );
  });

  it("maps the moving one-pixel RGB line around every clipped edge", () => {
    const css = readFileSync(
      join(process.cwd(), "components/contact/SpectrumContactCta.module.css"),
      "utf8",
    );

    expect(css).toContain("@keyframes opticalContourFlow");
    expect(css).toContain("animation: opticalContourFlow 1.8s linear infinite;");
    expect(css).toContain("@property --optical-angle");
    expect(css).toContain("background-image: conic-gradient(");
    expect(css).toContain("from var(--optical-angle)");
    expect(css).toContain("--optical-angle: 1turn;");
    expect(css).toContain("var(--color-spectral-red)");
    expect(css).toContain("var(--color-spectral-green)");
    expect(css).toContain("var(--color-spectral-blue)");
    expect(css).toContain('mask-image: url("data:image/svg+xml,');
    expect(css).toContain("M0%200H246L260%2014V64H14L0%2050Z");
    expect(css).toContain("stroke-width='2'");
    expect(css).not.toContain("content-box");
    expect(css).not.toContain("mask-composite: exclude;");
    expect(css).not.toContain("--corner-refraction");
    expect(css).not.toContain("alternate");
    expect(css).not.toContain("repeating-linear-gradient");
    expect(css).not.toContain("surfaceSheenPass");
    expect(css).not.toContain(".surface::before");
    expect(css).not.toContain(".surface::after");
    expect(css).not.toContain("background-size: 200% 100%");
    expect(css).toMatch(/\.root::before\s*\{[\s\S]*?opacity:\s*0/);
    expect(css).not.toMatch(/spectral-(?:orange|yellow|cyan|violet)/);
    expect(css).not.toMatch(/#(?:ff8a00|d9ff00|00e88f|00c8ff|5f55ff|ff2fad)/i);
  });

  it("separates the one-pixel line from the surface without adding hover glow", () => {
    const css = readFileSync(
      join(process.cwd(), "components/contact/SpectrumContactCta.module.css"),
      "utf8",
    );

    expect(css).toMatch(
      /@media \(hover:\s*hover\) and \(pointer:\s*fine\)[\s\S]*\.root:hover \.surface\s*\{[^}]*transform:\s*translate\(7px,\s*-6px\)/,
    );
    expect(css).toMatch(/\.root:hover::before\s*\{[^}]*opticalContourFlow/);
    expect(css).not.toMatch(/\.root:hover::after/);
    expect(css).not.toMatch(/\.root:hover \.surface\s*\{[^}]*box-shadow:/);
  });

  it("keeps the underlay line visible without motion for reduced-motion users", () => {
    const css = readFileSync(
      join(process.cwd(), "components/contact/SpectrumContactCta.module.css"),
      "utf8",
    );

    expect(css).toMatch(
      /@media \(prefers-reduced-motion:\s*reduce\) and \(hover:\s*hover\) and \(pointer:\s*fine\)[\s\S]*\.root:hover::before\s*\{[^}]*animation:\s*none[^}]*--optical-angle:\s*0\.18turn[^}]*opacity:\s*1/,
    );
  });

  it("keeps RGB, glow, and movement exclusive to pointer hover", () => {
    const css = readFileSync(
      join(process.cwd(), "components/contact/SpectrumContactCta.module.css"),
      "utf8",
    );

    expect(css).toMatch(
      /\.root:focus-visible\s*\{[^}]*outline:\s*2px solid rgb\(255 255 255 \/ 85%\)[^}]*outline-offset:\s*3px/,
    );
    expect(css).not.toMatch(/\.root:focus-visible::(?:before|after)/);
    expect(css).not.toContain(".root:focus-visible .surface::before");
    expect(css).not.toMatch(/\.root:focus-visible \.surface\s*\{[^}]*(?:transform|filter):/);
  });

  it("uses a graphite surface when the site is in the light theme", () => {
    const css = readFileSync(
      join(process.cwd(), "components/contact/SpectrumContactCta.module.css"),
      "utf8",
    );

    expect(css).toContain(':global([data-theme="light"]) .root');
    expect(css).toContain(':global([data-theme="light"]) .surface');
    expect(css).toContain(
      "background: linear-gradient(180deg, #242628 0%, #101112 50%, #030303 100%);",
    );
    expect(css).toContain("color: var(--color-noir-warm-white);");
  });
});
