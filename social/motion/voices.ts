import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { DEFAULT_VOICES, VOICES_DIR, voiceFiles, type Lang } from "./audio/voice";

// npm run voices -- de tr                     the default voices of those languages
// npm run voices -- de_DE-thorsten-high       one voice by name
// Downloads Piper voices (rhasspy/piper-voices on Hugging Face) into social/motion/.voices.
// Each voice has its own licence (its MODEL_CARD there): read it before publishing with it.

const wanted = new Set<string>();
for (const arg of process.argv.slice(2)) {
  if (arg in DEFAULT_VOICES) for (const v of Object.values(DEFAULT_VOICES[arg as Lang])) wanted.add(v.voice);
  else wanted.add(arg);
}
if (!wanted.size) throw new Error("Usage: npm run voices -- <de|en|tr|voice-name> …");
mkdirSync(VOICES_DIR, { recursive: true });
for (const voice of wanted) {
  for (const path of voiceFiles(voice)) {
    const file = join(VOICES_DIR, basename(path));
    if (existsSync(file)) continue;
    const url = `https://huggingface.co/rhasspy/piper-voices/resolve/main/${path}`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${voice}: ${res.status} for ${path}`);
      writeFileSync(file, Buffer.from(await res.arrayBuffer()));
    } catch (e) {
      // Behind a proxy Node's fetch may not get out where curl does.
      if (e instanceof Error && e.message.includes(String(voice))) throw e;
      execFileSync("curl", ["-fsSL", "-o", file, url], { stdio: "inherit" });
    }
    console.log(file);
  }
}
