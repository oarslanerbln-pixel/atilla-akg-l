"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import styles from "./Hero.module.css";
import { useLanguage } from "@/context/LanguageContext";
import { useSoundDesign } from "@/hooks/useSoundDesign";
import { usePrefersCalm } from "@/hooks/usePrefersCalm";

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

const PLAYBACK_RATES = [0.75, 0.85] as const;

export default function Hero() {
  const { t } = useLanguage();
  const { playClickSound } = useSoundDesign();
  const [activeVideo, setActiveVideo] = useState<0 | 1>(0);
  const videoRef1 = useRef<HTMLVideoElement>(null);
  const videoRef2 = useRef<HTMLVideoElement>(null);

  /**
   * Both clips used to autoplay at once — 27 MB pulled down before the
   * headline settled, two decoders running, one of them behind an opacity of
   * zero. The audience arrives on a phone over mobile data, so: only the
   * visible clip plays, the second one is not fetched until it is switched to,
   * and a visitor who asked for less motion or is saving data gets the first
   * frame as a still backdrop instead.
   */
  const cinematic = !usePrefersCalm();

  // Seamless auto-switch between the two cinematic videos every 7.5 seconds
  useEffect(() => {
    if (!cinematic) return;
    const timer = setInterval(() => {
      setActiveVideo((prev) => (prev === 0 ? 1 : 0));
    }, 7500);
    return () => clearInterval(timer);
  }, [cinematic]);

  // Play the clip on screen, hold the other one still.
  useEffect(() => {
    const videos = [videoRef1.current, videoRef2.current];
    videos.forEach((video, index) => {
      if (!video) return;
      video.playbackRate = PLAYBACK_RATES[index];
      if (cinematic && index === activeVideo) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, [activeVideo, cinematic]);

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
          src="/maldives-cinematic.mp4#t=0.1"
          preload="metadata"
          muted
          loop
          playsInline
          aria-hidden="true"
          className={`${styles.backgroundVideo} ${activeVideo === 0 ? styles.videoActive : styles.videoHidden}`}
        />
        {/* preload="none": the second clip costs nothing until it is switched
            to, whether by the rotation timer or by the visitor. */}
        <video
          ref={videoRef2}
          src="/caravanserai-documentary.mp4#t=0.1"
          preload="none"
          muted
          loop
          playsInline
          aria-hidden="true"
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
