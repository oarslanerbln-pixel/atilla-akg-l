"use client";

import React from "react";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import styles from "./Partners.module.css";
import { useLanguage } from "@/context/LanguageContext";
import { partners } from "@/lib/partners";

const LOCALE = { DE: "de", EN: "en", TR: "tr" } as const;

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
 */
export default function Partners() {
  const { t, activeLang } = useLanguage();

  const names = new Intl.ListFormat(LOCALE[activeLang], { type: "conjunction" }).format(
    partners.map((partner) => partner.name),
  );
  const [introBefore, introAfter] = t("partners_intro").split("{partners}");

  // When any tile carries a "view the work" line, every tile reserves its
  // height — otherwise linked and unlinked tiles centre differently and the
  // row of region labels breaks. With no links at all, nothing is reserved.
  const anyLinks = partners.some((partner) => partner.url);

  const listVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
  };
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <section id="partners" className={styles.section} aria-labelledby="partners-title">
      <div className={`container ${styles.container}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className={styles.header}
        >
          <p className={styles.subtitle}>{t("partners_subtitle")}</p>
          <h2 id="partners-title" className={styles.title}>
            {t("partners_title")}
          </h2>
          <div className={styles.divider} />
          <p className={styles.intro}>
            {introBefore}
            {names}
            {introAfter}
          </p>
        </motion.div>

        <motion.ul
          className={styles.grid}
          variants={listVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {partners.map((partner) => {
            const body = (
              <>
                {/* Fixed-height box, so a logo with its caption and a name set
                    as type occupy the same space and the labels below align. */}
                <span className={styles.mark}>
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
                </span>
                <span className={styles.region}>{t(partner.region)}</span>
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
              </>
            );

            return (
              <motion.li key={partner.name} variants={itemVariants} className={styles.cell}>
                {partner.url ? (
                  <a
                    href={partner.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.tile}
                    data-cursor="VIEW"
                  >
                    {body}
                  </a>
                ) : (
                  <div className={styles.tile}>{body}</div>
                )}
              </motion.li>
            );
          })}
        </motion.ul>
      </div>
    </section>
  );
}
