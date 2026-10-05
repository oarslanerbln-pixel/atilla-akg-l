import type { ReactElement } from "react";
import { audience, contact } from "../../src/lib/site";
import { brand, C, display, sans, serif } from "../kit";

// Rate card sent by hand in Instagram DMs, 1080×1350 (4:5 shows at full width in a chat). One card
// per market, in German: the customers are in Germany and Switzerland. Every offer is a collab on
// @atillabarbarossa. The audience figures come from src/lib/site.ts like everywhere on the site;
// prices and the reels cited as proof are typed into the brief. Rate briefs live in
// social/briefs/private/, which git ignores: the repo is public and the site quotes no prices.

export const RATE_CARD = { width: 1080, height: 1350 } as const;

export interface RatesBrief {
  kind: "rates";
  /** Output file name. */
  name: string;
  currency: "EUR" | "CHF";
  title: string;
  /** Second title line in italic gold: the market, e.g. "gedreht in München". */
  accent: string;
  /** Three offers, cheapest first. `featured` sets one in ink as the recommendation. */
  offers: { name: string; includes: string[]; price: number; featured?: boolean }[];
  /** Reels cited as proof, with their views as Instagram showed them on `asOf`. */
  proof: { title: string; views: number }[];
  /** Date the views were read, as it should appear ("04.10.2026"). */
  asOf: string;
  /** Market-specific terms, e.g. travel costs. */
  terms: string;
}

/** Swiss cards group digits the Swiss way (1’190), German ones with a dot. */
const locale = (b: RatesBrief) => (b.currency === "CHF" ? "de-CH" : "de-DE");

function money(b: RatesBrief, amount: number) {
  const n = new Intl.NumberFormat(locale(b)).format(amount);
  return b.currency === "CHF" ? `CHF ${n}` : `${n} €`;
}

const eyebrowStyle = {
  fontFamily: sans,
  fontWeight: 500,
  textTransform: "uppercase",
  color: C.graphite,
} as const;

export function rateCard(b: RatesBrief): ReactElement {
  const number = new Intl.NumberFormat(locale(b), { maximumFractionDigits: 1 });
  const stats: [string, string][] = [
    [`${Math.round(audience.followers.instagram / 1000)}K`, "Follower auf Instagram"],
    [`${Math.round(audience.average.reels / 1000)}K+`, "Ø Konten pro Reel"],
    [`${number.format(audience.accountsReached / 1_000_000)} Mio.`, "Erreichte Konten"],
    [`${audience.dach} %`, "Community aus DACH"],
  ];
  const titleSize = Math.min(78, Math.floor(920 / (0.5 * Math.max(b.title.length, b.accent.length))));

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        padding: "0 80px",
        backgroundColor: C.porcelain,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- rendered by next/og, not a page */}
      <img src={brand.logoOnLight.src} width={300} height={Math.round(300 / brand.logoOnLight.ratio)} alt="" />

      <div style={{ ...eyebrowStyle, display: "flex", marginTop: 40, fontSize: 22, letterSpacing: 6, color: C.goldReadable }}>
        Collab, Dreh & Schnitt
      </div>
      <div style={{ display: "flex", marginTop: 14, fontFamily: serif, fontSize: titleSize, lineHeight: 1.04, color: C.text }}>
        {b.title}
      </div>
      <div
        style={{
          display: "flex",
          fontFamily: serif,
          fontStyle: "italic",
          fontSize: titleSize,
          lineHeight: 1.04,
          color: C.goldReadable,
        }}
      >
        {b.accent}
      </div>

      <div
        style={{
          display: "flex",
          width: "100%",
          marginTop: 38,
          padding: "22px 0",
          borderTop: `1.5px solid ${C.hairline}`,
          borderBottom: `1.5px solid ${C.hairline}`,
        }}
      >
        {stats.map(([figure, label], i) => (
          <div
            key={label}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              flex: 1,
              padding: "0 10px",
              borderLeft: i ? `1.5px solid ${C.hairline}` : "none",
            }}
          >
            <div style={{ display: "flex", fontFamily: display, fontWeight: 300, fontSize: 54, lineHeight: 1.1, color: C.text }}>
              {figure}
            </div>
            <div style={{ ...eyebrowStyle, display: "flex", marginTop: 6, fontSize: 15, letterSpacing: 2.5, lineHeight: 1.35, textAlign: "center" }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", width: "100%", marginTop: 24 }}>
        {b.proof.slice(0, 2).map((p) => (
          <div key={p.title} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
            <div style={{ display: "flex", fontFamily: serif, fontWeight: 600, fontSize: 30, color: C.goldReadable }}>
              {`${number.format(p.views)} Aufrufe`}
            </div>
            <div style={{ display: "flex", marginTop: 2, fontFamily: sans, fontSize: 19, color: C.graphite }}>{p.title}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", width: "100%", gap: 16, marginTop: 34 }}>
        {b.offers.slice(0, 3).map((o) => {
          const ink = Boolean(o.featured);
          return (
            <div
              key={o.name}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "26px 34px",
                borderRadius: 22,
                border: ink ? "none" : `1.5px solid ${C.hairline}`,
                backgroundColor: ink ? C.ink : C.porcelain,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", flex: 1, paddingRight: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ display: "flex", fontFamily: serif, fontSize: 40, lineHeight: 1.1, color: ink ? C.porcelain : C.text }}>
                    {o.name}
                  </div>
                  {ink && (
                    <div
                      style={{
                        ...eyebrowStyle,
                        display: "flex",
                        padding: "6px 14px",
                        borderRadius: 999,
                        fontSize: 14,
                        letterSpacing: 2.5,
                        color: C.ink,
                        backgroundColor: C.goldLight,
                      }}
                    >
                      Empfohlen
                    </div>
                  )}
                </div>
                {/* Lines break between items, never inside one. */}
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    columnGap: 8,
                    marginTop: 8,
                    fontFamily: sans,
                    fontSize: 20,
                    lineHeight: 1.42,
                    color: ink ? C.onInkSoft : C.graphite,
                  }}
                >
                  {o.includes.map((item, i) => (
                    <div key={item} style={{ display: "flex" }}>
                      {i < o.includes.length - 1 ? `${item} ·` : item}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", fontFamily: serif, fontWeight: 600, fontSize: 50, color: ink ? C.goldLight : C.goldReadable }}>
                {money(b, o.price)}
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
          gap: 6,
          marginTop: 28,
          fontFamily: sans,
          fontSize: 19,
          lineHeight: 1.4,
          color: C.graphite,
          textAlign: "center",
        }}
      >
        <div style={{ display: "flex" }}>{`${b.currency === "CHF" ? "Nettopreise in CHF" : "Nettopreise zzgl. MwSt."} · ${b.terms} · Nutzung für Ads auf Anfrage`}</div>
        <div style={{ display: "flex" }}>
          {`Jede Collab erscheint auf beiden Profilen, als Anzeige gekennzeichnet · Aufrufe: Stand ${b.asOf}`}
        </div>
        <div style={{ display: "flex", marginTop: 6, fontWeight: 500, fontSize: 21, color: C.text }}>
          {`Anfragen per DM oder an ${contact.email}`}
        </div>
      </div>
    </div>
  );
}
