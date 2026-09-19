"use client";

import Link from "next/link";
import React from "react";
import { motion } from "framer-motion";
import { socialProfiles } from "@/lib/site";
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
                href={socialProfiles.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="magnetic"
                onClick={() => playClickSound()}
                data-cursor="INSTAGRAM"
              >
                INSTAGRAM
              </a>
              <a
                href={socialProfiles.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="magnetic"
                onClick={() => playClickSound()}
                data-cursor="TIKTOK"
              >
                TIKTOK
              </a>
              <a
                href={socialProfiles.youtube}
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

            {/* Imprint and privacy notice are mandatory for a commercial site
                operated from Germany, and must be reachable from every page.
                The translation keys existed but nothing rendered them. */}
            <div className={styles.legalLinks}>
              <Link href="/impressum">{t('footer_imprint')}</Link>
              <span aria-hidden="true">·</span>
              <Link href="/datenschutz">{t('footer_privacy')}</Link>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
