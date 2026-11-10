// Motion tokens: the one place timing lives. Pure functions of the frame number, no Remotion
// imports, so the same numbers run in the renderer, in the checks and in the tests.
//
// The curve is the site's (CLAUDE.md, "soft luxury easing"): fast out of the gate, a long
// settle, no overshoot. Nothing bounces.

export const FPS = 30;
export const EASE = [0.16, 1, 0.3, 1] as const;

/** A CSS cubic-bezier as a function of time, solved by bisection (monotonic in x). */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const curve = (a: number, b: number, t: number) => 3 * (1 - t) * (1 - t) * t * a + 3 * (1 - t) * t * t * b + t * t * t;
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2;
      if (curve(x1, x2, mid) < x) lo = mid;
      else hi = mid;
    }
    return curve(y1, y2, (lo + hi) / 2);
  };
}

export const ease = cubicBezier(...EASE);
/** For leaving: slow to start, then gone. */
export const easeIn = cubicBezier(0.7, 0, 0.84, 0);
/** For drawn lines: an even hand, eased only at both ends. */
export const easeInOut = cubicBezier(0.65, 0, 0.35, 1);

export const sec = (s: number) => Math.round(s * FPS);
export const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

/** 0 to 1 between `start` and `start + dur` (seconds), on the house curve unless told otherwise. */
export function progress(frame: number, start: number, dur: number, curve: (x: number) => number = ease) {
  // The small sum keeps a move that ends exactly on a frame from stopping a rounding error short.
  return curve(clamp((frame / FPS - start) / dur + 1e-9));
}

/** Entrances: 0.6 to 1.2 s, 20 to 40 px of travel (the design skill's range, scaled to a 1080 px frame). */
export const ENTER = { dur: 0.9, rise: 36, gap: 0.09 } as const;
export const EXIT = { dur: 0.45 } as const;

/** Opacity and offset of an element that rises into place at `start` and, optionally, leaves at `end`. */
export function rise(frame: number, start: number, end?: number, dist: number = ENTER.rise) {
  const inn = progress(frame, start, ENTER.dur);
  const out = end === undefined ? 0 : progress(frame, end - EXIT.dur, EXIT.dur, easeIn);
  return { opacity: clamp(inn * 1.6) * (1 - out), y: (1 - inn) * dist - out * dist * 0.4 };
}

/** The second of a film's last frame. Exits end on it, so an overlay's final frame is empty and cuts clean. */
export const lastSecond = (durationInFrames: number) => (durationInFrames - 1) / FPS;

/** How long a line has to stay readable: 1 s plus 0.4 s a word. */
export function readTime(text: string) {
  return 1 + 0.4 * text.trim().split(/\s+/).filter(Boolean).length;
}
