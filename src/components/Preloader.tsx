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
          onClick={() => setIsLoading(false)}
          initial={{ y: 0 }}
          exit={{ 
            opacity: 0,
            y: "-100vh", 
            transition: { 
              duration: 1.5, 
              ease: [0.76, 0, 0.24, 1] 
            } 
          }}
        >
          {/* Cinematic Wrapper */}
          <div className={styles.cinematicWrapper}>
            <motion.div 
              initial={{ opacity: 0, letterSpacing: "0.1em" }}
              animate={{ opacity: 1, letterSpacing: "0.4em" }}
              transition={{ duration: 2, ease: "easeOut" }}
              className={styles.director}
            >
              A VISION BY
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 2.5, ease: "easeOut", delay: 0.5 }}
              className={styles.brandName}
            >
              ATILLA BARBAROSSA
            </motion.h1>
          </div>
          
          {/* Progress / Skip Indicator */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ duration: 1, delay: 1.5 }}
            className={styles.skipContainer}
          >
            <div className={styles.skipText}>CLICK ANYWHERE TO SKIP</div>
            <div className={styles.progressBar}>
              <div className={styles.progressFill}></div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
