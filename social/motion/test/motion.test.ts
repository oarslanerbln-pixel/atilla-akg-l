import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import sharp from "sharp";
import { INK, TEAL, outlinePart } from "../../brand/mark";
import { BASE } from "../../../src/lib/partners";
import { checkClip, checkFlights, checkSafeArea, offerKeywords } from "../check";
import { ROOT } from "../engine";
import { INK_STROKES, MARK_DRAWN, NEEDLE_STROKE, SUN_RISE } from "../src/brand/schedule";
import { TEMPLATES, briefSchema, flightsSeconds, motionSchema, type Clip } from "../src/briefs";
import { FORMATS } from "../src/lib/formats";
import { distanceKm, formatInt, upper } from "../src/lib/geo";
import { EASE, FPS, cubicBezier, ease, progress, readTime, rise } from "../src/lib/tokens";

const briefs = (dir: string) =>
  readdirSync(join(ROOT, "social", "briefs", dir))
    .filter((f) => f.endsWith(".json"))
    .map((f) => [f, JSON.parse(readFileSync(join(ROOT, "social", "briefs", dir, f), "utf8"))] as const);

test("the house curve is the site's, starts and ends exactly, and never overshoots", () => {
  assert.deepEqual([...EASE], [0.16, 1, 0.3, 1]);
  assert.equal(ease(0), 0);
  assert.equal(ease(1), 1);
  let last = 0;
  for (let i = 1; i <= 100; i++) {
    const v = ease(i / 100);
    assert.ok(v >= last - 1e-9 && v <= 1 + 1e-9, `ease(${i / 100}) = ${v}`);
    last = v;
  }
  // Matches the browser's cubic-bezier(0.25, 0.1, 0.25, 1) at its midpoint.
  assert.ok(Math.abs(cubicBezier(0.25, 0.1, 0.25, 1)(0.5) - 0.8024) < 0.001);
});

test("progress is clamped and an entrance ends in place, fully opaque", () => {
  assert.equal(progress(0, 1, 1), 0);
  assert.equal(progress(10 * FPS, 1, 1), 1);
  assert.deepEqual(rise(10 * FPS, 0), { opacity: 1, y: 0 });
  assert.equal(rise(10 * FPS, 0, 10).opacity, 0);
});

test("copy gets a second plus 0.4 s a word", () => {
  assert.equal(readTime("Bosporus bei Nacht"), 2.2);
  assert.equal(readTime("  "), 1);
});

test("every stroke of the mark is finished when the mark is said to stand", () => {
  assert.equal(INK_STROKES.length, INK.length);
  for (const s of [...INK_STROKES, NEEDLE_STROKE, SUN_RISE]) {
    assert.ok(s.start >= 0);
    assert.ok(s.start + s.dur <= MARK_DRAWN + 1e-9);
  }
});

test("a partly drawn line is a closed polygon inside the mark's box; nothing drawn is no path", () => {
  for (const line of [...INK, ...TEAL]) {
    assert.equal(outlinePart(line, 2, 0, 0), "");
    for (const [from, to] of [[0, 0.3], [0.4, 1], [0, 1]]) {
      const d = outlinePart(line, 2, from, to);
      assert.match(d, /^M[\d. \-L]+Z$/);
      for (const n of d.match(/-?\d+(\.\d+)?/g)!.map(Number)) assert.ok(n >= 0 && n <= 100, `${n} outside the box`);
    }
  }
});

test("Berlin to Istanbul is about 1,735 km, written the language's way", () => {
  const km = distanceKm(BASE, { lat: 41.0256, lon: 28.9742 });
  assert.ok(Math.abs(km - 1735) < 15, String(km));
  assert.equal(formatInt(1736.2, "de"), "1.736");
  assert.equal(formatInt(1736.2, "en"), "1,736");
  assert.equal(upper("istanbul", "tr"), "İSTANBUL");
  assert.equal(upper("istanbul", "de"), "ISTANBUL");
});

test("every motion brief in the repo matches the schema, passes its checks and fits a reel", () => {
  for (const [file, json] of briefs("motion")) {
    const brief = motionSchema.parse(json);
    for (const clip of brief.clips) {
      assert.deepEqual(checkClip(clip).filter((f) => f.level === "error"), [], file);
      const seconds = (TEMPLATES[clip.template].seconds as (p: Clip["props"]) => number)(clip.props);
      assert.ok(seconds > 2 && seconds <= 20, `${file}: ${seconds} s`);
    }
  }
});

test("a flights brief written for the still template renders as a story within Instagram's 60 s", () => {
  const flights = briefs(".").filter(([, json]) => json.kind === "flights");
  assert.ok(flights.length > 0);
  for (const [file, json] of flights) {
    const brief = briefSchema.parse(json);
    assert.equal(brief.kind, "flights", file);
    if (brief.kind === "flights") assert.ok(flightsSeconds(brief) <= 60);
  }
});

test("a partner title without the ad label is an error, in each language", () => {
  const clip = (lang: "de" | "en" | "tr", eyebrow: string): Clip => ({
    template: "title",
    formats: ["reel"],
    props: { lang, partner: "Novotel", eyebrow, title: "Bosporus", hold: 3, scrim: true },
  });
  assert.equal(checkClip(clip("de", "Novotel Istanbul"))[0].code, "ad-label");
  assert.deepEqual(checkClip(clip("de", "Anzeige · Novotel Istanbul")), []);
  assert.deepEqual(checkClip(clip("tr", "Reklam · Novotel")), []);
  assert.equal(checkClip(clip("en", "Anzeige · Novotel"))[0].code, "ad-label");
});

test("a story keyword has to be one the concierge answers to", () => {
  const keywords = offerKeywords(`insert into t values ('x', '{"de": "A, B"}', '{flug,fluege}', true);`);
  assert.deepEqual([...keywords], ["FLUG", "FLUEGE"]);
  const brief = { kind: "flights" as const, name: "t", lang: "de" as const, partner: "Skyscanner", title: "Flüge", keyword: "Flug", asOf: "27.09.2026", deals: [{ destination: "Rom", price: 30 }] };
  assert.deepEqual(checkFlights(brief, keywords), []);
  assert.equal(checkFlights({ ...brief, keyword: "REISE" }, keywords)[0].code, "keyword");
  assert.ok(offerKeywords().has("SKYSCANNER"));
});

test("opaque content under the platform's interface is caught; a translucent scrim is not", async () => {
  const { width, height, safe } = FORMATS.reel;
  const frame = (top: number, alpha: number) =>
    sharp({ create: { width, height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
      .composite([
        { input: { create: { width: 400, height: 80, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } } }, left: safe.left, top: height - safe.bottom - 80 },
        { input: { create: { width: 400, height: 80, channels: 4, background: { r: 20, g: 15, b: 10, alpha } } }, left: safe.left, top },
      ])
      .png()
      .toBuffer();
  assert.deepEqual(await checkSafeArea(await frame(height - 100, 0.85), "reel", true), []);
  const found = await checkSafeArea(await frame(height - 100, 1), "reel", true);
  assert.equal(found[0]?.code, "safe-area");
  assert.match(found[0].message, /bottom/);
});
