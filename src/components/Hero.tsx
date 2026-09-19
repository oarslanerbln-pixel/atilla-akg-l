"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import styles from "./Hero.module.css";
import { useLanguage } from "@/context/LanguageContext";
import { useSoundDesign } from "@/hooks/useSoundDesign";

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="15" x="2" y="4.5" rx="4" />
    <polygon points="10 8.5 15 12 10 15.5 10 8.5" fill="currentColor" stroke="none" />
  </svg>
);

export default function Hero() {
  const { t } = useLanguage();
  const { playClickSound } = useSoundDesign();
  const [activeVideo, setActiveVideo] = useState<0 | 1>(0);
  const videoRef1 = useRef<HTMLVideoElement>(null);
  const videoRef2 = useRef<HTMLVideoElement>(null);

  // Seamless auto-switch between the two cinematic videos every 7.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveVideo((prev) => (prev === 0 ? 1 : 0));
    }, 7500);
    return () => clearInterval(timer);
  }, []);

  // Ensure both videos start playing smoothly in background
  useEffect(() => {
    if (videoRef1.current) {
      videoRef1.current.playbackRate = 0.75;
      videoRef1.current.play().catch(() => {});
    }
    if (videoRef2.current) {
      videoRef2.current.playbackRate = 0.85;
      videoRef2.current.play().catch(() => {});
    }
  }, []);

  const handleVideoSwitch = (index: 0 | 1) => {
    playClickSound();
    setActiveVideo(index);
  };

  return (
    <section className={styles.hero} id="home">
      {/* Dual Video Cinematic Background with crossfade */}
      <div className={styles.backgroundVideoWrapper}>
        <video
          ref={videoRef1}
          src="/maldives-cinematic.mp4"
          autoPlay
          muted
          loop
          playsInline
          className={`${styles.backgroundVideo} ${activeVideo === 0 ? styles.videoActive : styles.videoHidden}`}
        />
        <video
          ref={videoRef2}
          src="/caravanserai-documentary.mp4"
          autoPlay
          muted
          loop
          playsInline
          className={`${styles.backgroundVideo} ${activeVideo === 1 ? styles.videoActive : styles.videoHidden}`}
        />
        <div className={styles.overlay}></div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className={styles.textContent}
        >
          <h2 className={styles.greeting}>{t('hero_welcome')}</h2>
          <h1 className={styles.name}>
            <span className={styles.firstName}>Atilla</span>
            <br />
            <span className={styles.lastName}>BARBAROSSA</span>
          </h1>
          <div className={styles.divider}></div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
            className={styles.subtitle}
          >
            <span>{t('hero_storytelling')}</span>
            <span className={styles.diamond}>✦</span>
            <span>{t('hero_excellence')}</span>
            <span className={styles.diamond}>✦</span>
            <span>{t('hero_direction')}</span>
          </motion.div>
          
          {/* Premium Call to Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0, ease: "easeOut" }}
            className={styles.ctaGroup}
          >
            <a
              href="#work"
              className={styles.primaryBtn}
              onClick={() => playClickSound()}
              data-cursor="PORTFOLIO"
            >
              {t('hero_cta_projects')}
            </a>
            <a
              href="#contact"
              className={styles.secondaryBtn}
              onClick={() => playClickSound()}
              data-cursor="CONTACT"
            >
              {t('hero_cta_contact')}
            </a>
          </motion.div>
          
          {/* Social Icons with Animated Rotating Color Aura */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 1.3, ease: "easeOut" }}
            className={styles.socialIcons}
          >
            <a
              href="https://instagram.com/atillabarbarossa"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialCapsule}
              data-cursor="INSTAGRAM"
              onClick={() => playClickSound()}
              aria-label="Instagram Profile"
            >
              <span className={styles.rotatingAura}></span>
              <span className={styles.iconInner}>
                <InstagramIcon />
              </span>
            </a>
            <a
              href="https://www.tiktok.com/@atillabarbarossa"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialCapsule}
              data-cursor="TIKTOK"
              onClick={() => playClickSound()}
              aria-label="TikTok Profile"
            >
              <span className={styles.rotatingAura}></span>
              <span className={styles.iconInner}>
                <TikTokIcon />
              </span>
            </a>
            <a
              href="https://www.youtube.com/@atillabarbarossa"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialCapsule}
              data-cursor="YOUTUBE"
              onClick={() => playClickSound()}
              aria-label="YouTube Channel"
            >
              <span className={styles.rotatingAura}></span>
              <span className={styles.iconInner}>
                <YoutubeIcon />
              </span>
            </a>
          </motion.div>
        </motion.div>
      </div>

      {/* Video Switcher Indicators */}
      <div className={styles.videoSwitcher}>
        <button
          type="button"
          onClick={() => handleVideoSwitch(0)}
          className={`${styles.switcherDot} ${activeVideo === 0 ? styles.switcherDotActive : ""}`}
          aria-label="Video 1: Maldives Cinematic"
        >
          <span className={styles.dotNum}>01</span>
          <span className={styles.dotBar}></span>
        </button>
        <button
          type="button"
          onClick={() => handleVideoSwitch(1)}
          className={`${styles.switcherDot} ${activeVideo === 1 ? styles.switcherDotActive : ""}`}
          aria-label="Video 2: Caravanserai Documentary"
        >
          <span className={styles.dotNum}>02</span>
          <span className={styles.dotBar}></span>
        </button>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className={styles.scrollIndicator}
      >
        <span className={styles.scrollText}>{t('hero_scroll')}</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <ChevronDown className={styles.scrollIcon} />
        </motion.div>
      </motion.div>
    </section>
  );
}
