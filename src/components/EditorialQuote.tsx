"use client";

import React from "react";
import { motion } from "framer-motion";
import styles from "./EditorialQuote.module.css";

export default function EditorialQuote() {
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
          Authentisches Storytelling entsteht dort, wo <span className={styles.quoteHighlight}>visuelle Perfektion</span> auf echte menschliche Emotionen trifft.
        </blockquote>
        <div className={styles.authorWrapper}>
          <span className={styles.authorName}>Atilla BARBAROSSA</span>
          <span className={styles.authorRole}>CREATIVE DIRECTOR & FILMMAKER</span>
        </div>
      </motion.div>
    </section>
  );
}
