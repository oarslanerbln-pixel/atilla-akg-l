"use client";

import React from "react";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import ed from "./editorial.module.css";
import styles from "./Partners.module.css";
import { useLanguage } from "@/context/LanguageContext";
import { usePrefersCalm } from "@/hooks/usePrefersCalm";
import { BASE, bearing, formatCoords, partners } from "@/lib/partners";

const LOCALE = { DE: "de", EN: "en", TR: "tr" } as const;
const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Tourism boards and institutions — the proof a destination client looks for
 * first.
 *
 * These names used to scroll past in the brand marquee with no context, mixed
 * in with a razor brand and an airport. A tourism board deciding whether to
 * brief a creator wants to see which other boards already have, so they get a
 * section of their own, placed straight after the introduction.
 *
 * Every name stays on the page as real text, logo or not. The intro sentence
 * lists them all in plain language because that is the form answer engines
 * quote from; the list is joined per locale ("A, B und C" / "A, B and C" /
 * "A, B ve C") rather than hard-coded into three translations that would drift
 * the day a partner is added.
 *
 * Each card is a small destination plate: an index, the coordinates of the
 * capital (or headquarters), and a compass needle that turns to the real
 * bearing from Berlin — the brand's mark put to work, and a true detail rather
 * than ornament. The motion is slow and settles; nothing bounces. A visitor
 * who asked for less motion gets the finished cards, needles already set.
 */
