import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { TEMPLATES, briefSchema, flightsSeconds, type Clip } from "./src/briefs";
import { timeline } from "./src/cartoon/scene";
import type { FormatId } from "./src/lib/formats";
import { LOUDNESS, loudness, mixCartoon, mux, voiceCartoon } from "./audio/sound";
import { checkCartoon, checkCleanExit, checkClip, checkFile, checkFlights, checkSafeArea, type Finding } from "./check";
import { OUT, ROOT, render } from "./engine";

// npm run motion -- social/briefs/motion/<brief>.json [--check]
// Renders every clip of the brief into social/out/motion/, each with a sheet of stills and a
// line in <name>-report.json. --check stops after reading the brief. See social/motion/README.md.

interface Planned {
  comp: string;
  format: FormatId;
  props: Record<string, unknown>;
  alpha: boolean;
  /** Fades out at its end: an overlay, or a sting told to. */
  leaves: boolean;
  /** A picture that fills the frame: there is no empty ground to measure the safe area against. */
  full?: boolean;
  /** Makes the film's soundtrack (once) and returns its path. */
  soundtrack?: () => Promise<string | undefined>;
  seconds: number;
  stem: string;
  before: Finding[];
}

function plan(path: string, dry: boolean): { name: string; jobs: Planned[] } {
  const parsed = briefSchema.safeParse(JSON.parse(readFileSync(path, "utf8")));
  if (!parsed.success) {
    for (const issue of parsed.error.issues) console.error(`  ${issue.path.join(".") || "brief"}: ${issue.message}`);
    throw new Error(`${path} does not match the brief schema (src/briefs.ts).`);
  }
  const brief = parsed.data;
  if (brief.kind === "flights") {
    const stem = join(OUT, `${brief.name}-story`);
    return { name: brief.name, jobs: [{ comp: "FlightsStory-story", format: "story", props: brief, alpha: false, leaves: false, seconds: flightsSeconds(brief), stem, before: checkFlights(brief) }] };
  }
  if (brief.kind === "cartoon") {
    const before = checkCartoon(brief);
    // The voices come first: they set how long every line and scene lasts. A dry run skips them.
    const scored = dry || before.some((f) => f.level === "error") ? { brief, clips: [], notes: [] } : voiceCartoon(brief);
    for (const note of scored.notes) before.push({ level: "warning", code: "voice", message: `Some lines are silent: ${note}.` });
    const { formats, sound, lang, ...props } = scored.brief;
    void lang;
    const seconds = timeline(scored.brief.scenes).total;
    // One soundtrack serves every format of the film.
    let mixed: Promise<string | undefined> | undefined;
    const soundtrack = sound ? () => (mixed ??= mixCartoon(scored, join(OUT, `${brief.name}-sound`))) : undefined;
    return { name: brief.name, jobs: formats.map((format) => ({ comp: `Cartoon-${format}`, format, props, alpha: false, leaves: false, full: true, soundtrack, seconds, stem: join(OUT, `${brief.name}-${format}`), before })) };
  }
  const jobs = brief.clips.flatMap((clip: Clip, i) => {
    const t = TEMPLATES[clip.template];
    const before = checkClip(clip);
    // A sting on a transparent ground is an overlay too.
    const alpha = t.overlay || (clip.template === "sting" && clip.props.tone === "alpha");
    const seconds = (t.seconds as (p: typeof clip.props) => number)(clip.props);
    return clip.formats.map((format) => ({
      comp: `${t.comp}-${format}`,
      format: format as FormatId,
      props: clip.props,
      alpha,
      leaves: t.overlay || (clip.template === "sting" && clip.props.out === "fade"),
      seconds,
      stem: join(OUT, `${brief.name}-${String(i + 1).padStart(2, "0")}-${clip.template}-${format}`),
      before,
    }));
  });
  return { name: brief.name, jobs };
}

const show = (f: Finding) => console.log(`    ${f.level === "error" ? "ERROR  " : "warning"} ${f.code}: ${f.message}`);

async function main() {
  const args = process.argv.slice(2);
  const path = args.find((a) => !a.startsWith("--"));
  if (!path) throw new Error("Usage: npm run motion -- social/briefs/motion/<brief>.json [--check]");
  // npm runs the script from social/motion; the path was typed where the command was.
  const { name, jobs } = plan(resolve(process.env.INIT_CWD ?? process.cwd(), path), args.includes("--check"));
  const report: Array<Record<string, unknown>> = [];
  let failed = false;

  for (const job of jobs) {
    console.log(`${job.comp}  ${job.seconds.toFixed(1)} s${job.alpha ? "  alpha" : ""}`);
    const findings = [...job.before];
    if (!findings.some((f) => f.level === "error") && !args.includes("--check")) {
      const r = await render({ comp: job.comp, props: job.props, stem: job.stem, alpha: job.alpha }, console.log);
      findings.push(...(await checkFile(r, job.alpha)));
      if (!job.full) findings.push(...(await checkSafeArea(r.settled, job.format, job.alpha)));
      if (job.alpha && job.leaves) findings.push(...(await checkCleanExit(r.last)));
      const audio = await job.soundtrack?.();
      if (audio) {
        await mux(r.file, audio);
        const lufs = await loudness(r.file);
        if (lufs === undefined) findings.push({ level: "error", code: "sound", message: "The film has no audio after the mix." });
        else if (Math.abs(lufs - LOUDNESS) > 1.5) findings.push({ level: "warning", code: "loudness", message: `${lufs} LUFS; streaming platforms normalise to about ${LOUDNESS}.` });
        else console.log(`  sound  ${lufs} LUFS`);
      }
      report.push({ comp: job.comp, file: r.file.replace(ROOT + "/", ""), sheet: r.sheet.replace(ROOT + "/", ""), seconds: r.frames / r.fps, findings });
    } else {
      report.push({ comp: job.comp, findings });
    }
    findings.forEach(show);
    failed ||= findings.some((f) => f.level === "error");
  }

  if (!args.includes("--check")) writeFileSync(join(OUT, `${name}-report.json`), JSON.stringify(report, null, 2) + "\n");
  console.log(failed ? "\nNot ready: fix the errors above." : "\nAll checks passed.");
  process.exit(failed ? 1 : 0);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
