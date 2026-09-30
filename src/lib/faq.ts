import { translations, type Language, type TranslationKeys } from "@/i18n/translations";
import { fill } from "@/i18n/format";
import { audience, contact, totalFollowers } from "@/lib/site";
import { partners } from "@/lib/partners";
import { brands } from "@/lib/brands";
import { packages } from "@/lib/packages";
import { HTML_LANG } from "@/lib/locales";

/**
 * The facts the site states, formatted for one language, as values for the
 * `{tokens}` in the FAQ and in page descriptions: "306.000" in German,
 * "306,000" in English, lists joined with "und" / "and" / "ve". Nothing here
 * is typed out a second time; every value is read from the list or figure
 * the page itself renders.
 */
export function siteFacts(lang: Language): Record<string, string> {
  const locale = HTML_LANG[lang];
  const number = new Intl.NumberFormat(locale);
  const list = (items: string[], type: "conjunction" | "disjunction") =>
    new Intl.ListFormat(locale, { type }).format(items);

  return {
    total: number.format(totalFollowers),
    instagram: number.format(audience.followers.instagram),
    tiktok: number.format(audience.followers.tiktok),
    youtube: number.format(audience.followers.youtube),
    dach: String(audience.dach),
    age: String(audience.age25to54),
    female: String(audience.female),
    reels: number.format(audience.average.reels),
    reach: new Intl.NumberFormat(locale, {
      notation: "compact",
      compactDisplay: "long",
      maximumFractionDigits: 1,
    }).format(audience.accountsReached),
    partners: list(partners.map((partner) => partner.name), "conjunction"),
    brands: list(brands.map((brand) => brand.name), "conjunction"),
    counts: list(packages.map((pkg) => String(pkg.videos)), "disjunction"),
    phone: contact.phoneDisplay,
    email: contact.email,
  };
}

export interface FaqEntry {
  question: string;
  /** May carry a `{link}` token, to the social media packages page. */
  answer: string;
  /** The words the `{link}` token stands for. */
  linkText: string;
}

const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

/**
 * The questions a hotel, a tourism board or an answer engine asks first,
 * answered in full sentences that name Atilla, so any one answer can be
 * quoted on its own. The section on the page (components/Faq.tsx) and the
 * FAQPage structured data both read this, so the two cannot disagree.
 */
export function faq(lang: Language): FaqEntry[] {
  const t = translations[lang];
  const facts = siteFacts(lang);
  return NUMBERS.map((n) => ({
    question: t[`faq_${n}_q` as TranslationKeys],
    answer: fill(t[`faq_${n}_a` as TranslationKeys], facts),
    linkText: t.faq_4_link,
  }));
}

/** The answer as plain text, for structured data and /llms.txt. */
export const plainAnswer = (entry: FaqEntry) => entry.answer.replace("{link}", entry.linkText);
