"use client";

import React from "react";
import { motion } from "framer-motion";
import styles from "./EditorialQuote.module.css";

import { useLanguage } from "@/context/LanguageContext";

export default function EditorialQuote() {
  const { t } = useLanguage();

  return (
    <section className={styles.section}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className={styles.quoteContainer}
      >
        <span className={styles.goldQuoteIcon}>“</span>
        <blockquote className={styles.quoteText}>
          {t('quote_text')}
        </blockquote>
        <div className={styles.authorWrapper}>
          <span className={styles.authorName}>{t('quote_author')}</span>
          <span className={styles.authorRole}>{t('quote_role')}</span>
        </div>
      </motion.div>
    </section>
  );
}
