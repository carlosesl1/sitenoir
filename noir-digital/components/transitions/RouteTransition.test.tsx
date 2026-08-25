import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { RouteTransition } from "@/components/transitions/RouteTransition";

const navigationMocks = vi.hoisted(() => ({
  pathname: "/",
  prefetch: vi.fn(),
  push: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => navigationMocks.pathname,
  useRouter: () => ({ prefetch: navigationMocks.prefetch, push: navigationMocks.push }),
}));

vi.mock("motion/react", () => ({ useReducedMotion: () => false }));

vi.mock("@/components/preloader/EntryRevealCanvas", () => ({
  EntryRevealCanvas: ({ direction }: { readonly direction: string }) => (
    <canvas data-testid="transition-canvas" data-direction={direction} />
  ),
}));

describe("RouteTransition", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    navigationMocks.pathname = "/";
    navigationMocks.prefetch.mockClear();
    navigationMocks.push.mockClear();
    window.history.replaceState(null, "", "/");
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("covers the current page before navigating and reveals the destination", () => {
    const view = render(
      <>
        <RouteTransition />
        <a href="/services">Services</a>
      </>,
    );

    fireEvent.click(screen.getByRole("link", { name: "Services" }));
    expect(navigationMocks.prefetch).toHaveBeenCalledWith("/services");
    expect(navigationMocks.push).not.toHaveBeenCalled();
    expect(screen.getByTestId("transition-canvas")).toHaveAttribute("data-direction", "cover");

    vi.advanceTimersByTime(800);
    expect(navigationMocks.push).toHaveBeenCalledWith("/services");

    navigationMocks.pathname = "/services";
    view.rerender(
      <>
        <RouteTransition />
        <a href="/services">Services</a>
      </>,
    );
    expect(screen.getByTestId("transition-canvas")).toHaveAttribute("data-direction", "reveal");
  });

  it("prefetches internal routes on intent without duplicating requests", () => {
    render(
      <>
        <RouteTransition />
        <a href="/services">Services</a>
        <a href="https://example.com">External</a>
      </>,
    );

    const services = screen.getByRole("link", { name: "Services" });
    fireEvent.pointerOver(services);
    fireEvent.focusIn(services);
    fireEvent.pointerOver(screen.getByRole("link", { name: "External" }));

    expect(navigationMocks.prefetch).toHaveBeenCalledTimes(1);
    expect(navigationMocks.prefetch).toHaveBeenCalledWith("/services");
  });

  it("does not intercept same-page anchor navigation", () => {
    render(
      <>
        <RouteTransition />
        <a href="#direcao">Direção</a>
      </>,
    );

    fireEvent.click(screen.getByRole("link", { name: "Direção" }));

    expect(navigationMocks.push).not.toHaveBeenCalled();
    expect(screen.queryByTestId("transition-canvas")).not.toBeInTheDocument();
  });

  it("does not cover a trailing-slash page when its current route link is clicked", () => {
    navigationMocks.pathname = "/contato";
    window.history.replaceState(null, "", "/contato/");

    render(
      <>
        <RouteTransition />
        <a href="/contato">Contato</a>
      </>,
    );

    fireEvent.click(screen.getByRole("link", { name: "Contato" }));

    expect(navigationMocks.prefetch).not.toHaveBeenCalled();
    expect(navigationMocks.push).not.toHaveBeenCalled();
    expect(screen.queryByTestId("transition-canvas")).not.toBeInTheDocument();
  });
});
