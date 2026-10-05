"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import ed from "./editorial.module.css";
import styles from "./Faq.module.css";
import { useLanguage } from "@/context/LanguageContext";
import { usePrefersCalm } from "@/hooks/usePrefersCalm";
import { faq, type FaqEntry } from "@/lib/faq";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Frequently asked questions — who Atilla is, who he has worked with, what
 * the audience looks like, what a collaboration involves.
 *
 * The rest of the page says these things in fragments: a counter here, a
 * name in a marquee there. Answer engines quote sentences, so this section
 * says them once more as whole answers, each naming Atilla so it stands on
 * its own when lifted out. The text comes from lib/faq.ts, which also feeds
 * the FAQPage structured data.
 *
 * Each question is a native <details>: a real control, reachable and
 * operable by keyboard with nothing to wire up, and the answers stay in the
 * HTML while closed, so a crawler reads all of them. Only the heading
 * reveals on scroll; the list is there, visible, from the first paint.
 */
export default function Faq() {
  const { t, activeLang } = useLanguage();
  const calm = usePrefersCalm();
  const entries = faq(activeLang);

  const reveal = {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: calm ? { duration: 0 } : { duration: 0.9, ease: EASE },
  };

  const renderAnswer = ({ answer, linkText, href }: FaqEntry) => {
    const [before, after] = answer.split("{link}");
    if (after === undefined) return answer;
    return (
      <>
        {before}
        <Link href={href} className={styles.inlineLink}>
          {linkText}
        </Link>
        {after}
      </>
    );
  };

  return (
    <section id="faq" className={`${ed.section} ${ed.chapter} ${styles.section}`} aria-labelledby="faq-title">
      {/* Two columns, as a kit sets its questions: the head stays in view
          on the left while the list runs down the right. */}
      <div className={`container ${styles.layout}`}>
        <motion.div className={styles.head} {...reveal}>
          <p className={ed.eyebrow}>{t("faq_eyebrow")}</p>
          <h2 id="faq-title" className={ed.title}>
            {t("faq_title")}
          </h2>
        </motion.div>

        <ul className={styles.list}>
          {entries.map((entry, i) => (
            <li key={entry.question} className={styles.item}>
              <details className={styles.details}>
                <summary className={styles.summary}>
                  <span className={styles.index} aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className={styles.question}>{entry.question}</h3>
                  <Plus className={styles.icon} size={18} aria-hidden="true" />
                </summary>
                <p className={styles.answer}>{renderAnswer(entry)}</p>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
