import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

type ShowcaseViewport = {
  readonly height: number;
  readonly name: string;
  readonly width: number;
};

const showcaseViewports: readonly ShowcaseViewport[] = [
  { name: "narrow", width: 320, height: 800 },
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1280, height: 720 },
];

const evidenceDirectory = path.join(process.cwd(), ".omo", "evidence", "primitive-showcase");

test.describe.configure({ mode: "serial" });

test.beforeAll(async () => {
  await rm(evidenceDirectory, { recursive: true, force: true });
  await mkdir(evidenceDirectory, { recursive: true });
});

function evidencePath(fileName: string): string {
  return path.join(evidenceDirectory, fileName);
}

function expectedGap(viewport: ShowcaseViewport): string {
  return viewport.width >= 1024 ? "24px" : "16px";
}

async function waitForPaint(page: Page): Promise<void> {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      }),
  );
}

for (const viewport of showcaseViewports) {
  test(`renders the complete showcase without overflow at ${viewport.name}`, async ({ page }) => {
    // Given a production-rendered showcase at the target viewport.
    await page.setViewportSize({ width: viewport.width, height: viewport.height });

    // When the foundation route loads.
    await page.goto("/showcase");

    // Then the surface is complete, contained, and captured as fresh evidence.
    await expect(page.getByRole("heading", { level: 1, name: "Primitive showcase" })).toBeVisible();
    await expect(page.getByRole("region", { name: "Dark surface" })).toBeVisible();
    await expect(page.getByRole("region", { name: "Light surface" })).toBeVisible();
    const showcaseGap = await page
      .getByRole("main")
      .evaluate((element) => getComputedStyle(element).columnGap);
    expect(showcaseGap).toBe(expectedGap(viewport));
    const horizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(horizontalOverflow).toBe(0);
    await page.screenshot({
      path: evidencePath(`${viewport.name}.png`),
      fullPage: true,
      animations: "disabled",
    });
  });
}

test("exposes hover, focus, active, disabled, and reduced-motion states", async ({ page }) => {
  // Given the desktop showcase and its native controls.
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/showcase");
  const startControl = page.getByRole("button", { name: "Start a project" });
  const startFace = startControl.locator('[data-part="control-face"]');
  const disabledControl = page.getByRole("button", { name: "Unavailable action" });
  const disabledFace = disabledControl.locator('[data-part="control-face"]');

  // When pointer and keyboard users drive each state.
  await startControl.evaluate((element) => element.scrollIntoView({ block: "center" }));
  await waitForPaint(page);
  await page.screenshot({ path: evidencePath("states-rest.png") });
  await startControl.hover();
  await expect
    .poll(() =>
      startFace.evaluate((element) => ({
        animationCount: element.getAnimations().length,
        transform: getComputedStyle(element).transform,
      })),
    )
    .toMatchObject({ transform: "matrix(1, 0, 0, 1, 0, -4)" });
  await startFace.evaluate((element) => {
    for (const animation of element.getAnimations()) {
      animation.pause();
      animation.currentTime = 60;
    }
  });
  await waitForPaint(page);
  await page.screenshot({ path: evidencePath("states-hover-mid.png") });
  await startFace.evaluate((element) => {
    for (const animation of element.getAnimations()) {
      animation.finish();
    }
  });
  await expect(startControl).toHaveCSS("transform", "none");
  await expect(startFace).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, -4)");
  await waitForPaint(page);
  await page.screenshot({ path: evidencePath("states-hover.png") });
  await page.mouse.move(0, 0);
  await startControl.focus();
  await expect(startControl).toHaveCSS("outline-style", "dotted");
  await expect(startFace).toHaveCSS("transform", "none");
  await waitForPaint(page);
  await page.screenshot({ path: evidencePath("states-focus.png") });
  await page.keyboard.down("Space");
  await expect(startControl).toHaveCSS("transform", "none");
  await expect(startFace).toHaveCSS("transform", "matrix(1, 0, 0, 1, 4, 4)");
  await waitForPaint(page);
  await page.screenshot({ path: evidencePath("states-active.png") });
  await page.keyboard.up("Space");

  // Then disabled and reduced-motion users receive safe equivalent behavior.
  await expect(disabledControl).toBeDisabled();
  await disabledControl.hover();
  await expect(disabledControl).toHaveCSS("transform", "none");
  await expect(disabledFace).toHaveCSS("transform", "none");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  const reducedControl = page.getByRole("button", { name: "Start a project" });
  const reducedFace = reducedControl.locator('[data-part="control-face"]');
  await reducedFace.evaluate((element) => {
    element.style.animationDelay = "5s";
    element.style.transitionDelay = "5s";
  });
  await reducedControl.evaluate((element) => element.scrollIntoView({ block: "center" }));
  await reducedControl.hover();
  await expect(reducedControl).toHaveCSS("transform", "none");
  const allTransitionsAreImmediate = await reducedFace.evaluate((element) =>
    getComputedStyle(element)
      .transitionDuration.split(",")
      .every((duration) => duration.trim() === "0s"),
  );
  expect(allTransitionsAreImmediate).toBe(true);
  const allDelaysAreImmediate = await reducedFace.evaluate((element) => {
    const style = getComputedStyle(element);
    return [style.animationDelay, style.transitionDelay].every((delay) => delay === "0s");
  });
  expect(allDelaysAreImmediate).toBe(true);
  const restingBackground = await reducedFace.evaluate(
    (element) => getComputedStyle(element).backgroundColor,
  );
  await reducedControl.focus();
  await page.keyboard.down("Space");
  await expect(reducedFace).toHaveCSS("transform", "none");
  const pressedBackground = await reducedFace.evaluate(
    (element) => getComputedStyle(element).backgroundColor,
  );
  expect(pressedBackground).not.toBe(restingBackground);
  await waitForPaint(page);
  await page.screenshot({ path: evidencePath("reduced-motion.png") });
  await page.keyboard.up("Space");
});

