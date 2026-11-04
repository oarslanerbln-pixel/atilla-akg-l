"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useIntroDone } from "@/hooks/useIntroDone";
import { BOOK_COVER } from "@/components/roadmap/BookCover";
import { roadmapPath } from "@/lib/roadmap";
import styles from "./HeroEbookNote.module.css";

const EASE = [0.16, 1, 0.3, 1] as const;
const DISMISSED_KEY = "atilla_ebook_note_dismissed";
/** Long enough for the hero's own opening to land first. */
const ARRIVE_AFTER_MS = 2200;

function wasDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISSED_KEY) !== null;
  } catch {
    return false;
  }
}

/**
 * A quiet announcement of the e-book under the header, in the hero: the cover in
 * miniature, its name and a link to /roadmap. It arrives a moment after the
 * hero's opening, so the name and the largest text are never upstaged, and
 * it is never in the server HTML, so it cannot be the page's Largest
 * Contentful Paint. Dismissed once, it stays away for that visitor
 * (localStorage, a per-visitor convenience); the e-book section further
 * down is unaffected.
 *
 * It sits inside the hero and scrolls away with it, so it never covers the
 * contact section or the footer.
 */
export default function HeroEbookNote() {
  const { t, activeLang } = useLanguage();
  const introDone = useIntroDone();
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!introDone || wasDismissed()) return;
    const timer = window.setTimeout(() => setShown(true), ARRIVE_AFTER_MS);
    return () => window.clearTimeout(timer);
  }, [introDone]);

  const dismiss = () => {
    setShown(false);
    try {
      localStorage.setItem(DISMISSED_KEY, "true");
    } catch {
      // Private mode: it simply comes back on the next visit.
    }
  };

  return (
    <AnimatePresence>
      {shown && (
        <motion.aside
          className={styles.note}
          aria-label={t("ebook_note_label")}
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10, transition: { duration: 0.35, ease: EASE } }}
          transition={{ duration: 0.9, ease: EASE }}
        >
          <Link href={roadmapPath(activeLang)} className={styles.link}>
            <span className={styles.thumb}>
              <Image src={BOOK_COVER.src} alt="" width={BOOK_COVER.width} height={BOOK_COVER.height} sizes="48px" />
            </span>
            <span className={styles.text}>
              <span className={styles.eyebrow}>{t("ebook_note_eyebrow")}</span>
              <span className={styles.title}>{t("rm_sticky_label")}</span>
              <span className={styles.line}>{t("ebook_note_line")}</span>
              <span className={styles.cta}>
                {t("ebook_note_cta")}
                <ArrowRight size={13} aria-hidden="true" />
              </span>
            </span>
          </Link>
          <button type="button" className={styles.close} onClick={dismiss} aria-label={t("ebook_note_close")}>
            <X size={14} aria-hidden="true" />
          </button>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
