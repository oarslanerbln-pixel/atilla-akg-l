import type { ReactElement } from "react";
import { FLIGHTS_COPY, type FlightsBrief } from "../flights";
import { brand, C, sans, serif } from "../kit";

export type { FlightsBrief };

// Story with the cheapest flight destinations, 1080×1920. Instagram's bars cover roughly the top
// 250 and bottom 250 pixels, so the content stays between them. Prices are typed in from the
// partner's page: no partner offers a price feed to us, and reading their pages by script is not allowed.

/** Title size that keeps the longer title line on one line within the 904 px column (serif ≈ 0.5 em a letter). */
function titleSize(...lines: (string | undefined)[]) {
  const longest = Math.max(...lines.map((l) => l?.length ?? 0));
  return Math.min(140, Math.floor(904 / (0.5 * longest)));
}

export function flightsStory(b: FlightsBrief): ReactElement {
  const t = FLIGHTS_COPY[b.lang];
  const size = titleSize(b.title, b.accent);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        height: "100%",
        padding: "270px 88px 0",
        backgroundColor: C.porcelain,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- rendered by next/og, not a page */}
      <img src={brand.logoOnLight.src} width={380} height={Math.round(380 / brand.logoOnLight.ratio)} alt="" />

      <div
        style={{
          display: "flex",
          marginTop: 76,
          fontFamily: sans,
          fontWeight: 500,
          fontSize: 26,
          letterSpacing: 6,
          textTransform: "uppercase",
          color: C.goldReadable,
        }}
      >
        {`${t.ad} · ${b.partner}`}
      </div>
      <div style={{ display: "flex", marginTop: 24, fontFamily: serif, fontSize: size, lineHeight: 1.02, color: C.text }}>{b.title}</div>
      {b.accent && (
        <div style={{ display: "flex", fontFamily: serif, fontStyle: "italic", fontSize: size, lineHeight: 1.02, color: C.goldReadable }}>
          {b.accent}
        </div>
      )}
      <div style={{ display: "flex", marginTop: 28, fontFamily: sans, fontSize: 30, color: C.graphite }}>{t.trip}</div>

      <div style={{ display: "flex", flexDirection: "column", width: "100%", marginTop: 56, borderTop: `1.5px solid ${C.hairline}` }}>
        {b.deals.slice(0, 4).map((d) => {
          const [prefix, price] = t.price(d.price);
          return (
            <div
              key={d.destination}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                height: 112,
                borderBottom: `1.5px solid ${C.hairline}`,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", fontFamily: serif, fontSize: 58, lineHeight: 1.05, color: C.text }}>{d.destination}</div>
                {d.detail && (
                  <div
                    style={{
                      display: "flex",
                      marginTop: 4,
                      fontFamily: sans,
                      fontWeight: 500,
                      fontSize: 20,
                      letterSpacing: 4,
                      textTransform: "uppercase",
                      color: C.graphite,
                    }}
                  >
                    {d.detail}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
                {prefix && <div style={{ display: "flex", fontFamily: sans, fontSize: 28, color: C.graphite }}>{prefix}</div>}
                <div style={{ display: "flex", fontFamily: serif, fontWeight: 600, fontSize: 70, color: C.goldReadable }}>{price}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          marginTop: 52,
          padding: "34px 40px",
          borderRadius: 28,
          backgroundColor: C.ink,
        }}
      >
        <div style={{ display: "flex", fontFamily: serif, fontStyle: "italic", fontSize: 56, color: C.goldLight }}>{t.reply(b.keyword)}</div>
        <div style={{ display: "flex", marginTop: 8, fontFamily: sans, fontSize: 30, color: C.onInkSoft }}>{t.dm}</div>
      </div>

      <div style={{ display: "flex", marginTop: 26, fontFamily: sans, fontSize: 20, lineHeight: 1.45, color: C.graphite, textAlign: "center" }}>
        {t.note(b.partner, b.asOf)}
      </div>
    </div>
  );
}
