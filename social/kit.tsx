import { readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { ReactElement } from "react";
import { ImageResponse } from "next/og";
import sharp from "sharp";

// Shared pieces for the social templates: the brand's colours, self-hosted fonts, the exported
// brand artwork, photo framing and rendering. Colours mirror src/app/globals.css; the templates
// render outside the page's CSS, so they are literals here.

export const C = {
  porcelain: "#fcfbf9",
  alabaster: "#f4f1ea",
  ink: "#140f0a",
  text: "#181512",
  graphite: "#5a524a",
  gold: "#b38b59",
  goldLight: "#d8b482",
  goldReadable: "#7c5423",
  onInkSoft: "rgba(252, 251, 249, 0.72)",
  hairline: "rgba(24, 21, 18, 0.14)",
} as const;

/** Instagram reel cover and story: 9:16. The profile grid shows the middle 3:4 (y 240–1680). */
export const PORTRAIT = { width: 1080, height: 1920 } as const;
export const GRID_SAFE = { top: 240, bottom: 1680 } as const;

export type Lang = "de" | "en" | "tr";

const ROOT = join(__dirname, "..");
const read = (path: string) => readFileSync(join(ROOT, path));

function fontFiles(pkg: string, file: string, weight: 300 | 400 | 500 | 600, style: "normal" | "italic") {
  // latin carries German, latin-ext the Turkish letters (ğ, ş, ı, İ).
  return ["latin", "latin-ext"].map((subset) => ({
    name: pkg,
    data: read(`node_modules/@fontsource/${pkg}/files/${file}-${subset}-${weight}-${style}.woff`),
    weight,
    style,
  }));
}

const FONTS = [
  ...fontFiles("playfair-display", "playfair-display", 400, "normal"),
  ...fontFiles("playfair-display", "playfair-display", 400, "italic"),
  ...fontFiles("playfair-display", "playfair-display", 600, "normal"),
  ...fontFiles("inter", "inter", 400, "normal"),
  ...fontFiles("inter", "inter", 500, "normal"),
  ...fontFiles("inter", "inter", 600, "normal"),
  ...fontFiles("inter-tight", "inter-tight", 300, "normal"),
  ...fontFiles("inter-tight", "inter-tight", 500, "normal"),
];

export const serif = "playfair-display";
export const sans = "inter";
export const display = "inter-tight";

const svgUri = (path: string) => `data:image/svg+xml;base64,${read(path).toString("base64")}`;

/** Exported brand artwork (public/brand/); the wordmark in it is outlined, never retyped. */
export const brand = {
  logoOnInk: { src: svgUri("public/brand/logo-horizontal-reverse.svg"), ratio: 514.38 / 64 },
  logoOnLight: { src: svgUri("public/brand/logo-horizontal.svg"), ratio: 514.38 / 64 },
  markOnInk: svgUri("public/brand/compass-mark-reverse.svg"),
  markOnLight: svgUri("public/brand/compass-mark.svg"),
};

export interface PhotoSpec {
  /** Path from the repo root, e.g. social/assets/frame.jpg. Use a full-resolution video frame. */
  src: string;
  /** Point to keep in view (the face), as fractions of the photo's width and height. */
  focus: [number, number];
  /** Extra zoom on top of filling the frame. */
  zoom?: number;
  /** Areas to blur, e.g. bystanders' faces: [x, y, width, height] as fractions of the photo. */
  blur?: [number, number, number, number][];
}

/**
 * The photo cut to a box: filled, zoomed, with the focus point placed at `anchorY` of the box
 * height where the photo allows. Returned as a data URI for <img>.
 */
export async function framePhoto(spec: PhotoSpec, width: number, height: number, anchorY = 0.3): Promise<string> {
  let source = await sharp(read(spec.src)).rotate().toBuffer();
  const { width: W, height: H } = await sharp(source).metadata();

  if (spec.blur?.length) {
    // Feathered ellipses of a blurred copy, so the patches don't read as boxes.
    const feather = Math.round(Math.min(W, H) * 0.012);
    const shapes = spec.blur
      .map(([x, y, w, h]) => `<ellipse cx="${(x + w / 2) * W}" cy="${(y + h / 2) * H}" rx="${(w / 2) * W}" ry="${(h / 2) * H}" fill="#fff"/>`)
      .join("");
    const mask = Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><filter id="f"><feGaussianBlur stdDeviation="${feather}"/></filter><g filter="url(#f)">${shapes}</g></svg>`,
    );
    const blurred = await sharp(source).blur(Math.max(8, Math.min(W, H) * 0.02)).toBuffer();
    const patch = await sharp(blurred).composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
    source = await sharp(source).composite([{ input: patch }]).toBuffer();
  }

  const scale = Math.max(width / W, height / H) * (spec.zoom ?? 1);
  const sw = Math.round(W * scale);
  const sh = Math.round(H * scale);
  const clamp = (v: number, max: number) => Math.min(Math.max(Math.round(v), 0), max);
  const left = clamp(spec.focus[0] * sw - width / 2, sw - width);
  const top = clamp(spec.focus[1] * sh - height * anchorY, sh - height);
  const out = await sharp(source)
    .resize(sw, sh, { kernel: "lanczos3" })
    .extract({ left, top, width, height })
    .jpeg({ quality: 92 })
    .toBuffer();
  return `data:image/jpeg;base64,${out.toString("base64")}`;
}

/** Renders a template to a PNG file. */
export async function renderPng(element: ReactElement, out: string, size: { width: number; height: number } = PORTRAIT) {
  const res = new ImageResponse(element, { ...size, fonts: FONTS });
  await mkdir(dirname(out), { recursive: true });
  await writeFile(out, Buffer.from(await res.arrayBuffer()));
}

/**
 * Side-by-side preview of several renders at half size, with the profile grid's 3:4 crop marked,
 * for choosing between options.
 */
export async function contactSheet(files: string[], out: string) {
  const w = PORTRAIT.width / 2;
  const h = PORTRAIT.height / 2;
  const gap = 40;
  const guide = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><g stroke="#d8b482" stroke-width="2" stroke-dasharray="10 8"><line x1="0" y1="${GRID_SAFE.top / 2}" x2="${w}" y2="${GRID_SAFE.top / 2}"/><line x1="0" y1="${GRID_SAFE.bottom / 2}" x2="${w}" y2="${GRID_SAFE.bottom / 2}"/></g></svg>`,
  );
  const tiles = await Promise.all(
    files.map(async (f, i) => ({
      input: await sharp(f).resize(w, h).composite([{ input: guide }]).png().toBuffer(),
      left: gap + i * (w + gap),
      top: gap,
    })),
  );
  await sharp({
    create: { width: gap + files.length * (w + gap), height: h + gap * 2, channels: 3, background: C.alabaster },
  })
    .composite(tiles)
    .png()
    .toFile(out);
}
