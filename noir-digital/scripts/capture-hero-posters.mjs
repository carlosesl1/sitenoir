import { mkdir } from "node:fs/promises";
import path from "node:path";

import { chromium } from "@playwright/test";

const baseUrl = process.argv[2] ?? "https://noirdigital.com.br/";
const outputDirectory = path.join(process.cwd(), "work", "hero-posters");
const cases = [
  { deviceScaleFactor: 1, height: 720, name: "desktop-dark", theme: "dark", width: 1280 },
  { deviceScaleFactor: 1, height: 720, name: "desktop-light", theme: "light", width: 1280 },
  { deviceScaleFactor: 2, height: 844, name: "mobile-dark", theme: "dark", width: 390 },
  { deviceScaleFactor: 2, height: 844, name: "mobile-light", theme: "light", width: 390 },
];

await mkdir(outputDirectory, { recursive: true });
const browser = await chromium.launch({ headless: true });

try {
  for (const capture of cases) {
    const context = await browser.newContext({
      colorScheme: capture.theme,
      deviceScaleFactor: capture.deviceScaleFactor,
      reducedMotion: "reduce",
      viewport: { height: capture.height, width: capture.width },
    });
    await context.addInitScript(({ theme }) => {
      localStorage.setItem("sound", "off");
      localStorage.setItem("theme", theme);
      let state = 2026;
      Math.random = () => {
        state = (state * 1_664_525 + 1_013_904_223) >>> 0;
        return state / 4_294_967_296;
      };
    }, capture);

    const page = await context.newPage();
    const url = new URL(baseUrl);
    url.searchParams.set("effects", "full");
    url.searchParams.set("poster-capture", capture.name);
    await page.goto(url.toString(), { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => window.__NOIR_READY__ === true, null, { timeout: 30_000 });
    await page.evaluate(
      () =>
        new Promise((resolve) => {
          requestAnimationFrame(() => requestAnimationFrame(resolve));
        }),
    );

    await page.evaluate(() => {
      const canvas = document.querySelector('[data-site-canvas="true"] canvas');
      if (!(canvas instanceof HTMLCanvasElement)) throw new Error("Hero canvas was not found");
      for (const element of document.body.querySelectorAll("*")) {
        if (element === canvas || element.contains(canvas) || canvas.contains(element)) continue;
        if (element instanceof HTMLElement) {
          element.style.setProperty("visibility", "hidden", "important");
        }
      }
    });

    await page.screenshot({
      animations: "disabled",
      path: path.join(outputDirectory, `${capture.name}.png`),
    });
    await context.close();
  }
} finally {
  await browser.close();
}
