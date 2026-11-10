import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { RATE, readWav, resample } from "./wav";

// Where a spoken line comes from. A recording of a person wins: drop
// social/assets/voice/<brief>/<key>.wav and that line is theirs. Otherwise Piper speaks it: a
// neural voice that runs on this machine, costs nothing and sends the script nowhere.
//
//   pip install piper-tts            (once; MOTION_PIPER names the Python that has it)
//   npm run voices -- de tr          (downloads the voices into social/motion/.voices)

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..", "..");
export const VOICES_DIR = process.env.MOTION_VOICES ?? join(HERE, "..", ".voices");
const CACHE = join(ROOT, "social", "out", "motion", ".cache", "voice");

export type Lang = "de" | "en" | "tr";
export type Timbre = "male" | "female";

/** The voice a character gets when the brief names none. Where a language has no second voice, pitch tells two speakers apart. */
export const DEFAULT_VOICES: Record<Lang, Record<Timbre, { voice: string; pitch: number }>> = {
  de: { male: { voice: "de_DE-thorsten-high", pitch: 1 }, female: { voice: "de_DE-kerstin-low", pitch: 1 } },
  en: { male: { voice: "en_GB-alan-medium", pitch: 1 }, female: { voice: "en_GB-jenny_dioco-medium", pitch: 1 } },
  tr: { male: { voice: "tr_TR-dfki-medium", pitch: 1 }, female: { voice: "tr_TR-dfki-medium", pitch: 1.14 } },
};

/** "de_DE-thorsten-high" → its two files in the rhasspy/piper-voices repository. */
export function voiceFiles(voice: string): string[] {
  const m = /^([a-z]{2})_([A-Z]{2})-(.+)-(x_low|low|medium|high)$/.exec(voice);
  if (!m) throw new Error(`"${voice}" is not a Piper voice name (like de_DE-thorsten-high).`);
  const base = `${m[1]}/${m[1]}_${m[2]}/${m[3]}/${m[4]}/${voice}.onnx`;
  return [base, `${base}.json`];
}

export interface Spoken {
  samples: Float32Array;
  seconds: number;
  source: "recording" | "piper";
}

/** Why Piper cannot speak, or undefined when it can. Asked once a run. */
let piperProblem: string | null | undefined;
function piperMissing(): string | null {
  if (piperProblem !== undefined) return piperProblem;
  try {
    execFileSync(process.env.MOTION_PIPER ?? "python3", ["-c", "import piper"], { stdio: "ignore" });
    piperProblem = null;
  } catch {
    piperProblem = "Piper is not installed (pip install piper-tts, or set MOTION_PIPER to the Python that has it)";
  }
  return piperProblem;
}

/**
 * One line, spoken. `recording` is the path a person's take would have. Returns why not when
 * there is neither a take nor a way to synthesise one: the film is then rendered without it.
 */
export function speak(text: string, voice: string, pitch: number, recording: string): Spoken | { missing: string } {
  if (existsSync(recording)) {
    const samples = readWav(recording);
    return { samples, seconds: samples.length / RATE, source: "recording" };
  }
  const missing = piperMissing();
  if (missing) return { missing };
  const model = join(VOICES_DIR, `${voice}.onnx`);
  if (!existsSync(model)) return { missing: `voice ${voice} is not downloaded (npm run voices -- ${voice})` };
  mkdirSync(CACHE, { recursive: true });
  const file = join(CACHE, `${createHash("sha1").update(`${voice}|${text}`).digest("hex")}.wav`);
  // The same line in the same voice is only ever synthesised once.
  if (!existsSync(file)) execFileSync(process.env.MOTION_PIPER ?? "python3", ["-m", "piper", "-m", model, "-f", file], { input: text, stdio: ["pipe", "ignore", "ignore"] });
  const samples = resample(readWav(file), 1, 1, pitch);
  return { samples, seconds: samples.length / RATE, source: "piper" };
}
