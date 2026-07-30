import { describe, expect, it } from "vitest";

import { HERO_EFFECT_COMPOSITE_FRAGMENT_SHADER } from "@/scene/hero-fluid-display-shader";

describe("hero effect composite shader", () => {
  it("gates independent fullscreen effects without coupling their visibility", () => {
    expect(HERO_EFFECT_COMPOSITE_FRAGMENT_SHADER).toContain("if (uEffectEnabled >= 0.5)");
    expect(HERO_EFFECT_COMPOSITE_FRAGMENT_SHADER).toContain("if (uPointerOpacity > 0.0)");
    expect(HERO_EFFECT_COMPOSITE_FRAGMENT_SHADER).toContain("if (uFlareEnabled >= 0.5)");
    expect(HERO_EFFECT_COMPOSITE_FRAGMENT_SHADER).toContain(
      "color.rgb += texture2D(tFlare, vUv).rgb;",
    );
    expect(HERO_EFFECT_COMPOSITE_FRAGMENT_SHADER).not.toContain(
      "max(uEffectEnabled, uPointerOpacity)",
    );
  });
});
