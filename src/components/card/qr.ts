import { MARK } from "@/components/brandMarkPaths";
import type { Language } from "@/i18n/translations";

/**
 * The QR codes on the back of the digital business card (/card).
 *
 * The matrices are computed on the server (src/lib/card.ts, with the
 * `qrcode` package, which never reaches the browser) and handed to the page
 * as hex strings. This file draws them: the data modules with rounded ends,
 * rounded eyes with a gold pupil for the three finder patterns, and the brand
 * mark in a cleared square at the centre. Error correction is level H, so the
 * cleared square (about 6 % of the modules) costs nothing a camera needs.
 *
 * The same drawing serves the page (colours as CSS custom properties) and
 * the link preview (colours as hex, for next/og), so the two never differ.
 */

/** In the order the card offers them; the first, the website, is the one a turned card shows. */
export const QR_TARGETS = ["web", "whatsapp", "instagram", "card"] as const;
export type QrTarget = (typeof QR_TARGETS)[number];

/** One QR code: its width in modules and its modules, row by row, four to a hex digit. */
export type QrMatrix = { size: number; hex: string };

/** What a code opens, and the code itself. */
export type QrEntry = { url: string; matrix: QrMatrix };

/** Every code the card can show, by language and target. */
export type CardCodes = Record<Language, Record<QrTarget, QrEntry>>;

export type QrColors = {
  ink: string;
  pupil: string;
  paper: string;
  teal: string;
  sun: string;
};

/** Packs a module grid (1 = dark) into hex, four modules to a digit. */
export function packModules(data: ArrayLike<number>): string {
  let hex = "";
  for (let i = 0; i < data.length; i += 4) {
    const nibble = ((data[i] ? 8 : 0) | (data[i + 1] ? 4 : 0) | (data[i + 2] ? 2 : 0) | (data[i + 3] ? 1 : 0));
    hex += nibble.toString(16);
  }
  return hex;
}

function unpack({ size, hex }: QrMatrix): Uint8Array {
  const modules = new Uint8Array(size * size);
  for (let i = 0; i < modules.length; i++) {
    modules[i] = (parseInt(hex[i >> 2], 16) >> (3 - (i & 3))) & 1;
  }
  return modules;
}

/** The cleared square in the centre, in modules: odd, so it sits on the grid's middle. */
function holeSize(size: number): number {
  return size >= 33 ? 9 : 7;
}

const round = (n: number) => Math.round(n * 1000) / 1000;

/**
 * The code as an SVG document, with a one-module margin. The card around it
 * is white, so the quiet zone a scanner needs is the card itself.
 */
export function qrSvg(matrix: QrMatrix, colors: QrColors): string {
  const { size } = matrix;
  const modules = unpack(matrix);
  const hole = holeSize(size);
  const lo = (size - hole) / 2;
  const hi = lo + hole;

  const isFinder = (r: number, c: number) =>
    (r < 7 && c < 7) || (r < 7 && c >= size - 7) || (r >= size - 7 && c < 7);
  const inHole = (r: number, c: number) => r >= lo && r < hi && c >= lo && c < hi;

  // The data modules as one shape: a module is a square whose corners round
  // off wherever it has no neighbour on either side of that corner, so a
  // lone module is a dot and a run is a bar with round ends. Runs stay
  // solid, as a camera expects them; dots with gaps between them read well
  // only when the image is blurred enough to close the gaps.
  const drawn = (r: number, c: number) =>
    r >= 0 && c >= 0 && r < size && c < size && modules[r * size + c] === 1 && !isFinder(r, c) && !inHole(r, c);
  const R = 0.5;
  let body = "";
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!drawn(r, c)) continue;
      const up = drawn(r - 1, c);
      const down = drawn(r + 1, c);
      const left = drawn(r, c - 1);
      const right = drawn(r, c + 1);
      const tl = !up && !left ? R : 0;
      const tr = !up && !right ? R : 0;
      const br = !down && !right ? R : 0;
      const bl = !down && !left ? R : 0;
      // Clockwise from the top edge, so overlapping edges join under nonzero fill.
      body +=
        `M${c + tl} ${r}H${c + 1 - tr}` +
        (tr ? `a${tr} ${tr} 0 0 1 ${tr} ${tr}` : "") +
        `V${r + 1 - br}` +
        (br ? `a${br} ${br} 0 0 1 -${br} ${br}` : "") +
        `H${c + bl}` +
        (bl ? `a${bl} ${bl} 0 0 1 -${bl} -${bl}` : "") +
        `V${r + tl}` +
        (tl ? `a${tl} ${tl} 0 0 1 ${tl} -${tl}` : "") +
        "Z";
    }
  }

  const eye = (x: number, y: number) =>
    `<g transform="translate(${x} ${y})">` +
    `<rect x=".5" y=".5" width="6" height="6" rx="1.7" fill="none" stroke="${colors.ink}" stroke-width="1"/>` +
    `<rect x="2" y="2" width="3" height="3" rx=".9" fill="${colors.pupil}"/>` +
    `</g>`;

  // The mark, one module in from the hole's edge.
  const markScale = round((hole - 2) / 100);
  const mark =
    `<g transform="translate(${lo + 1} ${lo + 1}) scale(${markScale})">` +
    MARK.ink.map((d) => `<path d="${d}" fill="${colors.ink}"/>`).join("") +
    MARK.teal.map((d) => `<path d="${d}" fill="${colors.teal}"/>`).join("") +
    `<circle cx="${MARK.sun.cx}" cy="${MARK.sun.cy}" r="${MARK.sun.r}" fill="${colors.sun}"/>` +
    `</g>`;

  const view = size + 2;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-1 -1 ${view} ${view}" width="100%" height="100%" aria-hidden="true" focusable="false">` +
    `<rect x="-1" y="-1" width="${view}" height="${view}" fill="${colors.paper}"/>` +
    `<path d="${body}" fill="${colors.ink}"/>` +
    eye(0, 0) +
    eye(size - 7, 0) +
    eye(0, size - 7) +
    mark +
    `</svg>`
  );
}

/** Colours on the page: the site's tokens, so the code follows them. */
export const PAGE_QR_COLORS: QrColors = {
  ink: "var(--text-primary)",
  pupil: "var(--accent-gold-dark)",
  // The card's own porcelain shows through; a white square would sit on it as a patch.
  paper: "transparent",
  teal: "var(--brand-teal)",
  sun: "var(--accent-gold)",
};

/** "https://www.instagram.com/x/" → "instagram.com/x" */
export function prettyUrl(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
}
