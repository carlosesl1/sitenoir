import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LazySiteCanvas } from "@/scene/LazySiteCanvas";

describe("LazySiteCanvas", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    window.history.replaceState({}, "", "/");
  });

  it("renders the exact responsive hero poster and grid while WebGL is unavailable", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);

    const view = render(<LazySiteCanvas waitForEntryReveal />);

    expect(view.container.querySelector('[data-hero-poster="true"]')).toHaveAttribute(
      "data-canvas-ready",
      "false",
    );
    expect(view.container.querySelector('[data-site-grid="true"]')).toBeInTheDocument();
    expect(view.container.querySelector('[data-site-canvas="true"]')).not.toBeInTheDocument();

    const css = readFileSync(join(process.cwd(), "scene/LazySiteCanvas.module.css"), "utf8");
    for (const poster of [
      "desktop-dark.webp",
      "desktop-light.webp",
      "mobile-dark.webp",
      "mobile-light.webp",
    ]) {
      expect(css).toContain(`/assets/v1/hero-posters/${poster}`);
    }
  });

  it("keeps the poster decorative and outside the accessibility tree", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);

    render(<LazySiteCanvas />);

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
