import { RATE } from "./wav";

// The score, written in code: a pad, a plucked arpeggio, a bass, and for the livelier moods a
// soft kick and shaker, over a four-chord loop. No samples and no loops from anywhere, so there
// is nothing to license, and the same brief always gives the same music.

export const MOODS = ["warm", "calm", "bright", "night"] as const;
export type Mood = (typeof MOODS)[number];

interface Score {
  bpm: number;
  /** MIDI note of the key's root. */
  root: number;
  /** Chords as semitone sets above the root, one a bar. */
  chords: number[][];
  pluck: number;
  beat: number;
}

const SCORES: Record<Mood, Score> = {
  // I – vi – IV – V
  warm: { bpm: 88, root: 60, chords: [[0, 4, 7], [-3, 0, 4], [-7, -3, 0], [-5, -1, 2]], pluck: 0.5, beat: 0.35 },
  // I – IV – vi – V, slow and open
  calm: { bpm: 70, root: 62, chords: [[0, 4, 7], [-7, -3, 0], [-3, 0, 4], [-5, -1, 2]], pluck: 0.3, beat: 0 },
  // I – V – vi – IV
  bright: { bpm: 108, root: 55, chords: [[0, 4, 7], [-5, -1, 2], [-3, 0, 4], [-7, -3, 0]], pluck: 0.6, beat: 0.6 },
  // i – VI – III – VII
  night: { bpm: 78, root: 57, chords: [[0, 3, 7], [-4, 0, 3], [-9, -5, -2], [-2, 2, 5]], pluck: 0.4, beat: 0.2 },
};

const hz = (midi: number) => 440 * 2 ** ((midi - 69) / 12);
const TAU = 2 * Math.PI;

/** `seconds` of music in a mood, stereo. */
export function compose(mood: Mood, seconds: number): [Float32Array, Float32Array] {
  const s = SCORES[mood];
  const n = Math.ceil(seconds * RATE);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  const beat = 60 / s.bpm;
  const bar = beat * 4;
  const add = (at: number, len: number, voice: (t: number, k: number) => number, gain: number, pan = 0) => {
    const from = Math.max(0, Math.floor(at * RATE));
    const to = Math.min(n, Math.floor((at + len) * RATE));
    for (let i = from; i < to; i++) {
      const v = voice((i - from) / RATE, (i - from) / (to - from)) * gain;
      L[i] += v * (1 - pan) * 0.5 * 2;
      R[i] += v * (1 + pan) * 0.5 * 2;
    }
  };
  // Deterministic noise for the shaker.
  let seed = 12345;
  const noise = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2147483648 - 1);

  for (let b = 0; b * bar < seconds; b++) {
    const chord = s.chords[b % s.chords.length];
    const t0 = b * bar;
    // Pad: each chord tone as two slightly detuned sines, swelling in and out over the bar.
    chord.forEach((semi, j) => {
      const f = hz(s.root + semi);
      add(t0, bar * 1.25, (t, k) => (Math.sin(TAU * f * t) + Math.sin(TAU * f * 1.004 * t + 1)) * Math.sin(Math.PI * Math.min(1, k * 1.05)) ** 1.5, 0.05, (j - 1) * 0.5);
    });
    // Bass: the chord's root, two octaves down, on one and three.
    for (const at of [0, 2]) add(t0 + at * beat, beat * 1.8, (t) => Math.sin(TAU * hz(s.root + chord[0] - 24) * t) * Math.exp(-t * 1.6), 0.16);
    // Pluck: the chord broken upwards in eighths, a bell-like tone that dies quickly.
    const pattern = [0, 1, 2, 1, 0, 2, 1, 2];
    pattern.forEach((p, i) => {
      if (mood === "calm" && i % 2) return;
      const f = hz(s.root + chord[p] + 12);
      add(t0 + i * (beat / 2), 0.9, (t) => (Math.sin(TAU * f * t) + 0.35 * Math.sin(TAU * f * 2 * t) + 0.12 * Math.sin(TAU * f * 3.01 * t)) * Math.exp(-t * 6), 0.09 * s.pluck, i % 2 ? 0.4 : -0.4);
    });
    if (s.beat > 0) {
      // A soft kick on one and three, a shaker on the off-beats.
      for (const at of [0, 2]) add(t0 + at * beat, 0.3, (t) => Math.sin(TAU * (48 + 70 * Math.exp(-t * 28)) * t) * Math.exp(-t * 12), 0.22 * s.beat);
      for (let i = 0; i < 8; i++) if (i % 2) add(t0 + i * (beat / 2), 0.07, (t) => noise() * Math.exp(-t * 60), 0.035 * s.beat, 0.2);
    }
  }
  // A little room: two short echoes, crossed between the ears.
  for (const [delay, gain] of [[0.19, 0.22], [0.31, 0.14]] as const) {
    const d = Math.floor(delay * RATE);
    for (let i = n - 1; i >= d; i--) {
      const l = L[i - d];
      L[i] += R[i - d] * gain;
      R[i] += l * gain;
    }
  }
  // In over a breath, out over two.
  for (let i = 0; i < n; i++) {
    const t = i / RATE;
    const k = Math.min(1, t / 0.8) * Math.min(1, (seconds - t) / 2);
    L[i] *= k;
    R[i] *= k;
  }
  return [L, R];
}
