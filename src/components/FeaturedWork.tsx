"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ArrowUpRight, Play, X } from "lucide-react";
import ed from "./editorial.module.css";
import styles from "./FeaturedWork.module.css";
import { useLanguage } from "@/context/LanguageContext";
import { splitMetric } from "@/i18n/format";
import type { TranslationKeys } from "@/i18n/translations";
import { useSoundDesign } from "@/hooks/useSoundDesign";
import { useScrollLock } from "@/hooks/useScrollLock";
import { usePrefersCalm } from "@/hooks/usePrefersCalm";
import InViewVideo from "./InViewVideo";
import type { Reel } from "@/lib/reels/manifest";

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
  /** A mirrored Instagram film: shown as its still, never autoplayed (Blob transfer is metered). */
  still?: boolean;
  /** Not mirrored yet: the frame links to the reel on Instagram. */
  instagram?: string;
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
 * The Novotel project plays the reel itself once the reels cron has mirrored
 * it (CASE_REEL in lib/reels/manifest.ts); until then it links to Instagram.
 */
export default function FeaturedWork({
  novotel,
  permalink,
}: {
  novotel: Pick<Reel, "videoUrl" | "posterUrl"> | null;
  permalink: string;
}) {
  const { t } = useLanguage();
  const projects = rawProjects.map((project): ProjectItem => {
    if (project.id !== "1") return project;
    return novotel
      ? { ...project, poster: novotel.posterUrl, videoSrc: novotel.videoUrl, still: true }
      : { ...project, instagram: permalink };
  });
  const { playClickSound } = useSoundDesign();
  const [activeProject, setActiveProject] = useState<ProjectItem | null>(null);

  const calm = usePrefersCalm();
  const at = (delay: number, duration: number) => (calm ? { duration: 0 } : { duration, ease: EASE, delay });
  const reveal = (delay = 0) => ({
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px 0px" },
    transition: at(delay, 0.9),
  });
  // Footage opens like a curtain rising, rather than sliding in. The spread
  // around it watches the viewport: the clipped frame itself has no height
  // to intersect with, and on a phone it never opened.
  const unveil = {
    variants: {
      hidden: { clipPath: "inset(0 0 100% 0)" },
      shown: { clipPath: "inset(0 0 0% 0)" },
    },
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
    <section id="work" className={`${ed.section} ${ed.chapter} ${ed.ink} ${styles.section}`} aria-labelledby="work-title">
      <div className="container">
        <motion.div className={ed.head} {...reveal()}>
          <p className={ed.eyebrow}>{t("work_subtitle")}</p>
          <h2 id="work-title" className={ed.title}>
            {t("work_title")}
          </h2>
        </motion.div>

        {/* Each project is a wide frame with its title set over the footage,
            like a title card, and its story and result beneath. Both run
            the full measure, so the two stand as a matched pair. */}
        <ol className={styles.spreads}>
          {projects.map((project, i) => {
            const metric = splitMetric(t(project.metricKey));
            return (
              <motion.li
                key={project.id}
                className={styles.spread}
                initial="hidden"
                whileInView="shown"
                viewport={{ once: true, margin: "-80px 0px" }}
              >
                <motion.div className={styles.visual} {...unveil}>
                  <div className={styles.frame} data-cursor={project.instagram ? undefined : "PLAY"}>
                    {project.still ? (
                      <Image src={project.poster} alt="" fill sizes="(max-width: 900px) 100vw, 1200px" className={styles.video} />
                    ) : (
                      !project.instagram && (
                        <InViewVideo src={project.videoSrc} poster={project.poster} className={styles.video} />
                      )
                    )}
                    {/* The whole frame is the control: a button over the
                        footage, named with the project, opening the film
                        with sound in the lightbox. */}
                    {project.instagram ? (
                      <a
                        href={project.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${styles.trigger} ${styles.external} ${ed.playHost}`}
                        aria-label={`${t("case_watch_instagram")}: ${t(project.titleKey)}`}
                      >
                        <span className={ed.play}>
                          <span className={ed.playIcon} aria-hidden="true">
                            <ArrowUpRight size={18} strokeWidth={1.25} />
                          </span>
                          <span className={`${ed.playLabel} ${styles.playLabel}`}>{t("case_watch_instagram")}</span>
                        </span>
                      </a>
                    ) : (
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
                          <span className={`${ed.playLabel} ${styles.playLabel}`}>{t("work_watch")}</span>
                        </span>
                      </button>
                    )}
                    <div className={styles.caption}>
                      <span className={ed.index}>{String(i + 1).padStart(2, "0")}</span>
                      <h3 className={styles.name}>{t(project.titleKey)}</h3>
                      <p className={styles.meta}>
                        {t(project.categoryKey)}
                        <span aria-hidden="true"> · </span>
                        {t(project.typeKey)}
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div className={styles.body} {...reveal(0.15)}>
                  <p className={styles.desc}>{t(project.descKey)}</p>
                  <p className={styles.metric}>
                    <span className={`${ed.figureValue} ${styles.metricValue}`}>{metric.value}</span>{" "}
                    {metric.label && <span className={ed.figureLabel}>{metric.label}</span>}
                  </p>
                </motion.div>
              </motion.li>
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
              <div className={styles.modalVideoWrapper} data-portrait={activeProject.still || undefined}>
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
