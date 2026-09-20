"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, Variants, useInView, AnimatePresence } from "framer-motion";
import { Play, X } from "lucide-react";
import styles from "./FeaturedWork.module.css";
import { useLanguage } from "@/context/LanguageContext";
import type { TranslationKeys } from "@/i18n/translations";
import { useSoundDesign } from "@/hooks/useSoundDesign";
import { useScrollLock } from "@/hooks/useScrollLock";
import { usePosterFrame } from "@/hooks/usePosterFrame";

interface ProjectItem {
  id: string;
  categoryKey: TranslationKeys;
  titleKey: TranslationKeys;
  descKey: TranslationKeys;
  metricKey: TranslationKeys;
  typeKey: TranslationKeys;
  videoSrc: string;
  playbackRate?: number;
  trimEnd?: number;
}

const rawProjects: ProjectItem[] = [
  {
    id: "1",
    categoryKey: "project_1_cat",
    titleKey: "project_1_title",
    descKey: "project_1_desc",
    metricKey: "project_1_metric",
    typeKey: "project_1_type",
    videoSrc: "/hero-reel.mp4",
  },
  {
    id: "2",
    categoryKey: "project_2_cat",
    titleKey: "project_2_title",
    descKey: "project_2_desc",
    metricKey: "project_2_metric",
    typeKey: "project_2_type",
    videoSrc: "/maldives-cinematic.mp4",
    playbackRate: 0.7,
    trimEnd: 4,
  },
  {
    id: "3",
    categoryKey: "project_3_cat",
    titleKey: "project_3_title",
    descKey: "project_3_desc",
    metricKey: "project_3_metric",
    typeKey: "project_3_type",
    videoSrc: "/caravanserai-documentary.mp4",
  },
];

/**
 * Card preview for one project.
 *
 * The poster used to be a stock photo fetched from images.pexels.com on every
 * page view — a third-party request that hands the visitor's IP to a US host
 * before they have consented to anything, and a stock image standing in for
 * work that is supposedly the portfolio. The still frame now comes from the
 * clip itself: the `#t=0.1` fragment makes the browser seek to and paint that
 * frame, and `preload="metadata"` keeps it to the header plus that one frame
 * until the card actually scrolls into view.
 */
function InViewVideo({
  src,
  className,
  playbackRate = 1.0,
  trimEnd,
}: {
  src: string;
  className?: string;
  playbackRate?: number;
  trimEnd?: number;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isInView = useInView(videoRef, { margin: "-100px" });
  usePosterFrame(videoRef);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Someone who asked their system for less motion did not ask for three
    // clips looping behind the copy.
    const wantsLessMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (wantsLessMotion) {
      video.pause();
      return;
    }

    video.playbackRate = playbackRate;
    if (isInView) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isInView, playbackRate]);

  const handleTimeUpdate = () => {
    if (trimEnd && videoRef.current && videoRef.current.duration) {
      if (videoRef.current.currentTime >= videoRef.current.duration - trimEnd) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      }
    }
  };

  return (
    <video
      ref={videoRef}
      src={`${src}#t=0.1`}
      preload="metadata"
      loop={!trimEnd}
      muted
      playsInline
      className={className}
      onTimeUpdate={handleTimeUpdate}
    />
  );
}

export default function FeaturedWork() {
  const { t } = useLanguage();
  const { playClickSound } = useSoundDesign();
  const [activeProject, setActiveProject] = useState<ProjectItem | null>(null);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
  };

  // Remembered so focus goes back to the card the visitor opened, rather than
  // to the top of the document once the lightbox closes.
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);

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
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeProject, closeModal]);

  return (
    <section id="work" className={styles.section}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className={styles.header}
        >
          <h3 className={styles.subtitle}>{t('work_subtitle')}</h3>
          <h2 className={styles.title}>{t('work_title')}</h2>
          <div className={styles.divider}></div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className={styles.grid}
        >
          {rawProjects.map((project) => (
            <motion.article
              key={project.id}
              variants={itemVariants}
              className={styles.workCard}
              data-cursor="PLAY"
            >
              <div className={styles.mediaWrapper}>
                <span className={styles.categoryTag}>{t(project.categoryKey)}</span>
                <InViewVideo
                  src={project.videoSrc}
                  playbackRate={project.playbackRate}
                  trimEnd={project.trimEnd}
                  className={styles.mediaVideo}
                />
                <div className={styles.playOverlay}>
                  <div className={styles.playBtnCircle}>
                    <Play size={22} fill="currentColor" />
                  </div>
                  <span className={styles.playText}>{t('work_watch')}</span>
                </div>

                {/* The card used to be a <div onClick>: reachable by mouse
                    only. A button cannot legally wrap the heading and copy
                    below, so it covers the media instead and carries the
                    project title as its accessible name. */}
                <button
                  type="button"
                  className={styles.cardTrigger}
                  onClick={(event) => openModal(project, event.currentTarget)}
                >
                  <span className={styles.srOnly}>
                    {t('work_watch')}: {t(project.titleKey)}
                  </span>
                </button>
              </div>

              <div className={styles.cardContent}>
                <h3 className={styles.projectTitle}>{t(project.titleKey)}</h3>
                <p className={styles.projectDesc}>{t(project.descKey)}</p>
                <div className={styles.metricBadge}>
                  <span>{t(project.metricKey)}</span>
                  <span>{t(project.typeKey)}</span>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>

      {/* Interactive Lightbox Video Modal */}
      <AnimatePresence>
        {activeProject && (
          <motion.div
            className={styles.modalBackdrop}
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
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h4 className={styles.modalTitle}>{t(activeProject.titleKey)}</h4>
                <button
                  type="button"
                  className={styles.modalClose}
                  onClick={closeModal}
                  aria-label="Close video player"
                >
                  <X size={18} />
                  <span>{t('work_close')}</span>
                </button>
              </div>
              <div className={styles.modalVideoWrapper}>
                <video
                  src={activeProject.videoSrc}
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