test("keeps keyboard order and interactive states coherent across primitives", async ({ page }) => {
  // Given every interactive primitive on the desktop showcase.
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/showcase");
  const brand = page.getByRole("link", { name: "NOIR DIGITAL home" });
  const startControl = page.getByRole("button", { name: "Start a project" });
  const workLink = page.getByRole("link", { name: "View work" });
  const workFace = workLink.locator('[data-part="control-face"]');
  const lightControl = page.getByRole("button", { name: "Inspect system" });
  const lightFace = lightControl.locator('[data-part="control-face"]');
  const lightDisabled = page.getByRole("button", { name: "Disabled on light" });

  // When keyboard and pointer users traverse brand, link, and both control themes.
  await page.keyboard.press("Tab");
  await expect(brand).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(startControl).toBeFocused();
  await brand.hover();
  await page.mouse.down();
  await expect(brand).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, 4)");
  await page.mouse.move(0, 0);
  await page.mouse.up();
  await workLink.hover();
  await expect(workFace).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, -4)");
  await page.mouse.move(0, 0);
  await brand.focus();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await expect(workLink).toBeFocused();
  await expect(workLink).toHaveCSS("outline-style", "dotted");
  await lightControl.hover();
  await expect(lightFace).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, -4)");

  // Then every form remains visible, focusable, and natively disabled where specified.
  await page.mouse.move(0, 0);
  await page.keyboard.press("Tab");
  await expect(lightControl).toBeFocused();
  await expect(lightControl).toHaveCSS("outline-style", "dotted");
  await expect(lightDisabled).toBeDisabled();
  await waitForPaint(page);
  await page.screenshot({ path: evidencePath("interactive-primitives.png"), fullPage: true });
});

test("reflows without horizontal overflow at 320 CSS pixels", async ({ page }) => {
  // Given the production showcase at its 320 CSS-pixel reflow boundary.
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/showcase");

  // When the narrow layout settles.
  await waitForPaint(page);

  // Then the content reflows without horizontal scrolling.
  const horizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(horizontalOverflow).toBe(0);
  await page.screenshot({ path: evidencePath("reflow-320.png"), fullPage: true });
});

test("supports two-hundred-percent text enlargement without overflow or clipping", async ({
  page,
}) => {
  // Given the production showcase at 320 CSS pixels.
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/showcase");

  // When the root text size is enlarged to two hundred percent.
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "200%";
  });
  await waitForPaint(page);

  // Then text is genuinely enlarged, bounded, visible, and the maximum-width unit stays intact.
  const rootFontSize = await page.evaluate(
    () => getComputedStyle(document.documentElement).fontSize,
  );
  expect(rootFontSize).toBe("32px");
  const layoutLimit = page.getByText("1440 MAX", { exact: true });
  await expect(layoutLimit).toBeVisible();
  await expect(layoutLimit).toHaveCSS("white-space", "nowrap");
  const horizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(horizontalOverflow).toBe(0);
  const clippedText = await page.getByRole("main").evaluate((main) =>
    Array.from(main.querySelectorAll<HTMLElement>("h1, h2, h3, p, dt, dd, a, button, span"))
      .filter((element) => {
        const style = getComputedStyle(element);
        const clipsX = style.overflowX === "hidden" || style.overflowX === "clip";
        const clipsY = style.overflowY === "hidden" || style.overflowY === "clip";
        return (
          (clipsX && element.scrollWidth > element.clientWidth + 1) ||
          (clipsY && element.scrollHeight > element.clientHeight + 1)
        );
      })
      .map((element) => element.textContent?.trim() ?? element.tagName),
  );
  expect(clippedText).toEqual([]);
  await page.screenshot({
    path: evidencePath("text-enlargement-200.png"),
    fullPage: true,
    animations: "disabled",
  });
});
