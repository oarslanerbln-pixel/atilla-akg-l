import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

/**
 * The home page and the e-book (/roadmap), three languages — but the language lives in React state rather
 * than the URL, so there is a single canonical entry and no hreflang set to
 * declare. If the languages ever move into the path, this is where the
 * alternates belong.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${siteUrl}/roadmap`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
