"use client";

import React, { useEffect, useState, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./Preloader.module.css";

import { useLanguage } from "@/context/LanguageContext";
import { useScrollLock } from "@/hooks/useScrollLock";

const SEEN_KEY = "atilla_preloader_seen";

/**
 * Whether this browser session has already played the intro.
 *
 * sessionStorage is an external store, so it is read through
 * useSyncExternalStore rather than in an effect. The old version started with
 * `isLoading = false` and switched it on after mount, which meant a returning
 * visitor briefly saw the page and then had it covered again — and the
 * first-time visitor saw the landing page flash before the intro dropped over
 * it. Reading the flag during render removes both flashes.
 */
function subscribeSeen(): () => void {
  // Nothing else writes the key during the page's life.
  return () => {};
}

function hasSeenIntro(): boolean {
  try {
    return sessionStorage.getItem(SEEN_KEY) !== null;
  } catch {
    // Private mode or blocked storage: treat the intro as unseen.
    return false;
  }
}

function hasSeenIntroOnServer(): boolean {
  return false;
}

export default function Preloader() {
  const alreadySeen = useSyncExternalStore(subscribeSeen, hasSeenIntro, hasSeenIntroOnServer);
  const [dismissed, setDismissed] = useState(false);
  const { t } = useLanguage();

  const isLoading = !alreadySeen && !dismissed;
  useScrollLock(isLoading);

  useEffect(() => {
    if (!isLoading) return;

    const markSeen = () => {
      try {
        sessionStorage.setItem(SEEN_KEY, "true");
      } catch {
        // Storage unavailable — the intro simply plays again next navigation.
      }
    };

    const timer = setTimeout(() => {
      markSeen();
      setDismissed(true);
    }, 1400);

    // An overlay that only a mouse can dismiss is a trap for anyone on a
    // keyboard, so Escape closes it too.
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        markSeen();
        setDismissed(true);
      }
    };
    window.addEventListener("keydown", handleKey);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKey);
    };
  }, [isLoading]);

  const handleDismiss = () => {
    try {
      sessionStorage.setItem(SEEN_KEY, "true");
    } catch {
      // See above.
    }
    setDismissed(true);
  };

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className={styles.preloader}
          onClick={handleDismiss}
          role="presentation"
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
          {/* Without JavaScript nothing ever removes this overlay, so the
              page would stay behind it forever. CSS Modules hand us the
              hashed class name at runtime, which is what lets a noscript
              stylesheet target it. */}
          <noscript>
            <style>{`.${styles.preloader}{display:none!important}`}</style>
          </noscript>

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
            <button type="button" className={styles.skipText} onClick={handleDismiss}>
              {t('preloader_skip')}
            </button>
            <div className={styles.progressBar}>
              <div className={styles.progressFill}></div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
