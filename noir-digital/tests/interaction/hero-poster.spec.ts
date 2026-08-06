import { expect, test } from "@playwright/test";

type PosterSample = {
  readonly canvasOpacity: number;
  readonly canvasReady: boolean;
  readonly compileMode: string | null;
  readonly posterOpacity: number;
  readonly posterPresent: boolean;
  readonly time: number;
};

for (const theme of ["dark", "light"] as const) {
  test(`crossfades the ${theme} hero poster only after shader compilation`, async ({ page }) => {
    await page.addInitScript((selectedTheme) => {
      localStorage.setItem("sound", "off");
      localStorage.setItem("theme", selectedTheme);
      const samples: PosterSample[] = [];
      Reflect.set(window, "__NOIR_POSTER_SAMPLES__", samples);
      const startedAt = performance.now();
      let previousSignature = "";

      const sample = () => {
        const poster = document.querySelector<HTMLElement>('[data-hero-poster="true"]');
        const canvas = document.querySelector<HTMLElement>('[data-site-canvas="true"]');
        const nextSample: PosterSample = {
          canvasOpacity: canvas ? Number.parseFloat(getComputedStyle(canvas).opacity) : 0,
          canvasReady: canvas?.dataset["canvasReady"] === "true",
          compileMode: (Reflect.get(window, "__NOIR_COMPILE_MODE__") as string | undefined) ?? null,
          posterOpacity: poster ? Number.parseFloat(getComputedStyle(poster).opacity) : 0,
          posterPresent: Boolean(poster),
          time: Math.round(performance.now() - startedAt),
        };
        const signature = JSON.stringify({ ...nextSample, time: 0 });
        if (signature !== previousSignature) {
          samples.push(nextSample);
          previousSignature = signature;
        }
        if (
          nextSample.time < 15_000 &&
          !(nextSample.canvasReady && nextSample.posterOpacity === 0)
        ) {
          requestAnimationFrame(sample);
        }
      };

      requestAnimationFrame(sample);
    }, theme);

    await page.goto("/?effects=full", { waitUntil: "domcontentloaded" });
    const poster = page.locator('[data-hero-poster="true"]');
    const canvas = page.locator('[data-site-canvas="true"]');
    await expect(poster).toBeAttached();
    await expect(canvas).toHaveAttribute("data-canvas-ready", "true", { timeout: 30_000 });
    await expect(canvas).toHaveCSS("opacity", "1");
    await expect(poster).toHaveCSS("opacity", "0");

    const samples = await page.evaluate(
      () => Reflect.get(window, "__NOIR_POSTER_SAMPLES__") as PosterSample[],
    );
    expect(samples.some((sample) => sample.posterPresent && sample.posterOpacity === 1)).toBe(true);
    expect(samples.at(-1)).toMatchObject({
      canvasOpacity: 1,
      canvasReady: true,
      compileMode: "async",
      posterOpacity: 0,
    });
    expect(
      samples
        .filter((sample) => sample.posterPresent)
        .every((sample) => sample.posterOpacity + sample.canvasOpacity >= 0.95),
    ).toBe(true);

    const mobile = test.info().project.name.includes("mobile");
    const expectedPoster = `${mobile ? "mobile" : "desktop"}-${theme}.webp`;
    await expect(poster).toHaveCSS("background-image", new RegExp(expectedPoster));
    expect(
      await page.evaluate(() =>
        performance
          .getEntriesByType("resource")
          .map((entry) => entry.name)
          .filter((name) => name.includes("/hero-posters/")),
      ),
    ).toEqual([expect.stringContaining(expectedPoster)]);
  });
}
