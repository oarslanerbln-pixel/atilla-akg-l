import { mkdirSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { COLOURS, markSvg } from "./mark";

// Writes the images of the Wallet business card into public/wallet/:
//   icon*.png       Apple: lock screen and notifications (29 pt), mark on paper
//   logo*.png       Apple: top left of the pass (50 pt high), mark for the ink ground
//   thumbnail*.png  Apple: the portrait beside the name (90 pt)
//   google-logo.png Google: the pass logo, shown in a circle (660 px)
// The site serves them as they are, and the Apple pass endpoint packs them.
// npm run wallet

const ROOT = join(__dirname, "..", "..");
const OUT = join(ROOT, "public", "wallet");
mkdirSync(OUT, { recursive: true });

const ON_PAPER = { ink: COLOURS.ink, teal: COLOURS.teal, gold: COLOURS.gold };
const ON_INK = { ink: COLOURS.paper, teal: COLOURS.tealOnInk, gold: COLOURS.goldOnInk };
const INK_GROUND = "#140f0a";

/** Heavier lines at small sizes, as in export.ts, so the hairlines survive. */
const WEIGHT = { small: 5, medium: 4, large: 2.4 };

const svg = (s: string, px: number) => sharp(Buffer.from(s), { density: Math.ceil((72 * px) / 100) + 1 }).resize(px, px);

async function main() {
  for (const [scale, suffix] of [[1, ""], [2, "@2x"], [3, "@3x"]] as const) {
    const icon = 29 * scale;
    await svg(markSvg(WEIGHT.small, ON_PAPER, { tile: { fill: COLOURS.paper, rx: 0, pad: 12 } }), icon)
      .png()
      .toFile(join(OUT, `icon${suffix}.png`));

    const logo = 50 * scale;
    await svg(markSvg(scale === 1 ? WEIGHT.small : WEIGHT.medium, ON_INK), logo).png().toFile(join(OUT, `logo${suffix}.png`));

    // The face sits right of centre and high in the frame of atilla.webp.
    const thumb = 90 * scale;
    await sharp(join(ROOT, "public", "roadmap", "atilla.webp"))
      .extract({ left: 250, top: 0, width: 400, height: 400 })
      .resize(thumb, thumb)
      .png()
      .toFile(join(OUT, `thumbnail${suffix}.png`));
  }

  await svg(markSvg(WEIGHT.large, ON_INK, { tile: { fill: INK_GROUND, rx: 0, pad: 22 } }), 660)
    .png()
    .toFile(join(OUT, "google-logo.png"));

  console.log(`Wrote the Wallet images to ${OUT}`);
}

main();
