import type { Metadata } from "next";
import { translations, type Language } from "@/i18n/translations";
import { fill } from "@/i18n/format";
import { siteFacts } from "@/lib/faq";
import { siteUrl } from "@/lib/site";
import { LANGUAGES, OG_LOCALE, languageAlternates, type LocalizedPage } from "@/lib/locales";

export const SITE_NAME = "Atilla Barbarossa";

/**
 * Search Console and Bing Webmaster Tools can verify the domain by a meta
 * tag. Set the token in the environment when a property is added; without
 * it, nothing is printed.
 */
function verification(): Metadata["verification"] {
  const google = process.env.GOOGLE_SITE_VERIFICATION;
  const bing = process.env.BING_SITE_VERIFICATION;
  if (!google && !bing) return undefined;
  return {
    ...(google && { google }),
    ...(bing && { other: { "msvalidate.01": bing } }),
  };
}

/**
 * What every page in a language inherits from its root layout. A page's own
 * title is completed by the template ("Impressum | Atilla Barbarossa").
 */
export function rootMetadata(lang: Language): Metadata {
  const t = translations[lang];
  return {
    metadataBase: new URL(siteUrl),
    title: { default: t.meta_home_title, template: `%s | ${SITE_NAME}` },
    description: fill(t.meta_home_description, siteFacts(lang)),
    applicationName: SITE_NAME,
    authors: [{ name: SITE_NAME, url: siteUrl }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    openGraph: {
      siteName: SITE_NAME,
      locale: OG_LOCALE[lang],
      type: "website",
    },
    twitter: { card: "summary_large_image" },
    // Large previews and full snippets: the page is made to be quoted.
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    verification: verification(),
  };
}

/**
 * Metadata for a page that exists in all three languages: canonical address,
 * hreflang siblings, and a link preview in the page's language. `openGraph`
 * and `twitter` are spelled out in full because Next replaces, not merges,
 * those objects from the layout.
 */
export function localizedMetadata({
  page,
  lang,
  title,
  description,
}: {
  page: LocalizedPage;
  lang: Language;
  /** The complete title, as it should appear in results and previews. */
  title: string;
  description: string;
}): Metadata {
  const alternates = languageAlternates(page, lang);
  return {
    title: { absolute: title },
    description,
    alternates,
    openGraph: {
      title,
      description,
      url: alternates.canonical,
      siteName: SITE_NAME,
      locale: OG_LOCALE[lang],
      alternateLocale: LANGUAGES.filter((l) => l !== lang).map((l) => OG_LOCALE[l]),
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export function homeMetadata(lang: Language): Metadata {
  const t = translations[lang];
  return localizedMetadata({
    page: "home",
    lang,
    title: t.meta_home_title,
    description: fill(t.meta_home_description, siteFacts(lang)),
  });
}
