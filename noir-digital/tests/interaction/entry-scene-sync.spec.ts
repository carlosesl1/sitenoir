import { expect, test } from "@playwright/test";

for (const theme of ["dark", "light"] as const) {
  test(`keeps the ${theme} preloader until the first compiled 3D frame`, async ({ page }) => {
    await page.addInitScript((selectedTheme) => {
      localStorage.setItem("sound", "off");
      localStorage.setItem("theme", selectedTheme);
    }, theme);

    await page.goto("/?effects=full", { waitUntil: "domcontentloaded" });

    const preloader = page.locator('[data-entry-preloader="true"]');
    const canvas = page.locator('[data-site-canvas="true"]');
    await expect(preloader).toBeAttached();
    await expect(canvas).toBeAttached({ timeout: 15_000 });
    await expect(page.locator('[data-hero-poster="true"]')).toHaveCount(0);

    await expect(canvas).toHaveAttribute("data-canvas-ready", "true", { timeout: 30_000 });
    await expect(preloader).toBeAttached();
    await expect(preloader).not.toBeAttached({ timeout: 5_000 });

    await expect
      .poll(() =>
        page.evaluate(() => ({
          compileMode: window.__NOIR_COMPILE_MODE__,
          entryReady: document.documentElement.dataset["entryReady"],
          sceneReady: document.documentElement.dataset["sceneReady"],
          sceneStatus: window.__NOIR_SCENE_STATUS__,
        })),
      )
      .toEqual({
        compileMode: expect.stringMatching(/^(async|sync)$/),
        entryReady: "true",
        sceneReady: "true",
        sceneStatus: "ready",
      });
    await expect(canvas).toHaveCSS("opacity", "1");
  });
}
