import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { MOODS, compose } from "../audio/music";
import { voiceCartoon } from "../audio/sound";
import { voiceFiles } from "../audio/voice";
import { RATE, envelope, readWav, resample, writeWav } from "../audio/wav";
import { ROOT } from "../engine";
import { spans } from "../src/cartoon/rig";
import { timeline, type CartoonBrief } from "../src/cartoon/scene";
import { FPS } from "../src/lib/tokens";

const tone = (seconds: number, hz = 220) => Float32Array.from({ length: Math.round(seconds * RATE) }, (_, i) => 0.5 * Math.sin((2 * Math.PI * hz * i) / RATE));

test("a WAV written is the WAV read, and resampling keeps its length in seconds", () => {
  const dir = mkdtempSync(join(tmpdir(), "motion-"));
  const x = tone(0.5);
  writeWav(join(dir, "a.wav"), x);
  const y = readWav(join(dir, "a.wav"));
  assert.equal(y.length, x.length);
  for (let i = 0; i < x.length; i += 997) assert.ok(Math.abs(x[i] - y[i]) < 1e-3);
  assert.ok(Math.abs(resample(x, 22050, RATE).length / RATE - (x.length / 22050)) < 0.001);
  // Faster playback is shorter (and higher): how one voice becomes two characters.
  assert.ok(Math.abs(resample(x, RATE, RATE, 1.14).length - x.length / 1.14) < 2);
  rmSync(dir, { recursive: true });
});

test("the envelope gives a mouth one value a frame, loud is open and silence is shut", () => {
  const x = new Float32Array(RATE);
  x.set(tone(0.5), RATE / 2);
  const lips = envelope(x, FPS);
  assert.equal(lips.length, FPS);
  assert.ok(lips.slice(0, 14).every((v) => v === 0));
  assert.ok(lips.slice(16).every((v) => v > 0.9 && v <= 1));
});

test("the music is the same every time, never clips, and fades in and out", () => {
  for (const mood of MOODS) {
    const [L, R] = compose(mood, 8);
    const [L2] = compose(mood, 8);
    assert.equal(L.length, 8 * RATE);
    assert.deepEqual(L.subarray(0, 4000), L2.subarray(0, 4000));
    let peak = 0;
    let energy = 0;
    for (let i = 0; i < L.length; i++) {
      peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
      energy += L[i] * L[i];
    }
    assert.ok(peak < 0.9, `${mood} peaks at ${peak}`);
    assert.ok(Math.sqrt(energy / L.length) > 0.01, `${mood} is silent`);
    assert.ok(Math.abs(L[0]) < 1e-6 && Math.abs(L[L.length - 1]) < 1e-3);
  }
});

test("a Piper voice name maps to its files", () => {
  assert.deepEqual(voiceFiles("de_DE-thorsten-high"), ["de/de_DE/thorsten/high/de_DE-thorsten-high.onnx", "de/de_DE/thorsten/high/de_DE-thorsten-high.onnx.json"]);
  assert.throws(() => voiceFiles("thorsten"));
});

const brief = (name: string, voices: boolean): CartoonBrief => ({
  kind: "cartoon",
  name,
  formats: ["reel"],
  sound: { music: "none", voices },
  scenes: [
    { place: "berlin", time: "day", caption: "Berlin.", cast: [{ id: "a", preset: "host", x: 600, script: [{ at: 0.5, do: "walk", to: 900 }, { at: 1, do: "talk", say: "Hallo!" }] }] },
    { place: "lounge", time: "night", cast: [{ id: "a", preset: "host", x: 900 }] },
  ],
});

test("a film without voices keeps its written timing", () => {
  const plain = brief("sound-test-off", false);
  const scored = voiceCartoon(plain);
  assert.deepEqual(scored.clips, []);
  assert.equal(timeline(scored.brief.scenes).total, timeline(plain.scenes).total);
});

test("a recorded take sets the line's length, moves the mouth and lands where the line starts", () => {
  const name = "sound-test-on";
  const dir = join(ROOT, "social", "assets", "voice", name);
  mkdirSync(dir, { recursive: true });
  try {
    // A four-second take of a two-word line, and a narrator's take of the caption.
    writeWav(join(dir, "s1-a-2.wav"), tone(4));
    writeWav(join(dir, "s1-caption.wav"), tone(1.5));
    const scored = voiceCartoon(brief(name, true));
    assert.deepEqual(scored.notes, []);
    const line = scored.brief.scenes[0].cast[0].script![1];
    assert.ok(line.for! >= 4.3 - 1e-6);
    assert.equal(line.lips!.length, 4 * FPS);
    const [walk, talk] = spans(600, scored.brief.scenes[0].cast[0].script!);
    // Written for second 1, the line waits for the walk to arrive, and its sound waits with it.
    assert.ok(talk.at > 1 && Math.abs(talk.at - walk.end) < 1e-9);
    assert.deepEqual(scored.clips.map((c) => [Number(c.at.toFixed(3)), c.clip.source]), [[0.5, "recording"], [Number(talk.at.toFixed(3)), "recording"]]);
    assert.ok(timeline(scored.brief.scenes).starts[1] >= talk.at + 4.3);
  } finally {
    rmSync(dir, { recursive: true });
  }
});
