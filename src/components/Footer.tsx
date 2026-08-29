"use client";

import React from "react";
import { motion } from "framer-motion";
import styles from "./Footer.module.css";
import RevealText from "./RevealText";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={styles.content}
        >
          <div className={styles.subtitleWrapper}>
            <span className={styles.subtitle}>Ready for the next level?</span>
          </div>
          
          <h1 className={styles.massiveTitle}>
            <RevealText text="LET'S TALK" delay={0.2} />
          </h1>

          <div className={styles.bottomBar}>
            <div className={styles.socials}>
              <a href="https://instagram.com/atillabarbarossa" target="_blank" rel="noopener noreferrer" className="magnetic">INSTAGRAM</a>
              <a href="https://tiktok.com/@atillabarbarossa" target="_blank" rel="noopener noreferrer" className="magnetic">TIKTOK</a>
              <a href="https://youtube.com/@atillabarbarossa" target="_blank" rel="noopener noreferrer" className="magnetic">YOUTUBE</a>
            </div>
            
            <div className={styles.copyright}>
              © {new Date().getFullYear()} ATILLA BARBAROSSA. ALL RIGHTS RESERVED.
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
