import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sources = path.join(root, "asset-sources");
const output = path.join(root, "public", "cases");
const ffmpegPath = process.env["FFMPEG_PATH"] ?? "ffmpeg";

const imageAssets = [
  {
    output: ["together-site", "hero.webp"],
    source: ["together", "generated", "together-main-16x9.png"],
    width: 2400,
    height: 1350,
    fit: "cover",
  },
  {
    output: ["together-site", "full-page.webp"],
    source: ["together", "screenshots", "together-desktop-full.png"],
    width: 1600,
    height: 3200,
    fit: "contain",
  },
  {
    output: ["together-site", "mobile.webp"],
    source: ["together", "screenshots", "together-mobile-hero.png"],
    width: 900,
    height: 1600,
    fit: "cover",
  },
  {
    output: ["madeireira-fortaleza", "hero.webp"],
    source: ["madeireira-fortaleza", "screenshots", "madeireira-fortaleza-hero.png"],
    width: 1600,
    height: 900,
    fit: "cover",
  },
  {
    output: ["madeireira-fortaleza", "products.webp"],
    source: ["madeireira-fortaleza", "screenshots", "madeireira-fortaleza-section-01.png"],
    width: 1600,
    height: 900,
    fit: "contain",
  },
  {
    output: ["madeireira-fortaleza", "contact.webp"],
    source: ["madeireira-fortaleza", "screenshots", "madeireira-fortaleza-section-05.png"],
    width: 1600,
    height: 900,
    fit: "contain",
  },
  {
    output: ["jr-express", "hero.webp"],
    source: ["jr-express", "screenshots", "jr-express-hero.png"],
    width: 1600,
    height: 900,
    fit: "cover",
  },
  {
    output: ["jr-express", "quote.webp"],
    source: ["jr-express", "screenshots", "jr-express-section-01.png"],
    width: 1600,
    height: 900,
    fit: "contain",
  },
  {
    output: ["jr-express", "services.webp"],
    source: ["jr-express", "screenshots", "jr-express-section-02.png"],
    width: 1600,
    height: 900,
    fit: "contain",
  },
  {
    output: ["chapada-backpackers", "profile.webp"],
    source: [
      "google-presence",
      "chapada-backpackers",
      "generated",
      "chapada-google-main-google-16x9.png",
    ],
    width: 1600,
    height: 900,
    fit: "cover",
  },
  {
    output: ["chapada-backpackers", "search.webp"],
    source: ["google-presence", "chapada-backpackers", "screenshots", "google-profile.jpg"],
    width: 1265,
    height: 712,
    fit: "contain",
  },
  {
    output: ["contabil-sudoeste", "profile.webp"],
    source: ["google-presence", "contabil-sudoeste", "generated", "contabil-google-main.png"],
    width: 1600,
    height: 900,
    fit: "cover",
  },
  {
    output: ["contabil-sudoeste", "search.webp"],
    source: ["google-presence", "contabil-sudoeste", "screenshots", "google-profile.jpg"],
    width: 1265,
    height: 720,
    fit: "contain",
  },
  {
    output: ["posto-ipiranga", "profile.webp"],
    source: ["google-presence", "posto-ipiranga", "generated", "posto-google-main.png"],
    width: 1600,
    height: 900,
    fit: "cover",
  },
  {
    output: ["posto-ipiranga", "search.webp"],
    source: ["google-presence", "posto-ipiranga", "screenshots", "google-profile.jpg"],
    width: 1425,
    height: 900,
    fit: "contain",
  },
  {
    output: ["strong", "strong-whey-types.webp"],
    source: ["video-projects", "strong", "frames", "whey-types", "frame-03.jpg"],
    width: 720,
    height: 1280,
    fit: "cover",
  },
  {
    output: ["strong", "gladiator-ultra.webp"],
    source: ["video-projects", "strong", "frames", "gladiator-ultra", "frame-03.jpg"],
    width: 720,
    height: 1280,
    fit: "cover",
  },
  {
    output: ["strong", "cinco-sabores.webp"],
    source: ["video-projects", "strong", "frames", "cinco-sabores", "frame-03.jpg"],
    width: 720,
    height: 1280,
    fit: "cover",
  },
  {
    output: ["together-motion", "migracao-privacy-tools.webp"],
    source: ["video-projects", "together", "frames", "privacy-motion", "frame-03.jpg"],
    width: 1280,
    height: 720,
    fit: "cover",
  },
  {
    output: ["ecox-hostel-cabanas", "nova-cabana.webp"],
    source: ["video-projects", "ecox", "frames", "nova-cabana", "frame-03.jpg"],
    width: 720,
    height: 1280,
    fit: "cover",
  },
  {
    output: ["ecox-hostel-cabanas", "o-que-voce-encontra.webp"],
    source: ["video-projects", "ecox", "frames", "o-que-encontra", "frame-03.jpg"],
    width: 720,
    height: 1280,
    fit: "cover",
  },
];

