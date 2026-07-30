import { describe, expect, it } from "vitest";

import { nextTheme } from "@/features/theme/theme-state";

describe("nextTheme", () => {
  it("cycles through system, light, and dark in a stable order", () => {
    expect(nextTheme("system")).toBe("light");
    expect(nextTheme("light")).toBe("dark");
    expect(nextTheme("dark")).toBe("system");
  });
});
