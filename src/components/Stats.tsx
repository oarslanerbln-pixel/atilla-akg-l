"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import { Users, MapPin, Target, Eye } from "lucide-react";
import AnimatedCounter from "./AnimatedCounter";
import styles from "./Stats.module.css";

// Custom Social Icons
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
);

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

export default function Stats() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <section id="stats" className={styles.section}>
      <div className="container">
        <motion.div
          className={styles.grid}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
        {/* Left Column: About & Philosophy */}
        <div id="about" className={styles.aboutCol}>
          <motion.div variants={itemVariants}>
            <h3 className={styles.subtitle}>Content Philosophie</h3>
            <h2 className={styles.title}>
              Authentisches Storytelling & Visuelle Qualität
            </h2>
            <div className={styles.divider}></div>
          </motion.div>

          <motion.div variants={itemVariants} className={styles.paragraphs}>
            <p>
              Reisen bedeutet für mich mehr als nur das Abhaken von Orten. Es geht
              um Kultur, Geschichte und authentische Erlebnisse. Als studierter
              Filmemacher und Travel Content Creator liegt mein Fokus auf starkem,
              fesselndem Storytelling.
            </p>
            <p>
              Ich nehme meine kaufkräftige Community aus dem DACH-Raum mit auf
              visuell beeindruckende Abenteuer; von historischen Bauwerken bis hin
              zu einzigartigen Hotel-Erlebnissen.
            </p>
            <p>
              Mit modernster mobiler Produktionstechnik kreiere ich nahbaren,
              dynamischen Content, der inspiriert und bewegt.
            </p>
          </motion.div>

          {/* Social Links */}
          <motion.div variants={itemVariants} className={styles.socialGroup}>
            <a
              href="https://instagram.com/atillabarbarossa"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialCard}
              data-cursor="INSTAGRAM"
            >
              <InstagramIcon className={styles.icon} />
              <div className={styles.socialText}>
                <span className={styles.socialCount}>
                  <AnimatedCounter to={306} suffix=" K" />
                </span>
                <span className={styles.socialLabel}>Follower</span>
              </div>
            </a>

            <a
              href="https://www.tiktok.com/@atillabarbarossa"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialCard}
              data-cursor="TIKTOK"
            >
              <TikTokIcon className={styles.icon} />
              <div className={styles.socialText}>
                <span className={styles.socialCount}>
                  <AnimatedCounter to={287} suffix=" K" />
                </span>
                <span className={styles.socialLabel}>Follower</span>
              </div>
            </a>

            <a
              href="https://www.youtube.com/@atillabarbarossa"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialCard}
              data-cursor="YOUTUBE"
            >
              <YoutubeIcon className={styles.icon} />
              <div className={styles.socialText}>
                <span className={styles.socialCount}>
                  <AnimatedCounter to={20} suffix=" K" />
                </span>
                <span className={styles.socialLabel}>Follower</span>
              </div>
            </a>
          </motion.div>
        </div>

        {/* Right Column: Demographics & Reach */}
        <div className={styles.statsCol}>
          <motion.div variants={itemVariants}>
            <h3 className={styles.subtitle}>Zahlen & Demografie</h3>
          </motion.div>

          <motion.div variants={itemVariants} className={styles.demoGrid}>
            <div className={`${styles.statCard} ${styles.darkCard}`}>
              <Users className={styles.statIcon} />
              <span className={styles.statValue}>
                <AnimatedCounter to={83} suffix="%" />
              </span>
              <span className={styles.statLabel}>25-54 Alter</span>
            </div>
            <div className={`${styles.statCard} ${styles.darkCard}`}>
              <MapPin className={styles.statIcon} />
              <span className={styles.statValue}>
                <AnimatedCounter to={86} suffix="%" />
              </span>
              <span className={styles.statLabel}>DACH-Raum</span>
            </div>
            <div className={`${styles.statCard} ${styles.darkCard}`}>
              <Target className={styles.statIcon} />
              <span className={styles.statValue}>
                <AnimatedCounter to={55} suffix="%" />
              </span>
              <span className={styles.statLabel}>Weiblich</span>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h3 className={`${styles.subtitle} ${styles.mt4}`}>Reichweite</h3>
          </motion.div>

          <motion.div variants={itemVariants} className={styles.reachBubbles}>
            <div className={styles.bubbleMain}>
              <Eye className={styles.bubbleIcon} />
              <span className={styles.bubbleValue}>
                <AnimatedCounter to={1.4} decimals={1} suffix=" MIO" />
              </span>
              <span className={styles.bubbleLabel}>Erreichte Konten</span>
            </div>
            <div className={styles.bubbleSmallGrid}>
              <div className={styles.bubbleSmall}>
                <span className={styles.bSmallVal}>
                  <AnimatedCounter to={60} suffix="K+" />
                </span>
                <span className={styles.bSmallLab}>Reels</span>
              </div>
              <div className={styles.bubbleSmall}>
                <span className={styles.bSmallVal}>
                  <AnimatedCounter to={15} suffix="K+" />
                </span>
                <span className={styles.bSmallLab}>Story</span>
              </div>
              <div className={styles.bubbleSmall}>
                <span className={styles.bSmallVal}>
                  <AnimatedCounter to={20} suffix="K+" />
                </span>
                <span className={styles.bSmallLab}>Post</span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
      </div>
    </section>
  );
}
