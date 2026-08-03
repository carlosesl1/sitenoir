import { expect, test } from "@playwright/test";

test("uses native touch scrolling and high-density DOM work images on mobile", async ({
  page,
}, testInfo) => {
  await page.goto("/?effects=full", { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute("data-entry-ready", "true", {
    timeout: 30_000,
  });

  const card = page.getByTestId("project-together-site");
  const frame = card.locator("[data-work-card]");
  const image = card.locator('[data-image-role="primary"]');
  await card.scrollIntoViewIfNeeded();
  await expect(image).toHaveJSProperty("complete", true);

  const imageMetrics = await image.evaluate((element) => {
    const imageElement = element as HTMLImageElement;
    const candidate = /-(\d+)\.webp$/.exec(new URL(imageElement.currentSrc).pathname);
    return {
      candidateWidth: candidate ? Number(candidate[1]) : 2400,
      currentSrc: imageElement.currentSrc,
      renderedWidth: imageElement.getBoundingClientRect().width,
      requiredWidth: imageElement.getBoundingClientRect().width * window.devicePixelRatio,
    };
  });

  expect(imageMetrics.candidateWidth).toBeGreaterThanOrEqual(Math.ceil(imageMetrics.requiredWidth));
  await expect(page.locator('[data-work-card-canvas="true"]')).toHaveCount(0);
  await expect(frame).toHaveAttribute("data-canvas-active", "false");
  await expect(image).toHaveCSS("opacity", "1");
  expect(await page.evaluate(() => window.lenis?.touch === true)).toBe(false);
  await page.screenshot({ path: testInfo.outputPath("mobile-work-after.png") });
});

test("keeps a real touch gesture moving forward without scroll backtracking", async ({ page }) => {
  await page.goto("/?effects=full", { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute("data-entry-ready", "true", {
    timeout: 30_000,
  });
  await page.evaluate(() => {
    window.scrollTo(0, 0);
    const state = window as typeof window & { __NOIR_SCROLL_SAMPLES__?: number[] };
    state.__NOIR_SCROLL_SAMPLES__ = [window.scrollY];
    window.addEventListener("scroll", () => state.__NOIR_SCROLL_SAMPLES__?.push(window.scrollY), {
      passive: true,
    });
  });

  const session = await page.context().newCDPSession(page);
  await session.send("Input.dispatchTouchEvent", {
    touchPoints: [{ id: 0, x: 195, y: 710 }],
    type: "touchStart",
  });
  for (const y of [650, 585, 520, 455, 390, 325, 260, 195]) {
    await session.send("Input.dispatchTouchEvent", {
      touchPoints: [{ id: 0, x: 195, y }],
      type: "touchMove",
    });
    await page.waitForTimeout(16);
  }
  await session.send("Input.dispatchTouchEvent", { touchPoints: [], type: "touchEnd" });
  await page.waitForTimeout(500);

  const samples = await page.evaluate(() => {
    const state = window as typeof window & { __NOIR_SCROLL_SAMPLES__?: number[] };
    return state.__NOIR_SCROLL_SAMPLES__ ?? [];
  });
  const backtracking = samples.slice(1).filter((value, index) => value + 1 < (samples[index] ?? 0));

  expect(samples.length).toBeGreaterThan(2);
  expect(samples.at(-1) ?? 0).toBeGreaterThan(300);
  expect(backtracking).toHaveLength(0);
});
