"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import AnimatedCounter from "./AnimatedCounter";
import { audience, socialProfiles } from "@/lib/site";
import type { TranslationKeys } from "@/i18n/translations";
import { useLanguage } from "@/context/LanguageContext";
import { usePrefersCalm } from "@/hooks/usePrefersCalm";
import { useSoundDesign } from "@/hooks/useSoundDesign";
import ed from "./editorial.module.css";
import styles from "./Stats.module.css";

const EASE = [0.16, 1, 0.3, 1] as const;

type Figure = { value: ReactNode; label: string; href?: string };

/**
 * Whom the films reach, set like the figures page of a printed media kit:
 * the accounts reached large beside the heading, then three ruled rows of
 * three — reach per format, the audience, the profiles. Every figure is read
 * from `audience` in lib/site.ts; the counters carry the real value in the
 * server HTML.
 */
export default function Stats() {
  const { t } = useLanguage();
  const calm = usePrefersCalm();
  const { playClickSound } = useSoundDesign();

  const reveal = (delay = 0) => ({
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: calm ? { duration: 0 } : { duration: 0.9, ease: EASE, delay },
  });

  const rows: { label: TranslationKeys; figures: Figure[] }[] = [
    {
      label: "stats_reach_title",
      figures: [
        { value: <AnimatedCounter to={audience.average.reels / 1000} suffix="K+" />, label: t("stats_reach_reels") },
        { value: <AnimatedCounter to={audience.average.story / 1000} suffix="K+" />, label: t("stats_reach_story") },
        { value: <AnimatedCounter to={audience.average.post / 1000} suffix="K+" />, label: t("stats_reach_post") },
      ],
    },
    {
      label: "stats_demo_title",
      figures: [
        { value: <AnimatedCounter to={audience.age25to54} suffix="%" />, label: t("stat_age") },
        { value: <AnimatedCounter to={audience.dach} suffix="%" />, label: t("stat_region") },
        { value: <AnimatedCounter to={audience.female} suffix="%" />, label: t("stat_gender") },
      ],
    },
    {
      label: "social_follower",
      figures: [
        {
          value: <AnimatedCounter to={audience.followers.instagram / 1000} suffix=" K" />,
          label: "Instagram",
          href: socialProfiles.instagram,
        },
        {
          value: <AnimatedCounter to={audience.followers.tiktok / 1000} suffix=" K" />,
          label: "TikTok",
          href: socialProfiles.tiktok,
        },
        {
          value: <AnimatedCounter to={audience.followers.youtube / 1000} suffix=" K" />,
          label: "YouTube",
          href: socialProfiles.youtube,
        },
      ],
    },
  ];

  return (
    <section id="stats" className={`${ed.section} ${ed.chapter} ${ed.ink} ${styles.section}`} aria-labelledby="stats-title">
      <div className="container">
        <motion.div className={ed.headSplit} {...reveal()}>
          <div>
            <p className={ed.eyebrow}>{t("nav_stats")}</p>
            <h2 id="stats-title" className={ed.title}>
              {t("stats_title")}
            </h2>
          </div>
          <p className={styles.lead}>
            <span className={`${ed.figureValue} ${ed.figureLarge}`}>
              <AnimatedCounter
                to={audience.accountsReached / 1_000_000}
                decimals={1}
                suffix={t("stats_million_suffix")}
              />
            </span>
            <span className={ed.figureLabel}>{t("stats_reach_accounts")}</span>
          </p>
        </motion.div>

        <div className={styles.ledger}>
          {rows.map((row, i) => (
            <motion.div key={row.label} className={styles.row} {...reveal(i * 0.1)}>
              <h3 className={styles.rowLabel}>{t(row.label)}</h3>
              <ul className={styles.figures}>
                {row.figures.map((figure) => {
                  const body = (
                    <>
                      <span className={`${ed.figureValue} ${styles.value}`}>{figure.value}</span>
                      <span className={`${ed.figureLabel} ${styles.label}`}>
                        {figure.label}
                        {figure.href && <ArrowUpRight size={12} aria-hidden="true" />}
                      </span>
                    </>
                  );
                  return (
                    <li key={figure.label} className={styles.figure}>
                      {figure.href ? (
                        <a
                          href={figure.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.link}
                          data-cursor={figure.label.toUpperCase()}
                          onClick={() => playClickSound()}
                        >
                          {body}
                        </a>
                      ) : (
                        body
                      )}
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
