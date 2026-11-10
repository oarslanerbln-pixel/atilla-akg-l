import { z } from "zod";
import { FORMATS, type FormatId } from "../lib/formats";
import { clamp, ease, easeInOut, lerp, readTime } from "../lib/tokens";
import { PLACES, TIME_IDS, WORLD } from "./Backdrop";
import { CARRY, HAIR, HATS, PRESET_IDS, TOPS } from "./looks";
import { ACTIONS, momentAt, scriptEnd, type Beat } from "./rig";

// A cartoon as data: scenes, each a place in a light, a cast with a script, a camera. No React
// in here. The renderer, the command line, the checks and the tests all read this file, so a
// film's length and every character's position are the same wherever they are asked for.

const colour = z.string().regex(/^#[0-9a-fA-F]{6}$/);

const beatSchema = z.object({
  /** Second of the scene at which the beat starts. */
  at: z.number().min(0),
  do: z.enum(ACTIONS),
  /** For "walk": the world x to walk to (0 to 2400). */
  to: z.number().min(0).max(WORLD).optional(),
  /** Seconds the action lasts. Walks and spoken lines time themselves. */
  for: z.number().min(0.3).max(20).optional(),
  /** A line in a speech bubble. Keep it to one breath. */
  say: z.string().min(1).max(90).optional(),
  /** Written by the sound step, not by hand: the line's loudness, one value a frame, which opens the mouth. */
  lips: z.array(z.number()).optional(),
});

const castSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  preset: z.enum(PRESET_IDS),
  /** Where the character stands when the scene opens (world x, 0 to 2400). */
  x: z.number().min(0).max(WORLD),
  facing: z.enum(["left", "right"]).optional(),
  script: z.array(beatSchema).optional(),
  /** A Piper voice for this character's lines ("de_DE-thorsten-high"); otherwise the language's default. */
  voice: z.string().optional(),
  /** Playback rate of the voice, 0.85 to 1.2: above 1 is higher and quicker. */
  pitch: z.number().min(0.85).max(1.2).optional(),
  // Anything of the look can be overridden on top of the preset.
  skin: colour.optional(),
  hair: z.enum(HAIR).optional(),
  hairColour: colour.optional(),
  beard: z.boolean().optional(),
  glasses: z.boolean().optional(),
  hat: z.enum(HATS).optional(),
  top: z.enum(TOPS).optional(),
  topColour: colour.optional(),
  shirtColour: colour.optional(),
  bottomColour: colour.optional(),
  shoeColour: colour.optional(),
  carry: z.enum(CARRY).optional(),
  height: z.number().min(0.6).max(1.2).optional(),
});
export type Cast = z.infer<typeof castSchema>;

const sceneSchema = z.object({
  place: z.enum(PLACES),
  time: z.enum(TIME_IDS),
  cast: z.array(castSchema).min(1).max(5),
  /** One line of narration along the lower edge. */
  caption: z.string().max(110).optional(),
  /** Keeps the view on one character; otherwise `from`/`to` (world x of the view's centre), or the cast's middle. */
  camera: z
    .object({
      follow: z.string().optional(),
      from: z.number().min(0).max(WORLD).optional(),
      to: z.number().min(0).max(WORLD).optional(),
      /** 1 shows a figure at a third of the frame's height; up to 2 for a close shot. A pair [from, to] pushes in. */
      zoom: z.union([z.number().min(1).max(2), z.tuple([z.number().min(1).max(2), z.number().min(1).max(2)])]).optional(),
    })
    .optional(),
  /** A floor for the scene's length; it is never shorter than its script and its reading time. */
  seconds: z.number().min(1).max(40).optional(),
});
export type Scene = z.infer<typeof sceneSchema>;

export const cartoonSchema = z.object({
  kind: z.literal("cartoon"),
  /** Output file prefix. */
  name: z.string().regex(/^[a-z0-9-]+$/),
  formats: z.array(z.enum(["reel", "square", "wide"])).min(1),
  /** The language the lines are spoken in. */
  lang: z.enum(["de", "en", "tr"]).optional(),
  /** Music and voices. Leave it out for a silent film. */
  sound: z
    .object({
      music: z.enum(["warm", "calm", "bright", "night", "none"]),
      /** Speak the captions and the lines; false keeps the music only. */
      voices: z.boolean(),
      /** A Piper voice for the captions; otherwise the language's default. */
      narrator: z.string().optional(),
    })
    .optional(),
  scenes: z.array(sceneSchema).min(1).max(12),
});
export type CartoonBrief = z.infer<typeof cartoonSchema>;
/** What the composition takes: the brief without what only the command line needs (formats, sound). */
export const cartoonPropsSchema = cartoonSchema.omit({ formats: true, sound: true, lang: true });
export type CartoonProps = z.infer<typeof cartoonPropsSchema>;

/** Seconds two scenes share while one dissolves into the next. */
export const DISSOLVE = 0.5;
/** A figure's size in the set: 400 puppet units become this share of the 1000-unit frame height. */
export const FIGURE = 0.86;

const beats = (c: Cast): Beat[] => c.script ?? [];
export const facingOf = (c: Cast): 1 | -1 => (c.facing === "left" ? -1 : 1);

export function sceneSeconds(s: Scene): number {
  const acted = Math.max(...s.cast.map((c) => scriptEnd(c.x, beats(c)))) + 0.7;
  const read = s.caption ? readTime(s.caption) + 0.8 : 0;
  return Math.max(s.seconds ?? 0, acted, read, 2.5);
}

/** When each scene starts, and the film's length. */
export function timeline(scenes: Scene[]) {
  let at = 0;
  const starts = scenes.map((s) => {
    const start = at;
    at += sceneSeconds(s);
    return start;
  });
  return { starts, total: at };
}

export const castAt = (c: Cast, t: number) => momentAt(c.x, facingOf(c), beats(c), t);

/** The width of the view in world units: the frame is 1000 units high. */
export const viewOf = (format: FormatId) => (1000 * FORMATS[format].width) / FORMATS[format].height;

/** The world x of the view's left edge and its zoom, at second `t` of a scene. */
export function cameraAt(s: Scene, t: number, view: number): { cam: number; zoom: number } {
  const k = easeInOut(clamp(t / sceneSeconds(s)));
  const z = s.camera?.zoom ?? 1;
  const zoom = typeof z === "number" ? z : lerp(z[0], z[1], k);
  const middle = s.cast.reduce((sum, c) => sum + c.x, 0) / s.cast.length;
  let centre: number;
  const followed = s.camera?.follow ? s.cast.find((c) => c.id === s.camera!.follow) : undefined;
  if (followed) {
    // A little behind the character, so the view trails the walk instead of being nailed to it.
    centre = lerp(castAt(followed, Math.max(0, t - 0.25)).x, castAt(followed, t).x, 0.5);
  } else if (s.camera?.from !== undefined || s.camera?.to !== undefined) {
    centre = lerp(s.camera.from ?? s.camera.to!, s.camera.to ?? s.camera.from!, k);
  } else {
    // No move asked for: a slow drift keeps the set alive.
    centre = middle + lerp(-14, 14, k);
  }
  return { cam: centre - view / 2, zoom };
}

/** Where a world point lands in the 1000-unit-high view. */
export function project(x: number, y: number, cam: number, zoom: number, view: number, ground: number): [number, number] {
  return [(x - cam - view / 2) * zoom + view / 2, (y - ground) * zoom + ground];
}

/** 0 to 1: how far scene `i` has dissolved in at film second `t`. */
export const dissolveIn = (i: number, start: number, t: number) => (i === 0 ? 1 : ease(clamp((t - start) / DISSOLVE)));
