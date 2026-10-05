import { act, cleanup, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { HeaderStatus } from "./HeaderStatus";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it("hides over a footer taller than the viewport, then returns when it leaves", () => {
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
      <section id="contact" />
      <HeaderStatus />
    </>,
  );
  const status = view.container.querySelector("div[aria-hidden]");
  const update = (isIntersecting: boolean) => {
    act(() =>
      notify(
        [
          {
            isIntersecting,
            intersectionRatio: isIntersecting ? 0.2 : 0,
          } as IntersectionObserverEntry,
        ],
        {} as IntersectionObserver,
      ),
    );
  };
  expect(status).toHaveAttribute("aria-hidden", "false");
  update(true);
  expect(status).toHaveAttribute("aria-hidden", "true");
  update(false);
  expect(status).toHaveAttribute("aria-hidden", "false");
  view.unmount();
  expect(disconnect).toHaveBeenCalledOnce();
});
