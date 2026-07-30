import { mkdirSync } from "node:fs";
import path from "node:path";

import type { Page } from "@playwright/test";

import { expect, openVisualHome, settleVisualPage, test } from "./visual-fixture";

const evidenceDirectory = path.join(process.cwd(), ".omo", "evidence", "principles");

test.beforeAll(() => {
  mkdirSync(evidenceDirectory, { recursive: true });
});

async function scrollStoryTo(page: Page, progress: number) {
  await page.locator("#principles").evaluate((story, targetProgress) => {
    const top = story.getBoundingClientRect().top + window.scrollY;
    const range = Math.max(0, story.getBoundingClientRect().height - window.innerHeight);
    window.scrollTo(0, top + range * targetProgress);
  }, progress);
  await settleVisualPage(page);
}

test("maps real scroll positions to the four deterministic stages", async ({ visualPage }) => {
  await openVisualHome(visualPage, {
    effects: "off",
    reducedMotion: false,
    theme: "system",
    viewport: { width: 1280, height: 720 },
  });

  const frame = visualPage.locator("#principles [data-principle-stage]");
  const checkpoints = [
    [0, "positioning"],
    [0.33, "design"],
    [0.66, "principles"],
    [1, "technology"],
  ] as const;

  await scrollStoryTo(visualPage, 0.28);
  await expect(frame).toHaveAttribute("data-principle-stage", "positioning");
  await expect(visualPage.locator('#principles [data-stage="positioning"]')).toHaveCSS(
    "opacity",
    "1",
  );
  await expect(visualPage.locator('#principles [data-stage="design"]')).toHaveCSS("opacity", "0");

  await scrollStoryTo(visualPage, 0.3);
  await expect(frame).toHaveAttribute("data-principle-stage", "design");
  await expect(visualPage.locator("html")).toHaveAttribute("data-effects", "off");
  await expect(frame).toHaveCSS("background-color", "rgb(3, 3, 3)");
  await expect(visualPage.locator('#principles [data-stage="positioning"]')).toHaveCSS(
    "opacity",
    "0",
  );
  await expect(visualPage.locator('#principles [data-stage="design"]')).toHaveCSS("opacity", "1");

  for (const [progress, stage] of checkpoints) {
    await scrollStoryTo(visualPage, progress);
    await expect(frame).toHaveAttribute("data-principle-stage", stage);

    for (const candidate of ["positioning", "design", "principles", "technology"]) {
      const panel = visualPage.locator(`#principles [data-stage="${candidate}"]`);
      await expect(panel).toHaveCSS("opacity", candidate === stage ? "1" : "0");
    }

    await visualPage.screenshot({
      path: path.join(evidenceDirectory, `${stage}.png`),
    });
  }
});

test("turns the story into sequential readable content for reduced motion", async ({
  visualPage,
}) => {
  await openVisualHome(visualPage, {
    effects: "off",
    reducedMotion: true,
    theme: "system",
    viewport: { width: 390, height: 844 },
  });

  const story = visualPage.locator("#principles");
  const panels = story.locator("[data-stage]");
  await expect(panels).toHaveCount(4);
  expect(await story.evaluate((element) => getComputedStyle(element).height)).not.toBe("6752px");

  for (const panel of await panels.all()) {
    await expect(panel).toHaveCSS("position", "relative");
    await expect(panel).toHaveCSS("opacity", "1");
  }
});