export default function Partners() {
  const { t, activeLang } = useLanguage();
  const calm = usePrefersCalm();
  const names = new Intl.ListFormat(LOCALE[activeLang], { type: "conjunction" }).format(
    partners.map((partner) => partner.name),
  );
  const [introBefore, introAfter] = t("partners_intro").split("{partners}");

  // When any tile carries a "view the work" line, every tile reserves its
  // height — otherwise linked and unlinked tiles centre differently and the
  // row of region labels breaks. With no links at all, nothing is reserved.
  const anyLinks = partners.some((partner) => partner.url);

  // Variants are rebuilt each render, so they pick up the calm preference once
  // it is known on the client; the reveal only fires later, on scroll.
  const quick = { duration: 0 };
  const wrapVariants: Variants = { hidden: {}, visible: {} };
  const listVariants: Variants = {
    hidden: {},
    visible: { transition: calm ? {} : { staggerChildren: 0.09, delayChildren: 0.35 } },
  };
  const frameVariants: Variants = {
    hidden: { scaleX: 0 },
    visible: { scaleX: 1, transition: calm ? quick : { duration: 0.9, ease: EASE } },
  };
  // The card wipes up from its lower edge, like a plate sliding into a frame.
  const tileVariants: Variants = {
    hidden: { clipPath: "inset(100% 0% 0% 0%)" },
    visible: { clipPath: "inset(0% 0% 0% 0%)", transition: calm ? quick : { duration: 0.9, ease: EASE } },
  };
  const nameVariants: Variants = {
    hidden: { y: "105%" },
    visible: { y: "0%", transition: calm ? quick : { duration: 0.9, ease: EASE, delay: 0.15 } },
  };
  const metaVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: calm ? quick : { duration: 0.8, ease: EASE, delay: 0.4 } },
  };
  const needleVariants: Variants = {
    hidden: { rotate: 0 },
    visible: (deg: number) => ({
      rotate: deg,
      transition: calm ? quick : { duration: 1.4, ease: EASE, delay: 0.45 },
    }),
  };

  // A soft gold light follows the pointer across the card. Only the position
  // is written here; whether it shows is left to CSS (:hover on real pointers).
  const trackPointer = (event: React.PointerEvent<HTMLElement>) => {
    if (event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--my", `${event.clientY - rect.top}px`);
  };

  return (
    <section
      id="partners"
      className={`${ed.section} ${ed.chapter} ${styles.section}`}
      aria-labelledby="partners-title"
    >
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={calm ? quick : { duration: 0.9, ease: EASE }}
          className={ed.headSplit}
        >
          <div>
            <p className={ed.eyebrow}>{t("partners_subtitle")}</p>
            <h2 id="partners-title" className={ed.title}>
              {t("partners_title")}
            </h2>
          </div>
          <p className={ed.lede}>
            {introBefore}
            {names}
            {introAfter}
          </p>
        </motion.div>

        <motion.div
          className={styles.gridWrap}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={wrapVariants}
        >
          {/* The frame's top and bottom rules draw in before the cards arrive. */}
          <motion.span className={`${styles.frameLine} ${styles.frameTop}`} variants={frameVariants} aria-hidden="true" />
          <motion.span className={`${styles.frameLine} ${styles.frameBottom}`} variants={frameVariants} aria-hidden="true" />

          <motion.ul className={styles.grid} variants={listVariants}>
            {partners.map((partner, index) => {
              const deg = bearing(BASE, partner.coords);
              const body = (
                <>
                  <span className={styles.spot} aria-hidden="true" />

                  <span className={styles.plateTop} aria-hidden="true">
                    <motion.span className={styles.index} variants={metaVariants}>
                      {String(index + 1).padStart(2, "0")}
                    </motion.span>
                    <motion.span className={styles.needle} variants={needleVariants} custom={deg}>
                      <span className={styles.needleTurn}>
                        <svg viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10.5" stroke="currentColor" strokeWidth="0.8" opacity="0.35" />
                          <polygon points="12,3.2 14.1,12 9.9,12" fill="var(--accent-gold)" />
                          <polygon points="12,20.8 14.1,12 9.9,12" fill="currentColor" opacity="0.45" />
                        </svg>
                      </span>
                    </motion.span>
                  </span>

                  {/* Fixed-height box, so a logo with its caption and a name set
                      as type occupy the same space and the labels below align. */}
                  <span className={styles.mark}>
                    <span className={styles.lift}>
                      <span className={styles.maskLine}>
                        <motion.span className={styles.maskInner} variants={nameVariants}>
                          {partner.logo ? (
                            <>
                              {/* Decorative: the name is printed right beneath it. */}
                              <Image
                                src={partner.logo.src}
                                width={partner.logo.width}
                                height={partner.logo.height}
                                alt=""
                                className={styles.logo}
                                unoptimized
                              />
                              <span className={styles.caption}>{partner.name}</span>
                            </>
                          ) : (
                            <span className={styles.wordmark}>{partner.name}</span>
                          )}
                        </motion.span>
                      </span>
                    </span>
                  </span>

                  <motion.span className={styles.region} variants={metaVariants}>
                    {t(partner.region)}
                  </motion.span>

                  {partner.url ? (
                    <span className={styles.more}>
                      {t("partners_view")}
                      <ArrowUpRight size={13} aria-hidden="true" />
                    </span>
                  ) : (
                    anyLinks && (
                      <span className={`${styles.more} ${styles.reserved}`} aria-hidden="true">
                        {t("partners_view")}
                        <ArrowUpRight size={13} />
                      </span>
                    )
                  )}

                  <motion.span className={styles.coords} variants={metaVariants} aria-hidden="true">
                    {formatCoords(partner.coords)}
                  </motion.span>

                  <span className={styles.underline} aria-hidden="true" />
                </>
              );

              return (
                <li key={partner.name} className={styles.cell}>
                  {partner.url ? (
                    <motion.a
                      href={partner.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.tile}
                      data-cursor="VIEW"
                      variants={tileVariants}
                      onPointerMove={trackPointer}
                    >
                      {body}
                    </motion.a>
                  ) : (
                    <motion.div className={styles.tile} variants={tileVariants} onPointerMove={trackPointer}>
                      {body}
                    </motion.div>
                  )}
                </li>
              );
            })}
          </motion.ul>
        </motion.div>
      </div>
    </section>
  );
}
