import React from "react";
import { useCurrentFrame } from "remotion";
import { INK, SUN, TEAL, outlinePart } from "../../../brand/mark";
import { easeInOut, progress } from "../lib/tokens";
import { INK_STROKES, NEEDLE_STROKE, SUN_RISE, type Stroke } from "./schedule";

// The spire A, drawn by a pen: every stroke grows along its own centreline with the artwork's
// taper (outlinePart in social/brand/mark.ts, the mark's one geometry source), so the last
// frame is the exported mark, line for line.

export interface MarkColours {
  ink: string;
  teal: string;
  gold: string;
}

const part = (line: (typeof INK)[number], weight: number, stroke: Stroke, frame: number, at: number) => {
  const p = progress(frame, at + stroke.start, stroke.dur, easeInOut);
  return stroke.reverse ? outlinePart(line, weight, 1 - p, 1) : outlinePart(line, weight, 0, p);
};

export const MarkDraw: React.FC<{
  size: number;
  colours: MarkColours;
  /** Second at which the pen touches down. */
  at?: number;
  /** Line weight; 1 is the artwork's hairline. Heavier as the mark gets smaller. */
  weight?: number;
}> = ({ size, colours, at = 0, weight = 2 }) => {
  const frame = useCurrentFrame();
  const sun = progress(frame, at + SUN_RISE.start, SUN_RISE.dur);
  // A ring of light leaves the sun as it arrives and is gone before the eye settles on it.
  const halo = progress(frame, at + SUN_RISE.start + 0.1, 1.1);
  const r = SUN.r * (1 + (weight - 1) * 0.18);
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: "visible" }}>
      {INK.map((line, i) => (
        <path key={i} d={part(line, weight, INK_STROKES[i], frame, at)} fill={colours.ink} />
      ))}
      {TEAL.map((line, i) => (
        <path key={i} d={part(line, weight, NEEDLE_STROKE, frame, at)} fill={colours.teal} />
      ))}
      {halo > 0 && halo < 1 && (
        <circle cx={SUN.cx} cy={SUN.cy} r={r * (1 + halo * 5)} fill="none" stroke={colours.gold} strokeWidth={0.35} opacity={(1 - halo) * 0.5} />
      )}
      <circle cx={SUN.cx} cy={SUN.cy} r={r * sun} fill={colours.gold} />
    </svg>
  );
};
