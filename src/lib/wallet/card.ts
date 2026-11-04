import type { Language } from "@/i18n/translations";
import { pagePath } from "@/lib/locales";
import { contact, siteUrl, socialProfiles } from "@/lib/site";

/**
 * The digital business card: what the Apple Wallet pass, the Google Wallet
 * pass and the vCard say. The page that offers them (/card) reads its own
 * text from translations.ts; these strings are written into files and passes
 * on the server, so they live here, like the concierge's copy.ts.
 *
 * Every fact comes from site.ts: change the phone number there and the
 * card follows on the next download.
 */

export const CARD_NAME = "Atilla Barbarossa";
export const CARD_ORGANIZATION = "Barbarossa Films";

/** The colours of the pass: the site's ink ground, porcelain type, gold labels. */
export const CARD_COLORS = {
  background: "#140f0a",
  foreground: "#fcfbf9",
  label: "#d8b482",
} as const;

type CardCopy = {
  role: string;
  description: string;
  labels: {
    email: string;
    phone: string;
    website: string;
    management: string;
    instagram: string;
    tiktok: string;
    youtube: string;
  };
};

const COPY: Record<Language, CardCopy> = {
  DE: {
    role: "Filmemacher & Creative Director",
    description: "Visitenkarte von Atilla Barbarossa",
    labels: {
      email: "E-Mail",
      phone: "Telefon",
      website: "Website",
      management: "Management",
      instagram: "Instagram",
      tiktok: "TikTok",
      youtube: "YouTube",
    },
  },
  EN: {
    role: "Filmmaker & Creative Director",
    description: "Business card of Atilla Barbarossa",
    labels: {
      email: "Email",
      phone: "Phone",
      website: "Website",
      management: "Management",
      instagram: "Instagram",
      tiktok: "TikTok",
      youtube: "YouTube",
    },
  },
  TR: {
    role: "Film Yapımcısı & Kreatif Direktör",
    description: "Atilla Barbarossa kartviziti",
    labels: {
      email: "E-posta",
      phone: "Telefon",
      website: "Web sitesi",
      management: "Menajerlik",
      instagram: "Instagram",
      tiktok: "TikTok",
      youtube: "YouTube",
    },
  },
};

export function cardCopy(lang: Language): CardCopy {
  return COPY[lang];
}

/** The card page in this language, absolute: what the pass's QR code opens. */
export function cardUrl(lang: Language): string {
  return new URL(pagePath("card", lang), siteUrl).href;
}

/** The site's bare host, as a card prints it ("atillabarbarossa.com"). */
export function websiteHost(): string {
  return new URL(siteUrl).host.replace(/^www\./, "");
}

export const cardContact = {
  email: contact.email,
  management: contact.management,
  phone: contact.phone,
  phoneDisplay: contact.phoneDisplay,
  website: siteUrl,
  instagram: socialProfiles.instagram,
  tiktok: socialProfiles.tiktok,
  youtube: socialProfiles.youtube,
} as const;

/** "?lang=en" and friends on the wallet endpoints, back to a Language. */
export function languageParam(value: string | null): Language {
  const upper = value?.toUpperCase();
  return upper === "EN" || upper === "TR" ? upper : "DE";
}
