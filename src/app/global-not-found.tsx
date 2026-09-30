import type { Metadata } from "next";
import RootDocument from "./RootDocument";
import LegalPage from "@/components/LegalPage";
import { translations } from "@/i18n/translations";
import { rootMetadata } from "@/lib/metadata";
import { HTML_LANG, LANGUAGES, LANGUAGE_NAMES, pagePath } from "@/lib/locales";

/**
 * The 404 for any address no route matches.
 *
 * With one root layout per language there is no single layout left to draw
 * an unmatched address in, and the default 404 came out unstyled and without
 * a language. This one uses the shared document, in German like every
 * unprefixed address, and says it in all three languages — a mistyped link
 * gives no hint which one the visitor reads — each with the way back to the
 * portfolio in that language.
 */
export const metadata: Metadata = {
  ...rootMetadata("DE"),
  title: translations.DE.not_found_title,
  robots: { index: false, follow: true },
};

export default function GlobalNotFound() {
  return (
    <RootDocument lang="DE">
      <LegalPage title={translations.DE.not_found_title}>
        {LANGUAGES.map((lang) => (
          <p key={lang} lang={HTML_LANG[lang]}>
            {translations[lang].not_found_text}{" "}
            <a href={pagePath("home", lang)} hrefLang={HTML_LANG[lang]}>
              {LANGUAGE_NAMES[lang]} →
            </a>
          </p>
        ))}
      </LegalPage>
    </RootDocument>
  );
}
