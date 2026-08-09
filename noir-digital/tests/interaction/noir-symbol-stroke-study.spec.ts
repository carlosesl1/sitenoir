import { readFile } from "node:fs/promises";
import { createServer, type Server } from "node:http";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { expect, test } from "@playwright/test";

const root = resolve(import.meta.dirname, "../..");
const prototypePath = resolve(root, "prototypes/noir-symbol-stroke-study.html");
const sourcePath = resolve(root, "public/brand/noir-symbol.svg");
const pathsFrom = (source: string) =>
  Array.from(source.matchAll(/<path\s+d="([^"]+)"/g), (match) => match[1]);

type ProbeState = {
  phase: "void" | "heart" | "flight" | "draw" | "ignite" | "rest" | "rewind";
  time: number;
  contours: Array<{ progress: number; mainOpacity: number; tipOpacity: number }>;
  heartOpacity: number;
  fillOpacity: number;
  scale: number;
};

declare global {
  interface Window {
    __probe?: {
      at(time: number): ProbeState;
      state(): ProbeState;
      rewind(localTime: number, baseTime?: number): ProbeState;
    };
  }
}

let server: Server;
let httpURL = "";

test.beforeAll(async () => {
  server = createServer(async (request, response) => {
    if (!request.url?.startsWith("/noir-symbol-stroke-study.html")) {
      response.writeHead(404).end();
      return;
    }
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(await readFile(prototypePath));
  });
  await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Prototype server failed");
  httpURL = `http://127.0.0.1:${address.port}/noir-symbol-stroke-study.html`;
});

test.afterAll(async () => {
  await new Promise<void>((done, reject) =>
    server.close((error) => (error ? reject(error) : done())),
  );
});

test("embeds the canonical NOIR symbol without visible copy", async ({ page }) => {
  const fileURL = pathToFileURL(prototypePath);
  fileURL.search = "?probe";
  await page.goto(fileURL.href);
  await expect(page.locator("main[role=button]")).toHaveAttribute(
    "aria-label",
    "Ícone da NOIR sendo desenhado. Ative para reproduzir novamente.",
  );
  await expect(page.locator("svg")).toHaveAttribute("viewBox", "0 0 164 186");
  expect(
    await page
      .locator("[data-source-path]")
      .evaluateAll((items) => items.map((item) => item.getAttribute("d"))),
  ).toEqual(pathsFrom(await readFile(sourcePath, "utf8")));
  await expect(page.locator("body")).toHaveText("");
});

test("loads over HTTP without page errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`${httpURL}?probe`);
  await expect(page.locator("[data-source-path]")).toHaveCount(2);
  expect(errors).toEqual([]);
});

test("renders every approved beat deterministically", async ({ page }) => {
  await page.goto(`${httpURL}?probe`);
  const at = (time: number) => page.evaluate((value) => window.__probe?.at(value), time);

  expect(await at(0.25)).toMatchObject({ phase: "void", heartOpacity: 0, fillOpacity: 0 });
  expect((await at(0.9))?.heartOpacity).toBeGreaterThan(0);
  expect(await at(1.6)).toMatchObject({ phase: "flight" });
  expect((await at(2.8))?.contours.some((item) => item.progress > 0)).toBe(true);
  expect(await at(5.7)).toMatchObject({ phase: "ignite" });
  const rest = await at(6.4);
  expect(rest).toMatchObject({ phase: "rest" });
  expect(rest?.contours.every((item) => item.progress === 1)).toBe(true);
  expect(rest?.fillOpacity).toBeGreaterThan(0);
  expect(await at(2.8)).toEqual(await at(2.8));
});

