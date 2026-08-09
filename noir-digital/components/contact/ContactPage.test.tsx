import { readFileSync } from "node:fs";
import { join } from "node:path";

import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ContactPage } from "@/components/contact/ContactPage";
import {
  contactEmail,
  contactPhoneDisplay,
  contactPhoneHref,
  contactWhatsAppHref,
} from "@/data/content";
import { ContactSubmissionError } from "@/features/contact/submit-contact";

const contactMocks = vi.hoisted(() => ({
  submitContact: vi.fn(),
}));

vi.mock("@/features/contact/submit-contact", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/features/contact/submit-contact")>();
  return { ...actual, submitContact: contactMocks.submitContact };
});

function fillRequiredFields() {
  fireEvent.change(screen.getByRole("textbox", { name: "Nome" }), {
    target: { value: "Ana" },
  });
  fireEvent.change(screen.getByRole("textbox", { name: "E-mail" }), {
    target: { value: "ana@empresa.com" },
  });
  fireEvent.change(screen.getByRole("combobox", { name: "Serviço de interesse" }), {
    target: { value: "Sites e experiências digitais" },
  });
  fireEvent.change(screen.getByRole("textbox", { name: "Mensagem" }), {
    target: { value: "Quero conversar sobre um novo site." },
  });
}

beforeEach(() => {
  contactMocks.submitContact.mockReset();
});

afterEach(cleanup);

