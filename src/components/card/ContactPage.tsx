"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, BookOpen, Compass, Globe, Mail, Phone, UserPlus, Wallet } from "lucide-react";
import BrandMark from "@/components/BrandMark";
import BrandWordmark from "@/components/BrandWordmark";
import { InstagramIcon, WhatsAppIcon } from "@/components/SocialIcons";
import { useLanguage } from "@/context/LanguageContext";
import { usePrefersCalm } from "@/hooks/usePrefersCalm";
import { fill } from "@/i18n/format";
import type { Language } from "@/i18n/translations";
import { HTML_LANG, LANGUAGES, pagePath } from "@/lib/locales";
import { audience, businessCard, contact, siteUrl, socialProfiles } from "@/lib/site";
import { inBrowser, useInApp, usePlatform, walletPath, type WalletOptions } from "./device";
import pageStyles from "./CardPage.module.css";
import styles from "./ContactPage.module.css";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * /c — what a scan of the card opens on the other person's phone: not the
 * card again, but the contact itself, made to be kept. The portrait, name
 * and role arrive in a short cascade; then one large "Save contact" (the
 * vCard with its photo), Instagram straight below it (on a phone the link
 * opens the Instagram app), and WhatsApp, a call, e-mail, the website and
 * the media kit as a quiet list. The card itself is a link at the foot.
 *
 * In Instagram's browser, Save contact and Wallet go through the phone's own
 * browser, as on the card (device.ts).
 */
