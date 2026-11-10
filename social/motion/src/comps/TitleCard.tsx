import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import type { TitleProps } from "../briefs";
import { loadFonts, sans, serif } from "../lib/fonts";
import { FORMATS, formatOf } from "../lib/formats";
import { upper } from "../lib/geo";
import { Hairline, MaskLine, Rise, Scrim, eyebrow } from "../lib/parts";
import { THEMES } from "../lib/theme";
import { lastSecond } from "../lib/tokens";

// The reel cover's type, moving: eyebrow, a serif title coming up from its baseline, the
// second line in italic gold. It carries the same fields as a cover brief (social/templates/
// covers.tsx), so the cover and the film's opening say the same thing. Transparent ground.

export const TitleCard: React.FC<TitleProps> = (p) => {
  loadFonts();
  const { width, height, durationInFrames } = useVideoConfig();
  const safe = FORMATS[formatOf(width, height)].safe;
  const t = THEMES.alpha;
  const until = lastSecond(durationInFrames);
  const wide = width > height;
  const column = width - safe.left - safe.right;
  const longest = Math.max(p.title.length, p.accent?.length ?? 0);
  // One line each within the column (serif ≈ 0.5 em a letter), as the still covers size theirs.
  const size = Math.min(wide ? 132 : 148, Math.floor(column / (0.5 * longest)));
  return (
    <AbsoluteFill>
      {p.scrim && <Scrim at={0} until={until} height={wide ? "62%" : "56%"} />}
      <div style={{ position: "absolute", left: safe.left, right: safe.right, bottom: safe.bottom, display: "flex", flexDirection: "column", fontFamily: sans, color: t.text }}>
        <Rise at={0.1} until={until} dist={20} style={eyebrow(t.accent)}>
          {upper(p.eyebrow, p.lang)}
        </Rise>
        <Hairline at={0.25} until={until} width={88} colour={t.accent} style={{ margin: "26px 0 22px" }} />
        <MaskLine at={0.4} until={until} style={{ fontFamily: serif, fontSize: size, lineHeight: 1.04 }}>
          {p.title}
        </MaskLine>
        {p.accent && (
          <MaskLine at={0.52} until={until} style={{ fontFamily: serif, fontStyle: "italic", fontSize: size, lineHeight: 1.04, color: t.accent }}>
            {p.accent}
          </MaskLine>
        )}
        {p.subtitle && (
          <Rise at={0.95} until={until} dist={20} style={{ marginTop: 28, fontSize: 32, lineHeight: 1.35, color: t.soft, maxWidth: column * 0.9 }}>
            {p.subtitle}
          </Rise>
        )}
      </div>
    </AbsoluteFill>
  );
};
