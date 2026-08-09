import { readFileSync } from "node:fs";
import { join } from "node:path";

import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ContactFooter } from "@/components/contact/ContactFooter";
import {
  contactEmail,
  contactHeadlineLines,
  contactPhoneDisplay,
  contactPhoneHref,
  socialLinks,
} from "@/data/content";

afterEach(cleanup);

describe("ContactFooter", () => {
  it("renders the exact three-line contact headline", () => {
    render(<ContactFooter />);
    const heading = screen.getByRole("heading", { level: 2 });

    expect(contactHeadlineLines).toEqual(["O PRÓXIMO PASSO", "DO SEU NEGÓCIO", "COMEÇA AQUI."]);

    for (const line of contactHeadlineLines) {
      expect(within(heading).getByText(line)).toBeInTheDocument();
    }
  });

  it("uses the theme-aware primary text color for the contact headline", () => {
    const css = readFileSync(
      join(process.cwd(), "components/contact/ContactFooter.module.css"),
      "utf8",
    );

    expect(css).toMatch(/\.headline\s*\{[^}]*color:\s*var\(--text-primary\)/);
    expect(css).not.toMatch(/\.headline\s*\{[^}]*color:\s*var\(--color-noir-warm-white\)/);
  });

  it("preserves the email action, approved social links, and the 3D anchor", () => {
    const view = render(<ContactFooter />);

    const contactCta = screen.getByRole("link", { name: "Entrar em contato" });
    expect(contactCta).toHaveAttribute("href", "/contato");

    expect(screen.getByRole("link", { name: contactEmail })).toHaveAttribute(
      "href",
      `mailto:${contactEmail}`,
    );
    expect(screen.getByRole("link", { name: contactPhoneDisplay })).toHaveAttribute(
      "href",
      contactPhoneHref,
    );
    for (const social of socialLinks) {
      expect(screen.getByRole("link", { name: social.label })).toHaveAttribute("href", social.href);
    }

    const brandSymbol = view.container.querySelector('img[src*="noir-symbol.svg"]');
    const brandWordmark = view.container.querySelector('img[src*="noir-wordmark.svg"]');
    expect(brandSymbol).toHaveAttribute("aria-hidden", "true");
    expect(brandWordmark).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("AGÊNCIA DE ESTRUTURA DIGITAL")).toBeInTheDocument();
    expect(screen.queryByText("ESTÚDIO DE ESTRUTURA DIGITAL")).not.toBeInTheDocument();
    expect(view.container.querySelector('[data-footer-brand-name-row="true"]')).toBeInTheDocument();
    expect(view.container.querySelector('img[src*="noir-face.png"]')).not.toBeInTheDocument();

    const css = readFileSync(
      join(process.cwd(), "components/contact/ContactFooter.module.css"),
      "utf8",
    );
    expect(css).toContain(':global([data-theme="light"]) .brandSymbol');
    expect(css).toContain(':global([data-theme="light"]) .brandWordmark');
    expect(css).toMatch(/--brand-name-height:\s*clamp\(/);
    expect(css).toMatch(/--brand-symbol-height:\s*calc\(var\(--brand-name-height\)\s*\*\s*1\.2\)/);
    expect(css).toMatch(/\.brandSymbol\s*\{[^}]*height:\s*var\(--brand-symbol-height\)/);
    expect(css).toMatch(/\.brandWordmark\s*\{[^}]*height:\s*var\(--brand-name-height\)/);
    expect(css).toMatch(
      /@media \(max-width:\s*767px\)[\s\S]*\.contactCell\s*\{[^}]*grid-column:\s*1\s*\/\s*-1/,
    );
    expect(css).toMatch(
      /@media \(max-width:\s*767px\)[\s\S]*\.linksCell\s*\{[^}]*grid-column:\s*span 1/,
    );

    expect(view.container.querySelector("#contact")).toBeInTheDocument();
    expect(view.container.querySelector('[data-scene-anchor="contact"]')).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("renders the editorial information footer and internal routes", () => {
    render(<ContactFooter />);

    expect(screen.getByText("DO ESCURO, HÁ IDEIAS QUE MARCAM.")).toBeInTheDocument();
    expect(
      screen.getByText("© NOIR DIGITAL 2026. TODOS OS DIREITOS RESERVADOS."),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Contato" })).toHaveAttribute("href", "/contato");
    expect(screen.getByRole("link", { name: "Serviços" })).toHaveAttribute(
      "href",
      "/#selected-work",
    );

    const privacyLinks = screen.getAllByRole("link", { name: "Privacidade" });
    const termsLinks = screen.getAllByRole("link", { name: "Termos" });

    expect(privacyLinks).toHaveLength(1);
    expect(termsLinks).toHaveLength(1);
    for (const link of privacyLinks) {
      expect(link).toHaveAttribute("href", "/privacidade");
    }
    for (const link of termsLinks) {
      expect(link).toHaveAttribute("href", "/termos");
    }
  });
});
