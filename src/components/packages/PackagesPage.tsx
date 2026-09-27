"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, type Transition, type Variants } from "framer-motion";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import BrandMark from "@/components/BrandMark";
import Brands from "@/components/Brands";
import { useLanguage } from "@/context/LanguageContext";
import { usePrefersCalm } from "@/hooks/usePrefersCalm";
import { useMagnetic } from "@/hooks/useMagnetic";
import { contact } from "@/lib/site";
import { packages, type Package } from "@/lib/packages";
import type { Language, TranslationKeys } from "@/i18n/translations";
import styles from "./PackagesPage.module.css";

const EASE = [0.16, 1, 0.3, 1] as const;
const LANGS: Language[] = ["DE", "EN", "TR"];
const STEPS = [1, 2, 3, 4] as const;
const PROMISES = [1, 2, 3, 4] as const;

const fill = (text: string, values: Record<string, string | number>) =>
  text.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ""));

const whatsapp = (message: string) =>
  `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(message)}`;

const mail = (subject: string) =>
  `mailto:${contact.email}?subject=${encodeURIComponent(subject)}`;

/**
 * Opens the page in the language the link was sent in (`?lang=tr`). It sits
 * in its own Suspense boundary so the rest of the page still prerenders.
 */
function LangFromUrl() {
  const params = useSearchParams();
  const { setActiveLang } = useLanguage();
  useEffect(() => {
    const lang = params.get("lang")?.toUpperCase();
    if (lang && (LANGS as string[]).includes(lang)) setActiveLang(lang as Language);
  }, [params, setActiveLang]);
  return null;
}

/**
 * /social-media — the monthly packages, as a page to send.
 *
 * A prospect arrives from a DM or an email, usually on a phone, and should
 * understand the offer in one scroll: who, what three sizes, how it runs,
 * and one tap to ask. There are no prices on purpose — the investment is
 * quoted after a call — so every plate ends in a request, not a number.
 *
 * It is lighter than the home page: no intro overlay, no custom cursor, no
 * floating button (every section already ends in a way to get in touch). It
 * borrows the site's plate language from the Partners section — index,
 * hairline frame, a wipe-up reveal, a gold rule on hover — so it reads as
 * part of the same house. A visitor who asked for less motion gets the
 * finished page.
 */
