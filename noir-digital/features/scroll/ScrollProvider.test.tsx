import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ScrollProvider } from "@/features/scroll/ScrollProvider";

const lenisMocks = vi.hoisted(() => ({
  constructor: vi.fn(),
  destroy: vi.fn(),
  unsubscribe: vi.fn(),
}));

vi.mock("lenis", () => ({
  default: class LenisMock {
    isScrolling: boolean | string = false;

    constructor(options: unknown) {
      lenisMocks.constructor(options);
    }

    destroy() {
      lenisMocks.destroy();
    }

    on() {
      return lenisMocks.unsubscribe;
    }

    raf() {}

    scrollTo() {}
  },
}));

beforeEach(() => {
  document.documentElement.dataset["entryReady"] = "true";
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      addEventListener: vi.fn(),
      dispatchEvent: vi.fn(() => true),
      matches: false,
      media: "(prefers-reduced-motion: reduce)",
      onchange: null,
      removeEventListener: vi.fn(),
    })),
  );
});

afterEach(() => {
  cleanup();
  delete document.documentElement.dataset["entryReady"];
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

describe("ScrollProvider", () => {
  it("leaves touch gestures on the browser-native scrolling path", async () => {
    render(
      <ScrollProvider>
        <main>Conteúdo</main>
      </ScrollProvider>,
    );

    await waitFor(() => expect(lenisMocks.constructor).toHaveBeenCalledOnce());
    expect(lenisMocks.constructor).toHaveBeenCalledWith(
      expect.objectContaining({ syncTouch: false }),
    );
  });
});
