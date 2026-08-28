"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import styles from "./Hero.module.css";

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <path d="m10 15 5-3-5-3z" fill="#ffffff" stroke="none" />
  </svg>
);

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.23-1.13 4.39-2.88 5.76-1.68 1.3-3.9 1.72-5.95 1.18-2.14-.56-3.86-2.07-4.7-4.13-.88-2.15-.65-4.73.61-6.68 1.25-1.95 3.52-3.15 5.8-3.17V14c-1.4.03-2.73.7-3.53 1.83-.82 1.16-.94 2.74-.29 4.02.66 1.3 2.11 2.05 3.59 2.05 1.57.02 3.01-.98 3.53-2.47.16-.47.24-.97.23-1.47v-17.9z" />
  </svg>
);

export default function Hero() {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isFading, setIsFading] = React.useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const VIDEOS = [
    { src: "/03---.mp4", start: 0, end: 2.8 }, // Ottoman caravanserai
    { src: "/02---.mp4", start: 5.5, end: 9.5 }, // Maldives different segment
    { src: "/herovideo.mp4.mp4", start: 12.0, end: 16.0 } // 3rd video different segment
  ];

  // Interval for changing the video
  React.useEffect(() => {
    const interval = setInterval(() => {
      setIsFading(true); // Fade to black

      setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % VIDEOS.length);
        setIsFading(false); // Fade from black
      }, 600); // match transition duration
    }, 3500);
    return () => clearInterval(interval);
  }, [VIDEOS.length]);

  // Update video source whenever activeIndex changes
  React.useEffect(() => {
    if (videoRef.current) {
      const currentVideo = VIDEOS[activeIndex];
      videoRef.current.src = currentVideo.src;
      videoRef.current.currentTime = currentVideo.start;
      videoRef.current.play().catch(err => console.log("Video Autoplay blocked: ", err));
    }
  }, [activeIndex]);

  return (
    <section className={styles.hero} id="home">
      {/* Premium Video Background with bulletproof Dip-to-Black overlay */}
      <div className={styles.backgroundVideoWrapper}>
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className={styles.backgroundVideo}
          onTimeUpdate={(e) => {
            if (e.currentTarget.currentTime >= VIDEOS[activeIndex].end) {
              e.currentTarget.currentTime = VIDEOS[activeIndex].start;
            }
          }}
        />

        {/* Dip to black overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isFading ? 1 : 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#000', pointerEvents: 'none', zIndex: 0 }}
        />
      </div>

      <div className={styles.overlay}></div>

      {/* Content */}
      <div className={styles.content}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className={styles.textContent}
        >
          <h2 className={styles.greeting}>Willkommen</h2>
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
            <span>Visual Storytelling</span>
            <span className={styles.diamond}>✦</span>
            <span>Digital Excellence</span>
            <span className={styles.diamond}>✦</span>
            <span>Creative Direction</span>
          </motion.div>
          
          {/* Social Icons with Premium Hover Effect */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 1.2, ease: "easeOut" }}
            className={styles.socialIcons}
          >
            <a href="#" className={`${styles.socialIcon} ${styles.instagram}`}>
              <InstagramIcon />
            </a>
            <a href="#" className={`${styles.socialIcon} ${styles.tiktok}`}>
              <TikTokIcon />
            </a>
            <a href="#" className={`${styles.socialIcon} ${styles.youtube}`}>
              <YoutubeIcon />
            </a>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className={styles.scrollIndicator}
      >
        <span className={styles.scrollText}>Scrollen</span>
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
