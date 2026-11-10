import { existsSync, readdirSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import sharp from "sharp";

// Bundles the compositions once and renders from that bundle: a film, and a sheet of stills
// for looking at it without playing it.

const HERE = dirname(fileURLToPath(import.meta.url));
export const ROOT = join(HERE, "..", "..");
export const OUT = join(ROOT, "social", "out", "motion");

/**
 * Remotion downloads its own headless Chrome on first use. Where that host is closed (a cloud
 * container, CI behind a proxy), MOTION_BROWSER or an installed Playwright shell is used.
 */
export function browserExecutable(): string | undefined {
  if (process.env.MOTION_BROWSER) return process.env.MOTION_BROWSER;
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (!base || !existsSync(base)) return undefined;
  for (const dir of readdirSync(base).filter((d) => d.startsWith("chromium_headless_shell")).sort().reverse()) {
    for (const sub of readdirSync(join(base, dir))) {
      const exe = join(base, dir, sub, "headless_shell");
      if (existsSync(exe)) return exe;
    }
  }
  return undefined;
}

let bundled: Promise<string> | undefined;
// public/brand is the site's own exported artwork: read from there, never copied.
const serveUrl = () => (bundled ??= bundle({ entryPoint: join(HERE, "src", "index.ts"), publicDir: join(ROOT, "public", "brand") }));

export interface Job {
  /** Composition id, e.g. "Sting-reel". */
  comp: string;
  props: Record<string, unknown>;
  /** Output path without extension. */
  stem: string;
  /** Transparent ground: ProRes 4444 in a .mov, for an editor's timeline. */
  alpha: boolean;
}

export interface Rendered {
  file: string;
  sheet: string;
  width: number;
  height: number;
  fps: number;
  frames: number;
  /** The last frame, full size. */
  last: Buffer;
  /** The frame at 60 % of the film, full size: everything has arrived, nothing has left. */
  settled: Buffer;
}

export async function render(job: Job, log: (line: string) => void = () => {}): Promise<Rendered> {
  const url = await serveUrl();
  const browser = browserExecutable();
  const composition = await selectComposition({ serveUrl: url, id: job.comp, inputProps: job.props, browserExecutable: browser });
  await mkdir(dirname(job.stem), { recursive: true });
  const file = `${job.stem}.${job.alpha ? "mov" : "mp4"}`;
  await renderMedia({
    composition,
    serveUrl: url,
    inputProps: job.props,
    outputLocation: file,
    browserExecutable: browser,
    overwrite: true,
    // Flat grounds and hairlines band under JPEG frames; PNG costs seconds and keeps them clean.
    imageFormat: "png",
    ...(job.alpha
      ? { codec: "prores" as const, proResProfile: "4444" as const, pixelFormat: "yuva444p10le" as const }
      : { codec: "h264" as const, crf: 16, pixelFormat: "yuv420p" as const, colorSpace: "bt709" as const }),
    onProgress: ({ progress }) => progress === 1 && log(`  ${file.replace(ROOT + "/", "")}`),
  });

  // Six stills across the film, the last frame always among them: the sheet is what gets reviewed.
  const n = composition.durationInFrames;
  const picks = [0.08, 0.25, 0.42, 0.6, 0.8, 1].map((k) => Math.min(n - 1, Math.round(k * (n - 1))));
  const tile = 360;
  const th = Math.round((tile * composition.height) / composition.width);
  const stills = await Promise.all(
    picks.map(async (frame) => {
      const { buffer } = await renderStill({ composition, serveUrl: url, inputProps: job.props, frame, imageFormat: "png", browserExecutable: browser });
      return buffer!;
    }),
  );
  const sheet = `${job.stem}-sheet.png`;
  // A mid grey ground, so a transparent overlay shows its light type and its dark scrim alike.
  await sharp({ create: { width: picks.length * (tile + 12) + 12, height: th + 24, channels: 3, background: job.alpha ? "#6f6a64" : "#2a2725" } })
    .composite(await Promise.all(stills.map(async (still, i) => ({ input: await sharp(still).resize(tile, th).toBuffer(), left: 12 + i * (tile + 12), top: 12 }))))
    .png()
    .toFile(sheet);
  return { file, sheet, width: composition.width, height: composition.height, fps: composition.fps, frames: n, last: stills[5], settled: stills[3] };
}
