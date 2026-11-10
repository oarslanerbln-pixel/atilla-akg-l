import { execFile } from "node:child_process";
import { renameSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { spans } from "../src/cartoon/rig";
import { timeline, type CartoonBrief } from "../src/cartoon/scene";
import { FPS } from "../src/lib/tokens";
import { compose } from "./music";
import { DEFAULT_VOICES, speak, type Lang, type Spoken, type Timbre } from "./voice";
import { RATE, envelope, writeWav } from "./wav";

// A cartoon's soundtrack: every caption and line spoken, music under them that steps back while
// someone talks, mixed to streaming loudness and laid onto the film. The voices are made first,
// because they set the timing: a line lasts as long as it takes to say, and its loudness moves
// the speaker's mouth.

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..", "..");
const run = promisify(execFile);
/** ffmpeg as Remotion ships it. */
const ffmpeg = (args: string[]) => run(join(HERE, "..", "node_modules", ".bin", "remotion"), ["ffmpeg", "-hide_banner", ...args], { maxBuffer: 1 << 26 });

/** Integrated loudness the mix is brought to: what Instagram and YouTube normalise towards. */
export const LOUDNESS = -14;
/** Seconds into a scene at which its caption is spoken. */
const CAPTION_AT = 0.5;
/** Music level while someone speaks, as a share of its level between lines. */
const DUCK = 0.28;

const TIMBRE: Record<string, Timbre> = { traveller: "female", concierge: "female" };

export interface Scored {
  /** The brief with every line's real length and lip movement written in. */
  brief: CartoonBrief;
  /** The clips and where they fall; undefined for a film without sound. */
  clips: Array<{ at: number; clip: Spoken }>;
  notes: string[];
}

/** Speaks the script and times the film to it. Lines without a voice keep their reading time and stay silent. */
export function voiceCartoon(input: CartoonBrief): Scored {
  const brief: CartoonBrief = structuredClone(input);
  const lang: Lang = brief.lang ?? "de";
  const notes = new Set<string>();
  const want = brief.sound?.voices ?? false;
  const taken: Array<{ scene: number; cast?: string; beat?: number; clip: Spoken }> = [];
  const take = (text: string, voice: { voice: string; pitch: number }, key: string) => {
    const result = speak(text, voice.voice, voice.pitch, join(ROOT, "social", "assets", "voice", brief.name, `${key}.wav`));
    if ("missing" in result) {
      notes.add(result.missing);
      return undefined;
    }
    return result;
  };
  if (want) {
    brief.scenes.forEach((scene, n) => {
      if (scene.caption) {
        const clip = take(scene.caption, brief.sound?.narrator ? { voice: brief.sound.narrator, pitch: 1 } : DEFAULT_VOICES[lang].male, `s${n + 1}-caption`);
        if (clip) {
          taken.push({ scene: n, clip });
          scene.seconds = Math.max(scene.seconds ?? 0, CAPTION_AT + clip.seconds + 0.8);
        }
      }
      for (const c of scene.cast) {
        const base = DEFAULT_VOICES[lang][TIMBRE[c.preset] ?? "male"];
        const voice = { voice: c.voice ?? base.voice, pitch: c.pitch ?? base.pitch };
        (c.script ?? []).forEach((beat, k) => {
          if (!beat.say) return;
          const clip = take(beat.say, voice, `s${n + 1}-${c.id}-${k + 1}`);
          if (!clip) return;
          // The line lasts as long as it takes to say, plus a beat before the next thing happens.
          beat.for = Math.max(beat.for ?? 0, clip.seconds + 0.3);
          beat.lips = envelope(clip.samples, FPS);
          taken.push({ scene: n, cast: c.id, beat: k, clip });
        });
      }
    });
  }
  // Only now are the scenes' lengths final, and with them every line's place in the film.
  const { starts } = timeline(brief.scenes);
  const clips = taken.map(({ scene, cast, beat, clip }) => {
    if (cast === undefined) return { at: starts[scene] + CAPTION_AT, clip };
    const c = brief.scenes[scene].cast.find((m) => m.id === cast)!;
    const text = c.script![beat!].say;
    // spans() may have moved the line back to wait for a walk; ask it where the line really starts.
    const span = spans(c.x, c.script!).find((s) => s.say === text && s.lips === c.script![beat!].lips)!;
    return { at: starts[scene] + span.at, clip };
  });
  return { brief, clips, notes: [...notes] };
}

/** Mixes voices and music, brings the mix to LOUDNESS and writes it beside the film as <stem>.wav. */
export async function mixCartoon(scored: Scored, stem: string): Promise<string | undefined> {
  const sound = scored.brief.sound;
  if (!sound || (sound.music === "none" && !scored.clips.length)) return undefined;
  const total = timeline(scored.brief.scenes).total;
  const n = Math.ceil(total * RATE);
  const voice = new Float32Array(n);
  // How much the music gives way, sample by sample: down a quarter second before a line, back up after it.
  const duck = new Float32Array(n).fill(1);
  const ramp = 0.25 * RATE;
  for (const { at, clip } of scored.clips) {
    const from = Math.floor(at * RATE);
    for (let i = 0; i < clip.samples.length && from + i < n; i++) voice[from + i] += clip.samples[i];
    const to = from + clip.samples.length;
    for (let i = Math.max(0, Math.floor(from - ramp)); i < Math.min(n, to + ramp); i++) {
      const edge = Math.min(1, Math.max(0, (i - (from - ramp)) / ramp), Math.max(0, (to + ramp - i) / ramp));
      duck[i] = Math.min(duck[i], 1 - (1 - DUCK) * edge);
    }
  }
  const [L, R] = sound.music === "none" ? [new Float32Array(n), new Float32Array(n)] : compose(sound.music, total);
  for (let i = 0; i < n; i++) {
    L[i] = L[i] * duck[i] * 0.7 + voice[i] * 0.9;
    R[i] = R[i] * duck[i] * 0.7 + voice[i] * 0.9;
  }
  const raw = `${stem}-raw.wav`;
  const out = `${stem}.wav`;
  writeWav(raw, L, R);
  // Two passes: measure the mix, then move it to the target by one fixed gain. A single pass
  // rides the level up and down and lands short of the target on a short film.
  const m = await measure(raw);
  const fix = m ? `:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true` : "";
  await ffmpeg(["-y", "-i", raw, "-af", `loudnorm=I=${LOUDNESS}:TP=-1.5:LRA=11${fix}`, "-ar", String(RATE), out]);
  rmSync(raw);
  return out;
}

/** Lays the soundtrack onto a rendered film, in place. The picture is not re-encoded. */
export async function mux(video: string, audio: string) {
  const tmp = video.replace(/\.mp4$/, "-sound.mp4");
  await ffmpeg(["-y", "-i", video, "-i", audio, "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", tmp]);
  renameSync(tmp, video);
}

/** Integrated loudness of a file's audio in LUFS, or undefined when it has none. */
export async function loudness(file: string): Promise<number | undefined> {
  const m = await measure(file);
  return m && Number.isFinite(Number(m.input_i)) ? Number(m.input_i) : undefined;
}

/** ffmpeg's loudnorm in measuring mode: integrated loudness, true peak, range. */
async function measure(file: string): Promise<Record<string, string> | undefined> {
  try {
    const { stderr } = await ffmpeg(["-i", file, "-vn", "-af", `loudnorm=I=${LOUDNESS}:TP=-1.5:LRA=11:print_format=json`, "-f", "null", "-"]);
    return JSON.parse(stderr.slice(stderr.lastIndexOf("{"), stderr.lastIndexOf("}") + 1));
  } catch {
    return undefined;
  }
}
