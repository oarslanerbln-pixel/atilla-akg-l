"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./Preloader.module.css";

export default function Preloader() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Lock scroll while preloading
    document.body.style.overflow = "hidden";

    // Wait for the intro animation to finish (e.g., 2.8 seconds)
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Restore scroll
      document.body.style.overflow = "auto";
    }, 2800);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className={styles.preloader}
          // The cinematic exit: sliding up like a curtain
          initial={{ y: 0 }}
          exit={{ 
            y: "-100vh", 
            transition: { 
              duration: 1.2, 
              ease: [0.76, 0, 0.24, 1] // Premium Awwwards cinematic easing
            } 
          }}
        >
          {/* Main Shimmering Brand Text */}
          <h1 className={styles.brandName}>BARBAROSSA</h1>
          <div className={styles.subtitle}>Cinematic Vision</div>
          
          {/* Progress Indicator */}
          <div className={styles.progressContainer}>
            <div className={styles.progressText}>LOADING</div>
            <div className={styles.progressBar}>
              <div className={styles.progressFill}></div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
