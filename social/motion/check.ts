import { execFile } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { promisify } from "node:util";
import sharp from "sharp";
import { adLabel, type Clip, type FlightsProps } from "./src/briefs";
import { spans } from "./src/cartoon/rig";
import { cameraAt, castAt, project, timeline, viewOf, type CartoonBrief } from "./src/cartoon/scene";
import { FORMATS, type FormatId } from "./src/lib/formats";
import { FPS } from "./src/lib/tokens";
import { ROOT, type Rendered } from "./engine";

// The checks a film passes before anyone watches it. Before the render: what the brief says.
// After it: what the file is, and whether anything readable left the safe area. An error stops
// the run with exit code 1; a warning is for a person to look at.

export interface Finding {
  level: "error" | "warning";
  code: string;
  message: string;
}
const error = (code: string, message: string): Finding => ({ level: "error", code, message });
const warning = (code: string, message: string): Finding => ({ level: "warning", code, message });

// --- before the render ---

export function checkClip(clip: Clip): Finding[] {
  const out: Finding[] = [];
  if (clip.template === "title") {
    const p = clip.props;
    const label = adLabel(p.lang);
    if (p.partner && !p.eyebrow.toLocaleLowerCase().startsWith(label.toLocaleLowerCase())) {
      out.push(error("ad-label", `Partner content (${p.partner}) carries the ad label: the eyebrow must start with "${label}".`));
    }
    for (const format of clip.formats) {
      const f = FORMATS[format as FormatId];
      const size = Math.floor((f.width - f.safe.left - f.safe.right) / (0.5 * Math.max(p.title.length, p.accent?.length ?? 0)));
      if (size < 84) out.push(warning("title-small", `${format}: the title sets at ${size} px to fit one line; a shorter title reads better on a phone.`));
    }
  }
  if (clip.template === "location" && Math.abs(clip.props.lat) < 0.001 && Math.abs(clip.props.lon) < 0.001) {
    out.push(error("coords", "lat 0, lon 0 is the Gulf of Guinea: the coordinates were left empty."));
  }
  return out;
}

