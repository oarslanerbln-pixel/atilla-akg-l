/**
 * The brand mark's geometry: the single source for every copy of the mark.
 *
 * Traced from the approved Google Flow artwork (October 2026): an A drawn as
 * a spire of three hairlines meeting at a point, a fourth line rising inside
 * its left leg, two teal needles forming the crossbar as a horizon, and a gold
 * sun where they would meet. Coordinates live in a 100 x 100 box; each line is
 * a centreline plus a width profile, so the taper of the original survives.
 *
 * `npm run brand` (export.ts) turns this into the site component's paths, the exported
 * artwork in public/brand/ and the app icons. Edit here, then run it.
 */

type Pt = [number, number];
type Cubic = [Pt, Pt, Pt, Pt];

/** A tapered line: centreline segments plus full width (in px of the 2000 px trace) along its length. */
export type Line = { path: Cubic[]; width: Array<[number, number]>; blunt?: boolean };

/** One px of the 2000 px trace in mark units. */
const PX = 0.087;

const mirror = (c: Cubic): Cubic => c.map(([x, y]) => [100 - x, y] as Pt) as Cubic;

const LEFT_LEG: Cubic[] = [
  [[50, 11.546], [49.163, 18.87], [46.673, 25.915], [44.084, 32.774]],
  [[44.084, 32.774], [37.076, 51.339], [29.851, 69.959], [22.508, 88.454]],
];
const LEG_WIDTH: Line["width"] = [[0, 0], [0.06, 7], [0.12, 8.5], [0.45, 8], [0.73, 6.5], [0.84, 5], [0.95, 4], [1, 0]];

/** The inner line falling from the apex into the right leg. */
const INNER_RIGHT: Cubic = [[50, 11.546], [49.054, 39.445], [62.581, 65.678], [77.492, 88.454]];
/** The inner line rising from the left foot, free at its top. */
const INNER_LEFT: Cubic = [[48.75, 30], [41.199, 51.916], [31.098, 69.787], [22.508, 88.454]];

/** The upper edge line of the left needle; the lower one and the right needle mirror it. */
const NEEDLE: Cubic = [[3.89, 58.874], [18.04, 58.367], [32.19, 57.859], [46.346, 57.352]];
const NEEDLE_WIDTH: Line["width"] = [[0, 0], [0.03, 1.6], [0.5, 3.2], [1, 4.2]];
const HORIZON_Y = 58.831;
const flipY = (c: Cubic): Cubic => c.map(([x, y]) => [x, 2 * HORIZON_Y - y] as Pt) as Cubic;

export const INK: Line[] = [
  { path: LEFT_LEG, width: LEG_WIDTH },
  { path: LEFT_LEG.map(mirror), width: LEG_WIDTH },
  { path: [INNER_RIGHT], width: [[0, 0], [0.06, 7], [0.15, 9], [0.5, 8.5], [0.73, 7.5], [0.84, 6], [0.95, 4.5], [1, 0]] },
  {
    path: [INNER_LEFT],
    width: [[0, 0], [0.04, 1], [0.13, 2.6], [0.24, 3.8], [0.38, 5.5], [0.55, 6.8], [0.8, 7.5], [0.9, 5], [0.96, 3.5], [1, 0]],
  },
];

export const TEAL: Line[] = [NEEDLE, flipY(NEEDLE), mirror(NEEDLE), mirror(flipY(NEEDLE))].map((c) => ({
  path: [c],
  width: NEEDLE_WIDTH,
  blunt: true,
}));

export const SUN = { cx: 50, cy: HORIZON_Y, r: 1.783 };

export const COLOURS = { ink: "#181512", teal: "#38787b", gold: "#b38b59", paper: "#fcfbf9", tealOnInk: "#7fb8b8", goldOnInk: "#d8b482" };

// --- outline construction ---------------------------------------------------

const at = (c: Cubic, t: number): Pt => {
  const m = 1 - t;
  return [0, 1].map((k) => m * m * m * c[0][k] + 3 * m * m * t * c[1][k] + 3 * m * t * t * c[2][k] + t * t * t * c[3][k]) as Pt;
};
const tangent = (c: Cubic, t: number): Pt => {
  const m = 1 - t;
  return [0, 1].map(
    (k) => 3 * m * m * (c[1][k] - c[0][k]) + 6 * m * t * (c[2][k] - c[1][k]) + 3 * t * t * (c[3][k] - c[2][k]),
  ) as Pt;
};
const widthAt = (w: Line["width"], f: number) => {
  for (let i = 1; i < w.length; i++) {
    if (f <= w[i][0]) {
      const [f0, w0] = w[i - 1];
      const [f1, w1] = w[i];
      return w0 + ((w1 - w0) * (f - f0)) / (f1 - f0);
    }
  }
  return w[w.length - 1][1];
};

