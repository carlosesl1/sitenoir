import type { Locator, Page, TestInfo } from "@playwright/test";
import { expect, test } from "@playwright/test";

const appOrigin = "http://127.0.0.1:3105";
const homepage = "/?effects=off";

function isMobileProject(testInfo: TestInfo): boolean {
  return testInfo.project.name === "mobile-chromium";
}

async function openMobileMenu(page: Page): Promise<Locator> {
  const dialog = page.getByRole("dialog", { name: "Menu" });
  if (!(await dialog.isVisible())) {
    await page.getByRole("button", { name: "Abrir menu" }).click();
  }
  await expect(dialog).toBeVisible();
  return dialog;
}

async function headerButton(page: Page, name: "Tema", mobile: boolean): Promise<Locator> {
  if (mobile) return (await openMobileMenu(page)).getByRole("button", { name });
  return page.getByRole("navigation", { name: "Principal" }).getByRole("button", { name });
}

async function navigateFromHeader(
  page: Page,
  target: "Contato" | "Serviços",
  mobile: boolean,
): Promise<void> {
  if (mobile) {
    await (await openMobileMenu(page)).getByRole("button", { name: target }).click();
    return;
  }
  await page
    .getByRole("navigation", { name: "Principal" })
    .getByRole("button", { name: target })
    .click();
}

test("scrolls to selected work from Serviços in the responsive header", async ({
  page,
}, testInfo) => {
  // Given the homepage at its initial scroll position.
  await page.goto(homepage);

  // When Serviços is activated through the visible header navigation.
  await navigateFromHeader(page, "Serviços", isMobileProject(testInfo));

  // Then the selected-work section enters the viewport.
  await expect(page.locator("#selected-work")).toBeInViewport({ timeout: 5_000 });
});

test("scrolls to contact from the responsive header", async ({ page }, testInfo) => {
  // Given the homepage at its initial scroll position.
  await page.goto(homepage);

  // When Contato is activated through the visible header navigation.
  await navigateFromHeader(page, "Contato", isMobileProject(testInfo));

  // Then the contact footer enters the viewport.
  await expect(page.locator("#contact")).toBeInViewport({ timeout: 5_000 });
});

test("cycles system, light, and dark themes and survives reload", async ({ page }, testInfo) => {
  // Given a light system preference and no explicit theme choice.
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto(homepage);
  await expect.poll(() => page.evaluate(() => localStorage.getItem("theme"))).toBe("system");
  const mobile = isMobileProject(testInfo);

  // When the user cycles through every theme mode.
  await (await headerButton(page, "Tema", mobile)).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect.poll(() => page.evaluate(() => localStorage.getItem("theme"))).toBe("light");
  await (await headerButton(page, "Tema", mobile)).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect.poll(() => page.evaluate(() => localStorage.getItem("theme"))).toBe("dark");
  await (await headerButton(page, "Tema", mobile)).click();
  await expect.poll(() => page.evaluate(() => localStorage.getItem("theme"))).toBe("system");

  // Then the system mode remains active after reload.
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect.poll(() => page.evaluate(() => localStorage.getItem("theme"))).toBe("system");
});

test("traps mobile-menu focus and restores it after Escape", async ({ page }, testInfo) => {
  test.skip(!isMobileProject(testInfo), "Mobile navigation behavior");
  // Given the mobile menu is open and initially focuses Início.
  await page.goto(homepage);
  const trigger = page.getByRole("button", { name: "Abrir menu" });
  const triggerBox = await trigger.boundingBox();
  expect(triggerBox?.width).toBeGreaterThanOrEqual(44);
  expect(triggerBox?.height).toBeGreaterThanOrEqual(44);
  const dialog = await openMobileMenu(page);
  const home = dialog.getByRole("button", { name: "Início" });
  const theme = dialog.getByRole("button", { name: "Tema" });
  await expect(home).toBeFocused();

  // When focus moves backwards from the first item and forwards from the last item.
  await page.keyboard.press("Shift+Tab");
  await expect(theme).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(home).toBeFocused();

  // Then Escape closes the dialog and restores focus to its trigger.
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

for (const shortcut of [
  { initial: "dark", key: "l", stored: "light", resolved: "light" },
  { initial: "light", key: "d", stored: "dark", resolved: "dark" },
  { initial: "dark", key: "a", stored: "system", resolved: "light" },
] as const) {
  test(`dispatches ${shortcut.key.toUpperCase()} to the ${shortcut.stored} theme`, async ({
    page,
  }) => {
    // Given a deterministic light system preference and an explicit dark theme.
    await page.emulateMedia({ colorScheme: "light" });
    await page.addInitScript((initial) => localStorage.setItem("theme", initial), shortcut.initial);
    await page.goto(homepage);

    // When the theme shortcut is pressed.
    await page.keyboard.press(`Alt+${shortcut.key}`);

    // Then the requested theme mode is stored and resolved.
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem("theme")), {
        message: `Shortcut ${shortcut.key.toUpperCase()} should store ${shortcut.stored}`,
        timeout: 2_000,
      })
      .toBe(shortcut.stored);
    await expect(page.locator("html")).toHaveAttribute("data-theme", shortcut.resolved);
  });
}

