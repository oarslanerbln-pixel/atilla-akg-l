import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { WORDMARK } from "../../../../src/components/brandWordmarkPaths";
import { MarkDraw } from "../brand/MarkDraw";
import { LINE_AT, LOCKUP, WORD_AT, WORD_DUR, type StingProps } from "../briefs";
import { MARK_DRAWN } from "../brand/schedule";
import { Wordmark } from "../brand/Wordmark";
import { loadFonts, sans } from "../lib/fonts";
import { THEMES } from "../lib/theme";
import { EXIT, easeIn, lastSecond, lerp, progress, rise } from "../lib/tokens";

// The brand sting: the mark is drawn, the sun comes up, the name is uncovered. An opening or a
// closing card for a reel, a story or a film; on a transparent ground it sits over footage.

export const Sting: React.FC<StingProps> = (props) => {
  loadFonts();
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  const t = THEMES[props.tone];
  const total = lastSecond(durationInFrames);
  // The lockup is 100 units wide at the mark and 112 at the name; it takes 52 % of the short side.
  const unit = (Math.min(width, height) * 0.52) / 100;
  const wordWidth = ((WORDMARK.width * LOCKUP.cap) / WORDMARK.capHeight) * unit;
  const out = props.out === "fade" ? progress(frame, total - EXIT.dur, EXIT.dur, easeIn) : 0;
  // One slow push in over the whole card; the eye reads it as depth, not as movement.
  const push = lerp(1, 1.035, frame / durationInFrames);
  const glow = progress(frame, MARK_DRAWN - 0.5, 2.2);
  const line = rise(frame, LINE_AT, undefined, 18);
  return (
    <AbsoluteFill style={{ backgroundColor: t.ground }}>
      <AbsoluteFill style={{ opacity: 1 - out, alignItems: "center", justifyContent: "center" }}>
        {props.tone === "ink" && (
          // Dawn behind the horizon: a breath of gold, never a spotlight.
          <AbsoluteFill
            style={{
              opacity: glow * 0.5,
              background: `radial-gradient(${60 * unit}px ${42 * unit}px at 50% ${height / 2 - 6 * unit}px, rgba(216, 180, 130, 0.22), rgba(216, 180, 130, 0) 70%)`,
            }}
          />
        )}
        <div style={{ position: "relative", width: 100 * unit, height: (props.line ? 122 : LOCKUP.baseline) * unit, transform: `scale(${push})` }}>
          <MarkDraw size={100 * unit} colours={t.mark} />
          <div style={{ position: "absolute", left: (100 * unit - wordWidth) / 2, top: (LOCKUP.baseline - LOCKUP.cap) * unit }}>
            <Wordmark width={wordWidth} colour={t.mark.ink} at={WORD_AT} dur={WORD_DUR} />
          </div>
          {props.line && (
            <div
              style={{
                position: "absolute",
                left: -100 * unit,
                right: -100 * unit,
                top: 114 * unit,
                textAlign: "center",
                fontFamily: sans,
                fontWeight: 500,
                fontSize: 4.4 * unit,
                letterSpacing: 1.1 * unit,
                textTransform: "uppercase",
                color: t.accent,
                opacity: line.opacity,
                transform: `translateY(${line.y}px)`,
              }}
            >
              {props.line}
            </div>
          )}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
