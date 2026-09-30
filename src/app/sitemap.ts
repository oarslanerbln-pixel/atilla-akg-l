import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
import { HTML_LANG, LANGUAGES, pagePath, type LocalizedPage } from "@/lib/locales";

const absolute = (path: string) => new URL(path, siteUrl).href;

/**
 * Every address meant to be found. The home page and /social-media exist in
 * three languages; each language is listed with its siblings as hreflang
 * alternates, the same set the pages declare in their <head>. The e-book is
 * German. The legal pages are left out: they are noindex.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const localized = (page: LocalizedPage, priority: number): MetadataRoute.Sitemap =>
    LANGUAGES.map((lang) => ({
      url: absolute(pagePath(page, lang)),
      lastModified,
      changeFrequency: "monthly",
      priority,
      alternates: {
        languages: {
          ...Object.fromEntries(LANGUAGES.map((l) => [HTML_LANG[l], absolute(pagePath(page, l))])),
          "x-default": absolute(pagePath(page, "DE")),
        },
      },
    }));

  return [
    ...localized("home", 1),
    ...localized("socialMedia", 0.8),
    {
      url: absolute("/roadmap"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];
}