/** Least-squares cubic through points with fixed ends; splits until within `tol`. */
function fitCubics(p: Pt[], tol: number, depth = 0): Cubic[] {
  const n = p.length;
  const d = [0];
  for (let i = 1; i < n; i++) d.push(d[i - 1] + Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]));
  let ts = d.map((v) => v / d[n - 1]);
  const A = p[0];
  const D = p[n - 1];
  let c: Cubic = [A, A, D, D];
  let err = Infinity;
  for (let it = 0; it < 12; it++) {
    let a11 = 0, a12 = 0, a22 = 0, bx1 = 0, by1 = 0, bx2 = 0, by2 = 0;
    for (let i = 0; i < n; i++) {
      const t = ts[i], m = 1 - t;
      const b0 = m * m * m, b1 = 3 * m * m * t, b2 = 3 * m * t * t, b3 = t * t * t;
      const rx = p[i][0] - b0 * A[0] - b3 * D[0];
      const ry = p[i][1] - b0 * A[1] - b3 * D[1];
      a11 += b1 * b1; a12 += b1 * b2; a22 += b2 * b2;
      bx1 += b1 * rx; by1 += b1 * ry; bx2 += b2 * rx; by2 += b2 * ry;
    }
    const det = a11 * a22 - a12 * a12;
    if (Math.abs(det) < 1e-12) break;
    c = [A, [(bx1 * a22 - bx2 * a12) / det, (by1 * a22 - by2 * a12) / det], [(a11 * bx2 - a12 * bx1) / det, (a11 * by2 - a12 * by1) / det], D];
    // One Newton step per point towards its nearest parameter.
    ts = ts.map((t, i) => {
      const q = at(c, t), dq = tangent(c, t);
      const num = (q[0] - p[i][0]) * dq[0] + (q[1] - p[i][1]) * dq[1];
      const den = dq[0] * dq[0] + dq[1] * dq[1] || 1;
      return Math.min(1, Math.max(0, t - num / den));
    });
    err = Math.max(...p.map((pt, i) => Math.hypot(at(c, ts[i])[0] - pt[0], at(c, ts[i])[1] - pt[1])));
  }
  if (err <= tol || depth >= 3 || n < 8) return [c];
  const mid = Math.floor(n / 2);
  return [...fitCubics(p.slice(0, mid + 1), tol, depth + 1), ...fitCubics(p.slice(mid), tol, depth + 1)];
}

const r2 = (v: number) => Math.round(v * 100) / 100;
const pt = ([x, y]: Pt) => `${r2(x)} ${r2(y)}`;

/** The filled outline of a line at the given weight (1 = the artwork's own hairlines). */
export function outline(line: Line, weight: number, tol = 0.015): string {
  const N = 72;
  // Arc-length sample positions across all segments.
  const samples: Array<{ c: Cubic; t: number }> = [];
  for (const c of line.path) for (let i = 0; i <= N; i++) samples.push({ c, t: i / N });
  const pos = samples.map((s) => at(s.c, s.t));
  const len = [0];
  for (let i = 1; i < pos.length; i++) len.push(len[i - 1] + Math.hypot(pos[i][0] - pos[i - 1][0], pos[i][1] - pos[i - 1][1]));
  const total = len[len.length - 1];
  const left: Pt[] = [];
  const right: Pt[] = [];
  samples.forEach((s, i) => {
    if (i > 0 && len[i] === len[i - 1]) return; // segment joint duplicate
    const tg = tangent(s.c, s.t);
    const l = Math.hypot(tg[0], tg[1]) || 1;
    const nx = -tg[1] / l, ny = tg[0] / l;
    const h = (widthAt(line.width, len[i] / total) * PX * weight) / 2;
    left.push([pos[i][0] + nx * h, pos[i][1] + ny * h]);
    right.push([pos[i][0] - nx * h, pos[i][1] - ny * h]);
  });
  const fwd = fitCubics(left, tol);
  const back = fitCubics(right.reverse(), tol);
  const curves = (cs: Cubic[]) => cs.map((c) => `C${pt(c[1])} ${pt(c[2])} ${pt(c[3])}`).join("");
  return `M${pt(fwd[0][0])}${curves(fwd)}${line.blunt ? `L${pt(back[0][0])}` : ""}${curves(back)}Z`;
}

export type MarkPaths = { ink: string[]; teal: string[]; sun: typeof SUN };

/** Every shape of the mark at one weight. The sun grows a little with heavier lines so it keeps its presence. */
export function markPaths(weight: number): MarkPaths {
  return {
    ink: INK.map((l) => outline(l, weight)),
    teal: TEAL.map((l) => outline(l, weight)),
    sun: { ...SUN, r: r2(SUN.r * (1 + (weight - 1) * 0.18)) },
  };
}

/** A standalone SVG of the mark in literal colours, optionally on a tile. */
export function markSvg(
  weight: number,
  colours: { ink: string; teal: string; gold: string },
  opts: { size?: number; tile?: { fill: string; rx: number; pad: number } } = {},
): string {
  const p = markPaths(weight);
  const tile = opts.tile;
  const s = tile ? (100 - 2 * tile.pad) / 100 : 1;
  const body =
    p.ink.map((d) => `<path d="${d}" fill="${colours.ink}"/>`).join("") +
    p.teal.map((d) => `<path d="${d}" fill="${colours.teal}"/>`).join("") +
    `<circle cx="${p.sun.cx}" cy="${p.sun.cy}" r="${p.sun.r}" fill="${colours.gold}"/>`;
  const size = opts.size ? ` width="${opts.size}" height="${opts.size}"` : "";
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"${size} role="img" aria-label="Atilla Barbarossa"><title>Atilla Barbarossa</title>` +
    (tile ? `<rect width="100" height="100" rx="${tile.rx}" fill="${tile.fill}"/><g transform="translate(${tile.pad} ${tile.pad}) scale(${s})">${body}</g>` : body) +
    `</svg>`
  );
}
