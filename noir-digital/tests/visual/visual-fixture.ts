import { test as base, expect, type Page } from "@playwright/test";

const FIXED_TIME = "2026-07-09T16:00:00.000Z";
const STICKER_SEED = 2026;
const SCENE_SETTLE_TIME_MS = 2_000;

export type VisualEffects = "off" | "on";
export type VisualTheme = "dark" | "light" | "system";

export type VisualViewport = {
  readonly width: number;
  readonly height: number;
};

export type OpenVisualHomeOptions = {
  readonly effects: VisualEffects;
  readonly reducedMotion: boolean;
  readonly theme: VisualTheme;
  readonly viewport: VisualViewport;
};

type VisualFixtures = {
  readonly visualPage: Page;
};

export const test = base.extend<VisualFixtures>({
  visualPage: async ({ page }, use) => {
    await page.clock.install({ time: FIXED_TIME });
    await page.route("**/api/weather", (route) =>
      route.fulfill({
        contentType: "application/json",
        json: { location: "BR", temperature: 24 },
        status: 200,
      }),
    );
    await page.addInitScript((seed) => {
      let state = seed >>> 0;
      Math.random = () => {
        state = (state * 1_664_525 + 1_013_904_223) >>> 0;
        return state / 4_294_967_296;
      };
    }, STICKER_SEED);

    try {
      await use(page);
    } finally {
      await page.locator("canvas").evaluateAll((canvases) => {
        for (const canvas of canvases) {
          if (!(canvas instanceof HTMLCanvasElement)) continue;
          const context = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
          context?.getExtension("WEBGL_lose_context")?.loseContext();
        }
      });
    }
  },
});

async function pendingImageCount(page: Page): Promise<number> {
  return page
    .locator("img")
    .evaluateAll(
      (images) =>
        images.filter(
          (image) =>
            !(image instanceof HTMLImageElement) || !image.complete || image.naturalWidth === 0,
        ).length,
    );
}

async function waitForApplicationReadiness(page: Page, effects: VisualEffects): Promise<void> {
  await page.evaluate(() => document.fonts.ready);
  await page.locator("img").evaluateAll((images) => {
    for (const image of images) {
      if (image instanceof HTMLImageElement) image.loading = "eager";
    }
  });
  await expect.poll(() => pendingImageCount(page), { timeout: 15_000 }).toBe(0);
  await page.waitForLoadState("networkidle");
  await page.clock.runFor(SCENE_SETTLE_TIME_MS);
  await expect
    .poll(async () => {
      await page.clock.runFor(250);
      return page.locator('[data-site-canvas="true"] canvas').count();
    })
    .toBe(effects === "on" ? 1 : 0);

  await expect
    .poll(async () => {
      await page.clock.runFor(250);
      return page.evaluate(() => window.__NOIR_READY__);
    })
    .toBe(true);
  await expect
    .poll(
      async () => {
        await page.clock.runFor(250);
        return page.evaluate(() => window.__NOIR_DECOR_READY__);
      },
      { timeout: 30_000 },
    )
    .toBe(true);
}

export async function openVisualHome(page: Page, options: OpenVisualHomeOptions): Promise<void> {
  await page.setViewportSize(options.viewport);
  await page.emulateMedia({
    colorScheme: "light",
    reducedMotion: options.reducedMotion ? "reduce" : "no-preference",
  });
  await page.addInitScript((theme) => {
    localStorage.setItem("sound", "off");
    localStorage.setItem("theme", theme);
  }, options.theme);
  await page.goto(`/?effects=${options.effects}`, { waitUntil: "domcontentloaded" });
  await page.clock.runFor(SCENE_SETTLE_TIME_MS);

  await waitForApplicationReadiness(page, options.effects);
  await page.evaluate(({ height, width }) => {
    window.dispatchEvent(
      new PointerEvent("pointermove", {
        bubbles: true,
        clientX: width / 2,
        clientY: height / 2,
      }),
    );
  }, options.viewport);
  await page.clock.runFor(SCENE_SETTLE_TIME_MS);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
}

export async function positionVisualPage(page: Page, selector: string): Promise<void> {
  await page.locator(selector).evaluate((element) => {
    element.scrollIntoView({ behavior: "auto", block: "start" });
  });
  await page.clock.runFor(SCENE_SETTLE_TIME_MS);
  await expect(page.locator(selector)).toBeInViewport();
}

export async function settleVisualPage(page: Page): Promise<void> {
  await page.clock.runFor(SCENE_SETTLE_TIME_MS);
  await expect.poll(() => pendingImageCount(page), { timeout: 15_000 }).toBe(0);
}

export async function expectVisualSnapshot(page: Page, name: string): Promise<void> {
  await expect(page).toHaveScreenshot(name, {
    animations: "disabled",
    maxDiffPixelRatio: 0.01,
    scale: "css",
  });
}

export { expect };
