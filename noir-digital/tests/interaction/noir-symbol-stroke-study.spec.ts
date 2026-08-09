import { createServer, type Server } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { expect, test } from "@playwright/test";

const root = resolve(import.meta.dirname, "../..");
const prototypePath = resolve(root, "prototypes/noir-symbol-stroke-study.html");
const sourcePath = resolve(root, "public/brand/noir-symbol.svg");
const pathsFrom = (source: string) =>
  Array.from(source.matchAll(/<path\s+d="([^"]+)"/g), (match) => match[1]);

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
