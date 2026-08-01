import { mkdir, rm } from "node:fs/promises";
import path from "node:path";

import { expect, test } from "@playwright/test";

const requiredFonts = [
  {
    family: "TikTok Sans",
    path: "/assets/v1/fonts/TikTokSans.woff2",
    range: "400 700",
    weights: [400, 700],
  },
  {
    family: "Departure Mono",
    path: "/assets/v1/fonts/DepartureMono.woff2",
    range: "400",
    weights: [400],
  },
] as const;

const viewports = [
  { name: "narrow", width: 320, height: 800 },
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1280, height: 720 },
] as const;

const evidenceDirectory = path.join(process.cwd(), ".omo", "evidence", "font-infrastructure");

test.describe.configure({ mode: "serial" });

test.beforeAll(async () => {
  await rm(evidenceDirectory, { recursive: true, force: true });
  await mkdir(evidenceDirectory, { recursive: true });
});

for (const viewport of viewports) {
  test(`loads every self-hosted font without overflow at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/showcase");

    const fontResults = await page.evaluate(
      async (fonts) => {
        await document.fonts.ready;
        await Promise.all(
          fonts.flatMap(({ family, weights }) =>
            weights.map((weight) => document.fonts.load(`${weight} 16px "${family}"`, "NOIR")),
          ),
        );

        return fonts.map(({ family, range, weights }) => {
          const loadedFace = Array.from(document.fonts).find(
            (face) => face.family.replaceAll('"', "") === family && face.status === "loaded",
          );

          return {
            family,
            hasExpectedRange: loadedFace?.weight === range,
            weightsAvailable: weights.every((weight) =>
              document.fonts.check(`${weight} 16px "${family}"`, "NOIR"),
            ),
          };
        });
      },
      requiredFonts.map(({ family, range, weights }) => ({ family, range, weights })),
    );

    expect(fontResults).toEqual(
      requiredFonts.map(({ family }) => ({
        family,
        hasExpectedRange: true,
        weightsAvailable: true,
      })),
    );

    const loadedResources = await page.evaluate(() =>
      performance.getEntriesByType("resource").map((entry) => new URL(entry.name).pathname),
    );
    for (const font of requiredFonts) {
      expect(loadedResources).toContain(font.path);
    }

    const horizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(horizontalOverflow).toBe(0);

    await page.screenshot({
      path: path.join(evidenceDirectory, `${viewport.name}.png`),
      fullPage: true,
      animations: "disabled",
    });
  });
}
