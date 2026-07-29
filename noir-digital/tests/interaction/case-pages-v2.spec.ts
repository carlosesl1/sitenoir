import { expect, test } from "@playwright/test";

const cases = [
  ["together-site", "site"],
  ["madeireira-fortaleza", "site"],
  ["jr-express", "site"],
  ["strong", "video"],
  ["together-motion", "video"],
  ["ecox-hostel-cabanas", "video"],
  ["chapada-backpackers", "google"],
  ["contabil-sudoeste", "google"],
  ["posto-ipiranga", "google"],
] as const;

for (const [slug, layout] of cases) {
  test(`${slug} publishes the ${layout} editorial layout`, async ({ page }) => {
    await page.goto(`/services/${slug}`);

    await expect(page.locator("[data-case-study]")).toHaveAttribute("data-case-study", slug);
    await expect(page.locator("[data-case-layout]")).toHaveAttribute("data-case-layout", layout);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("link", { name: /Planejar|Criar|Fortalecer/ })).toBeVisible();
  });
}

test("Strong keeps three controllable portrait videos", async ({ page }) => {
  await page.goto("/services/strong");

  await expect(page.locator("video")).toHaveCount(3);
  for (const video of await page.locator("video").all()) {
    await expect(video).toHaveAttribute("controls", "");
    await expect(video).not.toHaveAttribute("autoplay", "");
  }
});

test("video cases share Dolomon's real production portrait", async ({ page }) => {
  for (const slug of ["strong", "together-motion", "ecox-hostel-cabanas"]) {
    await page.goto(`/services/${slug}`);

    const portrait = page.getByRole("img", { name: "Retrato de Dolomon" });
    await expect(portrait).toBeVisible();
    await expect(portrait).toHaveAttribute("src", /dolomon\.webp/i);
    await portrait.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        portrait.evaluate(
          (image) => image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0,
        ),
      )
      .toBe(true);
  }
});

test("hero headings stay inside their copy area and never overlap media", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "desktop-chromium",
    "This test already exercises mobile through wide desktop viewports.",
  );
  test.setTimeout(120_000);

  for (const width of [390, 768, 900, 1024, 1280, 1366, 1440, 1536, 1920]) {
    await page.setViewportSize({ width, height: 1000 });

    for (const [slug] of cases) {
      await page.goto(`/services/${slug}`);

      const hero = page.locator("[data-case-layout] header").first();
      const heading = hero.getByRole("heading", { level: 1 });
      const media = hero.locator("figure").first();
      const [headingMetrics, copyBox, mediaBox] = await Promise.all([
        heading.evaluate((element) => {
          const range = document.createRange();
          range.selectNodeContents(element);
          const textBox = range.getBoundingClientRect();

          return {
            textBox: {
              left: textBox.left,
              right: textBox.right,
              top: textBox.top,
              bottom: textBox.bottom,
            },
            clientWidth: element.clientWidth,
            scrollWidth: element.scrollWidth,
          };
        }),
        heading.evaluate((element) => {
          const box = element.parentElement?.getBoundingClientRect();
          return box
            ? {
                left: box.left,
                right: box.right,
              }
            : null;
        }),
        media.boundingBox(),
      ]);

      expect(copyBox, `${slug} copy at ${width}px`).not.toBeNull();
      expect(mediaBox, `${slug} media at ${width}px`).not.toBeNull();

      if (!copyBox || !mediaBox) {
        continue;
      }

      expect
        .soft(
          headingMetrics.scrollWidth <= headingMetrics.clientWidth + 1,
          `${slug} heading text overflows its own box at ${width}px`,
        )
        .toBe(true);

      expect
        .soft(
          headingMetrics.textBox.right <= copyBox.right + 1,
          `${slug} painted heading exceeds its copy area at ${width}px`,
        )
        .toBe(true);

      const overlapsMedia =
        headingMetrics.textBox.left < mediaBox.x + mediaBox.width &&
        headingMetrics.textBox.right > mediaBox.x &&
        headingMetrics.textBox.top < mediaBox.y + mediaBox.height &&
        headingMetrics.textBox.bottom > mediaBox.y;

      expect.soft(overlapsMedia, `${slug} heading overlaps hero media at ${width}px`).toBe(false);
    }
  }
});

test("mobile layouts have no horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  for (const [slug] of cases) {
    await page.goto(`/services/${slug}`);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth === window.innerWidth),
    ).toBe(true);
  }
});
