import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const projectRoot = process.cwd();
const domRuntimePath = join(projectRoot, "scene/work-card-dom.ts");

function readSource(relativePath: string): string {
  return readFileSync(join(projectRoot, relativePath), "utf8");
}

describe("work card module boundary", () => {
  it("routes initial card code through a Three-free DOM helper", () => {
    expect(existsSync(domRuntimePath)).toBe(true);
    if (!existsSync(domRuntimePath)) return;

    const domRuntime = readFileSync(domRuntimePath, "utf8");
    const projectCard = readSource("components/work/ProjectCard.tsx");
    const workCardMotion = readSource("components/work/work-card-motion.ts");

    expect(domRuntime).not.toMatch(/from ["']three["']/);
    expect(projectCard).toContain('from "@/scene/work-card-dom"');
    expect(projectCard).not.toContain('from "@/scene/work-card-runtime"');
    expect(workCardMotion).toContain('from "@/scene/work-card-dom"');
    expect(workCardMotion).not.toContain('from "@/scene/work-card-runtime"');
  });

  it("keeps DOM-only exports out of the Three.js runtime", () => {
    const threeRuntime = readSource("scene/work-card-runtime.ts");

    expect(threeRuntime).not.toContain("export function setDataFlag");
    expect(threeRuntime).not.toContain("export function setWebGlCardVisibility");
  });
});
