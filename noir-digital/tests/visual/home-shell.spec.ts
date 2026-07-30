import { mkdirSync } from "node:fs";
import path from "node:path";

import { expect, test } from "@playwright/test";

const evidenceDirectory = path.join(process.cwd(), ".omo", "evidence", "home-shell");

test.beforeAll(() => {
  mkdirSync(evidenceDirectory, { recursive: true });
});

test("locks the desktop hero anchors", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/?effects=off");
  await page.evaluate(() => document.fonts.ready);

  const headline = page.getByRole("heading", { level: 1 });
  const headlineBox = await headline.boundingBox();
  const disciplineBox = await page.locator("#home ul li").first().boundingBox();
  const disciplineColumnBox = await page.locator("#home ul").boundingBox();
  const sceneAnchorBox = await page.locator('[data-scene-anchor="hero"]').boundingBox();
  const gridTemplateAreas = await page
    .locator("#home > div")
    .first()
    .evaluate((grid) => getComputedStyle(grid).gridTemplateAreas);

  expect(headlineBox).not.toBeNull();
  expect(disciplineBox).not.toBeNull();
  expect(disciplineColumnBox).not.toBeNull();
  expect(sceneAnchorBox).not.toBeNull();
  expect(gridTemplateAreas).not.toBe("none");
  const viewportHeight = 720;
  const expectedHeadlineTop = viewportHeight * 0.185 + 20;
  const expectedDisciplineTop = viewportHeight * 0.14;
  const expectedSceneTop = viewportHeight * 0.2;
  expect(headlineBox?.y).toBeGreaterThanOrEqual(expectedHeadlineTop - 3);
  expect(headlineBox?.y).toBeLessThanOrEqual(expectedHeadlineTop + 3);
  expect(disciplineBox?.y).toBeGreaterThanOrEqual(expectedDisciplineTop - 3);
  expect(disciplineBox?.y).toBeLessThanOrEqual(expectedDisciplineTop + 3);
  expect(disciplineColumnBox?.x).toBeGreaterThanOrEqual(48);
  expect(disciplineColumnBox?.x).toBeLessThanOrEqual(72);
  expect(disciplineColumnBox?.width).toBeGreaterThanOrEqual(100);
  expect(disciplineColumnBox?.width).toBeLessThanOrEqual(150);
  expect(sceneAnchorBox?.y).toBeGreaterThanOrEqual(expectedSceneTop - 3);
  expect(sceneAnchorBox?.y).toBeLessThanOrEqual(expectedSceneTop + 3);
  await expect(page.getByRole("navigation", { name: "Principal" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Abrir menu" })).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );

  await page.screenshot({
    path: path.join(evidenceDirectory, "desktop-1280x720.png"),
    fullPage: true,
  });
});

test("locks the mobile hero anchors and responsive visibility", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?effects=off");
  await page.evaluate(() => document.fonts.ready);

  const headlineBox = await page.getByRole("heading", { level: 1 }).boundingBox();
  const headlineLineBoxes = await page
    .locator("#hero-heading > span")
    .evaluateAll((lines) => lines.map((line) => line.getBoundingClientRect().toJSON()));
  const descriptionBox = await page.locator('[data-hero-action-row="true"] p').boundingBox();
  const sceneAnchorBox = await page.locator('[data-scene-anchor="hero"]').boundingBox();

  expect(headlineBox).not.toBeNull();
  expect(headlineLineBoxes).toHaveLength(3);
  expect(descriptionBox).not.toBeNull();
  expect(sceneAnchorBox).not.toBeNull();
  expect(headlineBox?.y).toBeGreaterThanOrEqual(68);
  expect(headlineBox?.y).toBeLessThanOrEqual(80);
  expect(headlineLineBoxes[0]?.height).toBeGreaterThanOrEqual(54);
  expect(headlineLineBoxes[0]?.height).toBeLessThanOrEqual(58);
  expect(headlineLineBoxes.slice(1).every((line) => line.height < 32)).toBe(true);
  expect(descriptionBox?.y).toBeGreaterThanOrEqual(618);
  expect(descriptionBox?.y).toBeLessThanOrEqual(632);
  expect(sceneAnchorBox?.y).toBeCloseTo(224, 0);
  expect(sceneAnchorBox?.height).toBeCloseTo(340, 0);
  await expect(page.locator("#home ul")).toBeHidden();
  await expect(page.getByRole("button", { name: "Abrir menu" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Principal" })).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );

  await page.screenshot({
    path: path.join(evidenceDirectory, "mobile-390x844.png"),
    fullPage: true,
  });
});
