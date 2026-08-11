import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("HeroPointerLight", () => {
  it("uses a broad oriented area source instead of a point emitter", () => {
    const source = readFileSync(join(process.cwd(), "scene/HeroPointerLight.tsx"), "utf8");

    expect(source).toContain("type RectAreaLight");
    expect(source).toContain("<rectAreaLight");
    expect(source).toContain("width={14}");
    expect(source).toContain("height={6}");
    expect(source).toContain("light.lookAt(0, 0, 0)");
    expect(source).not.toContain("<pointLight");
  });
});
