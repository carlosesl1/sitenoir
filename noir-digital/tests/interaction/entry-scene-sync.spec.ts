import { expect, test } from "@playwright/test";

for (const theme of ["dark", "light"] as const) {
  test(`keeps the ${theme} preloader until the first compiled 3D frame`, async ({ page }) => {
    await page.addInitScript((selectedTheme) => {
      localStorage.setItem("sound", "off");
      localStorage.setItem("theme", selectedTheme);
    }, theme);

    await page.goto("/?effects=full", { waitUntil: "domcontentloaded" });

    const preloader = page.locator('[data-entry-preloader="true"]');
    const symbol = page.locator('[data-testid="noir-symbol-preloader"]');
    const canvas = page.locator('[data-site-canvas="true"]');
    await expect(preloader).toBeAttached();
    await expect(symbol).toBeAttached();
    await expect(symbol).toHaveCSS("width", "118px");
    await expect(symbol.locator("[data-symbol-source]")).toHaveCount(2);
    await expect(symbol.locator("[data-symbol-emissary]")).toHaveCount(6);
    await expect(symbol.locator("[data-symbol-tip]")).toHaveCount(6);
    await expect(symbol.locator('[data-symbol-layer="ghost"] path').first()).toHaveCSS(
      "stroke",
      theme === "dark" ? "rgb(255, 255, 255)" : "rgb(3, 3, 3)",
    );
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

test("holds a solid white mark while the critical scene is delayed", async ({ page }) => {
  await page.route("**/assets/v1/model/hello-*.glb", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 4_500));
    await route.continue();
  });
  await page.addInitScript(() => {
    localStorage.setItem("sound", "off");
    localStorage.setItem("theme", "dark");
  });

  await page.goto("/?effects=full", { waitUntil: "domcontentloaded" });

  const preloader = page.locator('[data-entry-preloader="true"]');
  const symbol = page.locator('[data-testid="noir-symbol-preloader"]');
  await expect(symbol).toHaveAttribute("data-symbol-phase", "complete", { timeout: 4_000 });
  await expect(preloader).toBeAttached();

  const fill = symbol.locator('[data-symbol-layer="fill"]');
  await expect(fill).toHaveCSS("opacity", "1");
  await expect(fill.locator("path").first()).toHaveCSS("fill", "rgb(255, 255, 255)");
});
