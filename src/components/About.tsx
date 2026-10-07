"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import BrandMark from "@/components/BrandMark";
import { useLanguage } from "@/context/LanguageContext";
import { usePrefersCalm } from "@/hooks/usePrefersCalm";
import ed from "./editorial.module.css";
import styles from "./About.module.css";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * The person behind the camera, straight after the hero: the portrait, the
 * philosophy in his own words, and a signature with the brand mark, as on
 * /media-kit. The figures that used to share this section have one of their
 * own (Stats), so the text can be read rather than squeezed beside cards.
 */
export default function About() {
  const { t } = useLanguage();
  const calm = usePrefersCalm();

  const at = (delay: number, duration: number) => (calm ? { duration: 0 } : { duration, ease: EASE, delay });

  return (
    <section id="about" className={`${ed.section} ${ed.chapter} ${styles.section}`} aria-labelledby="about-title">
      <div className={`container ${styles.inner}`}>
        {/* Footage and portraits open like a curtain rising. */}
        <motion.div
          className={styles.portrait}
          initial={{ clipPath: "inset(0 0 100% 0)" }}
          whileInView={{ clipPath: "inset(0 0 0% 0)" }}
          viewport={{ once: true, margin: "-80px" }}
          transition={at(0, 1.4)}
        >
          <Image
            src="/roadmap/atilla.webp"
            alt={t("mk_about_alt")}
            fill
            sizes="(max-width: 900px) 100vw, 460px"
            className={styles.portraitImage}
          />
        </motion.div>

        <motion.div
          className={styles.body}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={at(0.15, 0.9)}
        >
          <p className={ed.eyebrow}>{t("stats_about_subtitle")}</p>
          <h2 id="about-title" className={ed.title}>
            {t("stats_about_title")}
          </h2>
          <div className={styles.text}>
            <p>{t("stats_about_p1")}</p>
            <p>{t("stats_about_p2")}</p>
            <p>{t("stats_about_p3")}</p>
          </div>
          <p className={ed.signature}>
            <BrandMark className={ed.signatureMark} />
            <span className={ed.signatureName}>Atilla Barbarossa</span>
            <span className={ed.signatureRole}>{t("quote_role")}</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
