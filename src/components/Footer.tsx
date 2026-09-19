"use client";

import React from "react";
import { motion } from "framer-motion";
import styles from "./Footer.module.css";
import RevealText from "./RevealText";
import { useLanguage } from "@/context/LanguageContext";
import { useSoundDesign } from "@/hooks/useSoundDesign";

export default function Footer() {
  const { t } = useLanguage();
  const { playClickSound } = useSoundDesign();

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
            <span className={styles.subtitle}>{t('footer_subtitle')}</span>
          </div>
          
          <h1 className={styles.massiveTitle}>
            <a href="#contact" onClick={() => playClickSound()} data-cursor="TALK">
              <RevealText text={t('footer_massive')} delay={0.2} />
            </a>
          </h1>

          <div className={styles.bottomBar}>
            <div className={styles.socials}>
              <a
                href="https://instagram.com/atillabarbarossa"
                target="_blank"
                rel="noopener noreferrer"
                className="magnetic"
                onClick={() => playClickSound()}
                data-cursor="INSTAGRAM"
              >
                INSTAGRAM
              </a>
              <a
                href="https://tiktok.com/@atillabarbarossa"
                target="_blank"
                rel="noopener noreferrer"
                className="magnetic"
                onClick={() => playClickSound()}
                data-cursor="TIKTOK"
              >
                TIKTOK
              </a>
              <a
                href="https://youtube.com/@atillabarbarossa"
                target="_blank"
                rel="noopener noreferrer"
                className="magnetic"
                onClick={() => playClickSound()}
                data-cursor="YOUTUBE"
              >
                YOUTUBE
              </a>
            </div>
            
            <div className={styles.copyright}>
              {t('footer_copyright')}
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
