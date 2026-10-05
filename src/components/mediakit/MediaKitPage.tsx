"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, type Transition } from "framer-motion";
import { ArrowUpRight, Play } from "lucide-react";
import BrandMark from "@/components/BrandMark";
import { useLanguage } from "@/context/LanguageContext";
import { usePrefersCalm } from "@/hooks/usePrefersCalm";
import { fill, splitMetric } from "@/i18n/format";
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
 * Each segment is shown with footage of its own kind: the hotel film itself,
 * and for restaurants and brands a still from the Caravanserai film (its
 * restaurant, its courtyard), captioned as a still from that film so it never
 * reads as a client of that segment.
 */
const SEGMENT_STILLS: Record<Exclude<Segment, "hotels">, string> = {
  restaurants: "/media-kit/restaurant.webp",
  brands: "/media-kit/courtyard.webp",
};

/**
 * A film: the self-hosted still until the visitor asks for it, then the clip
 * with the browser's own controls. `preload="none"`, so a visitor who never
 * presses play downloads nothing but the poster.
 */
function Film({
  src,
  poster,
  title,
  meta,
  frameClass,
}: {
  src: string;
  poster: string;
  title: string;
  meta?: string;
  frameClass?: string;
}) {
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
      <div className={`${styles.frame} ${frameClass ?? ""}`} data-playing={playing || undefined}>
        <video ref={video} className={styles.video} src={src} poster={poster} preload="none" playsInline />
        {!playing && (
          <button type="button" className={styles.play} onClick={start} aria-label={`${t("mk_film_play")}: ${title}`}>
            <span className={styles.playIcon} aria-hidden="true">
              <Play size={18} strokeWidth={1.25} />
            </span>
            <span className={styles.playLabel}>{t("mk_film_play")}</span>
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
 * like. It is laid out like a printed media kit: a cover still with the
 * headline set in its sky, numbered chapters on porcelain, the segments as
 * alternating spreads of footage and text, the person behind the camera, and
 * an ink close that runs the references like end credits. No intro, no custom
 * cursor, no floating button, no prices (quoted after a call, as on
 * /social-media).
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
  // Footage opens like a curtain rising, rather than sliding in.
  const unveil = (delay = 0) => ({
    initial: { clipPath: "inset(0 0 100% 0)" },
    whileInView: { clipPath: "inset(0 0 0% 0)" },
    viewport: { once: true, margin: "-80px" },
    transition: at(delay, 1.4),
  });

  // In place, like the other switchers; the address follows, so a link copied
  // from the bar opens in the language on screen.
  const chooseLang = (choice: Language) => {
    setActiveLang(choice);
    window.history.replaceState(null, "", pagePath("mediaKit", choice));
  };

  const figures = mediaKitFigures(activeLang);
  const novotel = { name: t("project_1_title"), lang: "en" };

  const references: Record<Segment, { name: string; lang: string }[]> = {
    hotels: [novotel, ...brands.filter((brand) => brand.segment === "hotels")],
    restaurants: [],
    brands: brands.filter((brand) => brand.segment === "brands"),
  };

  const stillCaption = fill(t("mk_still"), { title: t("project_3_title") });
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
        {/* Cover: the still carries the page; the headline sits in its sky. */}
        <section className={styles.cover}>
          <motion.div
            className={styles.coverStill}
            initial={{ scale: calm ? 1 : 1.06 }}
            animate={{ scale: 1 }}
            transition={calm ? { duration: 0 } : { duration: 2.8, ease: EASE }}
          >
            {/* Served as encoded (50 KB): the optimizer's re-encode at q75
                bands the sky the headline is set in. */}
            <Image
              src="/media-kit/cover.webp"
              alt=""
              fill
              priority
              unoptimized
              sizes="100vw"
              className={styles.coverImage}
            />
          </motion.div>
          <div className={`container ${styles.coverInner}`}>
            <motion.p className={styles.coverEyebrow} {...rise(0.2)}>
              {t("mk_eyebrow")}
            </motion.p>
            <h1 className={styles.headline}>
              <motion.span className={styles.headlineLine} {...rise(0.35)}>
                {t("mk_title_1")}
              </motion.span>{" "}
              <motion.span className={`${styles.headlineLine} ${styles.headlineSoft}`} {...rise(0.5)}>
                {t("mk_title_2")}
              </motion.span>
            </h1>
          </div>
        </section>

        {/* Statement and figures */}
        <section className={styles.statement}>
          <div className={`container ${styles.statementInner}`}>
            <motion.p className={styles.statementText} {...reveal()}>
              {t("mk_intro")}
            </motion.p>
            <motion.div className={styles.actions} {...reveal(0.1)}>
              <a href={mailHref} className={styles.primary}>
                {t("mk_cta")}
                <ArrowUpRight size={15} aria-hidden="true" />
              </a>
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className={styles.secondary}>
                {t("mk_whatsapp")}
              </a>
            </motion.div>
            <motion.dl className={styles.figures} aria-label={t("mk_figures_label")} {...reveal(0.2)}>
              {figures.map((figure) => (
                <div key={figure.label} className={styles.figure}>
                  <dt className={styles.figureLabel}>{figure.label}</dt>
                  <dd className={styles.figureValue}>{figure.value}</dd>
                </div>
              ))}
            </motion.dl>
          </div>
        </section>

        {/* The film */}
        <section className={styles.band}>
          <motion.div className={styles.wide} {...reveal()}>
            <Film
              src="/caravanserai-documentary.mp4"
              poster="/posters/caravanserai-documentary.webp"
              title={t("project_3_title")}
              meta={`${t("project_3_type")} · ${t("project_3_metric")}`}
            />
          </motion.div>
        </section>

        {/* I — Results */}
        <section className={`${styles.section} ${styles.chapter}`} aria-labelledby="results-title">
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
                  <motion.li key={n} className={styles.case} {...reveal(i * 0.12)}>
                    <p className={styles.caseMetric}>
                      <span className={styles.caseValue}>{metric.value}</span>{" "}
                      {metric.label && <span className={styles.caseLabel}>{metric.label}</span>}
                    </p>
                    <p className={styles.caseCategory}>{t(`project_${n}_cat`)}</p>
                    <h3 className={styles.caseName}>{t(`project_${n}_title`)}</h3>
                    <p className={styles.caseText}>{t(text)}</p>
                  </motion.li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* II — Formats, by segment */}
        <section className={`${styles.section} ${styles.chapter}`} aria-labelledby="segments-title">
          <div className="container">
            <motion.div className={styles.sectionHead} {...reveal()}>
              <p className={styles.eyebrow}>{t("mk_segments_eyebrow")}</p>
              <h2 id="segments-title" className={styles.sectionTitle}>
                {t("mk_segments_title")}
              </h2>
            </motion.div>
            <ol className={styles.segments}>
              {SEGMENTS.map((segment, i) => (
                <li key={segment} className={styles.segment}>
                  <motion.div className={styles.segmentVisual} {...unveil()}>
                    {segment === "hotels" ? (
                      <Film
                        src="/hero-reel.mp4"
                        poster="/media-kit/hotel.webp"
                        title={t("mk_film_hotel")}
                        frameClass={styles.frameSpread}
                      />
                    ) : (
                      <figure className={styles.still}>
                        <div className={styles.stillFrame}>
                          <Image
                            src={SEGMENT_STILLS[segment]}
                            alt=""
                            fill
                            sizes="(max-width: 900px) 100vw, 680px"
                            className={styles.stillImage}
                          />
                        </div>
                        <figcaption className={styles.stillCaption}>{stillCaption}</figcaption>
                      </figure>
                    )}
                  </motion.div>
                  <motion.div className={styles.segmentBody} {...reveal(0.15)}>
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
                  </motion.div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* III — Behind the camera */}
        <section className={`${styles.about} ${styles.chapter}`} aria-labelledby="about-title">
          <div className={`container ${styles.aboutInner}`}>
            <motion.div className={styles.portrait} {...unveil()}>
              <Image
                src="/roadmap/atilla.webp"
                alt={t("mk_about_alt")}
                fill
                sizes="(max-width: 900px) 100vw, 460px"
                className={styles.portraitImage}
              />
            </motion.div>
            <motion.div className={styles.aboutBody} {...reveal(0.15)}>
              <p className={styles.eyebrow}>{t("mk_about_eyebrow")}</p>
              <h2 id="about-title" className={styles.sectionTitle}>
                {t("mk_about_title")}
              </h2>
              <p className={styles.aboutText}>{t("mk_about_text")}</p>
              <p className={styles.signature}>
                <BrandMark className={styles.signatureMark} />
                <span className={styles.signatureName}>Atilla Barbarossa</span>
                <span className={styles.signatureRole}>{t("mk_about_role")}</span>
              </p>
            </motion.div>
          </div>
        </section>

        {/* IV — Process */}
        <section className={`${styles.section} ${styles.chapter}`} aria-labelledby="process-title">
          <div className="container">
            <motion.div className={styles.sectionHead} {...reveal()}>
              <p className={styles.eyebrow}>{t("mk_process_eyebrow")}</p>
              <h2 id="process-title" className={styles.sectionTitle}>
                {t("mk_process_title")}
              </h2>
            </motion.div>
            <ol className={styles.steps}>
              {STEPS.map((n, i) => (
                <motion.li key={n} className={styles.step} {...reveal(i * 0.12)}>
                  <span className={styles.stepIndex}>{String(n).padStart(2, "0")}</span>
                  <h3 className={styles.stepTitle}>{t(`mk_step_${n}_t`)}</h3>
                  <p className={styles.stepText}>{t(`mk_step_${n}_d`)}</p>
                </motion.li>
              ))}
            </ol>
          </div>
        </section>

        {/* Close: the references run like end credits, then one way to reply. */}
        <section className={styles.close} aria-labelledby="close-title">
          <div className={`container ${styles.closeInner}`}>
            <motion.div className={styles.credits} {...reveal()}>
              <div className={styles.creditGroup}>
                <p className={styles.creditHead}>{t("mk_credits")}</p>
                <ul className={styles.creditList}>
                  {partners.map((partner) => (
                    <li key={partner.name} lang={partner.nameLang}>
                      {partner.name}
                    </li>
                  ))}
                </ul>
              </div>
              <div className={styles.creditGroup}>
                <p className={styles.creditHead}>{t("mk_credits_brands")}</p>
                <ul className={styles.creditList}>
                  {[novotel, ...brands].map((brand) => (
                    <li key={brand.name} lang={brand.lang}>
                      {brand.name}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            <motion.div className={styles.closeMark} {...reveal(0.1)} aria-hidden="true">
              <BrandMark className={styles.closeMarkSvg} />
            </motion.div>
            <motion.h2 id="close-title" className={styles.closeTitle} {...reveal(0.15)}>
              {t("mk_close_title")}
            </motion.h2>
            <motion.p className={styles.closeNote} {...reveal(0.2)}>
              {t("mk_close_note")}
            </motion.p>
            <motion.div className={styles.closeActions} {...reveal(0.25)}>
              <a href={mailHref} className={styles.closePrimary}>
                {t("mk_cta")}
                <ArrowUpRight size={15} aria-hidden="true" />
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
