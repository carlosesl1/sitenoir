import { describe, expect, it } from "vitest";

import { resolveShortcut } from "@/features/shortcuts/shortcuts";

describe("resolveShortcut", () => {
  it.each([
    ["t", { type: "scroll", target: "home" }],
    ["b", { type: "scroll", target: "contact" }],
  ] as const)("maps %s to its homepage action", (key, action) => {
    expect(resolveShortcut(key)).toEqual(action);
  });

  it("normalizes letter casing", () => {
    expect(resolveShortcut("T")).toEqual({ type: "scroll", target: "home" });
  });

  it("returns a typed no-op for unsupported keys", () => {
    expect(resolveShortcut("Escape")).toEqual({ type: "none" });
    expect(resolveShortcut("s")).toEqual({ type: "none" });
    expect(resolveShortcut("l")).toEqual({ type: "none" });
  });
});
