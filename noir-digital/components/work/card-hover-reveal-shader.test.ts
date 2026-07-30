import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

describe("service card hover shader", () => {
  it("draws only revealed hover pixels over the stable base surface", () => {
    const source = readFileSync(
      join(process.cwd(), "components/work/CardHoverRevealCanvas.tsx"),
      "utf8",
    );

    expect(source).toContain("if (hoverCoverage <= 0.0) discard;");
    expect(source).toContain("gl_FragColor = vec4(hoverColor.rgb, outputAlpha);");
    expect(source).not.toContain("mix(primaryColor, hoverColor, hoverCoverage)");
  });
});
