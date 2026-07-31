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

  it("loops the spectrum glow seamlessly toward the right", () => {
    const css = readFileSync(
      join(process.cwd(), "components/contact/SpectrumContactCta.module.css"),
      "utf8",
    );

    expect(css).toContain("animation: spectrumShift 1.8s linear infinite;");
    expect(css).not.toContain("infinite alternate");
    expect(css).toContain("background: repeating-linear-gradient(");
    expect(css).toContain("background-size: 200% 100%;");
    expect(css).toContain("#ff334f 50%");
    expect(css).toMatch(
      /@keyframes spectrumShift\s*\{\s*from\s*\{[^}]*background-position:\s*100% 50%[^}]*\}\s*to\s*\{[^}]*background-position:\s*0% 50%/,
    );
  });

  it("uses a restrained lift and glow on hover", () => {
    const css = readFileSync(
      join(process.cwd(), "components/contact/SpectrumContactCta.module.css"),
      "utf8",
    );

    expect(css).toMatch(
      /@media \(hover:\s*hover\) and \(pointer:\s*fine\)[\s\S]*\.root:hover::before\s*\{[^}]*opacity:\s*0\.72[^}]*\}[\s\S]*\.root:hover::after\s*\{[^}]*opacity:\s*0\.32[^}]*\}[\s\S]*\.root:hover \.surface\s*\{[^}]*transform:\s*translate\(8px,\s*-6px\)/,
    );
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
