// Builds build/icon.png (the app icon) from the logo artwork. Run once when the logo changes:
//   npx electron scripts/make-icon.mjs <path-to-ibon-icon.png>
// Uses Electron's own image API, so it needs no extra dependency. The source art has wide transparent
// margins; this crops to the visible shape and centres it on a square canvas with a small margin.
// electron-builder converts the PNG to .ico (Windows) and .icns (macOS) at package time.
import { app, nativeImage } from "electron";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SIZE = 1024;
const MARGIN = 0.06; // fraction of the canvas left empty on each side

const src = process.argv.find((a) => a.toLowerCase().endsWith(".png") && !a.includes("node_modules"));
if (!src) {
  console.error("usage: electron scripts/make-icon.mjs <path-to-ibon-icon.png>");
  process.exit(1);
}

// Not top-level await: Electron emits `ready` only after an ES-module entry finishes loading.
app.whenReady().then(() => {
  try {
    run();
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  } finally {
    app.quit();
  }
});

function run() {
const input = nativeImage.createFromPath(src);
const { width, height } = input.getSize();
if (!width) throw new Error(`Could not read ${src}`);

// Bounding box of the visible (non-transparent) pixels. The alpha byte is the 4th of each BGRA/RGBA pixel.
const px = input.toBitmap();
let minX = width, minY = height, maxX = -1, maxY = -1;
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    if (px[(y * width + x) * 4 + 3] > 8) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}
if (maxX < 0) throw new Error("The image is fully transparent");

const cropped = input.crop({ x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 });
const cs = cropped.getSize();
const fit = Math.min((SIZE * (1 - 2 * MARGIN)) / cs.width, (SIZE * (1 - 2 * MARGIN)) / cs.height);
const w = Math.round(cs.width * fit);
const h = Math.round(cs.height * fit);
const scaled = cropped.resize({ width: w, height: h, quality: "best" });

// Paste the scaled art into the middle of a transparent square.
const canvas = Buffer.alloc(SIZE * SIZE * 4);
const sp = scaled.toBitmap();
const ox = Math.round((SIZE - w) / 2);
const oy = Math.round((SIZE - h) / 2);
for (let y = 0; y < h; y++) sp.copy(canvas, ((oy + y) * SIZE + ox) * 4, y * w * 4, (y + 1) * w * 4);

const out = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "build", "icon.png");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, nativeImage.createFromBitmap(canvas, { width: SIZE, height: SIZE }).toPNG());
console.log(`wrote ${out} (${SIZE}x${SIZE}, art ${w}x${h})`);
}
