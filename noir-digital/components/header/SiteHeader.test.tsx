import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SiteHeader } from "@/components/header/SiteHeader";

const providerMocks = vi.hoisted(() => ({
  cycleTheme: vi.fn(),
  isPlaying: true,
  resolvedTheme: "dark",
  scrollTo: vi.fn(),
  theme: "dark",
  toggleSound: vi.fn(),
}));

vi.mock("@/features/theme/ThemeProvider", () => ({
  useTheme: () => ({
    theme: providerMocks.theme,
    resolvedTheme: providerMocks.resolvedTheme,
    setTheme: vi.fn(),
    cycleTheme: providerMocks.cycleTheme,
  }),
}));

vi.mock("@/features/audio/AudioProvider", () => ({
  useAudio: () => ({
    sound: "on",
    isPlaying: providerMocks.isPlaying,
    toggle: providerMocks.toggleSound,
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
  providerMocks.isPlaying = true;
  providerMocks.resolvedTheme = "dark";
  providerMocks.scrollTo.mockClear();
  providerMocks.theme = "dark";
  providerMocks.toggleSound.mockClear();
});

afterEach(cleanup);

describe("SiteHeader", () => {
  it("exposes the brand, desktop navigation, control states, and coordinates", () => {
    render(<SiteHeader />);

    expect(screen.getByRole("banner")).toBeInTheDocument();
    const desktopNavigation = document.querySelector<HTMLElement>('nav[aria-label="Principal"]');
    expect(desktopNavigation).toBeInTheDocument();
    if (!desktopNavigation) return;
    expect(within(desktopNavigation).getAllByRole("button", { hidden: true })).toHaveLength(4);
    for (const label of ["Work", "Contact", "Theme", "Sound"]) {
      expect(
        within(desktopNavigation).getByRole("button", { name: label, hidden: true }),
      ).toBeInTheDocument();
    }
    expect(screen.getByRole("link", { name: "NOIR DIGITAL" })).toHaveAttribute("href", "#home");
    expect(screen.getByRole("button", { name: "Work", hidden: true })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Contact", hidden: true })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Theme", hidden: true })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Sound", hidden: true })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByText("GMT-3 BR")).toBeInTheDocument();
    expect(screen.getByText("0640 X 0360 Y")).toBeInTheDocument();
  });

  it("routes Work and Contact through typed scroll targets", () => {
    render(<SiteHeader />);

    fireEvent.click(screen.getByRole("button", { name: "Work", hidden: true }));
    fireEvent.click(screen.getByRole("button", { name: "Contact", hidden: true }));

    expect(providerMocks.scrollTo).toHaveBeenNthCalledWith(1, "work");
    expect(providerMocks.scrollTo).toHaveBeenNthCalledWith(2, "contact");
  });

  it("renders links back to the homepage when used on an internal route", () => {
    render(<SiteHeader sectionLinksBase="/" />);

    expect(screen.getByRole("link", { name: "NOIR DIGITAL" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Work", hidden: true })).toHaveAttribute(
      "href",
      "/#selected-work",
    );
    expect(screen.getByRole("link", { name: "Contact", hidden: true })).toHaveAttribute(
      "href",
      "/#contact",
    );
  });

  it("operates theme and sound controls", () => {
    render(<SiteHeader />);

    fireEvent.click(screen.getByRole("button", { name: "Theme", hidden: true }));
    fireEvent.click(screen.getByRole("button", { name: "Sound", hidden: true }));

    expect(providerMocks.cycleTheme).toHaveBeenCalledOnce();
    expect(providerMocks.toggleSound).toHaveBeenCalledOnce();
  });

  it("opens an accessible mobile menu and closes it with Escape", () => {
    render(<SiteHeader />);
    const trigger = screen.getByRole("button", { name: "Abrir menu" });

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("dialog", { name: "Menu" })).toBeInTheDocument();
    const mobileNavigation = screen.getByRole("navigation", { name: "Menu móvel" });
    for (const item of ["Home", "Work", "Contato"]) {
      expect(within(mobileNavigation).getByRole("button", { name: item })).toBeInTheDocument();
    }
    expect(within(mobileNavigation).queryByRole("button", { name: "Theme" })).toBeNull();
    expect(within(mobileNavigation).queryByRole("button", { name: "Sound" })).toBeNull();
    const preferences = screen.getByRole("group", { name: /Prefer/ });
    expect(within(preferences).getByRole("button", { name: "Theme" })).toBeInTheDocument();
    expect(within(preferences).getByRole("button", { name: "Sound" })).toBeInTheDocument();
    expect(within(mobileNavigation).getByRole("button", { name: "Home" })).toHaveFocus();

    fireEvent.keyDown(screen.getByRole("dialog", { name: "Menu" }), { key: "Escape" });

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
  });

  it("closes after mobile navigation and keeps typed targets", () => {
    render(<SiteHeader />);
    const trigger = screen.getByRole("button", { name: "Abrir menu" });
    fireEvent.click(trigger);

    const dialog = screen.getByRole("dialog", { name: "Menu" });
    fireEvent.click(within(dialog).getByRole("button", { name: "Work" }));

    expect(providerMocks.scrollTo).toHaveBeenLastCalledWith("work");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
  });

  it("traps keyboard focus inside the open mobile menu", () => {
    render(<SiteHeader />);
    fireEvent.click(screen.getByRole("button", { name: "Abrir menu" }));
    const dialog = screen.getByRole("dialog", { name: "Menu" });
    const home = within(dialog).getByRole("button", { name: "Home" });
    const sound = within(dialog).getByRole("button", { name: "Sound" });

    expect(home).toHaveFocus();
    fireEvent.keyDown(dialog, { key: "Tab", shiftKey: true });
    expect(sound).toHaveFocus();

    fireEvent.keyDown(dialog, { key: "Tab" });
    expect(home).toHaveFocus();
  });

  it("announces inactive theme and sound states", () => {
    providerMocks.theme = "system";
    providerMocks.resolvedTheme = "light";
    providerMocks.isPlaying = false;

    render(<SiteHeader />);

    expect(screen.getByRole("button", { name: "Theme", hidden: true })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.getByRole("button", { name: "Sound", hidden: true })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });
});
