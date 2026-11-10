import type { Coords } from "../../../../src/lib/partners";

// Figures for the location tag. The bearing and the coordinate format are the site's
// (bearing(), formatCoords() in src/lib/partners.ts), so a tag and a partner card never disagree.

/** Great-circle distance in kilometres. */
export function distanceKm(from: Coords, to: Coords): number {
  const rad = Math.PI / 180;
  const dLat = (to.lat - from.lat) * rad;
  const dLon = (to.lon - from.lon) * rad;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(from.lat * rad) * Math.cos(to.lat * rad) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(a));
}

const LOCALE = { de: "de-DE", en: "en-GB", tr: "tr-TR" } as const;
export type Lang = keyof typeof LOCALE;

/** Whole numbers with the language's own digit grouping (1.742 · 1,742). */
export const formatInt = (n: number, lang: Lang) => new Intl.NumberFormat(LOCALE[lang], { maximumFractionDigits: 0 }).format(Math.round(n));

/** Upper case by the language's rules: Turkish i becomes İ, German ß stays. */
export const upper = (s: string, lang: Lang) => s.toLocaleUpperCase(LOCALE[lang]);
