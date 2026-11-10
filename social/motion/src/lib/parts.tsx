import React from "react";
import { useCurrentFrame } from "remotion";
import { C } from "../../../palette";
import { ENTER, EXIT, easeIn, easeInOut, progress, rise } from "./tokens";

// The few moves everything is made of. An entrance never hides copy behind an effect: it
// starts soft and low and moves into place, as on the site.

/** Rises into place at `at` and, with `until`, leaves again. */
export const Rise: React.FC<{ at: number; until?: number; dist?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({
  at,
  until,
  dist,
  style,
  children,
}) => {
  const r = rise(useCurrentFrame(), at, until, dist);
  return <div style={{ display: "flex", ...style, opacity: r.opacity, transform: `translateY(${r.y}px)` }}>{children}</div>;
};

/** A title line that comes up from behind its own baseline. */
export const MaskLine: React.FC<{ at: number; until?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ at, until, style, children }) => {
  const frame = useCurrentFrame();
  const inn = progress(frame, at, ENTER.dur + 0.1);
  const out = until === undefined ? 0 : progress(frame, until - EXIT.dur, EXIT.dur, easeIn);
  return (
    // The padding keeps descenders and italic overhangs inside the mask.
    <div style={{ display: "flex", overflow: "hidden", padding: "0.08em 0.12em 0.16em", margin: "-0.08em -0.12em -0.16em" }}>
      <div style={{ display: "flex", ...style, transform: `translateY(${(1 - inn) * 105}%)`, opacity: 1 - out }}>{children}</div>
    </div>
  );
};

/** A hairline drawn from its left end. */
export const Hairline: React.FC<{ at: number; until?: number; width: number | string; colour: string; weight?: number; style?: React.CSSProperties }> = ({
  at,
  until,
  width,
  colour,
  weight = 2,
  style,
}) => {
  const frame = useCurrentFrame();
  const inn = progress(frame, at, 0.9, easeInOut);
  const out = until === undefined ? 0 : progress(frame, until - EXIT.dur, EXIT.dur, easeIn);
  return <div style={{ width, height: weight, backgroundColor: colour, transformOrigin: "left center", transform: `scaleX(${inn})`, opacity: 1 - out, ...style }} />;
};

/** Ink rising from the lower edge, so light type holds over any footage. Fades with the card. */
export const Scrim: React.FC<{ at: number; until: number; height: string }> = ({ at, until, height }) => {
  const frame = useCurrentFrame();
  const k = progress(frame, at, 0.8) * (1 - progress(frame, until - EXIT.dur, EXIT.dur, easeIn));
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height,
        opacity: k,
        background: `linear-gradient(to top, ${C.ink}d9 0%, ${C.ink}8c 45%, ${C.ink}00 100%)`,
      }}
    />
  );
};

export const eyebrow = (colour: string, size = 26): React.CSSProperties => ({
  fontWeight: 500,
  fontSize: size,
  letterSpacing: size * 0.23,
  textTransform: "uppercase",
  color: colour,
});
