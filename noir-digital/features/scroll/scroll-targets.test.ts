import { describe, expect, it } from "vitest";

import { sectionSelector } from "@/features/scroll/scroll-targets";

describe("sectionSelector", () => {
  it("maps every semantic target to its section id", () => {
    expect(sectionSelector("home")).toBe("#home");
    expect(sectionSelector("work")).toBe("#selected-work");
    expect(sectionSelector("contact")).toBe("#contact");
  });
});
