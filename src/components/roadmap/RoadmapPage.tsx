"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, type Transition } from "framer-motion";
import { ArrowUpRight, Check, Plus, X } from "lucide-react";
import BrandMark from "@/components/BrandMark";
import { useLanguage } from "@/context/LanguageContext";
import { usePrefersCalm } from "@/hooks/usePrefersCalm";
import { useMagnetic } from "@/hooks/useMagnetic";
import { roadmap } from "@/lib/roadmap";
import { pagePath } from "@/lib/locales";
import type { Language, TranslationKeys } from "@/i18n/translations";
import styles from "./RoadmapPage.module.css";

const EASE = [0.16, 1, 0.3, 1] as const;
const LANGS: Language[] = ["DE", "EN", "TR"];
const FOUR = [1, 2, 3, 4] as const;
const THREE = [1, 2, 3] as const;

const fill = (text: string) => text.replace("{price}", String(roadmap.price));

/** Opens the page in the language the link was shared in (`?lang=tr`). */
function LangFromUrl() {
  const params = useSearchParams();
  const { setActiveLang } = useLanguage();
  useEffect(() => {
    const lang = params.get("lang")?.toUpperCase();
    if (lang && (LANGS as string[]).includes(lang)) setActiveLang(lang as Language);
  }, [params, setActiveLang]);
  return null;
}

/** Checkout links leave the site for Tentary, so they open in a new tab. */
function Checkout({ href, className, children }: { href: string; className: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  );
}

/**
 * /roadmap — Atilla's e-book, The Travel Creator Roadmap.
 *
 * Visitors come from an Instagram bio or story on a phone. The page makes the
 * case in the order a reader asks: what is it, why do I need it, what is in
 * it, who wrote it, what does it cost — and every answer ends near a way to
 * buy. Tentary sells and delivers the PDF; this page only links to its
 * checkouts (src/lib/roadmap.ts). The price shown is the checkout's final
 * price, with no struck-through reference price and no countdown: both are
 * claims the page would have to prove.
 *
 * On a phone a slim bar keeps the purchase one tap away once the opening has
 * scrolled out of view, and steps aside while the price section is on screen.
 */
