import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { initializeTheme, themeBootstrapScript } from "@/features/theme/theme-bootstrap";

beforeEach(() => {
  localStorage.clear();
  document.documentElement.className = "dark";
  document.documentElement.dataset["theme"] = "dark";
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("initializeTheme", () => {
  it("applies a persisted explicit theme before hydration", () => {
    localStorage.setItem("theme", "light");
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({ matches: true })),
    );

    initializeTheme();

    expect(document.documentElement).toHaveClass("light");
    expect(document.documentElement).not.toHaveClass("dark");
    expect(document.documentElement).toHaveAttribute("data-theme", "light");
  });

  it("resolves system mode from the current media preference", () => {
    localStorage.setItem("theme", "system");
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({ matches: false })),
    );

    initializeTheme();

    expect(document.documentElement).toHaveClass("light");
  });

  it("exports an inline bootstrap containing the initializer", () => {
    expect(themeBootstrapScript).toContain("localStorage");
    expect(themeBootstrapScript).toContain("prefers-color-scheme");
    expect(themeBootstrapScript).toContain("documentElement");
  });
});
