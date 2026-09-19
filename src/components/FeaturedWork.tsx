"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, Variants, useInView, AnimatePresence } from "framer-motion";
import { Play, X } from "lucide-react";
import styles from "./FeaturedWork.module.css";
import { useLanguage } from "@/context/LanguageContext";
import { useSoundDesign } from "@/hooks/useSoundDesign";

interface ProjectItem {
  id: string;
  categoryKey: string;
  titleKey: string;
  descKey: string;
  metricKey: string;
  typeKey: string;
  poster: string;
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
    poster: "https://images.pexels.com/photos/15792224/pexels-photo-15792224.jpeg?auto=compress&cs=tinysrgb&w=800&q=80",
    videoSrc: "/hero-reel.mp4",
  },
  {
    id: "2",
    categoryKey: "project_2_cat",
    titleKey: "project_2_title",
    descKey: "project_2_desc",
    metricKey: "project_2_metric",
    typeKey: "project_2_type",
    poster: "https://images.pexels.com/photos/3889742/pexels-photo-3889742.jpeg?auto=compress&cs=tinysrgb&w=800&q=80",
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
    poster: "https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg?auto=compress&cs=tinysrgb&w=800&q=80",
    videoSrc: "/caravanserai-documentary.mp4",
  },
];

function InViewVideo({
  src,
  poster,
  className,
  playbackRate = 1.0,
  trimEnd,
}: {
  src?: string;
  poster?: string;
  className?: string;
  playbackRate?: number;
  trimEnd?: number;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isInView = useInView(videoRef, { margin: "-100px" });

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
      if (isInView) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
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
      src={src}
      poster={poster}
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

  const openModal = (project: ProjectItem) => {
    playClickSound();
    setActiveProject(project);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    playClickSound();
    setActiveProject(null);
    document.body.style.overflow = "auto";
  };

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
            <motion.div
              key={project.id}
              variants={itemVariants}
              className={styles.workCard}
              data-cursor="PLAY"
              onClick={() => openModal(project)}
            >
              <div className={styles.mediaWrapper}>
                <span className={styles.categoryTag}>{t(project.categoryKey as any)}</span>
                <InViewVideo
                  src={project.videoSrc}
                  poster={project.poster}
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
              </div>

              <div className={styles.cardContent}>
                <h3 className={styles.projectTitle}>{t(project.titleKey as any)}</h3>
                <p className={styles.projectDesc}>{t(project.descKey as any)}</p>
                <div className={styles.metricBadge}>
                  <span>{t(project.metricKey as any)}</span>
                  <span>{t(project.typeKey as any)}</span>
                </div>
              </div>
            </motion.div>
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
                <h4 className={styles.modalTitle}>{t(activeProject.titleKey as any)}</h4>
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
