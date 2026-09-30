import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LanguageButton } from "@/components/controls/LanguageButton";
import { LANGUAGE_STORAGE_KEY, LanguageProvider, useLanguage } from "./LanguageProvider";

function Example() {
  const { t } = useLanguage();
  return (
    <>
      <LanguageButton />
      <p>{t("Serviços")}</p>
    </>
  );
}

beforeEach(() => {
  window.localStorage.clear();
  vi.spyOn(window.navigator, "languages", "get").mockReturnValue(["pt-BR"]);
  vi.spyOn(window.navigator, "language", "get").mockReturnValue("pt-BR");
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("language preference", () => {
  it("opens in English on a first visit from an English browser without saving an override", () => {
    vi.spyOn(window.navigator, "languages", "get").mockReturnValue(["en-GB", "pt-BR"]);
    render(
      <LanguageProvider>
        <Example />
      </LanguageProvider>,
    );
    expect(screen.getByText("Services")).toBeInTheDocument();
    expect(document.documentElement.lang).toBe("en");
    expect(window.localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBeNull();
  });

  it("honors an explicit Portuguese preference in an English browser", () => {
    vi.spyOn(window.navigator, "languages", "get").mockReturnValue(["en-US"]);
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, "pt");
    render(
      <LanguageProvider>
        <Example />
      </LanguageProvider>,
    );
    expect(screen.getByText("Serviços")).toBeInTheDocument();
    expect(document.documentElement.lang).toBe("pt-BR");
  });

  it.each([
    [["en-US"], "Services"],
    [["pt-PT", "en-US"], "Serviços"],
    [["es-ES", "en-GB"], "Services"],
    [["fr-FR", "de-DE"], "Serviços"],
    [["EN-au"], "Services"],
  ])("uses the ordered browser preference %j", (languages, text) => {
    vi.spyOn(window.navigator, "languages", "get").mockReturnValue(languages);
    render(
      <LanguageProvider>
        <Example />
      </LanguageProvider>,
    );
    expect(screen.getByText(text)).toBeInTheDocument();
  });

  it("falls back to navigator.language and ignores invalid saved values", () => {
    vi.spyOn(window.navigator, "languages", "get").mockReturnValue([]);
    vi.spyOn(window.navigator, "language", "get").mockReturnValue("en-CA");
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, "invalid");
    render(
      <LanguageProvider>
        <Example />
      </LanguageProvider>,
    );
    expect(screen.getByText("Services")).toBeInTheDocument();
  });

  it("detects English even when local storage cannot be read", () => {
    vi.spyOn(window.navigator, "languages", "get").mockReturnValue(["en-US"]);
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    render(
      <LanguageProvider>
        <Example />
      </LanguageProvider>,
    );
    expect(screen.getByText("Services")).toBeInTheDocument();
  });

  it("returns to the browser language when another tab removes the manual preference", () => {
    vi.spyOn(window.navigator, "languages", "get").mockReturnValue(["en-US"]);
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, "pt");
    render(
      <LanguageProvider>
        <Example />
      </LanguageProvider>,
    );
    expect(screen.getByText("Serviços")).toBeInTheDocument();
    act(() =>
      window.dispatchEvent(
        new StorageEvent("storage", { key: LANGUAGE_STORAGE_KEY, newValue: null }),
      ),
    );
    expect(screen.getByText("Services")).toBeInTheDocument();
  });

  it("hydrates the static Portuguese HTML into English before revealing it", async () => {
    vi.spyOn(window.navigator, "languages", "get").mockReturnValue(["en-US"]);
    const component = (
      <LanguageProvider>
        <Example />
      </LanguageProvider>
    );
    const container = document.createElement("div");
    container.innerHTML = renderToString(component);
    expect(container.textContent).toContain("Serviços");
    document.body.append(container);
    document.documentElement.dataset["languagePending"] = "true";
    const onRecoverableError = vi.fn();
    const root = await act(async () => hydrateRoot(container, component, { onRecoverableError }));
    expect(container.textContent).toContain("Services");
    expect(document.documentElement.lang).toBe("en");
    expect(document.documentElement).not.toHaveAttribute("data-language-pending");
    expect(onRecoverableError).not.toHaveBeenCalled();
    await act(async () => root.unmount());
    container.remove();
  });

  it("defaults to Portuguese, switches both ways and updates document language", () => {
    render(
      <LanguageProvider>
        <Example />
      </LanguageProvider>,
    );
    expect(screen.getByText("Serviços")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Switch to English" }));
    expect(screen.getByText("Services")).toBeInTheDocument();
    expect(document.documentElement.lang).toBe("en");
    expect(window.localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe("en");
    fireEvent.click(screen.getByRole("button", { name: "Mudar para português" }));
    expect(screen.getByText("Serviços")).toBeInTheDocument();
    expect(document.documentElement.lang).toBe("pt-BR");
  });

  it("restores English when another page mounts", () => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, "en");
    const view = render(
      <LanguageProvider>
        <Example />
      </LanguageProvider>,
    );
    expect(screen.getByText("Services")).toBeInTheDocument();
    view.unmount();
    render(
      <LanguageProvider>
        <Example />
      </LanguageProvider>,
    );
    expect(screen.getByText("Services")).toBeInTheDocument();
  });

  it("remains usable when browser storage is unavailable", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    render(
      <LanguageProvider>
        <Example />
      </LanguageProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Switch to English" }));
    expect(screen.getByText("Services")).toBeInTheDocument();
  });

  it("synchronizes changes from another tab", () => {
    render(
      <LanguageProvider>
        <Example />
      </LanguageProvider>,
    );
    act(() =>
      window.dispatchEvent(
        new StorageEvent("storage", { key: LANGUAGE_STORAGE_KEY, newValue: "en" }),
      ),
    );
    expect(screen.getByText("Services")).toBeInTheDocument();
  });
});
