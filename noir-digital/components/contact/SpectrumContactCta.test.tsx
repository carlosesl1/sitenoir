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

  it("uses only soft red, green, and blue optical accents", () => {
    const css = readFileSync(
      join(process.cwd(), "components/contact/SpectrumContactCta.module.css"),
      "utf8",
    );

    expect(css).toContain("animation: spectrumDrift 2.8s ease-in-out infinite alternate;");
    expect(css).toContain("background-size: 108% 100%;");
    expect(css).toContain("var(--color-spectral-red) 0 18%");
    expect(css).toContain("var(--color-spectral-green) 0 16%");
    expect(css).toContain("var(--color-spectral-blue) 0 18%");
    expect(css).toContain("ellipse 20% 48% at 7% 112%");
    expect(css).toContain("ellipse 24% 42% at 50% 116%");
    expect(css).toContain("ellipse 20% 48% at 93% 112%");
    expect(css).toContain("mask-composite: exclude;");
    expect(css).not.toMatch(/spectral-(?:orange|yellow|cyan|violet)/);
    expect(css).not.toMatch(/#(?:ff8a00|d9ff00|00e88f|00c8ff|5f55ff|ff2fad)/i);
    expect(css).toMatch(
      /@keyframes spectrumDrift\s*\{\s*from\s*\{[^}]*background-position:\s*48% 50%[^}]*\}\s*to\s*\{[^}]*background-position:\s*52% 50%/,
    );
  });

  it("uses a restrained lift and glow on hover", () => {
    const css = readFileSync(
      join(process.cwd(), "components/contact/SpectrumContactCta.module.css"),
      "utf8",
    );

    expect(css).toMatch(
      /@media \(hover:\s*hover\) and \(pointer:\s*fine\)[\s\S]*\.root:hover::before\s*\{[^}]*opacity:\s*0\.46[^}]*\}[\s\S]*\.root:hover::after\s*\{[^}]*opacity:\s*0\.12[^}]*\}[\s\S]*\.root:hover \.surface\s*\{[^}]*transform:\s*translate\(4px,\s*-3px\)/,
    );
    expect(css).toMatch(/\.root:hover \.surface::before\s*\{[^}]*opacity:\s*0\.72/);
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
