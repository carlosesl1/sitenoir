import { expect, test } from "@playwright/test";

test("a portfolio card opens its V2 case in the current tab", async ({ page }) => {
  await page.goto("/");

  const cardLink = page.getByTestId("project-together-site").getByRole("link");
  await cardLink.click();

  await expect(page).toHaveURL(/\/services\/together-site$/);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Complexidade técnica, leitura direta",
    }),
  ).toBeVisible();
  await expect(page.locator("[data-case-layout]")).toHaveAttribute(
    "data-case-layout",
    "site",
  );
});

test("site cases do not expose video credits", async ({ page }) => {
  await page.goto("/services/together-site");

  await expect(page.getByRole("heading", { name: "Dolomon" })).toHaveCount(0);
});

test("reduced motion keeps authored Google evidence visible", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/services/chapada-backpackers");

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("figure")).toHaveCount(3);
  await expect(
    page.getByRole("link", { name: /Fortalecer presença no Google/i }),
  ).toBeVisible();
});
