import { readFileSync } from "node:fs";
import { join } from "node:path";

import { act, cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { HeroScrambleText } from "@/components/hero/HeroScrambleText";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("HeroScrambleText", () => {
  it("keeps waiting copy visually concealed until the decoder starts", () => {
    const css = readFileSync(
      join(process.cwd(), "components/hero/HeroScrambleText.module.css"),
      "utf8",
    );

    expect(css).toMatch(/\.root\[data-scramble-state="waiting"\]\s*\{[^}]*color:\s*transparent/);
  });

  it("only creates glyph spans while the decoder is running", () => {
    vi.useFakeTimers();

    const view = render(
      <HeroScrambleText
        active={false}
        letterDelayMs={80}
        reducedMotion={false}
        startDelayMs={300}
        text="Teste"
      />,
    );

    const root = view.container.querySelector<HTMLElement>("[data-hero-scramble]");
    expect(root).toHaveAttribute("data-scramble-state", "waiting");
    expect(root).toHaveTextContent("Teste");
    expect(root?.childElementCount).toBe(0);
    expect(view.container.querySelector("[data-scramble-measure='true']")).not.toBeInTheDocument();
    expect(view.container.querySelector("[data-scramble-visual='true']")).not.toBeInTheDocument();
    expect(view.container.querySelectorAll("[data-scramble-glyph]")).toHaveLength(0);

    view.rerender(
      <HeroScrambleText
        active
        letterDelayMs={80}
        reducedMotion={false}
        startDelayMs={300}
        text="Teste"
      />,
    );
    expect(root).toHaveAttribute("data-scramble-state", "running");
    expect(view.container.querySelector("[data-scramble-measure='true']")).toBeInTheDocument();
    expect(view.container.querySelector("[data-scramble-visual='true']")).toBeInTheDocument();
    expect(view.container.querySelectorAll("[data-scramble-glyph]")).toHaveLength(5);

    act(() => vi.advanceTimersByTime(1_000));

    expect(root).toHaveAttribute("data-scramble-state", "settled");
    expect(root).toHaveTextContent("Teste");
    expect(root?.childElementCount).toBe(0);
    expect(view.container.querySelector("[data-scramble-measure='true']")).not.toBeInTheDocument();
    expect(view.container.querySelector("[data-scramble-visual='true']")).not.toBeInTheDocument();
    expect(view.container.querySelectorAll("[data-scramble-glyph]")).toHaveLength(0);
  });

  it("renders plain text immediately when reduced motion is enabled", () => {
    const view = render(
      <HeroScrambleText
        active={false}
        letterDelayMs={80}
        reducedMotion
        startDelayMs={300}
        text="Teste"
      />,
    );

    const root = view.container.querySelector<HTMLElement>("[data-hero-scramble]");
    expect(root).toHaveAttribute("data-scramble-state", "settled");
    expect(root).toHaveTextContent("Teste");
    expect(root?.childElementCount).toBe(0);
  });
});
