"use client";

import React, { useRef, useState } from "react";
import { motion, Variants } from "framer-motion";
import { Play, Pause, Volume2, VolumeX, Heart, MessageCircle, Send, Bookmark } from "lucide-react";
import AnimatedCounter from "./AnimatedCounter";
import styles from "./CaseStudy.module.css";
import { useLanguage } from "@/context/LanguageContext";
import { useSoundDesign } from "@/hooks/useSoundDesign";

export default function CaseStudy() {
  const { t } = useLanguage();
  const { playClickSound } = useSoundDesign();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const handlePlayPause = () => {
    playClickSound();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    playClickSound();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <section id="case-study" className={styles.section}>
      <div className={`container ${styles.container}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className={styles.header}
        >
          <h3 className={styles.subtitle}>{t('case_title')}</h3>
          <h2 className={styles.title}>{t('case_subtitle')}</h2>
          <div className={styles.divider}></div>
        </motion.div>

        <div className={styles.contentGrid}>
          {/* Left Column: Image/Video Interactive Preview */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={styles.imageCol}
          >
            <div
              className={styles.videoPlaceholder}
              onClick={handlePlayPause}
              data-cursor={isPlaying ? "PAUSE" : "PLAY"}
            >
              <video
                ref={videoRef}
                src="/hero-reel.mp4"
                className={styles.image}
                loop
                playsInline
                muted={isMuted}
                poster="https://images.pexels.com/photos/15792224/pexels-photo-15792224.jpeg?auto=compress&cs=tinysrgb&w=800&q=80"
                style={{ objectFit: "cover", width: "100%", height: "100%" }}
              />
              {!isPlaying && (
                <div className={styles.playButton}>
                  <Play fill="white" className={styles.playIcon} />
                </div>
              )}
              {isPlaying && (
                <div
                  className={styles.soundControl}
                  onClick={handleToggleMute}
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </div>
              )}
            </div>
          </motion.div>

          {/* Right Column: Details & Stats */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className={styles.detailsCol}
          >
            <motion.div variants={itemVariants} className={styles.metadata}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>{t('case_meta_brand')}</span>
                <span className={styles.metaValue}>{t('case_meta_brand_val')}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>{t('case_meta_type')}</span>
                <span className={styles.metaValue}>{t('case_meta_type_val')}</span>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className={styles.captionBox}>
              <span className={styles.captionLabel}>{t('case_caption_label')}</span>
              <p className={styles.captionText}>{t('case_caption_text')}</p>
            </motion.div>

            <motion.div variants={itemVariants} className={styles.statsWrapper}>
              <h4 className={styles.statsHeader}>
                {t('case_stats_header')}
              </h4>
              <div className={styles.statsGrid}>
                <div className={styles.statItem}>
                  <Play className={styles.statIcon} />
                  <span className={styles.statNum}>
                    <AnimatedCounter to={559316} formatNumber={true} />
                  </span>
                </div>
                <div className={styles.statItem}>
                  <Heart className={styles.statIcon} />
                  <span className={styles.statNum}>
                    <AnimatedCounter to={9655} formatNumber={true} />
                  </span>
                </div>
                <div className={styles.statItem}>
                  <MessageCircle className={styles.statIcon} />
                  <span className={styles.statNum}>
                    <AnimatedCounter to={174} />
                  </span>
                </div>
                <div className={styles.statItem}>
                  <Send className={styles.statIcon} />
                  <span className={styles.statNum}>
                    <AnimatedCounter to={55} />
                  </span>
                </div>
                <div className={styles.statItem}>
                  <Bookmark className={styles.statIcon} />
                  <span className={styles.statNum}>
                    <AnimatedCounter to={12228} formatNumber={true} />
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className={styles.descriptionBox}>
              <p>{t('case_desc1')}</p>
              <p>{t('case_desc2')}</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
