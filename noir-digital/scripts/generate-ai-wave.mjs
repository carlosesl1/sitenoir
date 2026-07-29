import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const OUTPUT_ROOT = resolve("public/assets/v1/ai-services");
const GLYPHS = [".", ":", "+", "0", "1", "/", "\\"];
const TONES = ["#f4f4f0", "#bfdff3", "#2f80ff"];

const presets = [
  {
    file: "ascii-wave-desktop.svg",
    width: 1600,
    height: 900,
    columns: 132,
    rows: 62,
    cursor: true,
  },
  {
    file: "ascii-wave-mobile.svg",
    width: 720,
    height: 1120,
    columns: 68,
    rows: 96,
    cursor: false,
  },
];

function hash(x, y) {
  let value = Math.imul(x + 17, 374761393) ^ Math.imul(y + 31, 668265263);
  value = Math.imul(value ^ (value >>> 13), 1274126177);
  return ((value ^ (value >>> 16)) >>> 0) / 4294967295;
}

function number(value) {
  return Number(value.toFixed(2));
}

function glyphPath(glyph, x, y, size) {
  const left = number(x - size * 0.32);
  const right = number(x + size * 0.32);
  const top = number(y - size * 0.44);
  const bottom = number(y + size * 0.44);
  const middle = number(y);
  const short = number(size * 0.12);

  switch (glyph) {
    case ".":
      return `M${x} ${bottom}h${short}`;
    case ":":
      return `M${x} ${number(y - size * 0.2)}h${short}M${x} ${number(y + size * 0.28)}h${short}`;
    case "+":
      return `M${left} ${middle}H${right}M${x} ${top}V${bottom}`;
    case "0":
      return `M${left} ${top}H${right}V${bottom}H${left}Z`;
    case "1":
      return `M${number(x - size * 0.12)} ${number(top + size * 0.14)}L${x} ${top}V${bottom}`;
    case "/":
      return `M${left} ${bottom}L${right} ${top}`;
    case "\\":
      return `M${left} ${top}L${right} ${bottom}`;
    default:
      throw new TypeError(`Unknown glyph: ${glyph}`);
  }
}

function buildWave({ width, height, columns, rows, cursor }) {
  const paths = TONES.map(() => []);
  const xStep = width / (columns - 1);
  const yStep = height / (rows - 1);

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const nx = column / (columns - 1);
      const ny = row / (rows - 1);
      const wave =
        0.5 +
        Math.sin(nx * Math.PI * 2.3 + 0.45) * 0.13 +
        Math.sin(nx * Math.PI * 5.1) * 0.045;
      const thickness = 0.13 + Math.sin(nx * Math.PI) * 0.09;
      const distance = Math.abs(ny - wave);
      const random = hash(column, row);

      if (distance > thickness || random < (distance / thickness) * 0.62) {
        continue;
      }

      const intensity = 1 - distance / thickness;
      const blueBias = Math.max(0, (nx - 0.55) / 0.45);
      const tone = blueBias > 0.62 ? 2 : intensity > 0.56 ? 0 : 1;
      const glyph = GLYPHS[Math.floor(hash(row + 11, column + 23) * GLYPHS.length)];
      const x = number(column * xStep);
      const y = number(row * yStep);
      const size = number(Math.min(xStep, yStep) * (0.48 + intensity * 0.22));

      paths[tone].push(glyphPath(glyph, x, y, size));
    }
  }

  const pathMarkup = paths
    .map(
      (commands, index) =>
        `<path d="${commands.join("")}" fill="none" stroke="${TONES[index]}" stroke-opacity="${index === 0 ? 0.82 : 0.72}" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"/>`,
    )
    .join("");
  const cursorMarkup = cursor
    ? '<path d="M1360 472l96 42-50 20-20 55-46-117z" fill="#2f80ff"/><path d="M1360 472l46 62 50-20-96-42z" fill="#bfdff3" fill-opacity=".72"/>'
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" data-asset="ai-services-ascii-wave">${pathMarkup}${cursorMarkup}</svg>\n`;
}

await mkdir(OUTPUT_ROOT, { recursive: true });

for (const preset of presets) {
  const destination = resolve(OUTPUT_ROOT, preset.file);

  if (dirname(destination) !== OUTPUT_ROOT) {
    throw new Error("Unsafe output path");
  }

  await writeFile(destination, buildWave(preset), "utf8");
}
