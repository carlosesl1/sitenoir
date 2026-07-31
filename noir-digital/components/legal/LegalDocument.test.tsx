import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { LegalDocument } from "@/components/legal/LegalDocument";
import { privacyPolicy, termsOfUse } from "@/data/legal-documents";

afterEach(cleanup);

describe("LegalDocument", () => {
  it("renders the complete privacy policy with semantic section headings", () => {
    render(<LegalDocument document={privacyPolicy} />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Política de Privacidade" }),
    ).toBeVisible();
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(13);
    expect(screen.getByText("31 de julho de 2026")).toBeVisible();
    expect(screen.getByText("A NOIR Digital não comercializa dados pessoais.")).toBeVisible();
    expect(screen.getByRole("link", { name: "Termos de Uso" })).toHaveAttribute("href", "/termos");
  });

  it("renders the complete terms and links the privacy policy inside the document", () => {
    render(<LegalDocument document={termsOfUse} />);

    expect(screen.getByRole("heading", { level: 1, name: "Termos de Uso" })).toBeVisible();
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(12);
    expect(
      screen.getByText(
        "Fica eleito o foro da comarca do domicílio do consumidor, quando aplicável, ou outro competente nos termos da legislação brasileira para dirimir eventuais controvérsias decorrentes destes Termos.",
      ),
    ).toBeVisible();
    expect(
      screen.getByRole("link", { name: "Política de Privacidade da NOIR Digital" }),
    ).toHaveAttribute("href", "/privacidade");
  });

  it("uses the original NOIR brand assets in the legal footer", () => {
    const view = render(<LegalDocument document={privacyPolicy} />);

    expect(view.container.querySelector('img[src*="noir-symbol.svg"]')).toBeInTheDocument();
    expect(view.container.querySelector('img[src*="noir-wordmark.svg"]')).toBeInTheDocument();
  });
});
