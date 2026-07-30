import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PrinciplesStory } from "@/components/principles/PrinciplesStory";
import { principleStages, principleStatements } from "@/data/content";
import {
  PrincipleSceneProvider,
  usePrincipleScene,
} from "@/features/principles/PrincipleSceneProvider";

let reducedMotion = false;

vi.mock("motion/react", () => ({
  useReducedMotion: () => reducedMotion,
}));

afterEach(() => {
  cleanup();
  reducedMotion = false;
});

describe("PrinciplesStory", () => {
  it("publishes its measured section rect for the WebGL scene", () => {
    const sceneRef: { current: ReturnType<typeof usePrincipleScene> | null } = { current: null };
    function SceneProbe() {
      sceneRef.current = usePrincipleScene();
      return null;
    }

    const view = render(
      <PrincipleSceneProvider>
        <PrinciplesStory />
        <SceneProbe />
      </PrincipleSceneProvider>,
    );
    const story = view.container.querySelector<HTMLElement>("#principles");
    expect(story).not.toBeNull();
    if (story) {
      story.getBoundingClientRect = () => ({ top: -250, bottom: 7750, height: 8000 }) as DOMRect;
    }

    act(() => window.dispatchEvent(new Event("scroll")));

    expect(sceneRef.current?.sectionRectRef.current).toEqual({
      bottom: 7750,
      height: 8000,
      top: -250,
    });
  });

  it("keeps every readable stage in the DOM", () => {
    const view = render(<PrinciplesStory />);

    for (const stage of principleStages) {
      if (stage.kind === "copy") {
        for (const line of stage.lines) expect(screen.getByText(line)).toBeInTheDocument();
      }
    }
    for (const statement of principleStatements) {
      expect(screen.getByText(statement[0])).toBeInTheDocument();
      expect(screen.getByText(statement[1])).toBeInTheDocument();
    }

    expect(view.container.querySelectorAll("[data-stage]")).toHaveLength(4);
    expect(view.container.querySelector('[data-stage="positioning"]')).toHaveAttribute(
      "data-active",
      "false",
    );
    expect(view.container.querySelectorAll('[data-stage][aria-hidden="true"]')).toHaveLength(0);
    expect(view.container.querySelector('[data-principle-orbit="true"]')).toBeInTheDocument();
    expect(view.container.querySelectorAll('[data-principle-orbit="true"] ellipse')).toHaveLength(
      7,
    );
    expect(view.container.querySelectorAll('[data-staggered-line="true"]')).toHaveLength(17);
  });

  it("gives each principle statement a localized contrast surface", () => {
    const view = render(<PrinciplesStory />);

    const statements = view.container.querySelectorAll("[data-principle-statement]");
    expect(statements).toHaveLength(4);
    for (const statement of statements) {
      expect(statement).toHaveAttribute("data-contrast-surface", "diffuse");
    }
  });

  it("keeps character content free of inline visibility overrides for reduced motion", () => {
    reducedMotion = true;
    const view = render(<PrinciplesStory />);
    const characters = view.container.querySelectorAll<HTMLElement>("[class*='copyCharacter']");

    expect(characters.length).toBeGreaterThan(0);
    for (const character of characters) {
      expect(character.style.opacity).toBe("");
      expect(character.style.transform).toBe("");
    }
    expect(
      view.container.querySelectorAll('[data-principle-orbit="true"] ellipse[opacity="1"]').length,
    ).toBeGreaterThan(0);
  });

  it("advances every phrase, the orbit scene, and the closing phrase from the same rect clock", () => {
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 1000 });
    const view = render(<PrinciplesStory />);
    const story = view.container.querySelector<HTMLElement>("#principles");
    expect(story).not.toBeNull();

    let sectionTop = 100;
    if (story) {
      story.getBoundingClientRect = () =>
        ({
          bottom: sectionTop + 8000,
          height: 8000,
          left: 0,
          right: 1000,
          top: sectionTop,
          width: 1000,
          x: 0,
          y: sectionTop,
          toJSON: () => ({}),
        }) as DOMRect;
    }

    act(() => window.dispatchEvent(new Event("scroll")));
    expect(story?.style.getPropertyValue("--principles-story-height")).toBe("8000px");
    expect(story?.style.getPropertyValue("--principles-viewport-height")).toBe("1000px");
    expect(view.container.querySelector('[data-stage="positioning"]')).toHaveAttribute(
      "data-active",
      "true",
    );

    sectionTop = -1999;
    act(() => window.dispatchEvent(new Event("scroll")));
    expect(view.container.querySelector('[data-stage="positioning"]')).toHaveAttribute(
      "data-active",
      "true",
    );

    sectionTop = -2000;
    act(() => window.dispatchEvent(new Event("scroll")));
    expect(view.container.querySelector('[data-stage="design"]')).toHaveAttribute(
      "data-active",
      "true",
    );

    sectionTop = -4000;
    act(() => window.dispatchEvent(new Event("scroll")));
    expect(view.container.querySelector('[data-stage="principles"]')).toHaveAttribute(
      "data-active",
      "true",
    );
    expect(view.container.querySelector('[data-principle-orbit="true"]')).toBeInTheDocument();

    sectionTop = -6000;
    act(() => window.dispatchEvent(new Event("scroll")));
    expect(view.container.querySelector('[data-stage="technology"]')).toHaveAttribute(
      "data-active",
      "true",
    );
    expect(view.container.querySelector('[data-cursor-closing="false"]')).toBeInTheDocument();

    sectionTop = -6500;
    act(() => window.dispatchEvent(new Event("scroll")));
    expect(view.container.querySelector('[data-stage="technology"]')).toHaveAttribute(
      "data-active",
      "true",
    );
    expect(view.container.querySelector('[data-cursor-closing="true"]')).toBeInTheDocument();

    sectionTop = -7650;
    act(() => window.dispatchEvent(new Event("scroll")));
    expect(view.container.querySelector('[data-stage="technology"]')).toHaveAttribute(
      "data-active",
      "true",
    );

    sectionTop = -7651;
    act(() => window.dispatchEvent(new Event("scroll")));
    expect(view.container.querySelector('[data-stage="technology"]')).toHaveAttribute(
      "data-active",
      "false",
    );

    sectionTop = -4100;
    act(() => window.dispatchEvent(new Event("scroll")));
    expect(view.container.querySelector('[data-stage="principles"]')).toHaveAttribute(
      "data-active",
      "true",
    );
  });
});
