import "server-only";
import { translations, type Language } from "@/i18n/translations";
import { LANGUAGES, pagePath } from "@/lib/locales";
import { businessCard, contact, siteUrl, socialProfiles } from "@/lib/site";

/**
 * What the Wallet passes say, from the same facts as the card on /card
 * (lib/site.ts, translations.ts), so a pass can never disagree with the page.
 */

const absolute = (path: string) => new URL(path, siteUrl).href;
const host = new URL(siteUrl).host;

export const WALLET_NAME = "Atilla Barbarossa";

/** The QR code on a pass opens the contact page (/c), as the card's own code does, in the pass's language. */
export const walletQrUrl = (lang: Language) => absolute(pagePath("contact", lang));

export function walletFacts(lang: Language) {
  const t = translations[lang];
  return {
    description: `${t.card_meta_title} · ${WALLET_NAME}`,
    role: t.mk_about_role,
    cities: t.card_cities,
    labels: {
      whatsapp: t.card_qr_whatsapp,
      instagram: t.card_qr_instagram,
      website: t.card_qr_web,
      email: t.card_email,
      card: t.card_qr_card,
    },
    whatsapp: { display: businessCard.whatsappDisplay, href: `https://wa.me/${businessCard.whatsapp}`, tel: `tel:+${businessCard.whatsapp}` },
    instagram: { display: businessCard.instagramHandle, href: socialProfiles.instagram },
    tiktok: socialProfiles.tiktok,
    youtube: socialProfiles.youtube,
    email: contact.email,
    website: { display: host, href: walletQrUrl(lang) },
    cardUrl: absolute(pagePath("card", lang)),
  };
}

/** Accepts a PEM pasted with real or escaped line breaks, or the PEM base64-encoded (one line, for env vars). */
export function readPem(value: string): string {
  return value.includes("-----BEGIN") ? value.replace(/\\n/g, "\n") : Buffer.from(value, "base64").toString("utf8");
}

export const isLanguage = (value: string | null): value is Language =>
  value !== null && (LANGUAGES as string[]).includes(value.toUpperCase());

/** `?lang=de|en|tr`, German when absent or unknown. */
export function walletLanguage(request: Request): Language {
  const lang = new URL(request.url).searchParams.get("lang");
  return isLanguage(lang) ? (lang.toUpperCase() as Language) : "DE";
}
