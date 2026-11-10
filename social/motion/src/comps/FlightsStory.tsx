import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { ROWS_AT, ROW_GAP, ctaAt, type FlightsProps } from "../briefs";
import { FLIGHTS_COPY } from "../../../flights";
import { C } from "../../../palette";
import { loadFonts, sans, serif } from "../lib/fonts";
import { Hairline, MaskLine, Rise, eyebrow } from "../lib/parts";
import { clamp, progress } from "../lib/tokens";

// The flights story (social/templates/flights.tsx), moving: the same brief, the same copy
// (social/flights.ts), the same layout between Instagram's bars. Rows arrive cheapest first and
// each price counts up to its figure, which is on screen in full well before the story ends.

/** Title size that keeps the longer title line on one line within the 904 px column (serif ≈ 0.5 em a letter). */
const titleSize = (...lines: (string | undefined)[]) => Math.min(140, Math.floor(904 / (0.5 * Math.max(...lines.map((l) => l?.length ?? 0)))));

const Price: React.FC<{ eur: number; at: number; lang: FlightsProps["lang"] }> = ({ eur, at, lang }) => {
  const frame = useCurrentFrame();
  const shown = Math.round(eur * clamp(progress(frame, at, 0.9)));
  const [prefix, price] = FLIGHTS_COPY[lang].price(shown);
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
      {prefix && <div style={{ fontSize: 28, color: C.graphite }}>{prefix}</div>}
      <div style={{ fontFamily: serif, fontWeight: 600, fontSize: 70, color: C.goldReadable, fontVariantNumeric: "tabular-nums" }}>{price}</div>
    </div>
  );
};

export const FlightsStory: React.FC<FlightsProps> = (p) => {
  loadFonts();
  const t = FLIGHTS_COPY[p.lang];
  const size = titleSize(p.title, p.accent);
  const cta = ctaAt(p);
  return (
    <AbsoluteFill style={{ backgroundColor: C.porcelain, alignItems: "center", padding: "270px 88px 0", fontFamily: sans, color: C.text }}>
      <Rise at={0.1} dist={16}>
        <Img src={staticFile("logo-horizontal.svg")} style={{ width: 380 }} />
      </Rise>
      <Rise at={0.35} dist={20} style={{ marginTop: 76, ...eyebrow(C.goldReadable) }}>
        {`${t.ad} · ${p.partner}`}
      </Rise>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 24 }}>
        <MaskLine at={0.5} style={{ fontFamily: serif, fontSize: size, lineHeight: 1.02 }}>
          {p.title}
        </MaskLine>
        {p.accent && (
          <MaskLine at={0.62} style={{ fontFamily: serif, fontStyle: "italic", fontSize: size, lineHeight: 1.02, color: C.goldReadable }}>
            {p.accent}
          </MaskLine>
        )}
      </div>
      <Rise at={1.0} dist={20} style={{ marginTop: 28, fontSize: 30, color: C.graphite }}>
        {t.trip}
      </Rise>

      <div style={{ display: "flex", flexDirection: "column", width: "100%", marginTop: 56 }}>
        <Hairline at={ROWS_AT - 0.2} width="100%" colour={C.hairline} weight={1.5} />
        {p.deals.map((d, i) => {
          const at = ROWS_AT + i * ROW_GAP;
          return (
            <div key={d.destination} style={{ display: "flex", flexDirection: "column" }}>
              <Rise at={at} dist={24} style={{ alignItems: "center", justifyContent: "space-between", height: 112 }}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ fontFamily: serif, fontSize: 58, lineHeight: 1.05 }}>{d.destination}</div>
                  {d.detail && <div style={{ marginTop: 4, ...eyebrow(C.graphite, 20) }}>{d.detail}</div>}
                </div>
                <Price eur={d.price} at={at + 0.1} lang={p.lang} />
              </Rise>
              <Hairline at={at + 0.15} width="100%" colour={C.hairline} weight={1.5} />
            </div>
          );
        })}
      </div>

      <Rise
        at={cta}
        dist={40}
        style={{ flexDirection: "column", alignItems: "center", width: "100%", marginTop: 52, padding: "34px 40px", borderRadius: 28, backgroundColor: C.ink }}
      >
        <div style={{ fontFamily: serif, fontStyle: "italic", fontSize: 56, color: C.goldLight }}>{t.reply(p.keyword)}</div>
        <div style={{ marginTop: 8, fontSize: 30, color: C.onInkSoft }}>{t.dm}</div>
      </Rise>
      <Rise at={cta + 0.3} dist={12} style={{ marginTop: 26, fontSize: 20, lineHeight: 1.45, color: C.graphite, textAlign: "center" }}>
        {t.note(p.partner, p.asOf)}
      </Rise>
    </AbsoluteFill>
  );
};