test("dispatches T to the top of the page", async ({ page }) => {
  // Given the user is at the contact footer.
  await page.goto(homepage);
  await page.locator("#contact").evaluate((element) => element.scrollIntoView());
  await expect(page.locator("#contact")).toBeInViewport();

  // When the top shortcut is pressed.
  await page.keyboard.press("Alt+t");

  // Then the home section enters the viewport.
  await expect(page.locator("#home")).toBeInViewport({ timeout: 2_000 });
});

test("dispatches B to the contact footer", async ({ page }) => {
  // Given the user is at the top of the homepage.
  await page.goto(homepage);

  // When the bottom shortcut is pressed.
  await page.keyboard.press("Alt+b");

  // Then the contact footer enters the viewport.
  await expect(page.locator("#contact")).toBeInViewport({ timeout: 2_000 });
});

test("exposes every section without staged hiding under reduced motion", async ({ page }) => {
  // Given reduced motion is preferred.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(homepage);

  // When the complete semantic homepage is inspected.
  const sections = page.locator("main > section, main > footer");

  // Then all sections and every principle stage remain exposed.
  await expect(sections).toHaveCount(6);
  for (const section of await sections.all()) await expect(section).toBeVisible();
  const stages = page.locator("#principles [data-stage]");
  await expect(stages).toHaveCount(4);
  for (const stage of await stages.all()) await expect(stage).toBeVisible();
  await expect(page.locator('#principles [data-stage][aria-hidden="true"]')).toHaveCount(0);
});

test("reaches every header control and project link in keyboard tab order", async ({
  page,
}, testInfo) => {
  // Given the homepage has loaded with no focused control.
  await page.goto(homepage);
  const projectLinks = page.locator('[data-testid^="project-"] > a');
  const expectedHrefs = await projectLinks.evaluateAll((links) =>
    links.map((link) => link.getAttribute("href")).filter((href) => href !== null),
  );
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    window.scrollTo(0, 0);
  });

  // When keyboard focus traverses the document.
  const focusedHrefs = new Set<string>();
  const focusedControls = new Set<string>();
  for (let index = 0; index < 32; index += 1) {
    await page.keyboard.press("Tab");
    const focus = await page.evaluate(() => ({
      ariaLabel: document.activeElement?.getAttribute("aria-label") ?? "",
      href: document.activeElement?.getAttribute("href") ?? "",
      text: document.activeElement?.textContent?.trim() ?? "",
    }));
    if (focus.href) focusedHrefs.add(focus.href);
    if (focus.ariaLabel) focusedControls.add(focus.ariaLabel);
    if (focus.text) focusedControls.add(focus.text);
  }

  // Then every project link and every visible header control is reachable.
  expect(expectedHrefs).toHaveLength(9);
  for (const href of expectedHrefs) expect(focusedHrefs).toContain(href);
  if (isMobileProject(testInfo)) {
    expect(focusedControls).toContain("Abrir menu");
  } else {
    for (const label of ["Serviços", "Contato", "Tema"]) {
      expect(focusedControls).toContain(label);
    }
  }
});

test("has no runtime errors, failed same-origin requests, overflow, or duplicate canvases", async ({
  page,
}) => {
  // Given diagnostics are attached before the WebGL homepage loads.
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  const requestFailures: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("requestfailed", (request) => {
    if (new URL(request.url()).origin === appOrigin) {
      requestFailures.push(
        `${request.method()} ${request.url()}: ${request.failure()?.errorText ?? "failed"}`,
      );
    }
  });
  page.on("response", (response) => {
    if (new URL(response.url()).origin === appOrigin && response.status() >= 400) {
      requestFailures.push(`${response.status()} ${response.url()}`);
    }
  });

  // When the full homepage and its scene settle.
  await page.goto("/?effects=on");
  await page.waitForLoadState("networkidle");

  // Then the runtime remains healthy and owns exactly one canvas.
  expect.soft(pageErrors, "Unhandled page errors").toEqual([]);
  expect.soft(consoleErrors, "Unexpected console errors").toEqual([]);
  expect.soft(requestFailures, "Failed same-origin requests").toEqual([]);
  expect
    .soft(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
  await expect.soft(page.locator('[data-site-canvas="true"] canvas')).toHaveCount(1);
});
