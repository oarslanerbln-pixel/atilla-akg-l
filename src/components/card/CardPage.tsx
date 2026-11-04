"use client";

import Image from "next/image";
import Link from "next/link";
import { UserPlus, Wallet } from "lucide-react";
import BrandMark from "@/components/BrandMark";
import { useLanguage } from "@/context/LanguageContext";
import type { TranslationKeys } from "@/i18n/translations";
import { HTML_LANG, LANGUAGES, LANGUAGE_NAMES, pagePath } from "@/lib/locales";
import { contact, siteUrl, socialProfiles } from "@/lib/site";
import styles from "./CardPage.module.css";

/**
 * The digital business card (/card, /card/en, /card/tr): the page its QR code
 * opens, and the one that hands the card out. Apple and Google Wallet appear
 * only when their certificates are configured (lib/wallet/config.ts), so a
 * button never leads to a card that cannot be made; the contact file works
 * everywhere and is always offered.
 */
export default function CardPage({ apple, google }: { apple: boolean; google: boolean }) {
  const { t, activeLang } = useLanguage();
  const lang = HTML_LANG[activeLang];
  const host = new URL(siteUrl).host.replace(/^www\./, "");
  const handle = (href: string) => `@${new URL(href).pathname.replace(/^\/@?/, "").replace(/\/$/, "")}`;

  const rows: Array<{ label: TranslationKeys | string; text: string; href: string; external?: boolean }> = [
    { label: "card_email", text: contact.email, href: `mailto:${contact.email}` },
    { label: "card_phone", text: contact.phoneDisplay, href: `tel:${contact.phone}` },
    { label: "card_whatsapp", text: contact.phoneDisplay, href: `https://wa.me/${contact.whatsapp}`, external: true },
    { label: "card_management", text: contact.management, href: `mailto:${contact.management}` },
    { label: "card_website", text: host, href: pagePath("home", activeLang) },
    { label: "Instagram", text: handle(socialProfiles.instagram), href: socialProfiles.instagram, external: true },
    { label: "TikTok", text: handle(socialProfiles.tiktok), href: socialProfiles.tiktok, external: true },
    { label: "YouTube", text: handle(socialProfiles.youtube), href: socialProfiles.youtube, external: true },
  ];
  const translated = (key: string) => key.startsWith("card_");
  // Long addresses break after the @, not in the middle of the domain.
  const breakable = (text: string) => {
    const at = text.indexOf("@");
    if (at <= 0) return text;
    return (
      <>
        {text.slice(0, at + 1)}
        <wbr />
        {text.slice(at + 1)}
      </>
    );
  };

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <Link href={pagePath("home", activeLang)} className={styles.back}>
            ← {t("legal_back")}
          </Link>
          <nav className={styles.languages} aria-label={t("legal_languages")}>
            {LANGUAGES.map((l) => (
              <Link
                key={l}
                href={pagePath("card", l)}
                hrefLang={HTML_LANG[l]}
                lang={HTML_LANG[l]}
                aria-current={l === activeLang ? "page" : undefined}
              >
                {LANGUAGE_NAMES[l]}
              </Link>
            ))}
          </nav>
        </div>

        <section className={styles.card} aria-labelledby="card-name">
          <div className={styles.cardHead}>
            <BrandMark className={styles.mark} />
            {/* A name, not German or Turkish text: kept out of Turkish uppercasing (İ). */}
            <span className={styles.org} lang="en">
              Barbarossa Films
            </span>
          </div>
          <div className={styles.identity}>
            <div className={styles.identityText}>
              <p className={styles.eyebrow}>{t("card_eyebrow")}</p>
              <h1 id="card-name" className={styles.name}>
                Atilla Barbarossa
              </h1>
              <p className={styles.role}>{t("mk_about_role")}</p>
            </div>
            <Image
              src="/roadmap/atilla.webp"
              alt={t("mk_about_alt")}
              width={720}
              height={720}
              sizes="112px"
              className={styles.portrait}
              priority
            />
          </div>
        </section>

        <section className={styles.block} aria-labelledby="card-save">
          <h2 id="card-save" className={styles.heading}>
            {t("card_save_heading")}
          </h2>
          <div className={styles.actions}>
            {apple && (
              <a href={`/api/wallet/apple?lang=${lang}`} className={styles.walletButton}>
                <Wallet aria-hidden="true" size={18} strokeWidth={1.5} />
                {t("card_apple")}
              </a>
            )}
            {google && (
              <a href={`/api/wallet/google?lang=${lang}`} className={styles.walletButton}>
                <Wallet aria-hidden="true" size={18} strokeWidth={1.5} />
                {t("card_google")}
              </a>
            )}
            {(apple || google) && <p className={styles.note}>{t("card_wallet_note")}</p>}
            <a href={`/api/wallet/vcard?lang=${lang}`} className={styles.contactButton} download>
              <UserPlus aria-hidden="true" size={18} strokeWidth={1.5} />
              {t("card_vcard")}
            </a>
            <p className={styles.note}>{t("card_vcard_note")}</p>
          </div>
        </section>

        <section className={styles.block} aria-labelledby="card-contact">
          <h2 id="card-contact" className={styles.heading}>
            {t("card_contact_heading")}
          </h2>
          <ul className={styles.list}>
            {rows.map((row) => (
              <li key={row.label} className={styles.row}>
                {/* Platform names stay as they are written, also under Turkish uppercasing. */}
                <span className={styles.rowLabel} lang={translated(row.label) ? undefined : "en"}>
                  {translated(row.label) ? t(row.label as TranslationKeys) : row.label}
                </span>
                {row.external ? (
                  <a href={row.href} className={styles.rowLink} target="_blank" rel="noopener noreferrer">
                    {row.text}
                  </a>
                ) : (
                  <a href={row.href} className={styles.rowLink}>
                    {breakable(row.text)}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </section>

        <p className={styles.legalLinks}>
          <Link href="/impressum">{t("footer_imprint")}</Link>
          <Link href={pagePath("privacy", activeLang)}>{t("footer_privacy")}</Link>
        </p>
      </div>
    </main>
  );
}
