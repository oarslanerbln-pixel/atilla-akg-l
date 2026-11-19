import type { Metadata } from "next";
import { translations, type Language } from "@/i18n/translations";
import { localizedMetadata } from "@/lib/metadata";
import { games } from "@/lib/games";

/**
 * /games, /games/en, /games/tr: title, description, hreflang siblings and a
 * link preview showing the first game's cover. `openGraph` and `twitter` are
 * extended, not merged, as localizedMetadata spells them out in full.
 */
export function gamesMetadata(lang: Language): Metadata {
  const t = translations[lang];
  const base = localizedMetadata({
    page: "games",
    lang,
    title: t.games_meta_title,
    description: t.games_meta_description,
  });
  const image = games[0].ogImage;
  const images = [{ url: image.src, width: image.width, height: image.height, alt: t.games_image_alt }];
  return {
    ...base,
    openGraph: { ...base.openGraph, images },
    twitter: { ...base.twitter, images },
  };
}
