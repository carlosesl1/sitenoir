import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MissionScroll } from "@/components/mission/MissionScroll";
import { missionStatement } from "@/data/content";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("MissionScroll", () => {
  it("labels the section and keeps the full mission readable", () => {
    const view = render(<MissionScroll />);

    expect(screen.getByRole("heading", { level: 2, name: "Nossa missão" })).toBeInTheDocument();
    const paragraphs = Array.from(view.container.querySelectorAll("p"));
    expect(paragraphs.map((paragraph) => paragraph.textContent)).toEqual([...missionStatement]);
  });

  it("splits each paragraph into ordered words for the scroll fill", () => {
    const view = render(<MissionScroll />);
    const [statement] = Array.from(view.container.querySelectorAll<HTMLElement>("p"));
    const words = statement?.querySelectorAll<HTMLElement>("[data-mission-word]") ?? [];

    expect(statement?.style.getPropertyValue("--word-count")).toBe(String(words.length));
    expect(words[0]?.style.getPropertyValue("--word-index")).toBe("0");
    expect(words.length).toBe(missionStatement[0].split(" ").length);
  });

  it("drives the horizontal track and fill from the scroll position", () => {
    vi.spyOn(window, "innerHeight", "get").mockReturnValue(800);
    const view = render(<MissionScroll />);
    const section = view.container.querySelector("section");
    const frame = view.container.querySelector<HTMLElement>("[data-mission-track]")?.parentElement;
    if (!section || !frame) throw new Error("Mission section did not render");

    vi.spyOn(section, "getBoundingClientRect").mockReturnValue({ top: 0 } as DOMRect);
    fireEvent.scroll(window);

    expect(section.style.getPropertyValue("--mission-story-height")).toBe("3200px");
    expect(frame.style.getPropertyValue("--track-x")).toBe("0.0000");
    expect(Number(frame.style.getPropertyValue("--fill-statement"))).toBeGreaterThan(0);
    expect(frame.style.getPropertyValue("--fill-detail")).toBe("0.0000");
  });

  it("keeps the section height when only the browser bar moves", () => {
    const innerHeight = vi.spyOn(window, "innerHeight", "get").mockReturnValue(760);
    const view = render(<MissionScroll />);
    const section = view.container.querySelector("section");
    if (!section) throw new Error("Mission section did not render");
    expect(section.style.getPropertyValue("--mission-story-height")).toBe("3040px");

    innerHeight.mockReturnValue(816);
    fireEvent(window, new Event("resize"));

    expect(section.style.getPropertyValue("--mission-story-height")).toBe("3040px");
    expect(section.style.getPropertyValue("--mission-viewport-height")).toBe("816px");
  });

  it("does not restyle the words while the page scrolls elsewhere", () => {
    vi.spyOn(window, "innerHeight", "get").mockReturnValue(800);
    const view = render(<MissionScroll />);
    const section = view.container.querySelector("section");
    const frame = view.container.querySelector<HTMLElement>("[data-mission-track]")?.parentElement;
    if (!section || !frame) throw new Error("Mission section did not render");

    const top = vi.spyOn(section, "getBoundingClientRect");
    top.mockReturnValue({ top: -5000 } as DOMRect);
    fireEvent.scroll(window);
    const write = vi.spyOn(frame.style, "setProperty");
    top.mockReturnValue({ top: -6000 } as DOMRect);
    fireEvent.scroll(window);

    expect(write).not.toHaveBeenCalled();
  });
});
