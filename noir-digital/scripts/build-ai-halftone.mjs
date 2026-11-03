import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "public", "brand", "ai-halftone.svg");

const size = 280;
const step = 7;
const light = { x: 190, y: 90, reach: 150 };
const maxRadius = 3.1;
const minRadius = 0.25;

// Dots shrink with distance from the light. They stay real circles: browsers draw strokes under
// one pixel as hairlines, which turns the faintest dots harsh and uneven.
const dots = [];

for (let y = 0; y <= size; y += step) {
  const rowOffset = (y / step) % 2 ? step / 2 : 0;

  for (let x = rowOffset; x <= size; x += step) {
    const distance = Math.hypot(x - light.x, y - light.y) / light.reach;
    if (distance >= 1) continue;

    const radius = (1 - distance) ** 2 * maxRadius + minRadius;
    dots.push(`<circle cx="${x}" cy="${y}" r="${radius.toFixed(2)}"/>`);
  }
}

writeFileSync(
  output,
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="#000">${dots.join("")}</svg>\n`,
);