export default function ContactPage({ wallet }: { wallet: WalletOptions }) {
  const { t, activeLang, setActiveLang } = useLanguage();
  const calm = usePrefersCalm();
  const platform = usePlatform();
  const inApp = useInApp();

  const chooseLang = (choice: Language) => {
    setActiveLang(choice);
    window.history.replaceState(null, "", pagePath("contact", choice));
  };

  // Each block rises a little after the one above it.
  const rise = (index: number) =>
    calm
      ? {}
      : {
          initial: { opacity: 0.4, y: 22 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.9, ease: EASE, delay: 0.15 + index * 0.09 },
        };

  const origin = typeof window === "undefined" ? siteUrl : window.location.origin;
  const viaBrowser = (path: string) => (inApp ? inBrowser(origin + path, platform) : path);
  const lang = HTML_LANG[activeLang];
  const walletHref = walletPath(wallet, platform, lang);
  const number = new Intl.NumberFormat(lang);

  const rows = [
    {
      key: "whatsapp",
      href: `https://wa.me/${businessCard.whatsapp}?text=${encodeURIComponent(t("whatsapp_message"))}`,
      external: true,
      label: t("card_qr_whatsapp"),
      value: businessCard.whatsappDisplay,
      Icon: WhatsAppIcon,
    },
    {
      key: "call",
      href: `tel:+${businessCard.whatsapp}`,
      external: false,
      label: t("contact_call"),
      value: businessCard.whatsappDisplay,
      Icon: Phone,
    },
    {
      key: "email",
      href: `mailto:${contact.email}`,
      external: false,
      label: t("card_email"),
      value: contact.email,
      Icon: Mail,
    },
    {
      key: "web",
      href: pagePath("home", activeLang),
      external: false,
      label: t("card_qr_web"),
      value: new URL(siteUrl).host,
      Icon: Globe,
    },
    {
      key: "mediakit",
      href: pagePath("mediaKit", activeLang),
      external: false,
      label: t("card_qr_mediakit"),
      value: t("card_mediakit_value"),
      Icon: BookOpen,
    },
  ];

  return (
    <>
      <header className={pageStyles.topbar}>
        <div className={`container ${pageStyles.topbarInner}`}>
          <Link href={pagePath("home", activeLang)} className={pageStyles.brand}>
            <BrandMark className={pageStyles.brandMark} />
            <BrandWordmark className={pageStyles.brandWordmark} />
          </Link>
          <div className={pageStyles.langs} role="group" aria-label={t("pkg_lang_label")}>
            {LANGUAGES.map((l) => (
              <button
                key={l}
                type="button"
                className={pageStyles.lang}
                aria-pressed={activeLang === l}
                onClick={() => chooseLang(l)}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className={styles.page}>
        <div className={styles.sheet}>
          {/* The portrait, in a gold ring that draws itself once. */}
          <motion.div
            className={styles.portrait}
            initial={calm ? false : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, ease: EASE }}
          >
            <span className={`${styles.ring} ${calm ? "" : styles.ringDraw}`} aria-hidden="true" />
            <Image
              src="/card/portrait.jpg"
              alt={t("contact_portrait_alt")}
              width={360}
              height={360}
              priority
              className={styles.portraitImage}
            />
          </motion.div>

          <motion.p className={styles.eyebrow} {...rise(0)}>
            {t("contact_eyebrow")}
          </motion.p>
          <motion.h1 className={styles.name} {...rise(1)}>
            Atilla Barbarossa
          </motion.h1>
          <motion.p className={styles.role} {...rise(2)}>
            {t("mk_about_role")}
          </motion.p>
          <motion.p className={styles.cities} {...rise(3)}>
            {t("card_cities")}
          </motion.p>

          <motion.div className={styles.primaryBlock} {...rise(4)}>
            {inApp && (
              <p className={styles.inApp}>
                <Compass size={15} strokeWidth={1.5} aria-hidden="true" />
                <span>{t("card_inapp")}</span>
              </p>
            )}
            {/* A plain link: the file is a download, not a page to route to. */}
            <a href={viaBrowser("/atilla-barbarossa.vcf")} className={styles.save}>
              <UserPlus size={18} strokeWidth={1.5} aria-hidden="true" />
              {t("card_save")}
            </a>
            <p className={styles.saveHint}>{t("contact_save_hint")}</p>
          </motion.div>

          <motion.a
            href={socialProfiles.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.instagram}
            {...rise(5)}
          >
            <span className={styles.instagramIcon} aria-hidden="true">
              <InstagramIcon />
            </span>
            <span className={styles.instagramText}>
              <span className={styles.instagramLabel}>{t("contact_instagram")}</span>
              <span className={styles.instagramValue}>
                {businessCard.instagramHandle} ·{" "}
                {fill(t("contact_followers"), { count: number.format(audience.followers.instagram) })}
              </span>
            </span>
            <ArrowUpRight size={16} strokeWidth={1.5} aria-hidden="true" className={styles.arrow} />
          </motion.a>

          <motion.ul className={styles.rows} {...rise(6)}>
            {rows.map(({ key, href, external, label, value, Icon }) => (
              <li key={key}>
                <a
                  href={href}
                  className={styles.row}
                  {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  <span className={styles.rowIcon} aria-hidden="true">
                    <Icon />
                  </span>
                  <span className={styles.rowText}>
                    <span className={styles.rowLabel}>{label}</span>
                    <span className={styles.rowValue}>{value}</span>
                  </span>
                  <ArrowUpRight size={14} strokeWidth={1.5} aria-hidden="true" className={styles.arrow} />
                </a>
              </li>
            ))}
            {walletHref && (
              <li>
                <a href={viaBrowser(walletHref)} className={styles.row}>
                  <span className={styles.rowIcon} aria-hidden="true">
                    <Wallet />
                  </span>
                  <span className={styles.rowText}>
                    <span className={styles.rowValue}>{t("card_wallet")}</span>
                  </span>
                  <ArrowUpRight size={14} strokeWidth={1.5} aria-hidden="true" className={styles.arrow} />
                </a>
              </li>
            )}
          </motion.ul>

          <motion.div {...rise(7)}>
            <Link href={pagePath("card", activeLang)} className={styles.cardLink}>
              {t("contact_card")}
              <ArrowUpRight size={13} strokeWidth={1.5} aria-hidden="true" />
            </Link>
          </motion.div>
        </div>
      </main>

      <footer className={pageStyles.footer}>
        <nav className={pageStyles.footerLinks} aria-label={t("legal_nav")}>
          <Link href="/impressum">{t("footer_imprint")}</Link>
          <Link href={pagePath("privacy", activeLang)}>{t("footer_privacy")}</Link>
        </nav>
      </footer>
    </>
  );
}
