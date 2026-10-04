import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LanguageButton } from "@/components/controls/LanguageButton";
import { contactWhatsAppHref } from "@/data/content";
import { LanguageProvider } from "@/features/i18n/LanguageProvider";
import { FloatingWhatsApp } from "./FloatingWhatsApp";

beforeEach(() => {
  window.localStorage.clear();
  vi.spyOn(window.navigator, "languages", "get").mockReturnValue(["pt-BR"]);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("FloatingWhatsApp", () => {
  it("opens the configured contact with the existing message in a separate tab", () => {
    render(<FloatingWhatsApp />);
    const link = screen.getByRole("link", { name: "Iniciar conversa no WhatsApp" });
    const destination = new URL(link.getAttribute("href") ?? "");
    const configured = new URL(contactWhatsAppHref);

    expect(destination.origin + destination.pathname).toBe(configured.origin + configured.pathname);
    expect(destination.searchParams.get("text")).toBe(configured.searchParams.get("text"));
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("translates both the accessible name and the prefilled message", () => {
    render(
      <LanguageProvider>
        <LanguageButton />
        <FloatingWhatsApp />
      </LanguageProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Switch to English" }));

    const link = screen.getByRole("link", { name: "Start a WhatsApp chat" });
    expect(new URL(link.getAttribute("href") ?? "").searchParams.get("text")).toBe(
      "Hello! I found NOIR Digital through your website and would like to discuss a project.",
    );
  });

  it("removes the link from the focus order while hidden", () => {
    const { rerender } = render(<FloatingWhatsApp hidden />);
    expect(screen.queryByRole("link", { hidden: true })).not.toBeInTheDocument();

    rerender(<FloatingWhatsApp hidden={false} />);
    expect(screen.getByRole("link", { name: "Iniciar conversa no WhatsApp" })).toBeInTheDocument();
  });
});