/** The keywords the concierge answers to, read from the offers file itself. */
export function offerKeywords(sql = readFileSync(join(ROOT, "supabase", "offers.sql"), "utf8")): Set<string> {
  const words = new Set<string>();
  // The keywords column is a Postgres array literal, '{flug,fluege}'; the JSON columns beside it
  // hold quotes and colons, which a keyword list never does.
  for (const m of sql.matchAll(/'\{([^'":{}]+)\}'/g)) for (const w of m[1].split(",")) words.add(w.trim().toLocaleUpperCase("de-DE"));
  return words;
}

export function checkFlights(p: FlightsProps, keywords = offerKeywords()): Finding[] {
  const out: Finding[] = [];
  if (!keywords.has(p.keyword.toLocaleUpperCase("de-DE"))) {
    out.push(error("keyword", `"${p.keyword}" is not a keyword in supabase/offers.sql: a reply to the story would get no link.`));
  }
  const sorted = [...p.deals].sort((a, b) => a.price - b.price);
  if (p.deals.some((d, i) => d.price !== sorted[i].price)) out.push(warning("order", "Deals are not cheapest first."));
  if (!/^\d{2}\.\d{2}\.\d{4}$/.test(p.asOf)) out.push(warning("as-of", `asOf "${p.asOf}" is not a date like 27.09.2026.`));
  return out;
}

/** A cartoon's script, read before a frame is drawn: who is where, and whether a speaker is in the picture. */
export function checkCartoon(brief: CartoonBrief): Finding[] {
  const out: Finding[] = [];
  brief.scenes.forEach((scene, n) => {
    const where = `scene ${n + 1}`;
    const ids = scene.cast.map((c) => c.id);
    if (new Set(ids).size !== ids.length) out.push(error("cast-id", `${where}: two characters share an id.`));
    if (scene.camera?.follow && !ids.includes(scene.camera.follow)) out.push(error("follow", `${where}: the camera follows "${scene.camera.follow}", who is not in the cast.`));
    for (const c of scene.cast) {
      for (const beat of c.script ?? []) {
        if (beat.do === "walk" && beat.to === undefined) out.push(error("walk", `${where}, ${c.id}: a walk needs "to".`));
        if (beat.say && beat.do !== "talk") out.push(warning("say", `${where}, ${c.id}: a line is spoken during "${beat.do}"; the mouth only moves on "talk".`));
      }
      for (const format of brief.formats) {
        const view = viewOf(format);
        for (const s of spans(c.x, c.script ?? [])) {
          if (!s.say) continue;
          // Half a second into the line, the speaker has to be in the picture.
          const t = s.at + 0.5;
          const { cam, zoom } = cameraAt(scene, t, view);
          const [x] = project(castAt(c, t).x, 0, cam, zoom, view, 0);
          if (x < 40 || x > view - 40) out.push(error("off-screen", `${where}, ${c.id}, ${format}: speaks at ${s.at} s while out of the picture.`));
        }
      }
    }
    // Two bubbles at once cover each other and split the eye.
    const lines = scene.cast.flatMap((c) => spans(c.x, c.script ?? []).filter((s) => s.say).map((s) => ({ id: c.id, at: s.at, end: s.end })));
    for (const a of lines) for (const b of lines) if (a.id < b.id && a.at < b.end && b.at < a.end) out.push(warning("overlap", `${where}: ${a.id} and ${b.id} speak at the same time (${Math.max(a.at, b.at)} s).`));
  });
  const { total } = timeline(brief.scenes);
  if (total > 90) out.push(warning("long", `${total.toFixed(0)} s: a reel holds attention for far less.`));
  return out;
}

// --- after the render ---

const run = promisify(execFile);

/** ffprobe as Remotion ships it, so the check needs nothing installed beside the engine. */
async function probe(file: string) {
  const bin = join(ROOT, "social", "motion", "node_modules", ".bin", "remotion");
  const { stdout } = await run(bin, ["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height,r_frame_rate,pix_fmt,codec_name,nb_frames:format=duration", "-of", "json", file]);
  const data = JSON.parse(stdout.slice(stdout.indexOf("{")));
  const s = data.streams[0];
  const [n, d] = String(s.r_frame_rate).split("/").map(Number);
  return { width: s.width as number, height: s.height as number, fps: n / (d || 1), pixFmt: s.pix_fmt as string, codec: s.codec_name as string, seconds: Number(data.format.duration) };
}

export async function checkFile(r: Rendered, alpha: boolean): Promise<Finding[]> {
  const out: Finding[] = [];
  const v = await probe(r.file);
  if (v.width !== r.width || v.height !== r.height) out.push(error("size", `${v.width}×${v.height}, expected ${r.width}×${r.height}.`));
  if (Math.abs(v.fps - FPS) > 0.01) out.push(error("fps", `${v.fps} fps, expected ${FPS}.`));
  if (Math.abs(v.seconds - r.frames / FPS) > 1.5 / FPS) out.push(error("duration", `${v.seconds.toFixed(2)} s, expected ${(r.frames / FPS).toFixed(2)} s.`));
  if (alpha && !/^yuva|^rgba|^argb|^bgra/.test(v.pixFmt)) out.push(error("alpha", `Pixel format ${v.pixFmt} has no alpha channel: the overlay would cover the footage.`));
  if (!alpha && (v.codec !== "h264" || v.pixFmt !== "yuv420p")) out.push(error("codec", `${v.codec}/${v.pixFmt}: Instagram wants H.264 in yuv420p.`));
  return out;
}

/** An overlay that fades out ends on an empty frame, or it pops off when the clip ends on the timeline. */
export async function checkCleanExit(last: Buffer): Promise<Finding[]> {
  const { channels } = await sharp(last).ensureAlpha().stats();
  return channels[3].max > 2 ? [error("exit", `The last frame still shows content (alpha up to ${channels[3].max}/255).`)] : [];
}

/**
 * Whether anything a viewer must read sits under the platform's interface. On an overlay that is
 * every fully opaque pixel (the scrim is translucent by design and may bleed to the edge); on a
 * full frame, every pixel that differs from the ground in the corner.
 */
export async function checkSafeArea(still: Buffer, format: FormatId, alpha: boolean): Promise<Finding[]> {
  const { data, info } = await sharp(still).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const safe = FORMATS[format].safe;
  const ground = [data[0], data[1], data[2]];
  const box = { top: height, left: width, bottom: -1, right: -1 };
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const marked = alpha ? data[i + 3] >= 250 : Math.abs(data[i] - ground[0]) + Math.abs(data[i + 1] - ground[1]) + Math.abs(data[i + 2] - ground[2]) > 48;
      if (!marked) continue;
      if (y < box.top) box.top = y;
      if (y > box.bottom) box.bottom = y;
      if (x < box.left) box.left = x;
      if (x > box.right) box.right = x;
    }
  }
  if (box.bottom < 0) return [error("empty", "The settled frame is empty.")];
  const over = { top: safe.top - box.top, left: safe.left - box.left, bottom: box.bottom - (height - 1 - safe.bottom), right: box.right - (width - 1 - safe.right) };
  return Object.entries(over)
    .filter(([, px]) => px > 2)
    .map(([side, px]) => error("safe-area", `${format}: content runs ${px} px into the ${side} band the platform covers.`));
}
