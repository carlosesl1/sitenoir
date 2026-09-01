import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sources = path.join(root, "asset-sources");
const output = path.join(root, "public", "work");

const featuredSize = { width: 2400, height: 1351 };
const standardSize = { width: 1200, height: 1200 };
const featuredVariantWidths = [640, 960, 1440];
const standardVariantWidths = [480, 720, 960];

const assets = [
  {
    output: "together-site-main.webp",
    source: ["together", "generated", "together-main-16x9.png"],
    featured: true,
  },
  {
    output: "together-site-hover.webp",
    source: ["together", "generated", "together-hover-black-16x9.png"],
    featured: true,
  },
  {
    output: "madeireira-fortaleza-main.webp",
    source: ["madeireira-fortaleza", "generated", "madeireira-fortaleza-main-square.png"],
  },
  {
    output: "madeireira-fortaleza-hover.webp",
    source: ["madeireira-fortaleza", "generated", "madeireira-fortaleza-hover.png"],
  },
  {
    output: "jr-express-main.webp",
    source: ["jr-express", "generated", "jr-express-main-square.png"],
  },
  {
    output: "jr-express-hover.webp",
    source: ["jr-express", "generated", "jr-express-hover.png"],
  },
  {
    output: "strong-main.webp",
    source: ["video-projects", "strong", "generated", "strong-video-main-16x9.png"],
    featured: true,
  },
  {
    output: "strong-hover.webp",
    source: ["video-projects", "strong", "generated", "strong-video-hover-16x9.png"],
    featured: true,
  },
  {
    output: "together-motion-main.webp",
    source: ["video-projects", "together", "generated", "together-video-main-square.png"],
  },
  {
    output: "together-motion-hover.webp",
    source: ["video-projects", "together", "generated", "together-video-hover.png"],
  },
  {
    output: "ecox-main.webp",
    source: ["video-projects", "ecox", "generated", "ecox-video-main-square.png"],
  },
  {
    output: "ecox-hover.webp",
    source: ["video-projects", "ecox", "generated", "ecox-video-hover.png"],
  },
  {
    output: "chapada-google-main.webp",
    source: [
      "google-presence",
      "chapada-backpackers",
      "generated",
      "chapada-google-main-google-16x9.png",
    ],
    featured: true,
  },
  {
    output: "chapada-google-hover.webp",
    source: [
      "google-presence",
      "chapada-backpackers",
      "generated",
      "chapada-google-hover-16x9.png",
    ],
    featured: true,
  },
  {
    output: "contabil-google-main.webp",
    source: [
      "google-presence",
      "contabil-sudoeste",
      "generated",
      "contabil-google-cinematic-pilot-real-day.png",
    ],
  },
  {
    output: "contabil-google-hover.webp",
    source: [
      "google-presence",
      "contabil-sudoeste",
      "generated",
      "contabil-google-cinematic-pilot-real-day.png",
    ],
  },
  {
    output: "posto-google-main.webp",
    source: [
      "google-presence",
      "posto-ipiranga",
      "generated",
      "posto-google-cinematic-pilot-real-day.png",
    ],
  },
  {
    output: "posto-google-hover.webp",
    source: [
      "google-presence",
      "posto-ipiranga",
      "generated",
      "posto-google-cinematic-pilot-real-day.png",
    ],
  },
];

async function writeWorkAsset(source, outputFile, width, height) {
  await sharp(source)
    .rotate()
    .resize(width, height, {
      fit: "cover",
      kernel: sharp.kernel.lanczos3,
      position: "centre",
    })
    .sharpen({ sigma: 0.7 })
    .webp({ quality: 94, effort: 6, smartSubsample: true })
    .toFile(path.join(output, outputFile));
}

for (const asset of assets) {
  const size = asset.featured ? featuredSize : standardSize;
  const variantWidths = asset.featured ? featuredVariantWidths : standardVariantWidths;
  const source = path.join(sources, ...asset.source);

  await writeWorkAsset(source, asset.output, size.width, size.height);
  console.log(`${asset.output}: ${size.width}x${size.height}`);

  for (const width of variantWidths) {
    const height = Math.round((width / size.width) * size.height);
    const variantOutput = asset.output.replace(/\.webp$/, `-${width}.webp`);
    await writeWorkAsset(source, variantOutput, width, height);
    console.log(`${variantOutput}: ${width}x${height}`);
  }
}
