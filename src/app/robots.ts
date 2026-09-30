import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

/**
 * Every crawler is welcome — search engines and AI answer engines alike
 * (GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, Google-Extended…): the
 * site exists to be found and quoted.
 *
 * The legal pages are not blocked here on purpose. They carry
 * `robots: { index: false }` in their own metadata, and a crawler can only
 * obey that tag on a page it is allowed to fetch; blocking them would leave
 * their bare addresses free to show up in results. The /go/ links are
 * partner redirects that count each click, so a crawler following them would
 * count as a visitor.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/go/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
