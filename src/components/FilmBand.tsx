"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import ed from "./editorial.module.css";
import styles from "./FilmBand.module.css";
import InViewVideo from "./InViewVideo";
import { useLanguage } from "@/context/LanguageContext";
import { usePrefersCalm } from "@/hooks/usePrefersCalm";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * A breath of footage between the chapters: one wide clip, edge to edge, with
 * a single line over it. The clip is the first project's, so a visitor who
 * goes on to the projects downloads nothing twice. It plays only while on
 * screen and not at all for calm visitors, who keep the poster; the slow
 * settle of the frame on scroll is skipped for them too.
 */
export default function FilmBand() {
  const { t } = useLanguage();
  const calm = usePrefersCalm();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1.14, 1]);

  const reveal = (delay: number) => ({
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: calm ? { duration: 0 } : { duration: 1.1, ease: EASE, delay },
  });

  return (
    <section ref={ref} className={`${ed.ink} ${styles.band}`} aria-labelledby="film-band-line">
      <motion.div className={styles.media} style={calm ? undefined : { scale }}>
        <InViewVideo src="/hero-reel.mp4" poster="/posters/hero-reel.webp" className={styles.video} />
      </motion.div>
      <div className={`container ${styles.copy}`}>
        <motion.p className={ed.eyebrow} {...reveal(0)}>
          {t("film_band_label")}
        </motion.p>
        <motion.p id="film-band-line" className={styles.line} {...reveal(0.12)}>
          {t("film_band_line")}
        </motion.p>
        <motion.div {...reveal(0.24)}>
          <a href="#work" className={ed.textLink}>
            {t("film_band_cta")}
          </a>
        </motion.div>
      </div>
    </section>
  );
}
