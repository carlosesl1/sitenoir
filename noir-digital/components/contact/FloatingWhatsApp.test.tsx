import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
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
  vi.unstubAllGlobals();
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

it("yields to visible contact actions and returns after the last action leaves", () => {
  let notify: IntersectionObserverCallback = () => undefined;
  const disconnect = vi.fn();
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(callback: IntersectionObserverCallback) {
        notify = callback;
      }
      observe = vi.fn();
      disconnect = disconnect;
    },
  );
  const view = render(
    <>
      <a href="/contato" data-spectrum-contact-cta>
        Contact action
      </a>
      <button type="button" data-spectrum-contact-cta>
        Send message
      </button>
      <FloatingWhatsApp />
    </>,
  );
  const actions = view.container.querySelectorAll("[data-spectrum-contact-cta]");
  const update = (index: number, isIntersecting: boolean) => {
    act(() =>
      notify(
        [
          {
            target: actions[index],
            isIntersecting,
            intersectionRatio: isIntersecting ? 0.1 : 0,
          } as IntersectionObserverEntry,
        ],
        {} as IntersectionObserver,
      ),
    );
  };
  expect(view.container.querySelector("[data-floating-whatsapp]")).toBeInTheDocument();
  update(0, true);
  expect(view.container.querySelector("[data-floating-whatsapp]")).toBeNull();
  update(1, true);
  update(0, false);
  expect(view.container.querySelector("[data-floating-whatsapp]")).toBeNull();
  update(1, false);
  expect(screen.getByRole("link", { name: "Iniciar conversa no WhatsApp" })).toBeInTheDocument();
  view.unmount();
  expect(disconnect).toHaveBeenCalledOnce();
});
