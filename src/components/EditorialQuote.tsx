"use client";

import { motion } from "framer-motion";
import BrandMark from "@/components/BrandMark";
import styles from "./EditorialQuote.module.css";
import { useLanguage } from "@/context/LanguageContext";
import { usePrefersCalm } from "@/hooks/usePrefersCalm";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * The one ink page in the run of chapters: the line he works by, set large,
 * signed with the compass the way /media-kit closes its statement.
 */
export default function EditorialQuote() {
  const { t } = useLanguage();
  const calm = usePrefersCalm();

  return (
    <section className={styles.section}>
      <motion.figure
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={calm ? { duration: 0 } : { duration: 0.9, ease: EASE }}
        className={`container ${styles.figure}`}
      >
        <BrandMark className={styles.mark} />
        <blockquote className={styles.quote}>
          <p>{t("quote_text")}</p>
        </blockquote>
        <figcaption className={styles.author}>
          <span className={styles.authorName}>{t("quote_author")}</span>
          <span className={styles.authorRole}>{t("quote_role")}</span>
        </figcaption>
      </motion.figure>
    </section>
  );
}
