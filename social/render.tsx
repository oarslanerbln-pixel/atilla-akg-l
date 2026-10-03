import { readFileSync } from "node:fs";
import { join } from "node:path";
import { contactSheet, framePhoto, renderPng } from "./kit";
import { COVER_TEMPLATES, type CoverBrief, type CoverTemplate } from "./templates/covers";
import { flightsStory, type FlightsBrief } from "./templates/flights";
import { RATE_CARD, rateCard, type RatesBrief } from "./templates/rates";

// npm run social -- social/briefs/<brief>.json
// Renders the brief's images into social/out/. See social/README.md.

const OUT = join(__dirname, "out");

async function renderCovers(brief: CoverBrief) {
  const names = brief.templates ?? (Object.keys(COVER_TEMPLATES) as CoverTemplate[]);
  const files: string[] = [];
  for (const name of names) {
    const template = COVER_TEMPLATES[name];
    const { width, height, anchorY } = template.photo;
    const photo = await framePhoto(brief.photo, width, height, anchorY);
    const file = join(OUT, `${brief.name}-${name}.png`);
    await renderPng(template.render(brief, photo), file);
    files.push(file);
  }
  if (files.length > 1) {
    const sheet = join(OUT, `${brief.name}-overview.png`);
    await contactSheet(files, sheet);
    files.push(sheet);
  }
  return files;
}

async function main() {
  const path = process.argv[2];
  if (!path) throw new Error("Usage: npm run social -- social/briefs/<brief>.json");
  const brief = JSON.parse(readFileSync(path, "utf8")) as CoverBrief | FlightsBrief | RatesBrief;

  let files: string[];
  if (brief.kind === "cover") {
    files = await renderCovers(brief);
  } else if (brief.kind === "flights") {
    const file = join(OUT, `${brief.name}.png`);
    await renderPng(flightsStory(brief), file);
    files = [file];
  } else if (brief.kind === "rates") {
    const file = join(OUT, `${brief.name}.png`);
    await renderPng(rateCard(brief), file, RATE_CARD);
    files = [file];
  } else {
    throw new Error(`Unknown brief kind in ${path}`);
  }
  for (const f of files) console.log(f);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
