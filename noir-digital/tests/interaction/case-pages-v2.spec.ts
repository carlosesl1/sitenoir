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

    await expect(page.locator("[data-case-study]")).toHaveAttribute(
      "data-case-study",
      slug,
    );
    await expect(page.locator("[data-case-layout]")).toHaveAttribute(
      "data-case-layout",
      layout,
    );
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(
      page.getByRole("link", { name: /Planejar|Criar|Fortalecer/ }),
    ).toBeVisible();
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

test("mobile layouts have no horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  for (const [slug] of cases) {
    await page.goto(`/services/${slug}`);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth === window.innerWidth,
      ),
    ).toBe(true);
  }
});
