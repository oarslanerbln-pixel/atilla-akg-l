import type { Language } from "@/i18n/translations";

/**
 * Where each language of a page lives, and how the languages point at each
 * other.
 *
 * The site used to keep the language in React state only, so a crawler saw
 * German and nothing else: the English and Turkish text existed but no search
 * engine or answer engine could reach it. Each language now has an address of
 * its own, rendered on the server in that language under a matching
 * `<html lang>` (see the (de), (en) and (tr) route groups), and every page
 * names its siblings with hreflang. German stays at the unprefixed address,
 * which is also the x-default.
 *
 * The switchers on the pages still change the language in place, without a
 * reload; these addresses are what search engines, previews and shared links
 * use.
 */

export const LANGUAGES: Language[] = ["DE", "EN", "TR"];

/** BCP 47 tags, for `<html lang>`, hreflang and Intl. */
export const HTML_LANG: Record<Language, "de" | "en" | "tr"> = { DE: "de", EN: "en", TR: "tr" };

export const OG_LOCALE: Record<Language, string> = { DE: "de_DE", EN: "en_GB", TR: "tr_TR" };

/** Each language in its own name, the way a language menu offers it. */
export const LANGUAGE_NAMES: Record<Language, string> = { DE: "Deutsch", EN: "English", TR: "Türkçe" };

/**
 * The pages that exist in all three languages. /social-media keeps the
 * suffix form (/social-media/en) it was first sent with, and /media-kit
 * follows it; the home page takes a prefix (/en), as there is nothing to
 * suffix.
 */
const PAGES = {
  home: { DE: "/", EN: "/en", TR: "/tr" },
  socialMedia: { DE: "/social-media", EN: "/social-media/en", TR: "/social-media/tr" },
  mediaKit: { DE: "/media-kit", EN: "/media-kit/en", TR: "/media-kit/tr" },
} as const satisfies Record<string, Record<Language, string>>;

export type LocalizedPage = keyof typeof PAGES;

export function pagePath(page: LocalizedPage, lang: Language): string {
  return PAGES[page][lang];
}

/**
 * `alternates` for a page's metadata: its own canonical address and one
 * hreflang entry per language, German doubling as x-default. Relative paths;
 * `metadataBase` makes them absolute.
 */
export function languageAlternates(page: LocalizedPage, lang: Language) {
  return {
    canonical: pagePath(page, lang),
    languages: {
      ...Object.fromEntries(LANGUAGES.map((l) => [HTML_LANG[l], pagePath(page, l)])),
      "x-default": pagePath(page, "DE"),
    },
  };
}
