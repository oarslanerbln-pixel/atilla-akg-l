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
 */
export interface Partner {
  name: string;
  region: TranslationKeys;
  logo?: { src: string; width: number; height: number };
  url?: string;
}

export const partners: Partner[] = [
  { name: "Visit Malta", region: "partners_region_mt" },
  { name: "Visit Kazakhstan", region: "partners_region_kz" },
  { name: "Go Türkiye", region: "partners_region_tr" },
  { name: "Visit Romania", region: "partners_region_ro" },
  { name: "UNESCO", region: "partners_region_intl" },
];
