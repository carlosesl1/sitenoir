import { describe, expect, it } from "vitest";

import { sampleContactChromeMatcap } from "@/scene/contact-chrome-matcap";

describe("sampleContactChromeMatcap", () => {
  it("creates the white-black-white profile that reads as polished chrome", () => {
    expect(sampleContactChromeMatcap(0, 0)).toBeGreaterThan(0.82);
    expect(sampleContactChromeMatcap(0.43, 0)).toBeLessThan(0.18);
    expect(sampleContactChromeMatcap(0.92, 0)).toBeGreaterThan(0.72);
  });
});