const videoAssets = [
  {
    output: ["strong", "strong-whey-types.mp4"],
    source: ["video-projects", "strong", "source", "strong-whey-types.mp4"],
    orientation: "portrait",
  },
  {
    output: ["strong", "gladiator-ultra.mp4"],
    source: ["video-projects", "strong", "source", "gladiator-ultra.mp4"],
    orientation: "portrait",
  },
  {
    output: ["strong", "cinco-sabores.mp4"],
    source: ["video-projects", "strong", "source", "cinco-sabores.mp4"],
    orientation: "portrait",
  },
  {
    output: ["together-motion", "migracao-privacy-tools.mp4"],
    source: ["video-projects", "together", "source", "migracao-privacy-tools.mp4"],
    orientation: "landscape",
  },
  {
    output: ["ecox-hostel-cabanas", "nova-cabana.mp4"],
    source: ["video-projects", "ecox", "source", "nova-cabana.mp4"],
    orientation: "portrait",
  },
  {
    output: ["ecox-hostel-cabanas", "o-que-voce-encontra.mp4"],
    source: ["video-projects", "ecox", "source", "o-que-voce-encontra.mp4"],
    orientation: "portrait",
    preset: "ultrafast",
    crf: "26",
    tune: "fastdecode",
  },
];

const background = { r: 3, g: 3, b: 3, alpha: 1 };

for (const asset of imageAssets) {
  const sourcePath = path.join(sources, ...asset.source);
  const outputPath = path.join(output, ...asset.output);
  await mkdir(path.dirname(outputPath), { recursive: true });

  await sharp(sourcePath)
    .rotate()
    .resize(asset.width, asset.height, {
      fit: asset.fit,
      kernel: sharp.kernel.lanczos3,
      position: "centre",
      background,
      withoutEnlargement: false,
    })
    .sharpen({ sigma: 0.45 })
    .webp({ quality: 88, effort: 6, smartSubsample: true })
    .toFile(outputPath);

  console.log(`image ${asset.output.join("/")}: ${asset.width}x${asset.height}`);
}

function runFfmpeg(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(ffmpegPath, args, {
      cwd: root,
      stdio: ["ignore", "ignore", "pipe"],
      windowsHide: true,
    });
    let stderr = "";

    child.stderr.setEncoding("utf8");
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`ffmpeg exited with code ${code}\n${stderr}`));
    });
  });
}

for (const asset of videoAssets) {
  const sourcePath = path.join(sources, ...asset.source);
  const outputPath = path.join(output, ...asset.output);
  await mkdir(path.dirname(outputPath), { recursive: true });

  const videoFilter =
    asset.orientation === "portrait"
      ? "scale=720:1280:force_original_aspect_ratio=decrease,pad=720:1280:(ow-iw)/2:(oh-ih)/2:black"
      : "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2:black";

  const encodingArgs = [
    "-hide_banner",
    "-loglevel",
    "error",
    "-nostdin",
    "-y",
    "-threads",
    "1",
    "-i",
    sourcePath,
    "-vf",
    videoFilter,
    "-c:v",
    "libx264",
    "-preset",
    asset.preset ?? "medium",
    ...(asset.tune ? ["-tune", asset.tune] : []),
    "-crf",
    asset.crf ?? "24",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    "-movflags",
    "+faststart",
    outputPath,
  ];

  await runFfmpeg(encodingArgs);

  console.log(`video ${asset.output.join("/")}`);
}
