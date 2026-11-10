import { z } from "zod";
import { FLIGHTS_COPY } from "../../flights";
import { cartoonSchema } from "./cartoon/scene";
import { MARK_DRAWN } from "./brand/schedule";
import { ENTER, EXIT, readTime } from "./lib/tokens";

// What each template takes and how long it runs. No React and no assets in here, so the
// command line, the checks and the tests read the same contract the renderer does. A brief
// never states a duration: it follows from the content, and the copy always gets its reading time.

// --- Sting ---

export const stingSchema = z.object({
  tone: z.enum(["ink", "paper", "alpha"]),
  /** One small line under the name: the address, a handle, a call to action. */
  line: z.string().max(48).optional(),
  /** Seconds the finished card stands before it leaves. */
  hold: z.number().min(0.5).max(8),
  /** "fade" leaves to the ground (an opening); "stay" ends on the card (a closing). */
  out: z.enum(["fade", "stay"]),
});
export type StingProps = z.infer<typeof stingSchema>;

/** Stacked lockup, in the mark's own units (social/brand/export.ts → LOCKUPS.stacked). */
export const LOCKUP = { cap: 5.74, baseline: 106.05 };
export const WORD_AT = MARK_DRAWN - 0.35;
export const WORD_DUR = 1.1;
export const LINE_AT = WORD_AT + 0.55;

export const stingSeconds = (p: StingProps) => {
  const settled = (p.line ? LINE_AT + 0.9 : WORD_AT + WORD_DUR) + Math.max(p.hold, p.line ? readTime(p.line) : 0);
  return settled + (p.out === "fade" ? EXIT.dur : 0);
};


// --- LocationTag ---

export const locationSchema = z.object({
  lang: z.enum(["de", "en", "tr"]),
  /** The place as it should read: "Istanbul", "Kappadokien". */
  place: z.string().min(1).max(28),
  /** Small line above it: the country, a hotel, a region. */
  detail: z.string().max(40).optional(),
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  hold: z.number().min(1).max(10),
  /** Ink rising from the lower edge behind the tag; off over footage that is already dark. */
  scrim: z.boolean(),
});
export type LocationProps = z.infer<typeof locationSchema>;

export const LOCATION_ENTERED = 1.9;
export const locationSeconds = (p: LocationProps) => LOCATION_ENTERED + Math.max(p.hold, readTime(`${p.place} ${p.detail ?? ""}`)) + EXIT.dur;


// --- TitleCard ---

export const titleSchema = z.object({
  lang: z.enum(["de", "en", "tr"]),
  /** Small line above the title. Partner content starts with the ad label ("Anzeige · …"). */
  eyebrow: z.string().min(1).max(44),
  /** Set for partner content: the film is an advert, and the checks hold the eyebrow to its label. */
  partner: z.string().optional(),
  title: z.string().min(1).max(26),
  /** Second title line, in italic gold. */
  accent: z.string().max(26).optional(),
  subtitle: z.string().max(70).optional(),
  hold: z.number().min(1).max(10),
  scrim: z.boolean(),
});
export type TitleProps = z.infer<typeof titleSchema>;

const words = (p: TitleProps) => [p.eyebrow, p.title, p.accent, p.subtitle].filter(Boolean).join(" ");
const entered = (p: TitleProps) => 0.5 + ENTER.dur + (p.accent ? 0.12 : 0) + (p.subtitle ? 0.3 : 0);
export const titleSeconds = (p: TitleProps) => entered(p) + Math.max(p.hold, readTime(words(p))) + EXIT.dur;


// --- FlightsStory ---

export const flightsSchema = z.object({
  kind: z.literal("flights"),
  name: z.string().min(1),
  lang: z.enum(["de", "en", "tr"]),
  partner: z.string().min(1),
  title: z.string().min(1).max(22),
  accent: z.string().max(22).optional(),
  /** Must be one of the partner offer's keywords in supabase/offers.sql. */
  keyword: z.string().min(2).max(16),
  asOf: z.string().min(6),
  deals: z.array(z.object({ destination: z.string().min(1).max(18), detail: z.string().max(28).optional(), price: z.number().positive() })).min(1).max(4),
});
export type FlightsProps = z.infer<typeof flightsSchema>;

export const ROWS_AT = 1.5;
export const ROW_GAP = 0.22;
export const ctaAt = (p: FlightsProps) => ROWS_AT + p.deals.length * ROW_GAP + 0.55;

/** Everything a viewer has to read, for the time the finished story stands. */
const copyOf = (p: FlightsProps) => {
  const t = FLIGHTS_COPY[p.lang];
  return [p.title, p.accent, t.trip, ...p.deals.map((d) => `${d.destination} ${d.price}`), t.reply(p.keyword), t.dm].filter(Boolean).join(" ");
};
export const flightsSeconds = (p: FlightsProps) => ctaAt(p) + ENTER.dur + readTime(copyOf(p)) * 0.75;


// --- A motion brief ---

const formats = <T extends [string, ...string[]]>(ids: T) => z.array(z.enum(ids)).min(1);

/** One clip of a brief: a template, the formats to render it in, and its content. */
export const clipSchema = z.discriminatedUnion("template", [
  z.object({ template: z.literal("sting"), formats: formats(["reel", "square", "wide"]), props: stingSchema }),
  z.object({ template: z.literal("location"), formats: formats(["reel", "wide"]), props: locationSchema }),
  z.object({ template: z.literal("title"), formats: formats(["reel", "wide"]), props: titleSchema }),
]);
export type Clip = z.infer<typeof clipSchema>;

export const motionSchema = z.object({
  kind: z.literal("motion"),
  /** Output file prefix. */
  name: z.string().regex(/^[a-z0-9-]+$/),
  clips: z.array(clipSchema).min(1),
});
export type MotionBrief = z.infer<typeof motionSchema>;

/** A brief is a set of clips, a cartoon, or a flights story brief exactly as the still template takes it. */
export const briefSchema = z.discriminatedUnion("kind", [motionSchema, flightsSchema, cartoonSchema]);

export const TEMPLATES = {
  sting: { comp: "Sting", seconds: stingSeconds, overlay: false },
  location: { comp: "LocationTag", seconds: locationSeconds, overlay: true },
  title: { comp: "TitleCard", seconds: titleSeconds, overlay: true },
} as const;

/** The ad label a partner film's eyebrow starts with (social/README.md, "Rules"). */
export const adLabel = (lang: keyof typeof FLIGHTS_COPY) => FLIGHTS_COPY[lang].ad;
