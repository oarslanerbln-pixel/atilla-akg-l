import type { Metadata } from "next";
import { translations, type Language } from "@/i18n/translations";
import { SITE_NAME, localizedMetadata } from "@/lib/metadata";

/**
 * The card page is handed out, not searched for: noindex, like the legal
 * pages, and left out of the sitemap. It is not blocked in robots.ts, or the
 * noindex would never be read.
 */
export function cardMetadata(lang: Language): Metadata {
  const t = translations[lang];
  return {
    ...localizedMetadata({
      page: "card",
      lang,
      title: `${t.card_meta_title} | ${SITE_NAME}`,
      description: t.card_meta_description,
    }),
    robots: { index: false, follow: true },
  };
}
