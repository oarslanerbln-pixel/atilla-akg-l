"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import BrandMark from "@/components/BrandMark";
import BrandWordmark from "@/components/BrandWordmark";
import { useLanguage } from "@/context/LanguageContext";
import type { Language } from "@/i18n/translations";
import { LANGUAGES, pagePath } from "@/lib/locales";
import BusinessCard, { type WalletOptions } from "./BusinessCard";
import NfcWriter from "./NfcWriter";
import type { CardCodes, CardMode } from "./qr";
import styles from "./CardPage.module.css";

/**
 * /card — the digital business card on a page of its own, in DE, EN and TR:
 * the page Atilla opens on his phone to show, and the one the card's own QR
 * code leads to. One card on a porcelain wall, a top bar with the language
 * switch, the legal links below. Added to a phone's home screen it opens
 * full screen, like an app (`appleWebApp` in share.tsx). The card itself is
 * BusinessCard, shared with the portfolio's card section.
 *
 * /card/business opens the same card on its business face, the address to
 * send hotels, brands and tourism boards. Switching faces or languages
 * moves the address with it. /card#nfc adds the owner's NFC tool below.
 */
const subscribeHash = (onChange: () => void) => {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
};
const readNfcHash = () => window.location.hash === "#nfc";

export default function CardPage({
  codes,
  wallet,
  initialMode = "personal",
}: {
  codes: CardCodes;
  wallet: WalletOptions;
  initialMode?: CardMode;
}) {
  const { t, activeLang, setActiveLang } = useLanguage();
  const [mode, setMode] = useState<CardMode>(initialMode);
  const showNfc = useSyncExternalStore(subscribeHash, readNfcHash, () => false);

  const address = (lang: Language, face: CardMode) =>
    pagePath(face === "business" ? "cardBusiness" : "card", lang) + window.location.hash;

  // In place, like the other switchers; the address follows.
  const chooseLang = (choice: Language) => {
    setActiveLang(choice);
    window.history.replaceState(null, "", address(choice, mode));
  };

  const chooseMode = (face: CardMode) => {
    setMode(face);
    window.history.replaceState(null, "", address(activeLang, face));
  };

  const nfcChoices = [
    { label: t("card_qr_contactpage"), url: codes[activeLang].contactPage.url },
    { label: t("card_mode_personal"), url: codes[activeLang].card.url },
    { label: t("card_mode_business"), url: codes[activeLang].businessCard.url },
    { label: t("card_qr_web"), url: codes[activeLang].web.url },
  ];

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
        <BusinessCard
          codes={codes}
          wallet={wallet}
          standalone
          initialMode={initialMode}
          onModeChange={chooseMode}
        />
        {showNfc && <NfcWriter choices={nfcChoices} />}
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
