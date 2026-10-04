import { translations, type Language } from "@/i18n/translations";
import { HTML_LANG } from "@/lib/locales";
import { audience } from "@/lib/site";

/**
 * The four audience figures the media kit opens with, formatted for the
 * language: the page and its share card both read them from here, so the
 * preview cannot quote a figure the page no longer shows.
 */
export function mediaKitFigures(lang: Language) {
  const t = translations[lang];
  const locale = HTML_LANG[lang];
  const number = new Intl.NumberFormat(locale);
  const compact = new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 });
  const percent = new Intl.NumberFormat(locale, { style: "percent" });
  return [
    { value: number.format(audience.followers.instagram), label: t.mk_fig_followers },
    { value: number.format(audience.average.reels), label: t.mk_fig_reels },
    { value: compact.format(audience.accountsReached), label: t.mk_fig_reach },
    { value: percent.format(audience.dach / 100), label: t.mk_fig_dach },
  ];
}
