"use client";

import React, { ReactNode } from "react";
import Link from "next/link";
import styles from "./LegalPage.module.css";
import { useLanguage } from "@/context/LanguageContext";
import type { Language } from "@/i18n/translations";
import { HTML_LANG, LANGUAGES, LANGUAGE_NAMES, pagePath, type LocalizedPage } from "@/lib/locales";

/**
 * Shell for /impressum and the privacy policy.
 *
 * The imprint stays German: it identifies a Germany-based provider under
 * German law. The privacy policy also exists in English and Turkish, because
 * the site addresses visitors in those languages and Art. 12 GDPR asks for a
 * notice they can understand; the German text remains the binding one. Pass
 * `page` with the text's own `lang` to list the language versions.
 */
export default function LegalPage({
  title,
  page,
  lang,
  children,
}: {
  title: string;
  page?: LocalizedPage;
  lang?: Language;
  children: ReactNode;
}) {
  const { t, activeLang } = useLanguage();

  return (
    <main className={styles.wrapper}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <Link href={pagePath("home", activeLang)} className={styles.back}>
            ← {t("legal_back")}
          </Link>
          {page && lang && (
            <nav className={styles.languages} aria-label={t("legal_languages")}>
              {LANGUAGES.map((l) => (
                <Link
                  key={l}
                  href={pagePath(page, l)}
                  hrefLang={HTML_LANG[l]}
                  lang={HTML_LANG[l]}
                  aria-current={l === lang ? "page" : undefined}
                >
                  {LANGUAGE_NAMES[l]}
                </Link>
              ))}
            </nav>
          )}
        </div>
        <h1 className={styles.title}>{title}</h1>
        <div className={styles.content}>{children}</div>
        <p className={styles.legalLinks}>
          <Link href="/impressum">{t("footer_imprint")}</Link>
          <Link href={pagePath("privacy", activeLang)}>{t("footer_privacy")}</Link>
        </p>
      </div>
    </main>
  );
}

/** Operator detail the site owner still has to supply. */
export function Todo({ children }: { children: ReactNode }) {
  return <span className={styles.todo}>[ ERGÄNZEN: {children} ]</span>;
}
