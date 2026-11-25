"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { m, type Transition } from "framer-motion";
import {
  ArrowDown,
  ArrowUpRight,
  Award,
  BedDouble,
  Calculator,
  Check,
  CirclePlay,
  CreditCard,
  Plane,
  Plus,
  RefreshCw,
  ShoppingBasket,
  Ticket,
  Timer,
  type LucideIcon,
} from "lucide-react";
import BrandMark from "@/components/BrandMark";
import BrandWordmark from "@/components/BrandWordmark";
import { useLanguage } from "@/context/LanguageContext";
import { usePrefersCalm } from "@/hooks/usePrefersCalm";
import { useMagnetic } from "@/hooks/useMagnetic";
import { pagePath } from "@/lib/locales";
import { audience, socialProfiles } from "@/lib/site";
import { punkte, punkteCopy as c, punkteProof } from "@/lib/punkte";
import { CheckStack, SystemBundle } from "./PunkteMockups";
import styles from "./PunktePage.module.css";

const EASE = [0.16, 1, 0.3, 1] as const;
const WAY_ICONS: LucideIcon[] = [ShoppingBasket, CreditCard, Plane, BedDouble, Award];
const FEATURE_ICONS: LucideIcon[] = [Timer, Calculator, Ticket, CirclePlay, RefreshCw];
const number = new Intl.NumberFormat("de-DE");

/** Tentary links leave the site, so they open in a new tab and say so. */
function Out({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
      <span className={styles.srOnly}> ({c.newTab})</span>
    </a>
  );
}

/**
 * /punkte — the free Punkte-Check now, Das Punkte-System later.
 *
 * Visitors arrive from a reel ("Kommentiere PUNKTE") on a phone. One action
 * matters: get the free check. The page answers in the order a reader asks:
 * what is it, what is in it, can I trust the numbers, how does it look, how do
 * I get it, what comes after it, who is behind it. Every block ends near the
 * same button. The paid product is shown as what it is — not on sale yet —
 * with no price, date or checkout until `punkte.checkout` is set.
 *
 * Copy and links: src/lib/punkte.ts (German only, see there).
 */
