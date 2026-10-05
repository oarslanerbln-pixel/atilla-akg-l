"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Play, X } from "lucide-react";
import ed from "./editorial.module.css";
import styles from "./FeaturedWork.module.css";
import { useLanguage } from "@/context/LanguageContext";
import { splitMetric } from "@/i18n/format";
import type { TranslationKeys } from "@/i18n/translations";
import { useSoundDesign } from "@/hooks/useSoundDesign";
import { useScrollLock } from "@/hooks/useScrollLock";
import { usePrefersCalm } from "@/hooks/usePrefersCalm";

const EASE = [0.16, 1, 0.3, 1] as const;

interface ProjectItem {
  id: string;
  categoryKey: TranslationKeys;
  titleKey: TranslationKeys;
  descKey: TranslationKeys;
  metricKey: TranslationKeys;
  typeKey: TranslationKeys;
  poster: string;
  videoSrc: string;
}

const rawProjects: ProjectItem[] = [
  {
    id: "1",
    categoryKey: "project_1_cat",
    titleKey: "project_1_title",
    descKey: "project_1_desc",
    metricKey: "project_1_metric",
    typeKey: "project_1_type",
    poster: "/posters/hero-reel.webp",
    videoSrc: "/hero-reel.mp4",
  },
  {
    id: "3",
    categoryKey: "project_3_cat",
    titleKey: "project_3_title",
    descKey: "project_3_desc",
    metricKey: "project_3_metric",
    typeKey: "project_3_type",
    poster: "/posters/caravanserai-documentary.webp",
    videoSrc: "/caravanserai-documentary.mp4",
  },
];

/**
 * Card preview for one project.
 *
 * The poster was a stock photo fetched from images.pexels.com on every page
 * view — a third-party request handing the visitor's IP to a US host before
 * any consent, and stock imagery standing in for the work it illustrated.
 * Asking the browser to paint the clip's own first frame replaced it, but that
 * only ever worked by request. It is now a self-hosted still cut from the
 * clip, so the card needs nothing from the video until it scrolls into view:
 * `preload="none"` means a visitor who never reaches this section downloads
 * not one frame of it.
 */
function InViewVideo({
  src,
  poster,
  className,
}: {
  src: string;
  poster: string;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isInView = useInView(videoRef, { margin: "-100px" });
  const calm = usePrefersCalm();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Someone who asked for less motion did not ask for clips looping behind
    // the copy, and someone saving data did not ask for megabytes of them.
    if (calm) {
      video.pause();
      return;
    }

    if (isInView) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isInView, calm]);

  return (
    <video
      ref={videoRef}
      src={src}
      poster={poster}
      preload="none"
      loop
      muted
      playsInline
      className={className}
    />
  );
}

export default function FeaturedWork() {
  const { t } = useLanguage();
  const { playClickSound } = useSoundDesign();
  const [activeProject, setActiveProject] = useState<ProjectItem | null>(null);

  const calm = usePrefersCalm();
  const at = (delay: number, duration: number) => (calm ? { duration: 0 } : { duration, ease: EASE, delay });
  const reveal = (delay = 0) => ({
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: at(delay, 0.9),
  });
  // Footage opens like a curtain rising, rather than sliding in.
  const unveil = {
    initial: { clipPath: "inset(0 0 100% 0)" },
    whileInView: { clipPath: "inset(0 0 0% 0)" },
    viewport: { once: true, margin: "-80px" },
    transition: at(0, 1.4),
  };

  // Remembered so focus goes back to the card the visitor opened, rather than
  // to the top of the document once the lightbox closes.
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const openModal = (project: ProjectItem, trigger: HTMLButtonElement) => {
    playClickSound();
    lastTriggerRef.current = trigger;
    setActiveProject(project);
  };

  const closeModal = useCallback(() => {
    playClickSound();
    setActiveProject(null);
    lastTriggerRef.current?.focus();
  }, [playClickSound]);

  useScrollLock(activeProject !== null);

  // A lightbox that only closes by clicking its backdrop leaves keyboard users
  // stuck inside it.
  useEffect(() => {
    if (!activeProject) return;
    closeRef.current?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeProject, closeModal]);

  return (
    <section id="work" className={`${ed.section} ${ed.chapter} ${styles.section}`} aria-labelledby="work-title">
      <div className="container">
        <motion.div className={ed.head} {...reveal()}>
          <p className={ed.eyebrow}>{t("work_subtitle")}</p>
          <h2 id="work-title" className={ed.title}>
            {t("work_title")}
          </h2>
        </motion.div>

        {/* Each project is a spread, footage and text alternating sides, as
            in a printed kit. The clips are wide films; the old portrait cards
            cut away two thirds of every frame. */}
        <ol className={styles.spreads}>
          {rawProjects.map((project, i) => {
            const metric = splitMetric(t(project.metricKey));
            return (
              <li key={project.id} className={styles.spread}>
                <motion.div className={styles.visual} {...unveil}>
                  <div className={styles.frame} data-cursor="PLAY">
                    <InViewVideo src={project.videoSrc} poster={project.poster} className={styles.video} />
                    {/* The whole frame is the control: a button over the
                        footage, named with the project, opening the film
                        with sound in the lightbox. */}
                    <button
                      type="button"
                      className={`${styles.trigger} ${ed.playHost}`}
                      onClick={(event) => openModal(project, event.currentTarget)}
                      aria-label={`${t("work_watch")}: ${t(project.titleKey)}`}
                    >
                      <span className={ed.play}>
                        <span className={ed.playIcon} aria-hidden="true">
                          <Play size={18} strokeWidth={1.25} />
                        </span>
                        <span className={ed.playLabel}>{t("work_watch")}</span>
                      </span>
                    </button>
                  </div>
                </motion.div>

                <motion.div className={styles.body} {...reveal(0.15)}>
                  <span className={ed.index}>{String(i + 1).padStart(2, "0")}</span>
                  <h3 className={styles.name}>{t(project.titleKey)}</h3>
                  <p className={styles.meta}>
                    {t(project.categoryKey)}
                    <span aria-hidden="true"> · </span>
                    {t(project.typeKey)}
                  </p>
                  <p className={styles.desc}>{t(project.descKey)}</p>
                  <p className={styles.metric}>
                    <span className={`${ed.figureValue} ${styles.metricValue}`}>{metric.value}</span>{" "}
                    {metric.label && <span className={ed.figureLabel}>{metric.label}</span>}
                  </p>
                </motion.div>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Interactive Lightbox Video Modal */}
      <AnimatePresence>
        {activeProject && (
          <motion.div
            className={styles.modalBackdrop}
            role="dialog"
            aria-modal="true"
            aria-labelledby="work-modal-title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className={styles.modalContent}
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ duration: 0.35, ease: EASE }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h4 id="work-modal-title" className={styles.modalTitle}>{t(activeProject.titleKey)}</h4>
                <button
                  ref={closeRef}
                  type="button"
                  className={styles.modalClose}
                  onClick={closeModal}
                >
                  <X size={18} />
                  <span>{t('work_close')}</span>
                </button>
              </div>
              <div className={styles.modalVideoWrapper}>
                <video
                  src={activeProject.videoSrc}
                  poster={activeProject.poster}
                  controls
                  autoPlay
                  playsInline
                  className={styles.modalVideo}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
