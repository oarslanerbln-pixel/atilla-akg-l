import type { Language } from "@/i18n/translations";
import { HTML_LANG } from "@/lib/locales";

/**
 * The Travel Creator Roadmap, Atilla's e-book. Tentary sells and delivers it;
 * this site only links to its checkouts. If the price changes in Tentary,
 * change it here too — the page must never show a price the checkout doesn't
 * charge.
 */
export const roadmap = {
  /** Paid e-book (PDF, German). */
  checkout: "https://atillabarbarossa.tentary.com/p/oZ1Iat/checkout",
  /** Free excerpt: pitch guide and chapter 1, 0 €. */
  sample: "https://atillabarbarossa.tentary.com/p/V7pCH7/checkout",
  /** Final price in euro, taxes included, as the checkout shows it. */
  price: 49,
  /**
   * The product's identifier in structured data, which Merchant Center reads
   * as the item id of a free listing. Keep it once it is live: a new id is a
   * new product, and the listing's history starts over.
   */
  sku: "TCR-DE",
} as const;

/**
 * /roadmap in the visitor's language. The page lives under the German root
 * layout, so coming from /en or /tr is a full load that would start in
 * German; `?lang=` carries the language across (see RoadmapPage). The
 * canonical stays /roadmap, so the variants never compete in search.
 */
export const roadmapPath = (lang: Language) =>
  lang === "DE" ? "/roadmap" : `/roadmap?lang=${HTML_LANG[lang]}`;
