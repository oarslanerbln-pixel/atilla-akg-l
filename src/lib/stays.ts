import type { TranslationKeys } from "@/i18n/translations";
import type { Coords } from "./partners";

/**
 * Hotels on the hero globe: a second, quieter layer under the partners.
 *
 * A partner keeps a gold route from Berlin; a hotel is a small ink diamond.
 * The light visits it in turn, drawing a route that gathers back into the
 * diamond after landing, so the globe only ever holds the partners' routes.
 *
 * `name` is spelled the way each hotel styles itself. `coords` place the mark
 * on the globe (resort or city level) and are never printed: the label shows
 * `place` instead, which says more about a hotel than its degrees.
 */
export interface Stay {
  name: string;
  /** The language the name is written in, when not English. */
  nameLang?: string;
  /** City or atoll and country, translated. */
  place: TranslationKeys;
  coords: Coords;
}

export const stays: Stay[] = [
  { name: "Rixos The Palm Dubai", place: "stays_place_dubai", coords: { lat: 25.1215, lon: 55.1545 } },
  { name: "Seda Club Hotel", place: "stays_place_granada", coords: { lat: 37.1772, lon: -3.6015 } },
  { name: "The Chedi Muscat", place: "stays_place_muscat", coords: { lat: 23.6045, lon: 58.4318 } },
  { name: "Maškovića Han", nameLang: "hr", place: "stays_place_vrana", coords: { lat: 43.9535, lon: 15.5115 } },
  { name: "Cora Cora Maldives", place: "stays_place_raa", coords: { lat: 5.8, lon: 72.97 } },
  { name: "The Mirage Park Resort", place: "stays_place_kemer", coords: { lat: 36.6735, lon: 30.5605 } },
  { name: "Rixos Marina Abu Dhabi", place: "stays_place_abudhabi", coords: { lat: 24.476, lon: 54.3215 } },
];
