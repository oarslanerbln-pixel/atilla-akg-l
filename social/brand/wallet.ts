import { mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { COLOURS, markSvg } from "./mark";

// Writes the images the Wallet passes carry (src/lib/wallet):
//   src/assets/wallet/   Apple Wallet: icon, logo, thumbnail, each at 1x, 2x, 3x
//   public/wallet/       Google Wallet: logo and hero, fetched by Google from the site
// npx tsx social/brand/wallet.ts

const ROOT = join(__dirname, "..", "..");
const APPLE = join(ROOT, "src", "assets", "wallet");
const GOOGLE = join(ROOT, "public", "wallet");
mkdirSync(APPLE, { recursive: true });
mkdirSync(GOOGLE, { recursive: true });

/** The pass's ground, the site's --bg-ink. */
const INK_GROUND = "#140f0a";
const REVERSE = { ink: COLOURS.paper, teal: COLOURS.tealOnInk, gold: COLOURS.goldOnInk };
const SCALES = [1, 2, 3] as const;
const suffix = (scale: number) => (scale === 1 ? "" : `@${scale}x`);

async function main() {
  // Icon: the app icon's tile (the mark on paper, heavy cut for small sizes), 29 pt.
  const icon = Buffer.from(markSvg(4, { ink: COLOURS.ink, teal: COLOURS.teal, gold: COLOURS.gold }, { tile: { fill: COLOURS.paper, rx: 0, pad: 6 } }));
  for (const scale of SCALES) {
    await sharp(icon, { density: 600 }).resize(29 * scale, 29 * scale).png().toFile(join(APPLE, `icon${suffix(scale)}.png`));
  }

  // Logo: the horizontal lockup in reverse, top left of the pass. At most 160 × 50 pt.
  const lockup = readFileSync(join(ROOT, "public", "brand", "logo-horizontal-reverse.svg"));
  for (const scale of SCALES) {
    await sharp(lockup, { density: 600 }).resize({ width: 160 * scale }).png().toFile(join(APPLE, `logo${suffix(scale)}.png`));
  }

  // Thumbnail: the portrait from the contact file, 90 pt square.
  const portrait = join(ROOT, "src", "assets", "card", "portrait.jpg");
  for (const scale of SCALES) {
    await sharp(portrait).resize(90 * scale, 90 * scale).png().toFile(join(APPLE, `thumbnail${suffix(scale)}.png`));
  }

  // Google logo: the reverse mark on ink, 660 px square (Google crops it to a circle).
  const googleLogo = Buffer.from(markSvg(2, REVERSE, { tile: { fill: INK_GROUND, rx: 0, pad: 18 } }));
  await sharp(googleLogo, { density: 600 }).resize(660, 660).png().toFile(join(GOOGLE, "google-logo.png"));

  // Google hero: the lounge portrait as a 1032 × 336 banner, his face in the upper third.
  await sharp(join(ROOT, "public", "card", "atilla.webp"))
    .resize({ width: 1032 })
    .extract({ left: 0, top: 36, width: 1032, height: 336 })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(join(GOOGLE, "google-hero.jpg"));
}

main();
