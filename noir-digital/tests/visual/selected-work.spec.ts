import { mkdirSync } from "node:fs";
import path from "node:path";

import { expect, test } from "@playwright/test";

const evidenceDirectory = path.join(process.cwd(), ".omo", "evidence", "selected-work");
const firstProjects = ["reunimos", "inspire-mono", "wasm-design-utils"] as const;

test.beforeAll(() => {
  mkdirSync(evidenceDirectory, { recursive: true });
});

test("composes the first three project hovers through WebGL without moving their slots", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/?effects=off");
  await page.evaluate(() => document.fonts.ready);

  for (const slug of firstProjects) {
    const card = page.getByTestId(`project-${slug}`);
    const link = card.getByRole("link");
    const frame = card.locator("[data-work-card]");
    const primary = card.locator("[data-image-role=primary]");
    const hover = card.locator("[data-image-role=hover]");
    await card.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        card
          .locator("img")
          .evaluateAll((images) =>
            images.every(
              (image) =>
                image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0,
            ),
          ),
      )
      .toBe(true);
    const before = await frame.boundingBox();

    await link.hover();
    await expect
      .poll(() =>
        frame.evaluate((element) => {
          if (element.getAttribute("data-webgl-ready") === "true") return "shared";
          if (element.getAttribute("data-hover-reveal-ready") === "true") return "local";
          return "pending";
        }),
      )
      .toMatch(/^(local|shared)$/);

    const renderingPath = await frame.evaluate((element) =>
      element.getAttribute("data-webgl-ready") === "true" ? "shared" : "local",
    );
    if (renderingPath === "local") {
      const hoverCanvas = card.locator('[data-card-hover-reveal="true"] canvas');
      await expect(hoverCanvas).toHaveCount(1);
      await expect(hoverCanvas).toHaveCSS("opacity", "1");
      await expect(primary).toHaveCSS("opacity", "1");
      await expect(hover).toHaveCSS("opacity", "0");
    } else {
      await expect(page.locator('[data-work-card-canvas="true"] canvas')).toHaveCount(1);
      await expect(frame).toHaveAttribute("data-canvas-active", "true");
    }

    const after = await frame.boundingBox();
    expect(after).not.toBeNull();
    expect(before).not.toBeNull();
    expect(after?.x).toBeCloseTo(before?.x ?? 0, 1);
    expect(after?.y).toBeCloseTo(before?.y ?? 0, 1);
    expect(after?.width).toBeCloseTo(before?.width ?? 0, 1);
    expect(after?.height).toBeCloseTo(before?.height ?? 0, 1);
  }

  await page.getByTestId("project-reunimos").scrollIntoViewIfNeeded();
  await page.screenshot({ path: path.join(evidenceDirectory, "desktop-hover.png") });
});

test("prewarms the first project group before shared WebGL becomes visible", async ({ page }) => {
  await page.setViewportSize({ width: 2560, height: 1440 });
  await page.goto("/?effects=full", { waitUntil: "domcontentloaded" });
  await expect
    .poll(() => page.evaluate(() => window.__NOIR_READY__), { timeout: 30_000 })
    .toBe(true);
  await expect(page.locator("html")).toHaveAttribute("data-entry-ready", "true", {
    timeout: 30_000,
  });
  await expect(page.locator('[data-work-card-canvas="true"] canvas')).toHaveCount(1);

  for (const slug of firstProjects) {
    const frame = page.getByTestId(`project-${slug}`).locator("[data-work-card]");
    await expect(frame).toHaveAttribute("data-webgl-ready", "true", { timeout: 30_000 });
    await expect(frame).toHaveAttribute("data-canvas-active", "false");
    expect((await frame.boundingBox())?.y ?? 0).toBeGreaterThanOrEqual(1440);
  }

  const card = page.getByTestId("project-reunimos");
  const frame = card.locator("[data-work-card]");
  const before = await frame.boundingBox();
  await card.scrollIntoViewIfNeeded();
  await expect(frame).toHaveAttribute("data-canvas-active", "true");
  await card.getByRole("link").hover();
  await expect(frame).toHaveAttribute("data-canvas-active", "true");
  const after = await frame.boundingBox();

  expect(before).not.toBeNull();
  expect(after).not.toBeNull();
  expect(after?.width).toBeCloseTo(before?.width ?? 0, 1);
  expect(after?.height).toBeCloseTo(before?.height ?? 0, 1);
});

