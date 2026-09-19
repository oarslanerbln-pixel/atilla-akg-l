import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

/**
 * Nothing told crawlers anything before this — no robots.txt, no sitemap. For
 * a site whose whole job is to be found by prospective clients, that is a gap
 * worth closing. The legal routes carry `robots: { index: false }` in their own
 * metadata and are also kept out of the sitemap.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/impressum", "/datenschutz"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
