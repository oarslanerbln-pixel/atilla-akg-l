"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion, type Transition } from "framer-motion";
import { ArrowUpRight, Play } from "lucide-react";
import BrandMark from "@/components/BrandMark";
import { useLanguage } from "@/context/LanguageContext";
import { usePrefersCalm } from "@/hooks/usePrefersCalm";
import { contact } from "@/lib/site";
import { brands } from "@/lib/brands";
import { partners } from "@/lib/partners";
import { LANGUAGES, pagePath } from "@/lib/locales";
import type { Language, TranslationKeys } from "@/i18n/translations";
import { mediaKitFigures } from "./figures";
import styles from "./MediaKitPage.module.css";

const EASE = [0.16, 1, 0.3, 1] as const;
const SEGMENTS = ["hotels", "restaurants", "brands"] as const;
const FORMATS = [1, 2, 3] as const;
const STEPS = [1, 2, 3] as const;

type Segment = (typeof SEGMENTS)[number];

const segmentKey = (segment: Segment, part: string) => `mk_${segment}_${part}` as TranslationKeys;

/**
 * The portfolio states each case result as one phrase ("559.316 erreichte
 * Konten", "94.2% Engagement Rate", "%94,2 Etkileşim Oranı"). Here the figure
 * is set large and the words under it, so the phrase is split at the end of
 * the figure; anything else is shown whole.
 */
const splitMetric = (text: string) => {
  const match = /^(%?\d[\d.,]*(?:\s?%|K)?)\s+(.+)$/.exec(text);
  return match ? { value: match[1], label: match[2] } : { value: text, label: "" };
};

/**
 * A film in a cinema band: the self-hosted still until the visitor asks for
 * it, then the clip with the browser's own controls. `preload="none"`, so a
 * visitor who never presses play downloads nothing but the poster.
 */
function Film({ src, poster, title, meta }: { src: string; poster: string; title: string; meta?: string }) {
  const { t } = useLanguage();
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const start = () => {
    setPlaying(true);
    const el = video.current;
    if (!el) return;
    el.controls = true;
    // The button goes away; focus moves to the player so the keyboard can pause it.
    el.focus();
    void el.play();
  };

  return (
    <figure className={styles.film}>
      <div className={styles.frame} data-playing={playing || undefined}>
        <video ref={video} className={styles.video} src={src} poster={poster} preload="none" playsInline />
        {!playing && (
          <button type="button" className={styles.play} onClick={start} aria-label={`${t("mk_film_play")}: ${title}`}>
            <span className={styles.playIcon} aria-hidden="true">
              <Play size={16} />
            </span>
            {t("mk_film_play")}
          </button>
        )}
      </div>
      <figcaption className={styles.caption}>
        <span className={styles.captionTitle}>{title}</span>
        {meta && <span className={styles.captionMeta}>{meta}</span>}
      </figcaption>
    </figure>
  );
}

/**
 * /media-kit — the page sent by email to hotels, restaurants and brands.
 *
 * A decision-maker opens it once, usually at a desk, and should know within a
 * screen who this is, whom the films reach and what working together looks
 * like.
 * So it is shorter and quieter than the portfolio: porcelain ground, hairlines
 * instead of shadowed cards, the films in dark bands at full width, figures
 * that stand still, and one way to reply. No intro, no custom cursor, no
 * floating button, no prices (quoted after a call, as on /social-media).
 *
 * Everything a fact rests on is read from its one source: the audience from
 * lib/site.ts, the references from brands.ts and partners.ts, the two case
 * figures from the portfolio's own project strings.
 */
