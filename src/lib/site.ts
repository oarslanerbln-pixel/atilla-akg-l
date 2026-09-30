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
  phone: "+4917631717458",
  phoneDisplay: "+49 176 31717458",
  /** Digits only, as wa.me expects. */
  whatsapp: "4917631717458",
} as const;

export const socialProfiles = {
  instagram: "https://www.instagram.com/atillabarbarossa",
  tiktok: "https://www.tiktok.com/@atillabarbarossa",
  youtube: "https://www.youtube.com/@atillabarbarossa",
} as const;

/**
 * The audience figures the Stats section shows. The FAQ, the structured data
 * and /llms.txt state them as well, so they are kept here once: a figure that
 * changes on Instagram changes in one line, everywhere at the same time.
 */
export const audience = {
  followers: { instagram: 306_000, tiktok: 287_000, youtube: 20_000 },
  /** Share of the audience, in percent. */
  dach: 86,
  age25to54: 83,
  female: 55,
  accountsReached: 1_400_000,
  /** Average accounts reached per format. */
  average: { reels: 60_000, story: 15_000, post: 20_000 },
} as const;

export const totalFollowers = Object.values(audience.followers).reduce((sum, n) => sum + n, 0);
