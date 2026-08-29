"use client";

import React, { useRef, useState } from "react";
import { motion, Variants } from "framer-motion";
import { Play, Heart, MessageCircle, Send, Bookmark } from "lucide-react";
import AnimatedCounter from "./AnimatedCounter";
import styles from "./CaseStudy.module.css";

export default function CaseStudy() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
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
          <h3 className={styles.subtitle}>Case Study</h3>
          <h2 className={styles.title}>Novotel Bosphorus</h2>
          <div className={styles.divider}></div>
        </motion.div>

        <div className={styles.contentGrid}>
          {/* Left Column: Image/Video Placeholder */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={styles.imageCol}
          >
            <div className={styles.videoPlaceholder} onClick={handlePlayPause}>
              <video
                ref={videoRef}
                src="/hero-reel.mp4"
                className={styles.image}
                loop
                playsInline
                poster="https://images.pexels.com/photos/15792224/pexels-photo-15792224.jpeg?auto=compress&cs=tinysrgb&w=800&q=80"
                style={{ objectFit: "cover", width: "100%", height: "100%" }}
              />
              {!isPlaying && (
                <div className={styles.playButton}>
                  <Play fill="white" className={styles.playIcon} />
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
                <span className={styles.metaLabel}>Brand</span>
                <span className={styles.metaValue}>Novotel Bosphorus Istanbul</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Post Type</span>
                <span className={styles.metaValue}>Reels Video + Hotel Mention</span>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className={styles.captionBox}>
              <span className={styles.captionLabel}>Caption</span>
              <p className={styles.captionText}>
                Mein Hoteltipp: Das Novotel Istanbul Bosphorus Hotel @novotel_bosphorus befindet
                sich im Zentrum des angesagten Viertels Karaköy. Die Umgebung ist geprägt von
                künstlerischen und kulturellen Aktivitäten. Das Goldene Horn, das historische
                Zentrum mit Kapali Carsi und Hagia Sophia und das Viertel Galata sind sehr nah...
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className={styles.statsWrapper}>
              <h4 className={styles.statsHeader}>
                Accounts Erreicht: <AnimatedCounter to={559316} formatNumber={true} />
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
              <p>
                Dieses Reel für das Novotel Bosphorus zeigt exemplarisch die Stärke authentischen
                Storytellings. Mit knapp 560.000 erreichten Konten ging das Video nicht nur viral,
                sondern traf genau die richtige Zielgruppe. Besonders bemerkenswert: Neben der enormen
                Reichweite und den vielen Speicherungen generierte der Beitrag eine außergewöhnlich
                hohe Interaktionsrate in den direkten Nachrichten.
              </p>
              <p>
                Zahlreiche Follower fragten proaktiv nach Buchungsdetails, Zimmerpreisen und
                Empfehlungen, was die hohe Kaufkraft und das tiefe Vertrauen der Community in
                meine Hotelempfehlungen unterstreicht.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
