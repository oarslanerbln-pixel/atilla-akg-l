import type { ReactElement } from "react";
import { brand, C, sans, serif, type Lang } from "../kit";

// Story with the cheapest flight destinations, 1080×1920. Instagram's bars cover roughly the top
// 250 and bottom 250 pixels, so the content stays between them. Prices are typed in from the
// partner's page: no partner offers a price feed to us, and reading their pages by script is not allowed.

export interface FlightsBrief {
  kind: "flights";
  /** Output file name. */
  name: string;
  lang: Lang;
  /** The affiliate partner, named in the ad label and the price note. */
  partner: string;
  title: string;
  /** Second title line in italic gold, e.g. "ab Berlin". */
  accent?: string;
  /** Keyword for story replies; must match the partner offer's keywords in supabase/offers.sql. */
  keyword: string;
  /** Date the prices were read, as it should appear ("27.09.2026"). */
  asOf: string;
  /** Up to four destinations, cheapest first. */
  deals: { city: string; country: string; price: number }[];
}

const COPY: Record<
  Lang,
  { ad: string; trip: string; price: (eur: number) => [string, string]; reply: (k: string) => string; dm: string; note: (p: string, d: string) => string }
> = {
  de: {
    ad: "Anzeige",
    trip: "Hin & zurück · Economy · pro Person",
    price: (eur) => ["ab", `${eur} €`],
    reply: (k) => `Antworte mit „${k}“`,
    dm: "und ich schicke dir den Link per DM.",
    note: (p, d) => `Niedrigste geschätzte Preise laut ${p}, Stand ${d}. Preise und Verfügbarkeit können sich jederzeit ändern.`,
  },
  en: {
    ad: "Ad",
    trip: "Return · Economy · per person",
    price: (eur) => ["from", `${eur} €`],
    reply: (k) => `Reply “${k}”`,
    dm: "and I’ll send you the link by DM.",
    note: (p, d) => `Lowest estimated prices on ${p} as of ${d}. Prices and availability may change at any time.`,
  },
  tr: {
    ad: "Reklam",
    trip: "Gidiş-dönüş · Ekonomi · kişi başı",
    price: (eur) => ["", `${eur} €'dan`],
    reply: (k) => `Story'ye „${k}“ yaz`,
    dm: "linki DM'den göndereyim.",
    note: (p, d) => `${p} üzerindeki en düşük tahmini fiyatlar, ${d} itibarıyla. Fiyatlar ve müsaitlik her an değişebilir.`,
  },
};

export function flightsStory(b: FlightsBrief): ReactElement {
  const t = COPY[b.lang];
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
      <div style={{ display: "flex", marginTop: 24, fontFamily: serif, fontSize: 140, lineHeight: 1.02, color: C.text }}>{b.title}</div>
      {b.accent && (
        <div style={{ display: "flex", fontFamily: serif, fontStyle: "italic", fontSize: 140, lineHeight: 1.02, color: C.goldReadable }}>
          {b.accent}
        </div>
      )}
      <div style={{ display: "flex", marginTop: 28, fontFamily: sans, fontSize: 30, color: C.graphite }}>{t.trip}</div>

      <div style={{ display: "flex", flexDirection: "column", width: "100%", marginTop: 56, borderTop: `1.5px solid ${C.hairline}` }}>
        {b.deals.slice(0, 4).map((d) => {
          const [prefix, price] = t.price(d.price);
          return (
            <div
              key={d.city}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                height: 112,
                borderBottom: `1.5px solid ${C.hairline}`,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", fontFamily: serif, fontSize: 58, lineHeight: 1.05, color: C.text }}>{d.city}</div>
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
                  {d.country}
                </div>
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
