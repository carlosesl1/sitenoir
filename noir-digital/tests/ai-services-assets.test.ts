import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const assets = [
  "public/assets/v1/ai-services/ascii-wave-desktop.svg",
  "public/assets/v1/ai-services/ascii-wave-mobile.svg",
] as const;

describe("AI services vector assets", () => {
  for (const asset of assets) {
    it(`${asset} is a safe bounded external SVG`, () => {
      const absolutePath = join(process.cwd(), asset);
      const source = readFileSync(absolutePath, "utf8");

      expect(source).toMatch(/^<svg[^>]+viewBox=/);
      expect(source).toContain('data-asset="ai-services-ascii-wave"');
      expect(source).not.toMatch(/<(?:script|animate|image|foreignObject)\b/i);
      expect(source).not.toContain("data:");
      expect(source.match(/<path\b/g)?.length).toBeLessThanOrEqual(8);
      expect(statSync(absolutePath).size).toBeLessThan(300_000);
    });
  }
});