describe("ContactPage", () => {
  it("sizes the long headline from the invitation column instead of the viewport", () => {
    const css = readFileSync(
      join(process.cwd(), "components/contact/ContactPage.module.css"),
      "utf8",
    );

    expect(css).toMatch(/\.intro\s*\{[^}]*container-type:\s*inline-size/);
    expect(css).toMatch(/\.intro h1\s*\{[^}]*font-size:\s*clamp\(1\.5rem, 13\.4cqi, 5\.2rem\)/);
    expect(css).toMatch(
      /@media \(max-width: 767px\)[\s\S]*\.intro h1\s*\{[^}]*font-size:\s*clamp\(2\.55rem, 11vw, 4\.4rem\)/,
    );
  });

  it("uses the same 24px mobile content axis as the home hero", () => {
    const css = readFileSync(
      join(process.cwd(), "components/contact/ContactPage.module.css"),
      "utf8",
    );

    expect(css).toMatch(
      /@media \(max-width: 767px\)[\s\S]*\.intro,[\s\S]*\.formPanel,[\s\S]*\.channels\s*\{[^}]*padding:\s*28px 8px 36px/,
    );
    expect(css).toMatch(
      /@media \(max-width: 767px\)[\s\S]*\.projectSection\s*\{[^}]*margin-right:\s*-8px[^}]*margin-left:\s*-8px[^}]*padding-right:\s*8px[^}]*padding-left:\s*8px/,
    );
  });

  it("uses TikTok Sans for the highlighted contact copy", () => {
    const css = readFileSync(
      join(process.cwd(), "components/contact/ContactPage.module.css"),
      "utf8",
    );

    expect(css).toMatch(/\.intro > p\s*\{[^}]*font-family:\s*var\(--font-display\)/);
    expect(css).toMatch(/\.privacyNote\s*\{[^}]*font-family:\s*var\(--font-display\)/);
    expect(css).toMatch(/\.information dd\s*\{[^}]*font-family:\s*var\(--font-display\)/);
    expect(css).toMatch(/\.internationalTag\s*\{[^}]*font-family:\s*var\(--font-display\)/);
    expect(css).toMatch(/\.internationalTag\s*\{[^}]*min-height:\s*62px/);
    expect(css).toMatch(/\.globalIcon\s*\{[^}]*width:\s*144px[^}]*mask-image:\s*radial-gradient/);
    expect(css).toMatch(/\.recommended\s*\{[^}]*font-family:\s*var\(--font-display\)/);
    expect(css).toMatch(/\.whatsAppSubtitle\s*\{[^}]*font-family:\s*var\(--font-display\)/);
    expect(css).toMatch(/\.whatsAppPanel > p\s*\{[^}]*font-family:\s*var\(--font-display\)/);
    expect(css).toMatch(
      /\.whatsAppPanel > p\s*\{[^}]*max-width:\s*min\(24ch, calc\(100% - var\(--whatsapp-mark-size\) - 12px\)\)/,
    );
    expect(css).toMatch(
      /\.whatsAppPanel h3\s*\{[^}]*font-size:\s*clamp\(2rem, 9\.5cqi, 2\.65rem\)/,
    );
    expect(css).toMatch(
      /\.whatsAppActionSurface\s*\{[^}]*font-size:\s*clamp\(0\.625rem, 0\.42rem \+ 1\.1cqi, 0\.875rem\)/,
    );
    expect(css).toMatch(/\.whatsAppActionSurface\s*\{[^}]*white-space:\s*nowrap/);
  });

  it("renders the real contact contract and alternate channels", () => {
    const view = render(<ContactPage />);
    const form = screen.getByRole("form", { name: "Dados do projeto" });

    expect(screen.getByText("AGÊNCIA DE ESTRUTURA DIGITAL")).toBeInTheDocument();
    expect(screen.queryByText("ESTÚDIO DE ESTRUTURA DIGITAL")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "VAMOS CRIAR ALGO EXCEPCIONAL JUNTOS.",
    );
    for (const label of ["Nome", "E-mail", "Serviço de interesse", "Mensagem"]) {
      expect(within(form).getByLabelText(label)).toBeRequired();
    }
    expect(within(form).getByLabelText("Sobrenome")).not.toBeRequired();
    expect(within(form).getByLabelText("Empresa")).not.toBeRequired();
    expect(within(form).getByLabelText("Telefone")).not.toBeRequired();

    const honeypot = view.container.querySelector<HTMLInputElement>('input[name="website"]');
    expect(honeypot).toHaveAttribute("tabindex", "-1");
    expect(honeypot).toHaveAttribute("autocomplete", "off");

    expect(screen.getByRole("link", { name: "Iniciar conversa no WhatsApp" })).toHaveAttribute(
      "href",
      contactWhatsAppHref,
    );
    expect(screen.getByRole("link", { name: contactEmail })).toHaveAttribute(
      "href",
      `mailto:${contactEmail}`,
    );
    expect(screen.getByRole("link", { name: contactPhoneDisplay })).toHaveAttribute(
      "href",
      contactPhoneHref,
    );

    expect(view.container.querySelector("[data-contact-select-icon]")).toBeInTheDocument();
    expect(view.container.querySelector("[data-contact-whatsapp-icon]")).toBeInTheDocument();
    expect(view.container.querySelectorAll("[data-contact-cta-icon]")).toHaveLength(2);
    expect(view.container.querySelectorAll('[data-spectrum-contact-cta="true"]')).toHaveLength(2);
    expect(view.container.querySelectorAll("[data-spectrum-contact-surface]")).toHaveLength(2);
    expect(view.container.querySelector("[data-contact-privacy-icon]")).toBeInTheDocument();
    expect(view.container.querySelector("[data-contact-global-icon]")).toBeInTheDocument();
    expect(screen.queryByText("↗")).not.toBeInTheDocument();

    const information = screen.getByRole("region", { name: "INFORMAÇÕES" });
    expect(within(information).getByText("Telefone")).toBeInTheDocument();
    expect(within(information).getByText("Horário de atendimento")).toBeInTheDocument();
    expect(within(information).getByText("Seg - Sex, 09h às 18h")).toBeInTheDocument();
    expect(within(information).queryByText("Localização")).not.toBeInTheDocument();
    expect(within(information).queryByText("Fortaleza - CE / Brasil")).not.toBeInTheDocument();
    expect(screen.getByText("Seus dados estão protegidos.")).toBeInTheDocument();
    expect(screen.getByText("Não compartilhamos suas informações.")).toBeInTheDocument();
    expect(screen.getByText("Atendemos projetos em todo o Brasil")).toBeInTheDocument();
    expect(screen.getByText("e também internacionalmente.")).toBeInTheDocument();
    expect(screen.queryByText(/usados apenas para responder ao contato/i)).not.toBeInTheDocument();
  });

  it("submits JSON once while loading and includes page provenance", async () => {
    let resolveRequest:
      | ((value: { ok: true; message: string; leadId: number }) => void)
      | undefined;
    contactMocks.submitContact.mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve;
      }),
    );
    render(<ContactPage />);
    fillRequiredFields();
    const form = screen.getByRole("form", { name: "Dados do projeto" });

    fireEvent.submit(form);
    fireEvent.submit(form);

    expect(contactMocks.submitContact).toHaveBeenCalledOnce();
    expect(contactMocks.submitContact).toHaveBeenCalledWith(
      expect.objectContaining({
        firstName: "Ana",
        email: "ana@empresa.com",
        service: "Sites e experiências digitais",
        message: "Quero conversar sobre um novo site.",
        website: "",
        pageUrl: expect.stringContaining("http"),
        source: "Formulário de contato",
      }),
    );
    expect(screen.getByRole("button", { name: "Enviando mensagem" })).toBeDisabled();

    await act(async () => {
      resolveRequest?.({ ok: true, message: "Mensagem recebida com sucesso.", leadId: 123 });
    });
  });

  it("clears the form only after a real success", async () => {
    contactMocks.submitContact.mockResolvedValue({
      ok: true,
      leadId: 123,
      message: "Mensagem recebida com sucesso.",
    });
    render(<ContactPage />);
    fillRequiredFields();

    fireEvent.submit(screen.getByRole("form", { name: "Dados do projeto" }));

    expect(await screen.findByRole("status")).toHaveTextContent("Mensagem recebida com sucesso.");
    expect(screen.getByRole("textbox", { name: "Nome" })).toHaveValue("");
    expect(screen.getByRole("textbox", { name: "Mensagem" })).toHaveValue("");
  });

  it.each([
    [400, "Confira os campos informados."],
    [429, "Muitas tentativas em pouco tempo. Tente novamente mais tarde."],
    [500, "A mensagem foi registrada, mas a notificação por e-mail não foi enviada."],
  ])("preserves entered data for HTTP %i feedback", async (status, message) => {
    contactMocks.submitContact.mockRejectedValue(
      new ContactSubmissionError(message, status, status === 500 ? 123 : undefined),
    );
    render(<ContactPage />);
    fillRequiredFields();

    fireEvent.submit(screen.getByRole("form", { name: "Dados do projeto" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(message);
    expect(screen.getByRole("textbox", { name: "Nome" })).toHaveValue("Ana");
    expect(screen.getByRole("textbox", { name: "Mensagem" })).toHaveValue(
      "Quero conversar sobre um novo site.",
    );
    expect(screen.getByRole("button", { name: "Enviar mensagem" })).toBeEnabled();
  });
});
