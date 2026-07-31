import { describe, expect, it } from "vitest";

import { resolveShortcut } from "@/features/shortcuts/shortcuts";

describe("resolveShortcut", () => {
  it.each([
    ["l", { type: "theme", value: "light" }],
    ["d", { type: "theme", value: "dark" }],
    ["a", { type: "theme", value: "system" }],
    ["t", { type: "scroll", target: "home" }],
    ["b", { type: "scroll", target: "contact" }],
  ] as const)("maps %s to its homepage action", (key, action) => {
    expect(resolveShortcut(key)).toEqual(action);
  });

  it("normalizes letter casing", () => {
    expect(resolveShortcut("L")).toEqual({ type: "theme", value: "light" });
  });

  it("returns a typed no-op for unsupported keys", () => {
    expect(resolveShortcut("Escape")).toEqual({ type: "none" });
    expect(resolveShortcut("s")).toEqual({ type: "none" });
  });
});
