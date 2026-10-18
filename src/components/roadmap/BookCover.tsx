"use client";

import { useRef } from "react";
import Image from "next/image";
import { useInView } from "framer-motion";
import BrandMark from "@/components/BrandMark";
import { useLanguage } from "@/context/LanguageContext";
import { usePrefersCalm } from "@/hooks/usePrefersCalm";
import type { TranslationKeys } from "@/i18n/translations";
import styles from "./BookCover.module.css";

/** The cover file's intrinsic size; the share card and structured data use it too. */
export const BOOK_COVER = { src: "/roadmap/book-cover.webp", width: 1000, height: 1600 } as const;

const CHAPTERS = [1, 2, 3] as const;

/**
 * The Travel Creator Roadmap as a hardback that opens.
 *
 * Closed, it is the cover artwork with a spine crease, a page block and a
 * cast shadow, all CSS around the one image. Once most of it is on screen
 * the cover swings open, once, and stays open: inside the cover a short
 * note from Atilla, on the first page the three parts of the book (the same
 * titles the /roadmap page lists, so the book never promises a chapter it
 * does not have). Where the book is too narrow for two legible pages (a
 * container query, not a viewport width), the cover swings away and the
 * contents page is left on its own.
 *
 * Calm visitors (reduced motion, reduced data) see it open, without the
 * movement. The pages are real text, so they are read with or without it.
 */
export default function BookCover({
  alt,
  sizes,
  priority = false,
  delay = 0,
}: {
  alt: string;
  sizes: string;
  priority?: boolean;
  /** Seconds to wait once in view, so an opening entrance can land first. */
  delay?: number;
}) {
  const { t } = useLanguage();
  const calm = usePrefersCalm();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const open = calm || inView;

  return (
    <div
      ref={ref}
      className={styles.book}
      data-open={open || undefined}
      data-calm={calm || undefined}
      style={{ "--open-delay": `${delay}s` } as React.CSSProperties}
    >
      <div className={styles.stage}>
        <div className={styles.spread}>
          <span className={styles.pages} aria-hidden="true" />

          <div className={`${styles.page} ${styles.contents}`}>
            <p className={styles.pageLabel}>{t("book_contents")}</p>
            <ol className={styles.chapters}>
              {CHAPTERS.map((n) => (
                <li key={n}>
                  <span className={styles.chapterNo}>{String(n).padStart(2, "0")}</span>
                  <span>{t(`rm_inside_${n}_t` as TranslationKeys)}</span>
                </li>
              ))}
            </ol>
            <p className={styles.colophon}>
              <BrandMark className={styles.mark} />
              {t("rm_sticky_label")}
            </p>
          </div>

          <div className={styles.cover}>
            <div className={styles.front}>
              <Image
                src={BOOK_COVER.src}
                alt={alt}
                width={BOOK_COVER.width}
                height={BOOK_COVER.height}
                priority={priority}
                sizes={sizes}
                className={styles.image}
              />
              <span className={styles.spine} aria-hidden="true" />
            </div>
            <div className={`${styles.page} ${styles.back}`}>
              <p className={styles.pageLabel}>{t("book_note_label")}</p>
              <p className={styles.note}>{t("book_note")}</p>
              <p className={styles.signature}>{t("book_note_sign")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