test("builds every reference layer for both contours", async ({ page }) => {
  await page.goto(`${httpURL}?probe`);
  for (const layer of ["ghost", "chase", "glow", "flash", "main"]) {
    await expect(page.locator(`[data-layer="${layer}"] path`)).toHaveCount(2);
  }
  await expect(page.locator("[data-emissary]")).toHaveCount(6);
  await expect(page.locator("[data-pen-tip]")).toHaveCount(6);
  await expect(page.locator('[data-emissary][data-seed="upper-right"]')).toHaveCount(1);
  await expect(page.locator('[data-emissary][data-seed="inner-lower"]')).toHaveCount(1);
  await expect(page.locator('[data-emissary][data-seed="lower-right"]')).toHaveCount(1);
  await expect(page.locator('[data-emissary][data-seed="top"]')).toHaveCount(1);
  await expect(page.locator('[data-emissary][data-seed="upper-left"]')).toHaveCount(1);
  await expect(page.locator('[data-emissary][data-seed="lower-left"]')).toHaveCount(1);
});

test("lands as a solid white NOIR symbol in the dark theme", async ({ page }) => {
  await page.goto(`${httpURL}?probe`);
  await page.evaluate(() => {
    document.documentElement.setAttribute("data-theme", "dark");
    window.__probe?.at(7.3);
  });
  const finalMark = await page
    .locator('[data-layer="fill"] path')
    .first()
    .evaluate((path) => ({
      fill: getComputedStyle(path).fill,
      groupOpacity: Number(getComputedStyle(path.parentElement as SVGGElement).opacity),
    }));
  expect(finalMark).toEqual({ fill: "rgb(255, 255, 255)", groupOpacity: 1 });
});

test("unravels before pointer and keyboard replay", async ({ page }) => {
  await page.goto(`${httpURL}?probe`);
  for (const input of ["pointer", "Enter", "Space"] as const) {
    await page.evaluate(() => window.__probe?.at(6.4));
    if (input === "pointer") await page.locator("main").click();
    else await page.locator("main").press(input);
    await expect.poll(() => page.evaluate(() => window.__probe?.state().phase)).toBe("rewind");
    expect(
      (await page.evaluate(() => window.__probe?.rewind(0.2, 6.4)))?.contours.some(
        (item) => item.progress < 1,
      ),
    ).toBe(true);
  }
});

test("uses a complete static mark for reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`${httpURL}?probe`);
  const state = await page.evaluate(() => window.__probe?.state());
  expect(state).toMatchObject({ phase: "rest" });
  expect(state?.contours.every((item) => item.progress === 1)).toBe(true);
});

test("supports system and explicit themes", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto(`${httpURL}?probe`);
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).colorScheme)).toBe(
    "light",
  );
  await page.evaluate(() => document.documentElement.setAttribute("data-theme", "dark"));
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).colorScheme)).toBe(
    "dark",
  );
  await page.evaluate(() => document.documentElement.setAttribute("data-theme", "light"));
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).colorScheme)).toBe(
    "light",
  );
});

test("keeps the full symbol inside mobile and desktop viewports", async ({ page }) => {
  await page.goto(`${httpURL}?probe`);
  await page.evaluate(() => window.__probe?.at(6.4));
  for (const viewport of [
    { width: 320, height: 568 },
    { width: 390, height: 844 },
    { width: 1280, height: 720 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    const box = await page.locator("svg").boundingBox();
    expect(box).not.toBeNull();
    expect(box?.x).toBeGreaterThanOrEqual(0);
    expect(box?.y).toBeGreaterThanOrEqual(0);
    expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(viewport.width);
    expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(viewport.height);
  }
});

test("keeps the ignition window brighter than the bloom bed", async ({ page }) => {
  await page.goto(`${httpURL}?probe`);
  await page.evaluate(() => window.__probe?.at(5.7));
  const layers = await page.evaluate(() => ({
    flash: Array.from(document.querySelectorAll<SVGPathElement>('[data-layer="flash"] path')).map(
      (path) => ({ opacity: Number(path.style.opacity), dash: path.style.strokeDasharray }),
    ),
    glow: Array.from(document.querySelectorAll<SVGPathElement>('[data-layer="glow"] path')).map(
      (path) => Number(path.style.opacity),
    ),
  }));
  expect(layers.flash.every((flash) => flash.dash.length > 0)).toBe(true);
  expect(layers.flash.every((flash, index) => flash.opacity - layers.glow[index] > 0.3)).toBe(true);
});
