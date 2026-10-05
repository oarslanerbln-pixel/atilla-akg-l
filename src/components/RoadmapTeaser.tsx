"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import ed from "./editorial.module.css";
import styles from "./RoadmapTeaser.module.css";
import { useLanguage } from "@/context/LanguageContext";
import { usePrefersCalm } from "@/hooks/usePrefersCalm";
import { fill } from "@/i18n/format";
import { roadmap, roadmapPath } from "@/lib/roadmap";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * The e-book, on the home page.
 *
 * It used to be one word in the footer, so neither a visitor nor a crawler
 * met it on the way down. This section shows the cover, says what the book
 * is in a sentence and leads to /roadmap, which does the selling; the link is
 * plain HTML, so search engines follow it from the strongest page of the site.
 * The free excerpt goes straight to its Tentary checkout: it costs nothing,
 * and asking for it is already a step towards the book.
 *
 * Placed after the Instagram films: whoever has just watched them is the
 * reader the book is written for.
 */
export default function RoadmapTeaser() {
  const { t, activeLang } = useLanguage();
  const calm = usePrefersCalm();

  const reveal = (delay = 0) => ({
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: calm ? { duration: 0 } : { duration: 0.8, ease: EASE, delay },
  });

  return (
    <section id="ebook" className={`${ed.section} ${styles.section}`} aria-labelledby="ebook-title">
      <div className={`container ${styles.grid}`}>
        <motion.div className={styles.coverFrame} {...reveal()}>
          <Image
            src="/roadmap/cover.webp"
            alt={t("rm_cover_alt")}
            width={960}
            height={1500}
            sizes="(max-width: 900px) 55vw, 320px"
            className={styles.cover}
          />
        </motion.div>

        <motion.div {...reveal(0.12)}>
          <p className={ed.eyebrow}>{t("ebook_eyebrow")}</p>
          <h2 id="ebook-title" className={ed.title}>
            {t("ebook_title_1")}{" "}
            <span className={styles.titleSoft}>{t("ebook_title_2")}</span>
          </h2>
          <p className={styles.lead}>{t("ebook_lead")}</p>
          <p className={styles.meta}>{fill(t("ebook_meta"), { price: roadmap.price })}</p>

          <div className={styles.actions}>
            <Link href={roadmapPath(activeLang)} className={ed.primary}>
              {t("ebook_cta")}
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
            <a href={roadmap.sample} target="_blank" rel="noopener noreferrer" className={ed.textLink}>
              {t("rm_sample_cta")}
              <ArrowUpRight size={15} aria-hidden="true" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
