import { readFileSync } from "node:fs";
import { join } from "node:path";

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SiteHeader } from "@/components/header/SiteHeader";

const providerMocks = vi.hoisted(() => ({
  cycleTheme: vi.fn(),
  resolvedTheme: "dark",
  scrollTo: vi.fn(),
  theme: "dark",
}));

vi.mock("@/features/theme/ThemeProvider", () => ({
  useTheme: () => ({
    theme: providerMocks.theme,
    resolvedTheme: providerMocks.resolvedTheme,
    setTheme: vi.fn(),
    cycleTheme: providerMocks.cycleTheme,
  }),
}));

vi.mock("@/features/scroll/ScrollProvider", () => ({
  useScroll: () => ({ scrollTo: providerMocks.scrollTo }),
}));

vi.mock("@/features/pointer/pointer-store", () => ({
  usePointerSnapshot: () => ({
    clientX: 640,
    clientY: 360,
    normalizedX: 0,
    normalizedY: 0,
  }),
}));

beforeEach(() => {
  providerMocks.cycleTheme.mockClear();
  providerMocks.resolvedTheme = "dark";
  providerMocks.scrollTo.mockClear();
  providerMocks.theme = "dark";
});

afterEach(cleanup);

describe("SiteHeader", () => {
  it("normalizes links and buttons onto one desktop baseline", () => {
    const css = readFileSync(join(process.cwd(), "components/header/Header.module.css"), "utf8");

    expect(css).toMatch(/\.desktopNavigation\s*\{[^}]*align-items:\s*center/s);
    expect(css).toMatch(
      /\.control\s*\{[^}]*display:\s*inline-flex[^}]*align-items:\s*center[^}]*justify-content:\s*center/s,
    );
  });

  it("exposes the brand, desktop navigation, control states, and coordinates", () => {
    render(<SiteHeader />);

    expect(screen.getByRole("banner")).toBeInTheDocument();
    const desktopNavigation = document.querySelector<HTMLElement>('nav[aria-label="Principal"]');
    expect(desktopNavigation).toBeInTheDocument();
    if (!desktopNavigation) return;
    expect(within(desktopNavigation).getAllByRole("button", { hidden: true })).toHaveLength(2);
    for (const label of ["Serviços", "Tema"]) {
      expect(
        within(desktopNavigation).getByRole("button", { name: label, hidden: true }),
      ).toBeInTheDocument();
    }
    expect(
      within(desktopNavigation).getByRole("link", { name: "Contato", hidden: true }),
    ).toHaveAttribute("href", "/contato");
    expect(screen.getByRole("link", { name: "NOIR DIGITAL" })).toHaveAttribute("href", "#home");
    expect(screen.getByRole("button", { name: "Serviços", hidden: true })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tema", hidden: true })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.queryByRole("button", { name: "Sound", hidden: true })).toBeNull();
    expect(screen.getByText("GMT-3 BR")).toBeInTheDocument();
    expect(screen.getByText("0640 X 0360 Y")).toBeInTheDocument();
  });

  it("routes Serviços through the typed scroll target and Contato to its page", () => {
    render(<SiteHeader />);

    fireEvent.click(screen.getByRole("button", { name: "Serviços", hidden: true }));

    expect(providerMocks.scrollTo).toHaveBeenCalledOnce();
    expect(providerMocks.scrollTo).toHaveBeenCalledWith("work");
    expect(screen.getByRole("link", { name: "Contato", hidden: true })).toHaveAttribute(
      "href",
      "/contato",
    );
  });

  it("renders links back to the homepage when used on an internal route", () => {
    render(<SiteHeader sectionLinksBase="/" />);

    expect(screen.getByRole("link", { name: "NOIR DIGITAL" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Serviços", hidden: true })).toHaveAttribute(
      "href",
      "/#selected-work",
    );
    expect(screen.getByRole("link", { name: "Contato", hidden: true })).toHaveAttribute(
      "href",
      "/contato",
    );
    expect(screen.queryByText("GMT-3 BR")).not.toBeInTheDocument();
    expect(screen.queryByText(/X 0360 Y/)).not.toBeInTheDocument();
  });

  it("operates the theme control without exposing sound", () => {
    render(<SiteHeader />);

    fireEvent.click(screen.getByRole("button", { name: "Tema", hidden: true }));

    expect(providerMocks.cycleTheme).toHaveBeenCalledOnce();
    expect(screen.queryByRole("button", { name: "Sound", hidden: true })).toBeNull();
  });

  it("opens an accessible mobile menu and closes it with Escape", () => {
    render(<SiteHeader />);
    const trigger = screen.getByRole("button", { name: "Abrir menu" });

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("dialog", { name: "Menu" })).toBeInTheDocument();
    const mobileNavigation = screen.getByRole("navigation", { name: "Menu móvel" });
    for (const item of ["Início", "Serviços"]) {
      expect(within(mobileNavigation).getByRole("button", { name: item })).toBeInTheDocument();
    }
    expect(within(mobileNavigation).getByRole("link", { name: "Contato" })).toHaveAttribute(
      "href",
      "/contato",
    );
    expect(within(mobileNavigation).queryByRole("button", { name: "Tema" })).toBeNull();
    expect(within(mobileNavigation).queryByRole("button", { name: "Sound" })).toBeNull();
    const dialog = screen.getByRole("dialog", { name: "Menu" });
    expect(within(dialog).getByRole("button", { name: "Tema" })).toBeInTheDocument();
    expect(within(dialog).queryByRole("button", { name: "Sound" })).toBeNull();
    expect(within(mobileNavigation).getByRole("button", { name: "Início" })).toHaveFocus();

    fireEvent.keyDown(screen.getByRole("dialog", { name: "Menu" }), { key: "Escape" });

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
  });

  it("closes after mobile navigation and keeps typed targets", () => {
    render(<SiteHeader />);
    const trigger = screen.getByRole("button", { name: "Abrir menu" });
    fireEvent.click(trigger);

    const dialog = screen.getByRole("dialog", { name: "Menu" });
    fireEvent.click(within(dialog).getByRole("button", { name: "Serviços" }));

    expect(providerMocks.scrollTo).toHaveBeenLastCalledWith("work");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
  });

  it("traps keyboard focus inside the open mobile menu", () => {
    render(<SiteHeader />);
    fireEvent.click(screen.getByRole("button", { name: "Abrir menu" }));
    const dialog = screen.getByRole("dialog", { name: "Menu" });
    const home = within(dialog).getByRole("button", { name: "Início" });
    const theme = within(dialog).getByRole("button", { name: "Tema" });

    expect(home).toHaveFocus();
    fireEvent.keyDown(dialog, { key: "Tab", shiftKey: true });
    expect(theme).toHaveFocus();

    fireEvent.keyDown(dialog, { key: "Tab" });
    expect(home).toHaveFocus();
  });

  it("announces the inactive theme state", () => {
    providerMocks.theme = "system";
    providerMocks.resolvedTheme = "light";

    render(<SiteHeader />);

    expect(screen.getByRole("button", { name: "Tema", hidden: true })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.queryByRole("button", { name: "Sound", hidden: true })).toBeNull();
  });
});
