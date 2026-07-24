import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ServicesArticle } from "@/components/services/ServicesArticle";

const providerMocks = vi.hoisted(() => ({
  scrollToSelector: vi.fn(),
}));

const scrollSpyMocks = vi.hoisted(() => ({
  activeId: "visao-geral",
}));

vi.mock("@/features/theme/ThemeProvider", () => ({
  useTheme: () => ({
    cycleTheme: vi.fn(),
    resolvedTheme: "dark",
    setTheme: vi.fn(),
    theme: "dark",
  }),
}));

vi.mock("@/features/scroll/ScrollProvider", () => ({
  useScroll: () => ({ scrollToSelector: providerMocks.scrollToSelector }),
}));

vi.mock("@/features/scroll/use-scroll-spy", () => ({
  useScrollSpy: () => scrollSpyMocks.activeId,
}));

afterEach(() => {
  cleanup();
  providerMocks.scrollToSelector.mockClear();
  scrollSpyMocks.activeId = "visao-geral";
  vi.restoreAllMocks();
});

describe("ServicesArticle", () => {
  it("renders the editorial service structure without copied image assets", () => {
    render(<ServicesArticle />);

    expect(screen.queryByRole("banner")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Estrutura de serviço" })).toBeVisible();
    const summary = screen.getByRole("navigation", { name: "Sumário do serviço" });
    expect(summary).toHaveAttribute("data-service-toc", "true");
    expect(within(summary).getAllByRole("link")).toHaveLength(7);
    expect(within(summary).getByRole("link", { name: "Visão geral" })).toHaveAttribute(
      "aria-current",
      "location",
    );
    expect(screen.getAllByRole("figure")).toHaveLength(6);
    expect(screen.queryAllByRole("img")).toHaveLength(0);
    expect(screen.queryByLabelText("Voltar ao topo")).not.toBeInTheDocument();
    expect(screen.queryByText("SCROLL TO EXPLORE")).not.toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("marks the chapter selected by the shared scroll spy", () => {
    scrollSpyMocks.activeId = "processo";
    render(<ServicesArticle />);
    const summary = screen.getByRole("navigation", { name: "Sumário do serviço" });

    expect(within(summary).getByRole("link", { name: "Como trabalhamos" })).toHaveAttribute(
      "aria-current",
      "location",
    );
    expect(within(summary).getByRole("link", { name: "Visão geral" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("scrolls smoothly to a selected chapter", () => {
    render(<ServicesArticle />);
    const summary = screen.getByRole("navigation", { name: "Sumário do serviço" });

    fireEvent.click(within(summary).getByRole("link", { name: "Direção" }));

    expect(providerMocks.scrollToSelector).toHaveBeenCalledWith("#direcao");
    expect(window.location.hash).toBe("#direcao");
  });
});
