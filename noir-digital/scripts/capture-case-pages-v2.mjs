import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const baseUrl = process.argv[2] ?? "http://127.0.0.1:3100";
const outputDirectory = path.resolve("output/playwright/cases-after");
const slugs = [
  "together-site",
  "madeireira-fortaleza",
  "jr-express",
  "strong",
  "together-motion",
  "ecox-hostel-cabanas",
  "chapada-backpackers",
  "contabil-sudoeste",
  "posto-ipiranga",
];
const viewports = {
  desktop: { width: 1440, height: 1000 },
  mobile: { width: 390, height: 844 },
};

await fs.mkdir(outputDirectory, { recursive: true });

const browser = await chromium.launch({ headless: true });

try {
  for (const [mode, viewport] of Object.entries(viewports)) {
    const context = await browser.newContext({
      viewport,
      reducedMotion: "reduce",
      colorScheme: "dark",
    });
    const page = await context.newPage();

    for (const slug of slugs) {
      await page.goto(`${baseUrl}/services/${slug}`, {
        waitUntil: "networkidle",
      });
      await page.locator("[data-case-layout]").waitFor();
      await page.evaluate(async () => {
        const step = Math.max(window.innerHeight * 0.75, 480);
        for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await new Promise((resolve) => window.setTimeout(resolve, 40));
        }
        window.scrollTo(0, 0);
      });
      await page.screenshot({
        path: path.join(outputDirectory, `${slug}-${mode}.png`),
        fullPage: true,
      });
    }

    await context.close();
  }
} finally {
  await browser.close();
}

console.log(`Captured ${slugs.length * Object.keys(viewports).length} screenshots.`);
