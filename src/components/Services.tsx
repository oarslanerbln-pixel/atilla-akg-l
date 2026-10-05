"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import ed from "./editorial.module.css";
import styles from "./Services.module.css";
import { useLanguage } from "@/context/LanguageContext";
import type { TranslationKeys } from "@/i18n/translations";
import { useSoundDesign } from "@/hooks/useSoundDesign";
import { usePrefersCalm } from "@/hooks/usePrefersCalm";
import { pagePath } from "@/lib/locales";

const EASE = [0.16, 1, 0.3, 1] as const;

export default function Services() {
  const { t, activeLang } = useLanguage();
  const { playClickSound } = useSoundDesign();
  const calm = usePrefersCalm();

  const reveal = (delay = 0) => ({
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: calm ? { duration: 0 } : { duration: 0.9, ease: EASE, delay },
  });

  // One column per kind of client, each in their own terms: the problem they
  // bring (one line, no alarmism), what the films do about it, and what they
  // actually receive. Generic capability lists spoke to nobody in particular.
  const segments: {
    forKey: TranslationKeys;
    titleKey: TranslationKeys;
    painKey: TranslationKeys;
    descKey: TranslationKeys;
    deliverables: TranslationKeys[];
  }[] = [
    {
      forKey: "service_hotels_for",
      titleKey: "service_hotels_title",
      painKey: "service_hotels_pain",
      descKey: "service_hotels_desc",
      deliverables: ["service_hotels_d1", "service_hotels_d2", "service_hotels_d3"],
    },
    {
      forKey: "service_dmo_for",
      titleKey: "service_dmo_title",
      painKey: "service_dmo_pain",
      descKey: "service_dmo_desc",
      deliverables: ["service_dmo_d1", "service_dmo_d2", "service_dmo_d3"],
    },
    {
      forKey: "service_brands_for",
      titleKey: "service_brands_title",
      painKey: "service_brands_pain",
      descKey: "service_brands_desc",
      deliverables: ["service_brands_d1", "service_brands_d2", "service_brands_d3"],
    },
  ];

  return (
    <section id="services" className={`${ed.section} ${ed.chapter} ${styles.section}`} aria-labelledby="services-title">
      <div className="container">
        <motion.div className={ed.head} {...reveal()}>
          <p className={ed.eyebrow}>{t("services_subtitle")}</p>
          <h2 id="services-title" className={ed.title}>
            {t("services_title")}
          </h2>
        </motion.div>

        {/* Three columns between hairlines, as on the offer page of a printed
            kit: no cards, no icons, the words carry it. */}
        <ol className={styles.columns}>
          {segments.map((segment, i) => (
            <motion.li key={segment.forKey} className={styles.column} {...reveal(i * 0.1)}>
              <p className={styles.for}>
                <span className={ed.index}>{String(i + 1).padStart(2, "0")}</span>
                {t(segment.forKey)}
              </p>
              <h3 className={styles.name}>{t(segment.titleKey)}</h3>
              <p className={styles.pain}>{t(segment.painKey)}</p>
              <p className={styles.desc}>{t(segment.descKey)}</p>
              <ul className={styles.deliverables}>
                {segment.deliverables.map((key) => (
                  <li key={key}>{t(key)}</li>
                ))}
              </ul>
              <a
                href="#contact"
                className={`${ed.textLink} ${styles.inquire}`}
                onClick={() => playClickSound()}
                data-cursor="INQUIRE"
              >
                {t("services_btn")}
                <ArrowUpRight size={14} aria-hidden="true" />
              </a>
            </motion.li>
          ))}
        </ol>

        <motion.div className={styles.note} {...reveal(0.2)}>
          <p className={styles.disclaimer}>{t("services_disclaimer")}</p>
          {/* The monthly packages have a page of their own; this is the one
              path to it from the portfolio, in the language on screen. */}
          <Link
            href={pagePath("socialMedia", activeLang)}
            className={ed.primary}
            onClick={() => playClickSound()}
          >
            {t("services_packages_link")}
            <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
