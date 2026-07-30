import { expect, test } from "@playwright/test";

const SCENE_READY_TIMEOUT_MS = 30_000;

test("keeps one healthy WebGL scene through theme and viewport transitions", async ({ page }) => {
  const runtimeErrors: string[] = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") runtimeErrors.push(message.text());
  });

  await page.goto("/?effects=on");
  await expect
    .poll(() => page.evaluate(() => window.__NOIR_READY__), {
      timeout: SCENE_READY_TIMEOUT_MS,
    })
    .toBe(true);
  await expect(page.locator('[data-site-canvas="true"] canvas')).toHaveCount(1);

  await page.keyboard.press("Alt+d");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.keyboard.press("Alt+l");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.setViewportSize({ width: 1280, height: 720 });
  await expect(page.locator('[data-site-canvas="true"] canvas')).toHaveCount(1);

  expect(runtimeErrors).toEqual([]);
});

test("returns tracked listeners to baseline after repeated mobile-menu cycles", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const active = new Map<string, number>();
    const trackedTypes = new Set(["keydown", "pointermove", "resize"]);
    const originalAdd = EventTarget.prototype.addEventListener;
    const originalRemove = EventTarget.prototype.removeEventListener;

    EventTarget.prototype.addEventListener = function addEventListener(type, listener, options) {
      if ((this === window || this === document) && trackedTypes.has(type)) {
        const key = `${this === window ? "window" : "document"}:${type}`;
        active.set(key, (active.get(key) ?? 0) + 1);
      }
      return Reflect.apply(originalAdd, this, [type, listener, options]);
    };

    EventTarget.prototype.removeEventListener = function removeEventListener(
      type,
      listener,
      options,
    ) {
      if ((this === window || this === document) && trackedTypes.has(type)) {
        const key = `${this === window ? "window" : "document"}:${type}`;
        active.set(key, Math.max(0, (active.get(key) ?? 0) - 1));
      }
      return Reflect.apply(originalRemove, this, [type, listener, options]);
    };

    Object.defineProperty(window, "__listenerAudit", {
      configurable: true,
      get: () => Object.fromEntries(active),
    });
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?effects=on");
  await expect
    .poll(() => page.evaluate(() => window.__NOIR_READY__), {
      timeout: SCENE_READY_TIMEOUT_MS,
    })
    .toBe(true);
  await expect(page.locator("html")).toHaveAttribute("data-entry-ready", "true", {
    timeout: SCENE_READY_TIMEOUT_MS,
  });
  await page.getByRole("button", { name: "Abrir menu" }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Menu" })).toHaveCount(0);
  const baseline = await page.evaluate(() => Reflect.get(window, "__listenerAudit"));

  for (let cycle = 0; cycle < 4; cycle += 1) {
    await page.getByRole("button", { name: "Abrir menu" }).click();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: "Menu" })).toHaveCount(0);
  }

  await expect(page.locator('[data-site-canvas="true"] canvas')).toHaveCount(1);
  expect(await page.evaluate(() => Reflect.get(window, "__listenerAudit"))).toEqual(baseline);
});

test("keeps cold-load hero geometry stable until fonts and models are ready", async ({ page }) => {
  await page.addInitScript(() => {
    let layoutShiftTotal = 0;
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const value = Reflect.get(entry, "value");
        if (!Reflect.get(entry, "hadRecentInput") && typeof value === "number") {
          layoutShiftTotal += value;
        }
      }
    });
    observer.observe({ type: "layout-shift", buffered: true });
    Object.defineProperty(window, "__layoutShiftTotal", {
      configurable: true,
      get: () => layoutShiftTotal,
    });
  });

  await page.goto("/?effects=on", { waitUntil: "domcontentloaded" });
  const initial = await page.getByRole("heading", { level: 1 }).boundingBox();
  await page.evaluate(() => document.fonts.ready);
  await expect
    .poll(() => page.evaluate(() => window.__NOIR_READY__), {
      timeout: SCENE_READY_TIMEOUT_MS,
    })
    .toBe(true);
  const settled = await page.getByRole("heading", { level: 1 }).boundingBox();
  const layoutShiftTotal = await page.evaluate(() => Reflect.get(window, "__layoutShiftTotal"));

  expect(initial).not.toBeNull();
  expect(settled).not.toBeNull();
  expect(Math.abs((initial?.x ?? 0) - (settled?.x ?? 0))).toBeLessThan(2);
  expect(Math.abs((initial?.y ?? 0) - (settled?.y ?? 0))).toBeLessThan(2);
  expect(Math.abs((initial?.width ?? 0) - (settled?.width ?? 0))).toBeLessThan(2);
  expect(layoutShiftTotal).toBeLessThan(0.05);
});
