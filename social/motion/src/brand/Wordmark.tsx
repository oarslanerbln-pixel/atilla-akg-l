import React, { useId } from "react";
import { useCurrentFrame } from "remotion";
import { WORDMARK } from "../../../../src/components/brandWordmarkPaths";
import { progress } from "../lib/tokens";

// The outlined wordmark (never retyped), uncovered from the centre outwards behind a soft
// edge, as if light were crossing it.

export const Wordmark: React.FC<{ width: number; colour: string; at: number; dur?: number }> = ({ width, colour, at, dur = 1.1 }) => {
  const frame = useCurrentFrame();
  const id = useId();
  const p = progress(frame, at, dur);
  const cap = WORDMARK.capHeight;
  const half = (WORDMARK.width / 2) * p;
  const soft = 180;
  return (
    <svg width={width} height={(width * cap) / WORDMARK.width} viewBox={`0 ${-cap} ${WORDMARK.width} ${cap}`} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`${id}g`} gradientUnits="userSpaceOnUse" x1={WORDMARK.width / 2 - half - soft} x2={WORDMARK.width / 2 + half + soft}>
          <stop offset={0} stopColor="#000" />
          <stop offset={soft / (2 * (half + soft))} stopColor="#fff" />
          <stop offset={1 - soft / (2 * (half + soft))} stopColor="#fff" />
          <stop offset={1} stopColor="#000" />
        </linearGradient>
        <mask id={`${id}m`} maskUnits="userSpaceOnUse" x={-soft} y={-cap * 1.5} width={WORDMARK.width + 2 * soft} height={cap * 2}>
          <rect x={WORDMARK.width / 2 - half - soft} y={-cap * 1.5} width={2 * (half + soft)} height={cap * 2} fill={`url(#${id}g)`} />
        </mask>
      </defs>
      <path d={WORDMARK.d} fill={colour} mask={`url(#${id}m)`} opacity={p > 0 ? 1 : 0} />
    </svg>
  );
};
