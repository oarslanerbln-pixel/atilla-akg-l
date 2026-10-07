import { mkdirSync } from "node:fs";
import { join } from "node:path";
import sharp, { type OverlayOptions } from "sharp";
import { COLOURS, markSvg } from "./mark";

// Proof sheet for the traced mark: the trace over the Flow original, and the
// mark at the sizes the site uses, per line weight.
// npx tsx social/brand/preview.ts  ->  social/out/brand/

const ROOT = join(__dirname, "..", "..");
const OUT = join(ROOT, "social", "out", "brand");
const SOURCE = join(ROOT, "social", "assets", "logo-flow-2026-10.jpg");
const WEIGHTS = [1, 2, 3, 4];
const SIZES = [22, 38, 44, 64, 120];

async function main() {
  mkdirSync(OUT, { recursive: true });

  // 1. Overlay: the mark box (0..100) is 1149 px of the 2000 px original, from (425, 323).
  const base = await sharp(SOURCE).extract({ left: 425, top: 323, width: 1149, height: 1149 }).resize(1000).toBuffer();
  const red = markSvg(1, { ink: "#e0002a", teal: "#e0002a", gold: "#e0002a" }, { size: 1000 }).replace("<svg ", '<svg opacity="0.55" ');
  await sharp(base).composite([{ input: Buffer.from(red) }]).png().toFile(join(OUT, "overlay.png"));

  const clean = markSvg(1, COLOURS, { size: 1000 }).replace("<svg ", `<svg style="background:${COLOURS.paper}" `);
  await sharp(Buffer.from(clean)).flatten({ background: COLOURS.paper }).png().toFile(join(OUT, "vector-1000.png"));

  // 2. Sizes per weight, on paper and on ink.
  const cell = 150;
  const width = cell * SIZES.length * 2;
  const height = cell * WEIGHTS.length;
  const layers: OverlayOptions[] = [];
  WEIGHTS.forEach((w, row) => {
    SIZES.forEach((s, col) => {
      for (const dark of [false, true]) {
        const colours = dark ? { ink: COLOURS.paper, teal: COLOURS.tealOnInk, gold: COLOURS.goldOnInk } : COLOURS;
        const x = (dark ? SIZES.length : 0) * cell + col * cell;
        layers.push({ input: Buffer.from(markSvg(w, colours, { size: s })), left: x + (cell - s) / 2, top: row * cell + (cell - s) / 2 });
      }
    });
  });
  const ground = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="${width / 2}" height="${height}" fill="${COLOURS.paper}"/><rect x="${width / 2}" width="${width / 2}" height="${height}" fill="#140f0a"/></svg>`,
  );
  await sharp(ground).composite(layers).png().toFile(join(OUT, "sizes.png"));
  console.log(OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
