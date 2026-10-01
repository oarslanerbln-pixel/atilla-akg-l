import type { TranslationKeys } from "@/i18n/translations";

/**
 * Tourism boards and institutions Atilla has worked with.
 *
 * One list feeds three places: the Partners section, the structured data in
 * the root layout, and /llms.txt. Keep it here so the three can never
 * disagree about who is on it.
 *
 * `name` is spelled the way each organisation styles itself ("Go Türkiye",
 * with the ü). Search engines and AI answer engines resolve entities by name,
 * so a near-miss spelling is a different organisation to them.
 *
 * `logo` is optional on purpose. Until an official file is supplied the tile
 * shows the name as type, and the name stays on the page as visible text even
 * once a logo is in — a crawler reads text, not the pixels of a wordmark.
 * Logos go in public/partners/, as supplied by the organisation's brand kit,
 * unaltered. Give their intrinsic width and height so the tile reserves the
 * space before the file arrives. UNESCO's emblem needs UNESCO's written
 * authorisation to use; leave it out unless the agreement grants it.
 *
 * `url` is the published collaboration itself — the reel or the film. When
 * present the tile links to it, which is the proof a prospective client
 * actually wants.
 *
 * `coords` are factual (capital or headquarters). The card prints them and
 * turns its compass needle to the bearing from BASE, so each card carries a
 * small, true detail about the place rather than decoration.
 */
export interface Coords {
  lat: number;
  lon: number;
}

export interface Partner {
  name: string;
  /** The language the name is written in, when not English; uppercase follows it ("GO TÜRKİYE", not "VİSİT MALTA"). */
  nameLang?: string;
  region: TranslationKeys;
  /** The capital of the destination, or the institution's headquarters. */
  coords: Coords;
  logo?: { src: string; width: number; height: number };
  url?: string;
}

export const partners: Partner[] = [
  { name: "Visit Malta", region: "partners_region_mt", coords: { lat: 35.8989, lon: 14.5146 } },
  { name: "Visit Kazakhstan", region: "partners_region_kz", coords: { lat: 51.1694, lon: 71.4491 } },
  { name: "Go Türkiye", nameLang: "tr", region: "partners_region_tr", coords: { lat: 39.9334, lon: 32.8597 } },
  { name: "Visit Romania", region: "partners_region_ro", coords: { lat: 44.4268, lon: 26.1025 } },
  // UNESCO's headquarters, Place de Fontenoy, Paris.
  { name: "UNESCO", region: "partners_region_intl", coords: { lat: 48.8497, lon: 2.3063 } },
];

/** Berlin — where the work sets out from. Each card's compass points from here. */
export const BASE: Coords = { lat: 52.52, lon: 13.405 };

/** BASE's label on the globe: German on every page, as each partner keeps its own name. */
export const BASE_LABEL = { name: "Berlin · Basis", nameLang: "de" };

const rad = (deg: number) => (deg * Math.PI) / 180;

/**
 * Initial great-circle bearing from `from` to `to`, in degrees clockwise from
 * north (0–360). Computed rather than typed in, so a partner added later
 * points the right way without anyone working out an angle.
 */
export function bearing(from: Coords, to: Coords): number {
  const phi1 = rad(from.lat);
  const phi2 = rad(to.lat);
  const dLon = rad(to.lon - from.lon);
  const y = Math.sin(dLon) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLon);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

/** "35.90° N · 14.51° E" */
export function formatCoords({ lat, lon }: Coords): string {
  const ns = lat >= 0 ? "N" : "S";
  const ew = lon >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(2)}° ${ns} · ${Math.abs(lon).toFixed(2)}° ${ew}`;
}
