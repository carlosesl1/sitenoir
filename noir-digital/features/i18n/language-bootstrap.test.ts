import { runInNewContext } from "node:vm";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { languageBootstrapScript } from "./language-bootstrap";

beforeEach(() => {
  vi.useFakeTimers();
  window.localStorage.clear();
  delete document.documentElement.dataset["languagePending"];
  vi.spyOn(window.navigator, "languages", "get").mockReturnValue(["en-US"]);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  delete document.documentElement.dataset["languagePending"];
});

describe("language before first paint", () => {
  it("runs independently of the application bundle and holds the Portuguese fallback", () => {
    runInNewContext(languageBootstrapScript, { window, document });
    expect(document.documentElement.lang).toBe("en");
    expect(document.documentElement).toHaveAttribute("data-language-pending", "true");
    expect(window.localStorage.getItem("noir-language")).toBeNull();
  });

  it("leaves a manually selected Portuguese page immediately visible", () => {
    window.localStorage.setItem("noir-language", "pt");
    runInNewContext(languageBootstrapScript, { window, document });
    expect(document.documentElement.lang).toBe("pt-BR");
    expect(document.documentElement).not.toHaveAttribute("data-language-pending");
  });

  it("restores the static fallback if the application fails to load", () => {
    runInNewContext(languageBootstrapScript, { window, document });
    vi.advanceTimersByTime(8000);
    expect(document.documentElement.lang).toBe("pt-BR");
    expect(document.documentElement).not.toHaveAttribute("data-language-pending");
  });

  it("does not reset English once hydration has revealed it", () => {
    runInNewContext(languageBootstrapScript, { window, document });
    delete document.documentElement.dataset["languagePending"];
    vi.advanceTimersByTime(8000);
    expect(document.documentElement.lang).toBe("en");
  });
});
