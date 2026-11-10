// What a flights story says, for the still (templates/flights.tsx) and the moving one
// (motion/src/comps/FlightsStory.tsx). No imports: a Node script and a browser bundle both read it.

export type Lang = "de" | "en" | "tr";

export interface FlightsBrief {
  kind: "flights";
  /** Output file name. */
  name: string;
  lang: Lang;
  /** The affiliate partner, named in the ad label and the price note. */
  partner: string;
  title: string;
  /** Second title line in italic gold, e.g. "ab Deutschland". */
  accent?: string;
  /** Keyword for story replies; must match the partner offer's keywords in supabase/offers.sql. */
  keyword: string;
  /** Date the prices were read, as it should appear ("27.09.2026"). */
  asOf: string;
  /** Up to four destinations (a city or a whole country, as the partner lists them), cheapest first.
   *  `detail` is the small line below, e.g. the city's country or "Direktflug". */
  deals: { destination: string; detail?: string; price: number }[];
}

export const FLIGHTS_COPY: Record<
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
