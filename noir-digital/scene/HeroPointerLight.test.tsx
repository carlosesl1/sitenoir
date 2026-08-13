import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("SiteCanvas pointer lighting", () => {
  it("does not mount a light bound to pointer movement", () => {
    const source = readFileSync(join(process.cwd(), "scene/SiteCanvas.tsx"), "utf8");

    expect(source).not.toContain("HeroPointerLight");
    expect(source).toContain("<ambientLight intensity={0.38} />");
    expect(source).toContain("<directionalLight position={[-8, -4, 6]} intensity={0.72} />");
    expect(existsSync(join(process.cwd(), "scene/HeroPointerLight.tsx"))).toBe(false);
  });
});
