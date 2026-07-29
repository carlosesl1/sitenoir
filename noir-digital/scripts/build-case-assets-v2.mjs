import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const heroes = [
  {
    slug: "together-site",
    size: [2400, 1500],
    background: "asset-sources/case-redesign/together-site/background.png",
    layers: [
      {
        source: "asset-sources/together/screenshots/together-desktop-hero-clean.png",
        left: 720,
        top: 270,
        width: 1440,
        height: 810,
      },
      {
        source: "asset-sources/together/screenshots/together-mobile-hero-clean.png",
        left: 310,
        top: 470,
        width: 360,
        height: 640,
      },
    ],
  },
  {
    slug: "madeireira-fortaleza",
    size: [2400, 1500],
    background: "asset-sources/case-redesign/madeireira-fortaleza/background.png",
    layers: [
      {
        source:
          "asset-sources/madeireira-fortaleza/screenshots/madeireira-fortaleza-hero.png",
        left: 640,
        top: 260,
        width: 1536,
        height: 864,
      },
    ],
  },
  {
    slug: "jr-express",
    size: [2400, 1500],
    background: "asset-sources/case-redesign/jr-express/background.png",
    layers: [
      {
        source: "asset-sources/jr-express/screenshots/jr-express-hero.png",
        left: 660,
        top: 280,
        width: 1536,
        height: 864,
      },
    ],
  },
  {
    slug: "strong",
    size: [2400, 1500],
    background: "asset-sources/case-redesign/strong/background.png",
    layers: [
      {
        source: "asset-sources/video-projects/strong/frames/whey-types/frame-03.jpg",
        left: 360,
        top: 170,
        width: 520,
        height: 924,
      },
      {
        source:
          "asset-sources/video-projects/strong/frames/gladiator-ultra/frame-03.jpg",
        left: 940,
        top: 250,
        width: 520,
        height: 924,
      },
      {
        source:
          "asset-sources/video-projects/strong/frames/cinco-sabores/frame-03.jpg",
        left: 1520,
        top: 170,
        width: 520,
        height: 924,
      },
    ],
  },
  {
    slug: "together-motion",
    size: [2400, 1350],
    background: "asset-sources/case-redesign/together-motion/background.png",
    layers: [
      {
        source:
          "asset-sources/video-projects/together/frames/privacy-motion/frame-03.jpg",
        left: 420,
        top: 260,
        width: 1560,
        height: 878,
      },
    ],
  },
  {
    slug: "ecox-hostel-cabanas",
    size: [2400, 1500],
    background: "asset-sources/case-redesign/ecox-hostel-cabanas/background.png",
    layers: [
      {
        source:
          "asset-sources/video-projects/ecox/frames/nova-cabana/frame-03.jpg",
        left: 560,
        top: 190,
        width: 560,
        height: 996,
      },
      {
        source:
          "asset-sources/video-projects/ecox/frames/o-que-encontra/frame-03.jpg",
        left: 1280,
        top: 260,
        width: 560,
        height: 996,
      },
    ],
  },
  {
    slug: "chapada-backpackers",
    size: [2400, 1500],
    background: "asset-sources/case-redesign/chapada-backpackers/background.png",
    layers: [
      {
        source:
          "asset-sources/google-presence/chapada-backpackers/screenshots/google-profile.jpg",
        left: 520,
        top: 320,
        width: 1518,
        height: 854,
      },
    ],
  },
  {
    slug: "contabil-sudoeste",
    size: [2400, 1500],
    background: "asset-sources/case-redesign/contabil-sudoeste/background.png",
    layers: [
      {
        source:
          "asset-sources/google-presence/contabil-sudoeste/screenshots/google-profile.jpg",
        left: 500,
        top: 320,
        width: 1518,
        height: 864,
      },
    ],
  },
  {
    slug: "posto-ipiranga",
    size: [2400, 1500],
    background: "asset-sources/case-redesign/posto-ipiranga/background.png",
    layers: [
      {
        source:
          "asset-sources/google-presence/posto-ipiranga/screenshots/google-profile.jpg",
        left: 430,
        top: 280,
        width: 1596,
        height: 1008,
      },
    ],
  },
];

function resolveProjectPath(relativePath) {
  return path.join(root, ...relativePath.split("/"));
}

function frameSvg(width, height) {
  const outerWidth = width + 32;
  const outerHeight = height + 32;

  return Buffer.from(`
    <svg width="${outerWidth}" height="${outerHeight}" viewBox="0 0 ${outerWidth} ${outerHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#000000" flood-opacity="0.42"/>
        </filter>
      </defs>
      <rect x="16.5" y="16.5" width="${width - 1}" height="${height - 1}" fill="#080808" stroke="#ffffff" stroke-opacity="0.28" filter="url(#shadow)"/>
    </svg>
  `);
}

async function makeFramedLayer(layer) {
  const ui = await sharp(resolveProjectPath(layer.source))
    .resize(layer.width, layer.height, {
      fit: "contain",
      background: { r: 8, g: 8, b: 8, alpha: 1 },
      withoutEnlargement: false,
    })
    .png()
    .toBuffer();

  return sharp({
    create: {
      width: layer.width + 32,
      height: layer.height + 32,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      { input: frameSvg(layer.width, layer.height), left: 0, top: 0 },
      { input: ui, left: 16, top: 16 },
    ])
    .png()
    .toBuffer();
}

for (const hero of heroes) {
  const [width, height] = hero.size;
  const outputDirectory = resolveProjectPath(`public/cases-v2/${hero.slug}`);
  const outputFile = path.join(outputDirectory, "hero.webp");
  await mkdir(outputDirectory, { recursive: true });

  const layers = await Promise.all(
    hero.layers.map(async (layer) => ({
      input: await makeFramedLayer(layer),
      left: Math.max(0, layer.left - 16),
      top: Math.max(0, layer.top - 16),
    })),
  );

  await sharp(resolveProjectPath(hero.background))
    .resize(width, height, { fit: "cover", position: "centre" })
    .composite(layers)
    .webp({ quality: 90, effort: 6 })
    .toFile(outputFile);

  console.log(`Generated ${path.relative(root, outputFile)} (${width}x${height})`);
}

const creditOutputDirectory = resolveProjectPath("public/cases-v2/shared");
const creditOutputFile = path.join(creditOutputDirectory, "dolomon.webp");
await mkdir(creditOutputDirectory, { recursive: true });

await sharp(resolveProjectPath("asset-sources/people/dolomon/portrait-original.png"))
  .rotate()
  .resize(960, 960, {
    fit: "cover",
    position: "attention",
    withoutEnlargement: false,
  })
  .webp({ quality: 90, effort: 6 })
  .toFile(creditOutputFile);

console.log(`Generated ${path.relative(root, creditOutputFile)} (960x960)`);
