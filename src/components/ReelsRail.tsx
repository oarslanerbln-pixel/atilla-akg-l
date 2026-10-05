"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, X } from "lucide-react";
import ed from "./editorial.module.css";
import styles from "./ReelsRail.module.css";
import { useLanguage } from "@/context/LanguageContext";
import { HTML_LANG } from "@/lib/locales";
import type { Reel } from "@/lib/reels/manifest";
import { useSoundDesign } from "@/hooks/useSoundDesign";
import { useScrollLock } from "@/hooks/useScrollLock";
import { usePrefersCalm } from "@/hooks/usePrefersCalm";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * One card: the poster only. The film itself loads when the card is opened,
 * because every byte of video counts against the Blob store's monthly
 * transfer, and a hover preview would spend it on visitors who only browse.
 */
function ReelCard({
  reel,
  date,
  onOpen,
}: {
  reel: Reel;
  date: string;
  onOpen: (trigger: HTMLButtonElement) => void;
}) {
  const { t } = useLanguage();

  return (
    <li className={styles.card}>
      <button
        type="button"
        className={styles.cardTrigger}
        data-cursor="PLAY"
        onClick={(event) => onOpen(event.currentTarget)}
      >
        <Image
          src={reel.posterUrl}
          alt=""
          fill
          sizes="(max-width: 768px) 62vw, 270px"
          className={styles.poster}
        />
        <span className={styles.playBadge} aria-hidden="true">
          <Play size={14} fill="currentColor" />
        </span>
        <span className={styles.caption}>
          {reel.title && <span className={styles.cardTitle}>{reel.title}</span>}
          <time className={styles.cardDate} dateTime={reel.postedAt}>
            {date}
          </time>
        </span>
        <span className={styles.srOnly}>{t("reels_watch")}</span>
      </button>
    </li>
  );
}

export default function ReelsRail({ reels }: { reels: Reel[] }) {
  const { t, activeLang } = useLanguage();
  const { playClickSound } = useSoundDesign();
  const calm = usePrefersCalm();

  // Fixed time zone, so the server and the browser print the same day.
  const dateFormat = new Intl.DateTimeFormat(HTML_LANG[activeLang], {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Berlin",
  });

  const railRef = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });

  const updateEdges = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    setEdges({
      start: rail.scrollLeft <= 4,
      end: rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 4,
    });
  }, []);

  // Fires once on observe as well, which sets the initial state.
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const observer = new ResizeObserver(updateEdges);
    observer.observe(rail);
    return () => observer.disconnect();
  }, [updateEdges]);

  const scrollRail = (direction: 1 | -1) => {
    const rail = railRef.current;
    rail?.scrollBy({ left: direction * rail.clientWidth * 0.8, behavior: calm ? "auto" : "smooth" });
  };

  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const isOpen = openIndex !== null;
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const open = (index: number, trigger: HTMLButtonElement) => {
    playClickSound();
    lastTriggerRef.current = trigger;
    setOpenIndex(index);
  };

  const close = useCallback(() => {
    playClickSound();
    setOpenIndex(null);
    lastTriggerRef.current?.focus();
  }, [playClickSound]);

  const step = useCallback(
    (direction: 1 | -1) =>
      setOpenIndex((index) => (index === null ? index : (index + direction + reels.length) % reels.length)),
    [reels.length],
  );

  useScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return;
    closeRef.current?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      // On the focused player the arrows seek; leave them to it.
      if (event.target instanceof HTMLVideoElement) return;
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, close, step]);

  const active = openIndex === null ? null : reels[openIndex];

  return (
    <section id="reels" className={`${ed.section} ${ed.chapter} ${styles.section}`} aria-labelledby="reels-title">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={calm ? { duration: 0 } : { duration: 0.9, ease: EASE }}
          className={ed.head}
        >
          <p className={ed.eyebrow}>{t("reels_subtitle")}</p>
          <h2 id="reels-title" className={ed.title}>
            {t("reels_title")}
          </h2>
        </motion.div>

        <ul ref={railRef} className={styles.rail} onScroll={updateEdges}>
          {reels.map((reel, index) => (
            <ReelCard
              key={reel.id}
              reel={reel}
              date={dateFormat.format(new Date(reel.postedAt))}
              onOpen={(trigger) => open(index, trigger)}
            />
          ))}
        </ul>

        {!(edges.start && edges.end) && (
          <div className={styles.railControls}>
            <button
              type="button"
              className={styles.railButton}
              onClick={() => scrollRail(-1)}
              disabled={edges.start}
              aria-label={t("reels_scroll_back")}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              className={styles.railButton}
              onClick={() => scrollRail(1)}
              disabled={edges.end}
              aria-label={t("reels_scroll_forward")}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            className={styles.lightbox}
            role="dialog"
            aria-modal="true"
            aria-label={active.title || t("reels_title")}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(event) => {
              if (event.target === event.currentTarget) close();
            }}
          >
            <button ref={closeRef} type="button" className={styles.close} onClick={close}>
              <X size={18} />
              <span>{t("work_close")}</span>
            </button>

            <motion.div
              className={styles.frame}
              initial={{ scale: 0.97, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.97, y: 16 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              {/* Keyed, so stepping to the next film starts a fresh player. */}
              <video
                key={active.id}
                src={active.videoUrl}
                poster={active.posterUrl}
                controls
                autoPlay
                playsInline
                preload="auto"
                className={styles.frameVideo}
              />
            </motion.div>

            <div className={styles.bar}>
              <div className={styles.barMeta}>
                {active.title && <p className={styles.barTitle}>{active.title}</p>}
                <time className={styles.cardDate} dateTime={active.postedAt}>
                  {dateFormat.format(new Date(active.postedAt))}
                </time>
              </div>
              <a className={styles.barLink} href={active.permalink} target="_blank" rel="noopener noreferrer">
                {t("reels_open_instagram")}
              </a>
            </div>

            {reels.length > 1 && (
              <>
                <button
                  type="button"
                  className={`${styles.navButton} ${styles.navPrev}`}
                  onClick={() => step(-1)}
                  aria-label={t("reels_prev")}
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  type="button"
                  className={`${styles.navButton} ${styles.navNext}`}
                  onClick={() => step(1)}
                  aria-label={t("reels_next")}
                >
                  <ChevronRight size={22} />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
