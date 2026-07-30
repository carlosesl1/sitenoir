import { mkdirSync } from "node:fs";
import path from "node:path";

import { expect, test } from "@playwright/test";

const evidenceDirectory = path.join(process.cwd(), ".omo", "evidence", "hero-effects");

test.beforeAll(() => {
  mkdirSync(evidenceDirectory, { recursive: true });
});

test("moves the optical background and key light with the desktop pointer", async ({ page }) => {
  test.setTimeout(60_000);
  const runtimeErrors: string[] = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") runtimeErrors.push(message.text());
  });
  await page.addInitScript(() => localStorage.setItem("theme", "dark"));
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/?effects=on");
  await expect.poll(() => page.evaluate(() => window.__NOIR_READY__)).toBe(true);
  await page.waitForTimeout(7_000);
  const canvas = page.locator('[data-site-canvas="true"] canvas');

  await page.mouse.move(640, 360);
  await page.waitForTimeout(900);
  const centerCanvas = await canvas.screenshot();
  await page.screenshot({ path: path.join(evidenceDirectory, "desktop-center.png") });

  await page.mouse.move(96, 120);
  await page.waitForTimeout(900);
  const leftCanvas = await canvas.screenshot();
  await page.screenshot({ path: path.join(evidenceDirectory, "desktop-left.png") });

  await page.mouse.move(1184, 120);
  await page.waitForTimeout(900);
  const rightCanvas = await canvas.screenshot();
  await page.screenshot({ path: path.join(evidenceDirectory, "desktop-right.png") });

  expect(Buffer.compare(centerCanvas, leftCanvas)).not.toBe(0);
  expect(Buffer.compare(leftCanvas, rightCanvas)).not.toBe(0);
  expect(runtimeErrors.filter((error) => /context lost|webgl|three|shader/i.test(error))).toEqual(
    [],
  );
});

test("keeps the optical hero composed on mobile", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("theme", "dark"));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?effects=on");
  await expect.poll(() => page.evaluate(() => window.__NOIR_READY__)).toBe(true);
  await page.screenshot({ path: path.join(evidenceDirectory, "mobile.png") });
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
