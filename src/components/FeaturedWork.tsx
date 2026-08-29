"use client";

import React, { useRef, useEffect } from "react";
import { motion, Variants, useInView } from "framer-motion";
import styles from "./FeaturedWork.module.css";

interface ProjectItem {
  id: string;
  category: string;
  title: string;
  desc: string;
  metric: string;
  type: string;
  poster: string;
  videoSrc?: string;
  playbackRate?: number;
  trimEnd?: number; // seconds to skip at the end of the video
}

const projects: ProjectItem[] = [
  {
    id: "1",
    category: "Hospitality & Resorts",
    title: "Novotel Bosphorus Istanbul",
    desc: "Exklusives Storytelling für das renommierte Designhotel im lebendigen Karaköy-Viertel.",
    metric: "559.316 Accounts Erreicht",
    type: "Reels Campaign",
    poster: "https://images.pexels.com/photos/15792224/pexels-photo-15792224.jpeg?auto=compress&cs=tinysrgb&w=800&q=80",
    videoSrc: "/hero-reel.mp4",
  },
  {
    id: "2",
    category: "Luxury Travel & Culture",
    title: "The Maldives",
    desc: "Atmosphärische Reisedokumentationen, die unberührte Ästhetik und historische Eleganz vereinen.",
    metric: "1.2 MIO Video Views",
    type: "Cinematic Film",
    poster: "https://images.pexels.com/photos/3889742/pexels-photo-3889742.jpeg?auto=compress&cs=tinysrgb&w=800&q=80",
    videoSrc: "/maldives-cinematic.mp4",
    playbackRate: 0.5, // Slow down the fast video
    trimEnd: 6, // Skip the last 6 seconds
  },
  {
    id: "3",
    category: "Heritage & History",
    title: "Croatia Ottoman Caravanserai",
    desc: "Maßgeschneiderte visuelle Kampagnen für historische Architektur und kulturelles Erbe.",
    metric: "94.2% Engagement Rate",
    type: "Documentary",
    poster: "https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg?auto=compress&cs=tinysrgb&w=800&q=80",
    videoSrc: "/caravanserai-documentary.mp4",
  },
];

// Reusable Video Component that plays ONLY when visible (Best practice for performance & mobile)
function InViewVideo({ src, poster, className, playbackRate = 1.0, trimEnd }: { src?: string; poster?: string; className?: string, playbackRate?: number, trimEnd?: number }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isInView = useInView(videoRef, { margin: "-100px" });

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
      
      if (isInView) {
        videoRef.current.play().catch(() => {
          // Ignore autoplay policy errors
        });
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
      loop={!trimEnd} // Only use native loop if we are not custom trimming
      muted
      playsInline
      className={className}
      onTimeUpdate={handleTimeUpdate}
    />
  );
}

export default function FeaturedWork() {
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
          <h3 className={styles.subtitle}>Selected Portfolio</h3>
          <h2 className={styles.title}>Featured Projects</h2>
          <div className={styles.divider}></div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className={styles.grid}
        >
          {projects.map((project) => (
            <motion.div
              key={project.id}
              variants={itemVariants}
              className={styles.workCard}
              data-cursor="EXPLORE"
            >
              <div className={styles.mediaWrapper}>
                <span className={styles.categoryTag}>{project.category}</span>
                <InViewVideo
                  src={project.videoSrc}
                  poster={project.poster}
                  playbackRate={project.playbackRate}
                  trimEnd={project.trimEnd}
                  className={styles.mediaVideo}
                />
              </div>

              <div className={styles.cardContent}>
                <h3 className={styles.projectTitle}>{project.title}</h3>
                <p className={styles.projectDesc}>{project.desc}</p>
                <div className={styles.metricBadge}>
                  <span>{project.metric}</span>
                  <span>{project.type}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
