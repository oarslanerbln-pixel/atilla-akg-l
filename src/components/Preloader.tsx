"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./Preloader.module.css";

import { useLanguage } from "@/context/LanguageContext";

export default function Preloader() {
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    // Check if user already saw the preloader in this session
    const hasSeen = sessionStorage.getItem("atilla_preloader_seen");
    if (hasSeen) {
      return;
    }

    setIsLoading(true);
    document.body.style.overflow = "hidden";

    const timer = setTimeout(() => {
      setIsLoading(false);
      document.body.style.overflow = "auto";
      sessionStorage.setItem("atilla_preloader_seen", "true");
    }, 1400);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleDismiss = () => {
    setIsLoading(false);
    document.body.style.overflow = "auto";
    sessionStorage.setItem("atilla_preloader_seen", "true");
  };

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className={styles.preloader}
          onClick={handleDismiss}
          initial={{ y: 0 }}
          exit={{ 
            opacity: 0,
            y: "-100vh", 
            transition: { 
              duration: 0.8, 
              ease: [0.76, 0, 0.24, 1] 
            } 
          }}
        >
          {/* Cinematic Wrapper */}
          <div className={styles.cinematicWrapper}>
            <motion.div 
              initial={{ opacity: 0, letterSpacing: "0.1em" }}
              animate={{ opacity: 1, letterSpacing: "0.35em" }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={styles.director}
            >
              {t('preloader_vision')}
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
              className={styles.brandName}
            >
              ATILLA BARBAROSSA
            </motion.h1>
          </div>
          
          {/* Progress / Skip Indicator */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className={styles.skipContainer}
          >
            <div className={styles.skipText}>{t('preloader_skip')}</div>
            <div className={styles.progressBar}>
              <div className={styles.progressFill}></div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
