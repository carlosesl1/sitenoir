import { createHash } from "node:crypto";
import { access, readFile } from "node:fs/promises";
import path from "node:path";

import { expect, test } from "vitest";

const signatures = {
  glb: [0x67, 0x6c, 0x54, 0x46],
  mp3: [0x49, 0x44, 0x33],
  png: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  webp: [0x52, 0x49, 0x46, 0x46],
  woff2: [0x77, 0x4f, 0x46, 0x32],
} as const;

const requiredBinaryAssets = [
  { path: "model/hello.glb", signature: signatures.glb },
  { path: "model/cursor.glb", signature: signatures.glb },
  { path: "stickers/noir-face.png", signature: signatures.png },
] as const;

const optimizedAssets = [
  { path: "assets/v1/fonts/TikTokSans.woff2", signature: signatures.woff2 },
  { path: "assets/v1/fonts/DepartureMono.woff2", signature: signatures.woff2 },
  { path: "assets/v1/model/hello-6991848c1d51.glb", signature: signatures.glb },
  { path: "assets/v1/model/cursor-a69d5b3f772e.glb", signature: signatures.glb },
  { path: "assets/v1/model/contact.glb", signature: signatures.glb },
  { path: "assets/v1/stickers/atlas.webp", signature: signatures.webp },
  { path: "assets/v1/stickers/atlas-mobile.webp", signature: signatures.webp },
  { path: "assets/v1/audio/bgm.mp3", signature: signatures.mp3 },
] as const;

test.each(
  requiredBinaryAssets,
)("ships a non-empty asset with the expected signature at $path", async ({
  path: assetPath,
  signature,
}) => {
  const asset = await readFile(path.join(process.cwd(), "public", assetPath));

  expect(asset.byteLength).toBeGreaterThan(0);
  expect(Array.from(asset.subarray(0, signature.length))).toEqual(signature);
});

test.each(optimizedAssets)("ships the optimized versioned asset at $path", async ({
  path: assetPath,
  signature,
}) => {
  const asset = await readFile(path.join(process.cwd(), "public", assetPath));

  expect(asset.byteLength).toBeGreaterThan(0);
  expect(Array.from(asset.subarray(0, signature.length))).toEqual(signature);
});

test("keeps authoring sources outside the deployed public tree", async () => {
  const legacySources = [
    "fonts/TikTokSans.ttf",
    "fonts/GeistMono[wght].ttf",
    "fonts/DepartureMono-Regular.otf",
    "model/cnt.gltf",
    "audio/bgm.mp3",
    "stickers/s_01.png",
  ];

  for (const assetPath of legacySources) {
    await expect(access(path.join(process.cwd(), "public", assetPath))).rejects.toThrow();
  }
});

test("records verified sizes and hashes for every generated versioned asset", async () => {
  const manifest = JSON.parse(
    await readFile(path.join(process.cwd(), "public/assets/v1/manifest.json"), "utf8"),
  ) as {
    readonly pipeline?: number;
    readonly assets?: readonly {
      readonly path?: string;
      readonly bytes?: number;
      readonly sha256?: string;
    }[];
  };

  const assets = manifest.assets ?? [];
  const expectedPaths = optimizedAssets.map((asset) => asset.path.replace("assets/v1/", "")).sort();

  expect(manifest.pipeline).toBe(1);
  expect(assets.map((asset) => asset.path).sort()).toEqual(expectedPaths);

  for (const asset of assets) {
    expect(asset.path).toBeTruthy();
    const contents = await readFile(path.join(process.cwd(), "public/assets/v1", asset.path ?? ""));
    expect(asset.bytes).toBe(contents.byteLength);
    expect(asset.sha256).toBe(createHash("sha256").update(contents).digest("hex"));
  }
});

test("keeps both sticker atlases within the initial-load performance budget", async () => {
  const desktopAtlas = await readFile(
    path.join(process.cwd(), "public/assets/v1/stickers/atlas.webp"),
  );
  const mobileAtlas = await readFile(
    path.join(process.cwd(), "public/assets/v1/stickers/atlas-mobile.webp"),
  );

  expect(desktopAtlas.byteLength).toBeLessThan(700 * 1024);
  expect(mobileAtlas.byteLength).toBeLessThan(250 * 1024);
});

test("subsets TikTok Sans without removing its visual variable axes", async () => {
  const font = await readFile(path.join(process.cwd(), "public/assets/v1/fonts/TikTokSans.woff2"));
  const pipeline = await readFile(path.join(process.cwd(), "scripts/optimize-assets.py"), "utf8");

  expect(font.byteLength).toBeGreaterThan(100 * 1024);
  expect(font.byteLength).toBeLessThan(120 * 1024);
  expect(pipeline).toContain('("wght=400:700", "wdth=100:120", "opsz=12:36", "slnt=0")');
});

test("content-hashes the two critical hero models and serves GLB with immutable caching", async () => {
  for (const assetPath of [
    "assets/v1/model/hello-6991848c1d51.glb",
    "assets/v1/model/cursor-a69d5b3f772e.glb",
  ]) {
    const contents = await readFile(path.join(process.cwd(), "public", assetPath));
    const contentHash = createHash("sha256").update(contents).digest("hex").slice(0, 12);
    expect(assetPath).toContain(`-${contentHash}.glb`);
  }

  const htaccess = await readFile(path.join(process.cwd(), "public/.htaccess"), "utf8");
  expect(htaccess).toMatch(/AddType\s+model\/gltf-binary\s+\.glb/);
  expect(htaccess).toContain(
    'SetEnvIf Request_URI "^/(?:_next/static|assets/v1)/" immutable_asset',
  );
  expect(htaccess).toContain(
    'Header set Cache-Control "public, max-age=31536000, immutable" env=immutable_asset',
  );
});

test("uses only TikTok Sans and Departure Mono across the runtime typography system", async () => {
  const sourcePaths = [
    "styles/fonts.css",
    "styles/tokens.css",
    "app/layout.tsx",
    "components/preloader/EntryPreloader.tsx",
    "components/showcase/PrimitiveShowcase.tsx",
  ];
  const sources = await Promise.all(
    sourcePaths.map((sourcePath) => readFile(path.join(process.cwd(), sourcePath), "utf8")),
  );
  const fontsCss = sources[0] ?? "";

  expect(fontsCss.match(/@font-face/g)).toHaveLength(2);
  expect(sources.join("\n")).not.toContain("Geist Mono");
  await expect(
    access(path.join(process.cwd(), "public/assets/v1/fonts/GeistMono.woff2")),
  ).rejects.toThrow();
});