export default function RoadmapPage() {
  const { t, activeLang, setActiveLang } = useLanguage();
  const calm = usePrefersCalm();
  const { ref: buyRef, style: buyLean } = useMagnetic<HTMLAnchorElement>(8);

  const openingRef = useRef<HTMLElement>(null);
  const priceRef = useRef<HTMLElement>(null);
  const [barVisible, setBarVisible] = useState(false);

  useEffect(() => {
    const opening = openingRef.current;
    const price = priceRef.current;
    if (!opening || !price) return;
    const inView = new Map<Element, boolean>([
      [opening, true],
      [price, false],
    ]);
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) inView.set(entry.target, entry.isIntersecting);
      setBarVisible(!inView.get(opening) && !inView.get(price));
    });
    observer.observe(opening);
    observer.observe(price);
    return () => observer.disconnect();
  }, []);

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

  const chooseLang = (lang: Language) => {
    setActiveLang(lang);
    const url = new URL(window.location.href);
    if (lang === "DE") url.searchParams.delete("lang");
    else url.searchParams.set("lang", lang.toLowerCase());
    window.history.replaceState(null, "", url);
  };

  const key = (k: string) => t(k as TranslationKeys);

  return (
    <>
      <Suspense fallback={null}>
        <LangFromUrl />
      </Suspense>

      <header className={styles.topbar}>
        <div className={`container ${styles.topbarInner}`}>
          <Link href={pagePath("home", activeLang)} className={styles.brand}>
            <BrandMark className={styles.brandMark} />
            {/* Set in capitals, as in the Navbar: under lang="tr" the CSS
                uppercase would turn the wordmark into ATİLLA. */}
            <span>ATILLA BARBAROSSA</span>
          </Link>
          <div className={styles.topbarEnd}>
            <Link href={pagePath("home", activeLang)} className={styles.homeLink}>
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
        <section ref={openingRef} className={styles.opening}>
          <div className={`container ${styles.openingGrid}`}>
            <div className={styles.openingCopy}>
              <motion.p className={styles.eyebrow} {...rise(0.15)}>
                {t("rm_eyebrow")}
              </motion.p>
              <h1 className={styles.headline}>
                <motion.span className={styles.headlineLine} {...rise(0.3)}>
                  {t("rm_title_1")}
                </motion.span>{" "}
                <motion.span className={`${styles.headlineLine} ${styles.headlineSoft}`} {...rise(0.45)}>
                  {t("rm_title_2")}
                </motion.span>
              </h1>
              <motion.p className={styles.lead} {...rise(0.6)}>
                {t("rm_lead")}
              </motion.p>
              <motion.div className={styles.actions} {...rise(0.75)}>
                <motion.a
                  ref={buyRef}
                  style={buyLean}
                  href={roadmap.checkout}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.primary}
                >
                  {fill(t("rm_buy"))}
                  <ArrowUpRight size={15} aria-hidden="true" />
                </motion.a>
                <Checkout href={roadmap.sample} className={styles.secondary}>
                  {t("rm_sample_cta")}
                </Checkout>
              </motion.div>
              <motion.p className={styles.facts} {...rise(0.9)}>
                {t("rm_facts")}
              </motion.p>
            </div>

            <motion.div
              className={styles.coverFrame}
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={at(0.35, 1.3)}
            >
              <Image
                src="/roadmap/cover.webp"
                alt={t("rm_cover_alt")}
                width={960}
                height={1500}
                priority
                sizes="(max-width: 900px) 70vw, 420px"
                className={styles.cover}
              />
            </motion.div>
          </div>
        </section>

        {/* Tourist vs. creator */}
        <section className={styles.section} aria-labelledby="compare-title">
          <div className="container">
            <motion.div className={styles.sectionHead} {...reveal()}>
              <p className={styles.eyebrow}>{t("rm_compare_eyebrow")}</p>
              <h2 id="compare-title" className={styles.sectionTitle}>
                {t("rm_compare_title")}
              </h2>
              <p className={styles.sectionIntro}>{t("rm_compare_intro")}</p>
              <span className={styles.divider} aria-hidden="true" />
            </motion.div>

            <div className={styles.compare}>
              <motion.div className={styles.tourist} {...reveal(0)}>
                <h3 className={styles.compareLabel}>{t("rm_tourist_label")}</h3>
                <ul className={styles.compareList}>
                  {FOUR.map((n) => (
                    <li key={n}>
                      <X size={16} aria-hidden="true" className={styles.crossIcon} />
                      {key(`rm_tourist_${n}`)}
                    </li>
                  ))}
                </ul>
              </motion.div>
              <motion.div className={styles.creator} {...reveal(0.12)}>
                <p className={styles.creatorEyebrow}>{t("rm_creator_eyebrow")}</p>
                <h3 className={styles.compareLabel}>{t("rm_creator_label")}</h3>
                <ul className={styles.compareList}>
                  {FOUR.map((n) => (
                    <li key={n}>
                      <Check size={16} aria-hidden="true" className={styles.checkIcon} />
                      {key(`rm_creator_${n}`)}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* What's inside */}
        <section className={styles.section} aria-labelledby="inside-title">
          <div className="container">
            <motion.div className={styles.sectionHead} {...reveal()}>
              <p className={styles.eyebrow}>{t("rm_inside_eyebrow")}</p>
              <h2 id="inside-title" className={styles.sectionTitle}>
                {t("rm_inside_title")}
              </h2>
              <span className={styles.divider} aria-hidden="true" />
            </motion.div>

            <ol className={styles.inside}>
              {THREE.map((n, i) => (
                <motion.li key={n} className={styles.insideItem} {...reveal(i * 0.1)}>
                  <span className={styles.insideIndex}>{String(n).padStart(2, "0")}</span>
                  <span className={styles.insideRule} aria-hidden="true" />
                  <h3 className={styles.insideTitle}>{key(`rm_inside_${n}_t`)}</h3>
                  <p className={styles.insideText}>{key(`rm_inside_${n}_d`)}</p>
                </motion.li>
              ))}
            </ol>
          </div>
        </section>

        {/* Free excerpt */}
        <section className={styles.sample} aria-labelledby="sample-title">
          <motion.div className={`container ${styles.sampleInner}`} {...reveal()}>
            <div>
              <p className={styles.eyebrow}>{t("rm_sample_eyebrow")}</p>
              <h2 id="sample-title" className={styles.sampleTitle}>
                {t("rm_sample_title")}
              </h2>
              <p className={styles.sampleText}>{t("rm_sample_text")}</p>
            </div>
            <div className={styles.sampleAction}>
              <Checkout href={roadmap.sample} className={styles.primary}>
                {t("rm_sample_button")}
                <ArrowUpRight size={15} aria-hidden="true" />
              </Checkout>
              <p className={styles.sampleNote}>{t("rm_sample_note")}</p>
            </div>
          </motion.div>
        </section>

        {/* Author */}
        <section className={styles.section} aria-labelledby="author-title">
          <div className={`container ${styles.author}`}>
            <motion.div className={styles.portraitFrame} {...reveal()}>
              <Image
                src="/roadmap/atilla.webp"
                alt=""
                width={720}
                height={720}
                sizes="(max-width: 900px) 80vw, 440px"
                className={styles.portrait}
              />
            </motion.div>
            <motion.div {...reveal(0.12)}>
              <p className={styles.eyebrow}>{t("rm_author_eyebrow")}</p>
              <h2 id="author-title" className={styles.sectionTitle}>
                Atilla Barbarossa
              </h2>
              <p className={styles.authorText}>{t("rm_author_text")}</p>
              <dl className={styles.stats}>
                <div>
                  <dt>{t("rm_stat_hotels")}</dt>
                  <dd>100+</dd>
                </div>
                <div>
                  <dt>{t("rm_stat_community")}</dt>
                  <dd>600k+</dd>
                </div>
              </dl>
            </motion.div>
          </div>
        </section>

        {/* Price */}
        <section ref={priceRef} className={styles.price} aria-labelledby="price-title">
          <div className={`container ${styles.priceInner}`}>
            <motion.p className={styles.priceEyebrow} {...reveal()}>
              {t("rm_price_eyebrow")}
            </motion.p>
            <motion.h2 id="price-title" className={styles.priceTitle} {...reveal(0.05)}>
              {t("rm_price_title")}
            </motion.h2>
            <motion.p className={styles.priceNote} {...reveal(0.1)}>
              {t("rm_price_note")}
            </motion.p>
            <motion.div className={styles.priceTag} {...reveal(0.15)}>
              <span className={styles.priceAmount}>{fill(t("rm_price_amount"))}</span>
              <span className={styles.priceLabel}>{t("rm_price_label")}</span>
              <span className={styles.priceFormat}>{t("rm_price_format")}</span>
            </motion.div>
            <motion.div {...reveal(0.2)}>
              <Checkout href={roadmap.checkout} className={styles.pricePrimary}>
                {t("rm_price_button")}
                <ArrowUpRight size={15} aria-hidden="true" />
              </Checkout>
            </motion.div>
            <p className={styles.legal}>{t("rm_legal")}</p>
          </div>
        </section>

        {/* FAQ */}
        <section className={styles.section} aria-labelledby="faq-title">
          <div className={`container ${styles.faqWrap}`}>
            <motion.div className={styles.sectionHead} {...reveal()}>
              <p className={styles.eyebrow}>{t("rm_faq_eyebrow")}</p>
              <h2 id="faq-title" className={styles.sectionTitle}>
                {t("rm_faq_title")}
              </h2>
              <span className={styles.divider} aria-hidden="true" />
            </motion.div>
            <div className={styles.faq}>
              {FOUR.map((n) => (
                <details key={n} className={styles.faqItem}>
                  <summary className={styles.faqQuestion}>
                    {key(`rm_faq_${n}_q`)}
                    <Plus size={18} aria-hidden="true" className={styles.faqIcon} />
                  </summary>
                  <p className={styles.faqAnswer}>{key(`rm_faq_${n}_a`)}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <div className={styles.bar} data-visible={barVisible} inert={!barVisible}>
        <span className={styles.barLabel}>{t("rm_sticky_label")}</span>
        <Checkout href={roadmap.checkout} className={styles.barButton}>
          {fill(t("rm_sticky_button"))}
        </Checkout>
      </div>

      <footer className={styles.footer}>
        <div className={`container ${styles.footerInner}`}>
          <span>{t("footer_copyright")}</span>
          <nav className={styles.footerLinks} aria-label={t("legal_nav")}>
            <Link href="/impressum">{t("footer_imprint")}</Link>
            <Link href={pagePath("privacy", activeLang)}>{t("footer_privacy")}</Link>
          </nav>
        </div>
      </footer>
    </>
  );
}
