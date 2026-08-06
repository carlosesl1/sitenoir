import { mkdirSync } from "node:fs";
import path from "node:path";

import { expect, test } from "@playwright/test";

const evidenceDirectory = path.join(process.cwd(), ".omo", "evidence", "scene");

test.beforeAll(() => {
  mkdirSync(evidenceDirectory, { recursive: true });
});

test("mounts one fixed WebGL canvas and cleans it up across navigation", async ({ page }) => {
  const runtimeErrors: string[] = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" || /feedback loop/i.test(message.text())) {
      runtimeErrors.push(message.text());
    }
  });

  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/?effects=on");
  await expect(page.locator('[data-site-canvas="true"] canvas')).toHaveCount(1);
  await page.waitForLoadState("networkidle");
  await expect.poll(() => page.evaluate(() => window.__NOIR_READY__)).toBe(true);

  const canvasBox = await page.locator('[data-site-canvas="true"] canvas').boundingBox();
  expect(canvasBox).toEqual({ x: 0, y: 0, width: 1280, height: 720 });
  await page.mouse.move(960, 180);
  await expect(page.getByRole("banner").locator('[data-pointer-coordinates="true"]')).toHaveText(
    "0960 X 0180 Y",
  );
  await page.screenshot({ path: path.join(evidenceDirectory, "hero-desktop.png") });

  await page.goto("/showcase");
  await expect(page.locator('[data-site-canvas="true"] canvas')).toHaveCount(0);
  await page.goto("/?effects=on");
  await expect(page.locator('[data-site-canvas="true"] canvas')).toHaveCount(1);
  await page.waitForLoadState("networkidle");

  expect(runtimeErrors.filter((error) => /context lost|webgl|three/i.test(error))).toEqual([]);
});

test("keeps one optical background and its grid persistent across sections", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/?effects=on");
  await page.waitForLoadState("networkidle");

  const shell = page.locator('[data-site-canvas="true"]');
  await expect(shell).toHaveAttribute("data-background-runtime", "persistent");
  await expect(shell).toHaveAttribute("data-optical-active", "true");
  await expect(page.locator('[data-site-grid="true"]')).toHaveCount(1);
  await expect(shell.locator("canvas")).toHaveCount(1);

  await page.locator("#principles").evaluate((story) => {
    const top = story.getBoundingClientRect().top + window.scrollY;
    const range = Math.max(0, story.getBoundingClientRect().height - window.innerHeight);
    window.scrollTo(0, top + range * 0.33);
  });

  await expect(page.locator("#principles [data-principle-stage]")).toHaveAttribute(
    "data-principle-stage",
    "design",
  );
  await expect(shell).toHaveAttribute("data-background-tone", "theme");
  await expect(shell).toHaveAttribute("data-optical-active", "true");
  await expect(page.locator('[data-site-grid="true"]')).toHaveCount(1);
  await expect(shell.locator("canvas")).toHaveCount(1);
});

test("uses demand rendering for reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?effects=on");

  await expect(page.locator('[data-site-canvas="true"]')).toHaveAttribute(
    "data-frameloop",
    "demand",
  );
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("keeps the scene composed across mobile, principles, contact, and dark theme", async ({
  page,
}) => {
  const runtimeErrors: string[] = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" || /feedback loop/i.test(message.text())) {
      runtimeErrors.push(message.text());
    }
  });
  await page.addInitScript(() => localStorage.setItem("theme", "dark"));

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?effects=on");
  await page.waitForLoadState("networkidle");
  await expect(page.locator('[data-site-canvas="true"] canvas')).toHaveCount(1);
  await page.screenshot({ path: path.join(evidenceDirectory, "hero-mobile.png") });

  await page.setViewportSize({ width: 1280, height: 720 });
  await page.locator("#principles").evaluate((story) => {
    const top = story.getBoundingClientRect().top + window.scrollY;
    const range = Math.max(0, story.getBoundingClientRect().height - window.innerHeight);
    window.scrollTo(0, top + range * 0.33);
  });
  await expect(page.locator("#principles [data-principle-stage]")).toHaveAttribute(
    "data-principle-stage",
    "design",
  );
  await page.screenshot({ path: path.join(evidenceDirectory, "principles-design.png") });

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect(page.locator("#contact")).toBeInViewport();
  await page.screenshot({ path: path.join(evidenceDirectory, "contact-desktop.png") });

  expect(runtimeErrors.filter((error) => /context lost|webgl|three/i.test(error))).toEqual([]);
});

test("renders the graphite scene against the dark theme", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("theme", "dark"));
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/?effects=on");
  await page.waitForLoadState("networkidle");

  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator('[data-site-canvas="true"] canvas')).toHaveCount(1);
  await page.screenshot({ path: path.join(evidenceDirectory, "hero-dark.png") });
});

test("keeps the semantic homepage usable when WebGL initialization fails", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.addInitScript(() => {
    Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
      configurable: true,
      value: () => null,
    });
  });
  await page.goto("/?effects=on");

  await expect(page.getByRole("heading", { level: 1 })).toContainText("A estrutura digital");
  await expect(page.getByRole("link", { name: "NOIR DIGITAL" })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("data-effects", "failed");
  await expect.poll(() => page.evaluate(() => window.__NOIR_READY__)).toBe(true);
  await expect.poll(() => page.evaluate(() => window.__NOIR_SCENE_STATUS__)).toBe("failed");
  await expect(page.locator('[data-site-canvas="true"]')).toHaveCount(0);
  expect(pageErrors).toEqual([]);

  const story = page.locator("#principles");
  await story.evaluate((element) => {
    const top = element.getBoundingClientRect().top + window.scrollY;
    const range = Math.max(0, element.getBoundingClientRect().height - window.innerHeight);
    window.scrollTo(0, top + range * 0.33);
  });
  await expect(story.locator('[data-principle-stage="design"]')).toBeVisible();
  const designLines = story.locator('[data-stage="design"] [data-staggered-line="true"]');
  await expect(designLines).toHaveCount(3);
  await expect
    .poll(() =>
      designLines.evaluateAll((lines) => lines.map((line) => getComputedStyle(line).opacity)),
    )
    .toEqual(["1", "1", "1"]);
});

test("omits the decorative canvas for deterministic DOM-only fixtures", async ({ page }) => {
  await page.goto("/?effects=off");
  await page.waitForLoadState("networkidle");

  await expect(page.locator('[data-site-canvas="true"]')).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(
    await page.evaluate(() =>
      performance
        .getEntriesByType("resource")
        .map((entry) => entry.name)
        .filter((name) => /\/model\/|\/stickers\/s_\d+\.png/.test(name)),
    ),
  ).toEqual([]);
});
