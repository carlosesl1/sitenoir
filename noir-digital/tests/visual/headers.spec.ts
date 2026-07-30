import { expect, test } from "@playwright/test";

const revalidatedAssets = [
  "/model/hello.glb",
  "/stickers/noir-face.png",
  "/work/ali01.png",
] as const;

const expectedCacheControl = "public, max-age=0, must-revalidate";
const immutableCacheControl = "public, max-age=31536000, immutable";
const versionedAssets = [
  "/assets/v1/fonts/TikTokSans.woff2",
  "/assets/v1/model/contact.glb",
  "/assets/v1/stickers/atlas.webp",
  "/assets/v1/audio/bgm.mp3",
] as const;

test("preserves production security headers", async ({ request }) => {
  const response = await request.get("/");

  expect(response.status()).toBe(200);
  expect(response.headers()).toMatchObject({
    "permissions-policy": "camera=(), microphone=(), geolocation=()",
    "referrer-policy": "strict-origin-when-cross-origin",
    "x-content-type-options": "nosniff",
    "x-frame-options": "SAMEORIGIN",
  });
  expect(response.headers()["x-powered-by"]).toBeUndefined();
});

for (const assetPath of revalidatedAssets) {
  test(`revalidates the stable public asset ${assetPath}`, async ({ request }) => {
    const response = await request.get(assetPath);
    const cacheControl = response.headers()["cache-control"];

    expect(response.status()).toBe(200);
    expect(cacheControl).toBe(expectedCacheControl);
    expect(cacheControl).not.toContain("immutable");
  });
}

for (const assetPath of versionedAssets) {
  test(`caches the versioned public asset ${assetPath} immutably`, async ({ request }) => {
    const response = await request.get(assetPath);

    expect(response.status()).toBe(200);
    expect(response.headers()["cache-control"]).toBe(immutableCacheControl);
  });
}
