/**
 * Facts about the site that more than one place needs to agree on.
 *
 * The three social URLs were written out in Hero, Stats and Footer, and had
 * already drifted — some with `www.`, some without. Metadata, the sitemap,
 * robots and the structured data all derive from here too, so the canonical
 * host is stated once.
 */

/**
 * Absolute URLs resolve against this. It was pinned to the custom domain, so
 * previews from a *.vercel.app deployment pointed at a host that may not be
 * serving that build.
 */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_ENV === "production"
    ? "https://atillabarbarossa.com"
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://atillabarbarossa.com");

export const contact = {
  email: "a@barbarossafilms.de",
  management: "lisaweber@barbarossafilms.de",
  phone: "+4917672725165",
  phoneDisplay: "+49 1767 27 25 165",
} as const;

export const socialProfiles = {
  instagram: "https://www.instagram.com/atillabarbarossa",
  tiktok: "https://www.tiktok.com/@atillabarbarossa",
  youtube: "https://www.youtube.com/@atillabarbarossa",
} as const;