export default function MediaKitPage() {
  const { t, activeLang, setActiveLang } = useLanguage();
  const calm = usePrefersCalm();

  const at = (delay: number, duration = 0.9): Transition =>
    calm ? { duration: 0 } : { duration, ease: EASE, delay };
  const rise = (delay: number) => ({
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: at(delay, 1.1),
  });
  const reveal = (delay = 0) => ({
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: at(delay, 0.9),
  });

  // In place, like the other switchers; the address follows, so a link copied
  // from the bar opens in the language on screen.
  const chooseLang = (choice: Language) => {
    setActiveLang(choice);
    window.history.replaceState(null, "", pagePath("mediaKit", choice));
  };

  const figures = mediaKitFigures(activeLang);

  const references: Record<Segment, { name: string; lang: string }[]> = {
    hotels: [
      { name: t("project_1_title"), lang: "en" },
      ...brands.filter((brand) => brand.segment === "hotels"),
    ],
    restaurants: [],
    brands: brands.filter((brand) => brand.segment === "brands"),
  };

  const mailHref = `mailto:${contact.email}?subject=${encodeURIComponent(t("mk_mail_subject"))}`;
  const whatsappHref = `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(t("mk_wa_message"))}`;

  return (
    <>
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
        </div>
      </header>

      <main className={styles.page}>
        {/* Opening */}
        <section className={styles.opening}>
          <div className={`container ${styles.openingInner}`}>
            <motion.p className={styles.eyebrow} {...rise(0.1)}>
              {t("mk_eyebrow")}
            </motion.p>
            <h1 className={styles.headline}>
              <motion.span className={styles.headlineLine} {...rise(0.2)}>
                {t("mk_title_1")}
              </motion.span>{" "}
              <motion.span className={`${styles.headlineLine} ${styles.headlineSoft}`} {...rise(0.32)}>
                {t("mk_title_2")}
              </motion.span>
            </h1>
            <motion.div className={styles.openingFoot} {...rise(0.5)}>
              <p className={styles.lead}>{t("mk_intro")}</p>
              <div className={styles.actions}>
                <a href={mailHref} className={styles.primary}>
                  {t("mk_cta")}
                  <ArrowUpRight size={15} aria-hidden="true" />
                </a>
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className={styles.secondary}>
                  {t("mk_whatsapp")}
                </a>
              </div>
            </motion.div>
            <motion.dl className={styles.figures} aria-label={t("mk_figures_label")} {...rise(0.65)}>
              {figures.map((figure) => (
                <div key={figure.label} className={styles.figure}>
                  <dt className={styles.figureLabel}>{figure.label}</dt>
                  <dd className={styles.figureValue}>{figure.value}</dd>
                </div>
              ))}
            </motion.dl>
          </div>
        </section>

        {/* The first film */}
        <section className={styles.band}>
          <motion.div className="container" {...reveal()}>
            <Film
              src="/caravanserai-documentary.mp4"
              poster="/posters/caravanserai-documentary.webp"
              title={t("project_3_title")}
              meta={`${t("project_3_type")} · ${t("project_3_metric")}`}
            />
          </motion.div>
        </section>

        {/* Results */}
        <section className={styles.section} aria-labelledby="results-title">
          <div className="container">
            <motion.div className={styles.sectionHead} {...reveal()}>
              <p className={styles.eyebrow}>{t("mk_results_eyebrow")}</p>
              <h2 id="results-title" className={styles.sectionTitle}>
                {t("mk_results_title")}
              </h2>
            </motion.div>
            <ul className={styles.cases}>
              {(
                [
                  { n: 1, text: "mk_case_hotel" },
                  { n: 3, text: "mk_case_heritage" },
                ] as const
              ).map(({ n, text }, i) => {
                const metric = splitMetric(t(`project_${n}_metric`));
                return (
                  <motion.li key={n} className={styles.case} {...reveal(i * 0.1)}>
                    <p className={styles.caseCategory}>{t(`project_${n}_cat`)}</p>
                    <h3 className={styles.caseName}>{t(`project_${n}_title`)}</h3>
                    <p className={styles.caseMetric}>
                      <span className={styles.caseValue}>{metric.value}</span>{" "}
                      {metric.label && <span className={styles.caseLabel}>{metric.label}</span>}
                    </p>
                    <p className={styles.caseText}>{t(text)}</p>
                  </motion.li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* Formats, by segment */}
        <section className={styles.section} aria-labelledby="segments-title">
          <div className="container">
            <motion.div className={styles.sectionHead} {...reveal()}>
              <p className={styles.eyebrow}>{t("mk_segments_eyebrow")}</p>
              <h2 id="segments-title" className={styles.sectionTitle}>
                {t("mk_segments_title")}
              </h2>
            </motion.div>
            <ol className={styles.segments}>
              {SEGMENTS.map((segment, i) => (
                <motion.li key={segment} className={styles.segment} {...reveal(i * 0.1)}>
                  <span className={styles.index}>{String(i + 1).padStart(2, "0")}</span>
                  <h3 className={styles.segmentName}>{t(segmentKey(segment, "name"))}</h3>
                  <p className={styles.segmentLead}>{t(segmentKey(segment, "lead"))}</p>
                  <ul className={styles.formats}>
                    {FORMATS.map((n) => (
                      <li key={n}>{t(segmentKey(segment, `f${n}`))}</li>
                    ))}
                  </ul>
                  {references[segment].length > 0 && (
                    <p className={styles.refs}>
                      <span className={styles.refsLabel}>{t("mk_refs")}</span>
                      {references[segment].map((ref, j) => (
                        <span key={ref.name} lang={ref.lang}>
                          {j > 0 && ", "}
                          {ref.name}
                        </span>
                      ))}
                    </p>
                  )}
                </motion.li>
              ))}
            </ol>
          </div>
        </section>

        {/* The second film */}
        <section className={styles.band}>
          <motion.div className="container" {...reveal()}>
            <Film src="/hero-reel.mp4" poster="/posters/hero-reel.webp" title={t("mk_film_hotel")} />
          </motion.div>
        </section>

        {/* Process */}
        <section className={styles.section} aria-labelledby="process-title">
          <div className="container">
            <motion.div className={styles.sectionHead} {...reveal()}>
              <p className={styles.eyebrow}>{t("mk_process_eyebrow")}</p>
              <h2 id="process-title" className={styles.sectionTitle}>
                {t("mk_process_title")}
              </h2>
            </motion.div>
            <ol className={styles.steps}>
              {STEPS.map((n, i) => (
                <motion.li key={n} className={styles.step} {...reveal(i * 0.1)}>
                  <span className={styles.index}>{String(n).padStart(2, "0")}</span>
                  <h3 className={styles.stepTitle}>{t(`mk_step_${n}_t`)}</h3>
                  <p className={styles.stepText}>{t(`mk_step_${n}_d`)}</p>
                </motion.li>
              ))}
            </ol>
          </div>
        </section>

        {/* Destinations and institutions */}
        <section className={styles.credits}>
          <div className="container">
            <p className={`${styles.eyebrow} ${styles.center}`}>{t("mk_credits")}</p>
            <ul className={styles.creditList}>
              {partners.map((partner) => (
                <li key={partner.name} lang={partner.nameLang}>
                  {partner.name}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Closing */}
        <section className={styles.close} aria-labelledby="close-title">
          <div className={`container ${styles.closeInner}`}>
            <motion.h2 id="close-title" className={styles.closeTitle} {...reveal()}>
              {t("mk_close_title")}
            </motion.h2>
            <motion.p className={styles.closeNote} {...reveal(0.1)}>
              {t("mk_close_note")}
            </motion.p>
            <motion.div className={styles.closeActions} {...reveal(0.2)}>
              <a href={mailHref} className={styles.closePrimary}>
                {t("mk_cta")}
              </a>
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className={styles.closeSecondary}>
                {t("mk_whatsapp")}
              </a>
            </motion.div>
            <motion.a href={`mailto:${contact.email}`} className={styles.closeMail} {...reveal(0.3)}>
              {contact.email}
            </motion.a>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={`container ${styles.footerInner}`}>
          <span>{t("footer_copyright")}</span>
          <nav className={styles.footerLinks} aria-label={t("legal_nav")}>
            <Link href="/impressum">{t("footer_imprint")}</Link>
            <Link href="/datenschutz">{t("footer_privacy")}</Link>
          </nav>
        </div>
      </footer>
    </>
  );
}
