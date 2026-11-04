"use client";

import Link from "next/link";
import BrandMark from "@/components/BrandMark";
import BrandWordmark from "@/components/BrandWordmark";
import { useLanguage } from "@/context/LanguageContext";
import type { Language } from "@/i18n/translations";
import { LANGUAGES, pagePath } from "@/lib/locales";
import BusinessCard, { type WalletOptions } from "./BusinessCard";
import type { CardCodes } from "./qr";
import styles from "./CardPage.module.css";

/**
 * /card — the digital business card on a page of its own, in DE, EN and TR:
 * the page Atilla opens on his phone to show, and the one the card's own QR
 * code leads to. One card on a porcelain wall, a top bar with the language
 * switch, the legal links below. Added to a phone's home screen it opens
 * full screen, like an app (`appleWebApp` in share.tsx). The card itself is
 * BusinessCard, shared with the portfolio's card section.
 */
export default function CardPage({ codes, wallet }: { codes: CardCodes; wallet: WalletOptions }) {
  const { t, activeLang, setActiveLang } = useLanguage();

  // In place, like the other switchers; the address follows.
  const chooseLang = (choice: Language) => {
    setActiveLang(choice);
    window.history.replaceState(null, "", pagePath("card", choice));
  };

  return (
    <>
      <header className={styles.topbar}>
        <div className={`container ${styles.topbarInner}`}>
          <Link href={pagePath("home", activeLang)} className={styles.brand}>
            <BrandMark className={styles.brandMark} />
            <BrandWordmark className={styles.brandWordmark} />
          </Link>
          <div className={styles.langs} role="group" aria-label={t("pkg_lang_label")}>
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                type="button"
                className={styles.lang}
                aria-pressed={activeLang === lang}
                onClick={() => chooseLang(lang)}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className={styles.page}>
        <BusinessCard codes={codes} wallet={wallet} standalone />
      </main>

      <footer className={styles.footer}>
        <nav className={styles.footerLinks} aria-label={t("legal_nav")}>
          <Link href="/impressum">{t("footer_imprint")}</Link>
          <Link href={pagePath("privacy", activeLang)}>{t("footer_privacy")}</Link>
        </nav>
      </footer>
    </>
  );
}
