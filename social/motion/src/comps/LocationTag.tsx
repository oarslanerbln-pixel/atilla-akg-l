import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import type { LocationProps } from "../briefs";
import { BASE, bearing, formatCoords } from "../../../../src/lib/partners";
import { loadFonts, sans, serif } from "../lib/fonts";
import { FORMATS, formatOf } from "../lib/formats";
import { distanceKm, formatInt, upper } from "../lib/geo";
import { Hairline, MaskLine, Rise, Scrim, eyebrow } from "../lib/parts";
import { THEMES } from "../lib/theme";
import { EXIT, easeIn, lastSecond, progress } from "../lib/tokens";

// Where the film is: a compass whose needle turns from north to the bearing from Berlin, the
// place, its coordinates. The partner cards on the site do the same with the same function, so
// the reel and the page point the same way. Transparent ground: an overlay for footage.

const Compass: React.FC<{ size: number; to: number; until: number }> = ({ size, to, until }) => {
  const frame = useCurrentFrame();
  const t = THEMES.alpha;
  const ring = progress(frame, 0.1, 1.1);
  // The needle swings the short way round and settles; no wobble.
  const turn = (to > 180 ? to - 360 : to) * progress(frame, 0.45, 1.5);
  const out = progress(frame, until - EXIT.dur, EXIT.dur, easeIn);
  const c = 2 * Math.PI * 46;
  return (
    <svg width={size} height={size} viewBox="-50 -50 100 100" style={{ opacity: 1 - out, flexShrink: 0 }}>
      <circle r={46} fill="none" stroke={t.hairline} strokeWidth={0.8} strokeDasharray={c} strokeDashoffset={c * (1 - ring)} transform="rotate(-90)" />
      {[0, 90, 180, 270].map((a) => (
        <line key={a} y1={-46} y2={a === 0 ? -36 : -41} stroke={a === 0 ? t.accent : t.soft} strokeWidth={a === 0 ? 1.4 : 0.8} transform={`rotate(${a})`} opacity={ring} />
      ))}
      <g transform={`rotate(${turn})`} opacity={ring}>
        <path d="M0 -33 L3.2 0 L0 5 L-3.2 0 Z" fill={t.accent} />
        <path d="M0 33 L2.2 0 L-2.2 0 Z" fill={t.mark.teal} opacity={0.9} />
        <circle r={1.7} fill={t.ground === "transparent" ? "#140f0a" : t.ground} stroke={t.accent} strokeWidth={0.7} />
      </g>
    </svg>
  );
};

export const LocationTag: React.FC<LocationProps> = (p) => {
  loadFonts();
  const { width, height, durationInFrames } = useVideoConfig();
  const safe = FORMATS[formatOf(width, height)].safe;
  const t = THEMES.alpha;
  const until = lastSecond(durationInFrames);
  const here = { lat: p.lat, lon: p.lon };
  const deg = bearing(BASE, here);
  const km = distanceKm(BASE, here);
  const wide = width > height;
  const k = wide ? 1.2 : 1.3;
  const column = width - safe.left - safe.right - 150 * k - 36 * k;
  // Serif capitals average half an em; the place stays on one line.
  const size = Math.min(104 * k, Math.floor(column / (0.52 * p.place.length)));
  return (
    <AbsoluteFill>
      {p.scrim && <Scrim at={0} until={until} height={wide ? "46%" : "44%"} />}
      <div style={{ position: "absolute", left: safe.left, right: safe.right, bottom: safe.bottom, display: "flex", alignItems: "center", gap: 36 * k }}>
        <Compass size={150 * k} to={deg} until={until} />
        <div style={{ display: "flex", flexDirection: "column", fontFamily: sans, color: t.text }}>
          <Rise at={0.35} until={until} dist={20} style={eyebrow(t.accent, 22 * k)}>
            {p.detail ? upper(p.detail, p.lang) : `Berlin → ${formatInt(km, p.lang)} km`}
          </Rise>
          <MaskLine at={0.5} until={until} style={{ fontFamily: serif, fontSize: size, lineHeight: 1.08, marginTop: 10 * k }}>
            {p.place}
          </MaskLine>
          <Hairline at={0.8} until={until} width={88 * k} colour={t.accent} style={{ marginTop: 18 * k }} />
          <Rise at={1.0} until={until} dist={16} style={{ marginTop: 16 * k, fontSize: 24 * k, letterSpacing: 1.5, color: t.soft, fontVariantNumeric: "tabular-nums" }}>
            {formatCoords(here)}
            {p.detail ? `  ·  ${formatInt(km, p.lang)} km  ·  ${Math.round(deg)}°` : `  ·  ${Math.round(deg)}°`}
          </Rise>
        </div>
      </div>
    </AbsoluteFill>
  );
};
