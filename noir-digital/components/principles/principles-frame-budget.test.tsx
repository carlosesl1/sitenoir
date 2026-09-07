import { act, cleanup, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { PrinciplesStory } from "./PrinciplesStory";

vi.mock("motion/react", () => ({ useReducedMotion: () => false }));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it("measures only once for a burst of scroll events and cancels pending work on unmount", () => {
  const frames = new Map<number, FrameRequestCallback>();
  let id = 0;
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
    frames.set(++id, callback);
    return id;
  });
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation((key) => {
    frames.delete(key);
  });
  const view = render(<PrinciplesStory />);
  const story = view.container.querySelector("#principles") as HTMLElement;
  const measure = vi.spyOn(story, "getBoundingClientRect").mockReturnValue({
    top: -2000,
    bottom: 3000,
    height: 5000,
  } as DOMRect);
  act(() => {
    for (let i = 0; i < 20; i++) window.dispatchEvent(new Event("scroll"));
    const pending = [...frames.values()];
    frames.clear();
    for (const frame of pending) frame(16);
  });
  expect(measure).toHaveBeenCalledTimes(1);
  act(() => window.dispatchEvent(new Event("scroll")));
  view.unmount();
  expect(frames.size).toBe(0);
});