export default function PunktePage() {
  const { t, activeLang } = useLanguage();
  const calm = usePrefersCalm();
  const { ref: ctaRef, style: ctaLean } = useMagnetic<HTMLAnchorElement>(8);

  const actionsRef = useRef<HTMLDivElement>(null);
  const finalRef = useRef<HTMLElement>(null);
  const [barVisible, setBarVisible] = useState(false);

  // The phone bar shows whenever the opening's own button is not on screen
  // (below the fold on arrival, or scrolled past) and steps aside where the
  // closing call to action is. One observer per target.
  useEffect(() => {
    const opening = actionsRef.current;
    const final = finalRef.current;
    if (!opening || !final) return;
    const inView = new Map<Element, boolean>([
      [opening, false],
      [final, false],
    ]);
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) inView.set(entry.target, entry.isIntersecting);
      setBarVisible(!inView.get(opening) && !inView.get(final));
    });
    observer.observe(opening);
    observer.observe(final);
    return () => observer.disconnect();
  }, []);

  const at = (delay: number, duration = 0.9): Transition =>
    calm ? { duration: 0 } : { duration, ease: EASE, delay };
  // Starts soft and low, never hidden: the copy is readable at first paint.
  const rise = (delay: number) => ({
    initial: { opacity: 0.35, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: at(delay),
  });
  const reveal = (delay = 0) => ({
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "0px 0px -80px 0px" },
    transition: at(delay, 0.8),
  });

  return (
    <>
      <header className={styles.topbar}>
        <div className={`container ${styles.topbarInner}`}>
          <Link href={pagePath("home", activeLang)} className={styles.brand}>
            <BrandMark className={styles.brandMark} />
            <BrandWordmark className={styles.wordmark} />
          </Link>
          <Link href={pagePath("home", activeLang)} className={styles.homeLink}>
            {t("pkg_home")}
          </Link>
        </div>
      </header>

      <main className={styles.page}>
        {/* ---------- Opening ---------- */}
        <section className={styles.opening}>
          <div className={`container ${styles.openingGrid}`}>
            <div className={styles.openingCopy}>
              <m.p className={styles.adLabel} {...rise(0.05)}>
                {c.adLabel}
              </m.p>
              <m.p className={styles.eyebrow} {...rise(0.1)}>
                {c.heroEyebrow}
              </m.p>
              <h1 className={styles.headline}>
                <m.span className={styles.headlineLine} {...rise(0.2)}>
                  {c.heroTitle1}
                </m.span>{" "}
                <m.span className={`${styles.headlineLine} ${styles.headlineSoft}`} {...rise(0.32)}>
                  {c.heroTitle2}
                </m.span>
              </h1>
              <m.p className={styles.lead} {...rise(0.44)}>
                {c.heroLead}
              </m.p>
              <m.div ref={actionsRef} className={styles.actions} {...rise(0.56)}>
                <m.a
                  ref={ctaRef}
                  style={ctaLean}
                  href={punkte.check}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.primary}
                >
                  {c.heroCta}
                  <ArrowUpRight size={15} aria-hidden="true" />
                  <span className={styles.srOnly}> ({c.newTab})</span>
                </m.a>
                <a href="#fallen" className={styles.secondary}>
                  {c.heroSecondary}
                  <ArrowDown size={14} aria-hidden="true" />
                </a>
              </m.div>
              <m.p className={styles.facts} {...rise(0.66)}>
                {c.heroFacts}
              </m.p>
              <m.ul className={styles.trust} {...rise(0.74)}>
                {c.heroTrust.map((item) => (
                  <li key={item}>
                    <Check size={14} aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </m.ul>
            </div>

            <div className={styles.visual}>
              <CheckStack coverAlt={c.coverAlt} />
            </div>
          </div>
        </section>

        {/* ---------- The 10 traps ---------- */}
        <section id="fallen" className={styles.section} aria-labelledby="traps-title">
          <div className="container">
            <m.div className={styles.sectionHead} {...reveal()}>
              <p className={styles.eyebrow}>{c.trapsEyebrow}</p>
              <h2 id="traps-title" className={styles.sectionTitle}>
                {c.trapsTitle}
              </h2>
              <p className={styles.sectionIntro}>{c.trapsIntro}</p>
              <span className={styles.divider} aria-hidden="true" />
            </m.div>

            <ol className={styles.traps}>
              {c.traps.map((trap, i) => (
                <m.li key={trap} className={styles.trap} {...reveal((i % 5) * 0.06)}>
                  <span className={styles.trapIndex}>{String(i + 1).padStart(2, "0")}</span>
                  <span className={styles.trapText}>{trap}</span>
                </m.li>
              ))}
            </ol>
            <m.p className={styles.trapsBonus} {...reveal(0.1)}>
              {c.trapsBonus}
            </m.p>
          </div>
        </section>

        {/* ---------- Proof: three figures from the check ---------- */}
        <section className={`${styles.section} ${styles.tinted}`} aria-labelledby="proof-title">
          <div className="container">
            <m.div className={styles.sectionHead} {...reveal()}>
              <p className={styles.eyebrow}>{c.proofEyebrow}</p>
              <h2 id="proof-title" className={styles.sectionTitle}>
                {c.proofTitle}
              </h2>
              <span className={styles.divider} aria-hidden="true" />
            </m.div>

            <div className={styles.proof}>
              {punkteProof.map((card, i) => (
                <m.article key={card.title} className={styles.proofCard} {...reveal(i * 0.1)}>
                  <p className={styles.proofFigure}>{card.figure}</p>
                  <h3 className={styles.proofTitle}>{card.title}</h3>
                  <p className={styles.proofText}>{card.text}</p>
                  <dl className={styles.bars}>
                    {card.rows.map((row, r) => (
                      <div key={row.label} className={styles.barRow}>
                        <dt className={styles.barLabel}>{row.label}</dt>
                        <dd className={styles.barTrack}>
                          <m.span
                            className={styles.barFill}
                            data-tone={row.tone}
                            initial={{ scaleX: calm ? 1 : 0 }}
                            whileInView={{ scaleX: 1 }}
                            viewport={{ once: true, margin: "0px 0px -60px 0px" }}
                            transition={at(0.25 + i * 0.1 + r * 0.15, 1.1)}
                            style={{ width: `${Math.max(6, (row.value / card.max) * 100)}%` }}
                          />
                          <span className={styles.barValue}>{row.display}</span>
                        </dd>
                      </div>
                    ))}
                  </dl>
                  <p className={styles.source}>{card.source}</p>
                </m.article>
              ))}
            </div>
            <p className={styles.proofNote}>{c.proofNote}</p>
          </div>
        </section>

        {/* ---------- Video ---------- */}
        <section className={styles.section} aria-labelledby="video-title">
          <div className="container">
            <m.div className={styles.sectionHead} {...reveal()}>
              <p className={styles.eyebrow}>{c.videoEyebrow}</p>
              <h2 id="video-title" className={styles.sectionTitle}>
                {c.videoTitle}
              </h2>
              <p className={styles.sectionIntro}>{c.videoIntro}</p>
              <span className={styles.divider} aria-hidden="true" />
            </m.div>

            <m.figure className={styles.film} {...reveal(0.1)}>
              {/* Loads nothing until the visitor presses play (mobile data). */}
              <video
                className={styles.video}
                controls
                preload="none"
                playsInline
                poster="/punkte/gleiche-meilen-poster.webp"
                aria-label={c.videoPlay}
                width={1280}
                height={720}
              >
                <source src="/punkte/gleiche-meilen.mp4" type="video/mp4" />
              </video>
              <figcaption className={styles.filmCaption}>{c.videoCaption}</figcaption>
            </m.figure>
          </div>
        </section>

        {/* ---------- How to get it ---------- */}
        <section className={`${styles.section} ${styles.tinted}`} aria-labelledby="steps-title">
          <div className="container">
            <m.div className={styles.sectionHead} {...reveal()}>
              <p className={styles.eyebrow}>{c.stepsEyebrow}</p>
              <h2 id="steps-title" className={styles.sectionTitle}>
                {c.stepsTitle}
              </h2>
              <span className={styles.divider} aria-hidden="true" />
            </m.div>

            <ol className={styles.steps}>
              {c.steps.map((step, i) => (
                <m.li key={step.title} className={styles.step} {...reveal(i * 0.1)}>
                  <span className={styles.stepIndex}>{i + 1}</span>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepText}>{step.text}</p>
                </m.li>
              ))}
            </ol>

            <m.div className={styles.center} {...reveal(0.15)}>
              <Out href={punkte.check} className={styles.primary}>
                {c.heroCta}
                <ArrowUpRight size={15} aria-hidden="true" />
              </Out>
              <p className={styles.smallNote}>{c.stepsNote}</p>
            </m.div>
          </div>
        </section>

        {/* ---------- Das Punkte-System (coming) ---------- */}
        <section className={styles.system} aria-labelledby="system-title">
          <div className="container">
            <m.div className={styles.systemHead} {...reveal()}>
              <p className={styles.systemLabels}>
                <span className={styles.soonBadge}>{c.systemBadge}</span>
                <span className={styles.adLabelInk}>{c.adLabel}</span>
              </p>
              <p className={styles.eyebrowInk}>{c.systemEyebrow}</p>
              <h2 id="system-title" className={styles.systemTitle}>
                {c.systemTitle}
              </h2>
              <p className={styles.systemIntro}>{c.systemIntro}</p>
            </m.div>

            <SystemBundle caption={c.systemPreview} />

            <h3 className={styles.inkSubhead}>{c.waysTitle}</h3>
            <ol className={styles.ways}>
              {c.ways.map((way, i) => {
                const Icon = WAY_ICONS[i];
                return (
                  <m.li key={way.title} className={styles.way} {...reveal(i * 0.07)}>
                    <span className={styles.wayIndex}>Weg {i + 1}</span>
                    <Icon size={26} strokeWidth={1.4} aria-hidden="true" className={styles.wayIcon} />
                    <h4 className={styles.wayTitle}>{way.title}</h4>
                    <p className={styles.wayText}>{way.text}</p>
                  </m.li>
                );
              })}
            </ol>

            <h3 className={styles.inkSubhead}>{c.featuresTitle}</h3>
            <ul className={styles.features}>
              {c.features.map((feature, i) => {
                const Icon = FEATURE_ICONS[i];
                return (
                  <m.li key={feature.title} className={styles.feature} {...reveal(i * 0.06)}>
                    <Icon size={20} strokeWidth={1.5} aria-hidden="true" className={styles.featureIcon} />
                    <span>
                      <span className={styles.featureTitle}>{feature.title}</span>
                      <span className={styles.featureText}>{feature.text}</span>
                    </span>
                  </m.li>
                );
              })}
            </ul>

            <m.div className={styles.soon} {...reveal(0.1)}>
              {punkte.checkout ? (
                <Out href={punkte.checkout} className={styles.goldButton}>
                  {punkte.price ? `${c.systemBuy} · ${punkte.price} €` : c.systemBuy}
                  <ArrowUpRight size={15} aria-hidden="true" />
                </Out>
              ) : (
                <>
                  <p className={styles.soonPlaceholder}>{c.systemSoonLabel}</p>
                  <p className={styles.soonText}>{c.systemSoonText}</p>
                  <div className={styles.soonActions}>
                    <Out href={punkte.check} className={styles.goldButton}>
                      {c.systemMeanwhile}
                      <ArrowUpRight size={15} aria-hidden="true" />
                    </Out>
                    <a
                      href={socialProfiles.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.inkButton}
                    >
                      {c.systemFollow}
                    </a>
                  </div>
                </>
              )}
            </m.div>
          </div>
        </section>

        {/* ---------- Author ---------- */}
        <section className={styles.section} aria-labelledby="author-title">
          <div className={`container ${styles.author}`}>
            <m.div className={styles.portraitFrame} {...reveal()}>
              <Image
                src="/roadmap/atilla.webp"
                alt=""
                width={720}
                height={720}
                sizes="(max-width: 900px) 70vw, 380px"
                className={styles.portrait}
              />
            </m.div>
            <m.div {...reveal(0.12)}>
              <p className={styles.eyebrow}>{c.authorEyebrow}</p>
              <h2 id="author-title" className={styles.sectionTitle}>
                Atilla Barbarossa
              </h2>
              <p className={styles.authorText}>{c.authorText}</p>
              <dl className={styles.stats}>
                <div>
                  <dt>{c.statFollowers}</dt>
                  <dd>{number.format(audience.followers.instagram)}</dd>
                </div>
                <div>
                  <dt>{c.statDach}</dt>
                  <dd>{number.format(audience.dach)} %</dd>
                </div>
              </dl>
            </m.div>
          </div>
        </section>

        {/* ---------- FAQ ---------- */}
        <section className={`${styles.section} ${styles.tinted}`} aria-labelledby="faq-title">
          <div className={`container ${styles.faqWrap}`}>
            <m.div className={styles.sectionHead} {...reveal()}>
              <p className={styles.eyebrow}>{c.faqEyebrow}</p>
              <h2 id="faq-title" className={styles.sectionTitle}>
                {c.faqTitle}
              </h2>
              <span className={styles.divider} aria-hidden="true" />
            </m.div>
            <div className={styles.faq}>
              {c.faq.map((item) => (
                <details key={item.q} className={styles.faqItem}>
                  <summary className={styles.faqQuestion}>
                    {item.q}
                    <Plus size={18} aria-hidden="true" className={styles.faqIcon} />
                  </summary>
                  <p className={styles.faqAnswer}>{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Closing call to action ---------- */}
        <section ref={finalRef} className={styles.final} aria-labelledby="final-title">
          <m.div className={`container ${styles.finalInner}`} {...reveal()}>
            <h2 id="final-title" className={styles.finalTitle}>
              {c.finalTitle}
            </h2>
            <p className={styles.finalText}>{c.finalText}</p>
            <Out href={punkte.check} className={styles.primary}>
              {c.heroCta}
              <ArrowUpRight size={15} aria-hidden="true" />
            </Out>
            <p className={styles.transparency}>{c.transparency}</p>
          </m.div>
        </section>
      </main>

      <div className={styles.bar} data-visible={barVisible} inert={!barVisible}>
        <span className={styles.barText}>{c.barLabel}</span>
        <Out href={punkte.check} className={styles.barButton}>
          {c.barButton}
        </Out>
      </div>

      {/* Imprint and privacy notice must be reachable from every page. */}
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