test("restores prepared Work Cards after WebGL context loss", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/?effects=full", { waitUntil: "domcontentloaded" });
  await expect
    .poll(() => page.evaluate(() => window.__NOIR_READY__), { timeout: 30_000 })
    .toBe(true);

  const frame = page.getByTestId("project-reunimos").locator("[data-work-card]");
  await expect(frame).toHaveAttribute("data-webgl-ready", "true", { timeout: 30_000 });
  const canvas = page.locator('[data-work-card-canvas="true"] canvas');
  await expect(canvas).toHaveCount(1);

  const canRestore = await canvas.evaluate((element) => {
    const gl =
      (element as HTMLCanvasElement).getContext("webgl2") ??
      (element as HTMLCanvasElement).getContext("webgl");
    const extension = gl?.getExtension("WEBGL_lose_context");
    if (!extension) return false;
    const state = window as typeof window & {
      __NOIR_LOSE_CONTEXT__?: { restoreContext: () => void };
    };
    state.__NOIR_LOSE_CONTEXT__ = extension;
    extension.loseContext();
    return true;
  });
  test.skip(!canRestore, "WEBGL_lose_context is unavailable");

  await expect(frame).not.toHaveAttribute("data-webgl-ready", "true");
  await page.evaluate(() => {
    const state = window as typeof window & {
      __NOIR_LOSE_CONTEXT__?: { restoreContext: () => void };
    };
    state.__NOIR_LOSE_CONTEXT__?.restoreContext();
    delete state.__NOIR_LOSE_CONTEXT__;
  });
  await expect(frame).toHaveAttribute("data-webgl-ready", "true", { timeout: 30_000 });
  await page.getByTestId("project-reunimos").scrollIntoViewIfNeeded();
  await expect(frame).toHaveAttribute("data-canvas-active", "true");
});

test("falls back to the non-WebGL hover composition", async ({ page }) => {
  await page.addInitScript(() => {
    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
      configurable: true,
      value(contextId: string, ...options: unknown[]) {
        if (contextId === "webgl" || contextId === "webgl2") return null;
        return Reflect.apply(originalGetContext, this, [contextId, ...options]);
      },
    });
  });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/?effects=off");

  const card = page.getByTestId("project-reunimos");
  const frame = card.locator("[data-work-card]");
  const primary = card.locator("[data-image-role=primary]");
  const hover = card.locator("[data-image-role=hover]");
  await card.scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      card
        .locator("img")
        .evaluateAll((images) =>
          images.every(
            (image) =>
              image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0,
          ),
        ),
    )
    .toBe(true);

  await card.getByRole("link").hover();
  await expect(frame).not.toHaveAttribute("data-hover-reveal-ready", "true");
  await expect(card.locator('[data-card-hover-reveal="true"] canvas')).toHaveCount(0);
  await expect(frame).toHaveAttribute("data-canvas-active", "true");
  await expect(primary).toHaveCSS("opacity", "0");
  await expect(hover).toHaveCSS("opacity", "1");
});

test("stacks the featured and supporting cards at equal width on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?effects=off");
  await page.evaluate(() => document.fonts.ready);

  const featured = await page.getByTestId("project-reunimos").boundingBox();
  const second = await page.getByTestId("project-inspire-mono").boundingBox();
  const third = await page.getByTestId("project-wasm-design-utils").boundingBox();

  expect(featured).not.toBeNull();
  expect(second).not.toBeNull();
  expect(third).not.toBeNull();
  expect(featured?.width).toBeCloseTo(second?.width ?? 0, 1);
  expect(second?.width).toBeCloseTo(third?.width ?? 0, 1);
  expect(second?.y ?? 0).toBeGreaterThan((featured?.y ?? 0) + (featured?.height ?? 0));
  expect(third?.y ?? 0).toBeGreaterThan((second?.y ?? 0) + (second?.height ?? 0));
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );

  await page.getByTestId("project-reunimos").scrollIntoViewIfNeeded();
  await page.screenshot({ path: path.join(evidenceDirectory, "mobile-grid.png") });
});