export default function PackagesPage() {
  const { t, activeLang, setActiveLang } = useLanguage();
  const calm = usePrefersCalm();
  const { ref: waRef, style: waLean } = useMagnetic<HTMLAnchorElement>(8);
  const { ref: mailRef, style: mailLean } = useMagnetic<HTMLAnchorElement>(8);

  const at = (delay: number, duration = 0.9): Transition =>
    calm ? { duration: 0 } : { duration, ease: EASE, delay };
  const rise = (delay: number) => ({
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: at(delay),
  });
  const reveal = (delay = 0) => ({
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: at(delay, 0.8),
  });

  const listVariants: Variants = {
    hidden: {},
    visible: { transition: calm ? {} : { staggerChildren: 0.12, delayChildren: 0.1 } },
  };
  const plateVariants: Variants = {
    hidden: { clipPath: "inset(100% 0% 0% 0%)" },
    visible: { clipPath: "inset(0% 0% 0% 0%)", transition: at(0, 1) },
  };

  // The switcher keeps the address in step, so a link copied from the
  // address bar opens in the language on screen.
  const chooseLang = (lang: Language) => {
    setActiveLang(lang);
    const url = new URL(window.location.href);
    if (lang === "DE") url.searchParams.delete("lang");
    else url.searchParams.set("lang", lang.toLowerCase());
    window.history.replaceState(null, "", url);
  };

  const renderPlate = (pkg: Package, index: number) => {
    const values = { name: pkg.name, count: pkg.videos };
    return (
      <motion.li
        key={pkg.id}
        className={`${styles.plate} ${pkg.featured ? styles.featured : ""}`}
        variants={plateVariants}
      >
        <div className={styles.plateTop}>
          <span className={styles.plateIndex}>{String(index + 1).padStart(2, "0")}</span>
          {pkg.featured && <span className={styles.badge}>{t("pkg_most_chosen")}</span>}
        </div>

        <h3 className={styles.plateName}>{pkg.name}</h3>
        <p className={styles.tagline}>{t(pkg.tagline)}</p>

        <div className={styles.count}>
          <span className={styles.countValue}>{pkg.videos}</span>
          <span className={styles.countLabel}>
            <span>{t("pkg_videos")}</span>
            <span>{t("pkg_per_month")}</span>
          </span>
        </div>

        <ul className={styles.features}>
          {pkg.features.map((feature) => (
            <li key={feature}>{t(feature)}</li>
          ))}
        </ul>

        <div className={styles.plateFoot}>
          <p className={styles.investment}>{t("pkg_investment")}</p>
          <a
            href={whatsapp(fill(t("pkg_wa_message"), values))}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.plateCta}
          >
            {t("pkg_cta_request")}
            <ArrowUpRight size={15} aria-hidden="true" />
          </a>
          <a href={mail(fill(t("pkg_mail_subject"), values))} className={styles.plateMail}>
            {t("pkg_cta_email")}
          </a>
        </div>

        <span className={styles.plateRule} aria-hidden="true" />
      </motion.li>
    );
  };

  return (
    <>
      <Suspense fallback={null}>
        <LangFromUrl />
      </Suspense>

      <header className={styles.topbar}>
        <div className={`container ${styles.topbarInner}`}>
          <Link href="/" className={styles.brand}>
            <BrandMark className={styles.brandMark} />
            <span>Atilla Barbarossa</span>
          </Link>
          <div className={styles.topbarEnd}>
            <Link href="/" className={styles.homeLink}>
              {t("pkg_home")}
            </Link>
            <div className={styles.langs} role="group" aria-label={t("pkg_lang_label")}>
              {LANGS.map((lang) => (
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
        </div>
      </header>

      <main className={styles.page}>
        {/* Opening */}
        <section className={styles.opening}>
          <motion.span
            className={styles.horizon}
            aria-hidden="true"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={at(0.1, 1.6)}
          />
          <div className={`container ${styles.openingInner}`}>
            <motion.p className={styles.eyebrow} {...rise(0.2)}>
              {t("pkg_eyebrow")}
            </motion.p>
            <h1 className={styles.headline}>
              <motion.span className={styles.headlineLine} {...rise(0.35)}>
                {t("pkg_title_1")}
              </motion.span>
              <motion.span className={`${styles.headlineLine} ${styles.headlineSoft}`} {...rise(0.5)}>
                {t("pkg_title_2")}
              </motion.span>
            </h1>
            <motion.p className={styles.lead} {...rise(0.7)}>
              {t("pkg_intro")}
            </motion.p>
            <motion.a href="#packages" className={styles.scrollLink} {...rise(0.9)}>
              {t("pkg_scroll")}
              <ArrowDown size={15} aria-hidden="true" />
            </motion.a>
          </div>
        </section>

        {/* Packages */}
        <section id="packages" className={styles.section} aria-labelledby="packages-title">
          <div className="container">
            <motion.div className={styles.sectionHead} {...reveal()}>
              <p className={styles.eyebrow}>{t("pkg_packages_eyebrow")}</p>
              <h2 id="packages-title" className={styles.sectionTitle}>
                {t("pkg_packages_title")}
              </h2>
              <span className={styles.divider} aria-hidden="true" />
            </motion.div>

            <motion.ul
              className={styles.plates}
              variants={listVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
            >
              {packages.map(renderPlate)}
            </motion.ul>
          </div>
        </section>

        {/* Process */}
        <section className={`${styles.section} ${styles.processSection}`} aria-labelledby="process-title">
          <div className="container">
            <motion.div className={styles.sectionHead} {...reveal()}>
              <p className={styles.eyebrow}>{t("pkg_process_eyebrow")}</p>
              <h2 id="process-title" className={styles.sectionTitle}>
                {t("pkg_process_title")}
              </h2>
              <span className={styles.divider} aria-hidden="true" />
            </motion.div>

            <ol className={styles.steps}>
              {STEPS.map((n, i) => (
                <motion.li key={n} className={styles.step} {...reveal(i * 0.1)}>
                  <span className={styles.stepNumber}>{String(n).padStart(2, "0")}</span>
                  <span className={styles.stepLine} aria-hidden="true" />
                  <h3 className={styles.stepTitle}>{t(`pkg_step_${n}_t` as TranslationKeys)}</h3>
                  <p className={styles.stepText}>{t(`pkg_step_${n}_d` as TranslationKeys)}</p>
                </motion.li>
              ))}
            </ol>
          </div>
        </section>

        {/* Promises */}
        <section className={`${styles.section} ${styles.promiseSection}`} aria-labelledby="promise-title">
          <div className="container">
            <motion.p id="promise-title" className={`${styles.eyebrow} ${styles.center}`} {...reveal()}>
              {t("pkg_promise_eyebrow")}
            </motion.p>
            <ul className={styles.promises}>
              {PROMISES.map((n, i) => (
                <motion.li key={n} className={styles.promise} {...reveal(i * 0.08)}>
                  <h3 className={styles.promiseTitle}>{t(`pkg_promise_${n}_t` as TranslationKeys)}</h3>
                  <p className={styles.promiseText}>{t(`pkg_promise_${n}_d` as TranslationKeys)}</p>
                </motion.li>
              ))}
            </ul>
          </div>
        </section>

        {/* Proof */}
        <section className={styles.proof}>
          <p className={`${styles.eyebrow} ${styles.center}`}>{t("pkg_brands_eyebrow")}</p>
          <Brands />
        </section>

        {/* Closing */}
        <section className={styles.close} aria-labelledby="close-title">
          <div className={`container ${styles.closeInner}`}>
            <motion.h2 id="close-title" className={styles.closeTitle} {...reveal()}>
              {t("pkg_close_title")}
            </motion.h2>
            <motion.p className={styles.closeNote} {...reveal(0.1)}>
              {t("pkg_close_note")}
            </motion.p>
            <motion.div className={styles.closeActions} {...reveal(0.2)}>
              <motion.a
                ref={waRef}
                style={waLean}
                href={whatsapp(t("pkg_wa_general"))}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.closePrimary}
              >
                {t("pkg_close_whatsapp")}
              </motion.a>
              <motion.a
                ref={mailRef}
                style={mailLean}
                href={mail(t("pkg_mail_general"))}
                className={styles.closeSecondary}
              >
                {t("pkg_close_email")}
              </motion.a>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={`container ${styles.footerInner}`}>
          <span>{t("footer_copyright")}</span>
          <nav className={styles.footerLinks} aria-label="Legal">
            <Link href="/impressum">{t("footer_imprint")}</Link>
            <Link href="/datenschutz">{t("footer_privacy")}</Link>
          </nav>
        </div>
      </footer>
    </>
  );
}
