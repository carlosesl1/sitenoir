import { access } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";
import { describe, expect, it } from "vitest";

import { caseStudiesV2 } from "@/data/case-studies-v2";

describe("V2 case assets", () => {
  it("publishes every declared hero at its declared dimensions", async () => {
    for (const study of caseStudiesV2) {
      const file = path.join(process.cwd(), "public", study.hero.src);
      await access(file);
      const metadata = await sharp(file).metadata();

      expect(metadata.width).toBe(study.hero.width);
      expect(metadata.height).toBe(study.hero.height);
    }
  });

  it("publishes DOLA's shared production portrait", async () => {
    const videoCase = caseStudiesV2.find(
      (study) => study.categoryLayout === "video",
    );
    const portrait = videoCase?.credit?.portrait;

    if (!portrait) {
      throw new Error("Expected a shared video credit portrait");
    }

    const file = path.join(process.cwd(), "public", portrait.src);
    await access(file);
    const metadata = await sharp(file).metadata();

    expect(metadata.width).toBe(portrait.width);
    expect(metadata.height).toBe(portrait.height);
    expect(metadata.format).toBe("webp");
  });
});
