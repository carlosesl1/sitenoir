import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

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
const columns = 3;
const cardWidth = 480;
const cardHeight = 420;
const labelHeight = 42;

async function buildSheet(
  sourceDirectory,
  mode,
  outputName,
  firstFold = false,
  fileAliases = {},
) {
  const cards = await Promise.all(
    slugs.map(async (slug) => {
      const source = path.join(
        sourceDirectory,
        `${fileAliases[slug] ?? slug}-${mode}.png`,
      );
      const pipeline = sharp(source);
      const metadata = await pipeline.metadata();
      const foldHeight = mode === "desktop" ? 1000 : 844;
      const prepared = firstFold
        ? pipeline.extract({
            left: 0,
            top: 0,
            width: metadata.width,
            height: Math.min(foldHeight, metadata.height),
          })
        : pipeline;
      const image = await prepared
        .resize(cardWidth, cardHeight - labelHeight, {
          fit: firstFold ? "cover" : "contain",
          background: "#111111",
          position: "top",
        })
        .png()
        .toBuffer();
      const label = Buffer.from(
        `<svg width="${cardWidth}" height="${labelHeight}" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#050505"/>
          <text x="18" y="27" fill="#ffffff" font-family="Arial, sans-serif" font-size="16" font-weight="600">${slug}</text>
        </svg>`,
      );

      return sharp({
        create: {
          width: cardWidth,
          height: cardHeight,
          channels: 4,
          background: "#111111",
        },
      })
        .composite([
          { input: image, top: 0, left: 0 },
          { input: label, top: cardHeight - labelHeight, left: 0 },
        ])
        .png()
        .toBuffer();
    }),
  );

  const rows = Math.ceil(cards.length / columns);
  const canvas = sharp({
    create: {
      width: columns * cardWidth,
      height: rows * cardHeight,
      channels: 4,
      background: "#050505",
    },
  });

  await canvas
    .composite(
      cards.map((input, index) => ({
        input,
        left: (index % columns) * cardWidth,
        top: Math.floor(index / columns) * cardHeight,
      })),
    )
    .png()
    .toFile(path.resolve("output/case-redesign", outputName));
}

await fs.mkdir(path.resolve("output/case-redesign"), { recursive: true });
await buildSheet(
  path.resolve("output/playwright/cases-after"),
  "desktop",
  "cases-after-desktop.png",
);
await buildSheet(
  path.resolve("output/playwright/cases-after"),
  "mobile",
  "cases-after-mobile.png",
);
await buildSheet(
  path.resolve("output/playwright/cases-before"),
  "desktop",
  "cases-before-desktop-fold.png",
  true,
  {
    strong: "strong-videos",
    "ecox-hostel-cabanas": "ecox-videos",
  },
);
await buildSheet(
  path.resolve("output/playwright/cases-after"),
  "desktop",
  "cases-after-desktop-fold.png",
  true,
);

console.log("Built full-page and first-fold review sheets.");
