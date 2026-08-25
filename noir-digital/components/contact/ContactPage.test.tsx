import { readFileSync } from "node:fs";
import { join } from "node:path";

import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
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

afterEach(() => {
  cleanup();
  window.history.replaceState({}, "", "/");
});

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
    expect(css).toMatch(/\.intro h1\s*\{[^}]*letter-spacing:\s*var\(--tracking-display\)/);
    expect(css).toMatch(
      /\.field input,[\s\S]*\.field select,[\s\S]*\.field textarea\s*\{[^}]*font-size:\s*1rem/,
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

  it("places the full WhatsApp card and brand before the form on mobile", () => {
    const view = render(<ContactPage />);
    const mobilePanel = view.container.querySelector('[data-contact-whatsapp-panel="mobile"]');
    const desktopPanel = view.container.querySelector('[data-contact-whatsapp-panel="desktop"]');
    const brand = view.container.querySelector("[data-contact-brand-lockup]");
    const formPanel = view.container.querySelector("[data-contact-form-panel]");
    const css = readFileSync(
      join(process.cwd(), "components/contact/ContactPage.module.css"),
      "utf8",
    );

    if (!mobilePanel || !desktopPanel || !brand || !formPanel) {
      throw new Error("Expected contact mobile ordering hooks to be rendered.");
    }

    expect(mobilePanel).toBeInTheDocument();
    expect(desktopPanel).toBeInTheDocument();
    expect(brand).toBeInTheDocument();
    expect(formPanel).toBeInTheDocument();
    expect(
      mobilePanel.compareDocumentPosition(brand) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      brand.compareDocumentPosition(formPanel) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      view.container.querySelector('[aria-label="Conversar agora pelo WhatsApp"]'),
    ).not.toBeInTheDocument();
    expect(css).toMatch(/\.mobileWhatsAppPanel\s*\{[^}]*display:\s*none/);
    expect(css).toMatch(
      /@media \(max-width: 767px\)[\s\S]*\.mobileWhatsAppPanel\s*\{[^}]*display:\s*grid/,
    );
    expect(css).toMatch(
      /@media \(max-width: 767px\)[\s\S]*\.desktopWhatsAppPanel\s*\{[^}]*display:\s*none/,
    );
    expect(css).toMatch(
      /@media \(max-width: 767px\)[\s\S]*\.channels > \.panelHeading\s*\{[^}]*display:\s*none/,
    );
  });

  it("presents the WhatsApp mark as a standalone balanced icon", () => {
    const css = readFileSync(
      join(process.cwd(), "components/contact/ContactPage.module.css"),
      "utf8",
    );

    expect(css).toMatch(
      /\.whatsAppPanel\s*\{[^}]*--whatsapp-mark-size:\s*clamp\(54px, 14cqi, 68px\)/,
    );
    expect(css).toMatch(
      /\.whatsAppMark\s*\{[^}]*top:\s*35%[^}]*right:\s*clamp\(52px, 12cqi, 68px\)[^}]*border:\s*0[^}]*border-radius:\s*0[^}]*background:\s*none[^}]*box-shadow:\s*none[^}]*transform:\s*translateY\(-50%\)/,
    );
    expect(css).toMatch(/\.whatsAppMark svg\s*\{[^}]*width:\s*100%[^}]*height:\s*100%/);
    expect(css).not.toMatch(/@media \(max-width: 767px\)[\s\S]*\.whatsAppMark\s*\{/);
  });

  it("uses the same brand lockup anatomy and proportions as the home footer", () => {
    const view = render(<ContactPage />);
    const brand = view.container.querySelector("[data-contact-brand-lockup]");
    const nameRow = brand?.querySelector("[data-contact-brand-name-row]");
    const tagline = brand?.querySelector("[data-contact-brand-tagline]");
    const css = readFileSync(
      join(process.cwd(), "components/contact/ContactPage.module.css"),
      "utf8",
    );

    expect(nameRow?.querySelector('img[src*="noir-symbol.svg"]')).toBeInTheDocument();
    expect(nameRow?.querySelector('img[src*="noir-wordmark.svg"]')).toBeInTheDocument();
    expect(tagline).toHaveTextContent("AGÊNCIA DE ESTRUTURA DIGITAL");
    expect(css).toMatch(
      /\.brandLockup\s*\{[^}]*--brand-name-height:\s*clamp\(1\.75rem, 2vw, 2rem\)[^}]*--brand-symbol-height:\s*calc\(var\(--brand-name-height\) \* 1\.2\)/,
    );
    expect(css).toMatch(
      /\.brandNameRow\s*\{[^}]*display:\s*flex[^}]*align-items:\s*center[^}]*gap:\s*clamp\(10px, 1vw, 14px\)/,
    );
    expect(css).toMatch(/\.brandSymbol\s*\{[^}]*height:\s*var\(--brand-symbol-height\)/);
    expect(css).toMatch(/\.brandWordmark\s*\{[^}]*height:\s*var\(--brand-name-height\)/);
    expect(css).toMatch(/\.brandTagline\s*\{[^}]*max-width:\s*27ch/);
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
    expect(css).toMatch(
      /\.globalIcon\s*\{[^}]*right:\s*6px[^}]*bottom:\s*-26px[^}]*width:\s*132px[^}]*height:\s*auto[^}]*object-fit:\s*contain[^}]*opacity:\s*0\.58/,
    );
    expect(css).not.toMatch(/\.globalIcon\s*\{[^}]*mask-image:\s*radial-gradient/);
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
      /\.whatsAppActionSurface\s*\{[^}]*font-size:\s*clamp\(0\.6875rem, 0\.5rem \+ 1cqi, 0\.875rem\)/,
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
    expect(screen.getByRole("link", { name: "Política de privacidade" })).toHaveAttribute(
      "href",
      "/privacidade",
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
    expect(view.container.querySelectorAll("[data-contact-whatsapp-icon]")).toHaveLength(2);
    expect(view.container.querySelectorAll("[data-contact-cta-icon]")).toHaveLength(3);
    expect(view.container.querySelectorAll('[data-spectrum-contact-cta="true"]')).toHaveLength(3);
    expect(view.container.querySelectorAll("[data-spectrum-contact-surface]")).toHaveLength(3);
    expect(view.container.querySelector("[data-contact-privacy-icon]")).toBeInTheDocument();
    const globalImage = view.container.querySelector("img[data-contact-global-image]");
    expect(globalImage).toBeInTheDocument();
    expect(globalImage?.getAttribute("src")).toContain(
      "%2Fassets%2Fv1%2Ftextures%2Fcontact-globe.webp",
    );
    expect(globalImage).toHaveAttribute("width", "181");
    expect(globalImage).toHaveAttribute("height", "141");
    expect(globalImage).toHaveAttribute("alt", "");
    expect(view.container.querySelector("[data-contact-global-icon]")).not.toBeInTheDocument();
    expect(screen.queryByText("↗")).not.toBeInTheDocument();

    const information = screen.getByRole("region", { name: "INFORMAÇÕES" });
    expect(within(information).getByText("Telefone")).toBeInTheDocument();
    expect(within(information).getByText("Horário de atendimento")).toBeInTheDocument();
    expect(within(information).getByText("Seg - Sex, 09h às 18h")).toBeInTheDocument();
    expect(within(information).queryByText("Localização")).not.toBeInTheDocument();
    expect(within(information).queryByText("Fortaleza - CE / Brasil")).not.toBeInTheDocument();
    expect(screen.getByText("Seus dados estão protegidos.")).toBeInTheDocument();
    expect(screen.getByText(/Não compartilhamos suas informações/)).toBeInTheDocument();
    expect(screen.getByText("Atendemos projetos em todo o Brasil")).toBeInTheDocument();
    expect(screen.getByText("e também internacionalmente.")).toBeInTheDocument();
    expect(screen.queryByText(/usados apenas para responder ao contato/i)).not.toBeInTheDocument();
  });

  it("preselects a valid service carried from a case CTA", async () => {
    window.history.replaceState(
      {},
      "",
      "/contato?service=Sites%20e%20experi%C3%AAncias%20digitais&case=together-site",
    );

    render(<ContactPage />);

    await waitFor(() =>
      expect(screen.getByRole("combobox", { name: "Serviço de interesse" })).toHaveValue(
        "Sites e experiências digitais",
      ),
    );
  });

  it("ignores an unknown service in the URL", async () => {
    window.history.replaceState({}, "", "/contato?service=produto-inexistente");

    render(<ContactPage />);

    await waitFor(() =>
      expect(screen.getByRole("combobox", { name: "Serviço de interesse" })).toHaveValue(""),
    );
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
