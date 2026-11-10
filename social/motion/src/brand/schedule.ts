// When each stroke of the mark is drawn, in seconds from the start of the drawing. Pure data, so
// the tests can hold it to the rules (every stroke finishes, nothing starts before zero).
//
// The order tells the mark's own story: the spire falls from its apex, the fourth line rises
// out of the left foot, the horizon closes in from both sides, and the sun comes up where the
// needles would meet.

export interface Stroke {
  start: number;
  dur: number;
  /** Drawn from the end of its path backwards (the inner left line rises from the foot). */
  reverse?: boolean;
}

/** Same order as INK in social/brand/mark.ts: left leg, right leg, inner right, inner left. */
export const INK_STROKES: Stroke[] = [
  { start: 0, dur: 0.85 },
  { start: 0.06, dur: 0.85 },
  { start: 0.14, dur: 0.85 },
  { start: 0.42, dur: 0.75, reverse: true },
];

/** The four needle edges, each from its outer tip towards the centre. */
export const NEEDLE_STROKE: Stroke = { start: 0.8, dur: 0.6 };

export const SUN_RISE = { start: 1.25, dur: 0.6 };

/** Seconds until the whole mark stands. */
export const MARK_DRAWN = SUN_RISE.start + SUN_RISE.dur;
